import { ChangePitchCommand } from '../commands/ChangePitchCommand';
import { createDefaultScore } from '../types';
import { AddEventCommand } from '../commands/AddEventCommand';

describe('ChangePitchCommand', () => {
  const setupScore = () => {
    let score = createDefaultScore();
    // Add a note to m1 (measure index 0)
    // AddEventcmd(measureIndex, isRest, note, duration, isDotted)
    const note = { id: 'n1', pitch: 'C4', isRest: false };
    const addCmd = new AddEventCommand(0, false, note, 'quarter', false, undefined, 'e1');
    score = addCmd.execute(score);
    return score;
  };

  test('changes pitch of existing note', () => {
    const score = setupScore();
    const command = new ChangePitchCommand(0, 'e1', 'n1', 'D4');
    
    const newScore = command.execute(score);
    const note = newScore.staves[0].measures[0].events[0].notes[0];
    
    expect(note.pitch).toBe('D4');
  });

  test('undo reverts pitch to original', () => {
    const score = setupScore();
    const command = new ChangePitchCommand(0, 'e1', 'n1', 'D4');
    
    const executedScore = command.execute(score);
    const undoneScore = command.undo(executedScore);
    const note = undoneScore.staves[0].measures[0].events[0].notes[0];
    
    expect(note.pitch).toBe('C4');
  });

  test('does nothing if note not found', () => {
    const score = setupScore();
    const command = new ChangePitchCommand(0, 'e1', 'invalid-note-id', 'D4');
    
    const newScore = command.execute(score);
    // Should match original score object reference or deep equal if no change
    expect(newScore).toEqual(score);
  });

  test('does nothing if event not found', () => {
    const score = setupScore();
    const command = new ChangePitchCommand(0, 'invalid-event-id', 'n1', 'D4');
    
    const newScore = command.execute(score);
    expect(newScore).toEqual(score);
  });

  test('handles undo when oldPitch was not captured (never executed)', () => {
    const score = setupScore();
    const command = new ChangePitchCommand(0, 'e1', 'n1', 'D4');
    
    // Undo without execute
    const newScore = command.undo(score);
    expect(newScore).toBe(score);
  });
});
