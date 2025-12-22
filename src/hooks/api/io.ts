import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * IO method names provided by this factory
 */
type IOMethodNames = 'loadScore' | 'reset' | 'export';

/**
 * Factory for creating I/O and Lifecycle API methods.
 * Handles score loading, exporting, and resetting.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for I/O
 */
export const createIOMethods = (ctx: APIContext): Pick<MusicEditorAPI, IOMethodNames> & ThisType<MusicEditorAPI> => {
  const { scoreRef } = ctx;

  return {
    loadScore(_newScore) {
      // TODO: Implement
      return this;
    },

    reset(_template = 'grand', _measures = 4) {
      // TODO: Implement
      return this;
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
