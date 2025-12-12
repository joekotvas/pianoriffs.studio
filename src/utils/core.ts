import { NOTE_TYPES, TIME_SIGNATURES } from '../constants';
import { CONFIG } from '../config';
import { getMidi, movePitchVisual } from '../services/MusicService';

/**
 * Calculates the duration of a note in quants.
 * @param type - The note type (e.g., 'quarter', 'eighth')
 * @param dotted - Whether the note is dotted (adds 50% duration)
 * @param tuplet - Optional tuplet ratio (e.g., [3, 2] for triplet)
 * @returns Duration in quants
 */
export const getNoteDuration = (
  type: string, 
  dotted: boolean, 
  tuplet?: { ratio: [number, number] }
) => {
  const base = NOTE_TYPES[type].duration;
  const dottedValue = dotted ? base * 1.5 : base;
  
  // Apply tuplet ratio if present
  // ratio[1] / ratio[0] because we're fitting ratio[0] notes into the space of ratio[1]
  // e.g., [3, 2] means 3 notes in space of 2, so each note is 2/3 the normal duration
  if (tuplet) {
    return (dottedValue * tuplet.ratio[1]) / tuplet.ratio[0];
  }
  
  return dottedValue;
};

// New Helper: Calculate total measure duration in quants from Event List
/**
 * Calculates the total duration of a list of events in quants.
 * @param events - List of events
 * @returns Total quants
 */
export const calculateTotalQuants = (events: any[]) => {
    return events.reduce((acc, event) => {
        return acc + getNoteDuration(event.duration, event.dotted, event.tuplet);
    }, 0);
};

// Helper: Decompose quants into valid note durations
/**
 * Decomposes a total number of quants into a list of valid note durations.
 * Used for reflowing measures when time signature changes.
 * @param quants - Total quants to decompose
 * @returns Array of { duration, dotted, quants }
 */
export const getBreakdownOfQuants = (quants: number) => {
    const options = [
      { quants: 64, type: 'whole', dotted: false },
      { quants: 48, type: 'half', dotted: true },
      { quants: 32, type: 'half', dotted: false },
      { quants: 24, type: 'quarter', dotted: true },
      { quants: 16, type: 'quarter', dotted: false },
      { quants: 12, type: 'eighth', dotted: true },
      { quants: 8, type: 'eighth', dotted: false },
      { quants: 6, type: 'sixteenth', dotted: true },
      { quants: 4, type: 'sixteenth', dotted: false },
      { quants: 3, type: 'thirtysecond', dotted: true },
      { quants: 2, type: 'thirtysecond', dotted: false },
      { quants: 1, type: 'sixtyfourth', dotted: false }
    ];

    let remaining = quants;
    const parts = [];

    for (const opt of options) {
        while (remaining >= opt.quants) {
            parts.push({ duration: opt.type, dotted: opt.dotted, quants: opt.quants });
            remaining -= opt.quants;
        }
        if (remaining === 0) break;
    }
    return parts;
};



// --- LOGIC HELPERS ---





/**
 * Reflows the score based on a new time signature.
 * Redistributes events into measures, splitting and tying notes as needed.
 * @param measures - Current measures
 * @param newTimeSignature - New time signature string (e.g., '4/4')
 * @returns New list of measures
 */
