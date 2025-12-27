import { useState, useRef, useCallback } from 'react';
import { Score } from '@/types';
import {
  initTone,
  scheduleTonePlayback,
  stopTonePlayback,
  InstrumentState,
} from '@/engines/toneEngine';
import { createTimeline } from '@/services/TimelineService';

export interface UsePlaybackReturn {
  isPlaying: boolean;
  isActive: boolean; // "Playback Mode" - visible cursor
  playbackPosition: {
    measureIndex: number | null;
    quant: number | null;
    duration: number;
  };
  playScore: (startMeasureIndex?: number, startQuant?: number) => Promise<void>;
  stopPlayback: () => void;
  pausePlayback: () => void;
  handlePlayToggle: () => void;
  exitPlaybackMode: () => void;
  lastPlayStart: { measureIndex: number; quant: number };
  instrumentState: InstrumentState;
}

export const usePlayback = (score: Score, bpm: number): UsePlaybackReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<{
    measureIndex: number | null;
    quant: number | null;
    duration: number;
  }>({ measureIndex: null, quant: null, duration: 0 });
  const [lastPlayStart, setLastPlayStart] = useState({ measureIndex: 0, quant: 0 });
  const [instrumentState, setInstrumentState] = useState<InstrumentState>('initializing');

  const isInitialized = useRef(false);

  // Initialize Tone.js on first user interaction
  const ensureInit = useCallback(async () => {
    if (isInitialized.current) return;

    await initTone((state) => {
      setInstrumentState(state.instrumentState);
    });

    isInitialized.current = true;
  }, []);

  const exitPlaybackMode = useCallback(() => {
    setIsActive(false);
  }, []);

  /*
   * Stop playback and reset position (Stop Button behavior)
   */
  const stopPlayback = useCallback(() => {
    stopTonePlayback();
    setIsPlaying(false);
    // Keep active (cursor visible at 0)
    setIsActive(true);
    setPlaybackPosition({ measureIndex: null, quant: null, duration: 0 });
  }, []);

  /*
   * Pause playback but retain position (Pause Button behavior)
   */
  const pausePlayback = useCallback(() => {
    stopTonePlayback();
    setIsPlaying(false);
    setIsActive(true);
    // Do NOT reset playbackPosition, so cursor stays visible and we can resume
  }, []);

  const playScore = useCallback(
    async (startMeasureIndex = 0, startQuant = 0) => {
      await ensureInit();

      // Stop any existing playback (clears position state if we called stopPlayback,
      // but here we are about to overwrite it anyway)
      stopTonePlayback();

      setLastPlayStart({ measureIndex: startMeasureIndex, quant: startQuant });
      setIsPlaying(true);
      setIsActive(true);

      // Generate timeline
      const timeline = createTimeline(score, bpm);

      // Find start offset time
      let startTimeOffset = 0;
      const startEvent = timeline.find(
        (e) =>
          e.measureIndex >= startMeasureIndex &&
          (e.measureIndex > startMeasureIndex || e.quant >= startQuant)
      );

      if (startEvent) {
        startTimeOffset = startEvent.time;
      }

      scheduleTonePlayback(
        timeline,
        bpm,
        startTimeOffset,
        (measureIndex, quant, duration) => {
          setPlaybackPosition({ measureIndex, quant, duration: duration || 0 });
        },
        () => {
          setIsPlaying(false);
          setPlaybackPosition({ measureIndex: null, quant: null, duration: 0 });
          // Note: Auto-finish typically keeps playback mode active (cursor at start)?
          // Or should it exit? User said "Playing, stopped, or paused".
          // If song finishes, it is "Stopped". So Active=True.
        }
      );
    },
    [score, bpm, ensureInit]
  );


  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      pausePlayback();
    } else {
      // Resume from NEXT event (quant + 1) if valid, otherwise start from beginning
      const resumeMeasure = playbackPosition.measureIndex ?? 0;
      const resumeQuant = (playbackPosition.quant ?? -1) + 1; // +1 to skip to next event
      playScore(resumeMeasure, resumeQuant);
    }
  }, [isPlaying, playScore, pausePlayback, playbackPosition]);

  return {
    isPlaying,
    isActive,
    playbackPosition,
    playScore,
    stopPlayback,
    pausePlayback,
    handlePlayToggle,
    exitPlaybackMode,
    lastPlayStart,
    instrumentState, // Expose for UI (e.g., "Loading piano samples...")
  };
};
