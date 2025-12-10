import { useCallback, RefObject } from 'react';
import { canAddEventToMeasure } from '../utils/validation';
import { playNote } from '../engines/toneEngine';
import { Score, getActiveStaff } from '../types';
import { Command } from '../commands/types';
import { AddNoteCommand } from '../commands/NoteCommands';
import { AddNoteToEventCommand } from '../commands/AddNoteToEventCommand';
import { AddMeasureCommand } from '../commands/MeasureCommands';
import { DeleteNoteCommand } from '../commands/DeleteNoteCommand';
import { ChangePitchCommand } from '../commands/ChangePitchCommand';

interface UseNoteActionsProps {
  scoreRef: RefObject<Score>;
  selection: { staffIndex: number; measureIndex: number | null; eventId: string | number | null; noteId: string | number | null };
  setSelection: (selection: { staffIndex: number; measureIndex: number | null; eventId: string | number | null; noteId: string | number | null }) => void;
  setPreviewNote: (note: any) => void;
  syncToolbarState: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndex?: number) => void;
  activeDuration: string;
  isDotted: boolean;
  activeAccidental: 'flat' | 'natural' | 'sharp' | null;
  activeTie: boolean;
  currentQuantsPerMeasure: number;
  dispatch: (command: Command) => void;
}

