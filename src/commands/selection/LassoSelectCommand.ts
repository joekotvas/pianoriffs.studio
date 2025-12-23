/**
 * LassoSelectCommand
 *
 * Selects multiple notes from a drag-to-select (lasso) operation.
 * Supports both replace and additive (Cmd+drag) modes.
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export interface LassoSelectOptions {
  /** Notes selected by the lasso bounds */
  notes: SelectedNote[];
  /** If true, add to existing selection; otherwise replace */
  addToSelection?: boolean;
}

/**
 * Command to select notes from a lasso drag operation
 */
export class LassoSelectCommand implements SelectionCommand {
  readonly type = 'LASSO_SELECT';
  private options: LassoSelectOptions;

  constructor(options: LassoSelectOptions) {
    this.options = options;
  }

  execute(state: Selection, _score: Score): Selection {
    const { notes, addToSelection = false } = this.options;

    // Early exit if no notes selected
    if (notes.length === 0) {
      return state;
    }

    if (addToSelection) {
      // Merge with existing selection, avoiding duplicates
      const existingNotes = state.selectedNotes;
      const newNotes = notes.filter(
        (n) => !existingNotes.some((sn) => sn.noteId === n.noteId && sn.eventId === n.eventId)
      );

      const mergedNotes = [...existingNotes, ...newNotes];
      const first = notes[0]; // Focus on first of newly added

      return {
        ...state,
        staffIndex: first.staffIndex,
        measureIndex: first.measureIndex,
        eventId: first.eventId,
        noteId: first.noteId,
        selectedNotes: mergedNotes,
        // Keep existing anchor or use first new note
        anchor: state.anchor || first,
      };
    } else {
      // Replace selection entirely
      const first = notes[0];

      return {
        ...state,
        staffIndex: first.staffIndex,
        measureIndex: first.measureIndex,
        eventId: first.eventId,
        noteId: first.noteId,
        selectedNotes: notes,
        anchor: first,
      };
    }
  }
}
