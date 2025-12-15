import { TIME_SIGNATURES } from '@/constants';
import { getNoteDuration } from '@/utils/core';
import { getFrequency } from './MusicService';
import { getActiveStaff } from '@/types';

export interface TimelineEvent {
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
  pitch: string; // Pitch notation ("C4", "F#5") for Tone.js
  frequency: number; // Frequency in Hz (legacy/backup)
  type: 'note'; // (Future: 'rest')
  measureIndex: number;
  eventIndex: number; // Keep for legacy reference or fallback
  staffIndex: number;
  quant: number; // Relative quant from start of measure
}

/**
 * Creates a flattened timeline of audio events from the score.
 * Handles timing, ties, and frequency lookup.
 *
 * @param score - The score object
 * @param bpm - Beats per minute
 * @returns Array of TimelineEvents sorted by time
 */
/**
 * Creates a flattened timeline of audio events from the score.
 * Handles timing, ties, and frequency lookup.
 * Refactored to use "Flatten-then-Merge" strategy for cleaner tie resolution.
 *
 * @param score - The score object
 * @param bpm - Beats per minute
 * @returns Array of TimelineEvents sorted by time
 */
export const createTimeline = (score: any, bpm: number): TimelineEvent[] => {
  const timeline: TimelineEvent[] = [];
  const secondsPerBeat = 60 / bpm;
  const secondsPerQuant = secondsPerBeat / 16;

  const staves = score.staves || [getActiveStaff(score)];
  if (staves.length === 0) return [];

  const timeSig = score.timeSignature || '4/4';
  const firstStaffMeasures = staves[0].measures;

  // 1. Calculate Start Times for each Measure (Global Grid)
  const measureStartTimes: number[] = [];
  let currentGlobalTime = 0;

  firstStaffMeasures.forEach((measure: any) => {
    measureStartTimes.push(currentGlobalTime);

    // Calculate duration of this measure
    let measureQuants;
    if (measure.isPickup) {
      measureQuants = measure.events.reduce(
        (acc: number, e: any) => acc + getNoteDuration(e.duration, e.dotted, e.tuplet),
        0
      );
    } else {
      measureQuants = TIME_SIGNATURES[timeSig as keyof typeof TIME_SIGNATURES] || 64;
    }
    currentGlobalTime += measureQuants * secondsPerQuant;
  });

  // Sub-interface for internal processing
  interface RawNoteEvent {
    time: number;
    duration: number;
    pitch: string;
    tied: boolean;
    measureIndex: number;
    eventIndex: number;
    quant: number;
    staffIndex: number;
  }

  // 2. Process each Staff independently
  staves.forEach((staff: any, staffIndex: number) => {
    const rawEvents: RawNoteEvent[] = [];

    // Flatten all notes in this staff
    staff.measures.forEach((measure: any, mIndex: number) => {
      if (mIndex >= measureStartTimes.length) return;
      const measureStartTime = measureStartTimes[mIndex];
      let currentMeasureQuant = 0;

      measure.events.forEach((event: any, eIndex: number) => {
        const eventDurQuants = getNoteDuration(event.duration, event.dotted, event.tuplet);

        event.notes.forEach((note: any) => {
          rawEvents.push({
            time: measureStartTime + currentMeasureQuant * secondsPerQuant,
            duration: eventDurQuants * secondsPerQuant,
            pitch: note.pitch,
            tied: !!note.tied,
            measureIndex: mIndex,
            eventIndex: eIndex,
            quant: currentMeasureQuant,
            staffIndex,
          });
        });

        currentMeasureQuant += eventDurQuants;
      });
    });

    // Sort by Pitch, then Time to group tie chains
    rawEvents.sort((a, b) => {
      if (a.pitch !== b.pitch) return a.pitch.localeCompare(b.pitch);
      return a.time - b.time;
    });

    // Merge Ties (Linear Pass)
    if (rawEvents.length > 0) {
      let current = rawEvents[0];

      for (let i = 1; i < rawEvents.length; i++) {
        const next = rawEvents[i];

        // Check connectivity
        // Must be same pitch (guaranteed by sort usually, but check)
        // Must be 'tied' flag on current
        // Must be adjacent in time (within small epsilon float tolerance)
        const isConnected =
          current.tied &&
          next.pitch === current.pitch &&
          Math.abs(next.time - (current.time + current.duration)) < 0.001;

        if (isConnected) {
          // Merge: Extend duration
          current.duration += next.duration;
          // Inherit tie status from next (if this chain continues)
          current.tied = next.tied;
        } else {
          // Push finished event
          addEventToTimeline(current);
          current = next;
        }
      }
      // Push final event
      addEventToTimeline(current);
    }
  });

  function addEventToTimeline(raw: RawNoteEvent) {
    const freq = getFrequency(raw.pitch);
    if (freq) {
      timeline.push({
        time: raw.time,
        duration: raw.duration,
        pitch: raw.pitch,
        frequency: freq,
        type: 'note',
        measureIndex: raw.measureIndex,
        eventIndex: raw.eventIndex,
        staffIndex: raw.staffIndex,
        quant: raw.quant,
      });
    }
  }

  // Sort by time (interleave staves)
  return timeline.sort((a, b) => a.time - b.time);
};
