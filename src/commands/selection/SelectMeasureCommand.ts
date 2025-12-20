/**
 * SelectMeasureCommand
 *
 * Convenience command to select all events in a specific measure.
 * Supports additive selection for Cmd+click behavior.
 *
 * @see Issue #99
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export interface SelectMeasureOptions {
  staffIndex: number;
  measureIndex: number;
  /** If true, add to existing selection instead of replacing */
  addToSelection?: boolean;
}

/**
 * Command to select all notes in a measure
 */
export class SelectMeasureCommand implements SelectionCommand {
  readonly type = 'SELECT_MEASURE';
  private options: SelectMeasureOptions;

  constructor(options: SelectMeasureOptions) {
    this.options = options;
  }

  execute(state: Selection, score: Score): Selection {
    const { staffIndex, measureIndex, addToSelection = false } = this.options;

    // Validate staff
    const staff = score.staves[staffIndex];
    if (!staff) return state;

    // Validate measure
    const measure = staff.measures[measureIndex];
    if (!measure) return state;

    // Collect all notes in the measure
    const measureNotes: SelectedNote[] = [];

    for (const event of measure.events) {
      if (event.notes && event.notes.length > 0) {
        for (const note of event.notes) {
          measureNotes.push({
            staffIndex,
            measureIndex,
            eventId: event.id,
            noteId: note.id,
          });
        }
      } else if (event.isRest) {
        // Include rests
        measureNotes.push({
          staffIndex,
          measureIndex,
          eventId: event.id,
          noteId: null,
        });
      }
    }

    if (measureNotes.length === 0) {
      return state;
    }

    const first = measureNotes[0];

    if (addToSelection) {
      // Merge with existing selection, avoiding duplicates
      const existingIds = new Set(
        state.selectedNotes.map(n => `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`)
      );
      const newNotes = measureNotes.filter(
        n => !existingIds.has(`${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`)
      );

      return {
        ...state,
        staffIndex,
        measureIndex,
        eventId: first.eventId,
        noteId: first.noteId,
        selectedNotes: [...state.selectedNotes, ...newNotes],
        anchor: state.anchor || first,
      };
    } else {
      // Replace selection
      return {
        staffIndex,
        measureIndex,
        eventId: first.eventId,
        noteId: first.noteId,
        selectedNotes: measureNotes,
        anchor: first,
      };
    }
  }
}
