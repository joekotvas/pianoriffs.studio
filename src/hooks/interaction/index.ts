/**
 * Interaction hooks for user input routing.
 *
 * These hooks handle navigation, focus management, and input event routing
 * for the score editor.
 *
 * @module hooks/interaction
 */

// Composition hook (bundles sub-hooks below)
export {
  useInteraction,
  type UseInteractionProps,
  type UseInteractionReturn,
} from './useInteraction';

// Re-export navigation for direct access if needed
export { useNavigation } from '../useNavigation';
