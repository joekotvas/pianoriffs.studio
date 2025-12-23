import { ChromaticTransposeCommand } from '../commands/ChromaticTransposeCommand';
import { createDefaultScore } from '../types';
import { Score, ScoreEvent } from '@/types';

// Mock Tonal.js if necessary, or rely on implementation if it imports Tonal
// Since the command uses Tonal internally, we'll verify end results

describe('ChromaticTransposeCommand', () => {
  const createScoreWithNote = (pitch: string, measureIdx = 0, eventIdx = 0): Score => {
    const score = createDefaultScore();
    const event: ScoreEvent = {
      id: 'e1',
      dotted: false,
      duration: 'quarter',
      notes: [{ id: 'n1', pitch }],
    };
    score.staves[0].measures[measureIdx].events[eventIdx] = event;
    return score;
  };

  test('transposes a single selected note', () => {
    let score = createScoreWithNote('C4');
    const selection = {
      measureIndex: 0,
      staffIndex: 0,
      eventId: 'e1',
      noteId: 'n1',
      selectedNotes: [],
    };

    const command = new ChromaticTransposeCommand(selection, 2); // Up 2 semitones (C4 -> D4)
    score = command.execute(score);

    const note = score.staves[0].measures[0].events[0].notes[0];
    expect(note.pitch).toBe('D4');
  });

  test('transposes down', () => {
    let score = createScoreWithNote('C4');
    const selection = {
      measureIndex: 0,
      staffIndex: 0,
      eventId: 'e1',
      noteId: 'n1',
      selectedNotes: [],
    };

    const command = new ChromaticTransposeCommand(selection, -1); // Down 1 semitone (C4 -> B3)
    score = command.execute(score);

    const note = score.staves[0].measures[0].events[0].notes[0];
    expect(note.pitch).toBe('B3');
  });

  test('clamps to piano range (lowest)', () => {
    let score = createScoreWithNote('A0');
    const selection = {
      measureIndex: 0,
      staffIndex: 0,
      eventId: 'e1',
      noteId: 'n1',
      selectedNotes: [],
    };

    const command = new ChromaticTransposeCommand(selection, -5); // Try to go below A0
    score = command.execute(score);

    const note = score.staves[0].measures[0].events[0].notes[0];
    expect(note.pitch).toBe('A0'); // Should stay at min
  });

  test('handles multi-selection', () => {
    let score = createDefaultScore();
    // Setup 2 notes
    const evt1: ScoreEvent = {
      id: 'e1',
      dotted: false,
      duration: 'quarter',
      notes: [{ id: 'n1', pitch: 'C4' }],
    };
    const evt2: ScoreEvent = {
      id: 'e2',
      dotted: false,
      duration: 'quarter',
      notes: [{ id: 'n2', pitch: 'E4' }],
    };
    score.staves[0].measures[0].events = [evt1, evt2];

    const selection = {
      measureIndex: 0,
      staffIndex: 0,
      eventId: 'e1', // Primary
      noteId: 'n1',
      selectedNotes: [
        { measureIndex: 0, staffIndex: 0, eventId: 'e1', noteId: 'n1', pitch: 'C4' },
        { measureIndex: 0, staffIndex: 0, eventId: 'e2', noteId: 'n2', pitch: 'E4' },
      ],
    };

    const command = new ChromaticTransposeCommand(selection, 1); // C4->Db4 / Cis4, E4->F4
    score = command.execute(score);

    const n1 = score.staves[0].measures[0].events[0].notes[0];
    const n2 = score.staves[0].measures[0].events[1].notes[0];

    // Tonal.js: C4 + 1 semitone = Db4 (or C#4 depending on context, verify)
    // Tonal usually prefers sharps for positive moves unless key context?
    // Let's just check expectation.
    expect(['Db4', 'C#4']).toContain(n1.pitch);
    expect(n2.pitch).toBe('F4');
  });

  test('ignores null pitch events (rests)', () => {
    const score = createDefaultScore();
    const restEvent: ScoreEvent = {
      id: 'r1',
      isRest: true,
      duration: 'quarter',
      dotted: false,
      notes: [],
    };
    score.staves[0].measures[0].events = [restEvent];

    // Select the rest
    const selection = {
      measureIndex: 0,
      staffIndex: 0,
      eventId: 'r1',
      noteId: null,
      selectedNotes: [],
    };

    const command = new ChromaticTransposeCommand(selection, 2);
    const before = JSON.stringify(score);
    const newScore = command.execute(score);
    const after = JSON.stringify(newScore);

    expect(before).toBe(after); // Should not differ
  });
});
