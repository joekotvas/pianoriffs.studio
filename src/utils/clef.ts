/**
 * Clef Configuration Utilities
 *
 * Derives full clef configuration from minimal reference data using
 * the Open-Closed Principle. To add a new clef, only add an entry
 * to CLEF_REFERENCES with referencePitch and referenceLine.
 *
 * @see ADR-007: Open-Closed Clef Reference Pattern
 */

// =============================================================================
// CLEF REFERENCE DATA
// =============================================================================

interface ClefReference {
  /** Reference pitch (e.g., 'G4' for treble, 'F3' for bass, 'C4' for C-clefs) */
  referencePitch: string;
  /** Staff line where reference pitch sits (1-5, bottom to top) */
  referenceLine: 1 | 2 | 3 | 4 | 5;
}

/**
 * Minimal reference data for each clef.
 * ALL other values are derived from this.
 */
const CLEF_REFERENCES: Record<string, ClefReference> = {
  treble: { referencePitch: 'G4', referenceLine: 2 },
  bass:   { referencePitch: 'F3', referenceLine: 4 },
  alto:   { referencePitch: 'C4', referenceLine: 3 },
  tenor:  { referencePitch: 'C4', referenceLine: 4 },
  grand:  { referencePitch: 'G4', referenceLine: 2 }, // Uses treble clef
};

// =============================================================================
// DERIVATION HELPERS
// =============================================================================

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const MIDI_BASE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Calculate pitch at a given diatonic step offset from reference */
const getPitchAtOffset = (referencePitch: string, steps: number): string => {
  const match = referencePitch.match(/^([A-G])(\d)$/);
  if (!match) return 'C4';
  
  let noteIndex = NOTES.indexOf(match[1]);
  let octave = parseInt(match[2], 10);
  
  noteIndex += steps;
  while (noteIndex >= 7) { noteIndex -= 7; octave++; }
  while (noteIndex < 0) { noteIndex += 7; octave--; }
  
  return `${NOTES[noteIndex]}${octave}`;
};

/** Convert pitch string to MIDI number */
const pitchToMidi = (pitch: string): number => {
  const match = pitch.match(/^([A-G])(\d)$/);
  if (!match) return 60; // C4 fallback
  return 12 + parseInt(match[2], 10) * 12 + MIDI_BASE[match[1]];
};

/** Generate staff line pitches from reference pitch and line */
const generateStaffLines = (
  referencePitch: string,
  referenceLine: number
): [string, string, string, string, string] => {
  const lines: string[] = [];
  for (let line = 1; line <= 5; line++) {
    const stepsFromRef = (line - referenceLine) * 2; // Each line = 2 diatonic steps
    lines.push(getPitchAtOffset(referencePitch, stepsFromRef));
  }
  return lines as [string, string, string, string, string];
};

// =============================================================================
// CLEF CONFIG TYPES & EXPORTS
// =============================================================================

/** Full clef configuration with all derived values */
export interface ClefConfig {
  /** Default pitch for ghost cursor/preview */
  defaultPitch: string;
  /** Center pitch when converting rests to notes */
  centerPitch: string;
  /** MIDI value for rest positioning in vertical stack */
  restMidi: number;
  /** Staff line pitches (Line 1 to Line 5, bottom to top) */
  staffLines: [string, string, string, string, string];
}

/** Derive full clef config from just reference pitch and line */
const deriveClefConfig = (ref: ClefReference): ClefConfig => {
  const staffLines = generateStaffLines(ref.referencePitch, ref.referenceLine);
  
  // centerPitch: For C-clefs (reference is C4), use the reference pitch (C4 is musically central)
  // For other clefs, use the middle line (Line 3)
  const isCClef = ref.referencePitch === 'C4';
  const centerPitch = isCClef ? ref.referencePitch : staffLines[2];
  
  // restMidi: MIDI value of center pitch - used for vertical stack sorting
  const restMidi = pitchToMidi(centerPitch);
  
  // defaultPitch: 'C' in the clef's primary octave
  // Find which octave of 'C' is closest to the center of the staff
  const centerMidi = restMidi;
  const c3Midi = 48, c4Midi = 60;
  const defaultPitch = Math.abs(centerMidi - c3Midi) < Math.abs(centerMidi - c4Midi) ? 'C3' : 'C4';
  
  return { defaultPitch, centerPitch, restMidi, staffLines };
};

/** Pre-computed clef configurations - all values derived from CLEF_REFERENCES */
export const CLEF_CONFIG: Record<string, ClefConfig> = Object.fromEntries(
  Object.entries(CLEF_REFERENCES).map(([clef, ref]) => [clef, deriveClefConfig(ref)])
) as Record<string, ClefConfig>;

/**
 * Get clef configuration, falling back to treble for unknown clefs.
 */
export const getClefConfig = (clef: string): ClefConfig =>
  CLEF_CONFIG[clef] || CLEF_CONFIG.treble;
