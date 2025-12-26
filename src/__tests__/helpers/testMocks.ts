/**
 * Shared Test Mock Factories
 *
 * Centralized mock creation helpers for use across all test files.
 * Consolidates common patterns to reduce duplication and ensure
 * type safety across tests.
 *
 * @module testMocks
 */

import type { Score, Selection, ScoreEvent, Note, Measure, Staff } from '@/types';

// =============================================================================
// SCORE BUILDERS
// =============================================================================

/**
 * Default score properties that satisfy the Score interface.
 * Can be overridden via the options parameter.
 */
export const DEFAULT_SCORE_PROPS = {
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
} as const;

/**
 * Creates a minimal Score for testing.
 * Customize by passing events, measures, or full staves.
 *
 * @example
 * // Empty score
 * const score = createTestScore();
 *
 * // Score with custom events
 * const score = createTestScore({
 *   events: [createTestEvent('e1', [{ id: 'n1', pitch: 'C4' }])]
 * });
 *
 * // Score with custom measures
 * const score = createTestScore({ measures: [{ id: 'm1', events: [] }] });
 */
export function createTestScore(
  options: {
    title?: string;
    timeSignature?: string;
    keySignature?: string;
    bpm?: number;
    events?: ScoreEvent[];
    measures?: Measure[];
    staves?: Staff[];
  } = {}
): Score {
  const {
    title = DEFAULT_SCORE_PROPS.title,
    timeSignature = DEFAULT_SCORE_PROPS.timeSignature,
    keySignature = DEFAULT_SCORE_PROPS.keySignature,
    bpm = DEFAULT_SCORE_PROPS.bpm,
    events,
    measures,
    staves,
  } = options;

  // If staves provided, use them directly
  if (staves) {
    return { title, timeSignature, keySignature, bpm, staves };
  }

  // If measures provided, wrap in a single staff
  if (measures) {
    return {
      title,
      timeSignature,
      keySignature,
      bpm,
      staves: [
        {
          id: 'staff-1',
          clef: 'treble',
          keySignature,
          measures,
        },
      ],
    };
  }

  // If events provided, wrap in a single measure and staff
  if (events) {
    return {
      title,
      timeSignature,
      keySignature,
      bpm,
      staves: [
        {
          id: 'staff-1',
          clef: 'treble',
          keySignature,
          measures: [{ id: 'm1', events }],
        },
      ],
    };
  }

  // Default: empty score with 2 measures
  return {
    title,
    timeSignature,
    keySignature,
    bpm,
    staves: [
      {
        id: 'staff-1',
        clef: 'treble',
        keySignature,
        measures: [
          { id: 'm1', events: [] },
          { id: 'm2', events: [] },
        ],
      },
    ],
  };
}

/**
 * Creates a grand staff score (treble + bass).
 */
export function createGrandStaffScore(
  options: {
    trebleEvents?: ScoreEvent[];
    bassEvents?: ScoreEvent[];
  } = {}
): Score {
  return {
    ...DEFAULT_SCORE_PROPS,
    staves: [
      {
        id: 'staff-treble',
        clef: 'treble',
        keySignature: 'C',
        measures: [{ id: 'm1-treble', events: options.trebleEvents ?? [] }],
      },
      {
        id: 'staff-bass',
        clef: 'bass',
        keySignature: 'C',
        measures: [{ id: 'm1-bass', events: options.bassEvents ?? [] }],
      },
    ],
  };
}

// =============================================================================
// EVENT & NOTE BUILDERS
// =============================================================================

/**
 * Creates a test event with sensible defaults.
 *
 * @example
 * createTestEvent('e1', [{ id: 'n1', pitch: 'C4' }]);
 * createTestEvent('rest', [], { isRest: true });
 */
export function createTestEvent(
  id: string | number,
  notes: Array<{ id: string | number; pitch: string | null }>,
  options: {
    duration?: string;
    dotted?: boolean;
    isRest?: boolean;
  } = {}
): ScoreEvent {
  return {
    id,
    duration: options.duration ?? 'quarter',
    dotted: options.dotted ?? false,
    isRest: options.isRest,
    notes: notes.map((n) => ({ id: n.id, pitch: n.pitch })),
  };
}

/**
 * Creates a test note.
 */
export function createTestNote(
  id: string | number,
  pitch: string | null,
  options: { tied?: boolean; isRest?: boolean } = {}
): Note {
  return {
    id,
    pitch,
    tied: options.tied,
    isRest: options.isRest,
  };
}

// =============================================================================
// SELECTION BUILDERS
// =============================================================================

/**
 * Creates an empty selection.
 */
export function createEmptySelection(): Selection {
  return {
    staffIndex: 0,
    measureIndex: null,
    eventId: null,
    noteId: null,
    selectedNotes: [],
    anchor: null,
  };
}

/**
 * Creates a selection pointing to a specific note.
 *
 * @example
 * createTestSelection(0, 'e1', 'n1');
 * createTestSelection(0, 'e1'); // noteId defaults to null
 */
export function createTestSelection(
  measureIndex: number | null,
  eventId: string | number | null,
  noteId: string | number | null = null,
  staffIndex: number = 0
): Selection {
  const hasSelection = measureIndex !== null && eventId !== null;

  return {
    staffIndex,
    measureIndex,
    eventId,
    noteId,
    selectedNotes: hasSelection ? [{ staffIndex, measureIndex, eventId, noteId }] : [],
    anchor: hasSelection ? { staffIndex, measureIndex, eventId, noteId } : null,
  };
}

// =============================================================================
// KEYBOARD EVENT BUILDER
// =============================================================================

/**
 * Creates a mock KeyboardEvent for testing keyboard handlers.
 *
 * @example
 * const event = createMockKeyboardEvent({ key: 'p' });
 * handlePlayback(event, ...);
 */
export function createMockKeyboardEvent(
  overrides: {
    key?: string;
    code?: string;
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
  } = {}
): { preventDefault: jest.Mock; stopPropagation: jest.Mock } & typeof overrides {
  return {
    key: '',
    code: '',
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...overrides,
  };
}
