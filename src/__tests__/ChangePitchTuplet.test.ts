/**
 * ChangePitchCommand + Tuplet Integration Test
 *
 * Tests that changing pitch on a tuplet note preserves tuplet structure.
 * Regression test for tuplet corruption issues.
 *
 * @see ChangePitchCommand
 * @see ApplyTupletCommand
 */

import { ChangePitchCommand } from '@/commands/ChangePitchCommand';
import { createDefaultScore, ScoreEvent } from '@/types';
import { ApplyTupletCommand } from '@/commands/TupletCommands';
import { ScoreEngine } from '@/engines/ScoreEngine';

describe('ChangePitchCommand with Tuplets via Engine', () => {
  test('should preserve score structure when changing pitch of a tuplet note', () => {
    const initialScore = createDefaultScore();

    // 1. Create 3 quarter notes manually
    const notes = [
      { id: 'n1', pitch: 'C4', accidental: null, tied: false },
      { id: 'n2', pitch: 'D4', accidental: null, tied: false },
      { id: 'n3', pitch: 'E4', accidental: null, tied: false },
    ];

    const events: ScoreEvent[] = [
      { id: 'e1', duration: 'quarter', dotted: false, isRest: false, notes: [notes[0]] },
      { id: 'e2', duration: 'quarter', dotted: false, isRest: false, notes: [notes[1]] },
      { id: 'e3', duration: 'quarter', dotted: false, isRest: false, notes: [notes[2]] },
    ];

    initialScore.staves[0].measures[0].events = events;

    const engine = new ScoreEngine(initialScore);

    // 2. Apply triplet to first 3 notes
    engine.dispatch(new ApplyTupletCommand(0, 0, 3, [3, 2]));

    const scoreWithTuplet = engine.getState();

    // Verify tuplet exists
    expect(scoreWithTuplet.staves[0].measures[0].events[0].tuplet).toBeDefined();

    // 3. Change pitch of middle note
    const eventId = scoreWithTuplet.staves[0].measures[0].events[1].id;
    const noteId = scoreWithTuplet.staves[0].measures[0].events[1].notes[0].id;

    // 4. Change pitch
    engine.dispatch(new ChangePitchCommand(0, eventId, noteId, 'G4'));

    const finalScore = engine.getState();

    // 5. Verify structure
    expect(finalScore).toBeDefined();
    expect(finalScore.staves).toBeDefined();
    expect(finalScore.staves.length).toBeGreaterThan(0);

    // 6. Verify pitch changed
    const changedEvent = finalScore.staves[0].measures[0].events[1];
    expect(changedEvent.notes[0].pitch).toBe('G4');

    // 7. Verify tuplet preserved
    expect(changedEvent.tuplet).toBeDefined();
  });
});
