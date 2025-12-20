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

    // Find current cursor (the extreme point of selection in movement direction)
    const currentCursor = this.findCurrentCursor(state, score, anchor);
    if (!currentCursor) {
      return state;
    }

    // Move cursor in direction
    const newCursor = this.moveCursor(currentCursor, score);
    if (!newCursor) {
      // Can't move (at boundary)
      return state;
    }

    // Calculate selection between anchor and new cursor
    const anchorPos = this.toVerticalPosition(anchor, score);
    if (!anchorPos) {
      return state;
    }

    const selectedNotes = this.selectRangeBetween(anchorPos, newCursor, score);

    return {
      staffIndex: newCursor.staffIndex,
      measureIndex: newCursor.measureIndex,
      eventId: newCursor.eventId,
      noteId: newCursor.noteId,
      selectedNotes,
      anchor,
    };
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
   * Add notes from anchor to edge of chord (for anchor staff).
   */
  private addNotesFromAnchorToEdge(
    result: SelectedNote[],
    staffIndex: number,
    measureIndex: number,
    event: ScoreEvent,
    anchor: VerticalPosition,
    cursorBelow: boolean
  ): void {
    if (event.isRest || !event.notes || event.notes.length === 0) {
      result.push({ staffIndex, measureIndex, eventId: event.id, noteId: null });
      return;
    }

    for (const note of event.notes) {
      const midi = getMidi(note.pitch ?? 'C4');
      if (cursorBelow) {
        // Cursor is below, so select from anchor down (anchor midi and lower)
        if (midi <= anchor.midi) {
          result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
        }
      } else {
        // Cursor is above, so select from anchor up (anchor midi and higher)
        if (midi >= anchor.midi) {
          result.push({ staffIndex, measureIndex, eventId: event.id, noteId: note.id });
        }
      }
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
