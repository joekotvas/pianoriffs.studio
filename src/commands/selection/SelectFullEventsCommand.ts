/**
 * SelectFullEventsCommand
 *
 * Selects all notes in all currently "touched" events.
 * "Touched" = any event that has at least one note selected.
 *
 * Use case: Fill partial chord selections without expanding to other staves.
 *
 * @see Issue #101
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

/**
 * Command to fill all touched events with their complete note sets.
 *
 * @example
 * ```typescript
 * // Select bottom note of chord, then fill entire chord
 * engine.dispatch(new SelectEventCommand({ ... })); // C4 selected
 * engine.dispatch(new SelectFullEventsCommand());   // C4, E4, G4 all selected
 * ```
 *
 * @tested SelectFullEventsCommand.test.ts
 */
export class SelectFullEventsCommand implements SelectionCommand {
  readonly type = 'SELECT_FULL_EVENTS';

  execute(state: Selection, score: Score): Selection {
    // Early exit: no selection
    if (state.selectedNotes.length === 0) {
      return state;
    }

    // Get unique touched events
    const touchedEvents = this.getTouchedEvents(state.selectedNotes);

    // Collect all notes from touched events
    const allNotes: SelectedNote[] = [];

    for (const { staffIndex, measureIndex, eventId } of touchedEvents) {
      const staff = score.staves[staffIndex];
      if (!staff) continue;

      const measure = staff.measures[measureIndex];
      if (!measure) continue;

      const event = measure.events.find((e) => e.id === eventId);
      if (!event) continue;

      // Add all notes from the event
      if (event.isRest || !event.notes || event.notes.length === 0) {
        // Rest event - add single entry with null noteId
        allNotes.push({
          staffIndex,
          measureIndex,
          eventId,
          noteId: null,
        });
      } else {
        // Note event - add all notes
        for (const note of event.notes) {
          allNotes.push({
            staffIndex,
            measureIndex,
            eventId,
            noteId: note.id,
          });
        }
      }
    }

    // No notes collected (shouldn't happen, but guard)
    if (allNotes.length === 0) {
      return state;
    }

    // Deduplicate (in case of overlapping selections)
    const uniqueNotes = this.deduplicateNotes(allNotes);

    // Build result selection
    const firstNote = uniqueNotes[0];
    return {
      staffIndex: firstNote.staffIndex,
      measureIndex: firstNote.measureIndex,
      eventId: firstNote.eventId,
      noteId: firstNote.noteId,
      selectedNotes: uniqueNotes,
      anchor: state.anchor ?? firstNote, // Preserve existing anchor
    };
  }

  /**
   * Get unique (staffIndex, measureIndex, eventId) tuples from selection.
   */
  private getTouchedEvents(
    selectedNotes: SelectedNote[]
  ): Array<{ staffIndex: number; measureIndex: number; eventId: string | number }> {
    const seen = new Set<string>();
    const result: Array<{ staffIndex: number; measureIndex: number; eventId: string | number }> =
      [];

    for (const note of selectedNotes) {
      const key = `${note.staffIndex}-${note.measureIndex}-${note.eventId}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          staffIndex: note.staffIndex,
          measureIndex: note.measureIndex,
          eventId: note.eventId,
        });
      }
    }

    return result;
  }

  /**
   * Remove duplicate notes from array.
   */
  private deduplicateNotes(notes: SelectedNote[]): SelectedNote[] {
    const seen = new Set<string>();
    return notes.filter((note) => {
      const key = `${note.staffIndex}-${note.measureIndex}-${note.eventId}-${note.noteId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
