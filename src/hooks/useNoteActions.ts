import { useCallback, RefObject } from 'react';
import { getAppendPreviewNote } from '@/utils/interaction';
import { canAddEventToMeasure } from '@/utils/validation';
import { playNote } from '@/engines/toneEngine';
import { applyKeySignature } from '@/services/MusicService';
import { Note } from 'tonal';
import { Score, getActiveStaff, createDefaultSelection, Selection } from '@/types';
import { Command } from '@/commands/types';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { AddNoteToEventCommand } from '@/commands/AddNoteToEventCommand';
import { AddMeasureCommand } from '@/commands/MeasureCommands';
import { DeleteNoteCommand } from '@/commands/DeleteNoteCommand';
import { DeleteEventCommand } from '@/commands/DeleteEventCommand';
import { ChangePitchCommand } from '@/commands/ChangePitchCommand';

import { InputMode } from './useEditorTools';

interface UseNoteActionsProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  setSelection: React.Dispatch<React.SetStateAction<Selection>>;
  select: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndex?: number, options?: any) => void;
  setPreviewNote: (note: any) => void;
  activeDuration: string;
  isDotted: boolean;
  activeAccidental: 'flat' | 'natural' | 'sharp' | null;
  activeTie: boolean;
  currentQuantsPerMeasure: number;
  dispatch: (command: Command) => void;
  /** Input mode: NOTE or REST */
  inputMode: InputMode;
  // deprecated but currently passed by useScoreLogic before refactor is complete
  syncToolbarState?: any; 
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
  select,
  setPreviewNote,
  activeDuration,
  isDotted,
  activeAccidental,
  activeTie,
  currentQuantsPerMeasure,
  dispatch,
  inputMode
}: UseNoteActionsProps): UseNoteActionsReturn => {

  const handleMeasureHover = useCallback((measureIndex: number | null, hit: any, rawPitch: string, staffIndex: number = 0) => {
    if (measureIndex === null || !hit) {
      // Only clear preview if this call is from the same staff as current preview
      // This prevents staff B's mouseLeave from clearing staff A's preview
      setPreviewNote((prev: any) => {
        if (!prev) return null;
        if (prev.staffIndex === staffIndex) return null;
        return prev; // Different staff, keep current preview
      });
      return;
    }
    
    // If rawPitch is empty (Y position outside pitch range), keep previous preview
    // This prevents "dead zones" where hover does nothing
    if (!rawPitch) {
      return; // Keep existing preview state
    }

    const currentScore = scoreRef.current;
    const currentStaff = getActiveStaff(currentScore, staffIndex);
    const measure = currentStaff.measures[measureIndex];
    
    // --- PITCH CALCULATION ---
    let finalPitch = rawPitch;
    const keySig = currentStaff.keySignature || currentScore.keySignature || 'C';

    if (activeAccidental) {
        // User has explicit tool selected (Flat/Sharp/Natural)
        // Apply ABSOLUTE accidental to the raw letter.
        // e.g. "F4" + "flat" -> "Fb4" (Even in Key of G)
        // e.g. "F4" + "sharp" -> "F#4"
        const note = Note.get(rawPitch);
        if (!note.empty && note.letter && note.oct !== undefined) {
             if (activeAccidental === 'sharp') finalPitch = `${note.letter}#${note.oct}`;
             else if (activeAccidental === 'flat') finalPitch = `${note.letter}b${note.oct}`;
             else if (activeAccidental === 'natural') finalPitch = `${note.letter}${note.oct}`;
        }
    } else {
        // Default: Snap to Key Signature
        // e.g. "F4" in G Major -> "F#4"
        finalPitch = applyKeySignature(rawPitch, keySig);
    }

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
    
    // Build new preview object
    const newPreview = {
      measureIndex: targetMeasureIndex,
      staffIndex,
      quant: 0, 
      visualQuant: 0, 
      pitch: finalPitch,
      duration: activeDuration,
      dotted: isDotted,
      mode: targetMode,
      index: targetIndex,
      eventId: hit.type === 'EVENT' ? hit.eventId : undefined,
      isRest: inputMode === 'REST'
    };
    
    // Only update if preview actually changed to avoid flickering
    setPreviewNote((prev: any) => {
      if (!prev) return newPreview;
      // Compare key fields - for rests, ignore pitch since it's not used
      const pitchMatch = newPreview.isRest ? true : (prev.pitch === newPreview.pitch);
      if (
        prev.measureIndex === newPreview.measureIndex &&
        prev.staffIndex === newPreview.staffIndex &&
        pitchMatch &&
        prev.mode === newPreview.mode &&
        prev.index === newPreview.index &&
        prev.isRest === newPreview.isRest &&
        prev.duration === newPreview.duration &&
        prev.dotted === newPreview.dotted
      ) {
        return prev; // Return same reference to avoid re-render
      }
      return newPreview;
    });
  }, [activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, setPreviewNote, activeAccidental, inputMode]);

  const addNoteToMeasure = useCallback((measureIndex: number, newNote: any, shouldAutoAdvance = false, placementOverride: any = null) => {
    const currentScore = scoreRef.current;
    // Use staff from newNote (preview) if available, otherwise selection
    const currentStaffIndex = newNote.staffIndex !== undefined ? newNote.staffIndex : selection.staffIndex;
    const currentStaffData = getActiveStaff(currentScore, currentStaffIndex);
    
    const newMeasures = [...currentStaffData.measures];
    
    // Ensure measure exists (though Command handles logic usually)
    
    const targetMeasure = { ...newMeasures[measureIndex] };
    if (!targetMeasure.events) targetMeasure.events = [];
    
    // Determine placement
    let insertIndex = targetMeasure.events.length;
    let mode = 'APPEND';
    
    if (placementOverride) {
        mode = placementOverride.mode;
        insertIndex = placementOverride.index;
    } else if (newNote.mode) {
        mode = newNote.mode;
        insertIndex = newNote.index;
    }
    
    // Check capacity
    if (mode !== 'CHORD' && !canAddEventToMeasure(targetMeasure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
        if (shouldAutoAdvance && measureIndex === currentStaffData.measures.length - 1) {
            // Auto-create new measure via Command
            dispatch(new AddMeasureCommand());
            // Recursive call will now target the new measure
            addNoteToMeasure(measureIndex + 1, { ...newNote, staffIndex: currentStaffIndex }, false, { mode: 'APPEND', index: 0 });
            return;
        } else {
            // Cannot add
            return;
        }
    }

    // Resolve Event ID for CHORD mode
    const targetEventId = placementOverride?.eventId || newNote.eventId || (mode === 'CHORD' && targetMeasure.events[insertIndex]?.id);

    if (mode === 'CHORD' && targetEventId) {
        // Add note to existing event (only for notes, not rests)
        if (inputMode === 'REST') {
            // Cannot add rest as chord - rests are standalone events
            return;
        }
        const noteToAdd = {
            id: Date.now() + 1,
            pitch: newNote.pitch,
            accidental: activeAccidental,
            tied: activeTie
        };
        dispatch(new AddNoteToEventCommand(measureIndex, targetEventId, noteToAdd, currentStaffIndex));
        
        // Update selection to the new note
        select(measureIndex, targetEventId, noteToAdd.id, currentStaffIndex);
        setPreviewNote(null);
    } else {
        // NEW EVENT (note or rest) - unified path
        const eventId = Date.now().toString();
        const isRest = inputMode === 'REST';
        
        // Build note payload (null for rests)
        const notePayload = isRest ? null : {
            id: Date.now() + 1,
            pitch: newNote.pitch,
            accidental: activeAccidental,
            tied: activeTie
        };
        
        // Determine the noteId for selection tracking
        const noteId = isRest ? `${eventId}-rest` : notePayload!.id;
        
        dispatch(new AddEventCommand(
            measureIndex,
            isRest,
            notePayload,
            activeDuration,
            isDotted,
            mode === 'INSERT' ? insertIndex : undefined,
            eventId,
            currentStaffIndex
        ));

        // Update selection history only (mimics consistent behavior for both)
        select(measureIndex, eventId, noteId, currentStaffIndex, { onlyHistory: true });
        setPreviewNote(null);
    }

    // Only play sound for notes, not rests
    if (inputMode === 'NOTE') {
        playNote(newNote.pitch);
    }
    
    if (shouldAutoAdvance && mode === 'APPEND') {
        const simulatedEvents = [...targetMeasure.events];
        simulatedEvents.push({ 
            id: 'sim-event',
            duration: activeDuration, 
            dotted: isDotted, 
            notes: [{ id: 9999, pitch: newNote.pitch, tied: false }] 
        });
        
        const simulatedMeasure = { ...targetMeasure, events: simulatedEvents };

        const nextPreview = getAppendPreviewNote(
            simulatedMeasure,
            measureIndex,
            currentStaffIndex,
            activeDuration,
            isDotted,
            newNote.pitch,
            inputMode === 'REST' 
        );

        if (nextPreview.quant >= currentQuantsPerMeasure) {
             setPreviewNote({
                 measureIndex: measureIndex + 1,
                 staffIndex: currentStaffIndex,
                 quant: 0,
                 visualQuant: 0,
                 pitch: newNote.pitch,
                 duration: activeDuration,
                 dotted: isDotted,
                 mode: 'APPEND',
                 index: 0
             });
        } else {
             setPreviewNote(nextPreview);
        }
        return;
    }
    
    setPreviewNote(null);
  }, [activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, setPreviewNote, activeAccidental, activeTie, dispatch, selection, select, inputMode]);

  const deleteSelected = useCallback(() => {
    // 1. Delete Multi-Selection
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        const notesToDelete = [...selection.selectedNotes];
        notesToDelete.forEach(note => {
             if (note.noteId) {
                dispatch(new DeleteNoteCommand(note.measureIndex, note.eventId, note.noteId, note.staffIndex));
            } else {
                // If this state is reached (event selected but no noteId?), delete event.
                // But new logic says we always have noteId.
                // However, safe fallback:
                dispatch(new DeleteEventCommand(note.measureIndex, note.eventId, note.staffIndex));
            }
        });
         // Clear selection after delete
         select(null, null, null, selection.staffIndex);
         return;
    }

    if (selection.measureIndex === null || !selection.eventId) return;

    // 2. Delete Single Selection
    if (selection.noteId) {
        dispatch(new DeleteNoteCommand(selection.measureIndex, selection.eventId, selection.noteId, selection.staffIndex));
    } else {
        // Fallback for "event selected" (though effectively caught by multi-select usually if we select all notes)
        dispatch(new DeleteEventCommand(selection.measureIndex, selection.eventId, selection.staffIndex));
    }
    
    select(null, null, null, selection.staffIndex);
  }, [selection, dispatch, select]);

  const addChordToMeasure = useCallback((measureIndex: number, notes: any[], duration: string, dotted: boolean) => {
    if (!notes || notes.length === 0) return;
    
    const eventId = Date.now().toString();
    const firstNote = notes[0];
    
    const noteToAdd = {
        id: Date.now() + 1,
        pitch: firstNote.pitch,
        accidental: firstNote.accidental,
        tied: false
    };
    
    dispatch(new AddEventCommand(
        measureIndex, 
        false,  // isRest = false for chord notes
        noteToAdd, 
        duration, 
        dotted,
        undefined, 
        eventId,
        selection.staffIndex
    ));
    
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
    
    // Select the first note of the chord
    select(measureIndex, eventId, noteToAdd.id, selection.staffIndex);
    setPreviewNote(null);
  }, [dispatch, select, setPreviewNote, selection.staffIndex]);

  const updateNotePitch = useCallback((measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => {
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
