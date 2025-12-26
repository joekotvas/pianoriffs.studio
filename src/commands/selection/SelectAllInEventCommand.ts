/**
 * SelectAllInEventCommand
 *
 * Selects all notes within a specific event (for clicking on event body/stem).
 * When noteId is null or selectAllInEvent is true, this command selects
 * every note in the target event.
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export interface SelectAllInEventOptions {
  staffIndex: number;
  measureIndex: number;
  eventId: string;
  /** If true, add to existing selection instead of replacing */
  addToSelection?: boolean;
}

/**
 * Command to select all notes in an event
 */
export class SelectAllInEventCommand implements SelectionCommand {
  readonly type = 'SELECT_ALL_IN_EVENT';
  private options: SelectAllInEventOptions;

  constructor(options: SelectAllInEventOptions) {
    this.options = options;
  }

  execute(state: Selection, score: Score): Selection {
    const { staffIndex, measureIndex, eventId, addToSelection = false } = this.options;

    // Validate staff
    const staff = score.staves[staffIndex];
    if (!staff) return state;

    // Validate measure
    const measure = staff.measures[measureIndex];
    if (!measure) return state;

    // Find event by ID
    const event = measure.events.find((e) => e.id === eventId);
    if (!event) return state;

    // Build selected notes for all notes in the event
    const notesToSelect: SelectedNote[] = event.notes.map((note) => ({
      staffIndex,
      measureIndex,
      eventId,
      noteId: note.id,
    }));

    // If event has no notes (empty event), create entry with null noteId
    if (notesToSelect.length === 0) {
      notesToSelect.push({
        staffIndex,
        measureIndex,
        eventId,
        noteId: null,
      });
    }

    // Get first note ID for cursor position
    const firstNoteId = event.notes.length > 0 ? event.notes[0].id : null;

    if (addToSelection) {
      // Add to existing selection, avoiding duplicates
      const existingNoteIds = new Set(state.selectedNotes.map((n) => n.noteId));
      const newNotes = notesToSelect.filter((n) => !existingNoteIds.has(n.noteId));

      return {
        ...state,
        staffIndex,
        measureIndex,
        eventId,
        noteId: firstNoteId,
        selectedNotes: [...state.selectedNotes, ...newNotes],
        anchor: state.anchor || notesToSelect[0],
      };
    } else {
      // Replace selection
      return {
        staffIndex,
        measureIndex,
        eventId,
        noteId: firstNoteId,
        selectedNotes: notesToSelect,
        anchor: notesToSelect[0],
      };
    }
  }
}
