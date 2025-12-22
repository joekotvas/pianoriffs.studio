/**
 * Constants for Sheet Music Editor
 *
 * This file contains:
 * - Music theory constants (note types, time/key signatures)
 * - Derived layout constants (from CONFIG)
 * - Rendering settings (beaming, stems, tuplets, ties)
 */

import { CONFIG } from './config';
import { Key } from 'tonal';

// =============================================================================
// DERIVED LAYOUT VALUES (from CONFIG.lineHeight)
// =============================================================================

const SPACE = CONFIG.lineHeight; // 12px - distance between staff lines
const HALF_SPACE = 0.5 * SPACE; // 6px

// Staff positions (Y offset from baseY/top line of staff)
const STAFF_POSITION = {
  aboveStaff: -0.5 * SPACE,
  line5: 0,
  space4: 0.5 * SPACE,
  line4: 1 * SPACE,
  space3: 1.5 * SPACE,
  line3: 2 * SPACE,
  space2: 2.5 * SPACE,
  line2: 3 * SPACE,
  space1: 3.5 * SPACE,
  line1: 4 * SPACE,
  belowStaff: 4.5 * SPACE,
};

export const MIDDLE_LINE_Y = CONFIG.baseY + 24;

// =============================================================================
// TIME SIGNATURES
// =============================================================================

export const TIME_SIGNATURES: Record<string, number> = {
  '4/4': 64,
  '3/4': 48,
  '2/4': 32,
  '6/8': 48,
};

// =============================================================================
// KEY SIGNATURES (Generated from Tonal)
// =============================================================================

export interface KeySignature {
  label: string;
  type: 'sharp' | 'flat';
  count: number;
  accidentals: string[];
  mode: 'major' | 'minor';
  tonic: string;
}

const SHARPS_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLATS_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// All 15 key signature groups: C (no accidentals), 7 sharps, 7 flats
// Each major key has a relative minor with the same accidentals
// Keys are named distinctly: 'C' = C Major, 'Am' = A minor
const MAJOR_ROOTS = [
  'C', // No accidentals
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#', // Sharp Keys
  'F',
  'Bb',
  'Eb',
  'Ab',
  'Db',
  'Gb',
  'Cb', // Flat Keys
];

export const KEY_SIGNATURES: Record<string, KeySignature> = {};

// Generate all key signatures using Tonal.js
MAJOR_ROOTS.forEach((majorRoot) => {
  const majorInfo = Key.majorKey(majorRoot);
  const count = Math.abs(majorInfo.alteration);
  const type: 'sharp' | 'flat' = majorInfo.alteration < 0 ? 'flat' : 'sharp';
  const accidentals = type === 'flat' ? FLATS_ORDER.slice(0, count) : SHARPS_ORDER.slice(0, count);

  // Major key: stored as root name (e.g., 'G', 'Bb')
  KEY_SIGNATURES[majorRoot] = {
    label: `${majorRoot} Major`,
    type,
    count,
    accidentals,
    mode: 'major',
    tonic: majorRoot,
  };

  // Minor key: stored with 'm' suffix (e.g., 'Em', 'Gm')
  // Use the relative minor from Tonal.js
  const minorRoot = majorInfo.minorRelative;
  const minorKey = `${minorRoot}m`;
  KEY_SIGNATURES[minorKey] = {
    label: `${minorRoot} minor`,
    type,
    count,
    accidentals,
    mode: 'minor',
    tonic: minorRoot,
  };
});

// Key signature accidental positions on staff
export interface KeySignatureOffsets {
  treble: { sharp: Record<string, number>; flat: Record<string, number> };
  bass: { sharp: Record<string, number>; flat: Record<string, number> };
  alto: { sharp: Record<string, number>; flat: Record<string, number> };
  tenor: { sharp: Record<string, number>; flat: Record<string, number> };
}

