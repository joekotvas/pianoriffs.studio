/**
 * ABC Exporter Tests
 *
 * Tests clef export correctness for all clef types.
 */

import { generateABC } from '@/exporters/abcExporter';
import { Score } from '@/types';

/**
 * Create a minimal score with the specified clef
 */
const createScoreWithClef = (clef: string): Score => ({
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-1',
      clef: clef as 'treble' | 'bass' | 'alto' | 'tenor' | 'grand',
      keySignature: 'C',
      measures: [
        {
          id: 'measure-1',
          events: [
            {
              id: 'event-1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'note-1', pitch: 'C4' }],
            },
          ],
        },
      ],
    },
  ],
});

describe('ABC Clef Export', () => {
  it.each(['treble', 'bass', 'alto', 'tenor'])(
    'exports %s clef correctly',
    (clef) => {
      const score = createScoreWithClef(clef);
      const abc = generateABC(score, 120);

      expect(abc).toContain(`clef=${clef}`);
    }
  );

  it('includes required ABC header fields', () => {
    const score = createScoreWithClef('treble');
    const abc = generateABC(score, 120);

    expect(abc).toContain('X:1');
    expect(abc).toContain('T:Test Score');
    expect(abc).toContain('M:4/4');
    expect(abc).toContain('Q:1/4=120');
  });

  describe('exception paths', () => {
    it('defaults unknown clef to treble', () => {
      const score = createScoreWithClef('unknown' as string);
      const abc = generateABC(score, 120);

      expect(abc).toContain('clef=treble');
    });

    it('defaults grand staff to treble clef for voice', () => {
      const score = createScoreWithClef('grand');
      const abc = generateABC(score, 120);

      // Grand is not a standard ABC clef, should default to treble
      expect(abc).toContain('clef=treble');
    });

    it('handles empty measures array', () => {
      const score: Score = {
        ...createScoreWithClef('treble'),
        staves: [
          {
            id: 'staff-1',
            clef: 'treble',
            keySignature: 'C',
            measures: [],
          },
        ],
      };
      const abc = generateABC(score, 120);

      expect(abc).toContain('X:1');
      expect(abc).toContain('V:1 clef=treble');
    });

    it('handles missing clef property (defaults to treble)', () => {
      const score = createScoreWithClef('treble');
      // Test fallback when clef is undefined
      (score.staves[0] as { clef?: string }).clef = undefined;
      const abc = generateABC(score, 120);

      expect(abc).toContain('clef=treble');
    });
  });
});
