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
 * @tested src/__tests__/SelectionEngine.test.ts - 'NavigateCommand' describe block
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
        selectedNotes: newSel.eventId && newSel.measureIndex !== null
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
      // TODO Phase 7: Wire to calculateVerticalNavigation from interaction.ts
      // That function handles:
      // - Cross-staff navigation with quant alignment
      // - Ghost cursor handling
      // - Staff cycling at boundaries
      // - Entry-point note selection by direction
      // 
      // Currently, vertical navigation is a no-op until Phase 7 wiring.
      // See: src/utils/interaction.ts calculateVerticalNavigation()
      return state;
    }

    return state;
  }
}
