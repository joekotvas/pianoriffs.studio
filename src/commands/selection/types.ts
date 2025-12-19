/**
 * SelectionCommand Interface
 *
 * Commands that modify selection state.
 * Unlike ScoreCommands, selection commands don't have undo -
 * selection history is not maintained.
 */

import type { Selection, Score } from '../../types';

/**
 * Base interface for selection commands
 */
export interface SelectionCommand {
  /** Command identifier for debugging */
  readonly type: string;

  /**
   * Execute the command to produce a new selection state
   * @param state - Current selection
   * @param score - Current score (for validation/context)
   * @returns New selection state
   */
  execute(state: Selection, score: Score): Selection;
}
