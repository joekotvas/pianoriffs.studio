/**
 * ToggleNoteCommand
 *
 * Toggles a specific note in/out of the selection (Cmd+click behavior).
 * If the note is already selected, it's removed.
 * If not selected, it's added to the selection.
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export interface ToggleNoteOptions {
  staffIndex: number;
  measureIndex: number;
  eventId: string;
  noteId: string | null;
}

/**
 * Command to toggle a note in/out of selection (Cmd+click)
 */
export class ToggleNoteCommand implements SelectionCommand {
  readonly type = 'TOGGLE_NOTE';
  private options: ToggleNoteOptions;

  constructor(options: ToggleNoteOptions) {
    this.options = options;
  }

  execute(state: Selection, score: Score): Selection {
    const { staffIndex, measureIndex, eventId, noteId } = this.options;

    // Validate staff and measure exist
    const staff = score.staves[staffIndex];
    if (!staff) return state;

    const measure = staff.measures[measureIndex];
    if (!measure) return state;

    // If selectedNotes is empty but cursor is positioned, infer current selection from cursor
    let currentSelectedNotes = [...state.selectedNotes];
    if (
      currentSelectedNotes.length === 0 &&
      state.eventId !== null &&
      state.measureIndex !== null
    ) {
      currentSelectedNotes = [
        {
          staffIndex: state.staffIndex,
          measureIndex: state.measureIndex,
          eventId: state.eventId,
          noteId: state.noteId,
        },
      ];
    }

    // Check if note is already selected
    const existingIndex = currentSelectedNotes.findIndex((n) => {
      if (noteId !== null) {
        return n.noteId === noteId;
      } else {
        // For null noteId (legacy rests), match by eventId and null noteId
        return n.eventId === eventId && n.noteId === null;
      }
    });

    const isCurrentlySelected = existingIndex !== -1;

    // Build the note entry
    const noteEntry: SelectedNote = {
      staffIndex,
      measureIndex,
      eventId,
      noteId,
    };

    if (isCurrentlySelected) {
      // Remove from selection
      const newSelectedNotes = [...currentSelectedNotes];
      newSelectedNotes.splice(existingIndex, 1);

      // If we removed the last note, clear selection
      if (newSelectedNotes.length === 0) {
        return {
          ...state,
          measureIndex: null,
          eventId: null,
          noteId: null,
          selectedNotes: [],
          anchor: null,
        };
      }

      // Update cursor to last remaining note
      const lastNote = newSelectedNotes[newSelectedNotes.length - 1];
      return {
        ...state,
        staffIndex: lastNote.staffIndex,
        measureIndex: lastNote.measureIndex,
        eventId: lastNote.eventId,
        noteId: lastNote.noteId,
        selectedNotes: newSelectedNotes,
      };
    } else {
      // Add to selection
      return {
        ...state,
        staffIndex,
        measureIndex,
        eventId,
        noteId,
        selectedNotes: [...currentSelectedNotes, noteEntry],
        anchor: state.anchor || currentSelectedNotes[0] || noteEntry,
      };
    }
  }
}
