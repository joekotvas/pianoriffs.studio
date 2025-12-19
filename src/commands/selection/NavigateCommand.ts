/**
 * NavigateCommand
 *
 * Wraps navigation logic to produce a new selection.
 * Delegates to navigateSelection for simple horizontal movement.
 *
 * NOTE: Full navigation with ghost cursor support (calculateNextSelection)
 * will be wired in Phase 7.
 */

import type { Selection, Score } from '../../types';
import type { SelectionCommand } from './types';
import { navigateSelection } from '../../utils/core';

export type NavigateDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Command to navigate selection in a direction
 */
export class NavigateCommand implements SelectionCommand {
  readonly type = 'NAVIGATE';
  private direction: NavigateDirection;

  constructor(direction: NavigateDirection) {
    this.direction = direction;
  }

  execute(state: Selection, score: Score): Selection {
    const staff = score.staves[state.staffIndex];
    if (!staff) return state;

    const measures = staff.measures;

    if (this.direction === 'left' || this.direction === 'right') {
      // Use existing navigateSelection utility for horizontal movement
      const newSel = navigateSelection(measures, state, this.direction);

      return {
        ...newSel,
        selectedNotes: newSel.eventId
          ? [
              {
                staffIndex: newSel.staffIndex,
                measureIndex: newSel.measureIndex,
                eventId: newSel.eventId,
                noteId: newSel.noteId,
              },
            ]
          : [],
        anchor: null,
      };
    } else if (this.direction === 'up' || this.direction === 'down') {
      // Vertical navigation - for single staff, cycle within notes
      // TODO: Wire to calculateVerticalNavigation in Phase 7

      // For now, handle note cycling within a chord
      if (state.eventId !== null && state.measureIndex !== null) {
        const measure = measures[state.measureIndex];
        const event = measure?.events?.find((e) => e.id === state.eventId);

        if (event && event.notes && event.notes.length > 1) {
          // Find current note index
          const currentNoteIdx = event.notes.findIndex((n) => n.id === state.noteId);
          let newNoteIdx: number;

          if (this.direction === 'up') {
            newNoteIdx = currentNoteIdx > 0 ? currentNoteIdx - 1 : event.notes.length - 1;
          } else {
            newNoteIdx = currentNoteIdx < event.notes.length - 1 ? currentNoteIdx + 1 : 0;
          }

          const newNoteId = event.notes[newNoteIdx].id;
          return {
            ...state,
            noteId: newNoteId,
            selectedNotes: [
              {
                staffIndex: state.staffIndex,
                measureIndex: state.measureIndex,
                eventId: state.eventId,
                noteId: newNoteId,
              },
            ],
          };
        }
      }

      // No change for single-note events or empty selection
      return state;
    }

    return state;
  }
}
