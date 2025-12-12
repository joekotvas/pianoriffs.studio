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

/**
 * Helper to generate the preview note state for appending to a measure.
 */
export const getAppendPreviewNote = (
    measure: any, 
    measureIndex: number, 
    staffIndex: number, 
    activeDuration: string, 
    isDotted: boolean, 
    pitch?: string
) => {
    const totalQuants = calculateTotalQuants(measure.events || []);
    // Default pitch logic: try to use last event's pitch, or fallback
    let defaultPitch = pitch;
    if (!defaultPitch) {
        if (measure.events.length > 0) {
            const lastEvent = measure.events[measure.events.length - 1];
            // Skip rests when determining pitch
            if (!lastEvent.isRest && lastEvent.notes?.length > 0) {
                defaultPitch = lastEvent.notes[0].pitch;
            } else {
                defaultPitch = 'C4'; // Fallback for rests
            }
        } else {
             defaultPitch = 'C4'; // Validation fallback, caller should ideally provide better default based on clef
        }
    }

    return {
        measureIndex,
        staffIndex,
        quant: totalQuants,
        visualQuant: totalQuants,
        pitch: defaultPitch,
        duration: activeDuration,
        dotted: isDotted,
        mode: 'APPEND',
        index: measure.events.length
    };
};

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
            // For rests, noteId is null; for notes, use first note
            const noteId = lastEvent.isRest || !lastEvent.notes?.length ? null : lastEvent.notes[0].id;
            const audio = lastEvent.isRest ? null : { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted };
            return {
                selection: { staffIndex, measureIndex, eventId: lastEvent.id, noteId },
                previewNote: null,
                audio
            };
        } else if (measureIndex > 0) {
            // Select last event of previous measure
            const prevMeasure = measures[measureIndex - 1];
            if (prevMeasure && prevMeasure.events.length > 0) {
                const lastEvent = prevMeasure.events[prevMeasure.events.length - 1];
                const noteId = lastEvent.isRest || !lastEvent.notes?.length ? null : lastEvent.notes[0].id;
                const audio = lastEvent.isRest ? null : { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted };
                return {
                    selection: { staffIndex, measureIndex: measureIndex - 1, eventId: lastEvent.id, noteId },
                    previewNote: null,
                    audio
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
            // Get pitch: from note if available, else default based on clef
            const defaultPitch = clef === 'bass' ? 'D3' : 'B4';
            const pitch = (!currentEvent.isRest && currentEvent.notes?.length > 0) 
                ? currentEvent.notes[0].pitch 
                : defaultPitch;

            if (totalQuants < currentQuantsPerMeasure) {
                // Move to ghost note in current measure
                return {
                    selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
                    previewNote: getAppendPreviewNote(currentMeasure, selection.measureIndex, staffIndex, activeDuration, isDotted, pitch),
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

/**
 * Calculates the cross-staff selection based on quant alignment.
 * Finds the closest event in the target staff that overlaps with the current selection's absolute quant.
 * 
 * @param score - The complete score object
 * @param selection - The current selection state
 * @param direction - 'up' or 'down'
 * @returns {Object|null} New selection object or null if invalid move
 */
export const calculateCrossStaffSelection = (
    score: any, 
    selection: any, 
    direction: string,
    activeDuration: string = 'quarter',
    isDotted: boolean = false
) => {
    const { staffIndex, measureIndex, eventId } = selection;
    if (staffIndex === undefined || measureIndex === null || !eventId) return null;

    const currentStaff = score.staves[staffIndex];
    if (!currentStaff) return null;

    // Determine target staff
    const targetStaffIndex = direction === 'up' ? staffIndex - 1 : staffIndex + 1;
    if (targetStaffIndex < 0 || targetStaffIndex >= score.staves.length) return null;

    const targetStaff = score.staves[targetStaffIndex];
    
    // Get current event to determine Start Quant Offset within the measure
    const currentMeasure = currentStaff.measures[measureIndex];
    if (!currentMeasure) return null;

    let currentQuantStart = 0;
    const currentEvent = currentMeasure.events.find((e: any) => {
        if (e.id === eventId) return true;
        currentQuantStart += getNoteDuration(e.duration, e.dotted, e.tuplet);
        return false;
    });

    if (!currentEvent) return null;

    // Now look at target staff, same measure index assuming sync
    const targetMeasure = targetStaff.measures[measureIndex];
    
    if (!targetMeasure) return null;

    // Find event in target measure that contains currentQuantStart
    let targetEvent = null;
    let targetQuant = 0;
    
    for (const e of targetMeasure.events) {
        const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
        const start = targetQuant;
        const end = targetQuant + duration;
        
        // Check overlap: if currentQuantStart falls within [start, end)
        if (currentQuantStart >= start && currentQuantStart < end) {
            targetEvent = e;
            break;
        }
        targetQuant += duration;
    }

    if (targetEvent) {
         const noteId = targetEvent.notes.length > 0 ? targetEvent.notes[0].id : null;
         
         return {
             selection: {
                staffIndex: targetStaffIndex,
                measureIndex,
                eventId: targetEvent.id,
                noteId,
                selectedNotes: [], // Clear multi-select
                anchor: null // Clear anchor
             },
             previewNote: null
         };
    } else {
        // No event found at this time (Gap or Empty Measure)
        // Fallback to "Append Position" using consistent logic
        
        // Determine Pitch: Default to a "middle" note for the staff clef.
        const clef = targetStaff.clef || 'treble';
        let defaultPitch = 'C4';
        if (clef === 'bass') defaultPitch = 'C3';
        if (clef === 'alto') defaultPitch = 'C4';

        const previewNote = getAppendPreviewNote(
            targetMeasure,
            measureIndex,
            targetStaffIndex,
            activeDuration,
            isDotted,
            defaultPitch
        );

        return {
            selection: {
                staffIndex: targetStaffIndex,
                measureIndex,
                eventId: null,
                noteId: null,
                selectedNotes: [],
                anchor: null
            },
            previewNote
        };
    }
};
