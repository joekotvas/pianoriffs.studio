import { useState, useEffect } from 'react';
import { ScoreEngine } from '@/engines/ScoreEngine';
import { Score } from '@/types';

export const useScoreEngine = (initialScore?: Score) => {
  // Use useState with lazy initializer to create engine instance only once
  const [engine] = useState(() => new ScoreEngine(initialScore));

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
    engine,
  };
};
