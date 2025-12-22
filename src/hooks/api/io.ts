import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import { LoadScoreCommand } from '@/commands';
import { generateABC } from '@/exporters/abcExporter';
import { generateMusicXML } from '@/exporters/musicXmlExporter';

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
    loadScore(newScore) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const { dispatch } = ctx;
      dispatch(new LoadScoreCommand(newScore));
      return this;
    },

    reset(_template = 'grand', _measures = 4) {
      // TODO: Implement
      return this;
    },

    export(format) {
      const score = scoreRef.current;
      if (format === 'json') {
        return JSON.stringify(score, null, 2);
      }
      if (format === 'abc') {
        return generateABC(score, score.bpm);
      }
      if (format === 'musicxml') {
        return generateMusicXML(score);
      }
      throw new Error(`Export format '${format}' not yet implemented`);
    },
  };
};
