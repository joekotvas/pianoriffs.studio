/**
 * Comprehensive tests for core.ts utility functions.
 * Covers: getNoteDuration, calculateTotalQuants, getBreakdownOfQuants,
 *         isRestEvent, isNoteEvent, getFirstNoteId, navigateSelection
 */

import {
  getNoteDuration,
  calculateTotalQuants,
  getBreakdownOfQuants,
  isRestEvent,
  isNoteEvent,
  getFirstNoteId,
  navigateSelection,
  reflowScore,
} from '@/utils/core';

describe('core.ts utilities', () => {
  // ---------------------------------------------------
  // getNoteDuration
  // ---------------------------------------------------
  describe('getNoteDuration', () => {
    it('should return base duration for standard note types', () => {
      expect(getNoteDuration('whole', false)).toBe(64);
      expect(getNoteDuration('half', false)).toBe(32);
      expect(getNoteDuration('quarter', false)).toBe(16);
      expect(getNoteDuration('eighth', false)).toBe(8);
      expect(getNoteDuration('sixteenth', false)).toBe(4);
      expect(getNoteDuration('thirtysecond', false)).toBe(2);
    });

    it('should add 50% for dotted notes', () => {
      expect(getNoteDuration('quarter', true)).toBe(24); // 16 * 1.5
      expect(getNoteDuration('half', true)).toBe(48); // 32 * 1.5
      expect(getNoteDuration('eighth', true)).toBe(12); // 8 * 1.5
    });

    it('should apply tuplet ratio correctly', () => {
      // Triplet: 3 notes in space of 2
      expect(getNoteDuration('quarter', false, { ratio: [3, 2] })).toBeCloseTo(10.67, 1); // 16 * 2/3

      // Quintuplet: 5 notes in space of 4
      expect(getNoteDuration('eighth', false, { ratio: [5, 4] })).toBeCloseTo(6.4, 1); // 8 * 4/5
    });

    it('should combine dotted and tuplet', () => {
      // Dotted quarter triplet: 24 * 2/3 = 16
      expect(getNoteDuration('quarter', true, { ratio: [3, 2] })).toBeCloseTo(16, 1);
    });

    it('should handle edge case: sixtyfourth note', () => {
      expect(getNoteDuration('sixtyfourth', false)).toBe(1);
      expect(getNoteDuration('sixtyfourth', true)).toBe(1.5);
    });
  });

  // ---------------------------------------------------
  // calculateTotalQuants
  // ---------------------------------------------------
  describe('calculateTotalQuants', () => {
    it('should return 0 for empty event list', () => {
      expect(calculateTotalQuants([])).toBe(0);
    });

    it('should sum durations of multiple events', () => {
      const events = [
        { duration: 'quarter', dotted: false },
        { duration: 'quarter', dotted: false },
        { duration: 'half', dotted: false },
      ];
      // 16 + 16 + 32 = 64
      expect(calculateTotalQuants(events)).toBe(64);
    });

    it('should handle dotted notes correctly', () => {
      const events = [
        { duration: 'quarter', dotted: true },
        { duration: 'eighth', dotted: false },
      ];
      // 24 + 8 = 32
      expect(calculateTotalQuants(events)).toBe(32);
    });

    it('should handle tuplet events', () => {
      const events = [
        { duration: 'quarter', dotted: false, tuplet: { ratio: [3, 2] } },
        { duration: 'quarter', dotted: false, tuplet: { ratio: [3, 2] } },
        { duration: 'quarter', dotted: false, tuplet: { ratio: [3, 2] } },
      ];
      // Each is ~10.67 quants, total ~32 (fits in half note space)
      expect(calculateTotalQuants(events)).toBeCloseTo(32, 0);
    });
  });

  // ---------------------------------------------------
  // getBreakdownOfQuants
  // ---------------------------------------------------
  describe('getBreakdownOfQuants', () => {
    it('should decompose 64 quants into one whole note', () => {
      const result = getBreakdownOfQuants(64);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ duration: 'whole', dotted: false, quants: 64 });
    });

    it('should decompose 16 quants into one quarter note', () => {
      const result = getBreakdownOfQuants(16);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ duration: 'quarter', dotted: false, quants: 16 });
    });

    it('should decompose 24 quants into dotted quarter', () => {
      const result = getBreakdownOfQuants(24);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ duration: 'quarter', dotted: true, quants: 24 });
    });

    it('should decompose 40 quants into half + eighth (32 + 8)', () => {
      const result = getBreakdownOfQuants(40);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ duration: 'half', dotted: false, quants: 32 });
      expect(result[1]).toEqual({ duration: 'eighth', dotted: false, quants: 8 });
    });

    it('should decompose 17 quants into quarter + sixtyfourth (16 + 1)', () => {
      const result = getBreakdownOfQuants(17);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ duration: 'quarter', dotted: false, quants: 16 });
      expect(result[1]).toEqual({ duration: 'sixtyfourth', dotted: false, quants: 1 });
    });

    it('should return empty array for 0 quants', () => {
      expect(getBreakdownOfQuants(0)).toEqual([]);
    });

    it('should handle odd quant values (7 = dotted sixteenth + sixtyfourth)', () => {
      const result = getBreakdownOfQuants(7);
      // Function prefers dotted notes: 6 (dotted sixteenth) + 1 (sixtyfourth)
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ duration: 'sixteenth', dotted: true, quants: 6 });
      expect(result[1]).toEqual({ duration: 'sixtyfourth', dotted: false, quants: 1 });
    });
  });

  // ---------------------------------------------------
  // isRestEvent / isNoteEvent
  // ---------------------------------------------------
  describe('isRestEvent / isNoteEvent', () => {
    it('should identify rest events', () => {
      expect(isRestEvent({ isRest: true, notes: [] })).toBe(true);
      expect(isRestEvent({ isRest: true, notes: [{ id: 'rest-1', pitch: null }] })).toBe(true);
    });

    it('should identify note events', () => {
      expect(isNoteEvent({ isRest: false, notes: [{ id: 'n1', pitch: 'C4' }] })).toBe(true);
    });

    it('should return false for empty note event', () => {
      expect(isNoteEvent({ isRest: false, notes: [] })).toBe(false);
    });

    it('should handle undefined isRest (defaults to note)', () => {
      expect(isRestEvent({ notes: [{ pitch: 'C4' }] })).toBe(false);
      expect(isNoteEvent({ notes: [{ pitch: 'C4' }] })).toBe(true);
    });
  });

  // ---------------------------------------------------
  // getFirstNoteId
  // ---------------------------------------------------
  describe('getFirstNoteId', () => {
    it('should return first note ID', () => {
      expect(getFirstNoteId({ notes: [{ id: 'n1' }, { id: 'n2' }] })).toBe('n1');
    });

    it('should return null for empty notes array', () => {
      expect(getFirstNoteId({ notes: [] })).toBe(null);
    });

    it('should return null for undefined notes', () => {
      expect(getFirstNoteId({})).toBe(null);
    });

    it('should work with rest events (pitchless notes)', () => {
      expect(getFirstNoteId({ notes: [{ id: 'rest-1', pitch: null }] })).toBe('rest-1');
    });
  });

  // ---------------------------------------------------
  // navigateSelection
  // ---------------------------------------------------
  describe('navigateSelection', () => {
    const createMeasures = () => [
      {
        events: [
          { id: 'e1', notes: [{ id: 'n1', pitch: 'C4' }] },
          { id: 'e2', notes: [{ id: 'n2', pitch: 'D4' }] },
          { id: 'e3', notes: [{ id: 'n3', pitch: 'E4' }] },
        ],
      },
      {
        events: [
          { id: 'e4', notes: [{ id: 'n4', pitch: 'F4' }] },
          { id: 'e5', notes: [{ id: 'n5', pitch: 'G4' }] },
        ],
      },
    ];

    it('should navigate right within measure', () => {
      const measures = createMeasures();
      const selection = { measureIndex: 0, eventId: 'e1', noteId: 'n1' };
      const result = navigateSelection(measures, selection, 'right');
      expect(result.eventId).toBe('e2');
      expect(result.noteId).toBe('n2');
    });

    it('should navigate left within measure', () => {
      const measures = createMeasures();
      const selection = { measureIndex: 0, eventId: 'e2', noteId: 'n2' };
      const result = navigateSelection(measures, selection, 'left');
      expect(result.eventId).toBe('e1');
      expect(result.noteId).toBe('n1');
    });

    it('should cross measure boundary going right', () => {
      const measures = createMeasures();
      const selection = { measureIndex: 0, eventId: 'e3', noteId: 'n3' };
      const result = navigateSelection(measures, selection, 'right');
      expect(result.measureIndex).toBe(1);
      expect(result.eventId).toBe('e4');
    });

    it('should cross measure boundary going left', () => {
      const measures = createMeasures();
      const selection = { measureIndex: 1, eventId: 'e4', noteId: 'n4' };
      const result = navigateSelection(measures, selection, 'left');
      expect(result.measureIndex).toBe(0);
      expect(result.eventId).toBe('e3');
    });

    it('should not navigate past first event', () => {
      const measures = createMeasures();
      const selection = { measureIndex: 0, eventId: 'e1', noteId: 'n1' };
      const result = navigateSelection(measures, selection, 'left');
      expect(result).toEqual(selection);
    });

    it('should not navigate past last event', () => {
      const measures = createMeasures();
      const selection = { measureIndex: 1, eventId: 'e5', noteId: 'n5' };
      const result = navigateSelection(measures, selection, 'right');
      expect(result).toEqual(selection);
    });

    it('should return unchanged selection for null measureIndex', () => {
      const measures = createMeasures();
      const selection = { measureIndex: null, eventId: null, noteId: null };
      const result = navigateSelection(measures, selection, 'right');
      expect(result).toEqual(selection);
    });

    describe('chord navigation (up/down)', () => {
      it('should navigate up within chord', () => {
        const measures = [
          {
            events: [
              {
                id: 'chord1',
                notes: [
                  { id: 'low', pitch: 'C4' },
                  { id: 'mid', pitch: 'E4' },
                  { id: 'high', pitch: 'G4' },
                ],
              },
            ],
          },
        ];
        const selection = { measureIndex: 0, eventId: 'chord1', noteId: 'low' };
        const result = navigateSelection(measures, selection, 'up');
        expect(result.noteId).toBe('mid');
      });

      it('should navigate down within chord', () => {
        const measures = [
          {
            events: [
              {
                id: 'chord1',
                notes: [
                  { id: 'low', pitch: 'C4' },
                  { id: 'mid', pitch: 'E4' },
                  { id: 'high', pitch: 'G4' },
                ],
              },
            ],
          },
        ];
        const selection = { measureIndex: 0, eventId: 'chord1', noteId: 'high' };
        const result = navigateSelection(measures, selection, 'down');
        expect(result.noteId).toBe('mid');
      });

      it('should not navigate past top of chord', () => {
        const measures = [
          {
            events: [
              {
                id: 'chord1',
                notes: [
                  { id: 'low', pitch: 'C4' },
                  { id: 'high', pitch: 'G4' },
                ],
              },
            ],
          },
        ];
        const selection = { measureIndex: 0, eventId: 'chord1', noteId: 'high' };
        const result = navigateSelection(measures, selection, 'up');
        expect(result.noteId).toBe('high'); // unchanged
      });

      it('should not affect single-note events on up/down', () => {
        const measures = createMeasures();
        const selection = { measureIndex: 0, eventId: 'e1', noteId: 'n1' };
        const result = navigateSelection(measures, selection, 'up');
        expect(result).toEqual(selection);
      });
    });
  });

  // ---------------------------------------------------
  // reflowScore (basic tests)
  // ---------------------------------------------------
  describe('reflowScore', () => {
    it('should return empty measure array for empty input', () => {
      const result = reflowScore([], '4/4');
      expect(result).toHaveLength(1);
      expect(result[0].events).toEqual([]);
    });

    it('should preserve events in a single full measure', () => {
      const measures = [
        {
          id: 1,
          events: [
            { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
            { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
            { id: 'e3', duration: 'quarter', dotted: false, notes: [{ id: 'n3', pitch: 'E4' }] },
            { id: 'e4', duration: 'quarter', dotted: false, notes: [{ id: 'n4', pitch: 'F4' }] },
          ],
          isPickup: false,
        },
      ];

      const result = reflowScore(measures, '4/4');
      expect(result).toHaveLength(1);
      expect(result[0].events).toHaveLength(4);
    });

    it('should split overflowing measures', () => {
      // 6 quarters = 96 quants, needs 2 measures in 4/4 (64 quants each)
      const measures = [
        {
          id: 1,
          events: Array(6)
            .fill(null)
            .map((_, i) => ({
              id: `e${i}`,
              duration: 'quarter',
              dotted: false,
              notes: [{ id: `n${i}`, pitch: 'C4' }],
            })),
          isPickup: false,
        },
      ];

      const result = reflowScore(measures, '4/4');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should preserve pickup measure flag', () => {
      const measures = [
        {
          id: 1,
          events: [
            { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
          ],
          isPickup: true,
        },
      ];

      const result = reflowScore(measures, '4/4');
      expect(result[0].isPickup).toBe(true);
    });
  });
});
