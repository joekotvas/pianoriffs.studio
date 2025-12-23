/**
 * Tuplet Commands Tests
 *
 * Tests for ApplyTupletCommand and RemoveTupletCommand.
 * Covers: triplets, quintuplets, undo/redo, edge cases.
 *
 * @see ApplyTupletCommand
 * @see RemoveTupletCommand
 */

import { ApplyTupletCommand } from '@/commands/TupletCommands';
import { RemoveTupletCommand } from '@/commands/RemoveTupletCommand';
import { Score, createDefaultScore } from '@/types';

describe('Tuplet Commands', () => {
  let baseScore: Score;

  beforeEach(() => {
    baseScore = createDefaultScore();
    // Add some test events to the first measure
    baseScore.staves[0].measures[0].events = [
      { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
      { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
      { id: 'e3', duration: 'quarter', dotted: false, notes: [{ id: 'n3', pitch: 'E4' }] },
      { id: 'e4', duration: 'quarter', dotted: false, notes: [{ id: 'n4', pitch: 'F4' }] },
    ];
  });

  describe('ApplyTupletCommand', () => {
    test('should apply triplet to 3 quarter notes', () => {
      const command = new ApplyTupletCommand(0, 0, 3, [3, 2]);
      const newScore = command.execute(baseScore);

      const events = newScore.staves[0].measures[0].events;

      // Verify first 3 events have tuplet metadata
      expect(events[0].tuplet).toEqual(
        expect.objectContaining({
          ratio: [3, 2],
          groupSize: 3,
          position: 0,
          baseDuration: 'quarter',
        })
      );
      expect(events[1].tuplet).toEqual(
        expect.objectContaining({
          ratio: [3, 2],
          groupSize: 3,
          position: 1,
          baseDuration: 'quarter',
        })
      );
      expect(events[2].tuplet).toEqual(
        expect.objectContaining({
          ratio: [3, 2],
          groupSize: 3,
          position: 2,
          baseDuration: 'quarter',
        })
      );

      // Verify all events share the same tuplet ID
      const tupletId = events[0].tuplet!.id;
      expect(tupletId).toBeDefined();
      expect(events[1].tuplet!.id).toBe(tupletId);
      expect(events[2].tuplet!.id).toBe(tupletId);

      // Fourth event should not be affected
      expect(events[3].tuplet).toBeUndefined();
    });

    test('should undo tuplet application', () => {
      const command = new ApplyTupletCommand(0, 0, 3, [3, 2]);
      const withTuplet = command.execute(baseScore);
      const restored = command.undo(withTuplet);

      const events = restored.staves[0].measures[0].events;

      // All events should have no tuplet metadata
      expect(events[0].tuplet).toBeUndefined();
      expect(events[1].tuplet).toBeUndefined();
      expect(events[2].tuplet).toBeUndefined();
      expect(events[3].tuplet).toBeUndefined();
    });

    test('should handle quintuplet (5:4 ratio)', () => {
      // Add one more event for quintuplet
      baseScore.staves[0].measures[0].events.push({
        id: 'e5',
        duration: 'eighth',
        dotted: false,
        notes: [{ id: 'n5', pitch: 'G4' }],
      });

      const command = new ApplyTupletCommand(0, 0, 5, [5, 4]);
      const newScore = command.execute(baseScore);

      const events = newScore.staves[0].measures[0].events;

      expect(events[0].tuplet?.ratio).toEqual([5, 4]);
      expect(events[0].tuplet?.groupSize).toBe(5);
      expect(events[4].tuplet?.position).toBe(4);
    });

    test('should return unchanged score if not enough events', () => {
      const command = new ApplyTupletCommand(0, 2, 5, [5, 4]);
      const newScore = command.execute(baseScore);

      // Only 2 events after index 2, need 5
      expect(newScore).toBe(baseScore);
    });

    test('should return unchanged score if measure not found', () => {
      const command = new ApplyTupletCommand(99, 0, 3, [3, 2]);
      const newScore = command.execute(baseScore);

      expect(newScore).toBe(baseScore);
    });

    test('should preserve existing tuplet in undo', () => {
      // Apply first tuplet
      const cmd1 = new ApplyTupletCommand(0, 0, 2, [2, 3]);
      const withFirstTuplet = cmd1.execute(baseScore);

      // Apply second tuplet to same events
      const cmd2 = new ApplyTupletCommand(0, 0, 3, [3, 2]);
      const withSecondTuplet = cmd2.execute(withFirstTuplet);

      // Undo second tuplet - should restore first tuplet
      const restored = cmd2.undo(withSecondTuplet);

      expect(restored.staves[0].measures[0].events[0].tuplet).toEqual(
        expect.objectContaining({
          ratio: [2, 3],
          groupSize: 2,
          position: 0,
        })
      );
    });
  });

  describe('RemoveTupletCommand', () => {
    let scoreWithTuplet: Score;

    beforeEach(() => {
      // Create score with existing tuplet
      const applyCmd = new ApplyTupletCommand(0, 0, 3, [3, 2]);
      scoreWithTuplet = applyCmd.execute(baseScore);
    });

    test('should remove entire tuplet group', () => {
      // Remove from middle event (position 1)
      const command = new RemoveTupletCommand(0, 1);
      const newScore = command.execute(scoreWithTuplet);

      const events = newScore.staves[0].measures[0].events;

      // All 3 events should have tuplet removed
      expect(events[0].tuplet).toBeUndefined();
      expect(events[1].tuplet).toBeUndefined();
      expect(events[2].tuplet).toBeUndefined();

      // Fourth event should still be unaffected
      expect(events[3].tuplet).toBeUndefined();
    });

    test('should remove from first event in group', () => {
      const command = new RemoveTupletCommand(0, 0);
      const newScore = command.execute(scoreWithTuplet);

      const events = newScore.staves[0].measures[0].events;
      expect(events[0].tuplet).toBeUndefined();
      expect(events[1].tuplet).toBeUndefined();
      expect(events[2].tuplet).toBeUndefined();
    });

    test('should remove from last event in group', () => {
      const command = new RemoveTupletCommand(0, 2);
      const newScore = command.execute(scoreWithTuplet);

      const events = newScore.staves[0].measures[0].events;
      expect(events[0].tuplet).toBeUndefined();
      expect(events[1].tuplet).toBeUndefined();
      expect(events[2].tuplet).toBeUndefined();
    });

    test('should undo tuplet removal', () => {
      const command = new RemoveTupletCommand(0, 1);
      const withoutTuplet = command.execute(scoreWithTuplet);
      const restored = command.undo(withoutTuplet);

      const events = restored.staves[0].measures[0].events;

      // Tuplet should be restored
      expect(events[0].tuplet).toEqual(
        expect.objectContaining({
          ratio: [3, 2],
          groupSize: 3,
          position: 0,
        })
      );
      expect(events[1].tuplet).toEqual(
        expect.objectContaining({
          ratio: [3, 2],
          groupSize: 3,
          position: 1,
        })
      );
      expect(events[2].tuplet).toEqual(
        expect.objectContaining({
          ratio: [3, 2],
          groupSize: 3,
          position: 2,
        })
      );
    });

    test('should return unchanged score if event not in tuplet', () => {
      // Try to remove tuplet from event 3 (not in tuplet)
      const command = new RemoveTupletCommand(0, 3);
      const newScore = command.execute(scoreWithTuplet);

      expect(newScore).toBe(scoreWithTuplet);
    });

    test('should return unchanged score if measure not found', () => {
      const command = new RemoveTupletCommand(99, 0);
      const newScore = command.execute(scoreWithTuplet);

      expect(newScore).toBe(scoreWithTuplet);
    });

    test('should return unchanged score if event not found', () => {
      const command = new RemoveTupletCommand(0, 99);
      const newScore = command.execute(scoreWithTuplet);

      expect(newScore).toBe(scoreWithTuplet);
    });
  });
});
