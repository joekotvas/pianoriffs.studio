import { Note, Key } from 'tonal';

/**
 * Returns the effective accidental of a pitch in a key.
 * e.g. F# in G Major -> 'sharp'
 * e.g. F in G Major -> 'natural' (even though it's an accidental relative to key)
 * e.g. Bb in F Major -> 'flat'
 */
export const getEffectiveAccidental = (pitch: string): 'sharp' | 'flat' | 'natural' => {
  const note = Note.get(pitch);
  if (note.empty) return 'natural';

  // If the note has an explicit accidental in its name (e.g. C#), that is its effective accidental.
  if (note.alt > 0) return 'sharp';
  if (note.alt < 0) return 'flat';

  // If note is Natural (alt=0, e.g. "C").
  return 'natural';
};

/**
 * Returns the accidental implied by the Key Signature for a given letter.
 */
export const getKeyAccidental = (
  letter: string,
  keySignature: string
): 'sharp' | 'flat' | 'natural' => {
  const scale = Key.majorKey(keySignature).scale;
  // Find the note in the scale with this letter
  const match = scale.find((n) => n.startsWith(letter));
  if (match) {
    if (match.includes('#')) return 'sharp';
    if (match.includes('b')) return 'flat';
  }
  return 'natural';
};

/**
 * Returns the diatonic pitch (Letter + Octave) for staff position tracking.
 * e.g. "C#4" -> "C4", "Bb3" -> "B3"
 */
export const getDiatonicPitch = (pitch: string): string => {
  const note = Note.get(pitch);
  if (note.empty) return pitch;
  return `${note.letter}${note.oct}`;
};
