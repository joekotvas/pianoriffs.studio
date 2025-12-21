/**
 * ExtendSelectionVerticallyCommand
 *
 * Extends selection vertically using anchor-based cursor model:
 * - Anchor = fixed starting point
 * - Cursor = moves with each command execution
 * - Selection = all notes between anchor and cursor
 *
 * Supports both EXPANSION and CONTRACTION:
 * - Moving cursor away from anchor = expand
 * - Moving cursor toward anchor = contract
 *
 * Movement hierarchy:
 * 1. Within chords: Cursor moves to adjacent note (no cycling for anchor model)
 * 2. Across staves: Cursor moves to quant-aligned event in adjacent staff
 *
 * @see Issue #101
 */

import type { Selection, Score, SelectedNote, ScoreEvent, Note } from '../../types';
import type { SelectionCommand } from './types';
import { getNoteDuration } from '../../utils/core';
import { getMidi } from '../../services/MusicService';

export type ExtendDirection = 'up' | 'down' | 'all';

export interface ExtendSelectionVerticallyOptions {
  direction: ExtendDirection;
}

/**
 * Represents a vertical position in the score for cursor tracking.
 */
interface VerticalPosition {
  staffIndex: number;
  measureIndex: number;
  eventId: string | number;
  noteId: string | number | null;
  /** MIDI value for note comparison within chords */
  midi: number;
}

/**
 * Command to extend selection vertically with anchor-based cursor movement.
 *
 * @example
 * ```typescript
 * // Extend selection downward (move cursor down, select anchor→cursor)
 * engine.dispatch(new ExtendSelectionVerticallyCommand({ direction: 'down' }));
 * ```
 *
 * @tested ExtendSelectionVertically.test.ts
 */
export class ExtendSelectionVerticallyCommand implements SelectionCommand {
  readonly type = 'EXTEND_SELECTION_VERTICALLY';
  private direction: ExtendDirection;

  constructor(options: ExtendSelectionVerticallyOptions) {
    this.direction = options.direction;
  }

  execute(state: Selection, score: Score): Selection {
    // Early exit: no selection
    if (state.selectedNotes.length === 0) {
      return state;
    }

    // Initialize anchor if not set
    const anchor = state.anchor ?? state.selectedNotes[0];
    const anchorPos = this.toVerticalPosition(anchor, score);
    if (!anchorPos) return state;

    // Group notes by Vertical Slice (measureIndex + startTime)
    // This allows:
    // 1. Cross-staff contraction (notes in same slice on different staves act together)
    // 2. Independent extension (notes in different slices extend independently)
    const slices = this.groupNotesByVerticalSlice(state.selectedNotes, score);
    const newNotes: SelectedNote[] = [];

    for (const sliceNotes of slices.values()) {
      const positions = sliceNotes
        .map(n => this.toVerticalPosition(n, score))
        .filter((p): p is VerticalPosition => p !== null);

      if (positions.length === 0) continue;

      // Determine cursor for THIS slice relative to the GLOBAL anchor
      // (We use global anchor relation for direction, but slice extremes for cursor)
      const globalCursor = this.findGlobalCursor(positions, anchorPos);
      if (!globalCursor) {
        // Keep existing
        sliceNotes.forEach(n => newNotes.push(n));
        continue;
      }

      // Determine direction for expansion/contraction
      const isContraction = this.isMovingTowardAnchor(globalCursor, anchorPos);

      let resultState: Selection = {
        ...state,
        selectedNotes: sliceNotes,
        anchor // Pass global anchor
      };

      if (isContraction) {
        resultState = this.contractSelection(resultState, score, anchor, anchorPos, globalCursor);
      } else {
        resultState = this.expandSelection(resultState, score, anchor, anchorPos, globalCursor);
      }

      // Add resulting notes from this slice
      resultState.selectedNotes.forEach(n => newNotes.push(n));
    }

    // Deduplicate
    const uniqueNotes = this.deduplicateNotes(newNotes);

    if (uniqueNotes.length === state.selectedNotes.length &&
        uniqueNotes.every(n => state.selectedNotes.some(
          s => s.staffIndex === n.staffIndex && s.measureIndex === n.measureIndex &&
               s.eventId === n.eventId && s.noteId === n.noteId
        ))) {
      return state;
    }

    // Determine the "primary" selection focus (last moved note from last processed slice)
    const lastNote = uniqueNotes[uniqueNotes.length - 1];

    return {
      staffIndex: lastNote.staffIndex,
      measureIndex: lastNote.measureIndex,
      eventId: lastNote.eventId,
      noteId: lastNote.noteId,
      selectedNotes: uniqueNotes,
      anchor,
    };
  }

