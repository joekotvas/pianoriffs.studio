/**
 * Shared Test Fixtures for Selection Tests
 *
 * Reusable test scores and selection builders for testing
 * selection commands and vertical operations.
 */

import type { Selection, Score } from '@/types';

// =============================================================================
// SCORE FIXTURES
// =============================================================================

/**
 * Create a standard test score with treble and bass staves.
 * - Treble: M0 has 3-note chord + single note; M1 has 2-note chord
 * - Bass: M0 has 2-note chord + single note; M1 has a rest
 */
export const createTestScore = (): Score => ({
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble-staff',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [
            {
              id: 'e0',
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'n0', pitch: 'C4' },
                { id: 'n1', pitch: 'E4' },
                { id: 'n2', pitch: 'G4' },
              ],
            },
            {
              id: 'e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'n3', pitch: 'D4' }],
            },
          ],
        },
        {
          id: 'm1',
          events: [
            {
              id: 'e2',
              duration: 'half',
              dotted: false,
              notes: [
                { id: 'n4', pitch: 'E4' },
                { id: 'n5', pitch: 'G4' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'bass-staff',
      clef: 'bass',
      keySignature: 'C',
      measures: [
        {
          id: 'bass-m0',
          events: [
            {
              id: 'bass-e0',
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'bass-n0', pitch: 'C3' },
                { id: 'bass-n1', pitch: 'G3' },
              ],
            },
            {
              id: 'bass-e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'bass-n2', pitch: 'D3' }],
            },
          ],
        },
        {
          id: 'bass-m1',
          events: [
            {
              id: 'bass-e2',
              duration: 'half',
              dotted: false,
              isRest: true,
              notes: [{ id: 'bass-rest-0', pitch: null, isRest: true }],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Create a score with aligned note and rest at same quant.
 * Used for testing rest handling in vertical operations.
 */
export const createScoreWithRest = (): Score => ({
  title: 'Rest Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble-staff',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [
            {
              id: 'e0',
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'n0', pitch: 'C4' },
                { id: 'n1', pitch: 'E4' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'bass-staff',
      clef: 'bass',
      keySignature: 'C',
      measures: [
        {
          id: 'bass-m0',
          events: [
            {
              id: 'bass-e0',
              duration: 'quarter',
              dotted: false,
              isRest: true,
              notes: [{ id: 'rest-0', pitch: null, isRest: true }],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Create a single-staff score (no bass).
 * Used for testing single-staff boundary behavior.
 */
export const createSingleStaffScore = (): Score => ({
  title: 'Single Staff Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble-staff',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [
            {
              id: 'e0',
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'n0', pitch: 'C4' },
                { id: 'n1', pitch: 'E4' },
                { id: 'n2', pitch: 'G4' },
              ],
            },
          ],
        },
      ],
    },
  ],
});

// =============================================================================
// SELECTION BUILDERS
// =============================================================================

/**
 * Create an empty selection (no notes selected).
 */
export const createEmptySelection = (): Selection => ({
  staffIndex: 0,
  measureIndex: null,
  eventId: null,
  noteId: null,
  selectedNotes: [],
  anchor: null,
});

/**
 * Create a selection with a single note selected.
 *
 * @param staffIndex - Staff index
 * @param measureIndex - Measure index
 * @param eventId - Event ID
 * @param noteId - Note ID (can be null for rests)
 */
export const createSelectionWithNote = (
  staffIndex: number,
  measureIndex: number,
  eventId: string,
  noteId: string | null
): Selection => ({
  staffIndex,
  measureIndex,
  eventId,
  noteId,
  selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
  anchor: { staffIndex, measureIndex, eventId, noteId },
});

/**
 * Create a selection with multiple notes selected.
 *
 * @param notes - Array of note positions to select
 * @param focusIndex - Index of the focus note (defaults to 0)
 */
export const createMultiNoteSelection = (
  notes: Array<{
    staffIndex: number;
    measureIndex: number;
    eventId: string;
    noteId: string | null;
  }>,
  focusIndex = 0
): Selection => {
  const focus = notes[focusIndex];
  return {
    staffIndex: focus.staffIndex,
    measureIndex: focus.measureIndex,
    eventId: focus.eventId,
    noteId: focus.noteId,
    selectedNotes: notes,
    anchor: notes[0], // Anchor is first note
  };
};

// =============================================================================
// HORIZONTAL EXTENSION FIXTURES
// =============================================================================

/**
 * Create a two-staff score with 4 quarter notes per staff in M0.
 * Used for testing horizontal extension.
 *
 * Treble M0: t-e1, t-e2, t-e3, t-e4 (all quarter notes)
 * Bass M0: b-e1, b-e2, b-e3, b-e4 (all quarter notes)
 */
export const createTwoStaffScore = (): Score => ({
  title: 'Two Staff Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble-staff',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 't-m0',
          events: [
            {
              id: 't-e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 't-n1', pitch: 'C4' }],
            },
            {
              id: 't-e2',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 't-n2', pitch: 'D4' }],
            },
            {
              id: 't-e3',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 't-n3', pitch: 'E4' }],
            },
            {
              id: 't-e4',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 't-n4', pitch: 'F4' }],
            },
          ],
        },
      ],
    },
    {
      id: 'bass-staff',
      clef: 'bass',
      keySignature: 'C',
      measures: [
        {
          id: 'b-m0',
          events: [
            {
              id: 'b-e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'b-n1', pitch: 'C3' }],
            },
            {
              id: 'b-e2',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'b-n2', pitch: 'D3' }],
            },
            {
              id: 'b-e3',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'b-n3', pitch: 'E3' }],
            },
            {
              id: 'b-e4',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'b-n4', pitch: 'F3' }],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Create a multi-staff selection spanning treble and bass.
 * Used for testing the bug fix where horizontal extension drops staves.
 *
 * Returns score and initial selection with one note on each staff at same quant (beat 1).
 */
export const createMultiStaffSelection = (): { score: Score; selection: Selection } => {
  const score = createTwoStaffScore();

  const selection: Selection = {
    staffIndex: 0,
    measureIndex: 0,
    eventId: 't-e1',
    noteId: 't-n1',
    selectedNotes: [
      { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
      { staffIndex: 1, measureIndex: 0, eventId: 'b-e1', noteId: 'b-n1' },
    ],
    anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
  };

  return { score, selection };
};
