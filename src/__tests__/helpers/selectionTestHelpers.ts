/**
 * Selection Test Helpers
 *
 * Shared test score factories for selection engine tests.
 */

import { Score } from '../../types';

/**
 * Creates a test score with:
 * - 1 staff (treble)
 * - 2 measures
 * - Measure 1: 2 events (first is 2-note chord, second is single note)
 * - Measure 2: 1 event (single note)
 */
export const createTestScore = (): Score => ({
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'measure-1',
          events: [
            {
              id: 'event-1',
              isRest: false,
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'note-1a', pitch: 'C4', accidental: null, tied: false },
                { id: 'note-1b', pitch: 'E4', accidental: null, tied: false },
              ],
            },
            {
              id: 'event-2',
              isRest: false,
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'note-2', pitch: 'D4', accidental: null, tied: false }],
            },
          ],
        },
        {
          id: 'measure-2',
          events: [
            {
              id: 'event-3',
              isRest: false,
              duration: 'half',
              dotted: false,
              notes: [{ id: 'note-3', pitch: 'E4', accidental: null, tied: false }],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Creates an empty score with no staves
 */
export const createEmptyScore = (): Score => ({
  title: 'Empty Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [],
});

/**
 * Creates a score with one empty measure (no events)
 */
export const createScoreWithEmptyMeasure = (): Score => ({
  title: 'Score with Empty Measure',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'measure-1',
          events: [],
        },
      ],
    },
  ],
});