  /**
   * Group notes by vertical time slice (measure index + start time).
   * Key: "measureIdx-startTimeTick"
   */
  private groupNotesByVerticalSlice(notes: SelectedNote[], score: Score): Map<string, SelectedNote[]> {
    const groups = new Map<string, SelectedNote[]>();
    const eventTimeCache = new Map<string, number>();

    for (const note of notes) {
      const eventKey = `${note.staffIndex}-${note.measureIndex}-${note.eventId}`;
      
      let startTime = eventTimeCache.get(eventKey);
      if (startTime === undefined) {
        startTime = this.calculateEventStartTime(score, note.staffIndex, note.measureIndex, String(note.eventId));
        eventTimeCache.set(eventKey, startTime);
      }

      // Slice key: Measure + StartTime (ignore staff)
      // This groups treble/bass notes at same time together
      const sliceKey = `${note.measureIndex}-${startTime}`;
      
      if (!groups.has(sliceKey)) {
        groups.set(sliceKey, []);
      }
      groups.get(sliceKey)?.push(note);
    }

    return groups;
  }

  private calculateEventStartTime(score: Score, staffIdx: number, measureIdx: number, eventId: string): number {
    const staff = score.staves[staffIdx];
    const measure = staff?.measures[measureIdx];
    if (!measure) return 0;

    let time = 0;
    for (const event of measure.events) {
      if (event.id === eventId) return time;
      time += getNoteDuration(event.duration, event.dotted, event.tuplet);
    }
    return 0; // Fallback
  }

  /**
   * Determine if the movement direction is toward the anchor (contraction).
   */
  private isMovingTowardAnchor(cursor: VerticalPosition, anchor: VerticalPosition): boolean {
    if (this.direction === 'all') return false;

    // If cursor equals anchor (single-note selection), always expand
    if (cursor.staffIndex === anchor.staffIndex && cursor.midi === anchor.midi) {
      return false;
    }

    // If cursor is below anchor (lower staff or lower pitch), moving up = toward anchor
    // If cursor is above anchor (higher staff or higher pitch), moving down = toward anchor
    const cursorIsBelow = cursor.staffIndex > anchor.staffIndex ||
      (cursor.staffIndex === anchor.staffIndex && cursor.midi < anchor.midi);

    if (cursorIsBelow) {
      return this.direction === 'up'; // Moving up toward anchor = contraction
    } else {
      return this.direction === 'down'; // Moving down toward anchor = contraction
    }
  }

