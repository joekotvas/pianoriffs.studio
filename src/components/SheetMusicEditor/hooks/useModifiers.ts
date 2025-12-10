import { useCallback, RefObject } from 'react';
import { canModifyEventDuration, canToggleEventDot } from '../utils/validation';
import { getNoteDuration } from '../utils/core';
import { playNote } from '../engines/toneEngine';
import { Score, getActiveStaff, Selection } from '../types';
import { Command } from '../commands/types';
import { UpdateEventCommand } from '../commands/UpdateEventCommand';
import { UpdateNoteCommand } from '../commands/UpdateNoteCommand';

interface UseModifiersProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  currentQuantsPerMeasure: number;
  tools: {
    handleDurationChange: (duration: string) => void;
    handleDotToggle: () => boolean;
    handleAccidentalToggle: (type: 'flat' | 'natural' | 'sharp' | null) => string | null;
    handleTieToggle: () => boolean;
  };
  dispatch: (command: Command) => void;
}

interface UseModifiersReturn {
  handleDurationChange: (newDuration: string, applyToSelection?: boolean) => void;
  handleDotToggle: () => void;
  handleAccidentalToggle: (type: 'flat' | 'natural' | 'sharp' | null) => void;
  handleTieToggle: () => void;
  checkDurationValidity: (targetDuration: string) => boolean;
  checkDotValidity: () => boolean;
}

/**
 * Hook for modifier actions: duration, dot, accidental, and tie toggles.
 */
