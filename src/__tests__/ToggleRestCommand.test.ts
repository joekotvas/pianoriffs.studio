/**
 * ToggleRestCommand Tests
 *
 * Tests the ToggleRestCommand for correctly handling clef-aware center pitches
 * when converting rests to notes.
 */

import { ToggleRestCommand } from '@/commands/ToggleRestCommand';
import { Score, Selection } from '@/types';

/**
 * Create a minimal score with a rest event in the specified clef
 */
const createScoreWithRest = (clef: string): Score => ({
  title: 'Test',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-1',
      clef: clef as 'treble' | 'bass' | 'alto' | 'tenor' | 'grand',
      keySignature: 'C',
      measures: [
        {
          id: 'measure-1',
          events: [
            {
              id: 'event-1',
              duration: 'quarter',
              dotted: false,
              isRest: true,
              notes: [{ id: 'rest-1', pitch: null, isRest: true }],
            },
          ],
        },
      ],
    },
  ],
});

/**
 * Create a selection targeting the first event in the first measure
 */
const createRestSelection = (): Selection => ({
  staffIndex: 0,
  measureIndex: 0,
  eventId: 'event-1',
  noteId: 'rest-1',
  selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'rest-1' }],
  anchor: null,
});

describe('ToggleRestCommand', () => {
  describe('clef-aware center pitch', () => {
    it.each([
      ['treble', 'B4'],
      ['bass', 'D3'],
      ['alto', 'C4'],
      ['tenor', 'C4'],
    ])('uses %s center pitch when converting rest to note', (clef, expectedPitch) => {
      const score = createScoreWithRest(clef);
      const selection = createRestSelection();

      const command = new ToggleRestCommand(selection);
      const newScore = command.execute(score);

      const event = newScore.staves[0].measures[0].events[0];
      expect(event.isRest).toBe(false);
      expect(event.notes[0].pitch).toBe(expectedPitch);
    });
  });

  describe('rest to note conversion', () => {
    it('converts rest to note with single note entry', () => {
      const score = createScoreWithRest('treble');
      const selection = createRestSelection();

      const command = new ToggleRestCommand(selection);
      const newScore = command.execute(score);

      const event = newScore.staves[0].measures[0].events[0];
      expect(event.isRest).toBe(false);
      expect(event.notes.length).toBe(1);
    });

    it('preserves note ID from rest for selection continuity', () => {
      const score = createScoreWithRest('treble');
      const selection = createRestSelection();

      const command = new ToggleRestCommand(selection);
      const newScore = command.execute(score);

      const event = newScore.staves[0].measures[0].events[0];
      expect(event.notes[0].id).toBe('rest-1'); // Original ID preserved
    });
  });

  describe('undo', () => {
    it('restores original rest state after undo', () => {
      const score = createScoreWithRest('treble');
      const selection = createRestSelection();

      const command = new ToggleRestCommand(selection);
      const newScore = command.execute(score);
      const undoneScore = command.undo(newScore);

      const event = undoneScore.staves[0].measures[0].events[0];
      expect(event.isRest).toBe(true);
      expect(event.notes[0].pitch).toBeNull();
    });
  });

  describe('exception paths', () => {
    it('defaults unknown clef to treble center pitch (B4)', () => {
      const score = createScoreWithRest('unknown' as string);
      const selection = createRestSelection();

      const command = new ToggleRestCommand(selection);
      const newScore = command.execute(score);

      const event = newScore.staves[0].measures[0].events[0];
      expect(event.notes[0].pitch).toBe('B4');
    });

    it('defaults grand staff to treble center pitch (B4)', () => {
      const score = createScoreWithRest('grand');
      const selection = createRestSelection();

      const command = new ToggleRestCommand(selection);
      const newScore = command.execute(score);

      const event = newScore.staves[0].measures[0].events[0];
      expect(event.notes[0].pitch).toBe('B4');
    });

    it('returns unchanged score for empty selection', () => {
      const score = createScoreWithRest('treble');
      const emptySelection: Selection = {
        staffIndex: 0,
        measureIndex: null,
        eventId: null,
        noteId: null,
        selectedNotes: [],
        anchor: null,
      };

      const command = new ToggleRestCommand(emptySelection);
      const newScore = command.execute(score);

      // Score should be unchanged
      expect(newScore.staves[0].measures[0].events[0].isRest).toBe(true);
    });

    it('handles selection with invalid event ID gracefully', () => {
      const score = createScoreWithRest('treble');
      const invalidSelection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'nonexistent-event',
        noteId: 'nonexistent-note',
        selectedNotes: [
          {
            staffIndex: 0,
            measureIndex: 0,
            eventId: 'nonexistent-event',
            noteId: 'nonexistent-note',
          },
        ],
        anchor: null,
      };

      const command = new ToggleRestCommand(invalidSelection);
      const newScore = command.execute(score);

      // Score should be unchanged since event wasn't found
      expect(newScore.staves[0].measures[0].events[0].isRest).toBe(true);
    });
  });
});
