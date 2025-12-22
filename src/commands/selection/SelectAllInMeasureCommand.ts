/**
 * SelectAllInMeasureCommand
 *
 * Selects all notes within a specific measure.
 * Iterates through all events in the measure and selects every note.
 *
 * @see Issue #135
 * @tested src/__tests__/commands/SelectAllInMeasureCommand.test.ts
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export interface SelectAllInMeasureOptions {
  /** Staff index (0-based) */
  staffIndex: number;
  /** Measure index (0-based) */
  measureIndex: number;
}

/**
 * Command to select all notes in a measure.
 *
 * Collects all notes from all events in the specified measure
 * and creates a selection containing them all.
 *
 * @example
 * ```typescript
 * engine.dispatch(new SelectAllInMeasureCommand({
 *   staffIndex: 0,
 *   measureIndex: 2,
 * }));
 * ```
 *
 * @tested src/__tests__/commands/SelectAllInMeasureCommand.test.ts
 */
export class SelectAllInMeasureCommand implements SelectionCommand {
  readonly type = 'SELECT_ALL_IN_MEASURE';
  private options: SelectAllInMeasureOptions;

  constructor(options: SelectAllInMeasureOptions) {
    this.options = options;
  }

  execute(state: Selection, score: Score): Selection {
    const { staffIndex, measureIndex } = this.options;

    // Validate staff
    const staff = score.staves[staffIndex];
    if (!staff) return state;

    // Validate measure
    const measure = staff.measures[measureIndex];
    if (!measure) return state;

    // Build selected notes for all notes in all events
    const allNotes: SelectedNote[] = [];

    measure.events.forEach((event) => {
      if (event.notes && event.notes.length > 0) {
        event.notes.forEach((note) => {
          allNotes.push({
            staffIndex,
            measureIndex,
            eventId: event.id,
            noteId: note.id,
          });
        });
      }
    });

    // If measure has no notes, return unchanged state
    if (allNotes.length === 0) {
      return state;
    }

    const first = allNotes[0];

    return {
      staffIndex,
      measureIndex,
      eventId: first.eventId,
      noteId: first.noteId,
      selectedNotes: allNotes,
      anchor: { ...first },
    };
  }
}
