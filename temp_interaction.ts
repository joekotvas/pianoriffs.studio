import { navigateSelection, calculateTotalQuants, getNoteDuration } from './core';
import { movePitchVisual } from '../services/MusicService';
import { CONFIG } from '../config';

/**
 * Calculates the next selection state based on navigation direction.
 * Handles standard navigation, ghost note navigation, and boundary checks.
 * 
 * @param measures - The current measures of the score
 * @param selection - The current selection state
 * @param direction - The direction of navigation ('left', 'right', 'up', 'down')
 * @param previewNote - The current preview note state (ghost cursor)
 * @param activeDuration - The currently active note duration
 * @param isDotted - Whether the currently active note is dotted
 * @param currentQuantsPerMeasure - The number of quants per measure
 * @returns An object containing the new selection, new previewNote, and optional audio feedback
 */
export const calculateNextSelection = (
    measures: any[],
    selection: any,
    direction: string,
    previewNote: any,
    activeDuration: string,
    isDotted: boolean,
    currentQuantsPerMeasure: number = CONFIG.quantsPerMeasure,
    clef: string = 'treble',
    staffIndex: number = 0
) => {
    // 1. Handle Navigation from Preview Note (Ghost Note)
    if (selection.eventId === null && previewNote && direction === 'left') {
        const measureIndex = previewNote.measureIndex;
        const measure = measures[measureIndex];
        if (measure && measure.events.length > 0) {
            // Select last event of current measure
            const lastEvent = measure.events[measure.events.length - 1];
            return {
                selection: { staffIndex, measureIndex, eventId: lastEvent.id, noteId: lastEvent.notes[0].id },
                previewNote: null,
                audio: { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted }
            };
        } else if (measureIndex > 0) {
            // Select last event of previous measure
            const prevMeasure = measures[measureIndex - 1];
            if (prevMeasure && prevMeasure.events.length > 0) {
                const lastEvent = prevMeasure.events[prevMeasure.events.length - 1];
                return {
                    selection: { staffIndex, measureIndex: measureIndex - 1, eventId: lastEvent.id, noteId: lastEvent.notes[0].id },
                    previewNote: null,
                    audio: { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted }
                };
            }
        }
    }

    // 2. Standard Navigation
    const newSelection = navigateSelection(measures, selection, direction, clef);
    
    if (newSelection !== selection) {
        // Find the event to play audio
        const measure = measures[newSelection.measureIndex];
        let audio = null;
        if (measure) {
            const event = measure.events.find((e: any) => e.id === newSelection.eventId);
            if (event) {
                if (newSelection.noteId) {
                    const note = event.notes.find((n: any) => n.id === newSelection.noteId);
                    if (note) audio = { notes: [note], duration: event.duration, dotted: event.dotted };
                } else {
                    audio = { notes: event.notes, duration: event.duration, dotted: event.dotted };
                }
            }
        }
        return { selection: { ...newSelection, staffIndex }, previewNote: null, audio };
    } 
    
    // 3. Handle Navigation Beyond Last Event (to Ghost Note or New Measure)
    if (direction === 'right' && selection.measureIndex !== null) {
        const currentMeasure = measures[selection.measureIndex];
        const eventIdx = currentMeasure.events.findIndex((e: any) => e.id === selection.eventId);
        
        if (eventIdx === currentMeasure.events.length - 1) {
            // We are at the last event, try to move to ghost note
            const totalQuants = calculateTotalQuants(currentMeasure.events);
            const currentEvent = currentMeasure.events[eventIdx];
            const pitch = currentEvent ? currentEvent.notes[0].pitch : 'C4';

            if (totalQuants < currentQuantsPerMeasure) {
                // Move to ghost note in current measure
                return {
                    selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
                    previewNote: {
                        measureIndex: selection.measureIndex,
                        staffIndex,
                        quant: totalQuants,
                        visualQuant: totalQuants,
                        pitch: pitch,
                        duration: activeDuration,
                        dotted: isDotted,
                        mode: 'APPEND',
                        index: currentMeasure.events.length
                    },
                    audio: null
                };
            } else {
                 // Move to next measure
                 const nextMeasureIndex = selection.measureIndex + 1;
                 // Check if next measure exists, if not we signal to create it
                 const shouldCreateMeasure = nextMeasureIndex >= measures.length;
                 
                 return {
                     selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
                     previewNote: {
                         measureIndex: nextMeasureIndex,
                         staffIndex,
                         quant: 0,
                         visualQuant: 0,
                         pitch: pitch,
                         duration: activeDuration,
                         dotted: isDotted,
                         mode: 'APPEND',
                         index: 0
                     },
                     shouldCreateMeasure,
                     audio: null
                 };
            }
        }
    }

    return null; // No change
};

