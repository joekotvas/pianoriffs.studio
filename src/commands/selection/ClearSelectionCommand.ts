/**
 * ClearSelectionCommand
 *
 * Clears the current selection, resetting to default state.
 * Preserves the current staff index for continued editing in the same staff.
 */

import type { Selection, Score } from '../../types';
import { createDefaultSelection } from '../../types';
import type { SelectionCommand } from './types';

/**
 * Command to clear the current selection
 */
export class ClearSelectionCommand implements SelectionCommand {
  readonly type = 'CLEAR_SELECTION';

  execute(state: Selection, _score: Score): Selection {
    return {
      ...createDefaultSelection(),
      staffIndex: state.staffIndex, // Preserve current staff focus
    };
  }
}
