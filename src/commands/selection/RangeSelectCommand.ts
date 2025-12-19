/**
 * RangeSelectCommand
 *
 * Selects all notes between an anchor point and focus point (Shift+click behavior).
 * Uses linearized note ordering to determine which notes fall within the range.
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';
import { calculateNoteRange, getLinearizedNotes } from '../../utils/selection';

export interface RangeSelectOptions {
  /** The anchor point (start of range) */
  anchor: SelectedNote;
  /** The focus point (end of range, where user clicked) */
  focus: SelectedNote;
}

/**
 * Command to select a range of notes (Shift+click)
 */
export class RangeSelectCommand implements SelectionCommand {
  readonly type = 'RANGE_SELECT';
  private options: RangeSelectOptions;

  constructor(options: RangeSelectOptions) {
    this.options = options;
  }

  execute(state: Selection, score: Score): Selection {
    const { anchor, focus } = this.options;

    // Validate anchor and focus have required data
    if (!anchor.eventId || focus.measureIndex === undefined) {
      return state;
    }

    // Get linearized notes for range calculation
    const linearNotes = getLinearizedNotes(score);

    // Calculate the range of notes between anchor and focus
    const selectedNotes = calculateNoteRange(anchor, focus, linearNotes);

    // If no notes in range, return unchanged
    if (selectedNotes.length === 0) {
      return state;
    }

    return {
      staffIndex: focus.staffIndex,
      measureIndex: focus.measureIndex,
      eventId: focus.eventId,
      noteId: focus.noteId,
      selectedNotes,
      anchor, // Preserve original anchor
    };
  }
}