  /**
   * Find the global cursor (opposite extreme from anchor across all staves).
   */
  private findGlobalCursor(positions: VerticalPosition[], anchor: VerticalPosition): VerticalPosition | null {
    if (positions.length === 0) return null;

    // Sort from Bottom (Low) to Top (High)
    // Bottom = High Staff Index (e.g. Bass=1), Low MIDI
    // Top = Low Staff Index (e.g. Treble=0), High MIDI
    const sorted = [...positions].sort((a, b) => {
      // Sort by staff index descending (Bass before Treble)
      if (a.staffIndex !== b.staffIndex) return b.staffIndex - a.staffIndex;
      // Sort by MIDI ascending (Low pitch before High pitch)
      return a.midi - b.midi;
    });

    const lowest = sorted[0]; // Absolute bottom-most note
    const highest = sorted[sorted.length - 1]; // Absolute top-most note

    // Cursor is the opposite of anchor
    // If anchor is in the upper half of the range, cursor is lowest
    // Upper half = Lower Staff Index OR Higher MIDI
    const anchorIsHigh = anchor.staffIndex < lowest.staffIndex ||
      (anchor.staffIndex === lowest.staffIndex && anchor.midi > (lowest.midi + highest.midi) / 2);

    return anchorIsHigh ? lowest : highest;
  }

  /**
   * Contract the selection by removing notes from the cursor side.
   * Uses a unified "Vertical Metric" to determine valid range across staves.
   */
  private contractSelection(
    state: Selection,
    score: Score,
    anchor: SelectedNote,
    anchorPos: VerticalPosition,
    cursor: VerticalPosition
  ): Selection {
    // 1. Move cursor one step in the contraction direction (towards anchor)
    const newCursor = this.moveCursor(cursor, score);
    
    // If we can't move, we return state unchanged (or should we return single note if cursor==anchor?)
    if (!newCursor) {
      return state;
    }

    // 2. Define the valid range between Anchor and New Cursor
    // We use a "Vertical Metric" to linearize the 2D space (staff + midi)
    // Metric = (MAX_STAFF_INDEX - staffIndex) * 1000 + midi
    // This makes "higher on screen" = "higher metric value"
    
    // Helper to compute metric (inline for captured scope, or we'll add a method)
    const getMetric = (pos: { staffIndex: number, midi: number }) => {
      // Invert staff index so Staff 0 (Top) > Staff 1 (Bottom)
      const visualStaffValue = (100 - pos.staffIndex) * 1000;
      return visualStaffValue + pos.midi;
    };

    const anchorMetric = getMetric(anchorPos);
    const cursorMetric = getMetric(newCursor);

    const minMetric = Math.min(anchorMetric, cursorMetric);
    const maxMetric = Math.max(anchorMetric, cursorMetric);

    // 3. Filter notes to keep only those within the range
    const newNotes: SelectedNote[] = [];
    
    for (const note of state.selectedNotes) {
      const notePos = this.toVerticalPosition(note, score);
      if (!notePos) continue;

      const noteMetric = getMetric(notePos);

      // Inclusive check: Keep note if it falls within [min, max]
      if (noteMetric >= minMetric && noteMetric <= maxMetric) {
        newNotes.push(note);
      }
    }

    if (newNotes.length === 0 || newNotes.length === state.selectedNotes.length) {
      return state;
    }

    const lastNote = newNotes[newNotes.length - 1];
    return {
      staffIndex: lastNote.staffIndex,
      measureIndex: lastNote.measureIndex,
      eventId: lastNote.eventId,
      noteId: lastNote.noteId,
      selectedNotes: newNotes,
      anchor,
    };
  }

