import { ThemeName } from './themes';

/**
 * Type definitions for the Sheet Music Editor
 *
 * This file defines the data model for scores, staves, measures, events, and notes.
 * The model supports multiple staves for Grand Staff rendering.
 */

// ========== NOTE ==========

export interface Note {
  id: string | number;
  pitch: string | null; // e.g., 'C4', 'D#5', 'Bb3', or null for rests
  accidental?: 'sharp' | 'flat' | 'natural' | null;
  tied?: boolean; // Tied to next note
  isRest?: boolean; // True for rest notes (pitchless)
}

// ========== EVENT ==========

export interface ScoreEvent {
  id: string | number;
  duration: string; // 'whole', 'half', 'quarter', etc.
  dotted: boolean;
  notes: Note[]; // Multiple notes = chord
  isRest?: boolean;
  tuplet?: {
    ratio: [number, number]; // e.g., [3, 2] for triplet (3 notes in space of 2)
    groupSize: number; // Total notes in tuplet group (e.g., 3 for triplet)
    position: number; // Position within tuplet (0, 1, 2 for triplet)
    baseDuration?: string; // Base duration of the tuplet (e.g., 'eighth' for eighth note triplet)
    id?: string; // Unique ID for the tuplet group
  };
}

// ========== MEASURE ==========

export interface Measure {
  id: string | number;
  events: ScoreEvent[];
  isPickup?: boolean;
}

// ========== STAFF ==========

export interface Staff {
  id: string | number;
  clef: 'treble' | 'bass' | 'grand';
  keySignature: string; // e.g., 'C', 'G', 'F', 'Bb'
  measures: Measure[];
}

// ========== SCORE ==========

export interface Score {
  title: string;
  timeSignature: string; // Shared across staves (e.g., '4/4', '3/4')
  keySignature: string; // Shared across staves (e.g., 'C', 'G')
  bpm: number;
  staves: Staff[];
}

// ========== HELPER FUNCTIONS ==========

/**
 * Creates a default empty score with a single treble staff
 */
export const createDefaultScore = (): Score => ({
  title: 'Composition',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        { id: 'm1', events: [] },
        { id: 'm2', events: [] },
      ],
    },
    {
      id: 'staff-2',
      clef: 'bass',
      keySignature: 'C',
      measures: [
        { id: 'm1-bass', events: [] },
        { id: 'm2-bass', events: [] },
      ],
    },
  ],
});

/**
 * Gets the active staff from a score (currently always the first staff)
 * In future, this could support staff switching for Grand Staff editing
 */
export const getActiveStaff = (score: Score, staffIndex: number = 0): Staff => {
  return score.staves[staffIndex] || score.staves[0];
};

/**
 * Migrates an old-format score to the new staves model
 * Also syncs top-level legacy fields (measures, keySignature, clef) back to staves[0]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accepts unknown legacy score formats
export const migrateScore = (oldScore: any): Score => {
  // If already in new format with staves
  if (oldScore.staves && Array.isArray(oldScore.staves)) {
    // Sync any top-level legacy fields back to staves[0]
    // This handles the case where code does: setScore({ ...score, measures: newMeasures })
    const result = { ...oldScore };

    // Ensure Score has keySignature
    if (!result.keySignature) {
      result.keySignature = result.staves[0]?.keySignature || 'C';
    }

    if (result.staves[0]) {
      const updatedStaff = { ...result.staves[0] };
      // If top-level measures exists and differs from staves[0].measures, use top-level
      if (oldScore.measures && oldScore.measures !== result.staves[0].measures) {
        updatedStaff.measures = oldScore.measures;
      }
      // If top-level keySignature exists and differs, use top-level
      if (oldScore.keySignature && oldScore.keySignature !== result.staves[0].keySignature) {
        updatedStaff.keySignature = oldScore.keySignature;
        result.keySignature = oldScore.keySignature; // Sync to Score
      }
      // If top-level clef exists and differs, use top-level
      if (oldScore.clef && oldScore.clef !== result.staves[0].clef) {
        updatedStaff.clef = oldScore.clef;
      }

      // Sync timeSignature from staff to score if score is missing it (common in imported melodies)
      if (!result.timeSignature && updatedStaff.timeSignature) {
        result.timeSignature = updatedStaff.timeSignature;
      }

      result.staves = [updatedStaff, ...result.staves.slice(1)];
    }
    return result as Score;
  }

  // Migrate legacy single-staff format (no staves array)
  return {
    title: oldScore.title || 'Composition',
    timeSignature: oldScore.timeSignature || '4/4',
    keySignature: oldScore.keySignature || 'C',
    bpm: oldScore.bpm || 120,
    staves: [
      {
        id: 'staff-1',
        clef: oldScore.clef || 'treble',
        keySignature: oldScore.keySignature || 'C',
        measures: oldScore.measures || [
          { id: 'm1', events: [] },
          { id: 'm2', events: [] },
        ],
      },
    ],
  };
};

// ========== MELODY ==========

export interface Melody {
  id: string;
  title: string;
  score: Score;
}

// ========== SELECTION ==========

/**
 * Represents a note in the selection array
 */
