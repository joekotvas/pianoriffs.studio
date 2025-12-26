/**
 * SelectEventCommand
 *
 * Selects a specific event/note by indices.
 * This is the primary command for cursor placement.
 */

import type { Selection, Score } from '../../types';
import type { SelectionCommand } from './types';

export interface SelectEventOptions {
  staffIndex: number;
  measureIndex: number;
  eventIndex?: number;
  noteIndex?: number;
  /** If true, add to current selection instead of replacing */
  addToSelection?: boolean;
}

/**
 * Command to select a specific event in the score
 * @tested src/__tests__/SelectionEngine.test.ts - 'SelectEventCommand' describe block
 */
export class SelectEventCommand implements SelectionCommand {
  readonly type = 'SELECT_EVENT';
  private options: SelectEventOptions;

  constructor(options: SelectEventOptions) {
    this.options = options;
  }

  execute(state: Selection, score: Score): Selection {
    const {
      staffIndex,
      measureIndex,
      eventIndex = 0,
      noteIndex = 0,
      addToSelection = false,
    } = this.options;

    // Validate staff
    const staff = score.staves[staffIndex];
    if (!staff) {
      return state; // Invalid - return unchanged
    }

    // Validate measure
    const measure = staff.measures[measureIndex];
    if (!measure) {
      return state; // Invalid - return unchanged
    }

    // Get event
    const event = measure.events[eventIndex];
    const eventId = event?.id ?? null;

    // Get note ID (first note if event exists, or specific note by index)
    let noteId: string | null = null;
    if (event && event.notes && event.notes.length > 0) {
      const noteIdx = Math.min(noteIndex, event.notes.length - 1);
      noteId = event.notes[noteIdx].id;
    }

    // Build selected note entry
    const selectedNote = eventId ? { staffIndex, measureIndex, eventId, noteId } : null;

    // Build new selection
    if (addToSelection && selectedNote) {
      // Add to existing selection
      return {
        ...state,
        staffIndex,
        measureIndex,
        eventId,
        noteId,
        selectedNotes: [...state.selectedNotes, selectedNote],
        anchor: state.anchor || selectedNote, // Set anchor if not already set
      };
    } else {
      // Replace selection
      return {
        staffIndex,
        measureIndex,
        eventId,
        noteId,
        selectedNotes: selectedNote ? [selectedNote] : [],
        anchor: null,
      };
    }
  }
}
