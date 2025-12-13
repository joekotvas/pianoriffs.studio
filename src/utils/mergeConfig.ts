/**
 * Config Merging Utility
 * 
 * Deep merge utility for merging partial RiffScore configs with defaults.
 */

import { RiffScoreConfig, DeepPartial, DEFAULT_RIFF_CONFIG } from '@/types';

/**
 * Checks if a value is a plain object (not array, null, or other type)
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Deep merges source into target, with source values overriding target.
 * Only handles plain objects; arrays are replaced not merged.
 */
function mergeObjects<T>(target: T, source: Partial<T>): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return target;
  }

  const result = { ...target } as T;
  
  for (const key of Object.keys(source)) {
    const sourceVal = (source as Record<string, unknown>)[key];
    const targetVal = (result as Record<string, unknown>)[key];
    
    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      (result as Record<string, unknown>)[key] = mergeObjects(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      (result as Record<string, unknown>)[key] = sourceVal;
    }
  }
  
  return result;
}

/**
 * Merges a partial RiffScore config with the default config.
 * Handles nested objects (ui, interaction, score) correctly.
 */
export const mergeRiffConfig = (
  userConfig: DeepPartial<RiffScoreConfig> = {}
): RiffScoreConfig => {
  const base = { ...DEFAULT_RIFF_CONFIG };
  
  // Merge each top-level section individually for type safety
  return {
    ui: mergeObjects(base.ui, userConfig.ui ?? {}),
    interaction: mergeObjects(base.interaction, userConfig.interaction ?? {}),
    score: mergeObjects(base.score, userConfig.score ?? {}),
  };
};
