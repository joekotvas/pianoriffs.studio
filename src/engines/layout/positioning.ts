import {
  MIDDLE_LINE_Y,
  NOTE_SPACING_BASE_UNIT,
  KEY_SIGNATURES,
  LAYOUT,
  STEM,
} from '@/constants';
import { CONFIG } from '@/config';
import { getNoteDuration } from '@/utils/core';
import { Note, ChordLayout, HeaderLayout } from './types';
import { getStaffPitch, STAFF_LETTERS } from '@/services/MusicService';

// ========== HEADER LAYOUT (SSOT) ==========

// Layout constants - single source of truth
const HEADER_LAYOUT_CONSTANTS = {
  KEY_SIG_START_X: 45,
  KEY_SIG_ACCIDENTAL_WIDTH: 10,
  KEY_SIG_PADDING: 10,
  TIME_SIG_WIDTH: 30,
  TIME_SIG_PADDING: 20,
};

/**
 * Calculates header layout positions based on key signature.
 * This is the SINGLE SOURCE OF TRUTH for header layout calculations.
 * @param keySignature - The key signature string (e.g., 'C', 'G', 'F')
 * @returns HeaderLayout object with all calculated positions
 */
export const calculateHeaderLayout = (keySignature: string): HeaderLayout => {
  const {
    KEY_SIG_START_X,
    KEY_SIG_ACCIDENTAL_WIDTH,
    KEY_SIG_PADDING,
    TIME_SIG_WIDTH,
    TIME_SIG_PADDING,
  } = HEADER_LAYOUT_CONSTANTS;

  const keySigCount = KEY_SIGNATURES[keySignature]?.count || 0;
  const keySigVisualWidth = keySigCount > 0 ? keySigCount * KEY_SIG_ACCIDENTAL_WIDTH + 10 : 0;
  const timeSigStartX = KEY_SIG_START_X + keySigVisualWidth + KEY_SIG_PADDING;
  const startOfMeasures = timeSigStartX + TIME_SIG_WIDTH + TIME_SIG_PADDING;

  return {
    keySigStartX: KEY_SIG_START_X,
    keySigVisualWidth,
    timeSigStartX,
    startOfMeasures,
  };
};

export const HEADER_CONSTANTS = HEADER_LAYOUT_CONSTANTS;

// ========== TREBLE CLEF PITCHES (C3 to G6) ==========
// Offset is relative to CONFIG.baseY
export const PITCH_TO_OFFSET: Record<string, number> = {
  C3: 102,
  D3: 96,
  E3: 90,
  F3: 84,
  G3: 78,
  A3: 72,
  B3: 66,
  C4: 60,
  D4: 54,
  E4: 48,
  F4: 42,
  G4: 36,
  A4: 30,
  B4: 24,
  C5: 18,
  D5: 12,
  E5: 6,
  F5: 0,
  G5: -6,
  A5: -12,
  B5: -18,
  C6: -24,
  D6: -30,
  E6: -36,
  F6: -42,
  G6: -48,
};

// Inverse mapping: Y offset to pitch (for hit detection - treble)
export const Y_TO_PITCH: Record<number, string> = Object.fromEntries(
  Object.entries(PITCH_TO_OFFSET).map(([pitch, offset]) => [offset, pitch])
);

// ========== BASS CLEF PITCHES (E1 to B4) ==========
// Same visual positions, different pitches (approximately 2 octaves lower)
export const BASS_PITCH_TO_OFFSET: Record<string, number> = {
  E1: 102,
  F1: 96,
  G1: 90,
  A1: 84,
  B1: 78,
  C2: 72,
  D2: 66,
  E2: 60,
  F2: 54,
  G2: 48,
  A2: 42,
  B2: 36,
  C3: 30,
  D3: 24,
  E3: 18,
  F3: 12,
  G3: 6,
  A3: 0,
  B3: -6,
  C4: -12,
  D4: -18,
  E4: -24,
  F4: -30,
  G4: -36,
  A4: -42,
  B4: -48,
};

// Inverse mapping: Y offset to pitch (for hit detection - bass)
export const BASS_Y_TO_PITCH: Record<number, string> = Object.fromEntries(
  Object.entries(BASS_PITCH_TO_OFFSET).map(([pitch, offset]) => [offset, pitch])
);

// ========== CLEF-AWARE HELPERS ==========
/**
 * Gets the pitch-to-offset mapping for a given clef.
 */
export const getPitchToOffset = (clef: string = 'treble'): Record<string, number> => {
  return clef === 'bass' ? BASS_PITCH_TO_OFFSET : PITCH_TO_OFFSET;
};

/**
 * Gets the Y-to-pitch mapping for a given clef.
 */
