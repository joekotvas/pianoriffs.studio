import { TogglePickupCommand } from '@/commands/TogglePickupCommand';
import { Score, createDefaultScore } from '@/types';

describe('TogglePickupCommand', () => {
  let score: Score;
  let command: TogglePickupCommand;

  beforeEach(() => {
    score = createDefaultScore();
    command = new TogglePickupCommand();
  });

  it('should toggle pickup on a single staff', () => {
    // Initial state: not pickup
    expect(score.staves[0].measures[0].isPickup).toBeFalsy();

    const newScore = command.execute(score);
    expect(newScore.staves[0].measures[0].isPickup).toBe(true);

    const undoneScore = command.undo(newScore);
    expect(undoneScore.staves[0].measures[0].isPickup).toBeFalsy();
  });

  it('should toggle pickup on all staves in Grand Staff', () => {
    // Setup Grand Staff
    score.staves.push({
      id: 'staff-2',
      clef: 'bass',
      keySignature: 'C',
      measures: [
        { id: 'm1-bass', events: [] },
        { id: 'm2-bass', events: [] },
      ],
    });

    // Initial state
    expect(score.staves[0].measures[0].isPickup).toBeFalsy();
    expect(score.staves[1].measures[0].isPickup).toBeFalsy();

    // Execute
    const newScore = command.execute(score);
    expect(newScore.staves[0].measures[0].isPickup).toBe(true);
    expect(newScore.staves[1].measures[0].isPickup).toBe(true);

    // Undo
    const undoneScore = command.undo(newScore);
    expect(undoneScore.staves[0].measures[0].isPickup).toBeFalsy();
    expect(undoneScore.staves[1].measures[0].isPickup).toBeFalsy();
  });

  it('should handle empty measures gracefully', () => {
    score.staves[0].measures = [];
    const newScore = command.execute(score);
    expect(newScore).toBe(score); // Should return same score if no measures
  });
});
