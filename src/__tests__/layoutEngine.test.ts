/**
 * Layout Engine Tests
 *
 * Tests for chord, measure, and beaming layout calculations.
 * Covers: stem direction, spacing, tuplets, pitch detection.
 *
 * @see calculateChordLayout
 * @see calculateMeasureLayout
 * @see calculateBeamingGroups
 */

import {
  calculateChordLayout,
  calculateMeasureLayout,
  calculateBeamingGroups,
  getPitchForOffset,
  getOffsetForPitch,
} from '@/engines/layout';
import { Note } from '@/engines/layout/types';
import { ScoreEvent } from '@/types';

describe('layoutEngine', () => {
  describe('calculateChordLayout', () => {
    test('should determine stem direction based on furthest note', () => {
      // High note (C6) -> Stem Down
      const highNote: Note = { id: 'n1', pitch: 'C6' };
      const layoutHigh = calculateChordLayout([highNote], 'treble');
      expect(layoutHigh.direction).toBe('down');

      // Low note (C4) -> Stem Up
      const lowNote: Note = { id: 'n2', pitch: 'C4' };
      const layoutLow = calculateChordLayout([lowNote], 'treble');
      expect(layoutLow.direction).toBe('up');
    });

    test('should sort notes by pitch (ascending Y offset)', () => {
      const notes: Note[] = [
        { id: 'n1', pitch: 'C5' }, // Higher pitch, lower Y
        { id: 'n2', pitch: 'C4' }, // Lower pitch, higher Y
      ];

      const layout = calculateChordLayout(notes, 'treble');

      // Should be sorted by Y offset ascending (Top to Bottom visually)
      // C5 is higher on staff (lower Y value) than C4
      // But getOffsetForPitch returns larger values for lower pitches (relative to base)
      // C4 offset: 60, C5 offset: 18.
      // Sort is a.y - b.y. So 18 (C5) comes before 60 (C4).

      expect(layout.sortedNotes[0].pitch).toBe('C5');
      expect(layout.sortedNotes[1].pitch).toBe('C4');
    });

    test('should calculate note offsets for seconds (clusters)', () => {
      // F4 and G4 are a second apart
      const notes: Note[] = [
        { id: 'n1', pitch: 'F4' },
        { id: 'n2', pitch: 'G4' },
      ];

      const layout = calculateChordLayout(notes, 'treble');

      // One of them should be shifted
      const offsets = Object.values(layout.noteOffsets);
      expect(offsets.some((o) => o !== 0)).toBe(true);
    });
  });

  describe('calculateMeasureLayout', () => {
    test('should calculate correct width for empty measure', () => {
      const layout = calculateMeasureLayout([]);
      // Should contain padding + whole rest width
      expect(layout.totalWidth).toBeGreaterThan(0);
      expect(layout.processedEvents).toHaveLength(1); // Placeholder rest
      expect(layout.processedEvents[0].isRest).toBe(true);
    });

    test('should position events sequentially', () => {
      const events: ScoreEvent[] = [
        { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
        { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
      ];

      const layout = calculateMeasureLayout(events);

      expect(layout.eventPositions['e1']).toBeDefined();
      expect(layout.eventPositions['e2']).toBeDefined();
      expect(layout.eventPositions['e2']).toBeGreaterThan(layout.eventPositions['e1']);
    });

    test('should generate hit zones', () => {
      const events: ScoreEvent[] = [
        { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
      ];

      const layout = calculateMeasureLayout(events);

      // Should have: Insert (start), Event (note), Insert (after note), Append (end)
      const types = layout.hitZones.map((z) => z.type);
      expect(types).toContain('INSERT');
      expect(types).toContain('EVENT');
      expect(types).toContain('APPEND');
    });
  });

  describe('calculateBeamingGroups', () => {
    test('should group eighth notes', () => {
      const events: ScoreEvent[] = [
        { id: 'e1', duration: 'eighth', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
        { id: 'e2', duration: 'eighth', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
      ];

      // Mock positions
      const positions = { e1: 10, e2: 40 };

      const groups = calculateBeamingGroups(events, positions);

      expect(groups).toHaveLength(1);
      expect(groups[0].ids).toEqual(['e1', 'e2']);
      expect(groups[0].type).toBe('eighth');
    });

    test('should break beams on quarter notes', () => {
      const events: ScoreEvent[] = [
        { id: 'e1', duration: 'eighth', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
        { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] }, // Break
        { id: 'e3', duration: 'eighth', dotted: false, notes: [{ id: 'n3', pitch: 'E4' }] },
      ];

      const positions = { e1: 10, e2: 40, e3: 80 };

      const groups = calculateBeamingGroups(events, positions);

      expect(groups).toHaveLength(0); // No valid groups of >1 note
    });
  });

  describe('getNoteDuration with tuplets', () => {
    const { getNoteDuration } = require('../utils/core');

    test('should calculate triplet quarter note duration correctly', () => {
      // Quarter note = 16 quants
      // Triplet (3:2) = 16 * 2/3 = 10.67 quants
      const duration = getNoteDuration('quarter', false, { ratio: [3, 2] });
      expect(duration).toBeCloseTo((16 * 2) / 3, 2);
    });

    test('should calculate quintuplet eighth note duration correctly', () => {
      // Eighth note = 8 quants
      // Quintuplet (5:4) = 8 * 4/5 = 6.4 quants
      const duration = getNoteDuration('eighth', false, { ratio: [5, 4] });
      expect(duration).toBeCloseTo((8 * 4) / 5, 2);
    });

    test('should handle dotted tuplet notes', () => {
      // Dotted quarter = 24 quants
      // Triplet (3:2) = 24 * 2/3 = 16 quants
      const duration = getNoteDuration('quarter', true, { ratio: [3, 2] });
      expect(duration).toBe(16);
    });

    test('should return regular duration when tuplet is undefined', () => {
      const duration = getNoteDuration('quarter', false, undefined);
      expect(duration).toBe(16);
    });

    test('should handle septuplet (7:4 ratio)', () => {
      // Quarter note = 16 quants
      // Septuplet (7:4) = 16 * 4/7 = ~9.14 quants
      const duration = getNoteDuration('quarter', false, { ratio: [7, 4] });
      expect(duration).toBeCloseTo((16 * 4) / 7, 2);
    });
  });

  describe('calculateMeasureLayout with tuplets', () => {
    test('should process tuplet events with correct spacing', () => {
      const events: ScoreEvent[] = [
        {
          id: 'e1',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n1', pitch: 'C4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 0 },
        },
        {
          id: 'e2',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n2', pitch: 'D4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 1 },
        },
        {
          id: 'e3',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n3', pitch: 'E4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 2 },
        },
      ];

      const layout = calculateMeasureLayout(events);

      // All 3 events should be positioned
      expect(layout.eventPositions['e1']).toBeDefined();
      expect(layout.eventPositions['e2']).toBeDefined();
      expect(layout.eventPositions['e3']).toBeDefined();

      // Verify even spacing
      const spacing1 = layout.eventPositions['e2'] - layout.eventPositions['e1'];
      const spacing2 = layout.eventPositions['e3'] - layout.eventPositions['e2'];
      expect(spacing1).toBeCloseTo(spacing2, 1);
    });

    test('should mix tuplet and regular events', () => {
      const events: ScoreEvent[] = [
        {
          id: 'e1',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n1', pitch: 'C4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 0 },
        },
        {
          id: 'e2',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n2', pitch: 'D4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 1 },
        },
        {
          id: 'e3',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n3', pitch: 'E4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 2 },
        },
        { id: 'e4', duration: 'quarter', dotted: false, notes: [{ id: 'n4', pitch: 'F4' }] }, // Regular note
      ];

      const layout = calculateMeasureLayout(events);

      // All 4 events should be positioned
      expect(layout.processedEvents).toHaveLength(4);
      expect(layout.eventPositions['e4']).toBeGreaterThan(layout.eventPositions['e3']);
    });

    test('should handle mixed-value tuplets with proportional spacing', () => {
      // Triplet with eighth + quarter + eighth
      // Quarter should occupy ~2× the space of each eighth
      const events: ScoreEvent[] = [
        {
          id: 'e1',
          duration: 'eighth',
          dotted: false,
          notes: [{ id: 'n1', pitch: 'C4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 0 },
        },
        {
          id: 'e2',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'n2', pitch: 'D4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 1 },
        },
        {
          id: 'e3',
          duration: 'eighth',
          dotted: false,
          notes: [{ id: 'n3', pitch: 'E4' }],
          tuplet: { ratio: [3, 2], groupSize: 3, position: 2 },
        },
      ];

      const layout = calculateMeasureLayout(events);

      // All 3 events should be positioned
      expect(layout.eventPositions['e1']).toBeDefined();
      expect(layout.eventPositions['e2']).toBeDefined();
      expect(layout.eventPositions['e3']).toBeDefined();

      // Verify proportional spacing
      const spacing1to2 = layout.eventPositions['e2'] - layout.eventPositions['e1'];
      const spacing2to3 = layout.eventPositions['e3'] - layout.eventPositions['e2'];

      // Quarter should occupy more space than eighth (approximately 2×)
      // But we're checking for proportionality, not exact equality
      expect(spacing2to3).toBeGreaterThan(spacing1to2 * 0.8); // At least 80% of first spacing
      expect(spacing2to3).toBeLessThan(spacing1to2 * 3); // But not more than 3× (sanity check)

      // The middle spacing (quarter) should be larger than edge spacings (eighths)
      expect(spacing2to3).toBeGreaterThan(spacing1to2);
    });
  });
});

describe('Pitch Detection (getPitchForOffset)', () => {
  test('should map exact Y offsets to correct pitch (Treble)', () => {
    // Middle C (C4) on Treble Clef is one ledger line below staff.
    // Check constants: C4 maps to offset 60.
    const offsetC4 = 60;
    const pitch = getPitchForOffset(offsetC4, 'treble');
    expect(pitch).toBe('C4');

    // F5 (Top line) -> Offset 0
    const offsetF5 = 0;
    const pitchF5 = getPitchForOffset(offsetF5, 'treble');
    expect(pitchF5).toBe('F5');
  });

  test('should map exact Y offsets to correct pitch (Bass)', () => {
    // C3 (Middle C relative to Bass) is above staff.
    // Check constants: C3 maps to offset 30.
    const offsetC3 = 30;
    const pitchC3 = getPitchForOffset(offsetC3, 'bass');
    expect(pitchC3).toBe('C3');

    // A3 (Top line) -> Offset 0
    const offsetA3 = 0;
    const pitchA3 = getPitchForOffset(offsetA3, 'bass');
    expect(pitchA3).toBe('A3');
  });

  test('should return undefined for invalid offsets', () => {
    const pitch = getPitchForOffset(9999, 'treble');
    expect(pitch).toBeUndefined();
  });

  test('should support round-trip conversion', () => {
    const startPitch = 'G4';
    const offset = getOffsetForPitch(startPitch, 'treble');
    const endPitch = getPitchForOffset(offset, 'treble');
    expect(endPitch).toBe(startPitch);
  });
});
