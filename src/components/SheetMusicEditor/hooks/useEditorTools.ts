import { useState } from 'react';

export const useEditorTools = () => {
  const [activeDuration, setActiveDuration] = useState('quarter');
  const [isDotted, setIsDotted] = useState(false);
  const [activeAccidental, setActiveAccidental] = useState<'flat' | 'natural' | 'sharp' | null>(null); // null, 'sharp', 'flat', 'natural'
  const [activeTie, setActiveTie] = useState(false);
  const [isRestMode, setIsRestMode] = useState(false);
  
  // User Preferences (Sticky state)
  const [userSelectedDuration, setUserSelectedDuration] = useState('quarter');
  const [userSelectedDotted, setUserSelectedDotted] = useState(false);

  const handleDurationChange = (newDuration: string) => {
      setActiveDuration(newDuration);
      setUserSelectedDuration(newDuration);
      // Selecting a note duration exits rest mode
      setIsRestMode(false);
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

  const handleRestModeToggle = (duration?: string) => {
      if (duration) {
          // Clicking a rest button sets the duration AND enters rest mode
          setActiveDuration(duration);
          setUserSelectedDuration(duration);
          setIsRestMode(true);
      } else {
          // Toggle rest mode
          setIsRestMode(!isRestMode);
      }
  };

  return {
      activeDuration,
      setActiveDuration,
      isDotted,
      setIsDotted,
      activeAccidental,
      setActiveAccidental,
      activeTie,
      setActiveTie,
      isRestMode,
      setIsRestMode,
      userSelectedDuration,
      userSelectedDotted,
      handleDurationChange,
      handleDotToggle,
      handleAccidentalToggle,
      handleTieToggle,
      handleRestModeToggle
  };
};
