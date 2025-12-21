import { Score } from '@/types';
import { Command } from './types';

/**
 * BatchCommand
 *
 * A composite command that groups multiple operations into a single atomic unit.
 * Used for transaction batching to ensure Undo/Redo operations handle the group as one.
 *
 * @see docs/adr/003-transaction-batching.md
 * @tested src/__tests__/ScoreAPI.transactions.test.tsx
 */
export class BatchCommand implements Command {
  public readonly type = 'BATCH';

  /**
   * @param commands - Ordered list of commands to execute
   * @param label - Optional description for the batch (e.g. "Paste 50 notes")
   */
  constructor(
    private commands: Command[],
    public label: string = 'Batch Action'
  ) {}

  /**
   * Executes all sub-commands in sequence.
   * Used during Redo operations or when executing the batch as a whole.
   *
   * @param score - Current score state
   * @returns New score state after all commands applied
   */
  execute(score: Score): Score {
    return this.commands.reduce((currentScore, command) => {
      return command.execute(currentScore);
    }, score);
  }

  /**
   * Undoes all sub-commands in reverse sequence.
   *
   * @param score - Current score state
   * @returns New score state after all commands undone
   */
  undo(score: Score): Score {
    // Clone array to avoid mutating the command list during reverse
    const reversedCommands = [...this.commands].reverse();
    
    return reversedCommands.reduce((currentScore, command) => {
      return command.undo(currentScore);
    }, score);
  }
}
