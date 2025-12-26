/**
 * SetSelectionCommand
 *
 * Raw selection command for setting arbitrary selection state.
 * Used for:
 * - Focus restoration (focusScore)
 * - External API selection setting
 * - Any case requiring full control over selection state
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export interface SetSelectionOptions {
  staffIndex?: number;
  measureIndex: number | null;
  eventId: string | null;
  noteId?: string | null;
  selectedNotes?: SelectedNote[];
  anchor?: SelectedNote | null;
}

/**
 * Command to set selection state directly
 */
export class SetSelectionCommand implements SelectionCommand {
  readonly type = 'SET_SELECTION';
  private options: SetSelectionOptions;

  constructor(options: SetSelectionOptions) {
    this.options = options;
  }

  execute(state: Selection, _score: Score): Selection {
    const {
      staffIndex = state.staffIndex,
      measureIndex,
      eventId,
      noteId = null,
      selectedNotes,
      anchor,
    } = this.options;

    // Build selectedNotes array if not provided
    let finalSelectedNotes = selectedNotes;
    if (!finalSelectedNotes && eventId !== null && measureIndex !== null) {
      // Single selection - create selectedNotes from cursor position
      finalSelectedNotes = [
        {
          staffIndex,
          measureIndex,
          eventId,
          noteId,
        },
      ];
    } else if (!finalSelectedNotes) {
      finalSelectedNotes = [];
    }

    // Build anchor if not provided
    let finalAnchor = anchor;
    if (finalAnchor === undefined && eventId !== null && measureIndex !== null) {
      finalAnchor = {
        staffIndex,
        measureIndex,
        eventId,
        noteId,
      };
    }

    return {
      staffIndex,
      measureIndex,
      eventId,
      noteId,
      selectedNotes: finalSelectedNotes,
      anchor: finalAnchor ?? null,
    };
  }
}
