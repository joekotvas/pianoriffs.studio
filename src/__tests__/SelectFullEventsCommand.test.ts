/**
 * Tests for SelectFullEventsCommand
 *
 * This command selects all notes in partially selected events.
 *
 * @see SelectFullEventsCommand
 */

import { SelectFullEventsCommand } from '@/commands/selection/SelectFullEventsCommand';
import type { Selection } from '@/types';
import {
  createTestScore,
  createEmptySelection,
  createSelectionWithNote,
} from './fixtures/selectionTestScores';

describe('SelectFullEventsCommand', () => {
  describe('happy paths', () => {
    test('fills single partial chord', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 only

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(3);
      expect(result.selectedNotes.map((n) => n.noteId)).toEqual(
        expect.arrayContaining(['n0', 'n1', 'n2'])
      );
    });

    test('handles already full event', () => {
      const score = createTestScore();
      const state: Selection = {
        ...createSelectionWithNote(0, 0, 'e0', 'n0'),
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' },
        ],
      };

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(3);
    });

    test('fills multiple partial events', () => {
      const score = createTestScore();
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }, // Partial chord
          { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n4' }, // Partial chord in M1
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      };

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      // Should have 3 notes from e0 + 2 notes from e2
      expect(result.selectedNotes).toHaveLength(5);
    });
  });

  describe('edge cases', () => {
    test('returns unchanged for empty selection', () => {
      const score = createTestScore();
      const state = createEmptySelection();

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result).toBe(state);
    });

    test('handles single-note event', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e1', 'n3'); // Single note event

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(1);
    });
  });
});
