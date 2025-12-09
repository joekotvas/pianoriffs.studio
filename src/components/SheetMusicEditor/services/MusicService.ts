/**
 * MusicService - Centralized music theory operations using TonalJS
 * 
 * This service wraps TonalJS functions and provides a clean API for:
 * - Pitch parsing and manipulation
 * - Key signature operations
 * - MIDI conversions
 * - Frequency calculations
 * - Scale-aware transposition
 * 
 * @module MusicService
 */

import { Note, Key, Interval, Midi, Scale } from 'tonal';

// ============================================================================
// PITCH OPERATIONS
// ============================================================================

/**
 * Gets the frequency in Hz for a given pitch.
 * Handles sharps, flats, and natural notes natively.
 * 
 * @param pitch - Scientific pitch notation (e.g., "C4", "F#5", "Bb3")
 * @returns Frequency in Hz, or 0 if invalid pitch
 * 
 * @example
 * getFrequency("A4"); // 440
 * getFrequency("C4"); // 261.63
 * getFrequency("F#4"); // 369.99
 */
export const getFrequency = (pitch: string): number => {
  const freq = Note.freq(pitch);
  return freq ?? 0;
};

/**
 * Gets the MIDI note number for a pitch.
 * 
 * @param pitch - Scientific pitch notation
 * @returns MIDI note number (0-127), or 60 (middle C) if invalid
 * 
 * @example
 * getMidi("C4"); // 60
 * getMidi("A4"); // 69
 */
export const getMidi = (pitch: string): number => {
  const midi = Note.midi(pitch);
  return midi ?? 60;
};

/**
 * Converts a MIDI note number to scientific pitch notation.
 * 
 * @param midi - MIDI note number (0-127)
 * @returns Scientific pitch notation (e.g., "C4", "C#4")
 * 
 * @example
 * midiToPitch(60); // "C4"
 * midiToPitch(61); // "C#4"
 */
export const midiToPitch = (midi: number): string => {
  return Note.fromMidi(midi) ?? 'C4';
};

/**
 * Normalizes a pitch to its letter name without accidentals.
 * Used for staff positioning (F#4 and Fb4 both render on the F line).
 * 
 * @param pitch - Any pitch notation
 * @returns Letter + octave without accidental (e.g., "F4")
 * 
 * @example
 * getStaffPitch("F#4"); // "F4"
 * getStaffPitch("Bb3"); // "B3"
 */
export const getStaffPitch = (pitch: string): string => {
  const note = Note.get(pitch);
  if (!note.letter || note.oct === undefined) return pitch;
  return `${note.letter}${note.oct}`;
};

/**
 * Gets the pitch class (letter + accidental, no octave).
 * 
 * @param pitch - Scientific pitch notation
 * @returns Pitch class (e.g., "C#", "Bb")
 * 
 * @example
 * getPitchClass("C#4"); // "C#"
 * getPitchClass("Bb3"); // "Bb"
 */
export const getPitchClass = (pitch: string): string => {
  return Note.pitchClass(pitch) ?? pitch.charAt(0);
};

/**
 * Gets the octave number from a pitch.
 * 
 * @param pitch - Scientific pitch notation
 * @returns Octave number, or 4 if not found
 * 
 * @example
 * getOctave("C4"); // 4
 * getOctave("F#5"); // 5
 */
export const getOctave = (pitch: string): number => {
  return Note.octave(pitch) ?? 4;
};

// ============================================================================
// TRANSPOSITION
// ============================================================================

/**
 * Transposes a pitch by a given interval.
 * 
 * @param pitch - Starting pitch
 * @param interval - Interval string (e.g., "P5", "m3", "M2")
 * @returns Transposed pitch, or original if invalid
 * 
 * @example
 * transpose("C4", "P5"); // "G4"
 * transpose("C4", "M2"); // "D4"
 * transpose("C4", "-P8"); // "C3"
 */
export const transpose = (pitch: string, interval: string): string => {
  const result = Note.transpose(pitch, interval);
  return result ?? pitch;
};

/**
 * Transposes a pitch by semitones.
 * 
 * @param pitch - Starting pitch
 * @param semitones - Number of semitones (positive = up, negative = down)
 * @returns Transposed pitch
 * 
 * @example
 * transposeBySemitones("C4", 1); // "C#4"
 * transposeBySemitones("C4", -1); // "B3"
 * transposeBySemitones("C4", 12); // "C5"
 */
