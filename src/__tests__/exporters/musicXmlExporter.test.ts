/**
 * MusicXML Exporter Tests
 *
 * Tests clef export correctness for all clef types.
 */

import { generateMusicXML } from '@/exporters/musicXmlExporter';
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

describe('MusicXML Clef Export', () => {
  it.each([
    ['treble', 'G', '2'],
    ['bass', 'F', '4'],
    ['alto', 'C', '3'],
    ['tenor', 'C', '4'],
  ])('exports %s clef with sign=%s, line=%s', (clef, expectedSign, expectedLine) => {
    const score = createScoreWithClef(clef);
    const xml = generateMusicXML(score);

    expect(xml).toContain(`<sign>${expectedSign}</sign>`);
    expect(xml).toContain(`<line>${expectedLine}</line>`);
  });

  it('exports valid XML structure', () => {
    const score = createScoreWithClef('treble');
    const xml = generateMusicXML(score);

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<score-partwise');
    expect(xml).toContain('</score-partwise>');
  });

  describe('exception paths', () => {
    it('defaults unknown clef to treble (G on line 2)', () => {
      const score = createScoreWithClef('unknown' as string);
      const xml = generateMusicXML(score);

      expect(xml).toContain('<sign>G</sign>');
      expect(xml).toContain('<line>2</line>');
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
      const xml = generateMusicXML(score);

      expect(xml).toContain('<score-partwise');
      expect(xml).toContain('</score-partwise>');
    });

    it('handles missing clef property (defaults to treble)', () => {
      const score = createScoreWithClef('treble');
      // Test fallback when clef is undefined
      (score.staves[0] as { clef?: string }).clef = undefined;
      const xml = generateMusicXML(score);

      expect(xml).toContain('<sign>G</sign>');
      expect(xml).toContain('<line>2</line>');
    });

    it('skips notes with null pitch without errors', () => {
      const score: Score = {
        ...createScoreWithClef('treble'),
        staves: [
          {
            id: 'staff-1',
            clef: 'treble',
            keySignature: 'C',
            measures: [
              {
                id: 'measure-1',
                events: [
                  {
                    id: 'event-1',
                    duration: 'quarter',
                    dotted: false,
                    notes: [
                      { id: 'note-1', pitch: null },
                      { id: 'note-2', pitch: 'D4' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Should not throw and should export the valid note
      const xml = generateMusicXML(score);

      expect(xml).toContain('<score-partwise');
      expect(xml).toContain('<step>D</step>');
      expect(xml).toContain('<octave>4</octave>');
    });
  });
});
