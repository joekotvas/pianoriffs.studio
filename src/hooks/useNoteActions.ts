import { RefObject } from 'react';
import { Score, Selection } from '@/types';
import { Command } from '@/commands/types';
import { InputMode } from './useEditorTools';
import { useHoverPreview, useNoteEntry, useNoteDelete, useNotePitch, PreviewNote } from './note';
import { NoteInput, PlacementOverride, ChordNoteInput, SelectOptions } from './note/useNoteEntry';
import { HitZone } from '@/engines/layout/types';

/**
 * Props for the useNoteActions hook.
 * @deprecated Use individual hooks from hooks/note/ for new code
 */
export interface UseNoteActionsProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  select: (
    measureIndex: number | null,
    eventId: string | number | null,
    noteId: string | number | null,
    staffIndex?: number,
    options?: SelectOptions
  ) => void;
  setPreviewNote: (
    note: PreviewNote | null | ((prev: PreviewNote | null) => PreviewNote | null)
  ) => void;
  activeDuration: string;
  isDotted: boolean;
  activeAccidental: 'flat' | 'natural' | 'sharp' | null;
  activeTie: boolean;
  currentQuantsPerMeasure: number;
  dispatch: (command: Command) => void;
  inputMode: InputMode;
}

/**
 * Return type for useNoteActions hook.
 *
 * @deprecated For new code, prefer using individual hooks from hooks/note/
 */
export interface UseNoteActionsReturn {
  handleMeasureHover: (
    measureIndex: number | null,
    hit: HitZone | null,
    pitch: string,
    staffIndex?: number
  ) => void;
  addNoteToMeasure: (
    measureIndex: number,
    newNote: NoteInput,
    shouldAutoAdvance?: boolean,
    placementOverride?: PlacementOverride | null
  ) => void;
  addChordToMeasure: (
    measureIndex: number,
    notes: ChordNoteInput[],
    duration: string,
    dotted: boolean
  ) => void;
  deleteSelected: () => void;
  updateNotePitch: (
    measureIndex: number,
    eventId: string | number,
    noteId: string | number,
    newPitch: string
  ) => void;
}

/**
 * Hook for note-level actions: add, delete, chord, and pitch updates.
 *
 * **NOTE:** This is now a facade over focused hooks in `hooks/note/`.
 * For new code, consider using the individual hooks directly:
 * - `useHoverPreview` - Mouse hover and preview
 * - `useNoteEntry` - Note/rest/chord insertion
 * - `useNoteDelete` - Deletion
 * - `useNotePitch` - Pitch updates
 *
 * @deprecated For new code, prefer using individual hooks from hooks/note/
 */
export const useNoteActions = ({
  scoreRef,
  selection,
  select,
  setPreviewNote,
  activeDuration,
  isDotted,
  activeAccidental,
  activeTie,
  currentQuantsPerMeasure,
  dispatch,
  inputMode,
}: UseNoteActionsProps): UseNoteActionsReturn => {
  // Delegate to focused hooks
  const { handleMeasureHover } = useHoverPreview({
    scoreRef,
    setPreviewNote,
    activeDuration,
    isDotted,
    activeAccidental,
    currentQuantsPerMeasure,
    inputMode,
  });

  const { addNoteToMeasure, addChordToMeasure } = useNoteEntry({
    scoreRef,
    selection,
    select,
    setPreviewNote,
    activeDuration,
    isDotted,
    activeAccidental,
    activeTie,
    currentQuantsPerMeasure,
    dispatch,
    inputMode,
  });

  const { deleteSelected } = useNoteDelete({
    selection,
    select,
    dispatch,
  });

  const { updateNotePitch } = useNotePitch({
    selection,
    dispatch,
  });

  return {
    handleMeasureHover,
    addNoteToMeasure,
    addChordToMeasure,
    deleteSelected,
    updateNotePitch,
  };
};
