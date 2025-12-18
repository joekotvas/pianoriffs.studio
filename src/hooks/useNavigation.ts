import React, { useCallback, RefObject } from 'react';
import { Selection, Score, getActiveStaff } from '@/types';
import {
  calculateNextSelection,
  calculateTranspositionWithPreview,
  calculateCrossStaffSelection,
  calculateVerticalNavigation,
} from '@/utils/interaction';
import { playNote } from '@/engines/toneEngine';
import { Command } from '@/commands/types';
import { AddMeasureCommand } from '@/commands/MeasureCommands';
import { TransposeSelectionCommand } from '@/commands/TransposeSelectionCommand';

interface UseNavigationProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  lastSelection?: Selection | null;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
  select: (
    measureIndex: number | null,
    eventId: string | number | null,
    noteId: string | number | null,
    staffIndex?: number,
    options?: any
  ) => void;
  previewNote: any;
  setPreviewNote: (note: any) => void;
  activeDuration: string;
  isDotted: boolean;
  currentQuantsPerMeasure: number;
  dispatch: (command: Command) => void;
  inputMode: 'NOTE' | 'REST';
}

interface UseNavigationReturn {
  handleNoteSelection: (
    measureIndex: number,
    eventId: string | number,
    noteId: string | number | null,
    staffIndex?: number,
    isMulti?: boolean,
    selectAllInEvent?: boolean,
    isShift?: boolean
  ) => void;
  moveSelection: (direction: string, isShift: boolean) => void;
  transposeSelection: (direction: string, isShift: boolean) => void;
  switchStaff: (direction: 'up' | 'down') => void;
}