export const getYToPitch = (clef: string = 'treble'): Record<number, string> => {
  return clef === 'bass' ? BASS_Y_TO_PITCH : Y_TO_PITCH;
};

/**
 * Reference points for each clef
 */
const CLEF_REFERENCE: Record<string, { pitch: string; offset: number }> = {
  treble: { pitch: 'C4', offset: 60 }, // Middle C on treble (1 line below)
  bass: { pitch: 'E2', offset: 60 }, // E2 on bass (1 line below)
  alto: { pitch: 'C4', offset: 24 }, // Middle C on alto (Line 3 / Middle Line)
  tenor: { pitch: 'C4', offset: 18 }, // Middle C on tenor (Line 4)
};

/**
 * Calculates the offset for ANY pitch in a given clef.
 * Uses dynamic calculation based on staff line math, not lookup tables.
 *
 * Each staff step (line/space) = 6px
 * Higher pitch = lower offset (goes up on staff)
 *
 * @param pitch - Pitch to calculate offset for (e.g., "F#4", "C2", "G7")
 * @param clef - Clef context ('treble' or 'bass')
 * @returns Y offset in pixels relative to CONFIG.baseY
 */
export const getOffsetForPitch = (
  pitch: string | null | undefined,
  clef: string = 'treble'
): number => {
  // Handle null/undefined pitch (e.g., rest notes)
  if (!pitch) return 0;

  const normalizedPitch = getStaffPitch(pitch);

  // Try lookup first for common pitches (faster)
  const mapping = getPitchToOffset(clef);
  if (mapping[normalizedPitch] !== undefined) {
    return mapping[normalizedPitch];
  }

  // Dynamic calculation for any pitch
  const ref = CLEF_REFERENCE[clef] || CLEF_REFERENCE.treble;

  // Parse pitch letter and octave
  const match = normalizedPitch.match(/^([A-G])(\d+)$/);
  if (!match) return 0;

  const [, letter, octStr] = match;
  const octave = parseInt(octStr, 10);

  // Parse reference pitch
  const refMatch = ref.pitch.match(/^([A-G])(\d+)$/);
  if (!refMatch) return ref.offset;

  const [, refLetter, refOctStr] = refMatch;
  const refOctave = parseInt(refOctStr, 10);

  // Calculate steps from reference
  const letterIdx = STAFF_LETTERS.indexOf(letter);
  const refLetterIdx = STAFF_LETTERS.indexOf(refLetter);

  // Steps = (octave difference * 7) + letter difference
  const stepsFromRef = (octave - refOctave) * 7 + (letterIdx - refLetterIdx);

  // Each step up = 6px lower offset (going up on staff)
  return ref.offset - stepsFromRef * 6;
};

/**
 * Gets the pitch for a Y offset in a given clef.
 */
export const getPitchForOffset = (offset: number, clef: string = 'treble'): string | undefined => {
  const mapping = getYToPitch(clef);
  return mapping[offset];
};

/**
 * Calculates the visual width of a note based on its duration.
 * Spacing is proportional to the square root of quants to balance density.
 * Includes minimum widths for short notes and dot padding.
 * @param duration - The duration type (e.g., 'quarter', 'eighth')
 * @param dotted - Whether the note is dotted
 * @returns The calculated width in pixels
 */
export const getNoteWidth = (duration: string, dotted: boolean): number => {
  const quants = getNoteDuration(duration, dotted, undefined);
  const baseWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(quants);

  // Use multipliers relative to the base unit for responsiveness
  const MIN_WIDTH_FACTORS: Record<string, number> = {
    sixtyfourth: 1.2,
    thirtysecond: 1.5,
    sixteenth: 1.8,
    eighth: 2.2,
  };

  const minWidth = (MIN_WIDTH_FACTORS[duration] || 0) * NOTE_SPACING_BASE_UNIT;

  // Calculate base width (greater of rhythm-based or visual minimum)
  let width = Math.max(baseWidth, minWidth);

  // Add space for the dot if dotted (dots appear to the right of notehead)
  if (dotted) {
    width += NOTE_SPACING_BASE_UNIT * 0.5; // Dot width factor
  }

  return width;
};

/**
 * Calculates layout details for a chord (group of notes at the same time).
 * Determines stem direction, note offsets for clusters, and vertical bounds.
 * All calculations use CONFIG.baseY - staff positioning is handled by SVG transforms.
 * @param notes - Array of notes in the chord
 * @param clef - The current clef ('treble' or 'bass')
 * @param forcedDirection - Optional direction to force ('up' or 'down')
 * @returns Object containing sortedNotes, direction, noteOffsets, maxNoteShift, minY, maxY
 */
