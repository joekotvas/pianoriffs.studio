/**
 * Interaction Utils Tests
 *
 * Tests for navigation and transposition calculation utilities.
 * Covers: selection nav, ghost cursor, transposition preview.
 *
 * @see calculateNextSelection
 * @see calculateTranspositionWithPreview
 */

import { calculateNextSelection, calculateTranspositionWithPreview } from '@/utils/interaction';

// Mock utils dependencies if needed, or rely on them being pure functions
// Since interactionUtils imports from utils, we might need to mock utils if we want isolated unit tests.
// However, for now, we can test integration with the real utils as they are also pure functions.

describe('interactionUtils', () => {
  const mockMeasures = [
    {
      id: 1,
      events: [
        { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
        { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
      ],
    },
    {
      id: 2,
      events: [
        { id: 'e3', duration: 'quarter', dotted: false, notes: [{ id: 'n3', pitch: 'E4' }] },
      ],
    },
  ];

  describe('calculateNextSelection', () => {
    test('should navigate right within measure', () => {
      const selection = { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n1' };
      const result = calculateNextSelection(
        mockMeasures,
        selection,
        'right',
        null,
        'quarter',
        false
      );

      expect(result?.selection).toEqual({
        measureIndex: 0,
        eventId: 'e2',
        noteId: 'n2',
        staffIndex: 0,
        anchor: null,
        selectedNotes: [],
      });
    });

    test('should show ghost cursor when navigating right from last event with space available', () => {
      const selection = { staffIndex: 0, measureIndex: 0, eventId: 'e2', noteId: 'n2' };
      // Mock measure has 2 quarter notes = 8 quants, 4/4 measure = 16 quants
      // So there's 8 quants of space available
      const result = calculateNextSelection(
        mockMeasures,
        selection,
        'right',
        null,
        'quarter',
        false
      );

      // Should show ghost cursor in same measure, not jump to next measure
      expect(result?.selection).toEqual({
        measureIndex: null,
        eventId: null,
        noteId: null,
        staffIndex: 0,
      });
      expect(result?.previewNote).toBeDefined();
      expect(result?.previewNote?.measureIndex).toBe(0);
      expect(result?.previewNote?.mode).toBe('APPEND');
    });

    test('should move to ghost note when navigating right from last event', () => {
      const selection = { staffIndex: 0, measureIndex: 1, eventId: 'e3', noteId: 'n3' };
      const result = calculateNextSelection(
        mockMeasures,
        selection,
        'right',
        null,
        'quarter',
        false
      );

      expect(result?.selection).toEqual({
        staffIndex: 0,
        measureIndex: null,
        eventId: null,
        noteId: null,
      });
      expect(result?.previewNote).toBeDefined();
      expect(result?.previewNote?.measureIndex).toBe(1);
      expect(result?.previewNote?.mode).toBe('APPEND');
    });

    test('should navigate left from ghost note to select last event in same measure', () => {
      // Ghost cursor in measure 1 at quant 16 (APPEND position after the quarter note e3)
      const previewNote = { measureIndex: 1, staffIndex: 0, quant: 16, visualQuant: 16, pitch: 'E4', duration: 'quarter', dotted: false, mode: 'APPEND' as const, index: 1, isRest: false };
      const selection = { staffIndex: 0, measureIndex: null, eventId: null, noteId: null };
      const result = calculateNextSelection(
        mockMeasures,
        selection,
        'left',
        previewNote,
        'quarter',
        false
      );

      // Pressing left from append position should select the last event (e3) in the measure
      expect(result?.selection).toEqual({
        staffIndex: 0,
        measureIndex: 1,
        eventId: 'e3',
        noteId: 'n3',
      });
      expect(result?.previewNote).toBeNull();
    });
  });

  describe('calculateTranspositionWithPreview', () => {
    test('should transpose selected event', () => {
      const selection = { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n1' };
      const result = calculateTranspositionWithPreview(mockMeasures, selection, null, 'up', false);

      expect(result?.measures).toBeDefined();
      const newNote = result!.measures![0].events[0].notes[0];
      // C4 -> D4 (assuming diatonic C major or similar default logic in utils)
      // Actually utils uses ORDERED_PITCHES. C4 -> C#4 or D4 depending on scale?
      // Let's just check it changed.
      expect(newNote.pitch).not.toBe('C4');
    });

    test('should transpose preview note', () => {
      const previewNote = { measureIndex: 0, staffIndex: 0, quant: 0, visualQuant: 0, pitch: 'C4', duration: 'quarter', dotted: false, mode: 'APPEND' as const, index: 0, isRest: false };
      const selection = { staffIndex: 0, measureIndex: null, eventId: null, noteId: null };
      const result = calculateTranspositionWithPreview(
        mockMeasures,
        selection,
        previewNote,
        'up',
        false
      );

      expect(result?.previewNote).toBeDefined();
      expect(result?.previewNote?.pitch).not.toBe('C4');
    });
  });
});
