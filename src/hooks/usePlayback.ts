import { useState, useRef, useCallback, useEffect } from 'react';
import { initTone, scheduleTonePlayback, stopTonePlayback, getState, InstrumentState } from '../engines/toneEngine';
import { createTimeline } from '../services/TimelineService';

export const usePlayback = (score: any, bpm: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState<{ measureIndex: number | null; quant: number | null; duration: number }>({ measureIndex: null, quant: null, duration: 0 });
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

  const stopPlayback = useCallback(() => {
    stopTonePlayback();
    setIsPlaying(false);
    setPlaybackPosition({ measureIndex: null, quant: null, duration: 0 });
  }, []);

  const playScore = useCallback(async (startMeasureIndex = 0, startQuant = 0) => {
    await ensureInit();
    stopPlayback();

    setLastPlayStart({ measureIndex: startMeasureIndex, quant: startQuant });
    setIsPlaying(true);
    
    // Generate timeline
    const timeline = createTimeline(score, bpm);
    
    // Find start offset time
    let startTimeOffset = 0;
    const startEvent = timeline.find(e => 
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
      }
    );
  }, [score, bpm, stopPlayback, ensureInit]);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playScore();
    }
  }, [isPlaying, playScore, stopPlayback]);

  return {
    isPlaying,
    playbackPosition,
    playScore,
    stopPlayback,
    handlePlayToggle,
    lastPlayStart,
    instrumentState // Expose for UI (e.g., "Loading piano samples...")
  };
};
