import { Note } from 'tonal';
import { applyKeySignature } from '@/services/MusicService';

/**
 * Accidental type for pitch resolution.
 */
export type AccidentalType = 'sharp' | 'flat' | 'natural' | null;

/**
 * Options for resolving a pitch with accidentals and key signature.
 */
export interface ResolvePitchOptions {
  /** Raw pitch from mouse position or input (e.g., 'F4') */
  rawPitch: string;
  /** User-selected accidental tool, if any */
  accidental?: AccidentalType;
  /** Current key signature (e.g., 'G', 'Bb') */
  keySignature?: string;
}

/**
 * Resolves a raw pitch to its final form based on accidental selection and key signature.
 *
 * Resolution rules:
 * 1. If an accidental is explicitly selected, apply it absolutely to the raw pitch.
 *    - 'sharp' → F4 becomes F#4
 *    - 'flat' → F4 becomes Fb4
 *    - 'natural' → F#4 becomes F4 (strips accidental from key sig)
 * 2. If no accidental is selected, snap to the key signature.
 *    - F4 in G Major → F#4
 *
 * @param options - Pitch resolution options
 * @returns The resolved pitch string
 *
 * @example
 * ```typescript
 * // With explicit accidental
 * resolvePitch({ rawPitch: 'F4', accidental: 'sharp' }); // 'F#4'
 *
 * // With key signature (no explicit accidental)
 * resolvePitch({ rawPitch: 'F4', keySignature: 'G' }); // 'F#4'
 *
 * // Natural in key with sharps
 * resolvePitch({ rawPitch: 'F4', accidental: 'natural', keySignature: 'G' }); // 'F4'
 * ```
 *
 * @tested src/__tests__/utils/entry/pitchResolver.test.ts
 */
export function resolvePitch(options: ResolvePitchOptions): string {
  const { rawPitch, accidental, keySignature = 'C' } = options;

  if (accidental) {
    // User has explicit accidental tool selected
    const note = Note.get(rawPitch);
    if (note.empty || !note.letter || note.oct === undefined) {
      return rawPitch; // Invalid pitch, return as-is
    }

    switch (accidental) {
      case 'sharp':
        return `${note.letter}#${note.oct}`;
      case 'flat':
        return `${note.letter}b${note.oct}`;
      case 'natural':
        return `${note.letter}${note.oct}`;
      default:
        return rawPitch;
    }
  }

  // Default: snap to key signature
  return applyKeySignature(rawPitch, keySignature);
}
