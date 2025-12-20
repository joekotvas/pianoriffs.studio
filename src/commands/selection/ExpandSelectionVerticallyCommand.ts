/**
 * ExpandSelectionVerticallyCommand
 *
 * Expands selection vertically with hierarchical behavior:
 * 1. Within events: Add notes in direction with CYCLING at boundaries
 * 2. Across staves: Add quant-aligned events (UNIDIRECTIONAL, no cycling)
 *
 * Behavior:
 * - Partial events: Add next note in direction (cycle at chord boundary)
 * - Full events: Expand to quant-aligned events in adjacent staff
 * - At staff boundary: No-op (unidirectional)
 *
 * @see Issue #101
 */

import type { Selection, Score, SelectedNote, ScoreEvent, Note } from '../../types';
import type { SelectionCommand } from './types';
import { getNoteDuration } from '../../utils/core';
import { getMidi } from '../../services/MusicService';

export type ExpandDirection = 'up' | 'down' | 'all';

export interface ExpandSelectionVerticallyOptions {
  direction: ExpandDirection;
}

/**
 * Command to expand selection vertically (within chords and across staves).
 *
 * @example
 * ```typescript
 * // Expand selection downward (add lower note or bass staff)
 * engine.dispatch(new ExpandSelectionVerticallyCommand({ direction: 'down' }));
 *
 * // Expand to all staves at once
 * engine.dispatch(new ExpandSelectionVerticallyCommand({ direction: 'all' }));
 * ```
 *
 * @tested ExpandSelectionVerticallyCommand.test.ts
 */
export class ExpandSelectionVerticallyCommand implements SelectionCommand {
  readonly type = 'EXPAND_SELECTION_VERTICALLY';
  private direction: ExpandDirection;

  constructor(options: ExpandSelectionVerticallyOptions) {
    this.direction = options.direction;
  }

  execute(state: Selection, score: Score): Selection {
    // Early exit: no selection
    if (state.selectedNotes.length === 0) {
      return state;
    }

    // Get touched events
    const touchedEvents = this.getTouchedEvents(state.selectedNotes, score);

    // Check if any event is partially selected
    const hasPartialEvents = touchedEvents.some(te => 
      !this.isEventFullySelected(state.selectedNotes, te.event, te.staffIndex, te.measureIndex)
    );

    if (hasPartialEvents) {
      // Expand within chords (with cycling)
      return this.expandWithinChords(state, score, touchedEvents);
    }

    // All events full - expand to adjacent staff(s)
    return this.expandToStaff(state, score, touchedEvents);
  }

