/**
 * useRiffScore Hook
 * 
 * Config-aware wrapper around useScoreLogic that normalizes configuration
 * and derives initial score state from config options.
 */

import { useMemo } from 'react';
import { 
  RiffScoreConfig, 
  DeepPartial, 
  Score,
} from '../types';
import { mergeRiffConfig } from '../utils/mergeConfig';
import { generateStaves } from '../utils/generateScore';

export interface UseRiffScoreResult {
  config: RiffScoreConfig;
  initialScore: Score;
}

/**
 * Hook that processes RiffScore configuration and derives initial score.
 * 
 * Logic:
 * 1. Merge user config with defaults
 * 2. If config.score.staves is provided, use it directly (Render Mode)
 * 3. Otherwise, generate staves from template (Generator Mode)
 */
export const useRiffScore = (
  userConfig: DeepPartial<RiffScoreConfig> = {}
): UseRiffScoreResult => {
  // 1. Merge with defaults
  const config = useMemo(
    () => mergeRiffConfig(userConfig),
    [userConfig]
  );

  // 2. Derive initial score
  const initialScore = useMemo((): Score => {
    const { score: scoreConfig } = config;

    // Render Mode: Use explicit staves if provided
    if (scoreConfig.staves && scoreConfig.staves.length > 0) {
      return {
        title: scoreConfig.title,
        timeSignature: scoreConfig.timeSignature,
        keySignature: scoreConfig.keySignature,
        bpm: scoreConfig.bpm,
        staves: scoreConfig.staves,
      };
    }

    // Generator Mode: Generate staves from template
    const template = scoreConfig.staff ?? 'grand';
    const measureCount = scoreConfig.measureCount ?? 2;
    const generatedStaves = generateStaves(
      template,
      measureCount,
      scoreConfig.keySignature
    );

    return {
      title: scoreConfig.title,
      timeSignature: scoreConfig.timeSignature,
      keySignature: scoreConfig.keySignature,
      bpm: scoreConfig.bpm,
      staves: generatedStaves,
    };
  }, [config]);

  return { config, initialScore };
};