export const reflowScore = (measures: any[], newTimeSignature: string) => {
    const maxQuants = TIME_SIGNATURES[newTimeSignature as keyof typeof TIME_SIGNATURES] || 64;
    
    // 1. Identify if first measure is a pickup
    const isPickup = measures.length > 0 && measures[0].isPickup;
    
    // 2. Flatten all events
    const allEvents: any[] = [];
    measures.forEach((m: any) => {
        m.events.forEach((e: any) => {
            // Clone event to avoid mutation issues
            // Reset ties as we will recalculate them
            const event = { 
                ...e, 
                notes: e.notes.map((n: any) => ({ ...n, tied: false })) 
            };
            allEvents.push(event);
        });
    });

    const newMeasures: any[] = [];
    let currentMeasureEvents: any[] = [];
    let currentMeasureQuants = 0;

    const commitMeasure = (isPickupMeasure = false) => {
        newMeasures.push({
            id: Date.now() + Math.random(), // New IDs
            events: currentMeasureEvents,
            isPickup: isPickupMeasure
        });
        currentMeasureEvents = [];
        currentMeasureQuants = 0;
    };

    // 3. Handle Pickup Measure specifically
    if (isPickup) {
        // For pickup, we just take events until we fill it OR until we run out of events that "belong" to it?
        // Actually, reflow usually implies we are changing time signature.
        // If we have a pickup, we should try to keep the *same* events in it if possible, 
        // OR we just fill it up to its current capacity?
        // A pickup measure by definition is incomplete. 
        // Strategy: The first measure IS the pickup. We fill it with events until it is "full" relative to the NEW time signature?
        // NO, a pickup measure is usually *shorter* than the time signature.
        // So we should probably just take the events that were *already* in the pickup measure?
        // But we flattened everything.
        
        // Let's assume we want to preserve the *duration* of the pickup if possible, or just fill it up to the max of the new time sig?
        // If we change 4/4 to 3/4, and pickup was 1 beat. It should stay 1 beat.
        // If we change 4/4 to 3/4, and pickup was 3 beats. It fits.
        // If we change 4/4 to 2/4, and pickup was 3 beats. It overflows.
        
        // BETTER STRATEGY:
        // We need to know which events belonged to the pickup.
        // But we flattened them.
        
        // Let's just take the events from the original first measure.
        const originalPickupEvents = measures[0].events;
        const pickupQuants = calculateTotalQuants(originalPickupEvents);
        
        // We consume events from `allEvents` that match the original pickup's duration (or as much as fits in new time sig)
        // Actually, since we flattened `allEvents`, the first N events are from the pickup.
        
        // We iterate `allEvents`. We fill the first measure until we reach the duration of the original pickup,
        // BUT constrained by `maxQuants` of the new time signature.
        
        let pickupFilled = 0;
        // We need to consume events from the start of allEvents
        // But we are inside a loop below.
        
        // Let's handle pickup separately before the main loop?
        // No, the main loop handles splitting.
        
        // Let's set a "target duration" for the first measure.
        // If isPickup, target = min(originalPickupDuration, maxQuants).
        // Else target = maxQuants.
        
        // Wait, if we just change time sig, we might want to keep the pickup as is.
        // So target = originalPickupDuration.
        // If originalPickupDuration > maxQuants (e.g. 3 beats pickup going to 2/4), then it MUST be split.
        // So target = min(originalPickupDuration, maxQuants).
        
        // However, `reflowScore` is also used when we add/remove notes?
        // If we add a note to a pickup, it grows.
        // If we add a note to a normal measure, it overflows.
        
        // If `reflowScore` is called, it means we want to re-distribute.
        // If we have a pickup, we generally want to preserve it as a distinct container that doesn't accept overflow from previous (none) or give overflow to next (unless it exceeds time sig).
        
        // Actually, if we are just reflowing, we should treat the pickup as a "short measure".
        // But how do we know how short it *should* be?
        // It is defined by its content.
        
        // If we are reflowing because of a Time Sig change:
        // We want to preserve the musical content of the pickup.
        // So we calculate the duration of the original pickup.
        // We fill the new first measure up to that duration.
        // Then we close it and mark it as pickup.
        
        const originalPickupDuration = calculateTotalQuants(measures[0].events);
        const targetPickupDuration = Math.min(originalPickupDuration, maxQuants);
        
        // We need to pull events from `allEvents` until we hit `targetPickupDuration`.
        // Since `allEvents` is ordered, we just process them.
        
        // We need a flag in the loop to know we are filling the pickup.
        
        // Let's modify the loop state.
        var isFillingPickup = true;
        var pickupTarget = targetPickupDuration;
    } else {
        var isFillingPickup = false;
        var pickupTarget = 0;
    }

    // 2. Redistribute events
    allEvents.forEach(event => {
        const eventDuration = getNoteDuration(event.duration, event.dotted, event.tuplet);
        
        // Determine current max for this measure
        let currentMax = maxQuants;
        if (isFillingPickup) {
            currentMax = pickupTarget;
        }
        
        // Does it fit in current measure?
        if (currentMeasureQuants + eventDuration <= currentMax) {
            currentMeasureEvents.push(event);
            currentMeasureQuants += eventDuration;
        } else {
            // Split event
            const available = currentMax - currentMeasureQuants;
            const remaining = eventDuration - available;
            
            // If available is 0, we are full.
            if (available > 0) {
                 const firstParts = getBreakdownOfQuants(available);
                 firstParts.forEach((part) => {
                    const newEvent = {
                        ...event,
                        id: Date.now() + Math.random(),
                        duration: part.duration,
                        dotted: part.dotted,
                        notes: event.notes.map((n: any) => ({ ...n, tied: true })) 
                    };
                    currentMeasureEvents.push(newEvent);
                });
            }
            
            // Commit current measure
            commitMeasure(isFillingPickup);
            
            // If we were filling pickup, we are done with it.
            if (isFillingPickup) {
                isFillingPickup = false;
            }
            
            // Now handle remaining parts
            // We might have remaining > 0.
            if (remaining > 0) {
                 const secondParts = getBreakdownOfQuants(remaining);
                 secondParts.forEach((part) => {
                     const newEvent = {
                        ...event,
                        id: Date.now() + Math.random(),
                        duration: part.duration,
                        dotted: part.dotted,
                        notes: event.notes.map((n: any) => ({ ...n, tied: event.notes[0].tied })) 
                    };
                    
                    // Check if fits in NEW measure (which is standard size)
                    if (currentMeasureQuants + part.quants <= maxQuants) {
                        currentMeasureEvents.push(newEvent);
                        currentMeasureQuants += part.quants;
                    } else {
                        // Overflow again (rare for standard notes)
                        // Just push and let it overflow for now or split again (omitted for brevity)
                        currentMeasureEvents.push(newEvent);
                        currentMeasureQuants += part.quants;
                    }
                 });
            }
        }
    });

    // Commit last measure if not empty
    if (currentMeasureEvents.length > 0) {
        commitMeasure(isFillingPickup); // If we ended while still filling pickup, it's a pickup
    }
    
    // Ensure at least one measure
    if (newMeasures.length === 0) {
        newMeasures.push({ id: Date.now(), events: [], isPickup: isPickup });
    }

    return newMeasures;
};


