/**
 * useFocusScore
 *
 * Focus restore and duration change wrapper handlers.
 * Manages bringing focus back to valid score positions.
 *
 * @see useScoreLogic - Orchestrator that uses these handlers
 */

import { useCallback, RefObject } from 'react';
import { Selection, Score, PreviewNote } from '@/types';
import { getAppendPreviewNote } from '@/utils/interaction';
import { calculateFocusSelection } from '@/utils/focusScore';
import { SetSelectionCommand } from '@/commands/selection';
import { SelectionEngine } from '@/engines/SelectionEngine';

interface UseFocusScoreProps {
  score: Score;
  scoreRef: RefObject<Score>;
  selection: Selection;
  lastSelection: Selection;
  selectionEngine: SelectionEngine;
  setPreviewNote: (note: PreviewNote | null) => void;
  activeDuration: string;
  isDotted: boolean;
  inputMode: 'NOTE' | 'REST';
  editorState: string;
  previewNote: PreviewNote | null;
  modifiers: { handleDurationChange: (duration: string, applyToSelection?: boolean) => void };
  setActiveDuration: (duration: string) => void;
}

interface UseFocusScoreResult {
  /** Restores focus to last known position or first valid position */
  focusScore: () => void;
  /** Handles duration changes with focus restoration for IDLE state */
  handleDurationChangeWrapper: (newDuration: string) => void;
}

/**
 * Focus management handlers.
 *
 * @internal
 */
export const useFocusScore = ({
  score,
  scoreRef,
  selection,
  lastSelection,
  selectionEngine,
  setPreviewNote,
  activeDuration,
  isDotted,
  inputMode,
  editorState,
  previewNote,
  modifiers,
  setActiveDuration,
}: UseFocusScoreProps): UseFocusScoreResult => {
  const handleDurationChangeWrapper = useCallback(
    (newDuration: string) => {
      if (editorState === 'SELECTION_READY') {
        modifiers.handleDurationChange(newDuration, true);
      } else {
        setActiveDuration(newDuration);

        // If IDLE, try to bring focus back to last known position
        if (editorState === 'IDLE' && lastSelection && lastSelection.measureIndex !== null) {
          const staffIndex = lastSelection.staffIndex !== undefined ? lastSelection.staffIndex : 0;
          const staff = scoreRef.current?.staves[staffIndex];
          const measure = staff?.measures[lastSelection.measureIndex];

          if (measure) {
            const newPreview = getAppendPreviewNote(
              measure,
              lastSelection.measureIndex,
              staffIndex,
              newDuration,
              isDotted
            );
            setPreviewNote(newPreview);
          }
        } else if (editorState === 'ENTRY_READY' && previewNote) {
          setPreviewNote({
            ...previewNote,
            duration: newDuration,
          });
        }
      }
    },
    [
      editorState,
      modifiers,
      setActiveDuration,
      lastSelection,
      scoreRef,
      isDotted,
      previewNote,
      setPreviewNote,
    ]
  );

  const focusScore = useCallback(() => {
    const newSelection = calculateFocusSelection(score, selection);

    selectionEngine.dispatch(
      new SetSelectionCommand({
        staffIndex: newSelection.staffIndex,
        measureIndex: newSelection.measureIndex,
        eventId: newSelection.eventId,
        noteId: newSelection.noteId,
        selectedNotes: newSelection.selectedNotes,
        anchor: newSelection.anchor,
      })
    );

    // If focusing on an empty position, create a preview note for ghost cursor
    if (!newSelection.eventId && newSelection.measureIndex !== null) {
      const staff = score.staves[newSelection.staffIndex || 0];
      const measure = staff?.measures[newSelection.measureIndex];
      if (measure) {
        const clef = staff.clef || 'treble';
        const defaultPitch = clef === 'bass' ? 'D3' : 'B4';
        const preview = getAppendPreviewNote(
          measure,
          newSelection.measureIndex,
          newSelection.staffIndex || 0,
          activeDuration,
          isDotted,
          defaultPitch,
          inputMode === 'REST'
        );
        setPreviewNote(preview);
      }
    }
  }, [score, selection, selectionEngine, setPreviewNote, activeDuration, isDotted, inputMode]);

  return {
    focusScore,
    handleDurationChangeWrapper,
  };
};
