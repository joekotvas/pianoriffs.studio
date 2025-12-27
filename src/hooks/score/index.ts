/**
 * Score state and engine hooks.
 * @module hooks/score
 */

// Core engine
export { useScoreEngine } from './useScoreEngine';
export { useTransactionBatching } from './useTransactionBatching';
export { useHistory } from './useHistory';
export { useSelection } from './useSelection';

// Derived state
export { useDerivedSelection } from './useDerivedSelection';
export { useToolsSync } from './useToolsSync';
export { useFocusScore } from './useFocusScore';

// Types
export * from './types';
