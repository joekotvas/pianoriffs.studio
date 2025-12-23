import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import {
  initTone,
  scheduleTonePlayback,
  stopTonePlayback,
  setInstrument as toneSetInstrument,
  isPlaying as toneIsPlaying,
  InstrumentType,
} from '@/engines/toneEngine';
import { createTimeline } from '@/services/TimelineService';
import { logger, LogLevel } from '@/utils/debug';

/**
 * Playback method names provided by this factory
 */
type PlaybackMethodNames = 'play' | 'pause' | 'stop' | 'rewind' | 'setInstrument';

/**
 * Internal state for playback (not stored in Score)
 * Used for resume functionality
 */
let lastPlayPosition = { measureIndex: 0, quant: 0 };
let isInitialized = false;

/**
 * Factory for creating Playback API methods.
 * Handles playback controls and transport via toneEngine.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for playback
 */
export const createPlaybackMethods = (
  ctx: APIContext
): Pick<MusicEditorAPI, PlaybackMethodNames> & ThisType<MusicEditorAPI> => {
  /**
   * Ensures Tone.js is initialized before playback.
   * Must be called from user gesture context (click/tap).
   */
  const ensureInit = async (): Promise<void> => {
    if (isInitialized) return;
    await initTone();
    isInitialized = true;
  };

  return {
    async play(startMeasure, startQuant) {
      await ensureInit();

      // Use provided start position, or resume from last, or start from beginning
      const measureIndex = startMeasure ?? lastPlayPosition.measureIndex;
      const quant = startQuant ?? lastPlayPosition.quant;

      // Save for potential resume
      lastPlayPosition = { measureIndex, quant };

      const score = ctx.getScore();
      const bpm = score.bpm || 120;

      // Generate timeline
      const timeline = createTimeline(score, bpm);

      // Find start time offset
      let startTimeOffset = 0;
      const startEvent = timeline.find(
        (e) => e.measureIndex >= measureIndex && (e.measureIndex > measureIndex || e.quant >= quant)
      );

      if (startEvent) {
        startTimeOffset = startEvent.time;
      }

      // Schedule playback
      scheduleTonePlayback(
        timeline,
        bpm,
        startTimeOffset,
        // Position update callback - store for potential resume
        (m, q) => {
          lastPlayPosition = { measureIndex: m, quant: q };
        },
        // Completion callback
        () => {
          lastPlayPosition = { measureIndex: 0, quant: 0 };
        }
      );

      return this;
    },

    pause() {
      // Stop transport but retain position for resume
      stopTonePlayback();
      // lastPlayPosition is already updated during playback
      return this;
    },

    stop() {
      stopTonePlayback();
      // Reset to beginning
      lastPlayPosition = { measureIndex: 0, quant: 0 };
      return this;
    },

    rewind(measureNum = 0) {
      // Stop any current playback
      const wasPlaying = toneIsPlaying();
      stopTonePlayback();

      // Reset position
      lastPlayPosition = { measureIndex: measureNum, quant: 0 };

      // If was playing, restart from new position
      if (wasPlaying) {
        // Use setTimeout to allow stop to complete
        setTimeout(() => {
          this.play(measureNum, 0);
        }, 0);
      }

      return this;
    },

    setInstrument(instrumentId) {
      // Valid instruments matching InstrumentType
      const validInstruments: InstrumentType[] = ['bright', 'mellow', 'organ', 'piano'];

      if (!validInstruments.includes(instrumentId as InstrumentType)) {
        logger.log(
          `[RiffScore API] setInstrument failed: Invalid instrument '${instrumentId}'. Valid instruments: ${validInstruments.join(', ')}`,
          undefined,
          LogLevel.WARN
        );
        return this;
      }

      toneSetInstrument(instrumentId as InstrumentType);
      return this;
    },
  };
};

/**
 * Resets internal playback state (for testing)
 */
export const resetPlaybackState = (): void => {
  lastPlayPosition = { measureIndex: 0, quant: 0 };
  isInitialized = false;
};
