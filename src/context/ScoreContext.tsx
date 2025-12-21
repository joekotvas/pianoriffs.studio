import React, { createContext, useContext, ReactNode } from 'react';
import { useScoreLogic } from '@/hooks/useScoreLogic';
import { Score } from '@/types';
import { SetClefCommand } from '@/commands/SetClefCommand';

// Infers the return type of useScoreLogic and extends it with UI state
type ScoreContextType = ReturnType<typeof useScoreLogic> & {
  pendingClefChange: { targetClef: 'treble' | 'bass' } | null;
  setPendingClefChange: React.Dispatch<
    React.SetStateAction<{ targetClef: 'treble' | 'bass' } | null>
  >;
  handleClefChange: (val: string) => void;
};

export const ScoreContext = createContext<ScoreContextType | null>(null);

export const useScoreContext = () => {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScoreContext must be used within a ScoreProvider');
  }
  return context;
};

interface ScoreProviderProps {
  children: ReactNode;
  initialScore?: Partial<Score>;
}

export const ScoreProvider: React.FC<ScoreProviderProps> = ({ children, initialScore }) => {
  const logic = useScoreLogic(initialScore);

  // UI State for Clef Confirmation (moved from ScoreEditor)
  const [pendingClefChange, setPendingClefChange] = React.useState<{
    targetClef: 'treble' | 'bass';
  } | null>(null);

  // Access grouped API
  const setGrandStaff = logic.measures.setGrandStaff;
  const dispatch = logic.engines.dispatch;
  const score = logic.state.score;
  const staffCount = score.staves.length;

  const handleClefChange = React.useCallback(
    (val: string) => {
      const newClef = String(val).trim();
      if (newClef === 'grand') {
        setGrandStaff(true);
      } else if (staffCount >= 2) {
        // Switching from grand staff to single clef - show confirmation
        setPendingClefChange({ targetClef: newClef as 'treble' | 'bass' });
      } else {
        // Single staff - use SetClefCommand to change the clef
        dispatch(new SetClefCommand(newClef as 'treble' | 'bass'));
      }
    },
    [staffCount, setGrandStaff, dispatch]
  );

  const contextValue = React.useMemo(
    () => ({
      ...logic,
      pendingClefChange,
      setPendingClefChange,
      handleClefChange,
    }),
    [logic, pendingClefChange, handleClefChange]
  );

  return <ScoreContext.Provider value={contextValue}>{children}</ScoreContext.Provider>;
};
