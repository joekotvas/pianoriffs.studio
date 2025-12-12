/**
 * SMuFL (Standard Music Font Layout) Constants
 * 
 * This file contains Unicode codepoints for music symbols as defined by SMuFL.
 * These codepoints are used with the Bravura font to render high-quality music notation.
 * 
 * Reference: https://w3c.github.io/smufl/latest/tables/
 */

// ========== NOTEHEADS ==========
export const NOTEHEADS = {
  doubleWhole: '\uE0A0',
  whole: '\uE0A2',
  half: '\uE0A3',
  black: '\uE0A4',       // Quarter note and shorter
  
  // Parenthesized noteheads
  parenthesisLeft: '\uE0F5',
  parenthesisRight: '\uE0F6',
} as const;

// ========== RESTS ==========
export const RESTS = {
  maxima: '\uE4E0',
  longa: '\uE4E1',
  doubleWhole: '\uE4E2',
  whole: '\uE4E3',
  half: '\uE4E4',
  quarter: '\uE4E5',
  eighth: '\uE4E6',
  sixteenth: '\uE4E7',
  thirtysecond: '\uE4E8',
  sixtyfourth: '\uE4E9',
  oneHundredTwentyEighth: '\uE4EA',
} as const;

// Duration name to glyph mapping
export const REST_GLYPHS: Record<string, string> = {
  whole: RESTS.whole,
  half: RESTS.half,
  quarter: RESTS.quarter,
  eighth: RESTS.eighth,
  sixteenth: RESTS.sixteenth,
  thirtysecond: RESTS.thirtysecond,
  sixtyfourth: RESTS.sixtyfourth,
};

// ========== CLEFS ==========
export const CLEFS = {
  gClef: '\uE050',           // Treble clef
  gClef8vb: '\uE052',        // Treble clef with 8 below
  gClef8va: '\uE053',        // Treble clef with 8 above
  fClef: '\uE062',           // Bass clef
  fClef8vb: '\uE064',        // Bass clef with 8 below
  fClef8va: '\uE065',        // Bass clef with 8 above
  cClef: '\uE05C',           // Alto/Tenor clef
} as const;

// ========== ACCIDENTALS ==========
export const ACCIDENTALS = {
  flat: '\uE260',
  natural: '\uE261',
  sharp: '\uE262',
  doubleSharp: '\uE263',
  doubleFlat: '\uE264',
  
  // Parenthesized
  parenthesisLeft: '\uE26A',
  parenthesisRight: '\uE26B',
} as const;

// ========== FLAGS ==========
export const FLAGS = {
  // Up flags
  eighthUp: '\uE240',
  sixteenthUp: '\uE242',
  thirtysecondUp: '\uE244',
  sixtyfourthUp: '\uE246',
  oneHundredTwentyEighthUp: '\uE248',
  
  // Down flags
  eighthDown: '\uE241',
  sixteenthDown: '\uE243',
  thirtysecondDown: '\uE245',
  sixtyfourthDown: '\uE247',
  oneHundredTwentyEighthDown: '\uE249',
} as const;

// ========== PRECOMPOSED NOTES (notehead + stem + flags) ==========
// Stem up versions - keys match duration names for direct lookup
export const PRECOMPOSED_NOTES_UP = {
  whole: '\uE1D2',        // noteWhole (no stem)
  half: '\uE1D3',         // noteHalfUp
  quarter: '\uE1D5',      // noteQuarterUp
  eighth: '\uE1D7',       // note8thUp
  sixteenth: '\uE1D9',    // note16thUp
  thirtysecond: '\uE1DB', // note32ndUp
  sixtyfourth: '\uE1DD',  // note64thUp
} as const;

// Stem down versions
export const PRECOMPOSED_NOTES_DOWN = {
  whole: '\uE1D2',        // noteWhole (same, no stem)
  half: '\uE1D4',         // noteHalfDown
  quarter: '\uE1D6',      // noteQuarterDown
  eighth: '\uE1D8',       // note8thDown
  sixteenth: '\uE1DA',    // note16thDown
  thirtysecond: '\uE1DC', // note32ndDown
  sixtyfourth: '\uE1DE',  // note64thDown
} as const;

