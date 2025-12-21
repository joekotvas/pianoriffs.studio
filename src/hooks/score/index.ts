/**
 * Score Hooks Module
 *
 * Re-exports from the score hooks submodule.
 * Maintains backward compatibility with existing imports.
 *
 * @see useScoreLogic - Main orchestrator hook
 */

export { useScoreLogic } from '../useScoreLogic';
export { useDerivedSelection } from './useDerivedSelection';
export { useToolsSync } from './useToolsSync';
export { useFocusScore } from './useFocusScore';
export * from './types';
