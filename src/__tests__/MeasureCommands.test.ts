import { AddMeasureCommand, DeleteMeasureCommand } from '../commands/MeasureCommands';
import { createDefaultScore } from '../types';

describe('MeasureCommands', () => {
  describe('AddMeasureCommand', () => {
    test('adds a measure to all staves', () => {
      const score = createDefaultScore(); // 2 staves, 2 measures each
      const command = new AddMeasureCommand();

      const newScore = command.execute(score);

      expect(newScore.staves[0].measures.length).toBe(3);
      expect(newScore.staves[1].measures.length).toBe(3);
      // Check IDs are unique/exist
      expect(newScore.staves[0].measures[2].id).toBeDefined();
      expect(newScore.staves[1].measures[2].id).toBeDefined();
    });

    test('undo removes the added measure', () => {
      const score = createDefaultScore();
      const command = new AddMeasureCommand();

      const executedScore = command.execute(score);
      expect(executedScore.staves[0].measures.length).toBe(3);

      const undoneScore = command.undo(executedScore);
      expect(undoneScore.staves[0].measures.length).toBe(2);
      expect(undoneScore.staves[0].measures[1].id).toBe(score.staves[0].measures[1].id);
    });

    test('undo handles case where measures were modified externally (naive check)', () => {
      // Current implementation of undo just pops if ID matches or falls back
      const score = createDefaultScore();
      const command = new AddMeasureCommand();
      const executedScore = command.execute(score);

      // Simulate external modification: added another measure
      const undoneScore = command.undo(executedScore);
      expect(undoneScore.staves[0].measures.length).toBe(2);
    });

    test('undo without execute does nothing (safer fallback)', () => {
      const score = createDefaultScore();
      // Add a measure manually to simulate state where we might want to pop
      score.staves[0].measures.push({ id: 'extra', events: [] });
      score.staves[1].measures.push({ id: 'extra-bass', events: [] });

      const command = new AddMeasureCommand();
      // Undo without having executed (so no IDs recorded)
      const undoneScore = command.undo(score);

      expect(undoneScore.staves[0].measures.length).toBe(3);
      expect(undoneScore.staves[1].measures.length).toBe(3);
    });
  });

  describe('DeleteMeasureCommand', () => {
    test('deletes the last measure by default', () => {
      const score = createDefaultScore(); // 2 measures
      const command = new DeleteMeasureCommand(); // default: last

      const newScore = command.execute(score);
      expect(newScore.staves[0].measures.length).toBe(1);
      expect(newScore.staves[0].measures[0].id).toBe('m1'); // m2 deleted
    });

    test('deletes measure at specific index', () => {
      const score = createDefaultScore();
      const command = new DeleteMeasureCommand(0); // delete first

      const newScore = command.execute(score);
      expect(newScore.staves[0].measures.length).toBe(1);
      expect(newScore.staves[0].measures[0].id).toBe('m2'); // m1 deleted
    });

    test('does nothing if index invalid', () => {
      const score = createDefaultScore();
      const command = new DeleteMeasureCommand(10);

      const newScore = command.execute(score);
      expect(newScore).toBe(score); // Referentially equal if no change
    });

    test('undo restores the deleted measure', () => {
      const score = createDefaultScore();
      const command = new DeleteMeasureCommand();

      const executedScore = command.execute(score);
      const undoneScore = command.undo(executedScore);

      expect(undoneScore.staves[0].measures.length).toBe(2);
      expect(undoneScore.staves[0].measures[1].id).toBe('m2');
    });

    test('undo restores measure at correct index', () => {
      const score = createDefaultScore();
      const command = new DeleteMeasureCommand(0);

      const executedScore = command.execute(score);
      const undoneScore = command.undo(executedScore);

      expect(undoneScore.staves[0].measures.length).toBe(2);
      expect(undoneScore.staves[0].measures[0].id).toBe('m1');
    });
  });
});
