import { useCallback } from 'react';
import { Score } from '@/types';
import { Command } from '@/commands/types';
import { AddMeasureCommand, DeleteMeasureCommand } from '@/commands/MeasureCommands';
import { TogglePickupCommand } from '@/commands/TogglePickupCommand';
import { SetGrandStaffCommand } from '@/commands/SetGrandStaffCommand';
import { SetTimeSignatureCommand } from '@/commands/SetTimeSignatureCommand';
import { SetKeySignatureCommand } from '@/commands/SetKeySignatureCommand';

interface UseMeasureActionsProps {
  score: Score;
  clearSelection: () => void;
  setPreviewNote: (note: any) => void;
  dispatch: (command: Command) => void;
}

interface UseMeasureActionsReturn {
  handleTimeSignatureChange: (newSig: string) => void;
  handleKeySignatureChange: (newKey: string) => void;
  addMeasure: () => void;
  removeMeasure: () => void;
  togglePickup: () => void;
  setGrandStaff: () => void;
}

/**
 * Hook for measure-level actions: time/key signature changes, add/remove measures.
 */
export const useMeasureActions = ({
  score,
  clearSelection,
  setPreviewNote,
  dispatch,
}: UseMeasureActionsProps): UseMeasureActionsReturn => {
  const handleTimeSignatureChange = useCallback(
    (newSig: string) => {
      if (newSig === score.timeSignature) return;
      dispatch(new SetTimeSignatureCommand(newSig));
      clearSelection();
      setPreviewNote(null);
    },
    [score.timeSignature, dispatch, clearSelection, setPreviewNote]
  );

  const handleKeySignatureChange = useCallback(
    (newKey: string) => {
      if (newKey === score.keySignature) return;
      dispatch(new SetKeySignatureCommand(newKey));
    },
    [score.keySignature, dispatch]
  );

  const addMeasure = useCallback(() => {
    dispatch(new AddMeasureCommand());
  }, [dispatch]);

  const removeMeasure = useCallback(() => {
    dispatch(new DeleteMeasureCommand());
  }, [dispatch]);

  return {
    handleTimeSignatureChange,
    handleKeySignatureChange,
    addMeasure,
    removeMeasure,
    togglePickup: useCallback(() => {
      dispatch(new TogglePickupCommand());
    }, [dispatch]),
    setGrandStaff: useCallback(() => {
      dispatch(new SetGrandStaffCommand());
    }, [dispatch]),
  };
};
