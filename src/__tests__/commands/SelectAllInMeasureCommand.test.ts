/**
 * SelectAllInMeasureCommand Tests
 *
 * Tests for the command that selects all notes in a measure.
 *
 * @see src/commands/selection/SelectAllInMeasureCommand.ts
 */

import { SelectAllInMeasureCommand } from '@/commands/selection';
import { Selection, Score } from '@/types';

// --- Test Fixtures ---

const createDefaultSelection = (): Selection => ({
  staffIndex: 0,
  measureIndex: null,
  eventId: null,
  noteId: null,
  selectedNotes: [],
  anchor: null,
});

const createSimpleScore = (): Score => ({
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble',
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
            {
              id: 'e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'n2', pitch: 'G4' }],
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
              notes: [{ id: 'n3', pitch: 'D4' }],
            },
          ],
        },
      ],
    },
  ],
});

const createEmptyMeasureScore = (): Score => ({
  title: 'Empty Measure Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [],
        },
      ],
    },
  ],
});

const createRestOnlyScore = (): Score => ({
  title: 'Rest Only Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [
            {
              id: 'e0',
              duration: 'whole',
              dotted: false,
              isRest: true,
              notes: [],
            },
          ],
        },
      ],
    },
  ],
});

// --- Tests ---

describe('SelectAllInMeasureCommand', () => {
  describe('execute', () => {
    it('selects all notes in a measure with multiple events', () => {
      const score = createSimpleScore();
      const state = createDefaultSelection();

      const command = new SelectAllInMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
      });

      const result = command.execute(state, score);

      // Should select all 3 notes from both events
      expect(result.selectedNotes).toHaveLength(3);
      expect(result.selectedNotes).toEqual([
        { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
        { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
        { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n2' },
      ]);

      // Should set cursor to first note
      expect(result.staffIndex).toBe(0);
      expect(result.measureIndex).toBe(0);
      expect(result.eventId).toBe('e0');
      expect(result.noteId).toBe('n0');

      // Should set anchor
      expect(result.anchor).toEqual({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0',
      });
    });

    it('selects single note in measure with one event', () => {
      const score = createSimpleScore();
      const state = createDefaultSelection();

      const command = new SelectAllInMeasureCommand({
        staffIndex: 0,
        measureIndex: 1,
      });

      const result = command.execute(state, score);

      expect(result.selectedNotes).toHaveLength(1);
      expect(result.selectedNotes[0]).toEqual({
        staffIndex: 0,
        measureIndex: 1,
        eventId: 'e2',
        noteId: 'n3',
      });
    });

    it('returns unchanged state for empty measure', () => {
      const score = createEmptyMeasureScore();
      const state = createDefaultSelection();

      const command = new SelectAllInMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
      });

      const result = command.execute(state, score);

      // Should return unchanged state
      expect(result).toBe(state);
    });

    it('returns unchanged state for rest-only measure', () => {
      const score = createRestOnlyScore();
      const state = createDefaultSelection();

      const command = new SelectAllInMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
      });

      const result = command.execute(state, score);

      // Should return unchanged state (rests have no notes)
      expect(result).toBe(state);
    });

    it('returns unchanged state for invalid staffIndex', () => {
      const score = createSimpleScore();
      const state = createDefaultSelection();

      const command = new SelectAllInMeasureCommand({
        staffIndex: 99,
        measureIndex: 0,
      });

      const result = command.execute(state, score);

      expect(result).toBe(state);
    });

    it('returns unchanged state for invalid measureIndex', () => {
      const score = createSimpleScore();
      const state = createDefaultSelection();

      const command = new SelectAllInMeasureCommand({
        staffIndex: 0,
        measureIndex: 99,
      });

      const result = command.execute(state, score);

      expect(result).toBe(state);
    });

    it('has correct command type', () => {
      const command = new SelectAllInMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
      });

      expect(command.type).toBe('SELECT_ALL_IN_MEASURE');
    });
  });
});