export interface SelectedNote {
  staffIndex: number;
  measureIndex: number;
  eventId: string | number;
  noteId: string | number | null;
}

/**
 * Selection State for the editor
 */
export interface Selection {
  staffIndex: number; // Index of the selected staff (0 for single staff, 0 or 1 for Grand Staff)
  measureIndex: number | null; // Index of the selected measure
  eventId: string | number | null; // ID of the selected event
  noteId: string | number | null; // ID of the selected note (for chords)
  selectedNotes: SelectedNote[]; // List of all selected notes (including the primary one above)
  anchor?: SelectedNote | null; // The static "anchor" point for range selection
}

/**
 * Creates a default empty selection
 */
export const createDefaultSelection = (): Selection => ({
  staffIndex: 0,
  measureIndex: null,
  eventId: null,
  noteId: null,
  selectedNotes: [],
  anchor: null,
});

// ========== PREVIEW NOTE (GHOST CURSOR) ==========

/**
 * Represents the ghost cursor state for note preview.
 * Used when navigating to empty space where a note could be placed.
 */
export interface PreviewNote {
  measureIndex: number;
  staffIndex: number;
  quant: number; // Position in quants within measure
  visualQuant: number; // Visual position (may differ for display)
  pitch: string; // Preview pitch (e.g., "C4")
  duration: string; // Duration name ('quarter', 'half', etc.)
  dotted: boolean;
  mode: 'APPEND' | 'INSERT'; // Append at end or insert at position
  index: number; // Event index where this would be inserted
  isRest: boolean;
  source?: 'keyboard' | 'mouse'; // How the ghost cursor was triggered
}

// ========== NAVIGATION RESULT TYPES ==========

/**
 * Audio feedback data for playing notes after navigation.
 */
export interface AudioFeedback {
  notes: Array<{ pitch: string; id?: string | number }>;
  duration: string;
  dotted: boolean;
}

/**
 * Partial selection used in navigation results.
 * Contains the core fields needed to update selection state.
 */
export interface NavigationSelection {
  staffIndex: number;
  measureIndex: number | null;
  eventId: string | number | null;
  noteId: string | number | null;
  selectedNotes?: Array<{
    staffIndex: number;
    measureIndex: number;
    eventId: string | number;
    noteId: string | number | null;
  }>;
  anchor?: {
    staffIndex: number;
    measureIndex: number;
    eventId: string | number;
    noteId: string | number | null;
  } | null;
}

/**
 * Result of horizontal navigation (left/right arrows).
 */
export interface HorizontalNavigationResult {
  selection: NavigationSelection;
  previewNote: PreviewNote | null;
  audio: AudioFeedback | null;
  shouldCreateMeasure: boolean;
}

/**
 * Result of vertical navigation (CMD+Up/Down).
 */
export interface VerticalNavigationResult {
  selection: NavigationSelection;
  previewNote: PreviewNote | null;
}

/**
 * Result of transposition operations.
 */
export interface TranspositionResult {
  measures?: Measure[]; // Updated measures (for real note transposition)
  previewNote?: PreviewNote; // Updated preview (for ghost cursor transposition)
  audio: AudioFeedback | null;
}

// ========== RIFFSCORE CONFIG ==========

/**
 * Utility type for allowing partial nested objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Staff template options for score generation
 */
export type StaffTemplate = 'grand' | 'treble' | 'bass';

/**
 * Configuration interface for RiffScore component.
 * Supports two modes:
 * - Generator Mode: Pass `staff` + `measureCount` to create blank scores
 * - Render Mode: Pass `staves` array to load existing compositions
 */
/**
 * Configuration interface for RiffScore component.
 * Supports two modes:
 * - Generator Mode: Pass `staff` + `measureCount` to create blank scores
 * - Render Mode: Pass `staves` array to load existing compositions
 */
export interface RiffScoreConfig {
  ui: {
    showToolbar: boolean;
    scale: number;
    theme?: ThemeName;
  };
  interaction: {
    isEnabled: boolean; // Master switch for all interactions
    enableKeyboard: boolean;
    enablePlayback: boolean;
  };
  score: {
    title: string;
    bpm: number;
    timeSignature: string;
    keySignature: string;

    // Generator Mode Options
    staff?: StaffTemplate;
    measureCount?: number;

    // Explicit Content (Overrides Generator Options)
    staves?: Staff[];
  };
}

/**
 * Default RiffScore configuration
 */
export const DEFAULT_RIFF_CONFIG: RiffScoreConfig = {
  ui: {
    showToolbar: true,
    scale: 1,
  },
  interaction: {
    isEnabled: true,
    enableKeyboard: true,
    enablePlayback: true,
  },
  score: {
    title: 'Untitled',
    bpm: 120,
    timeSignature: '4/4',
    keySignature: 'C',
    staff: 'grand',
    measureCount: 4,
  },
};
