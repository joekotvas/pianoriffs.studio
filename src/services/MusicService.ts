/**
 * MusicService - Centralized Music Theory & Notation Logic
 *
 * Adapts TonalJS to the specific needs of a score renderer,
 * distinguishing between "Musical Pitch" (Audio/Theory) and
 * "Visual Pitch" (Staff positioning).
 */

import { Note, Key } from 'tonal';
import { ACCIDENTALS } from '@/constants/SMuFL';

// --- Constants ---

export const STAFF_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// ============================================================================
// 1. ANALYSIS (Audio & Midi)
// ============================================================================

/** Returns frequency in Hz (0 if invalid). */
export const getFrequency = (pitch: string): number => Note.freq(pitch) ?? 0;

/** Returns MIDI number 0-127 (defaults to Middle C/60 if invalid). */
export const getMidi = (pitch: string): number => Note.midi(pitch) ?? 60;

/** Returns scientific notation from MIDI (e.g. 60 -> "C4"). */
export const midiToPitch = (midi: number): string => Note.fromMidi(midi) ?? 'C4';

// ============================================================================
// 2. THEORY (Keys & Scales)
// ============================================================================

export const getKeyInfo = (root: string) => Key.majorKey(root);

export const getKeyAlteration = (root: string): number => Key.majorKey(root).alteration;

export const getScaleNotes = (root: string): string[] => [...Key.majorKey(root).scale];

/**
 * Returns the diatonic scale degree for a pitch in a key.
 * @example getScaleDegree("G4", "C") -> 5
 */
export const getScaleDegree = (pitch: string, keyRoot: string): number => {
  const pc = Note.pitchClass(pitch);
  const scale = getScaleNotes(keyRoot);
  const idx = scale.indexOf(pc);
  return idx === -1 ? 0 : idx + 1;
};

// ============================================================================
// 3. NOTATION (Rendering Logic)
// ============================================================================

/**
 * Returns the "Visual Pitch" - the letter and octave without accidentals.
 * Used to determine the Y-position on the staff.
 * @example "F#4" -> "F4", "Fb4" -> "F4"
 */
export const getStaffPitch = (pitch: string): string => {
  const n = Note.get(pitch);
  return n.letter && n.oct !== undefined ? `${n.letter}${n.oct}` : pitch;
};

/**
 * Decides if a note needs an accidental glyph based on the Key Signature.
 *
 * Logic:
 * 1. If note is in the key scale -> No accidental.
 * 2. If note is Natural but key expects Sharp/Flat -> Show Natural.
 * 3. If note is Sharp/Flat and not in key -> Show Sharp/Flat.
 */
export const needsAccidental = (
  pitch: string,
  keyRoot: string
): { show: boolean; type: 'sharp' | 'flat' | 'natural' | null } => {
  const n = Note.get(pitch);
  if (!n.pc) return { show: false, type: null };

  const scale = Key.majorKey(keyRoot).scale;

  // Case A: Diatonic Note (e.g. F# in G Major) -> Clean
  if (scale.includes(n.pc)) {
    return { show: false, type: null };
  }

  // Case B: Chromatic Note
  // If the note is natural (alt === 0), it forces a Natural sign against the key
  if (n.alt === 0) {
    return { show: true, type: 'natural' };
  }

  // Otherwise, return the alteration type
  return {
    show: true,
    type: n.alt > 0 ? 'sharp' : 'flat',
  };
};

/**
 * Resolves the final SMuFL glyph for a note, considering overrides.
 */
export const getAccidentalGlyph = (
  pitch: string,
  keySignature: string,
  overrideSymbol?: string | null
): string | null => {
  // 1. Manual Override (User forced an accidental or forced it hidden)
  if (overrideSymbol !== undefined) return overrideSymbol;

  // 2. Standard Theory Calculation
  const { show, type } = needsAccidental(pitch, keySignature);
  return show && type ? ACCIDENTALS[type] : null;
};

// ============================================================================
// 4. INTERACTION (Drag & Drop Math)
// ============================================================================

/**
 * Snaps a "Visual Pitch" (derived from staff Y-position) to the Musical Key.
 *
 * @example
 * // User clicks "F" line in G Major
 * applyKeySignature("F4", "G") // -> "F#4"
 */
export const applyKeySignature = (visualPitch: string, keyRoot: string): string => {
  const n = Note.get(visualPitch);
  if (!n.letter || n.oct === undefined) return visualPitch;

  // Find the pitch class in the scale that shares this letter
  const scale = Key.majorKey(keyRoot).scale;
  const match = scale.find((pc) => Note.get(pc).letter === n.letter);

  // If found (e.g. found "F#" for letter "F"), combine with octave
  return match ? `${match}${n.oct}` : visualPitch;
};

/**
 * Compares two pitches and returns -1, 0, or 1 (like a comparator).
 * Uses MIDI values for comparison.
 */
export const comparePitch = (a: string, b: string): number => {
  const midiA = getMidi(a);
  const midiB = getMidi(b);
  return midiA < midiB ? -1 : midiA > midiB ? 1 : 0;
};

/**
 * Clamps a pitch to the allowed range for a clef.
 * If pitch is out of bounds, returns the boundary pitch.
 */
export const clampPitch = (pitch: string, minPitch: string, maxPitch: string): string => {
  if (comparePitch(pitch, minPitch) < 0) return minPitch;
  if (comparePitch(pitch, maxPitch) > 0) return maxPitch;
  return pitch;
};

/**
 * Calculates a new pitch by moving visually along staff lines,
 * automatically applying the key signature to the destination.
 *
 * @param pitch Starting pitch (e.g. "C4")
 * @param steps Visual steps to move (e.g. 1 = next line/space)
 * @param keyRoot Key context (e.g. "G")
 * @param pitchRange Optional pitch range for clamping (if provided, result will be clamped)
 */
export const movePitchVisual = (
  pitch: string,
  steps: number,
  keyRoot: string = 'C',
  pitchRange?: { min: string; max: string }
): string => {
  const n = Note.get(pitch);
  if (!n.letter || n.oct === undefined) return pitch;

  // 1. Calculate new Letter & Octave (Geometry)
  const currentIdx = STAFF_LETTERS.indexOf(n.letter);
  const totalIdx = currentIdx + steps;

  // Handle wrapping (modulo with support for negative numbers)
  const wrappedIdx = ((totalIdx % 7) + 7) % 7;
  const octaveChange = Math.floor(totalIdx / 7);

  const newLetter = STAFF_LETTERS[wrappedIdx];
  const newOctave = n.oct + octaveChange;

  // 2. Snap to Key (Music Theory)
  let result = applyKeySignature(`${newLetter}${newOctave}`, keyRoot);

  // 3. Clamp to allowed range (if pitchRange provided)
  if (pitchRange) {
    result = clampPitch(result, pitchRange.min, pitchRange.max);
  }

  return result;
};