export const KEY_SIGNATURE_OFFSETS: KeySignatureOffsets = {
  treble: {
    sharp: {
      F: STAFF_POSITION.line5,
      C: STAFF_POSITION.space3,
      G: STAFF_POSITION.aboveStaff,
      D: STAFF_POSITION.line4,
      A: STAFF_POSITION.space2,
      E: STAFF_POSITION.space4,
      B: STAFF_POSITION.line3,
    },
    flat: {
      B: STAFF_POSITION.line3,
      E: STAFF_POSITION.space4,
      A: STAFF_POSITION.space2,
      D: STAFF_POSITION.line4,
      G: STAFF_POSITION.line2,
      C: STAFF_POSITION.space3,
      F: STAFF_POSITION.space1,
    },
  },
  alto: {
    sharp: {
      F: STAFF_POSITION.line3, // C-clef center is Line 3 (Middle C)
      C: STAFF_POSITION.space1,
      G: STAFF_POSITION.aboveStaff, // or space 5
      D: STAFF_POSITION.line2,
      A: STAFF_POSITION.space4,
      E: STAFF_POSITION.space2,
      B: STAFF_POSITION.line4,
    },
    flat: {
      B: STAFF_POSITION.line4,
      E: STAFF_POSITION.space2,
      A: STAFF_POSITION.space4,
      D: STAFF_POSITION.line2,
      G: STAFF_POSITION.aboveStaff,
      C: STAFF_POSITION.space2,
      F: STAFF_POSITION.line1,
    },
  },
  // Tenor Clef: Line 4 = C4 (Middle C)
  // Line 1=D3, Space1=E3, Line2=F3, Space2=G3, Line3=A3, Space3=B3, Line4=C4, Space4=D4, Line5=E4
  tenor: {
    sharp: {
      F: STAFF_POSITION.space4, // F4
      C: STAFF_POSITION.line4, // C4 is Line 4, so C#4 is on Line 4
      G: STAFF_POSITION.aboveStaff, // G4 is above staff
      D: STAFF_POSITION.space4, // D4
      A: STAFF_POSITION.line3, // A3
      E: STAFF_POSITION.line5, // E4
      B: STAFF_POSITION.space3, // B3
    },
    flat: {
      B: STAFF_POSITION.space3, // B3
      E: STAFF_POSITION.line5, // E4
      A: STAFF_POSITION.line3, // A3
      D: STAFF_POSITION.space4, // D4
      G: STAFF_POSITION.aboveStaff, // G4
      C: STAFF_POSITION.line4, // C4
      F: STAFF_POSITION.space2, // F3
    },
  },
  bass: {
    sharp: {
      F: STAFF_POSITION.line4,
      C: STAFF_POSITION.space2,
      G: STAFF_POSITION.space4,
      D: STAFF_POSITION.line3,
      A: STAFF_POSITION.line5,
      E: STAFF_POSITION.space3,
      B: STAFF_POSITION.aboveStaff,
    },
    flat: {
      B: STAFF_POSITION.line2,
      E: STAFF_POSITION.space3,
      A: STAFF_POSITION.space1,
      D: STAFF_POSITION.line3,
      G: STAFF_POSITION.line1,
      C: STAFF_POSITION.space2,
      F: STAFF_POSITION.belowStaff,
    },
  },
};

// =============================================================================
// CLEF TYPES
// =============================================================================

export interface ClefType {
  label: string;
  isGrand?: boolean;
}

export const CLEF_TYPES: Record<string, ClefType> = {
  treble: { label: 'Treble' },
  bass: { label: 'Bass' },
  alto: { label: 'Alto' },
  tenor: { label: 'Tenor' },
  grand: { label: 'Grand', isGrand: true },
};

/**
 * Unified clef configuration (Open-Closed Principle)
 * 
 * Define only the minimal reference data for each clef.
 * All derived values (staffLines, etc.) are computed from the reference.
 * To add a new clef, simply add an entry with referencePitch, referenceLine,
 * defaultPitch, centerPitch, and restMidi.
 * 
 * @see ADR-007: Open-Closed Clef Reference Pattern
 */
interface ClefReference {
  /** Reference pitch (e.g., 'G4' for treble, 'F3' for bass, 'C4' for C-clefs) */
  referencePitch: string;
  /** Staff line where reference pitch sits (1-5, bottom to top) */
  referenceLine: 1 | 2 | 3 | 4 | 5;
  /** Default pitch for ghost cursor/preview */
  defaultPitch: string;
  /** Center pitch when converting rests to notes */
  centerPitch: string;
  /** MIDI value for rest positioning in vertical stack */
  restMidi: number;
}

const CLEF_REFERENCES: Record<string, ClefReference> = {
  treble: { referencePitch: 'G4', referenceLine: 2, defaultPitch: 'C4', centerPitch: 'B4', restMidi: 71 },
  bass:   { referencePitch: 'F3', referenceLine: 4, defaultPitch: 'C3', centerPitch: 'D3', restMidi: 48 },
  alto:   { referencePitch: 'C4', referenceLine: 3, defaultPitch: 'C4', centerPitch: 'C4', restMidi: 60 },
  tenor:  { referencePitch: 'C4', referenceLine: 4, defaultPitch: 'C4', centerPitch: 'C4', restMidi: 60 },
  grand:  { referencePitch: 'G4', referenceLine: 2, defaultPitch: 'C4', centerPitch: 'B4', restMidi: 71 },
};

