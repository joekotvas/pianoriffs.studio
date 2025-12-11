import { CONFIG } from './config';


export const TIME_SIGNATURES: Record<string, number> = {
  '4/4': 64,
  '3/4': 48,
  '2/4': 32,
  '6/8': 48
};

export interface KeySignature {
  label: string;
  type: 'sharp' | 'flat';
  count: number;
  accidentals: string[];
}

export const KEY_SIGNATURES: Record<string, KeySignature> = {
  'C': { label: 'C Major', type: 'sharp', count: 0, accidentals: [] },
  'G': { label: 'G Major', type: 'sharp', count: 1, accidentals: ['F'] },
  'D': { label: 'D Major', type: 'sharp', count: 2, accidentals: ['F', 'C'] },
  'A': { label: 'A Major', type: 'sharp', count: 3, accidentals: ['F', 'C', 'G'] },
  'E': { label: 'E Major', type: 'sharp', count: 4, accidentals: ['F', 'C', 'G', 'D'] },
  'B': { label: 'B Major', type: 'sharp', count: 5, accidentals: ['F', 'C', 'G', 'D', 'A'] },
  'F#': { label: 'F# Major', type: 'sharp', count: 6, accidentals: ['F', 'C', 'G', 'D', 'A', 'E'] },
  'C#': { label: 'C# Major', type: 'sharp', count: 7, accidentals: ['F', 'C', 'G', 'D', 'A', 'E', 'B'] },
  'F': { label: 'F Major', type: 'flat', count: 1, accidentals: ['B'] },
  'Bb': { label: 'Bb Major', type: 'flat', count: 2, accidentals: ['B', 'E'] },
  'Eb': { label: 'Eb Major', type: 'flat', count: 3, accidentals: ['B', 'E', 'A'] },
  'Ab': { label: 'Ab Major', type: 'flat', count: 4, accidentals: ['B', 'E', 'A', 'D'] },
  'Db': { label: 'Db Major', type: 'flat', count: 5, accidentals: ['B', 'E', 'A', 'D', 'G'] },
  'Gb': { label: 'Gb Major', type: 'flat', count: 6, accidentals: ['B', 'E', 'A', 'D', 'G', 'C'] },
  'Cb': { label: 'Cb Major', type: 'flat', count: 7, accidentals: ['B', 'E', 'A', 'D', 'G', 'C', 'F'] }
};

// Offsets for drawing key signature accidentals (relative to base Y)
// These follow standard notation rules for placement
export interface KeySignatureOffsets {
  treble: {
    sharp: Record<string, number>;
    flat: Record<string, number>;
  };
  bass: {
    sharp: Record<string, number>;
    flat: Record<string, number>;
  };
}

export const KEY_SIGNATURE_OFFSETS: KeySignatureOffsets = {
  treble: {
    sharp: {
      'F': 2, 'C': 20, 'G': -4, 'D': 14, 'A': 32, 'E': 8, 'B': 26
    },
    flat: {
      'B': 24, 'E': 6, 'A': 30, 'D': 12, 'G': 36, 'C': 18, 'F': 42
    }
  },
  bass: {
    sharp: {
      'F': 14, 'C': 32, 'G': 8, 'D': 26, 'A': 2, 'E': 20, 'B': -4
    },
    flat: {
      'B': 36, 'E': 18, 'A': 42, 'D': 24, 'G': 48, 'C': 30, 'F': 54
    }
  }
};

export const NOTE_SPACING_BASE_UNIT = 16;
export const WHOLE_REST_WIDTH = 12;
export const DEFAULT_SCALE = 1;

export const MIDDLE_LINE_Y = CONFIG.baseY + 24;

