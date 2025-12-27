/**
 * Interaction hooks for user input routing.
 * @module hooks/interaction
 */

// Composition hook
export {
  useInteraction,
  type UseInteractionProps,
  type UseInteractionReturn,
} from './useInteraction';

// Sub-hooks
export { useNavigation } from './useNavigation';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useDragToSelect } from './useDragToSelect';
export { useMeasureInteraction } from './useMeasureInteraction';
export { useScoreInteraction } from './useScoreInteraction';
