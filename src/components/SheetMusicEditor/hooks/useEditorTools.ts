import { useState, useCallback } from 'react';

/**
 * Input mode for entry - determines whether canvas clicks create notes or rests.
 */
export type InputMode = 'NOTE' | 'REST';

/**
 * Hook for managing editor tool state.
 * 
 * Includes: duration, dot, accidental, tie, and input mode.
 */
export const useEditorTools = () => {
  const [activeDuration, setActiveDuration] = useState('quarter');
  const [isDotted, setIsDotted] = useState(false);
  const [activeAccidental, setActiveAccidental] = useState<'flat' | 'natural' | 'sharp' | null>(null);
  const [activeTie, setActiveTie] = useState(false);
  
  /**
   * Current input mode - 'NOTE' for note entry, 'REST' for rest entry.
   * Syncs automatically with selection composition.
   */
  const [inputMode, setInputMode] = useState<InputMode>('NOTE');
  
  // User Preferences (Sticky state)
  const [userSelectedDuration, setUserSelectedDuration] = useState('quarter');
  const [userSelectedDotted, setUserSelectedDotted] = useState(false);

  const handleDurationChange = (newDuration: string) => {
      setActiveDuration(newDuration);
      setUserSelectedDuration(newDuration);
  };

  const handleDotToggle = () => {
      const newState = !isDotted;
      setIsDotted(newState);
      setUserSelectedDotted(newState);
      return newState;
  };

  const handleAccidentalToggle = (type: 'flat' | 'natural' | 'sharp' | null) => {
      const newState = activeAccidental === type ? null : type;
      setActiveAccidental(newState);
      return newState;
  };

  const handleTieToggle = () => {
      const newState = !activeTie;
      setActiveTie(newState);
      return newState;
  };

  /**
   * Toggles between NOTE and REST input modes.
   */
  const toggleInputMode = useCallback(() => {
      setInputMode(prev => prev === 'NOTE' ? 'REST' : 'NOTE');
  }, []);

  return {
      activeDuration,
      setActiveDuration,
      isDotted,
      setIsDotted,
      activeAccidental,
      setActiveAccidental,
      activeTie,
      setActiveTie,
      userSelectedDuration,
      userSelectedDotted,
      handleDurationChange,
      handleDotToggle,
      handleAccidentalToggle,
      handleTieToggle,
      // New: Input mode
      inputMode,
      setInputMode,
      toggleInputMode
  };
};
