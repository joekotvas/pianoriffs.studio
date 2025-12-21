/**
 * SelectAllCommand - Edge Cases & State Integrity Tests
 *
 * Tests for error handling, invalid inputs, and selection state integrity.
 *
 * @see Issue #99
 */

import { SelectAllCommand } from '../commands/selection/SelectAllCommand';
import { createDefaultSelection } from '../types';
import { createTestScore } from './helpers/selectAllFixtures';

describe('SelectAllCommand - edge cases', () => {
  const score = createTestScore();

  describe('empty/invalid inputs', () => {
    it('should return current state if no notes exist in scope', () => {
      const emptyScore = { ...createTestScore(), staves: [] };
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, emptyScore);

      expect(result).toBe(selection);
    });

    it('should handle invalid staff index gracefully', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'staff', staffIndex: 99 });
      const result = command.execute(selection, score);

      expect(result).toBe(selection);
    });

    it('should handle invalid measure index gracefully', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 99 });
      const result = command.execute(selection, score);

      expect(result).toBe(selection);
    });

    it('should handle empty measure gracefully', () => {
      const scoreWithEmptyMeasure = {
        ...createTestScore(),
        staves: [
          {
            id: 'staff-0',
            clef: 'treble' as const,
            keySignature: 'C',
            measures: [{ id: 'empty-measure', events: [] }],
          },
        ],
      };
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, scoreWithEmptyMeasure);

      expect(result).toBe(selection);
    });
  });

  describe('selection state integrity', () => {
    it('should set anchor to first selected note', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      expect(result.anchor).toEqual(result.selectedNotes[0]);
    });

    it('should set cursor (eventId, noteId) to first selected note', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      expect(result.eventId).toBe(result.selectedNotes[0].eventId);
      expect(result.noteId).toBe(result.selectedNotes[0].noteId);
    });

    it('should maintain staffIndex consistency', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      expect(result.staffIndex).toBe(result.selectedNotes[0].staffIndex);
    });

    it('should maintain measureIndex consistency', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, score);

      expect(result.measureIndex).toBe(0);
    });

    it('should not mutate original selection', () => {
      const selection = createDefaultSelection();
      const originalNotes = [...selection.selectedNotes];
      const command = new SelectAllCommand({ scope: 'score' });
      command.execute(selection, score);

      expect(selection.selectedNotes).toEqual(originalNotes);
    });
  });
});
