import { calculateMeasureWidth } from '@/engines/layout';

/**
 * Helper function that mirrors the synchronizedMeasureWidths calculation in ScoreCanvas.
 * Extracted for testing purposes.
 */
const calculateSynchronizedMeasureWidths = (staves: any[]): number[] | undefined => {
  if (!staves || staves.length <= 1) return undefined;

  const maxMeasures = Math.max(...staves.map((s: any) => s.measures?.length || 0));

  const widths: number[] = [];
  for (let i = 0; i < maxMeasures; i++) {
    let maxWidth = 0;
    staves.forEach((staff: any) => {
      const measure = staff.measures?.[i];
      if (measure) {
        const width = calculateMeasureWidth(measure.events, measure.isPickup);
        maxWidth = Math.max(maxWidth, width);
      }
    });
    widths.push(maxWidth);
  }
  return widths;
};

describe('Grand Staff Synchronized Measure Widths', () => {
  describe('calculateSynchronizedMeasureWidths', () => {
    it('should return undefined for single staff', () => {
      const singleStaff = [{ measures: [{ id: 'm1', events: [] }] }];
      expect(calculateSynchronizedMeasureWidths(singleStaff)).toBeUndefined();
    });

    it('should return undefined for empty staves array', () => {
      expect(calculateSynchronizedMeasureWidths([])).toBeUndefined();
    });

    it('should calculate max width per measure for Grand Staff', () => {
      // Treble: half note (wide), Bass: quarter note (narrower)
      const grandStaffScore = [
        {
          id: 'treble-staff',
          measures: [
            {
              id: 'm1-treble',
              events: [
                { id: 'e1', duration: 'half', dotted: false, notes: [{ id: 'n1', pitch: 'E5' }] },
              ],
            },
          ],
        },
        {
          id: 'bass-staff',
          measures: [
            {
              id: 'm1-bass',
              events: [
                {
                  id: 'e2',
                  duration: 'quarter',
                  dotted: false,
                  notes: [{ id: 'n2', pitch: 'C3' }],
                },
              ],
            },
          ],
        },
      ];

      const syncedWidths = calculateSynchronizedMeasureWidths(grandStaffScore);

      expect(syncedWidths).toBeDefined();
      expect(syncedWidths!.length).toBe(1); // 1 measure

      // The synced width should be the max of both staves
      const trebleWidth = calculateMeasureWidth(grandStaffScore[0].measures[0].events, false);
      const bassWidth = calculateMeasureWidth(grandStaffScore[1].measures[0].events, false);

      expect(syncedWidths![0]).toBe(Math.max(trebleWidth, bassWidth));
      expect(syncedWidths![0]).toBe(trebleWidth); // Half note is wider
    });

    it('should handle different content producing different widths', () => {
      // Measure with many short notes vs one long note
      const grandStaffScore = [
        {
          id: 'treble-staff',
          measures: [
            {
              id: 'm1',
              events: [
                { id: 'e1', duration: 'eighth', dotted: false, notes: [{ id: 'n1', pitch: 'C5' }] },
                { id: 'e2', duration: 'eighth', dotted: false, notes: [{ id: 'n2', pitch: 'D5' }] },
                { id: 'e3', duration: 'eighth', dotted: false, notes: [{ id: 'n3', pitch: 'E5' }] },
                { id: 'e4', duration: 'eighth', dotted: false, notes: [{ id: 'n4', pitch: 'F5' }] },
              ],
            },
          ],
        },
        {
          id: 'bass-staff',
          measures: [
            {
              id: 'm1-bass',
              events: [
                { id: 'e5', duration: 'whole', dotted: false, notes: [{ id: 'n5', pitch: 'C3' }] },
              ],
            },
          ],
        },
      ];

      const syncedWidths = calculateSynchronizedMeasureWidths(grandStaffScore);

      const trebleWidth = calculateMeasureWidth(grandStaffScore[0].measures[0].events, false);
      const bassWidth = calculateMeasureWidth(grandStaffScore[1].measures[0].events, false);

      // Verify we're taking the max
      expect(syncedWidths![0]).toBe(Math.max(trebleWidth, bassWidth));
    });

    it('should handle staves with different measure counts', () => {
      const grandStaffScore = [
        {
          id: 'treble-staff',
          measures: [
            { id: 'm1', events: [] },
            { id: 'm2', events: [] },
            { id: 'm3', events: [] },
          ],
        },
        {
          id: 'bass-staff',
          measures: [{ id: 'm1-bass', events: [] }],
        },
      ];

      const syncedWidths = calculateSynchronizedMeasureWidths(grandStaffScore);

      // Should have 3 widths (max measure count)
      expect(syncedWidths!.length).toBe(3);
    });

    it('both staves should use the same width for proper alignment', () => {
      const grandStaffScore = [
        {
          id: 'treble-staff',
          measures: [
            {
              id: 'm1',
              events: [
                {
                  id: 'e1',
                  duration: 'quarter',
                  dotted: false,
                  notes: [{ id: 'n1', pitch: 'G5' }],
                },
              ],
            },
          ],
        },
        {
          id: 'bass-staff',
          measures: [
            {
              id: 'm1-bass',
              events: [
                { id: 'e2', duration: 'half', dotted: false, notes: [{ id: 'n2', pitch: 'C3' }] },
                {
                  id: 'e3',
                  duration: 'quarter',
                  dotted: false,
                  notes: [{ id: 'n3', pitch: 'E3' }],
                },
              ],
            },
          ],
        },
      ];

      const syncedWidths = calculateSynchronizedMeasureWidths(grandStaffScore);

      const trebleWidth = calculateMeasureWidth(grandStaffScore[0].measures[0].events, false);
      const bassWidth = calculateMeasureWidth(grandStaffScore[1].measures[0].events, false);

      // Critical assertion: synced width should be bass width (which is larger)
      expect(bassWidth).toBeGreaterThan(trebleWidth);
      expect(syncedWidths![0]).toBe(bassWidth);
    });
  });
});
