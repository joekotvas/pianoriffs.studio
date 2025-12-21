import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * Factory for creating History API methods.
 * Handles undo/redo, transactions, and clipboard operations.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for history
 */
export const createHistoryMethods = (ctx: APIContext): Pick<MusicEditorAPI, 'undo' | 'redo' | 'beginTransaction' | 'commitTransaction' | 'rollbackTransaction' | 'copy' | 'cut' | 'paste'> => {
  const { history } = ctx;
  const { undo, redo, begin, commit, rollback } = history;

  return {
    undo() {
      undo();
      return this as unknown as MusicEditorAPI;
    },

    redo() {
      redo();
      return this as unknown as MusicEditorAPI;
    },

    /**
     * Begin a new transaction batch.
     * All commands will be buffered until commitTransaction() is called.
     */
    beginTransaction() {
      begin();
      return this as unknown as MusicEditorAPI;
    },

    /**
     * Commit the current transaction batch.
     * Bundles buffered commands into a single history entry.
     */
    commitTransaction(_label?: string) {
      // Note: label parameter is not used by the current history implementation
      commit();
      return this as unknown as MusicEditorAPI;
    },

    /**
     * Rollback the current transaction.
     * Discards buffered commands.
     */
    rollbackTransaction() {
      rollback();
      return this as unknown as MusicEditorAPI;
    },

    copy() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    cut() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    paste() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },
  };
};