  /**
   * Get unique touched events with their full event data.
   */
  private getTouchedEvents(
    selectedNotes: SelectedNote[],
    score: Score
  ): Array<{
    staffIndex: number;
    measureIndex: number;
    eventId: string | number;
    event: ScoreEvent;
  }> {
    const seen = new Set<string>();
    const result: Array<{
      staffIndex: number;
      measureIndex: number;
      eventId: string | number;
      event: ScoreEvent;
    }> = [];

    for (const note of selectedNotes) {
      const key = `${note.staffIndex}-${note.measureIndex}-${note.eventId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const staff = score.staves[note.staffIndex];
      if (!staff) continue;

      const measure = staff.measures[note.measureIndex];
      if (!measure) continue;

      const event = measure.events.find(e => e.id === note.eventId);
      if (!event) continue;

      result.push({
        staffIndex: note.staffIndex,
        measureIndex: note.measureIndex,
        eventId: note.eventId,
        event,
      });
    }

    return result;
  }

  /**
   * Check if all notes in an event are selected.
   */
  private isEventFullySelected(
    selectedNotes: SelectedNote[],
    event: ScoreEvent,
    staffIndex: number,
    measureIndex: number
  ): boolean {
    if (event.isRest || !event.notes || event.notes.length === 0) {
      // Rest is "full" if it's selected
      return selectedNotes.some(
        n => n.staffIndex === staffIndex && n.measureIndex === measureIndex && n.eventId === event.id
      );
    }

    // Check all notes are selected
    const selectedInEvent = new Set(
      selectedNotes
        .filter(n => n.staffIndex === staffIndex && n.measureIndex === measureIndex && n.eventId === event.id)
        .map(n => n.noteId)
    );

    return event.notes.every(note => selectedInEvent.has(note.id));
  }

  /**
   * Expand within partial chords - add next note in direction with cycling.
   */
  private expandWithinChords(
    state: Selection,
    score: Score,
    touchedEvents: Array<{
      staffIndex: number;
      measureIndex: number;
      eventId: string | number;
      event: ScoreEvent;
    }>
  ): Selection {
    const newNotes: SelectedNote[] = [...state.selectedNotes];
    const existingKeys = new Set(
      state.selectedNotes.map(n => `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`)
    );

    for (const te of touchedEvents) {
      if (this.isEventFullySelected(state.selectedNotes, te.event, te.staffIndex, te.measureIndex)) {
        continue; // Skip full events
      }

      // Get sorted notes (low to high pitch)
      const sortedNotes = this.getSortedNotes(te.event);
      if (sortedNotes.length === 0) continue;

      // Find which notes are selected
      const selectedInEvent = new Set(
        state.selectedNotes
          .filter(n => n.staffIndex === te.staffIndex && n.measureIndex === te.measureIndex && n.eventId === te.eventId)
          .map(n => n.noteId)
      );

      // Find next note to add with cycling
      const noteToAdd = this.findNextNoteWithCycling(sortedNotes, selectedInEvent);

      if (noteToAdd) {
        const key = `${te.staffIndex}-${te.measureIndex}-${te.eventId}-${noteToAdd.id}`;
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          newNotes.push({
            staffIndex: te.staffIndex,
            measureIndex: te.measureIndex,
            eventId: te.eventId,
            noteId: noteToAdd.id,
          });
        }
      }
    }

    // No change
    if (newNotes.length === state.selectedNotes.length) {
      return state;
    }

    return this.createSelectionFromNotes(newNotes, state.anchor ?? state.selectedNotes[0]);
  }

  /**
   * Find the next note to add based on direction with cycling.
   */
  private findNextNoteWithCycling(
    sortedNotes: Note[], // low to high
    selectedIds: Set<string | number | null>
  ): Note | null {
    // Find unselected notes
    const unselected = sortedNotes.filter(n => !selectedIds.has(n.id));
    if (unselected.length === 0) return null;

    if (this.direction === 'up') {
      // Find highest selected note, then get next higher (or cycle to lowest)
      const selectedNotes = sortedNotes.filter(n => selectedIds.has(n.id));
      if (selectedNotes.length === 0) return unselected[0];

      const highestSelectedIdx = sortedNotes.findIndex(n => n.id === selectedNotes[selectedNotes.length - 1].id);
      
      // Look for next higher unselected
      for (let i = highestSelectedIdx + 1; i < sortedNotes.length; i++) {
        if (!selectedIds.has(sortedNotes[i].id)) {
          return sortedNotes[i];
        }
      }
      
      // Cycle: wrap to lowest unselected
      return unselected[0];
    } else if (this.direction === 'down') {
      // Find lowest selected note, then get next lower (or cycle to highest)
      const selectedNotes = sortedNotes.filter(n => selectedIds.has(n.id));
      if (selectedNotes.length === 0) return unselected[unselected.length - 1];

      const lowestSelectedIdx = sortedNotes.findIndex(n => n.id === selectedNotes[0].id);
      
      // Look for next lower unselected
      for (let i = lowestSelectedIdx - 1; i >= 0; i--) {
        if (!selectedIds.has(sortedNotes[i].id)) {
          return sortedNotes[i];
        }
      }
      
      // Cycle: wrap to highest unselected
      return unselected[unselected.length - 1];
    } else {
      // 'all' - just return first unselected (will fill all eventually)
      return unselected[0];
    }
  }

  /**
   * Get notes sorted by pitch (low to high).
   */
  private getSortedNotes(event: ScoreEvent): Note[] {
    if (!event.notes || event.notes.length === 0) return [];
    return [...event.notes].sort((a, b) => 
      getMidi(a.pitch ?? 'C4') - getMidi(b.pitch ?? 'C4')
    );
  }

  /**
   * Expand to adjacent staff(s) using quant alignment.
   */
  private expandToStaff(
    state: Selection,
    score: Score,
    touchedEvents: Array<{
      staffIndex: number;
      measureIndex: number;
      eventId: string | number;
      event: ScoreEvent;
    }>
  ): Selection {
    // Determine target staff indices
    const touchedStaves = new Set(touchedEvents.map(te => te.staffIndex));
    const minStaff = Math.min(...touchedStaves);
    const maxStaff = Math.max(...touchedStaves);

    let targetStaffIndices: number[] = [];

    if (this.direction === 'up') {
      // Expand to staff above the highest touched staff
      const target = minStaff - 1;
      if (target >= 0) {
        targetStaffIndices = [target];
      }
    } else if (this.direction === 'down') {
      // Expand to staff below the lowest touched staff
      const target = maxStaff + 1;
      if (target < score.staves.length) {
        targetStaffIndices = [target];
      }
    } else {
      // 'all' - add all staves not already touched
      for (let i = 0; i < score.staves.length; i++) {
        if (!touchedStaves.has(i)) {
          targetStaffIndices.push(i);
        }
      }
    }

    // No target staves (at boundary or all already selected)
    if (targetStaffIndices.length === 0) {
      return state;
    }

    // Get quant ranges from touched events by measure
    const quantRangesByMeasure = this.getQuantRangesByMeasure(touchedEvents, score);

    // Find overlapping events in target staves
    const newNotes: SelectedNote[] = [...state.selectedNotes];
    const existingKeys = new Set(
      state.selectedNotes.map(n => `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`)
    );

    for (const targetStaffIndex of targetStaffIndices) {
      const targetStaff = score.staves[targetStaffIndex];
      if (!targetStaff) continue;

      for (const [measureIndex, range] of quantRangesByMeasure) {
        const targetMeasure = targetStaff.measures[measureIndex];
        if (!targetMeasure) continue;

        const overlappingEvents = this.findEventsInQuantRange(
          targetMeasure,
          range.startQuant,
          range.endQuant
        );

        for (const event of overlappingEvents) {
          if (event.isRest || !event.notes || event.notes.length === 0) {
            // Rest
            const key = `${targetStaffIndex}-${measureIndex}-${event.id}-null`;
            if (!existingKeys.has(key)) {
              existingKeys.add(key);
              newNotes.push({
                staffIndex: targetStaffIndex,
                measureIndex,
                eventId: event.id,
                noteId: null,
              });
            }
          } else {
            // Notes
            for (const note of event.notes) {
              const key = `${targetStaffIndex}-${measureIndex}-${event.id}-${note.id}`;
              if (!existingKeys.has(key)) {
                existingKeys.add(key);
                newNotes.push({
                  staffIndex: targetStaffIndex,
                  measureIndex,
                  eventId: event.id,
                  noteId: note.id,
                });
              }
            }
          }
        }
      }
    }

    // No change
    if (newNotes.length === state.selectedNotes.length) {
      return state;
    }

    return this.createSelectionFromNotes(newNotes, state.anchor ?? state.selectedNotes[0]);
  }

  /**
   * Get quant ranges by measure from touched events.
   */
  private getQuantRangesByMeasure(
    touchedEvents: Array<{
      staffIndex: number;
      measureIndex: number;
      eventId: string | number;
      event: ScoreEvent;
    }>,
    score: Score
  ): Map<number, { startQuant: number; endQuant: number }> {
    const result = new Map<number, { startQuant: number; endQuant: number }>();

    for (const te of touchedEvents) {
      const staff = score.staves[te.staffIndex];
      if (!staff) continue;

      const measure = staff.measures[te.measureIndex];
      if (!measure) continue;

      // Calculate quant position of this event
      let quant = 0;
      for (const event of measure.events) {
        const duration = getNoteDuration(event.duration, event.dotted, event.tuplet);
        if (event.id === te.eventId) {
          const startQuant = quant;
          const endQuant = quant + duration;

          // Merge with existing range for this measure
          const existing = result.get(te.measureIndex);
          if (existing) {
            result.set(te.measureIndex, {
              startQuant: Math.min(existing.startQuant, startQuant),
              endQuant: Math.max(existing.endQuant, endQuant),
            });
          } else {
            result.set(te.measureIndex, { startQuant, endQuant });
          }
          break;
        }
        quant += duration;
      }
    }

    return result;
  }

  /**
   * Find events that overlap with a quant range.
   */
  private findEventsInQuantRange(
    measure: { events: ScoreEvent[] },
    startQuant: number,
    endQuant: number
  ): ScoreEvent[] {
    const result: ScoreEvent[] = [];
    let quant = 0;

    for (const event of measure.events) {
      const duration = getNoteDuration(event.duration, event.dotted, event.tuplet);
      const eventStart = quant;
      const eventEnd = quant + duration;

      // Check for overlap (any intersection)
      if (eventStart < endQuant && eventEnd > startQuant) {
        result.push(event);
      }

      quant += duration;
    }

    return result;
  }

  /**
   * Create a Selection from a list of notes.
   */
  private createSelectionFromNotes(
    notes: SelectedNote[],
    anchor: SelectedNote | null
  ): Selection {
    if (notes.length === 0) {
      return {
        staffIndex: 0,
        measureIndex: null,
        eventId: null,
        noteId: null,
        selectedNotes: [],
        anchor: null,
      };
    }

    const first = notes[0];
    return {
      staffIndex: first.staffIndex,
      measureIndex: first.measureIndex,
      eventId: first.eventId,
      noteId: first.noteId,
      selectedNotes: notes,
      anchor,
    };
  }
}