export const TREBLE_CLEF_PATH = "m51.688 5.25c-5.427-0.1409-11.774 12.818-11.563 24.375 0.049 3.52 1.16 10.659 2.781 19.625-10.223 10.581-22.094 21.44-22.094 35.688-0.163 13.057 7.817 29.692 26.75 29.532 2.906-0.02 5.521-0.38 7.844-1 1.731 9.49 2.882 16.98 2.875 20.44 0.061 13.64-17.86 14.99-18.719 7.15 3.777-0.13 6.782-3.13 6.782-6.84 0-3.79-3.138-6.88-7.032-6.88-2.141 0-4.049 0.94-5.343 2.41-0.03 0.03-0.065 0.06-0.094 0.09-0.292 0.31-0.538 0.68-0.781 1.1-0.798 1.35-1.316 3.29-1.344 6.06 0 11.42 28.875 18.77 28.875-3.75 0.045-3.03-1.258-10.72-3.156-20.41 20.603-7.45 15.427-38.04-3.531-38.184-1.47 0.015-2.887 0.186-4.25 0.532-1.08-5.197-2.122-10.241-3.032-14.876 7.199-7.071 13.485-16.224 13.344-33.093 0.022-12.114-4.014-21.828-8.312-21.969zm1.281 11.719c2.456-0.237 4.406 2.043 4.406 7.062 0.199 8.62-5.84 16.148-13.031 23.719-0.688-4.147-1.139-7.507-1.188-9.5 0.204-13.466 5.719-20.886 9.813-21.281zm-7.719 44.687c0.877 4.515 1.824 9.272 2.781 14.063-12.548 4.464-18.57 21.954-0.781 29.781-10.843-9.231-5.506-20.158 2.312-22.062 1.966 9.816 3.886 19.502 5.438 27.872-2.107 0.74-4.566 1.17-7.438 1.19-7.181 0-21.531-4.57-21.531-21.875 0-14.494 10.047-20.384 19.219-28.969zm6.094 21.469c0.313-0.019 0.652-0.011 0.968 0 13.063 0 17.99 20.745 4.688 27.375-1.655-8.32-3.662-17.86-5.656-27.375z";

export const BASS_CLEF_PATH = "m190.85 451.25c11.661 14.719 32.323 24.491 55.844 24.491 36.401 0 65.889-23.372 65.889-52.214s-29.488-52.214-65.889-52.214c-20.314 4.1522-28.593 9.0007-33.143-2.9091 17.976-54.327 46.918-66.709 96.546-66.709 65.914 0 96.969 59.897 96.969 142.97-18.225 190.63-205.95 286.75-246.57 316.19 5.6938 13.103 5.3954 12.631 5.3954 12.009 189.78-86.203 330.69-204.43 330.69-320.74 0-92.419-58.579-175.59-187.72-172.8-77.575 0-170.32 86.203-118 171.93zm328.1-89.88c0 17.852 14.471 32.323 32.323 32.323s32.323-14.471 32.323-32.323-14.471-32.323-32.323-32.323-32.323 14.471-32.323 32.323zm0 136.75c0 17.852 14.471 32.323 32.323 32.323s32.323-14.471 32.323-32.323-14.471-32.323-32.323-32.323-32.323 14.471-32.323 32.323z";

export interface ClefType {
  label: string;
  path?: string;
  viewBox?: string;
  scale?: number;
  offsetY?: number;
  isGrand?: boolean;
}

