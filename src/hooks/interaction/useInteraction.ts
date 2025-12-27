/**
 * useInteraction - Composition Hook for User Input Routing
 *
 * Bundles `useNavigation` and `useFocusScore` to reduce prop drilling.
 *
 * | Event Type | Sub-hook        | Methods                              |
 * |------------|-----------------|--------------------------------------|
 * | Keyboard   | useNavigation   | move, select, transpose, switchStaff |
 * | Focus      | useFocusScore   | focus, handleDurationInput           |
 *
 * @see useNavigation - Navigation logic
 * @see useFocusScore - Focus logic
 * @see ADR-010 - Composition Hooks pattern
 *
 * @module hooks/interaction/useInteraction
 */

import { RefObject } from 'react';
import { Score, Selection, PreviewNote } from '@/types';
import { Command } from '@/commands/types';
import { SelectionEngine } from '@/engines/SelectionEngine';
import { useNavigation } from './useNavigation';
import { useFocusScore } from '../score/useFocusScore';

export interface UseInteractionProps {
  score: Score;
  scoreRef: RefObject<Score>;
  selection: Selection;
  lastSelection: Selection | null;
  selectionEngine: SelectionEngine;
  select: (
    measureIndex: number | null,
    eventId: string | null,
    noteId: string | null,
    staffIndex?: number,
    options?: { isMulti?: boolean; selectAllInEvent?: boolean; isShift?: boolean }
  ) => void;
  previewNote: PreviewNote | null;
  setPreviewNote: (note: PreviewNote | null) => void;
  activeDuration: string;
  isDotted: boolean;
  inputMode: 'NOTE' | 'REST';
  currentQuantsPerMeasure: number;
  setActiveDuration: (duration: string) => void;
  editorState: string;
  modifiers: { handleDurationChange: (duration: string, applyToSelection?: boolean) => void };
  dispatch: (command: Command) => void;
}

export interface UseInteractionReturn {
  handleNoteSelection: (
    measureIndex: number,
    eventId: string,
    noteId: string | null,
    staffIndex?: number,
    isMulti?: boolean,
    selectAllInEvent?: boolean,
    isShift?: boolean
  ) => void;
  moveSelection: (direction: string, isShift: boolean) => void;
  transposeSelection: (direction: string, isShift: boolean) => void;
  switchStaff: (direction: 'up' | 'down') => void;
  focusScore: () => void;
  handleDurationInput: (newDuration: string) => void;
}

export const useInteraction = ({
  score,
  scoreRef,
  selection,
  lastSelection,
  selectionEngine,
  select,
  previewNote,
  setPreviewNote,
  activeDuration,
  isDotted,
  inputMode,
  currentQuantsPerMeasure,
  setActiveDuration,
  editorState,
  modifiers,
  dispatch,
}: UseInteractionProps): UseInteractionReturn => {
  // Navigation: keyboard/mouse movement
  const { handleNoteSelection, moveSelection, transposeSelection, switchStaff } = useNavigation({
    scoreRef,
    selection,
    select,
    previewNote,
    setPreviewNote,
    activeDuration,
    isDotted,
    currentQuantsPerMeasure,
    dispatch,
    inputMode,
    selectionEngine,
  });

  // Focus: restoration and duration routing
  const { focusScore, handleDurationChangeWrapper } = useFocusScore({
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
  });

  return {
    handleNoteSelection,
    moveSelection,
    transposeSelection,
    switchStaff,
    focusScore,
    handleDurationInput: handleDurationChangeWrapper,
  };
};
