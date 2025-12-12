/**
 * Tests for generateScore utility
 */

import { generateStaves, createEmptyMeasure, resetIdCounter } from '../utils/generateScore';

describe('generateScore', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('generateStaves', () => {
    it('generates a single treble staff with correct number of measures', () => {
      const staves = generateStaves('treble', 4, 'C');
      
      expect(staves).toHaveLength(1);
      expect(staves[0].clef).toBe('treble');
      expect(staves[0].keySignature).toBe('C');
      expect(staves[0].measures).toHaveLength(4);
    });

    it('generates a single bass staff with correct number of measures', () => {
      const staves = generateStaves('bass', 3, 'G');
      
      expect(staves).toHaveLength(1);
      expect(staves[0].clef).toBe('bass');
      expect(staves[0].keySignature).toBe('G');
      expect(staves[0].measures).toHaveLength(3);
    });

    it('generates grand staff with treble and bass clefs', () => {
      const staves = generateStaves('grand', 2, 'F');
      
      expect(staves).toHaveLength(2);
      expect(staves[0].clef).toBe('treble');
      expect(staves[1].clef).toBe('bass');
      expect(staves[0].keySignature).toBe('F');
      expect(staves[1].keySignature).toBe('F');
      expect(staves[0].measures).toHaveLength(2);
      expect(staves[1].measures).toHaveLength(2);
    });

    it('generates unique IDs for all staves and measures', () => {
      const staves = generateStaves('grand', 2, 'C');
      
      const allIds = [
        staves[0].id,
        staves[1].id,
        ...staves[0].measures.map(m => m.id),
        ...staves[1].measures.map(m => m.id),
      ];
      
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('createEmptyMeasure', () => {
    it('creates an empty measure with no events', () => {
      const measure = createEmptyMeasure();
      
      expect(measure.id).toBeDefined();
      // Empty measures have events: []. The layout engine creates a 
      // centered, non-interactive placeholder rest for display.
      expect(measure.events).toEqual([]);
    });
  });
});
