/**
 * Tests for ExpandSelectionVerticallyCommand and SelectFullEventsCommand
 *
 * @see Issue #101
 */

import { ExpandSelectionVerticallyCommand } from '@/commands/selection/ExpandSelectionVerticallyCommand';
import { SelectFullEventsCommand } from '@/commands/selection/SelectFullEventsCommand';
import type { Selection, Score, SelectedNote } from '@/types';

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

// ========== ExpandSelectionVerticallyCommand TESTS ==========

describe('ExpandSelectionVerticallyCommand', () => {
  describe('chord expansion with cycling', () => {
    test('expand down from top note adds next lower', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n2'); // G4 (top)

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n1'); // E4 added
    });

    test('expand up from bottom note adds next higher', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 (bottom)

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'up' });
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n1'); // E4 added
    });

    test('expand down at bottom of chord cycles to top', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n0'); // C4 (bottom)

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n2'); // G4 (top) added via cycle
    });

    test('expand up at top of chord cycles to bottom', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e0', 'n2'); // G4 (top)

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'up' });
      const result = cmd.execute(state, score);

      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map(n => n.noteId)).toContain('n0'); // C4 (bottom) added via cycle
    });
  });

  describe('cross-staff expansion', () => {
    test('full treble chord expands down to bass', () => {
      const score = createTestScore();
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' },
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      };

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Should now include bass notes from quant-aligned event
      expect(result.selectedNotes.some(n => n.staffIndex === 1)).toBe(true);
      expect(result.selectedNotes.some(n => n.eventId === 'bass-e0')).toBe(true);
    });

    test('at bottom staff, expand down is no-op', () => {
      const score = createTestScore();
      const state: Selection = {
        staffIndex: 1,
        measureIndex: 0,
        eventId: 'bass-e0',
        noteId: 'bass-n0',
        selectedNotes: [
          { staffIndex: 1, measureIndex: 0, eventId: 'bass-e0', noteId: 'bass-n0' },
          { staffIndex: 1, measureIndex: 0, eventId: 'bass-e0', noteId: 'bass-n1' },
        ],
        anchor: { staffIndex: 1, measureIndex: 0, eventId: 'bass-e0', noteId: 'bass-n0' },
      };

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Should be unchanged
      expect(result.selectedNotes).toHaveLength(2);
    });

    test('expand all staves adds both staves', () => {
      const score = createTestScore();
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2' },
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      };

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'all' });
      const result = cmd.execute(state, score);

      // Should include both staves
      const staffIndices = new Set(result.selectedNotes.map(n => n.staffIndex));
      expect(staffIndices.has(0)).toBe(true);
      expect(staffIndices.has(1)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('empty selection returns unchanged', () => {
      const score = createTestScore();
      const state = createEmptySelection();

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      expect(result).toBe(state);
    });

    test('single-note event goes directly to cross-staff', () => {
      const score = createTestScore();
      const state = createSelectionWithNote(0, 0, 'e1', 'n3'); // Single note event

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, score);

      // Should expand to bass (single note is already "full")
      expect(result.selectedNotes.some(n => n.staffIndex === 1)).toBe(true);
    });

    test('preserves anchor on expansion', () => {
      const score = createTestScore();
      const originalAnchor = { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' };
      const state: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0',
        selectedNotes: [originalAnchor],
        anchor: originalAnchor,
      };

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'up' });
      const result = cmd.execute(state, score);

      expect(result.anchor).toEqual(originalAnchor);
    });
  });

  describe('single staff score', () => {
    test('cross-staff expansion is no-op on single staff', () => {
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

      const cmd = new ExpandSelectionVerticallyCommand({ direction: 'down' });
      const result = cmd.execute(state, singleStaffScore);

      // No change since it's a single staff
      expect(result.selectedNotes).toHaveLength(1);
    });
  });
});
