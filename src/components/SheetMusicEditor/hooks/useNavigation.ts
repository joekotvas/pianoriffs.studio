import React, { useCallback, RefObject } from 'react';
import { Selection, Score, getActiveStaff, createDefaultSelection } from '../types';
import { calculateNextSelection, calculateTranspositionWithPreview, calculateCrossStaffSelection } from '../utils/interaction';
import { toggleNoteInSelection, getLinearizedNotes, calculateNoteRange } from '../utils/selection';
import { playNote } from '../engines/toneEngine';
import { Command } from '../commands/types';
import { AddMeasureCommand } from '../commands/MeasureCommands';
import { TransposeSelectionCommand } from '../commands/TransposeSelectionCommand';

interface UseNavigationProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
  previewNote: any;
  setPreviewNote: (note: any) => void;
  syncToolbarState: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndex?: number) => void;
  activeDuration: string;
  isDotted: boolean;
  currentQuantsPerMeasure: number;
  dispatch: (command: Command) => void;
}

interface UseNavigationReturn {
  handleNoteSelection: (measureIndex: number, eventId: string | number, noteId: string | number | null, staffIndex?: number, isMulti?: boolean) => void;
  moveSelection: (direction: string, isShift: boolean) => void;
  transposeSelection: (direction: string, isShift: boolean) => void;
  switchStaff: (direction: 'up' | 'down') => void;
}

/**
 * Hook for navigation actions: selection, arrow key navigation, and transposition.
 */