export const transposeBySemitones = (pitch: string, semitones: number): string => {
  const midi = getMidi(pitch);
  return midiToPitch(midi + semitones);
};

// ============================================================================
// KEY SIGNATURE OPERATIONS
// ============================================================================

/**
 * Gets information about a major key.
 * 
 * @param keyRoot - Key root (e.g., "C", "G", "F", "Bb")
 * @returns Key object with scale, accidentals, and chords
 * 
 * @example
 * getKeyInfo("G").scale; // ["G", "A", "B", "C", "D", "E", "F#"]
 * getKeyInfo("F").alteration; // -1 (one flat)
 */
export const getKeyInfo = (keyRoot: string) => {
  return Key.majorKey(keyRoot);
};

/**
 * Gets the scale notes for a major key.
 * 
 * @param keyRoot - Key root
 * @returns Array of pitch classes in the scale
 * 
 * @example
 * getScaleNotes("C"); // ["C", "D", "E", "F", "G", "A", "B"]
 * getScaleNotes("G"); // ["G", "A", "B", "C", "D", "E", "F#"]
 */
export const getScaleNotes = (keyRoot: string): string[] => {
  const key = Key.majorKey(keyRoot);
  return [...key.scale]; // Spread to create mutable copy
};

/**
 * Gets the alteration count for a key (positive = sharps, negative = flats).
 * 
 * @param keyRoot - Key root
 * @returns Number of accidentals (e.g., 1 for G major, -1 for F major)
 * 
 * @example
 * getKeyAlteration("G"); // 1 (one sharp)
 * getKeyAlteration("Bb"); // -2 (two flats)
 * getKeyAlteration("C"); // 0
 */
export const getKeyAlteration = (keyRoot: string): number => {
  const key = Key.majorKey(keyRoot);
  return key.alteration;
};

/**
 * Determines if a pitch needs an accidental symbol when rendered in a given key.
 * 
 * @param pitch - The pitch to check (e.g., "F#4", "F4")
 * @param keyRoot - The current key signature root
 * @returns Object with `show` boolean and `type` ('sharp', 'flat', 'natural', or null)
 * 
 * @example
 * // In G Major (F# is diatonic):
 * needsAccidental("F#4", "G"); // { show: false, type: null }
 * needsAccidental("F4", "G");  // { show: true, type: 'natural' }
 * 
 * // In C Major (no accidentals):
 * needsAccidental("F#4", "C"); // { show: true, type: 'sharp' }
 * needsAccidental("F4", "C");  // { show: false, type: null }
 */
export const needsAccidental = (
  pitch: string,
  keyRoot: string
): { show: boolean; type: 'sharp' | 'flat' | 'natural' | null } => {
  const note = Note.get(pitch);
  if (!note.pc) return { show: false, type: null };
  
  const scaleNotes = getScaleNotes(keyRoot);
  const pitchClass = note.pc; // e.g., "F#", "Bb", "C"
  const letterOnly = note.letter; // e.g., "F", "B", "C"
  
  // Find what the scale expects for this letter
  const expectedNote = scaleNotes.find(s => s.charAt(0) === letterOnly);
  
  if (!expectedNote) {
    // Letter not in scale? Shouldn't happen for standard keys
    return { show: true, type: note.alt > 0 ? 'sharp' : note.alt < 0 ? 'flat' : null };
  }
  
  // Does the pitch match what the key expects?
  if (pitchClass === expectedNote) {
    // Pitch matches key expectation - no accidental needed
    return { show: false, type: null };
  }
  
  // Pitch differs from key expectation - show accidental
  if (note.alt > 0) {
    return { show: true, type: 'sharp' };
  } else if (note.alt < 0) {
    return { show: true, type: 'flat' };
  } else {
    // Natural note that differs (e.g., F natural in G major)
    return { show: true, type: 'natural' };
  }
};

// ============================================================================
// SCALE-AWARE MOVEMENT
// ============================================================================