/** Generate staff line pitches from a reference pitch and line */
const generateStaffLines = (
  referencePitch: string,
  referenceLine: number
): [string, string, string, string, string] => {
  // Parse reference pitch (e.g., 'G4' -> { letter: 'G', octave: 4 })
  const match = referencePitch.match(/^([A-G])(\d)$/);
  if (!match) return ['C4', 'E4', 'G4', 'B4', 'D5']; // Fallback
  
  const letter = match[1];
  const octave = parseInt(match[2], 10);
  const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const refIndex = NOTES.indexOf(letter);
  
  // Calculate steps from reference line to each staff line
  // Each staff line is 2 steps apart (a line + space = 2 steps)
  const lines: string[] = [];
  for (let line = 1; line <= 5; line++) {
    const stepsFromRef = (line - referenceLine) * 2; // Each line = 2 diatonic steps
    let noteIndex = refIndex + stepsFromRef;
    let noteOctave = octave;
    
    // Handle octave wrapping
    while (noteIndex >= 7) {
      noteIndex -= 7;
      noteOctave++;
    }
    while (noteIndex < 0) {
      noteIndex += 7;
      noteOctave--;
    }
    
    lines.push(`${NOTES[noteIndex]}${noteOctave}`);
  }
  
  return lines as [string, string, string, string, string];
};

/** Full clef configuration with generated staffLines */
export interface ClefConfig {
  /** Default pitch for ghost cursor/preview */
  defaultPitch: string;
  /** Center pitch when converting rests to notes */
  centerPitch: string;
  /** MIDI value for rest positioning in vertical stack */
  restMidi: number;
  /** Staff line pitches (Line 1 to Line 5, bottom to top) - generated */
  staffLines: [string, string, string, string, string];
}

/** Build CLEF_CONFIG from references */
export const CLEF_CONFIG: Record<string, ClefConfig> = Object.fromEntries(
  Object.entries(CLEF_REFERENCES).map(([clef, ref]) => [
    clef,
    {
      defaultPitch: ref.defaultPitch,
      centerPitch: ref.centerPitch,
      restMidi: ref.restMidi,
      staffLines: generateStaffLines(ref.referencePitch, ref.referenceLine),
    },
  ])
) as Record<string, ClefConfig>;

/**
 * Get clef configuration, falling back to treble for unknown clefs.
 */
export const getClefConfig = (clef: string): ClefConfig =>
  CLEF_CONFIG[clef] || CLEF_CONFIG.treble;

// =============================================================================
// NOTE TYPES
// =============================================================================

export interface NoteType {
  duration: number;
  label: string;
  fill: string;
  stroke: string;
  stem: boolean;
  flag?: number;
  abcDuration: string;
  xmlType: string;
}

export const NOTE_TYPES: Record<string, NoteType> = {
  whole: {
    duration: 64,
    label: 'Whole',
    fill: 'transparent',
    stroke: 'black',
    stem: false,
    abcDuration: '4',
    xmlType: 'whole',
  },
  half: {
    duration: 32,
    label: 'Half',
    fill: 'transparent',
    stroke: 'black',
    stem: true,
    abcDuration: '2',
    xmlType: 'half',
  },
  quarter: {
    duration: 16,
    label: 'Quarter',
    fill: 'black',
    stroke: 'black',
    stem: true,
    abcDuration: '',
    xmlType: 'quarter',
  },
  eighth: {
    duration: 8,
    label: 'Eighth',
    fill: 'black',
    stroke: 'black',
    stem: true,
    flag: 1,
    abcDuration: '/2',
    xmlType: 'eighth',
  },
  sixteenth: {
    duration: 4,
    label: '16th',
    fill: 'black',
    stroke: 'black',
    stem: true,
    flag: 2,
    abcDuration: '/4',
    xmlType: '16th',
  },
  thirtysecond: {
    duration: 2,
    label: '32nd',
    fill: 'black',
    stroke: 'black',
    stem: true,
    flag: 3,
    abcDuration: '/8',
    xmlType: '32nd',
  },
  sixtyfourth: {
    duration: 1,
    label: '64th',
    fill: 'black',
    stroke: 'black',
    stem: true,
    flag: 4,
    abcDuration: '/16',
    xmlType: '64th',
  },
};

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================