export const useNavigation = ({
  scoreRef,
  selection,
  setSelection,
  previewNote,
  setPreviewNote,
  syncToolbarState,
  activeDuration,
  isDotted,
  currentQuantsPerMeasure,
  dispatch
}: UseNavigationProps): UseNavigationReturn => {

  const handleNoteSelection = useCallback((measureIndex: number, eventId: string | number, noteId: string | number | null, staffIndex: number = 0, isMulti: boolean = false) => {
    if (!eventId) { 
       setSelection(prev => ({ ...createDefaultSelection(), staffIndex: prev.staffIndex }));
       syncToolbarState(null, null, null, staffIndex);
       return; 
    }

    setSelection(prev => {
        return toggleNoteInSelection(prev, { staffIndex, measureIndex, eventId, noteId }, isMulti);
    });

    syncToolbarState(measureIndex, eventId, noteId, staffIndex);

    // Play Selection
    // Only play if we are adding it (not toggling off, theoretically, but playing on click is good feedback regardless)
    const measure = getActiveStaff(scoreRef.current, staffIndex).measures[measureIndex];
    if (measure) {
        const event = measure.events.find((e: any) => e.id === eventId);
        if (event) {
            const keySignature = getActiveStaff(scoreRef.current, staffIndex).keySignature || 'C';
            if (noteId) {
                const note = event.notes.find((n: any) => n.id === noteId);
                if (note) playNote(note.pitch);
            } else {
                event.notes.forEach((n: any) => playNote(n.pitch));
            }
        }
    }
  }, [setSelection, syncToolbarState, scoreRef]);

  const moveSelection = useCallback((direction: string, isShift: boolean = false) => {
    // 1. Calculate the new "Focus" point
    const result = calculateNextSelection(
        getActiveStaff(scoreRef.current, selection.staffIndex || 0).measures,
        selection,
        direction,
        previewNote,
        activeDuration,
        isDotted,
        currentQuantsPerMeasure,
        getActiveStaff(scoreRef.current, selection.staffIndex || 0).clef,
        selection.staffIndex || 0
    );

    if (result) {
        if (result.selection) {
            let newSelection = result.selection;

            if (isShift) {
                // ANCHOR LOGIC
                // 1. Establish Anchor if not present (using previous selection as anchor)
                const currentAnchor = selection.anchor || {
                    staffIndex: selection.staffIndex,
                    measureIndex: selection.measureIndex!,
                    eventId: selection.eventId!,
                    noteId: selection.noteId
                };

                // 2. Determine Focus (the NEW selection point)
                const focus = {
                    staffIndex: newSelection.staffIndex,
                    measureIndex: newSelection.measureIndex!,
                    eventId: newSelection.eventId!,
                    noteId: newSelection.noteId
                };

                // 3. Calculate Range
                // We need the WHOLE score to linearize it properly across measures
                // Note: This could be optimized to not linearize on every keypress if performance is an issue,
                // but for typical scores it's fine.
                const linearNotes = getLinearizedNotes(scoreRef.current);
                const range = calculateNoteRange(currentAnchor, focus, linearNotes);

                // 4. Update Selection
                // - Cursor stays at Focus (newSelection)
                // - Anchor persists
                // - selectedNotes = the calculated range
                newSelection = {
                    ...newSelection,
                    anchor: currentAnchor,
                    selectedNotes: range
                };
            } else {
                // STANDARD NAVIGATION
                // Clear anchor and extended selection
                newSelection = {
                    ...newSelection,
                    anchor: null,
                    selectedNotes: []
                };
            }

            setSelection(newSelection);
            
            // Sync toolbar with the new "cursor"
            syncToolbarState(newSelection.measureIndex, newSelection.eventId, newSelection.noteId, newSelection.staffIndex || 0);
        }
        
        if (result.previewNote !== undefined) {
            setPreviewNote(result.previewNote);
        }

        if (result.shouldCreateMeasure) {
             dispatch(new AddMeasureCommand());
        }

        const audio = result.audio;
        if (audio) {
            const keySignature = getActiveStaff(scoreRef.current, selection.staffIndex || 0).keySignature || 'C';
            audio.notes.forEach((n: any) => playNote(n.pitch));
        }
    }
  }, [selection, previewNote, activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, dispatch, setSelection, setPreviewNote, syncToolbarState]);

  const transposeSelection = useCallback((direction: string, isShift: boolean) => {
    // Calculate semitones based on direction and shift
    // Up = 1, Down = -1. Shift = Octave (12)
    let semitones = 0;
    if (direction === 'up') semitones = isShift ? 12 : 1;
    if (direction === 'down') semitones = isShift ? -12 : -1;

    if (semitones === 0) return;

    // Handle Preview Note Transposition (Ghost Note)
    // If no selection exists but a preview note does, we adjust the preview note pitch directly
    if (selection.eventId === null && previewNote) {
        const activeStaff = getActiveStaff(scoreRef.current, selection.staffIndex || 0);
        const result = calculateTranspositionWithPreview(
            activeStaff.measures,
            selection,
            previewNote,
            direction,
            isShift,
            activeStaff.clef
        );
        
        if (result && result.previewNote) {
            setPreviewNote(result.previewNote);
            
            if (result.audio) {
                const keySig = activeStaff.keySignature || 'C';
                result.audio.notes.forEach((n: any) => playNote(n.pitch));
            }
        }
        return;
    }

    // Dispatch command
    const keySignature = getActiveStaff(scoreRef.current).keySignature || 'C';
    dispatch(new TransposeSelectionCommand(selection, semitones, keySignature));

    // Preview audio for selection change
    const activeStaff = getActiveStaff(scoreRef.current, selection.staffIndex || 0);
    if (selection.measureIndex !== null && selection.eventId) {
         // Use the utility just for audio preview
         const result = calculateTranspositionWithPreview(
            activeStaff.measures,
            selection,
            previewNote,
            direction,
            isShift,
            activeStaff.clef
        );
        
        if (result && result.audio) {
            const audio = result.audio;
            const keySig = activeStaff.keySignature || 'C';
            audio.notes.forEach((n: any) => playNote(n.pitch));
        }
    }
  }, [selection, previewNote, scoreRef, dispatch, setPreviewNote]);

  const switchStaff = useCallback((direction: 'up' | 'down') => {
    const numStaves = scoreRef.current.staves?.length || 1;
    if (numStaves <= 1) return; // Can't switch if only one staff
    
    // Try smart cross-staff selection first
    // Try smart cross-staff selection first
    if (selection.eventId) {
        const result = calculateCrossStaffSelection(scoreRef.current, selection, direction, activeDuration, isDotted);
        if (result && result.selection) {
            setSelection(result.selection);
            syncToolbarState(result.selection.measureIndex, result.selection.eventId, result.selection.noteId, result.selection.staffIndex);
            
            // Set Preview Note (Cursor) logic
            if (result.previewNote) {
                setPreviewNote(result.previewNote);
            } else {
                setPreviewNote(null);
            }
            
            // Audio Feedback (Only if we selected an actual event)
            if (result.selection.eventId && result.selection.measureIndex !== null) {
                const staff = getActiveStaff(scoreRef.current, result.selection.staffIndex);
                const measure = staff.measures[result.selection.measureIndex];
                if (measure) {
                    const event = measure.events.find((e: any) => e.id === result.selection.eventId);
                    if (event) {
                        event.notes.forEach((n: any) => playNote(n.pitch));
                    }
                }
            }
            return;
        }
    }

    // Fallback: Just switch staff index
    const currentStaffIndex = selection.staffIndex || 0;
    let newStaffIndex = currentStaffIndex;
    
    if (direction === 'up' && currentStaffIndex > 0) {
      newStaffIndex = currentStaffIndex - 1;
    } else if (direction === 'down' && currentStaffIndex < numStaves - 1) {
      newStaffIndex = currentStaffIndex + 1;
    }
    
    if (newStaffIndex !== currentStaffIndex) {
      setSelection({
        ...createDefaultSelection(),
        staffIndex: newStaffIndex,
        measureIndex: selection.measureIndex,
        eventId: null,
        noteId: null
      });
      syncToolbarState(null, null, null, newStaffIndex);
    }
  }, [selection, scoreRef, setSelection, syncToolbarState]);

  return {
    handleNoteSelection,
    moveSelection,
    transposeSelection,
    switchStaff,
  };
};