export const useNavigation = ({
  scoreRef,
  selection,
  lastSelection,
  select,
  previewNote,
  setPreviewNote,
  activeDuration,
  isDotted,
  currentQuantsPerMeasure,
  dispatch,
  inputMode,
}: UseNavigationProps): UseNavigationReturn => {
  // --- Internal Helpers ---

  const playAudioFeedback = useCallback((notes: any[]) => {
    if (!notes || notes.length === 0) return;
    notes.forEach((n) => playNote(n.pitch));
  }, []);

  // --- Public Handlers ---

  const handleNoteSelection = useCallback(
    (
      measureIndex: number,
      eventId: string | number,
      noteId: string | number | null,
      staffIndex: number = 0,
      isMulti: boolean = false,
      selectAllInEvent: boolean = false,
      isShift: boolean = false
    ) => {
      select(measureIndex, eventId, noteId, staffIndex, { isMulti, isShift, selectAllInEvent });
    },
    [select]
  );

  const moveSelection = useCallback(
    (direction: string, isShift: boolean = false) => {
      const isAtGhostPosition = !selection.eventId || selection.measureIndex === null;

      // Navigation from ghost position now uses calculateNextSelection
      // which finds the actual event to the left using previewNote.quant

      // Determine the "starting point" for calculation
      // For horizontal nav from ghost cursor, use current selection (previewNote has the position)
      // For vertical nav with ghost cursor, use current selection + previewNote
      // Only fall back to lastSelection if NOT at ghost position
      const isVerticalNav = direction === 'up' || direction === 'down';

      // For ghost cursor navigation, always use current selection + previewNote
      // calculateNextSelection will use previewNote.quant for proper positioning
      const activeSel = isAtGhostPosition ? selection : selection;

      const activeStaff = getActiveStaff(scoreRef.current, activeSel.staffIndex || 0);

      // --- 2. Handle Vertical Navigation (CMD+Up/Down) ---
      if (isVerticalNav) {
        const vertResult = calculateVerticalNavigation(
          scoreRef.current,
          activeSel,
          direction as 'up' | 'down',
          activeDuration,
          isDotted,
          previewNote
        );

        if (vertResult) {
          if (vertResult.selection) {
            const { measureIndex, eventId, noteId, staffIndex } = vertResult.selection;
            select(measureIndex, eventId, noteId || null, staffIndex, { isShift });
          }

          if (vertResult.previewNote !== undefined) {
            setPreviewNote(
              vertResult.previewNote ? { ...vertResult.previewNote, source: 'keyboard' } : null
            );
          }

          // Play audio for the newly selected note
          if (vertResult.selection?.eventId && vertResult.selection?.measureIndex !== null) {
            const staff = getActiveStaff(scoreRef.current, vertResult.selection.staffIndex || 0);
            const event = staff.measures[vertResult.selection.measureIndex]?.events.find(
              (e: any) => e.id === vertResult.selection.eventId
            );
            if (event) {
              const noteToPlay = vertResult.selection.noteId
                ? event.notes?.find((n: any) => n.id === vertResult.selection.noteId)
                : event.notes?.[0];
              if (noteToPlay) playAudioFeedback([noteToPlay]);
            }
          }
        }
        return;
      }

      // --- 3. Horizontal Navigation (Left/Right) ---
      const navResult = calculateNextSelection(
        activeStaff.measures,
        activeSel,
        direction,
        previewNote,
        activeDuration,
        isDotted,
        currentQuantsPerMeasure,
        activeStaff.clef,
        activeSel.staffIndex || 0,
        inputMode
      );

      if (!navResult) return;

      // --- 4. Apply Selection Update ---
      if (navResult.selection) {
        const { measureIndex, eventId, noteId, staffIndex } = navResult.selection;

        // Simply pass the calculated target to select().
        // We assume select() handles a null noteId (selecting the whole event/rest) correctly.
        select(measureIndex, eventId, noteId || null, staffIndex, { isShift });
      }

      // --- 5. Handle Side Effects ---
      if (navResult.previewNote !== undefined) {
        // Mark as keyboard-triggered so auto-scroll follows it
        setPreviewNote(
          navResult.previewNote ? { ...navResult.previewNote, source: 'keyboard' } : null
        );
      }

      if (navResult.shouldCreateMeasure) {
        dispatch(new AddMeasureCommand());
      }

      if (navResult.audio) {
        playAudioFeedback(navResult.audio.notes);
      }
    },
    [
      selection,
      previewNote,
      activeDuration,
      isDotted,
      currentQuantsPerMeasure,
      scoreRef,
      dispatch,
      select,
      setPreviewNote,
      playAudioFeedback,
      inputMode,
    ]
  );

  const transposeSelection = useCallback(
    (direction: string, isShift: boolean) => {
      // 1. Determine Semitone Shift
      let semitones = 0;
      if (direction === 'up') semitones = isShift ? 12 : 1;
      if (direction === 'down') semitones = isShift ? -12 : -1;
      if (semitones === 0) return;

      const activeStaff = getActiveStaff(scoreRef.current, selection.staffIndex || 0);

      // 2. Scenario A: Transposing Ghost Note (Preview)
      if (selection.eventId === null && previewNote) {
        const previewResult = calculateTranspositionWithPreview(
          activeStaff.measures,
          selection,
          previewNote,
          direction,
          isShift,
          activeStaff.keySignature || 'C'
        );

        if (previewResult?.previewNote) {
          setPreviewNote({ ...previewResult.previewNote, source: 'keyboard' });
          if (previewResult.audio) playAudioFeedback(previewResult.audio.notes);
        }
        return;
      }

      // 3. Scenario B: Transposing Real Selection
      const keySignature = activeStaff.keySignature || 'C';
      dispatch(new TransposeSelectionCommand(selection, semitones, keySignature));

      // Audio Preview for the change
      if (selection.measureIndex !== null && selection.eventId) {
        const audioResult = calculateTranspositionWithPreview(
          activeStaff.measures,
          selection,
          previewNote,
          direction,
          isShift,
          keySignature
        );

        if (audioResult?.audio) playAudioFeedback(audioResult.audio.notes);
      }
    },
    [selection, previewNote, scoreRef, dispatch, setPreviewNote, playAudioFeedback]
  );

  const switchStaff = useCallback(
    (direction: 'up' | 'down') => {
      const numStaves = scoreRef.current.staves?.length || 1;
      if (numStaves <= 1) return;

      // 1. Smart Cross-Staff Selection
      if (selection.eventId) {
        const crossResult = calculateCrossStaffSelection(
          scoreRef.current,
          selection,
          direction,
          activeDuration,
          isDotted
        );

        if (crossResult?.selection) {
          select(
            crossResult.selection.measureIndex,
            crossResult.selection.eventId,
            crossResult.selection.noteId,
            crossResult.selection.staffIndex
          );

          setPreviewNote(
            crossResult.previewNote ? { ...crossResult.previewNote, source: 'keyboard' } : null
          );

          // Play audio if we landed on a real note
          if (crossResult.selection.eventId) {
            const staff = getActiveStaff(scoreRef.current, crossResult.selection.staffIndex);
            const event = staff.measures[crossResult.selection.measureIndex!]?.events.find(
              (e) => e.id === crossResult.selection.eventId
            );
            if (event) playAudioFeedback(event.notes);
          }
          return;
        }
      }

      // 2. Fallback: Simple Index Switch
      const currentIdx = selection.staffIndex || 0;
      let newIdx = currentIdx;

      if (direction === 'up' && currentIdx > 0) newIdx--;
      else if (direction === 'down' && currentIdx < numStaves - 1) newIdx++;

      if (newIdx !== currentIdx) {
        select(null, null, null, newIdx);
      }
    },
    [selection, scoreRef, select, activeDuration, isDotted, playAudioFeedback, setPreviewNote]
  );

  return {
    handleNoteSelection,
    moveSelection,
    transposeSelection,
    switchStaff,
  };
};
