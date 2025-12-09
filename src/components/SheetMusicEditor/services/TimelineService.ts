import { TIME_SIGNATURES } from '../constants';
import { getNoteDuration } from '../utils/core';
import { getFrequency } from './MusicService';
import { getActiveStaff } from '../types';

export interface TimelineEvent {
    time: number;       // Start time in seconds
    duration: number;   // Duration in seconds
    frequency: number;  // Frequency in Hz
    type: 'note';       // (Future: 'rest')
    measureIndex: number;
    eventIndex: number;
    staffIndex: number;
}

/**
 * Creates a flattened timeline of audio events from the score.
 * Handles timing, ties, and frequency lookup.
 * 
 * @param score - The score object
 * @param bpm - Beats per minute
 * @returns Array of TimelineEvents sorted by time
 */
export const createTimeline = (score: any, bpm: number): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    const secondsPerBeat = 60 / bpm; // Beat = Quarter Note usually?
    // In our system, getNoteDuration returns 'quants'. 16 quants = Quarter Note.
    // So 16 quants = 1 beat.
    const secondsPerQuant = secondsPerBeat / 16;
    
    // We iterate all staves to support Grand Staff
    const staves = score.staves || [getActiveStaff(score)];
    
    // Calculate global time offsets for measures (Assuming synchronized measures across staves)
    // We base timing on the first staff, assuming vertical alignment.
    if (staves.length === 0) return [];
    
    const measureStartTimes: number[] = [];
    let currentGlobalTime = 0;
    
    const firstStaffMeasures = staves[0].measures;
    const timeSig = score.timeSignature || '4/4';
    
    // 1. Calculate Start Times for each Measure
    firstStaffMeasures.forEach((measure: any) => {
        measureStartTimes.push(currentGlobalTime);
        
        // Calculate duration of this measure
        let measureQuants;
        if (measure.isPickup) {
             measureQuants = measure.events.reduce((acc: number, e: any) => acc + getNoteDuration(e.duration, e.dotted, e.tuplet), 0);
        } else {
             measureQuants = TIME_SIGNATURES[timeSig as keyof typeof TIME_SIGNATURES] || 64;
        }
        
        currentGlobalTime += (measureQuants * secondsPerQuant);
    });

    // 2. Process each Staff
    staves.forEach((staff: any, staffIndex: number) => {
        const skippedNotes = new Set<string>(); // IDs of notes to skip (tied targets)

        staff.measures.forEach((measure: any, mIndex: number) => {
            if (mIndex >= measureStartTimes.length) return;
            
            const measureStartTime = measureStartTimes[mIndex];
            let currentMeasureQuant = 0;

            measure.events.forEach((event: any, eIndex: number) => {
                const eventDurQuants = getNoteDuration(event.duration, event.dotted, event.tuplet);
                
                // Process Notes
                event.notes.forEach((note: any) => {
                    if (skippedNotes.has(note.id)) return;

                    // Calculate Total Duration (handling ties)
                    let totalQuants = eventDurQuants;
                    let currentNote = note;
                    
                    // Look ahead logic (simplified from audioEngine)
                    // We need to trace the tie chain.
                    let searchMIndex = mIndex;
                    let searchEIndex = eIndex;
                    let tied = currentNote.tied;

                    while (tied) {
                        // Find next event
                        // Move to next event in measure
                        searchEIndex++;
                        
                        // Check overflow
                        if (searchEIndex >= staff.measures[searchMIndex].events.length) {
                             searchMIndex++;
                             searchEIndex = 0;
                        }
                        
                        let foundNext = false;
                        if (searchMIndex < staff.measures.length && searchEIndex < staff.measures[searchMIndex].events.length) {
                            const nextEvent = staff.measures[searchMIndex].events[searchEIndex];
                            const nextNote = nextEvent.notes.find((n: any) => n.pitch === currentNote.pitch);
                            
                            if (nextNote) {
                                totalQuants += getNoteDuration(nextEvent.duration, nextEvent.dotted, nextEvent.tuplet);
                                skippedNotes.add(nextNote.id);
                                currentNote = nextNote; // Continue chain from this note
                                tied = currentNote.tied; // Is the NEW note tied forward?
                                foundNext = true;
                            }
                        }
                        
                        if (!foundNext) break; // Break chain if next note not found
                    }
                    
                    // Add Event
                    const freq = getFrequency(note.pitch);
                    if (freq) {
                        timeline.push({
                            time: measureStartTime + (currentMeasureQuant * secondsPerQuant),
                            duration: totalQuants * secondsPerQuant,
                            frequency: freq,
                            type: 'note',
                            measureIndex: mIndex,
                            eventIndex: eIndex,
                            staffIndex: staffIndex
                        });
                    }
                });

                currentMeasureQuant += eventDurQuants;
            });
        });
    });

    // Sort by time (interleave staves)
    return timeline.sort((a, b) => a.time - b.time);
};
