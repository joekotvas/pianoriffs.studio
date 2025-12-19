import { calculateNoteRange, getLinearizedNotes } from '@/utils/selection';
import { Score } from '@/types';

// Mock Score Factory
const createMockScore = (): Score => ({
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm1',
          events: [
            {
              id: 'e1',
              duration: 'quarter',
              notes: [{ id: 'n1', pitch: 'C4' }],
              dotted: false,
            },
            {
              id: 'e2',
              duration: 'quarter',
              notes: [{ id: 'n2', pitch: 'D4' }],
              dotted: false,
            },
          ],
        },
        {
          id: 'm2',
          events: [
            {
              id: 'e3',
              duration: 'quarter',
              notes: [{ id: 'n3', pitch: 'E4' }],
              dotted: false,
            },
            {
              id: 'e4',
              duration: 'quarter',
              notes: [{ id: 'n4', pitch: 'F4' }],
              dotted: false,
            },
          ],
        },
      ],
    },
  ],
});

describe('Anchor Selection Logic', () => {
  const score = createMockScore();
  const linearNotes = getLinearizedNotes(score);

  it('getLinearizedNotes flattens the score correctly', () => {
    expect(linearNotes).toHaveLength(4);
    expect(linearNotes[0].noteId).toBe('n1');
    expect(linearNotes[3].noteId).toBe('n4');
  });

  it('calculateNoteRange returns correct range (Forward)', () => {
    const anchor = linearNotes[0]; // n1
    const focus = linearNotes[2]; // n3
    const range = calculateNoteRange(anchor, focus, linearNotes);

    expect(range).toHaveLength(3);
    expect(range.map((n) => n.noteId)).toEqual(['n1', 'n2', 'n3']);
  });

  it('calculateNoteRange returns correct range (Backward)', () => {
    const anchor = linearNotes[2]; // n3
    const focus = linearNotes[0]; // n1
    const range = calculateNoteRange(anchor, focus, linearNotes);

    expect(range).toHaveLength(3);
    expect(range.map((n) => n.noteId)).toEqual(['n1', 'n2', 'n3']); // Order in list is always linear
  });

  it('calculateNoteRange handles single item range', () => {
    const anchor = linearNotes[0];
    const focus = linearNotes[0];
    const range = calculateNoteRange(anchor, focus, linearNotes);

    expect(range).toHaveLength(1);
    expect(range[0].noteId).toBe('n1');
  });

  it('calculateNoteRange returns empty if not found', () => {
    const anchor = { staffIndex: 0, measureIndex: 99, eventId: 'bad', noteId: 'bad' };
    const focus = linearNotes[0];
    const range = calculateNoteRange(anchor, focus, linearNotes);
    expect(range).toHaveLength(0);
  });
});