// ========== TIME SIGNATURES ==========
export const TIME_SIG_DIGITS = {
  0: '\uE080',
  1: '\uE081',
  2: '\uE082',
  3: '\uE083',
  4: '\uE084',
  5: '\uE085',
  6: '\uE086',
  7: '\uE087',
  8: '\uE088',
  9: '\uE089',
  common: '\uE08A',     // C (common time)
  cutCommon: '\uE08B',  // Cut C (alla breve)
} as const;

// ========== AUGMENTATION DOT ==========
export const DOTS = {
  augmentationDot: '\uE1E7',
} as const;

// ========== DYNAMICS ==========
export const DYNAMICS = {
  piano: '\uE520',
  mezzo: '\uE521',
  forte: '\uE522',
  rinforzando: '\uE523',
  sforzando: '\uE524',
  z: '\uE525',
  niente: '\uE526',
  
  // Combined dynamics
  ppp: '\uE52A',
  pp: '\uE52B',
  mp: '\uE52C',
  mf: '\uE52D',
  pf: '\uE52E',
  ff: '\uE52F',
  fff: '\uE530',
  fp: '\uE534',
  fz: '\uE535',
  sf: '\uE536',
  sfp: '\uE537',
  sfz: '\uE539',
  sffz: '\uE53B',
  sfff: '\uE53C',
} as const;

// ========== ARTICULATIONS ==========
export const ARTICULATIONS = {
  accentAbove: '\uE4A0',
  accentBelow: '\uE4A1',
  staccatoAbove: '\uE4A2',
  staccatoBelow: '\uE4A3',
  tenutoAbove: '\uE4A4',
  tenutoBelow: '\uE4A5',
  staccatissimoAbove: '\uE4A6',
  staccatissimoBelow: '\uE4A7',
  marcatoAbove: '\uE4AC',
  marcatoBelow: '\uE4AD',
} as const;

// ========== BARLINES ==========
export const BARLINES = {
  single: '\uE030',
  double: '\uE031',
  final: '\uE032',
  repeatLeft: '\uE040',
  repeatRight: '\uE041',
  repeatDots: '\uE043',
} as const;

// ========== ORNAMENTS ==========
export const ORNAMENTS = {
  trill: '\uE566',
  turn: '\uE567',
  mordent: '\uE56C',
  mordentInverted: '\uE56D',
  trillNatural: '\uE569',
  trillSharp: '\uE56A',
  trillFlat: '\uE56B',
} as const;

// ========== HOLDS AND PAUSES ==========
export const HOLDS = {
  fermataAbove: '\uE4C0',
  fermataBelow: '\uE4C1',
  fermataShortAbove: '\uE4C4',
  fermataShortBelow: '\uE4C5',
  fermataLongAbove: '\uE4C6',
  fermataLongBelow: '\uE4C7',
  breathMark: '\uE4CE',
  caesura: '\uE4D1',
} as const;

// ========== FONT CONFIGURATION ==========
/**
 * SMuFL fonts are designed with 1 staff space = 0.25em
 * For a given staff space in pixels, font size = staffSpace * 4
 * 
 * Example: For 12px staff spacing, use 48px font size
 */
export const getFontSize = (staffSpace: number): number => staffSpace * 4;

/**
 * Bravura font family with fallback
 */
export const BRAVURA_FONT = "'Bravura', serif";

// ========== COMBINED EXPORT ==========
export const SMUFL = {
  noteheads: NOTEHEADS,
  rests: RESTS,
  clefs: CLEFS,
  accidentals: ACCIDENTALS,
  flags: FLAGS,
  timeSigDigits: TIME_SIG_DIGITS,
  dots: DOTS,
  dynamics: DYNAMICS,
  articulations: ARTICULATIONS,
  barlines: BARLINES,
  ornaments: ORNAMENTS,
  holds: HOLDS,
} as const;

export default SMUFL;
