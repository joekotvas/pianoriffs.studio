import { MusicEditorAPI } from '@/api.types';

/**
 * Event method names provided by this factory
 */
type EventMethodNames = 'on';

/**
 * Context required for event subscriptions.
 * Unlike other factories, this receives the `on` function from useAPISubscriptions
 * since event subscriptions require React hooks.
 */
export interface EventsContext {
  /** Pre-built subscription function from useAPISubscriptions */
  on: MusicEditorAPI['on'];
}

/**
 * Factory for creating Events API methods.
 * Wraps the hook-based subscription system for consistency with other factories.
 *
 * NOTE: Event subscriptions require React hooks (useRef, useEffect) to detect
 * state changes and notify listeners. This factory acts as a thin wrapper to
 * maintain architectural consistency while delegating to useAPISubscriptions.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Events context with subscription function
 * @returns Partial API implementation for events
 */
export const createEventsMethods = (
  ctx: EventsContext
): Pick<MusicEditorAPI, EventMethodNames> & ThisType<MusicEditorAPI> => {
  return {
    on: ctx.on,
  };
};