export const calculateChordLayout = (
  notes: Note[],
  clef: string = 'treble',
  forcedDirection?: 'up' | 'down'
): ChordLayout => {
  // Filter out rest notes (null pitch) since they don't have visual positions
  const realNotes = notes.filter((n) => n.pitch !== null);

  if (!realNotes || realNotes.length === 0) {
    return {
      sortedNotes: [],
      direction: forcedDirection || 'up',
      noteOffsets: {},
      maxNoteShift: 0,
      minNoteShift: 0,
      minY: 0,
      maxY: 0,
    };
  }

  const sortedNotes = [...realNotes].sort((a, b) => {
    const yA = getOffsetForPitch(a.pitch!, clef);
    const yB = getOffsetForPitch(b.pitch!, clef);
    return yA - yB;
  });

  let furthestNote = sortedNotes[0];
  let maxDist = -1;
  let minY = Infinity;
  let maxY = -Infinity;

  sortedNotes.forEach((n) => {
    const y = CONFIG.baseY + getOffsetForPitch(n.pitch!, clef);
    const dist = Math.abs(y - MIDDLE_LINE_Y);
    if (dist > maxDist) {
      maxDist = dist;
      furthestNote = n;
    }
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  const furthestY = CONFIG.baseY + getOffsetForPitch(furthestNote.pitch!, clef);

  // Use forced direction if provided, otherwise calculate based on furthest note
  const direction = forcedDirection || (furthestY <= MIDDLE_LINE_Y ? 'down' : 'up');

  const noteOffsets: Record<string, number> = {};

  // Second interval displacement depends on stem direction
  // Up-stem: noteheads on LEFT, upper note of second shifts RIGHT (+11)
  // Down-stem: noteheads on RIGHT, lower note of second shifts LEFT (-11)

  if (direction === 'up') {
    for (let i = sortedNotes.length - 1; i > 0; i--) {
      const noteLower = sortedNotes[i]; // Higher Y = lower pitch
      const noteUpper = sortedNotes[i - 1]; // Lower Y = higher pitch
      const yLower = getOffsetForPitch(noteLower.pitch!, clef);
      const yUpper = getOffsetForPitch(noteUpper.pitch!, clef);
      if (Math.abs(yLower - yUpper) === 6) {
        if (!noteOffsets[noteLower.id]) {
          noteOffsets[noteUpper.id] = LAYOUT.SECOND_INTERVAL_SHIFT; // Upper note shifts RIGHT
        }
      }
    }
  } else {
    for (let i = 0; i < sortedNotes.length - 1; i++) {
      const noteUpper = sortedNotes[i];
      const noteLower = sortedNotes[i + 1];
      const yUpper = getOffsetForPitch(noteUpper.pitch!, clef);
      const yLower = getOffsetForPitch(noteLower.pitch!, clef);
      if (Math.abs(yLower - yUpper) === 6) {
        if (!noteOffsets[noteUpper.id]) {
          noteOffsets[noteLower.id] = -LAYOUT.SECOND_INTERVAL_SHIFT; // Lower note shifts LEFT
        }
      }
    }
  }

  // Track both positive (right shift) and negative (left shift) offsets
  const offsets = Object.values(noteOffsets);
  const maxNoteShift = offsets.length > 0 ? Math.max(0, ...offsets) : 0;
  const minNoteShift = offsets.length > 0 ? Math.min(0, ...offsets) : 0;

  return { sortedNotes, direction, noteOffsets, maxNoteShift, minNoteShift, minY, maxY };
};

/**
 * Calculates the stem X offset for a chord based on its layout and direction.
 * This is the single source of truth for stem positioning logic.
 *
 * Rules:
 * - Up-stem seconds (maxNoteShift > 0): stem at +6 (between notes at 0 and +11)
 * - Down-stem seconds (any offset < 0): stem at -6 (between notes at -11 and 0)
 * - Regular up-stem: stem on right at +6
 * - Regular down-stem: stem on left at -6
 *
 * @param chordLayout - The ChordLayout object from calculateChordLayout
 * @param direction - The stem direction ('up' or 'down')
 * @returns The X offset for the stem relative to noteX
 */
export const getStemOffset = (chordLayout: ChordLayout, direction: 'up' | 'down'): number => {
  const hasUpSecond = chordLayout.maxNoteShift > 0;
  const hasDownSecond = Object.values(chordLayout.noteOffsets).some((v) => v < 0);

  if (hasUpSecond) return STEM.OFFSET_X;
  if (hasDownSecond) return -STEM.OFFSET_X;
  return direction === 'up' ? STEM.OFFSET_X : -STEM.OFFSET_X;
};
