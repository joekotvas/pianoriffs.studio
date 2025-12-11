import { useCallback, RefObject } from 'react';
import { canAddEventToMeasure } from '../utils/validation';
import { Score, getActiveStaff } from '../types';
import { Command } from '../commands/types';
import { AddRestCommand } from '../commands/AddRestCommand';

interface UseRestActionsProps {
  /** Ref to current score state */
  scoreRef: RefObject<Score>;
  /** Current active duration from toolbar */
  activeDuration: string;
  /** Whether dotted modifier is active */
  isDotted: boolean;
  /** Quants per measure for current time signature */
  currentQuantsPerMeasure: number;
  /** Command dispatch function */
  dispatch: (command: Command) => void;
}

interface UseRestActionsReturn {
  /** Add a rest to the specified measure */
  addRestToMeasure: (
    measureIndex: number,
    staffIndex?: number,
    insertIndex?: number
  ) => void;
}

/**
 * Hook for rest-level actions.
 * 
 * Provides addRestToMeasure for canvas-based rest entry.
 * Reuses validation logic from note actions.
 * 
 * @returns Object containing addRestToMeasure callback
 */
export const useRestActions = ({
  scoreRef,
  activeDuration,
  isDotted,
  currentQuantsPerMeasure,
  dispatch
}: UseRestActionsProps): UseRestActionsReturn => {
  
  /**
   * Adds a rest to the specified measure at the given index.
   * Validates that the measure has capacity for the rest duration.
   * 
   * @param measureIndex - Target measure index
   * @param staffIndex - Staff index (default 0)
   * @param insertIndex - Optional index to insert at (appends if undefined)
   */
  const addRestToMeasure = useCallback((
    measureIndex: number,
    staffIndex: number = 0,
    insertIndex?: number
  ) => {
    const score = scoreRef.current;
    if (!score) return;
    
    const staff = getActiveStaff(score, staffIndex);
    const measure = staff.measures[measureIndex];
    
    if (!measure) return;
    
    // Validate capacity
    if (!canAddEventToMeasure(
      measure.events, 
      activeDuration, 
      isDotted, 
      currentQuantsPerMeasure
    )) {
      return; // Measure is full
    }
    
    dispatch(new AddRestCommand(
      measureIndex,
      activeDuration,
      isDotted,
      insertIndex,
      undefined,
      staffIndex
    ));
  }, [scoreRef, activeDuration, isDotted, currentQuantsPerMeasure, dispatch]);

  return { addRestToMeasure };
};