export const CLEF_TYPES: Record<string, ClefType> = {
  treble: { label: 'Treble', path: TREBLE_CLEF_PATH, viewBox: '0 0 70 160', scale: 0.55, offsetY: -15 },
  bass: { label: 'Bass', path: BASS_CLEF_PATH, viewBox: '150 270 400 520', scale: 0.09, offsetY: 2 },
  grand: { label: 'Grand', isGrand: true }
};

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
  whole: { duration: 64, label: 'Whole', fill: 'transparent', stroke: 'black', stem: false, abcDuration: '4', xmlType: 'whole' },
  half: { duration: 32, label: 'Half', fill: 'transparent', stroke: 'black', stem: true, abcDuration: '2', xmlType: 'half' },
  quarter: { duration: 16, label: 'Quarter', fill: 'black', stroke: 'black', stem: true, abcDuration: '', xmlType: 'quarter' },
  eighth: { duration: 8, label: 'Eighth', fill: 'black', stroke: 'black', stem: true, flag: 1, abcDuration: '/2', xmlType: 'eighth' },
  sixteenth: { duration: 4, label: '16th', fill: 'black', stroke: 'black', stem: true, flag: 2, abcDuration: '/4', xmlType: '16th' },
  thirtysecond: { duration: 2, label: '32nd', fill: 'black', stroke: 'black', stem: true, flag: 3, abcDuration: '/8', xmlType: '32nd' },
  sixtyfourth: { duration: 1, label: '64th', fill: 'black', stroke: 'black', stem: true, flag: 4, abcDuration: '/16', xmlType: '64th' },
};

// ========== LAYOUT CONSTANTS ==========
// Derived from CONFIG.lineHeight for consistency and scalability

const HALF_SPACE = CONFIG.lineHeight / 2;  // 6
const SPACE = CONFIG.lineHeight;           // 12

export const LAYOUT = {
  // Core Primitives
  LINE_STROKE_WIDTH: 1.5,
  NOTE_RX: 6,
  NOTE_RY: 4,
  DOT_RADIUS: 3,
  
  // Derived from lineHeight
  SECOND_INTERVAL_SHIFT: SPACE - 1,    // 11 (note displacement for seconds)
  SECOND_INTERVAL_SPACE: HALF_SPACE,   // 6 (extra width for second spacing)
  DOT_OFFSET_X: SPACE,                 // 12
  LEDGER_LINE_EXTENSION: SPACE - 2,    // 10
  
  // Accidentals
  ACCIDENTAL: {
    OFFSET_X: -16,
    OFFSET_Y: 6,
    FONT_SIZE: 22,
    SPACING: HALF_SPACE + 2,  // 8
  },
  
  // Hit Detection
  HIT_AREA: {
    WIDTH: 20,
    HEIGHT: 12,
    OFFSET_X: -10,
    OFFSET_Y: -6 ,
  },
  HIT_ZONE_RADIUS: 14,
  APPEND_ZONE_WIDTH: 2000,
  
  // Min widths for short notes (multipliers of NOTE_SPACING_BASE_UNIT)
  MIN_WIDTH_FACTORS: {
    sixtyfourth: 1.2,
    thirtysecond: 1.5,
    sixteenth: 1.8,
    eighth: 2.2,
  } as Record<string, number>,
  
  // Lookahead padding factor for accidentals
  LOOKAHEAD_PADDING_FACTOR: 0.3,
};

export const STEM = {
  LENGTHS: {
    default: 35,
    thirtysecond: 45,
    sixtyfourth: 55,
  } as Record<string, number>,
  OFFSET_X: HALF_SPACE + .22,  // 7 - Horizontal offset for Bravura notehead width
};

export const BEAMING = {
  THICKNESS: 5,
  SPACING: 8,
  MAX_SLOPE: 1.0,
  EXTENSION_PX: 1,
};

export const TUPLET = {
  HOOK_HEIGHT: 8,
  PADDING: 15,
  MAX_SLOPE: 0.5,
  NUMBER_FONT_SIZE: 11,
  NUMBER_OFFSET_UP: -4,
  NUMBER_OFFSET_DOWN: 12,
  VISUAL_NOTE_RADIUS: 8,
};

export const TIE = {
  START_GAP: 0,
  END_GAP: 5,
  VERTICAL_OFFSET: 8,
  MID_THICKNESS: 4,
  TIP_THICKNESS: 1.2,
};

export const FLAGS = {
  SPACING: 7,
  SCALE_CLOSEST: 1.3,
  SCALE_OTHERS: 1.2,
  OFFSET: 3,
};

