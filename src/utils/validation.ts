import { CONFIG } from '@/config';
import { getNoteDuration, calculateTotalQuants } from './core';
import { ScoreEvent } from '@/types';

/**
 * Regex pattern for scientific pitch notation.
 * Matches: A-G, optional accidentals (# or b, double sharp ## or double flat bb), octave number (0 or higher)
 * Examples: "C4", "F#5", "Bb3", "G##7", "Ebb2", "C10"
 */
const PITCH_PATTERN = /^[A-G](#{1,2}|b{1,2})?\d+$/;

/**
 * Validates if a pitch string is in valid scientific notation format.
 * 
 * @param pitch - The pitch string to validate (e.g., "C4", "F#5", "Bb3")
 * @returns True if valid scientific notation, false otherwise
 * 
 * @example
 * isValidPitch('C4');    // true
 * isValidPitch('F#5');   // true  
 * isValidPitch('Bb3');   // true
 * isValidPitch('H4');    // false (H is not a valid note)
 * isValidPitch('C');     // false (missing octave)
 * isValidPitch('');      // false
 */
export const isValidPitch = (pitch: string): boolean => {
  if (!pitch || typeof pitch !== 'string') return false;
  return PITCH_PATTERN.test(pitch);
};

/**
 * Checks if a new event with the given duration can fit in the measure.
 * @param events - List of existing events in the measure
 * @param duration - Duration type of the new event
 * @param dotted - Whether the new event is dotted
 * @param maxQuants - Maximum quants allowed in the measure
 * @returns True if it fits, False otherwise
 */
export const canAddEventToMeasure = (
  events: ScoreEvent[],
  duration: string,
  dotted: boolean,
  maxQuants: number = CONFIG.quantsPerMeasure
): boolean => {
  const currentTotal = calculateTotalQuants(events);
  const newDur = getNoteDuration(duration, dotted, undefined);
  return currentTotal + newDur <= maxQuants;
};

/**
 * Checks if modifying an event's duration would cause the measure to overflow.
 * @param events - List of events in the measure
 * @param eventId - ID of the event being modified
 * @param targetDuration - The new duration to check
 * @param maxQuants - Maximum quants allowed in the measure
 * @returns True if valid, False otherwise
 */
export const canModifyEventDuration = (
  events: ScoreEvent[],
  eventId: string | number,
  targetDuration: string,
  maxQuants: number = CONFIG.quantsPerMeasure
): boolean => {
  const eventIndex = events.findIndex((e: ScoreEvent) => e.id === eventId);
  if (eventIndex === -1) return true; // Defensive: If event doesn't exist, we can't strict check

  const currentEvent = events[eventIndex];

  // Calculate total of ALL OTHER events
  const otherEventsQuants = events.reduce((acc: number, e: ScoreEvent, idx: number) => {
    if (idx === eventIndex) return acc;
    return acc + getNoteDuration(e.duration, e.dotted, e.tuplet);
  }, 0);

  // Calculate new duration for THIS event
  const newEventQuants = getNoteDuration(targetDuration, currentEvent.dotted, currentEvent.tuplet);

  return otherEventsQuants + newEventQuants <= maxQuants;
};

/**
 * Checks if toggling an event's dotted status would cause the measure to overflow.
 * @param events - List of events in the measure
 * @param eventId - ID of the event being modified
 * @param maxQuants - Maximum quants allowed in the measure
 * @returns True if valid, False otherwise
 */
export const canToggleEventDot = (
  events: ScoreEvent[],
  eventId: string | number,
  maxQuants: number = CONFIG.quantsPerMeasure
): boolean => {
  const eventIndex = events.findIndex((e: ScoreEvent) => e.id === eventId);
  if (eventIndex === -1) return true;

  const currentEvent = events[eventIndex];

  // Calculate total of ALL OTHER events
  const otherEventsQuants = events.reduce((acc: number, e: ScoreEvent, idx: number) => {
    if (idx === eventIndex) return acc;
    return acc + getNoteDuration(e.duration, e.dotted, e.tuplet);
  }, 0);

  // Calculate new duration for THIS event (with toggled dot)
  const newEventQuants = getNoteDuration(
    currentEvent.duration,
    !currentEvent.dotted,
    currentEvent.tuplet
  );

  return otherEventsQuants + newEventQuants <= maxQuants;
};
