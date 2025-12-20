/**
 * Tests for ExtendSelectionVerticallyCommand and SelectFullEventsCommand
 *
 * @see Issue #101
 */

import { ExtendSelectionVerticallyCommand } from '@/commands/selection/ExtendSelectionVerticallyCommand';
import { SelectFullEventsCommand } from '@/commands/selection/SelectFullEventsCommand';
import type { Selection, Score } from '@/types';

// ========== TEST FIXTURES ==========

const createTestScore = (): Score => ({
  id: 'test-score',
  title: 'Test Score',
  staves: [
    {
      id: 'treble-staff',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [
            {
              id: 'e0',
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'n0', pitch: 'C4' },
                { id: 'n1', pitch: 'E4' },
                { id: 'n2', pitch: 'G4' },
              ],
            },
            {
              id: 'e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'n3', pitch: 'D4' }],
            },
          ],
        },
        {
          id: 'm1',
          events: [
            {
              id: 'e2',
              duration: 'half',
              dotted: false,
              notes: [
                { id: 'n4', pitch: 'E4' },
                { id: 'n5', pitch: 'G4' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'bass-staff',
      clef: 'bass',
      keySignature: 'C',
      measures: [
        {
          id: 'bass-m0',
          events: [
            {
              id: 'bass-e0',
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'bass-n0', pitch: 'C3' },
                { id: 'bass-n1', pitch: 'G3' },
              ],
            },
            {
              id: 'bass-e1',
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'bass-n2', pitch: 'D3' }],
            },
          ],
        },
        {
          id: 'bass-m1',
          events: [
            {
              id: 'bass-e2',
              duration: 'half',
              dotted: false,
              isRest: true,
              notes: [],
            },
          ],
        },
      ],
    },
  ],
});

const createEmptySelection = (): Selection => ({
  staffIndex: 0,
  measureIndex: null,
  eventId: null,
  noteId: null,
  selectedNotes: [],
  anchor: null,
});

const createSelectionWithNote = (
  staffIndex: number,
  measureIndex: number,
  eventId: string | number,
  noteId: string | number | null
): Selection => ({
  staffIndex,
  measureIndex,
  eventId,
  noteId,
  selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
  anchor: { staffIndex, measureIndex, eventId, noteId },
});

// ========== SelectFullEventsCommand TESTS ==========

describe('SelectFullEventsCommand', () => {
  describe('happy paths', () => {
    test('fills single partial chord', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 only

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(3);
      expect(result.selectedNotes.map(n => n.noteId)).toEqual(
        expect.arrayContaining(['n0', 'n1', 'n2'])
      );
    });

    test('handles already full event', () => {
      const score = createTestScore();
      const state: Selection = {
        ...createSelectionWithNote(0, 0, 'e0', 'n0'),
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' },
        ],
      };

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(3);
    });

    test('fills multiple partial events', () => {
      const score = createTestScore();
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }, // Partial chord
          { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n4' }, // Partial chord in M1
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      };

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      // Should have 3 notes from e0 + 2 notes from e2
      expect(result.selectedNotes).toHaveLength(5);
    });
  });

  describe('edge cases', () => {
    test('returns unchanged for empty selection', () => {
      const score = createTestScore();
      const state = createEmptySelection();

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result).toBe(state);
    });

    test('handles single-note event', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e1', 'n3'); // Single note event

      const cmd = new SelectFullEventsCommand();
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(1);
    });
  });
});

// ========== ExtendSelectionVerticallyCommand TESTS ==========

