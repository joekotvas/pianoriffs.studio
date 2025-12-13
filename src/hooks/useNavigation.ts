import React, { useCallback, RefObject } from 'react';
import { Selection, Score, getActiveStaff, createDefaultSelection } from '@/types';
import { calculateNextSelection, calculateTranspositionWithPreview, calculateCrossStaffSelection } from '@/utils/interaction';
import { playNote } from '@/engines/toneEngine';
import { Command } from '@/commands/types';
import { AddMeasureCommand } from '@/commands/MeasureCommands';
import { TransposeSelectionCommand } from '@/commands/TransposeSelectionCommand';

interface UseNavigationProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  lastSelection?: Selection | null; // Optional history for navigation resume
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
  select: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndex?: number, options?: any) => void;
  previewNote: any;
  setPreviewNote: (note: any) => void;
  activeDuration: string;
  isDotted: boolean;
  currentQuantsPerMeasure: number;
  dispatch: (command: Command) => void;
  inputMode: 'NOTE' | 'REST';
}

interface UseNavigationReturn {
  handleNoteSelection: (measureIndex: number, eventId: string | number, noteId: string | number | null, staffIndex?: number, isMulti?: boolean, selectAllInEvent?: boolean, isShift?: boolean) => void;
  moveSelection: (direction: string, isShift: boolean) => void;
  transposeSelection: (direction: string, isShift: boolean) => void;
  switchStaff: (direction: 'up' | 'down') => void;
}