export const useModifiers = ({
  scoreRef,
  selection,
  currentQuantsPerMeasure,
  tools,
  dispatch
}: UseModifiersProps): UseModifiersReturn => {

  const handleDurationChange = useCallback((newDuration: string, applyToSelection = false) => {
    // Always update the active tool state
    tools.handleDurationChange(newDuration);

    // If requested, try to apply to selection
    if (applyToSelection) {
        // Collect targets: either selectedNotes list or single selection
        const targets: Array<{ measureIndex: number, eventId: string | number, staffIndex: number }> = [];

        if (selection.selectedNotes && selection.selectedNotes.length > 0) {
            selection.selectedNotes.forEach(n => {
                targets.push({ measureIndex: n.measureIndex, eventId: n.eventId, staffIndex: n.staffIndex });
            });
        } else if (selection.measureIndex !== null && selection.eventId) {
            targets.push({ 
                measureIndex: selection.measureIndex, 
                eventId: selection.eventId, 
                staffIndex: selection.staffIndex !== undefined ? selection.staffIndex : 0 
            });
        }

        // Iterate and apply if valid
        targets.forEach(target => {
            const staff = scoreRef.current.staves[target.staffIndex] || getActiveStaff(scoreRef.current);
            const measure = staff.measures[target.measureIndex];
            if (measure && canModifyEventDuration(measure.events, target.eventId, newDuration, currentQuantsPerMeasure)) {
                dispatch(new UpdateEventCommand(target.measureIndex, target.eventId, { duration: newDuration }, target.staffIndex));
            }
        });
    }
  }, [selection, tools, dispatch, scoreRef, currentQuantsPerMeasure]);

  const handleDotToggle = useCallback(() => {
    const newDotted = tools.handleDotToggle();
    
    if (selection.measureIndex !== null && selection.eventId) {
        // Use proper staff index, defaulting to 0
        const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        dispatch(new UpdateEventCommand(selection.measureIndex, selection.eventId, { dotted: newDotted }, staffIdx));
    }
  }, [selection, tools, dispatch]);

  const handleAccidentalToggle = useCallback((type: 'flat' | 'natural' | 'sharp' | null) => {
    // Import dynamically to avoid circular deps - MusicService handles transposition
    const { transposeBySemitones, needsAccidental, getScaleNotes, getPitchClass } = require('../services/MusicService');
    
    if (selection.measureIndex === null || !selection.eventId || !selection.noteId) return;
    
    const currentScore = scoreRef.current;
    
    // Get correct staff based on selection
    const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
    const activeStaff = currentScore.staves[staffIdx] || getActiveStaff(currentScore);
    const keySignature = activeStaff.keySignature || 'C';
    const measure = activeStaff.measures[selection.measureIndex];
    const event = measure?.events.find((e: any) => e.id === selection.eventId);
    const note = event?.notes.find((n: any) => n.id === selection.noteId);
    
    if (!note) return;
    
    const currentPitch = note.pitch; // e.g., "F#4" or "F4"
    let newPitch = currentPitch;
    
    // Parse current pitch: letter, accidental, octave
    const letterMatch = currentPitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
    if (!letterMatch) return;
    
    const letter = letterMatch[1]; // e.g., "F"
    const currentAccidental = letterMatch[2] || ''; // e.g., "#", "b", "##", "bb", or ""
    const octave = letterMatch[3]; // e.g., "4"
    
    if (type === 'sharp') {
      // Add a sharp (or cancel a flat)
      if (currentAccidental === 'b') {
        newPitch = `${letter}${octave}`; // Fb → F
      } else if (currentAccidental === 'bb') {
        newPitch = `${letter}b${octave}`; // Fbb → Fb
      } else if (currentAccidental === '') {
        newPitch = `${letter}#${octave}`; // F → F#
      } else if (currentAccidental === '#') {
        newPitch = `${letter}##${octave}`; // F# → F## (double sharp)
      }
    } else if (type === 'flat') {
      // Add a flat (or cancel a sharp)
      if (currentAccidental === '#') {
        newPitch = `${letter}${octave}`; // F# → F
      } else if (currentAccidental === '##') {
        newPitch = `${letter}#${octave}`; // F## → F#
      } else if (currentAccidental === '') {
        newPitch = `${letter}b${octave}`; // F → Fb
      } else if (currentAccidental === 'b') {
        newPitch = `${letter}bb${octave}`; // Fb → Fbb (double flat)
      }
    } else if (type === 'natural') {
      // Strip all accidentals, return to natural letter
      newPitch = `${letter}${octave}`;
    }
    
    if (newPitch !== currentPitch) {
      // Update the pitch, not the accidental flag
      // Use proper staff index, defaulting to 0
      const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
      dispatch(new UpdateNoteCommand(selection.measureIndex, selection.eventId, selection.noteId, { pitch: newPitch }, staffIdx));
      
      // Play tone to preview change
      if (event) {
        playNote(newPitch);
      }
    }
    
    // Update toolbar state (accidental is now derived from pitch vs key, not stored)
    tools.handleAccidentalToggle(null); // Clear toolbar accidental state
  }, [selection, tools, dispatch, scoreRef]);

  const handleTieToggle = useCallback(() => {
    const newTie = tools.handleTieToggle();
    
    if (selection.measureIndex !== null && selection.eventId && selection.noteId) {
        // Use proper staff index, defaulting to 0
        const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        dispatch(new UpdateNoteCommand(selection.measureIndex, selection.eventId, selection.noteId, { tied: newTie }, staffIdx));
    }
  }, [selection, tools, dispatch]);

  const checkDurationValidity = useCallback((targetDuration: string) => {
    if (selection.measureIndex === null || !selection.eventId) return true;

    const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
    const staff = scoreRef.current.staves[staffIdx];
    if (!staff) return true;
    
    const measure = staff.measures[selection.measureIndex];
    if (!measure) return true;

    return canModifyEventDuration(measure.events, selection.eventId, targetDuration, currentQuantsPerMeasure);
  }, [selection, currentQuantsPerMeasure, scoreRef]);

  const checkDotValidity = useCallback(() => {
    if (selection.measureIndex === null || !selection.eventId) return true;

    const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
    const staff = scoreRef.current.staves[staffIdx];
    if (!staff) return true;

    const measure = staff.measures[selection.measureIndex];
    if (!measure) return true;

    return canToggleEventDot(measure.events, selection.eventId, currentQuantsPerMeasure);
  }, [selection, currentQuantsPerMeasure, scoreRef]);

  return {
    handleDurationChange,
    handleDotToggle,
    handleAccidentalToggle,
    handleTieToggle,
    checkDurationValidity,
    checkDotValidity,
  };
};