/**
 * Gets the next diatonic note in a key (scale-aware movement).
 * If the pitch is chromatic (not in the scale), transposes by a major second.
 * 
 * @param pitch - Current pitch
 * @param keyRoot - Current key signature
 * @param direction - 'up' or 'down'
 * @returns Next pitch in the scale
 * 
 * @example
 * // In C Major:
 * getNextScaleDegree("C4", "C", "up"); // "D4"
 * getNextScaleDegree("E4", "C", "up"); // "F4"
 * 
 * // In G Major:
 * getNextScaleDegree("F#4", "G", "up"); // "G4"
 * getNextScaleDegree("E4", "G", "down"); // "D4"
 */
export const getNextScaleDegree = (
  pitch: string,
  keyRoot: string,
  direction: 'up' | 'down'
): string => {
  const note = Note.get(pitch);
  if (!note.pc || note.oct === undefined) return pitch;
  
  const scaleNotes = getScaleNotes(keyRoot);
  const pitchClass = note.pc;
  const octave = note.oct;
  
  // Check if pitch is in the scale
  const scaleIndex = scaleNotes.findIndex(s => s === pitchClass);
  
  if (scaleIndex !== -1) {
    // Pitch is diatonic - move to next scale degree
    if (direction === 'up') {
      const nextIndex = (scaleIndex + 1) % scaleNotes.length;
      const nextPitchClass = scaleNotes[nextIndex];
      // Only increment octave if the next note is lower in the chromatic scale
      // E.g., B -> C (next octave), but F# -> G (same octave)
      const currentMidi = getMidi(`${pitchClass}${octave}`);
      const nextMidiSameOctave = getMidi(`${nextPitchClass}${octave}`);
      const nextOctave = nextMidiSameOctave <= currentMidi ? octave + 1 : octave;
      return `${nextPitchClass}${nextOctave}`;
    } else {
      const prevIndex = scaleIndex === 0 ? scaleNotes.length - 1 : scaleIndex - 1;
      const prevPitchClass = scaleNotes[prevIndex];
      // Only decrement octave if the previous note is higher in the chromatic scale
      const currentMidi = getMidi(`${pitchClass}${octave}`);
      const prevMidiSameOctave = getMidi(`${prevPitchClass}${octave}`);
      const prevOctave = prevMidiSameOctave >= currentMidi ? octave - 1 : octave;
      return `${prevPitchClass}${prevOctave}`;
    }
  } else {
    // Pitch is chromatic - transpose by semitone
    return transposeBySemitones(pitch, direction === 'up' ? 1 : -1);
  }
};

/**
 * Applies a key signature to a visual pitch position.
 * Used when user clicks a staff line to determine the actual pitch.
 * 
 * @param visualPitch - The pitch based on staff position (e.g., "F4" for F line)
 * @param keyRoot - Current key signature
 * @returns Absolute pitch with key signature applied (e.g., "F#4" in G major)
 * 
 * @example
 * applyKeySignature("F4", "G"); // "F#4" (F is sharped in G major)
 * applyKeySignature("B4", "F"); // "Bb4" (B is flatted in F major)
 * applyKeySignature("C4", "C"); // "C4" (no change)
 */
export const applyKeySignature = (visualPitch: string, keyRoot: string): string => {
  const note = Note.get(visualPitch);
  if (!note.letter || note.oct === undefined) return visualPitch;
  
  const scaleNotes = getScaleNotes(keyRoot);
  const letter = note.letter;
  const octave = note.oct;
  
  // Find what the scale expects for this letter
  const expectedNote = scaleNotes.find(s => s.charAt(0) === letter);
  
  if (expectedNote) {
    return `${expectedNote}${octave}`;
  }
  
  return visualPitch;
};

// ============================================================================
// INTERVAL OPERATIONS
// ============================================================================

/**
 * Gets the interval between two pitches.
 * 
 * @param from - Starting pitch
 * @param to - Ending pitch
 * @returns Interval string (e.g., "P5", "M3")
 * 
 * @example
 * getInterval("C4", "G4"); // "P5"
 * getInterval("C4", "E4"); // "M3"
 */
export const getInterval = (from: string, to: string): string => {
  return Interval.distance(from, to) ?? 'P1';
};

/**
 * Gets the number of semitones in an interval.
 * 
 * @param interval - Interval string
 * @returns Number of semitones
 * 
 * @example
 * getSemitones("P5"); // 7
 * getSemitones("M3"); // 4
 */
export const getSemitones = (interval: string): number => {
  const parsed = Interval.get(interval);
  return parsed.semitones ?? 0;
};
