import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * Factory for creating I/O and Lifecycle API methods.
 * Handles score loading, exporting, and resetting.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for I/O
 */
export const createIOMethods = (ctx: APIContext): Pick<MusicEditorAPI, 'loadScore' | 'reset' | 'export'> => {
  const { scoreRef } = ctx;

  return {
    loadScore(_newScore) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    reset(_template = 'grand', _measures = 4) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    export(format) {
      if (format === 'json') {
        return JSON.stringify(scoreRef.current, null, 2);
      }
      // TODO: ABC and MusicXML export
      throw new Error(`Export format '${format}' not yet implemented`);
    },
  };
};