interface UseNoteActionsReturn {
  handleMeasureHover: (measureIndex: number | null, hit: any, pitch: string, staffIndex?: number) => void;
  addNoteToMeasure: (measureIndex: number, newNote: any, shouldAutoAdvance?: boolean, placementOverride?: any) => void;
  addChordToMeasure: (measureIndex: number, notes: any[], duration: string, dotted: boolean) => void;
  deleteSelected: () => void;
  updateNotePitch: (measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => void;
}

/**
 * Hook for note-level actions: add, delete, chord, and pitch updates.
 */
export const useNoteActions = ({
  scoreRef,
  selection,
  setSelection,
  setPreviewNote,
  syncToolbarState,
  activeDuration,
  isDotted,
  activeAccidental,
  activeTie,
  currentQuantsPerMeasure,
  dispatch
}: UseNoteActionsProps): UseNoteActionsReturn => {

  const handleMeasureHover = useCallback((measureIndex: number | null, hit: any, pitch: string, staffIndex: number = 0) => {
    if (measureIndex === null || !hit) {
      setPreviewNote(null);
      return;
    }

    // Checking if we should update selection staff index? 
    // NO. User requested that hovering should NOT change selection.
    // We only update previewNote.

    const currentStaff = getActiveStaff(scoreRef.current, staffIndex);
    const measure = currentStaff.measures[measureIndex];
    
    let targetMeasureIndex = measureIndex;
    let targetIndex = hit.index;
    let targetMode = hit.type === 'EVENT' ? 'CHORD' : (hit.type === 'INSERT' ? 'INSERT' : 'APPEND');

    if (targetMode === 'INSERT' && targetIndex === measure.events.length) {
        targetMode = 'APPEND';
    }

    if (targetMode === 'APPEND') {
        if (!canAddEventToMeasure(measure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
            if (measureIndex === currentStaff.measures.length - 1) {
                targetMeasureIndex = measureIndex + 1;
                targetIndex = 0;
            } else {
                setPreviewNote(null);
                return;
            }
        } else {
            if (measure.events.length > 0) {
                targetMode = 'INSERT';
                targetIndex = measure.events.length;
            }
        }
    } else if (targetMode === 'INSERT') {
           if (!canAddEventToMeasure(measure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
               setPreviewNote(null);
               return;
           }
    }
    
    setPreviewNote({
      measureIndex: targetMeasureIndex,
      staffIndex, // Pass staffIndex to preview note
      quant: 0, 
      visualQuant: 0, 
      pitch,
      duration: activeDuration,
      dotted: isDotted,
      mode: targetMode,
      index: targetIndex
    });
  }, [activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, setPreviewNote]);

  const addNoteToMeasure = useCallback((measureIndex: number, newNote: any, shouldAutoAdvance = false, placementOverride: any = null) => {
    const currentScore = scoreRef.current;
    // Use staff from newNote (preview) if available, otherwise selection
    const currentStaffIndex = newNote.staffIndex !== undefined ? newNote.staffIndex : selection.staffIndex;
    const currentStaffData = getActiveStaff(currentScore, currentStaffIndex);
    
    const newMeasures = [...currentStaffData.measures];
    
    // Ensure measure exists
    if (measureIndex >= newMeasures.length) {
        // This should trigger AddMeasureCommand but that adds to ALL staves now.
        // But here we are just checking existence.
        // If we need to add a measure, we should dispatch AddMeasureCommand.
        // But wait, if we are auto-advancing, we might need to add a measure.
    }
    
    const targetMeasure = { ...newMeasures[measureIndex] };
    if (!targetMeasure.events) targetMeasure.events = [];
    
    // Determine placement
    let insertIndex = targetMeasure.events.length;
    let mode = 'APPEND';
    
    if (placementOverride) {
        mode = placementOverride.mode;
        insertIndex = placementOverride.index;
    }
    
    // Check capacity
    if (mode !== 'CHORD' && !canAddEventToMeasure(targetMeasure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
        if (shouldAutoAdvance && measureIndex === currentStaffData.measures.length - 1) {
            // Auto-create new measure via Command
            dispatch(new AddMeasureCommand());
            // Recursive call will now target the new measure
            // Must propagate the staffIndex in the newNote object for recursive call
            addNoteToMeasure(measureIndex + 1, { ...newNote, staffIndex: currentStaffIndex }, false, { mode: 'APPEND', index: 0 });
            return;
        } else {
            // Cannot add
            return;
        }
    }

    if (mode === 'CHORD' && placementOverride?.eventId) {
        // Add note to existing event
        const noteToAdd = {
            id: Date.now() + 1,
            pitch: newNote.pitch,
            accidental: activeAccidental,
            tied: activeTie
        };
        dispatch(new AddNoteToEventCommand(measureIndex, placementOverride.eventId, noteToAdd, currentStaffIndex));
        setSelection({ ...selection, staffIndex: currentStaffIndex, measureIndex, eventId: placementOverride.eventId, noteId: noteToAdd.id });
        setPreviewNote(null);
    } else {
        // Create new event
        const eventId = Date.now().toString();
        const noteToAdd = {
            id: Date.now() + 1,
            pitch: newNote.pitch,
            accidental: activeAccidental,
            tied: activeTie
        };
        
        dispatch(new AddNoteCommand(
            measureIndex, 
            noteToAdd, 
            activeDuration, 
            isDotted, 
            mode === 'INSERT' ? insertIndex : undefined,
            eventId,
            currentStaffIndex
        ));

        setSelection({ ...selection, staffIndex: currentStaffIndex, measureIndex, eventId, noteId: noteToAdd.id });
        setPreviewNote(null);
    }

    playNote(newNote.pitch);
    
    if (shouldAutoAdvance && mode !== 'CHORD') {
        // Logic for advancing selection would go here or be handled by a separate effect/command
        // For now, we rely on the user to move cursor or the UI to update selection based on new event
    }
    
    setPreviewNote(null);
  }, [activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, setPreviewNote, activeAccidental, activeTie, dispatch, selection, setSelection]);

  const deleteSelected = useCallback(() => {
    if (selection.measureIndex === null || !selection.eventId) return;

    if (selection.noteId) {
        dispatch(new DeleteNoteCommand(selection.measureIndex, selection.eventId, selection.noteId, selection.staffIndex));
    } else {
        // If no specific note selected, delete the whole event? 
        // Or maybe the UI doesn't support event selection without note selection yet.
        // Assuming noteId is present for now based on current UI.
        // If eventId is present but noteId is null, we might want to delete the whole event.
        // DeleteNoteCommand handles "last note deletes event", but if we want to explicitly delete event:
        // We might need a DeleteEventCommand or just pass a dummy noteId if the command supports it.
        // For now, let's assume noteId is required for DeleteNoteCommand as per implementation.
    }
    
    setSelection({ ...selection, measureIndex: null, eventId: null, noteId: null });
  }, [selection, dispatch, setSelection]);

  const addChordToMeasure = useCallback((measureIndex: number, notes: any[], duration: string, dotted: boolean) => {
    if (!notes || notes.length === 0) return;
    
    // Generate ID for the new event so we can add subsequent notes to it
    const eventId = Date.now().toString();
    const firstNote = notes[0];
    
    const noteToAdd = {
        id: Date.now() + 1,
        pitch: firstNote.pitch,
        accidental: firstNote.accidental,
        tied: false
    };
    
    // Add the first note as a new event
    dispatch(new AddNoteCommand(
        measureIndex, 
        noteToAdd, 
        duration, 
        dotted,
        undefined, // Append to end
        eventId,
        selection.staffIndex
    ));
    
    // Add remaining notes to the same event
    for (let i = 1; i < notes.length; i++) {
        const note = notes[i];
        const chordNote = {
            id: Date.now() + 1 + i,
            pitch: note.pitch,
            accidental: note.accidental,
            tied: false
        };
        dispatch(new AddNoteToEventCommand(measureIndex, eventId, chordNote, selection.staffIndex));
    }
    
    setSelection({ ...selection, measureIndex, eventId, noteId: noteToAdd.id });
    setPreviewNote(null);
  }, [dispatch, setSelection, setPreviewNote, selection.staffIndex]);

  const updateNotePitch = useCallback((measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => {
    // Convert eventId and noteId to string if necessary, as Command expects string|number but usually string for IDs
    dispatch(new ChangePitchCommand(measureIndex, eventId, noteId, newPitch, selection.staffIndex));
  }, [dispatch, selection.staffIndex]);

  return {
    handleMeasureHover,
    addNoteToMeasure,
    addChordToMeasure,
    deleteSelected,
    updateNotePitch,
  };
};