export const NOTE_SPACING_BASE_UNIT = 16;
export const WHOLE_REST_WIDTH = 12;
export const DEFAULT_SCALE = 1;

export const LAYOUT = {
  // Core Primitives
  LINE_STROKE_WIDTH: 1.5,
  NOTE_RX: 6,
  NOTE_RY: 4,
  DOT_RADIUS: 3,

  // Derived from lineHeight
  SECOND_INTERVAL_SHIFT: SPACE - 1,
  SECOND_INTERVAL_SPACE: HALF_SPACE,
  DOT_OFFSET_X: SPACE,
  LEDGER_LINE_EXTENSION: SPACE - 2,

  // Accidentals
  ACCIDENTAL: {
    OFFSET_X: -16,
    OFFSET_Y: 0,
    FONT_SIZE: 22, // Legacy, now using getFontSize() from SMuFL
    SPACING: HALF_SPACE + 2,
  },

  // Hit Detection
  HIT_AREA: {
    WIDTH: 20,
    HEIGHT: 12,
    OFFSET_X: -10,
    OFFSET_Y: -6,
  },
  HIT_ZONE_RADIUS: 14,
  APPEND_ZONE_WIDTH: 2000,

  // Min widths for short notes
  MIN_WIDTH_FACTORS: {
    sixtyfourth: 1.2,
    thirtysecond: 1.5,
    sixteenth: 1.8,
    eighth: 2.2,
  } as Record<string, number>,

  LOOKAHEAD_PADDING_FACTOR: 0.3,
};

// =============================================================================
// STEM RENDERING
// =============================================================================

export const STEM = {
  LENGTHS: {
    default: 44,
    thirtysecond: 44,
    sixtyfourth: 44,
  } as Record<string, number>,
  BEAMED_LENGTHS: {
    default: 44,
    thirtysecond: 48,
    sixtyfourth: 56,
  } as Record<string, number>,
  OFFSET_X: HALF_SPACE + 0.25,
};

// =============================================================================
// BEAMING
// =============================================================================

export const BEAMING = {
  THICKNESS: 5,
  SPACING: 8,
  MAX_SLOPE: 1.0,
  EXTENSION_PX: 0.625,
};

// =============================================================================
// TUPLET BRACKETS
// =============================================================================

export const TUPLET = {
  HOOK_HEIGHT: 8,
  PADDING: 15,
  MAX_SLOPE: 0.5,
  NUMBER_FONT_SIZE: 11,
  NUMBER_OFFSET_UP: -4,
  NUMBER_OFFSET_DOWN: 12,
  VISUAL_NOTE_RADIUS: 8,
};

// =============================================================================
// TIE RENDERING
// =============================================================================

export const TIE = {
  START_GAP: 0,
  END_GAP: 5,
  VERTICAL_OFFSET: 8,
  MID_THICKNESS: 4,
  TIP_THICKNESS: 1.2,
};

// =============================================================================
// FLAG RENDERING (not SMuFL glyphs - see constants/SMuFL.ts for those)
// =============================================================================

export const FLAG_RENDERING = {
  SPACING: 7,
  SCALE_CLOSEST: 1.3,
  SCALE_OTHERS: 1.2,
  OFFSET: 3,
};

// =============================================================================
// STAFF LAYOUT & INTERACTION LIMITS
// =============================================================================

export const STAFF_LINES_COUNT = 5;
export const STAFF_HEIGHT = (STAFF_LINES_COUNT - 1) * SPACE; // 48px

// Visual limits for interactions
export const LEDGER_LINE_STEP = SPACE; // 12px step for full line
export const INNER_ZONE_LINES = 1.6; // Lines allowed in the gap between staves
export const OUTER_ZONE_LINES = 4.6; // Lines allowed outside the system

export const CLAMP_LIMITS = {
  // Inner zone (gap) limit: 2 ledger lines (24px)
  INNER_OFFSET: INNER_ZONE_LINES * LEDGER_LINE_STEP,

  // Outer zone (top of system) limit: 4 ledger lines up (-48px)
  OUTER_TOP: -(OUTER_ZONE_LINES * LEDGER_LINE_STEP),

  // Outer zone (bottom of system) limit: User preference (90px)
  // Accommodates 4 ledger lines down + breathing room
  OUTER_BOTTOM: 90,
};

export const MOUSE_OFFSET_SNAP = HALF_SPACE; // 6px

export const PIANO_RANGE = {
  min: 'A0', // MIDI 21
  max: 'C8', // MIDI 108
};
