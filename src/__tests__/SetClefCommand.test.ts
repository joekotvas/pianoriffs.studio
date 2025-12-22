/**
 * SetClefCommand Tests
 *
 * Tests for changing staff clef (treble ↔ bass).
 * Covers: clef changes, undo, no-op, multi-staff, edge cases.
 *
 * @see SetClefCommand
 */

import { SetClefCommand } from '@/commands/SetClefCommand';
import { Score, Staff } from '@/types';

describe('SetClefCommand', () => {
  const createSingleStaffScore = (clef: 'treble' | 'bass'): Score => {
    const staff: Staff = {
      id: 'staff-1',
      clef,
      keySignature: 'C',
      measures: [
        {
          id: 'm1',
          events: [
            {
              id: 'event-1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'note-1', pitch: clef === 'treble' ? 'C5' : 'C3' }],
              isRest: false,
            },
          ],
          isPickup: false,
        },
      ],
    };

    return {
      staves: [staff],
      timeSignature: '4/4',
      title: 'Test Score',
      keySignature: 'C',
      bpm: 120,
    };
  };

  const createGrandStaffScore = (): Score => {
    return {
      staves: [
        {
          id: 'staff-1',
          clef: 'treble',
          keySignature: 'C',
          measures: [{ id: 'm1', events: [], isPickup: false }],
        },
        {
          id: 'staff-2',
          clef: 'bass',
          keySignature: 'C',
          measures: [{ id: 'm2', events: [], isPickup: false }],
        },
      ],
      timeSignature: '4/4',
      title: 'Test Score',
      keySignature: 'C',
      bpm: 120,
    };
  };

  describe('Changing clef from treble to bass', () => {
    it('should change clef from treble to bass', () => {
      const score = createSingleStaffScore('treble');
      const command = new SetClefCommand('bass');

      const newScore = command.execute(score);

      expect(newScore.staves[0].clef).toBe('bass');
      // Measures and notes should be preserved
      expect(newScore.staves[0].measures).toEqual(score.staves[0].measures);
    });
  });

  describe('Changing clef from bass to treble', () => {
    it('should change clef from bass to treble', () => {
      const score = createSingleStaffScore('bass');
      const command = new SetClefCommand('treble');

      const newScore = command.execute(score);

      expect(newScore.staves[0].clef).toBe('treble');
      // Measures and notes should be preserved
      expect(newScore.staves[0].measures).toEqual(score.staves[0].measures);
    });
  });

  describe('Undo functionality', () => {
    it('should restore original clef on undo', () => {
      const score = createSingleStaffScore('treble');
      const command = new SetClefCommand('bass');

      const newScore = command.execute(score);
      expect(newScore.staves[0].clef).toBe('bass');

      const undoneScore = command.undo(newScore);
      expect(undoneScore.staves[0].clef).toBe('treble');
    });

    it('should handle undo when previousClef is null (never executed)', () => {
      const score = createSingleStaffScore('treble');
      const command = new SetClefCommand('bass');

      // Undo without execute should return score unchanged
      const result = command.undo(score);
      expect(result).toBe(score);
    });
  });

  describe('No-op when clef is already target value', () => {
    it('should return same score when clef is already treble', () => {
      const score = createSingleStaffScore('treble');
      const command = new SetClefCommand('treble');

      const result = command.execute(score);

      expect(result).toBe(score);
    });

    it('should return same score when clef is already bass', () => {
      const score = createSingleStaffScore('bass');
      const command = new SetClefCommand('bass');

      const result = command.execute(score);

      expect(result).toBe(score);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid staff index gracefully', () => {
      const score = createSingleStaffScore('treble');
      const command = new SetClefCommand('bass', 5); // Non-existent staff index

      const result = command.execute(score);

      // Should not throw, but previousClef defaults to 'treble'
      // and no staff at index 5 means no change to staves
      expect(result.staves[0].clef).toBe('treble');
    });

    it('should work with specific staff index in multi-staff score', () => {
      const score = createGrandStaffScore();
      const command = new SetClefCommand('treble', 1); // Change bass staff to treble

      const newScore = command.execute(score);

      expect(newScore.staves[0].clef).toBe('treble'); // First staff unchanged
      expect(newScore.staves[1].clef).toBe('treble'); // Second staff changed
    });

    it('should undo correctly with specific staff index', () => {
      const score = createGrandStaffScore();
      const command = new SetClefCommand('treble', 1);

      const newScore = command.execute(score);
      expect(newScore.staves[1].clef).toBe('treble');

      const undoneScore = command.undo(newScore);
      expect(undoneScore.staves[1].clef).toBe('bass');
    });

    it('should preserve other staff properties when changing clef', () => {
      const score = createSingleStaffScore('treble');
      score.staves[0].keySignature = 'G';
      const command = new SetClefCommand('bass');

      const newScore = command.execute(score);

      expect(newScore.staves[0].clef).toBe('bass');
      expect(newScore.staves[0].keySignature).toBe('G');
      expect(newScore.staves[0].id).toBe('staff-1');
    });
  });
});
