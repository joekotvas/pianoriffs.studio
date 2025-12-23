import { MusicEditorAPI } from '@/api.types';
import { Score } from '@/types';
import { APIContext } from './types';
import { LoadScoreCommand } from '@/commands';
import { generateABC } from '@/exporters/abcExporter';
import { generateMusicXML } from '@/exporters/musicXmlExporter';
import { generateStaves } from '@/utils/generateScore';

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
export const createIOMethods = (
  ctx: APIContext
): Pick<MusicEditorAPI, IOMethodNames> & ThisType<MusicEditorAPI> => {
  const { scoreRef } = ctx;

  return {
    loadScore(newScore) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const { dispatch } = ctx;
      dispatch(new LoadScoreCommand(newScore));
      return this;
    },

    reset(template = 'grand', measures = 4) {
      const { dispatch } = ctx;
      // Default key signature 'C' (implied)
      const staves = generateStaves(template, measures, 'C');

      // Create a fresh score with default values (including BPM)
      const newScore: Score = {
        ...scoreRef.current,
        staves,
        title: 'New Score',
        bpm: 120, // Reset BPM to default
      };

      dispatch(new LoadScoreCommand(newScore));
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
