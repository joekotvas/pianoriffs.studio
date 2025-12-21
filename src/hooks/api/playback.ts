import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * Factory for creating Playback API methods.
 * Handles playback controls and transport.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for playback
 */
export const createPlaybackMethods = (_ctx: APIContext): Pick<MusicEditorAPI, 'play' | 'pause' | 'stop' | 'rewind' | 'setInstrument'> => {
  // const { scoreRef } = ctx;

  return {
    play() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    pause() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    stop() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    rewind(_measureNum) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setInstrument(_instrumentId) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },
  };
};