export const useNavigation = ({
  scoreRef,
  selection,
  lastSelection,
  setSelection,
  select,
  previewNote,
  setPreviewNote,
  activeDuration,
  isDotted,
  currentQuantsPerMeasure,
  dispatch,
  inputMode
}: UseNavigationProps): UseNavigationReturn => {

  // --- Internal Helpers ---

  /** Plays all notes in a given list or event for auditory feedback. */
  const playAudioFeedback = useCallback((notes: any[]) => {
      notes.forEach(n => playNote(n.pitch));
  }, []);

  // --- Public Handlers ---

  const handleNoteSelection = useCallback((
    measureIndex: number, 
    eventId: string | number, 
    noteId: string | number | null, 
    staffIndex: number = 0, 
    isMulti: boolean = false, 
    selectAllInEvent: boolean = false,
    isShift: boolean = false
  ) => {
    // Delegate entirely to useSelection.select
    select(measureIndex, eventId, noteId, staffIndex, { isMulti, isShift, selectAllInEvent });
  }, [select]);


  const moveSelection = useCallback((direction: string, isShift: boolean = false) => {
    // If no active selection, try to resume from history
    let activeSel = selection;
    if ((!selection.eventId || selection.measureIndex === null) && lastSelection && lastSelection.eventId) {
        activeSel = lastSelection;
    }

    const activeStaff = getActiveStaff(scoreRef.current, activeSel.staffIndex || 0);

    // 1. Calculate the hypothetical next position
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

    // 2. Process Selection Update
    if (navResult.selection) {
        // We use 'select' to update, but navResult returns a raw partial selection.
        // We need to map it to 'select' arguments if possible, OR use setSelection directly 
        // if we trust calculateNextSelection to have done the "derived selection" logic?
        // Actually, calculateNextSelection might return { noteId: null } for events.
        // We need to ensure we don't allow noteId: null.
        
        let targetSelection = navResult.selection;
        
        // Fix up invalid event selections
        if (targetSelection.eventId && !targetSelection.noteId && targetSelection.measureIndex !== null) {
             const m = activeStaff.measures[targetSelection.measureIndex];
             const e = m?.events.find((ev: any) => ev.id === targetSelection.eventId);
             if (e && e.notes.length > 0) {
                 // Select first note? Or last?
                 // Dependent on direction? Too complex for now, safe default: first note.
                 // Actually, if we are moving LEFT/RIGHT, we might want specific logic.
                 // But let's assume 'select' handles the "select all in event" if we pass the right flag?
                 // No, useSelection.select sets 'selectedNotes' for us.
                 
                 // If we use setSelection directly, we bypass useSelection logic unless we duplicate it.
                 // Better to use 'select' if we can. 
                 
                 // But 'select' takes specific arguments.
                 // We can call select() with options.
                 
                 select(
                     targetSelection.measureIndex,
                     targetSelection.eventId,
                     targetSelection.noteId, // Might be null
                     targetSelection.staffIndex,
                     { isShift } 
                 );
             } else {
                 // Empty event? (Rest). select() handles it.
                 select(
                     targetSelection.measureIndex,
                     targetSelection.eventId,
                     targetSelection.noteId,
                     targetSelection.staffIndex,
                     { isShift }
                 );
             }
        } else {
            // Note is specified
             select(
                 targetSelection.measureIndex,
                 targetSelection.eventId,
                 targetSelection.noteId,
                 targetSelection.staffIndex,
                 { isShift }
             );
        }
    }
    
    // 3. Process Side Effects (Preview, Measures, Audio)
    if (navResult.previewNote !== undefined) {
        setPreviewNote(navResult.previewNote);
    }

    if (navResult.shouldCreateMeasure) {
         dispatch(new AddMeasureCommand());
    }

    if (navResult.audio) {
        playAudioFeedback(navResult.audio.notes);
    }
  }, [selection, previewNote, activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, dispatch, select, setPreviewNote, playAudioFeedback, inputMode]);


  const transposeSelection = useCallback((direction: string, isShift: boolean) => {
    // 1. Determine Semitone Shift (Up/Down = +/-1, Shift = +/- Octave)
    let semitones = 0;
    if (direction === 'up') semitones = isShift ? 12 : 1;
    if (direction === 'down') semitones = isShift ? -12 : -1;
    if (semitones === 0) return;

    const activeStaff = getActiveStaff(scoreRef.current, selection.staffIndex || 0);

    // 2. Scenario A: Transposing a "Ghost Note" (Preview Cursor)
    if (selection.eventId === null && previewNote) {
        const previewResult = calculateTranspositionWithPreview(
            activeStaff.measures,
            selection,
            previewNote,
            direction,
            isShift,
            activeStaff.clef
        );
        
        if (previewResult?.previewNote) {
            setPreviewNote(previewResult.previewNote);
            if (previewResult.audio) playAudioFeedback(previewResult.audio.notes);
        }
        return;
    }

    // 3. Scenario B: Transposing Real Selection
    // Dispatch Command
    const keySignature = activeStaff.keySignature || 'C';
    dispatch(new TransposeSelectionCommand(selection, semitones, keySignature));

    // Calculate Audio Preview
    if (selection.measureIndex !== null && selection.eventId) {
         const audioResult = calculateTranspositionWithPreview(
            activeStaff.measures,
            selection,
            previewNote,
            direction,
            isShift,
            activeStaff.clef
        );
        
        if (audioResult?.audio) playAudioFeedback(audioResult.audio.notes);
    }
  }, [selection, previewNote, scoreRef, dispatch, setPreviewNote, playAudioFeedback]);


  const switchStaff = useCallback((direction: 'up' | 'down') => {
    const numStaves = scoreRef.current.staves?.length || 1;
    if (numStaves <= 1) return;
    
    // 1. Attempt Smart Cross-Staff Selection (maintains rhythmic position)
    if (selection.eventId) {
        const crossResult = calculateCrossStaffSelection(scoreRef.current, selection, direction, activeDuration, isDotted);
        
        if (crossResult && crossResult.selection) {
            select(
                crossResult.selection.measureIndex, 
                crossResult.selection.eventId, 
                crossResult.selection.noteId, 
                crossResult.selection.staffIndex
            );
            
            setPreviewNote(crossResult.previewNote || null);

            // Audio Feedback
            if (crossResult.selection.eventId && crossResult.selection.measureIndex !== null) {
                const staff = getActiveStaff(scoreRef.current, crossResult.selection.staffIndex);
                const event = staff.measures[crossResult.selection.measureIndex]?.events.find(e => e.id === crossResult.selection.eventId);
                if (event) playAudioFeedback(event.notes);
            }
            return;
        }
    }

    // 2. Fallback: Simple Staff Index Switch
    const currentIdx = selection.staffIndex || 0;
    let newIdx = currentIdx;
    
    if (direction === 'up' && currentIdx > 0) newIdx--;
    else if (direction === 'down' && currentIdx < numStaves - 1) newIdx++;
    
    if (newIdx !== currentIdx) {
      // Use select to clear properly or set empty selection on new staff
      select(null, null, null, newIdx);
    }
  }, [selection, scoreRef, select, activeDuration, isDotted, playAudioFeedback, setPreviewNote]);

  return {
    handleNoteSelection,
    moveSelection,
    transposeSelection,
    switchStaff,
  };
};
