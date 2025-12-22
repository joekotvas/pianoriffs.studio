import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * Playback method names provided by this factory
 */
type PlaybackMethodNames = 'play' | 'pause' | 'stop' | 'rewind' | 'setInstrument';

/**
 * Factory for creating Playback API methods.
 * Handles playback controls and transport.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for playback
 */
export const createPlaybackMethods = (_ctx: APIContext): Pick<MusicEditorAPI, PlaybackMethodNames> & ThisType<MusicEditorAPI> => {
  // const { scoreRef } = ctx;

  return {
    play() {
      // TODO: Implement
      return this;
    },

    pause() {
      // TODO: Implement
      return this;
    },

    stop() {
      // TODO: Implement
      return this;
    },

    rewind(_measureNum) {
      // TODO: Implement
      return this;
    },

    setInstrument(_instrumentId) {
      // TODO: Implement
      return this;
    },
  };
};