  /**
   * Expand the selection by adding notes on the cursor side.
   */
  private expandSelection(
    state: Selection,
    score: Score,
    anchor: SelectedNote,
    anchorPos: VerticalPosition,
    cursor: VerticalPosition
  ): Selection {
    const newNotes: SelectedNote[] = [...state.selectedNotes];

    // Try to move cursor
    const newCursor = this.moveCursor(cursor, score);
    if (!newCursor) return state; // At boundary

    if (newCursor.staffIndex === cursor.staffIndex && newCursor.eventId === cursor.eventId) {
      // Cursor moved within same event (chord extension)
      const event = this.findEventById(score, cursor.staffIndex, cursor.measureIndex, cursor.eventId);
      if (!event) return state;

      // Add the new note if not already selected
      if (!newNotes.some(n => n.noteId === newCursor.noteId && n.eventId === newCursor.eventId)) {
        newNotes.push({
          staffIndex: newCursor.staffIndex,
          measureIndex: newCursor.measureIndex,
          eventId: newCursor.eventId,
          noteId: newCursor.noteId,
        });
      }
    } else {
      // Cursor moved to another staff (cross-staff extension)
      // First, fill the current chord completely
      const currentEvent = this.findEventById(score, cursor.staffIndex, cursor.measureIndex, cursor.eventId);
      if (currentEvent) {
        this.addAllNotesInEvent(newNotes, cursor.staffIndex, cursor.measureIndex, currentEvent);
      }

      // Then add ALL notes from the target staff's quant-aligned event
      const targetEvent = this.findEventById(score, newCursor.staffIndex, newCursor.measureIndex, newCursor.eventId);
      if (targetEvent) {
        this.addAllNotesInEvent(newNotes, newCursor.staffIndex, newCursor.measureIndex, targetEvent);
      }
    }

    // Deduplicate
    const uniqueNotes = this.deduplicateNotes(newNotes);

    if (uniqueNotes.length === state.selectedNotes.length) {
      return state;
    }

    const lastNote = uniqueNotes[uniqueNotes.length - 1];
    return {
      staffIndex: lastNote.staffIndex,
      measureIndex: lastNote.measureIndex,
      eventId: lastNote.eventId,
      noteId: lastNote.noteId,
      selectedNotes: uniqueNotes,
      anchor,
    };
  }

