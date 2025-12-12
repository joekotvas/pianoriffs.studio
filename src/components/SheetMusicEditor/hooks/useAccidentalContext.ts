import { useMemo } from 'react';
import { ScoreEvent } from '../types';
import { getEffectiveAccidental, getKeyAccidental, getDiatonicPitch } from '../utils/accidentalContext';

/**
 * Hook to calculate which accidentals should be displayed for notes in a measure.
 * 
 * Rules:
 * 1. If a note's effective accidental differs from the key signature, show the accidental.
 * 2. If a note repeats the same pitch (same line), only show if the accidental CHANGES.
 * 3. If a letter was altered earlier in the measure, show a cautionary accidental when 
 *    returning to the key signature's default.
 * 
 * @param events - The events in the measure
 * @param keySignature - The current key signature (e.g., "G", "F", "Bb")
 * @returns A map of noteId -> accidental symbol ('♯', '♭', '♮') or null (hide)
 */
export function useAccidentalContext(
  events: ScoreEvent[],
  keySignature: string
): Record<string, string | null> {
  return useMemo(() => {
    const overrides: Record<string, string | null> = {};
    const pitchHistory: Record<string, 'sharp' | 'flat' | 'natural'> = {};
    const alteredLetters = new Set<string>();

    // Events are already in temporal order within the measure
    events.forEach(event => {
      if (!event.notes) return;
      
      event.notes.forEach((note: any) => {
        // Skip rest notes (null pitch)
        if (note.pitch === null) return;

        const effective = getEffectiveAccidental(note.pitch, keySignature);
        const keyAccidental = getKeyAccidental(note.pitch.charAt(0), keySignature);
        const diatonicPitch = getDiatonicPitch(note.pitch);

        let showSymbol: string | null = null;

        const prev = pitchHistory[diatonicPitch];

        if (prev) {
          // Rule: If repeated pitch (same line), only show if it CHANGES.
          if (prev !== effective) {
            showSymbol = effective;
          } else {
            showSymbol = null; // Hide
          }
        } else {
          // First time on this line
          if (effective !== keyAccidental) {
            // Deviation from key -> Show
            showSymbol = effective;
            alteredLetters.add(note.pitch.charAt(0));
          } else {
            // Matches key... BUT check if letter was altered elsewhere
            if (alteredLetters.has(note.pitch.charAt(0))) {
              // Cautionary -> Show
              showSymbol = effective;
            } else {
              showSymbol = null;
            }
          }
        }

        // Update History
        pitchHistory[diatonicPitch] = effective;

        // Store result with symbol mapping
        if (showSymbol) {
          const symbolMap: Record<string, string> = { 
            sharp: '♯', 
            flat: '♭', 
            natural: '♮' 
          };
          overrides[note.id] = symbolMap[showSymbol] || null;
        } else {
          overrides[note.id] = null; // Explicitly hide
        }
      });
    });

    return overrides;
  }, [events, keySignature]);
}