/**
 * Calculates transposition for selected notes.
 * @param {Array} measures - List of measures
 * @param {Object} selection - Current selection
 * @param {number} steps - Visual steps to move (positive or negative)
 * @param {string} keySignature - Key signature root
 * @returns {Object|null} Object containing new measures and the modified event, or null if no change
 */
export const calculateTransposition = (measures: any[], selection: any, steps: number, keySignature: string = 'C') => {
    const { measureIndex, eventId, noteId } = selection;
    if (measureIndex === null || !eventId) return null;

    const newMeasures = [...measures];
    const measure = { ...newMeasures[measureIndex] };
    const events = [...measure.events];
    const eventIdx = events.findIndex((e: any) => e.id === eventId);
    
    if (eventIdx === -1) return null;
    
    const event = { ...events[eventIdx] };
    const notes = [...event.notes];
    
    const modifyNote = (note: any) => {
        // Use movePitchVisual instead of calculateNewPitch
        const newPitch = movePitchVisual(note.pitch, steps, keySignature);
        return { ...note, pitch: newPitch };
    };

    if (noteId) {
        const noteIdx = notes.findIndex((n: any) => n.id === noteId);
        if (noteIdx !== -1) {
            notes[noteIdx] = modifyNote(notes[noteIdx]);
        }
    } else {
        notes.forEach((n: any, i: number) => {
            notes[i] = modifyNote(n);
        });
    }
    
    event.notes = notes;
    events[eventIdx] = event;
    measure.events = events;
    newMeasures[measureIndex] = measure;
    
    return { measures: newMeasures, event };
};

/**
 * Calculates transposition for selected notes or the preview note.
 * 
 * @param measures - The current measures of the score
 * @param selection - The current selection state
 * @param previewNote - The current preview note state
 * @param direction - The direction of transposition ('up', 'down')
 * @param isShift - Whether shift key is pressed (octave jump)
 * @param keySignature - The current key signature (default 'C')
 * @returns An object containing the new measures (if changed), new previewNote (if changed), and audio feedback
 */
export const calculateTranspositionWithPreview = (
    measures: any[],
    selection: any,
    previewNote: any,
    direction: string,
    isShift: boolean,
    keySignature: string = 'C'
) => {
    // Determine steps (Visual Movement)
    // Up = 1, Down = -1. Shift = 7 (Octave)
    let steps = direction === 'up' ? 1 : -1;
    if (isShift) steps *= 7;

    // 1. Handle Preview Note (Ghost Note)
    if (selection.eventId === null && previewNote) {
        const newPitch = movePitchVisual(previewNote.pitch, steps, keySignature);
        if (newPitch !== previewNote.pitch) {
            return {
                previewNote: { ...previewNote, pitch: newPitch },
                audio: { notes: [{ pitch: newPitch }], duration: previewNote.duration, dotted: previewNote.dotted }
            };
        }
        return null;
    }

    // 2. Handle Selection Transposition
    const result = calculateTransposition(measures, selection, steps, keySignature);
    
    if (result) {
        const { measures: newMeasures, event } = result;
        let audio = null;
        if (selection.noteId) {
            const note = event.notes.find((n: any) => n.id === selection.noteId);
            if (note) audio = { notes: [note], duration: event.duration, dotted: event.dotted };
        } else {
            audio = { notes: event.notes, duration: event.duration, dotted: event.dotted };
        }
        return { measures: newMeasures, audio };
    }

    return null;
};