  /**
   * Remove duplicate notes from array.
   */
  private deduplicateNotes(notes: SelectedNote[]): SelectedNote[] {
    const seen = new Set<string>();
    return notes.filter(n => {
      const key = `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Find cursor as the note at the OPPOSITE extreme from anchor in vertical space.
   * This enables contraction: cursor moves toward anchor when direction reverses.
   */
  private findCursorAsOppositeOfAnchor(
    positions: VerticalPosition[],
    anchorPos: VerticalPosition | null
  ): VerticalPosition | null {
    if (positions.length === 0) return null;
    if (positions.length === 1) return positions[0];

    if (!anchorPos) {
      // No anchor - use direction-based extreme
      return this.direction === 'down'
        ? positions.reduce((lowest, p) => p.midi < lowest.midi ? p : lowest)
        : positions.reduce((highest, p) => p.midi > highest.midi ? p : highest);
    }

    // Find the note furthest from anchor in vertical space
    const lowest = positions.reduce((l, p) => p.midi < l.midi ? p : l);
    const highest = positions.reduce((h, p) => p.midi > h.midi ? p : h);

    // If anchor is toward the high end, cursor is low (and vice versa)
    // This makes the cursor the "movable end" of the selection
    const anchorIsHigh = anchorPos.midi >= (lowest.midi + highest.midi) / 2;
    return anchorIsHigh ? lowest : highest;
  }

  /**
   * Find anchor as the opposite extreme from cursor (stable end of selection).
   */
  private findAnchorAsOppositeOfCursor(
    positions: VerticalPosition[],
    cursor: VerticalPosition
  ): VerticalPosition | null {
    if (positions.length === 0) return null;
    if (positions.length === 1) return positions[0];

    const lowest = positions.reduce((l, p) => p.midi < l.midi ? p : l);
    const highest = positions.reduce((h, p) => p.midi > h.midi ? p : h);

    // Anchor is the opposite extreme from cursor
    return cursor.midi === lowest.midi ? highest : lowest;
  }

  /**
   * Group selected notes by their event (staffIndex-measureIndex-eventId).
   */
  private groupNotesByEvent(notes: SelectedNote[]): Map<string, SelectedNote[]> {
    const map = new Map<string, SelectedNote[]>();
    for (const note of notes) {
      const key = `${note.staffIndex}-${note.measureIndex}-${note.eventId}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(note);
    }
    return map;
  }

  /**
   * Parse event key back to components.
   */
  private parseEventKey(key: string): [number, number, string | number] {
    const parts = key.split('-');
    return [parseInt(parts[0]), parseInt(parts[1]), parts.slice(2).join('-')];
  }

  /**
   * Find the cursor (the note that moves when extending).
   * For expansion: cursor is the extreme in movement direction.
   * For contraction: cursor moves back toward anchor.
   * 
   * Key insight: the cursor is always the note at the OPPOSITE extreme from
   * where the anchor would naturally be. If anchor is high (for "down" extension),
   * cursor is low. This way, pressing "up" moves the low cursor up toward anchor.
   */
  private findCursorForEvent(positions: VerticalPosition[]): VerticalPosition | null {
    if (positions.length === 0) return null;

    // For 'down' direction, we want to move the LOWEST note (further down or back up)
    // For 'up' direction, we want to move the HIGHEST note (further up or back down)
    if (this.direction === 'down') {
      // Cursor is lowest pitch - moving down expands, moving up contracts
      return positions.reduce((lowest, p) => p.midi < lowest.midi ? p : lowest);
    } else if (this.direction === 'up') {
      // Cursor is highest pitch - moving up expands, moving down contracts
      return positions.reduce((highest, p) => p.midi > highest.midi ? p : highest);
    } else {
      return positions[0];
    }
  }

  /**
   * Find the anchor (the fixed end of the selection range).
   * Anchor is the OPPOSITE extreme from cursor.
   */
  private findAnchorForEvent(positions: VerticalPosition[]): VerticalPosition | null {
    if (positions.length === 0) return null;

    if (this.direction === 'down') {
      // Anchor is highest pitch (opposite of cursor which is lowest)
      return positions.reduce((highest, p) => p.midi > highest.midi ? p : highest);
    } else if (this.direction === 'up') {
      // Anchor is lowest pitch (opposite of cursor which is highest)
      return positions.reduce((lowest, p) => p.midi < lowest.midi ? p : lowest);
    } else {
      return positions[0];
    }
  }

  /**
   * Find the current cursor position (extreme of selection in movement direction).
   */
  private findCurrentCursor(
    state: Selection,
    score: Score,
    _anchor: SelectedNote
  ): VerticalPosition | null {
    // For anchor-based selection, cursor is the most extreme note in the movement direction
    const positions = state.selectedNotes
      .map(n => this.toVerticalPosition(n, score))
      .filter((p): p is VerticalPosition => p !== null);

    if (positions.length === 0) return null;

    // Find extreme based on direction we're moving
    // "down" = lower staff / lower pitch is cursor
    // "up" = higher staff / higher pitch is cursor
    if (this.direction === 'down') {
      // Cursor is the lowest (highest staff index, lowest midi)
      return positions.reduce((lowest, p) => {
        if (p.staffIndex > lowest.staffIndex) return p;
        if (p.staffIndex === lowest.staffIndex && p.midi < lowest.midi) return p;
        return lowest;
      });
    } else if (this.direction === 'up') {
      // Cursor is the highest (lowest staff index, highest midi)
      return positions.reduce((highest, p) => {
        if (p.staffIndex < highest.staffIndex) return p;
        if (p.staffIndex === highest.staffIndex && p.midi > highest.midi) return p;
        return highest;
      });
    } else {
      // 'all' - select all staves, so any position works
      return positions[0];
    }
  }

  /**
   * Convert a SelectedNote to a VerticalPosition with MIDI info.
   */
  private toVerticalPosition(note: SelectedNote, score: Score): VerticalPosition | null {
    const staff = score.staves[note.staffIndex];
    if (!staff) return null;

    const measure = staff.measures[note.measureIndex];
    if (!measure) return null;

    const event = measure.events.find(e => e.id === note.eventId);
    if (!event) return null;

    let midi = 60; // Default C4
    if (note.noteId && event.notes) {
      const n = event.notes.find(n => n.id === note.noteId);
      if (n) {
        midi = getMidi(n.pitch ?? 'C4');
      }
    } else if (event.notes && event.notes.length > 0) {
      // Use first note's pitch for rest/multi
      midi = getMidi(event.notes[0].pitch ?? 'C4');
    }

    return {
      staffIndex: note.staffIndex,
      measureIndex: note.measureIndex,
      eventId: note.eventId,
      noteId: note.noteId,
      midi,
    };
  }

  /**
   * Move cursor in the specified direction.
   * Returns null if at boundary.
   */
  private moveCursor(cursor: VerticalPosition, score: Score): VerticalPosition | null {
    const staff = score.staves[cursor.staffIndex];
    if (!staff) return null;

    const measure = staff.measures[cursor.measureIndex];
    if (!measure) return null;

    const event = measure.events.find(e => e.id === cursor.eventId);
    if (!event) return null;

    if (this.direction === 'all') {
      // For 'all', we don't move cursor - just select all staves
      return cursor;
    }

    // First, try to move within chord
    const chordMove = this.moveCursorWithinChord(cursor, event, score);
    if (chordMove) {
      return chordMove;
    }

    // Chord exhausted, try cross-staff
    return this.moveCursorCrossStaff(cursor, score);
  }

  /**
   * Move cursor to adjacent note within same chord.
   */
  private moveCursorWithinChord(
    cursor: VerticalPosition,
    event: ScoreEvent,
    _score: Score
  ): VerticalPosition | null {
    if (!event.notes || event.notes.length <= 1) {
      return null; // Single note or rest, can't move within
    }

    // Sort notes by pitch
    const sortedNotes = [...event.notes].sort((a, b) =>
      getMidi(a.pitch ?? 'C4') - getMidi(b.pitch ?? 'C4')
    );

    const currentIdx = sortedNotes.findIndex(n => n.id === cursor.noteId);
    if (currentIdx === -1) return null;

    let targetIdx: number;
    if (this.direction === 'down') {
      targetIdx = currentIdx - 1; // Lower pitch
    } else {
      targetIdx = currentIdx + 1; // Higher pitch
    }

    // Check bounds (no cycling in anchor mode)
    if (targetIdx < 0 || targetIdx >= sortedNotes.length) {
      return null; // At chord boundary, need cross-staff
    }

    const targetNote = sortedNotes[targetIdx];
    return {
      staffIndex: cursor.staffIndex,
      measureIndex: cursor.measureIndex,
      eventId: cursor.eventId,
      noteId: targetNote.id,
      midi: getMidi(targetNote.pitch ?? 'C4'),
    };
  }

  /**
   * Move cursor to quant-aligned event in adjacent staff.
   */
  private moveCursorCrossStaff(
    cursor: VerticalPosition,
    score: Score
  ): VerticalPosition | null {
    const targetStaffIndex = this.direction === 'down'
      ? cursor.staffIndex + 1
      : cursor.staffIndex - 1;

    // Boundary check
    if (targetStaffIndex < 0 || targetStaffIndex >= score.staves.length) {
      return null;
    }

    const targetStaff = score.staves[targetStaffIndex];
    if (!targetStaff) return null;

    const targetMeasure = targetStaff.measures[cursor.measureIndex];
    if (!targetMeasure || targetMeasure.events.length === 0) return null;

    // Find quant position of cursor event
    const sourceStaff = score.staves[cursor.staffIndex];
    const sourceMeasure = sourceStaff?.measures[cursor.measureIndex];
    if (!sourceMeasure) return null;

    let cursorQuant = 0;
    for (const event of sourceMeasure.events) {
      if (event.id === cursor.eventId) break;
      cursorQuant += getNoteDuration(event.duration, event.dotted, event.tuplet);
    }

    // Find overlapping event in target staff
    let targetQuant = 0;
    for (const event of targetMeasure.events) {
      const duration = getNoteDuration(event.duration, event.dotted, event.tuplet);
      const eventEnd = targetQuant + duration;

      // Check overlap
      if (cursorQuant >= targetQuant && cursorQuant < eventEnd) {
        // Found overlapping event
        const targetNote = this.getEdgeNoteInEvent(event, this.direction);
        return {
          staffIndex: targetStaffIndex,
          measureIndex: cursor.measureIndex,
          eventId: event.id,
          noteId: targetNote?.id ?? null,
          midi: targetNote ? getMidi(targetNote.pitch ?? 'C4') : 60,
        };
      }
      targetQuant += duration;
    }

    // No overlapping event found, use first/last event
    const fallbackEvent = this.direction === 'down'
      ? targetMeasure.events[0]
      : targetMeasure.events[targetMeasure.events.length - 1];

    if (!fallbackEvent) return null;

    const fallbackNote = this.getEdgeNoteInEvent(fallbackEvent, this.direction);
    return {
      staffIndex: targetStaffIndex,
      measureIndex: cursor.measureIndex,
      eventId: fallbackEvent.id,
      noteId: fallbackNote?.id ?? null,
      midi: fallbackNote ? getMidi(fallbackNote.pitch ?? 'C4') : 60,
    };
  }

  /**
   * Get the edge note in an event based on direction.
   * Down = highest note (will be first selected when entering from above)
   * Up = lowest note
   */
  private getEdgeNoteInEvent(event: ScoreEvent, direction: ExtendDirection): Note | null {
    if (!event.notes || event.notes.length === 0) return null;

    const sorted = [...event.notes].sort((a, b) =>
      getMidi(a.pitch ?? 'C4') - getMidi(b.pitch ?? 'C4')
    );

    // When moving down, enter at top of chord; when up, enter at bottom
    return direction === 'down' ? sorted[sorted.length - 1] : sorted[0];
  }

  /**
   * Select all notes between anchor and cursor (inclusive).
   */
  private selectRangeBetween(
    anchor: VerticalPosition,
    cursor: VerticalPosition,
    score: Score
  ): SelectedNote[] {
    const result: SelectedNote[] = [];

    // Determine vertical range (staff indices)
    const minStaff = Math.min(anchor.staffIndex, cursor.staffIndex);
    const maxStaff = Math.max(anchor.staffIndex, cursor.staffIndex);

    // For each staff in range
    for (let staffIndex = minStaff; staffIndex <= maxStaff; staffIndex++) {
      const staff = score.staves[staffIndex];
      if (!staff) continue;

      // Get the relevant measure(s) - for now, same measure as anchor
      const measureIndex = anchor.measureIndex;
      const measure = staff.measures[measureIndex];
      if (!measure) continue;

      // Determine which event(s) to select based on quant alignment
      const anchorEvent = this.findEventById(score, anchor.staffIndex, anchor.measureIndex, anchor.eventId);
      if (!anchorEvent) continue;

      // Get quant range of anchor event
      const anchorStaff = score.staves[anchor.staffIndex];
      const anchorMeasure = anchorStaff?.measures[anchor.measureIndex];
      if (!anchorMeasure) continue;

      let startQuant = 0;
      for (const e of anchorMeasure.events) {
        if (e.id === anchor.eventId) break;
        startQuant += getNoteDuration(e.duration, e.dotted, e.tuplet);
      }
      const endQuant = startQuant + getNoteDuration(anchorEvent.duration, anchorEvent.dotted, anchorEvent.tuplet);

      // Find overlapping events in this staff
      let quant = 0;
      for (const event of measure.events) {
        const duration = getNoteDuration(event.duration, event.dotted, event.tuplet);
        const eventEnd = quant + duration;

        // Check overlap
        if (quant < endQuant && eventEnd > startQuant) {
          // For edge staves, filter notes based on anchor/cursor midi
          if (staffIndex === minStaff && staffIndex === maxStaff) {
            // Same staff - select notes between anchor and cursor midi
            this.addNotesInMidiRange(result, staffIndex, measureIndex, event, anchor.midi, cursor.midi);
          } else if (staffIndex === anchor.staffIndex) {
            // Anchor staff - select from anchor note to edge
            this.addNotesFromAnchorToEdge(result, staffIndex, measureIndex, event, anchor, cursor.staffIndex > anchor.staffIndex);
          } else if (staffIndex === cursor.staffIndex) {
            // Cursor staff - select from edge to cursor note
            this.addNotesFromEdgeToCursor(result, staffIndex, measureIndex, event, cursor, anchor.staffIndex > cursor.staffIndex);
          } else {
            // Middle staff - select all notes
            this.addAllNotesInEvent(result, staffIndex, measureIndex, event);
          }
        }
        quant += duration;
      }
    }

    return result;
  }

  /**
   * Add notes in MIDI range (same staff selection).
   */
  private addNotesInMidiRange(
    result: SelectedNote[],
    staffIndex: number,
    measureIndex: number,
    event: ScoreEvent,
    anchorMidi: number,
    cursorMidi: number
  ): void {
    const minMidi = Math.min(anchorMidi, cursorMidi);
    const maxMidi = Math.max(anchorMidi, cursorMidi);

    if (event.isRest || !event.notes || event.notes.length === 0) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: null });
      return;
    }

    for (const note of event.notes) {
      const midi = getMidi(note.pitch ?? 'C4');
      if (midi >= minMidi && midi <= maxMidi) {
        result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
      }
    }
  }

  /**
   * Add all notes in anchor's event when crossing to another staff.
   * This implicitly fills the anchor's chord when transitioning cross-staff.
   */
  private addNotesFromAnchorToEdge(
    result: SelectedNote[],
    staffIndex: number,
    measureIndex: number,
    event: ScoreEvent,
    _anchor: VerticalPosition,
    _cursorBelow: boolean
  ): void {
    // When crossing to another staff, select ALL notes in anchor's event
    // (Don't filter by anchor.midi - fill the entire chord)
    if (event.isRest || !event.notes || event.notes.length === 0) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: null });
      return;
    }

    for (const note of event.notes) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
    }
  }

  /**
   * Add notes from edge to cursor (for cursor staff).
   */
  private addNotesFromEdgeToCursor(
    result: SelectedNote[],
    staffIndex: number,
    measureIndex: number,
    event: ScoreEvent,
    cursor: VerticalPosition,
    anchorBelow: boolean
  ): void {
    if (event.isRest || !event.notes || event.notes.length === 0) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: null });
      return;
    }

    for (const note of event.notes) {
      const midi = getMidi(note.pitch ?? 'C4');
      if (anchorBelow) {
        // Anchor is below, cursor is here - select from top down to cursor
        if (midi >= cursor.midi) {
          result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
        }
      } else {
        // Anchor is above, cursor is here - select from bottom up to cursor
        if (midi <= cursor.midi) {
          result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
        }
      }
    }
  }

  /**
   * Add all notes in an event (for middle staves).
   */
  private addAllNotesInEvent(
    result: SelectedNote[],
    staffIndex: number,
    measureIndex: number,
    event: ScoreEvent
  ): void {
    if (event.isRest || !event.notes || event.notes.length === 0) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: null });
      return;
    }

    for (const note of event.notes) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
    }
  }

  /**
   * Find event by ID.
   */
  private findEventById(
    score: Score,
    staffIndex: number,
    measureIndex: number,
    eventId: string | number
  ): ScoreEvent | null {
    const staff = score.staves[staffIndex];
    if (!staff) return null;

    const measure = staff.measures[measureIndex];
    if (!measure) return null;

    return measure.events.find(e => e.id === eventId) ?? null;
  }
}
