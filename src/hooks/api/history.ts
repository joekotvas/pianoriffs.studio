import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * History method names provided by this factory
 */
type HistoryMethodNames =
  | 'undo'
  | 'redo'
  | 'beginTransaction'
  | 'commitTransaction'
  | 'rollbackTransaction'
  | 'copy'
  | 'cut'
  | 'paste';

/**
 * Factory for creating History API methods.
 * Handles undo/redo, transactions, and clipboard operations.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for history
 */
export const createHistoryMethods = (
  ctx: APIContext
): Pick<MusicEditorAPI, HistoryMethodNames> & ThisType<MusicEditorAPI> => {
  const { history } = ctx;
  const { undo, redo, begin, commit, rollback } = history;

  return {
    undo() {
      undo();
      return this;
    },

    redo() {
      redo();
      return this;
    },

    /**
     * Begin a new transaction batch.
     * All commands will be buffered until commitTransaction() is called.
     */
    beginTransaction() {
      begin();
      return this;
    },

    /**
     * Commit the current transaction batch.
     * Bundles buffered commands into a single history entry.
     *
     * @param label - Optional description for the batch transaction (e.g., "Add Chord")
     */
    commitTransaction(label?: string) {
      commit(label);
      return this;
    },

    /**
     * Rollback the current transaction.
     * Discards buffered commands.
     */
    rollbackTransaction() {
      rollback();
      return this;
    },

    copy() {
      // TODO: Implement
      return this;
    },

    cut() {
      // TODO: Implement
      return this;
    },

    paste() {
      // TODO: Implement
      return this;
    },
  };
};
