import { useState, useEffect, useRef } from 'react';
import { ScoreEngine } from '@/engines/ScoreEngine';
import { Score } from '@/types';

export const useScoreEngine = (initialScore?: Score) => {
  // Use a ref to hold the engine instance so it persists across renders
  // We only want to create it once.
  const engineRef = useRef<ScoreEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new ScoreEngine(initialScore);
  }

  const engine = engineRef.current;

  // Local state to trigger re-renders when the engine state changes
  const [score, setScore] = useState<Score>(engine.getState());

  useEffect(() => {
    // Subscribe to engine changes
    const unsubscribe = engine.subscribe((newScore) => {
      setScore(newScore);
    });

    return () => {
      unsubscribe();
    };
  }, [engine]);

  return {
    score,
    engine
  };
};