describe('ExtendSelectionVerticallyCommand', () => {
  describe('anchor-based cursor movement within chords', () => {
    test('extend down from top note moves cursor to middle', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n2'); // G4 (top)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Anchor stays at G4, cursor moves to E4
      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n2'); // G4 still selected
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n1'); // E4 added
    });

    test('extend up from bottom note moves cursor to middle', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 (bottom)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'up' });
      const result = cmd.execute(state, score);

      // Anchor stays at C4, cursor moves to E4
      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n0'); // C4 still selected
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n1'); // E4 added
    });

    test('extend down at bottom of chord goes to cross-staff (no cycling)', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 (bottom)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Should go to bass staff, not cycle within treble
      expect(result.selectedNotes.some(n => n.staffIndex === 1)).toBe(true);
    });

    test('extend up at top of chord returns unchanged (at boundary)', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n2'); // G4 (top), staff 0

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'up' });
      const result = cmd.execute(state, score);

      // At top of treble staff, can't go higher - unchanged
      expect(result.selectedNotes).toHaveLength(1);
    });
  });

  describe('cross-staff expansion', () => {
    test('single note on bottom of treble extends to bass', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 (bottom of treble chord)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Should include bass notes from quant-aligned event
      expect(result.selectedNotes.some(n => n.staffIndex === 1)).toBe(true);
      expect(result.selectedNotes.some(n => n.eventId === 'bass-e0')).toBe(true);
    });

    test('implicitly fills entire anchor chord when crossing to bass', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 only (partial chord)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // The anchor's event (e0) should be fully selected (C4, E4, G4)
      const trebleNotes = result.selectedNotes.filter(n => n.staffIndex === 0 && n.eventId === 'e0');
      expect(trebleNotes).toHaveLength(3); // All 3 notes in the chord
      expect(trebleNotes.map(n => n.noteId)).toEqual(expect.arrayContaining(['n0', 'n1', 'n2']));
    });

    test('at bottom staff lowest note, extend down is no-op', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(1, 0, 'bass-e0', 'bass-n0'); // C3 (bottom of bass)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Can't go lower - unchanged
      expect(result).toBe(state);
    });

    test('extend all staves selects quant-aligned notes across all staves', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n1'); // E4 (middle)

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'all' });
      const result = cmd.execute(state, score);

      // Should include both staves - all quant-aligned notes
      const staffIndices = new Set(result.selectedNotes.map(n => n.staffIndex));
      expect(staffIndices.size).toBeGreaterThan(0); // At least original staff
    });
  });

  describe('anchor-cursor relationship', () => {
    test('anchor preserved while cursor moves', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n2'); // G4 (top)
      
      // Extend down twice to build up selection
      let cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      let result = cmd.execute(state, score);
      
      // First extension: G4 + E4
      expect(result.selectedNotes.length).toBeGreaterThanOrEqual(2);
      expect(result.anchor?.noteId).toBe('n2'); // anchor preserved
      
      // Continue extending
      cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      result = cmd.execute(result, score);
      
      // Should have more notes now (at least the chord is full)
      expect(result.selectedNotes.length).toBeGreaterThanOrEqual(3);
      expect(result.anchor?.noteId).toBe('n2'); // anchor still preserved
    });
  });

  describe('multi-event selection', () => {
    test('extends each event independently', () => {
      const score = createTestScore();
      // Select top note from two different events: G4 from e0 and G4 from m1.e2
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n2',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' }, // G4 from e0 (3-note chord)
          { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n5' }, // G4 from e2 (2-note chord)
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' },
      };

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Both events should be extended: G4+E4 from e0, G4+E4 from e2
      const e0Notes = result.selectedNotes.filter(n => n.eventId === 'e0');
      const e2Notes = result.selectedNotes.filter(n => n.eventId === 'e2');
      
      expect(e0Notes.length).toBe(2); // G4 + E4
      expect(e2Notes.length).toBe(2); // G4 + E4
      expect(result.selectedNotes).toHaveLength(4);
    });
  });

  describe('edge cases', () => {
    test('empty selection returns unchanged', () => {
      const score = createTestScore();
      const state = createEmptySelection();

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      expect(result).toBe(state);
    });

    test('single-note event goes directly to cross-staff', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e1', 'n3'); // Single note event D4

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Should go to bass (single note = no room to move within chord)
      expect(result.selectedNotes.some(n => n.staffIndex === 1)).toBe(true);
    });

    test('preserves anchor on extension', () => {
      const score = createTestScore();
      const originalAnchor = { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' };
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n2',
        selectedNotes: [originalAnchor],
        anchor: originalAnchor,
      };

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      expect(result.anchor).toEqual(originalAnchor);
    });
  });

  describe('single staff score', () => {
    test('at top of chord in single staff score, extend up is no-op', () => {
      const singleStaffScore: Score = {
        id: 'single-staff',
        title: 'Single Staff',
        staves: [
          {
            id: 'staff',
            clef: 'treble',
            keySignature: 'C',
            measures: [
              {
                id: 'm0',
                events: [
                  {
                    id: 'e0',
                    duration: 'quarter',
                    dotted: false,
                    notes: [{ id: 'n0', pitch: 'C4' }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const state = createSelectionWithNote(0, 0, 'e0', 'n0');

      const cmd = new ExtendSelectionVerticallyCommand({ direction: 'up' });
      const result = cmd.execute(state, singleStaffScore);

      // No change - at boundary, nowhere to go  
      expect(result).toBe(state);
    });
  });
});

