import { getOrderedPitches } from '../constants';
import { getStaffPitch } from './MusicService';

/**
 * Calculates a new pitch based on the current pitch and a direction.
 * Handles shift key for octave jumps.
 * Now handles accidentals - normalizes for staff lookup, preserves accidental.
 * 
 * @param currentPitch - The current pitch (e.g., 'C4', 'F#4', 'Bb3')
 * @param direction - 'up' or 'down'
 * @param isShift - Whether shift key is pressed (for octave jump)
 * @param clef - The current clef ('treble' or 'bass')
 * @returns The new pitch with preserved accidental, or current pitch if out of bounds
 */
export const calculateNewPitch = (
    currentPitch: string, 
    direction: string, 
    isShift: boolean, 
    clef: string = 'treble'
): string => {
    const orderedPitches = getOrderedPitches(clef);
    
    // Extract accidental from current pitch (e.g., F#4 -> "#")
    const match = currentPitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
    const accidental = match?.[2] || '';
    
    // Normalize to staff pitch for lookup (F#4 -> F4)
    const staffPitch = getStaffPitch(currentPitch);
    const currentIndex = orderedPitches.indexOf(staffPitch);
    
    if (currentIndex === -1) {
        // Pitch not in range for this clef
        return currentPitch;
    }

    let delta = direction === 'up' ? 1 : -1;
    if (isShift) delta *= 7;

    const newIndex = Math.max(0, Math.min(orderedPitches.length - 1, currentIndex + delta));
    const newStaffPitch = orderedPitches[newIndex];
    
    // Re-apply accidental to new pitch
    const newMatch = newStaffPitch.match(/^([A-G])(\d+)$/);
    if (newMatch && accidental) {
        return `${newMatch[1]}${accidental}${newMatch[2]}`;
    }
    
    return newStaffPitch;
};

/**
 * Calculates a new pitch based on an offset in steps.
 * Handles accidentals by normalizing for lookup.
 * 
 * @param currentPitch - The starting pitch
 * @param offset - Number of steps (positive = up, negative = down)
 * @param clef - The current clef
 * @returns The new pitch with preserved accidental
 */
export const getPitchByOffset = (
    currentPitch: string, 
    offset: number, 
    clef: string = 'treble'
): string => {
    const orderedPitches = getOrderedPitches(clef);
    
    // Extract accidental from current pitch
    const match = currentPitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
    const accidental = match?.[2] || '';
    
    // Normalize to staff pitch for lookup
    const staffPitch = getStaffPitch(currentPitch);
    const currentIndex = orderedPitches.indexOf(staffPitch);
    
    if (currentIndex === -1) return currentPitch;

    const newIndex = Math.max(0, Math.min(orderedPitches.length - 1, currentIndex + offset));
    const newStaffPitch = orderedPitches[newIndex];
    
    // Re-apply accidental to new pitch
    const newMatch = newStaffPitch.match(/^([A-G])(\d+)$/);
    if (newMatch && accidental) {
        return `${newMatch[1]}${accidental}${newMatch[2]}`;
    }
    
    return newStaffPitch;
};
