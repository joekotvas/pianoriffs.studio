import { useState, useCallback } from 'react';

export const useHistory = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const pushState = useCallback((newState: T) => {
    setHistory(prev => [...prev, state]);
    setRedoStack([]);
    setState(newState);
  }, [state]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setRedoStack(prev => [state, ...prev]);
    setHistory(newHistory);
    setState(previous);
  }, [history, state]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    
    setHistory(prev => [...prev, state]);
    setRedoStack(newRedoStack);
    setState(next);
  }, [redoStack, state]);

  return {
    state,
    setState: pushState, // Default setter pushes to history
    setInternalState: setState, // Setter that doesn't push to history (if needed)
    undo,
    redo,
    history,
    redoStack,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0
  };
};