/**
 * Navigates the selection based on direction.
 * @param {Array} measures - List of measures
 * @param {Object} selection - Current selection { measureIndex, eventId, noteId }
 * @param {string} direction - 'left', 'right', 'up', 'down'
 * @returns {Object} New selection object
 */
/**
 * Helper: Robust check for rest event
 */
export const isRestEvent = (event: any): boolean => {
    return !!event.isRest;
};

/**
 * Helper: Robust check for note event (has at least one pitch)
 */
export const isNoteEvent = (event: any): boolean => {
    return !isRestEvent(event) && event.notes?.length > 0;
};

/**
 * Helper to get noteId for an event.
 * Returns ID for first note (pitch or rest).
 */
export const getFirstNoteId = (event: any): string | number | null => {
    if (!event.notes?.length) return null;
    return event.notes[0].id; // Rests now have notes, so this works for both
};


export const navigateSelection = (measures: any[], selection: any, direction: string, clef: string = 'treble') => {
    const { measureIndex, eventId, noteId } = selection;
    if (measureIndex === null || !eventId) return selection;

    const measure = measures[measureIndex];
    if (!measure) return selection;
    
    const eventIdx = measure.events.findIndex((e: any) => e.id === eventId);
    if (eventIdx === -1) return selection;

    if (direction === 'left') {
        if (eventIdx > 0) {
            const prevEvent = measure.events[eventIdx - 1];
            return { ...selection, eventId: prevEvent.id, noteId: getFirstNoteId(prevEvent) };
        } else if (measureIndex > 0) {
            const prevMeasure = measures[measureIndex - 1];
            if (prevMeasure.events.length > 0) {
                const prevEvent = prevMeasure.events[prevMeasure.events.length - 1];
                return { ...selection, measureIndex: measureIndex - 1, eventId: prevEvent.id, noteId: getFirstNoteId(prevEvent) };
            }
        }
    } else if (direction === 'right') {
        if (eventIdx < measure.events.length - 1) {
            const nextEvent = measure.events[eventIdx + 1];
            return { ...selection, eventId: nextEvent.id, noteId: getFirstNoteId(nextEvent) };
        } else if (measureIndex < measures.length - 1) {
            const nextMeasure = measures[measureIndex + 1];
            if (nextMeasure.events.length > 0) {
                const nextEvent = nextMeasure.events[0];
                return { ...selection, measureIndex: measureIndex + 1, eventId: nextEvent.id, noteId: getFirstNoteId(nextEvent) };
            }
        }
    } else if (direction === 'up' || direction === 'down') {
         const event = measure.events[eventIdx];
         // Only navigate within chord if event has multiple notes
         if (event.notes?.length > 1 && noteId) {
             // Sort notes by pitch to ensure consistent up/down navigation
             const sortedNotes = [...event.notes].sort((a: any, b: any) => {
                 const midiA = getMidi(a.pitch);
                 const midiB = getMidi(b.pitch);
                 return midiA - midiB;
             });
             
             const currentNoteIdx = sortedNotes.findIndex((n: any) => n.id === noteId);
             if (currentNoteIdx !== -1) {
                 // Up = Higher pitch (higher index), Down = Lower pitch (lower index)
                 const newIdx = direction === 'up' ? currentNoteIdx + 1 : currentNoteIdx - 1;
                 if (newIdx >= 0 && newIdx < sortedNotes.length) {
                     return { ...selection, noteId: sortedNotes[newIdx].id };
                 }
             }
         }
    }
    
    return selection;
};

/**
 * Calculates transposition for selected notes.
 * @param {Array} measures - List of measures
 * @param {Object} selection - Current selection
 * @param {string} direction - 'up' or 'down'
 * @param {boolean} isShift - Whether shift is pressed (octave)
 * @param {string} clef - Clef for pitch context
 * @returns {Object|null} Object containing new measures and the modified event, or null if no change
 */

