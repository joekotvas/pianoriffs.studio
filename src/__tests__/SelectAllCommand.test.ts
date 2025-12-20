/**
 * Tests for SelectAllCommand
 * 
 * Tests the hierarchical expansion logic:
 * Hierarchy: Note → Measure → Staff → Score
 * 
 * Core Principle: Fill lowest incomplete container level first,
 * only expand up when current level is fully selected for all touched items.
 * 
 * @see Issue #99
 */

import { SelectAllCommand } from '../commands/selection/SelectAllCommand';
import type { Selection, Score } from '../types';
import { createDefaultSelection } from '../types';

// Helper: Create test score with known structure
// Staff 0 (Treble): Measure 0 (3 notes), Measure 1 (1 note)
// Staff 1 (Bass): Measure 0 (1 note), Measure 1 (1 note)
function createTestScore(): Score {
  return {
    title: 'Test Score',
    timeSignature: '4/4',
    keySignature: 'C',
    bpm: 120,
    staves: [
      {
        id: 'staff-0',
        clef: 'treble',
        measures: [
          {
            id: 'measure-0-0',
            events: [
              {
                id: 'event-0-0-0',
                notes: [
                  { id: 'note-1', pitch: 'C4', duration: 'quarter' },
                  { id: 'note-2', pitch: 'E4', duration: 'quarter' },
                ],
                duration: 'quarter',
                quant: 0,
                isRest: false,
              },
              {
                id: 'event-0-0-1',
                notes: [{ id: 'note-3', pitch: 'D4', duration: 'quarter' }],
                duration: 'quarter',
                quant: 24,
                isRest: false,
              },
            ],
          },
          {
            id: 'measure-0-1',
            events: [
              {
                id: 'event-0-1-0',
                notes: [{ id: 'note-4', pitch: 'E4', duration: 'half' }],
                duration: 'half',
                quant: 0,
                isRest: false,
              },
            ],
          },
        ],
      },
      {
        id: 'staff-1',
        clef: 'bass',
        measures: [
          {
            id: 'measure-1-0',
            events: [
              {
                id: 'event-1-0-0',
                notes: [{ id: 'note-5', pitch: 'C3', duration: 'quarter' }],
                duration: 'quarter',
                quant: 0,
                isRest: false,
              },
            ],
          },
          {
            id: 'measure-1-1',
            events: [
              {
                id: 'event-1-1-0',
                notes: [{ id: 'note-6', pitch: 'D3', duration: 'quarter' }],
                duration: 'quarter',
                quant: 0,
                isRest: false,
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('SelectAllCommand', () => {
  const score = createTestScore();

  describe('explicit scope selection', () => {
    it('should select all notes in the score', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      // Should have all 6 notes across both staves
      expect(result.selectedNotes.length).toBe(6);
    });

    it('should select all notes on a staff', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
      };
      const command = new SelectAllCommand({ scope: 'staff', staffIndex: 0 });
      const result = command.execute(selection, score);

      // Staff 0 has 4 notes (2 in chord + 1 + 1)
      expect(result.selectedNotes.length).toBe(4);
      expect(result.selectedNotes.every(n => n.staffIndex === 0)).toBe(true);
    });

    it('should select all notes in a measure', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
      };
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, score);

      // Measure 0 on staff 0 has 3 notes
      expect(result.selectedNotes.length).toBe(3);
      expect(result.selectedNotes.every(n => n.measureIndex === 0)).toBe(true);
    });
  });

  describe('progressive expansion - specification scenarios', () => {
    /**
     * Scenario 1: Multi-Measure Selection (Partial measures)
     * Current State: Measure 0 has 1/3 notes selected, Measure 1 has all notes selected
     * Action: Select All
     * Result: All notes in both measures selected (measure level)
     */
    it('Scenario 1: should fill partial measures across multiple measures', () => {
      // 1 note from measure 0 (partial), all notes from measure 1 (full)
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' }, // Partial M0
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' }, // Full M1
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should fill measure 0 completely (3 notes) + measure 1 (1 note) = 4 notes total
      expect(result.selectedNotes.length).toBe(4);
      // All should be on staff 0
      expect(result.selectedNotes.every(n => n.staffIndex === 0)).toBe(true);
    });

    /**
     * Scenario 2: Mixed Completeness ("Bubble Up" Check)
     * Current State: Measure 0 (Treble) has 1 note selected.
     *                Measure 0 (Bass) has all notes selected.
     * Action: Select All
     * Result: Measure 0 (Treble) becomes fully selected.
     *         Measure 0 (Bass) remains fully selected.
     *         (Scope remains at Measure level because Treble M0 was partial)
     */
    it('Scenario 2: should fill partial measure even when other measures are full', () => {
      // 1 note from treble M0 (partial), all notes from bass M0 (full)
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' }, // Partial
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' }, // Full (only note)
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should fill treble M0 (3 notes) + bass M0 (1 note) = 4 notes
      expect(result.selectedNotes.length).toBe(4);
      
      // Verify treble M0 is now complete (3 notes)
      const trebleM0Notes = result.selectedNotes.filter(
        n => n.staffIndex === 0 && n.measureIndex === 0
      );
      expect(trebleM0Notes.length).toBe(3);
      
      // Verify bass M0 is complete (1 note)
      const bassM0Notes = result.selectedNotes.filter(
        n => n.staffIndex === 1 && n.measureIndex === 0
      );
      expect(bassM0Notes.length).toBe(1);
    });

    /**
     * Scenario 3: Staff Expansion
     * Current State: All notes in Measure 0 (Treble) selected.
     *                All notes in Measure 0 (Bass) selected.
     * Action: Select All
     * Result: All notes in Treble Staff selected.
     *         All notes in Bass Staff selected.
     *         (Measures were full, so expand to staff level)
     */
    it('Scenario 3: should expand to staves when all touched measures are full', () => {
      // All notes in treble M0 (3) + all notes in bass M0 (1)
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should expand to both staves: treble (4) + bass (2) = 6 notes
      expect(result.selectedNotes.length).toBe(6);
      
      // Verify all treble notes (4)
      const trebleNotes = result.selectedNotes.filter(n => n.staffIndex === 0);
      expect(trebleNotes.length).toBe(4);
      
      // Verify all bass notes (2)
      const bassNotes = result.selectedNotes.filter(n => n.staffIndex === 1);
      expect(bassNotes.length).toBe(2);
    });

    /**
     * Scenario 4: Score Expansion
     * Current State: All notes in Treble Staff selected.
     *                All notes in Bass Staff selected.
     * Action: Select All
     * Result: Already at score level, stays selected.
     */
    it('Scenario 4: should stay at score level when all staves are full', () => {
      // All 6 notes selected
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' },
          { staffIndex: 1, measureIndex: 1, eventId: 'event-1-1-0', noteId: 'note-6' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should remain at 6 notes (score level)
      expect(result.selectedNotes.length).toBe(6);
    });

    /**
     * Condition A: No selection → Select entire Score
     */
    it('should select entire score when no notes are selected', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        selectedNotes: [],
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should select all 6 notes
      expect(result.selectedNotes.length).toBe(6);
    });
  });

  describe('legacy tests - progressive expansion', () => {
    it('should expand from event to measure when event is fully selected', () => {
      // Pre-select all notes in first event (2 notes in chord)
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should expand to measure level (3 notes) since M0 is partial
      expect(result.selectedNotes.length).toBe(3);
    });

    it('should expand from measure to staff when measure is fully selected', () => {
      // Pre-select all notes in first measure (3 notes)
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should expand to staff level (4 notes on staff 0)
      expect(result.selectedNotes.length).toBe(4);
    });

    it('should expand from staff to score when staff is fully selected', () => {
      // Pre-select all notes on staff 0 (4 notes)
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      // Should expand to score level (6 notes)
      expect(result.selectedNotes.length).toBe(6);
    });
  });

  describe('edge cases', () => {
    it('should return current state if no notes exist in scope', () => {
      const emptyScore: Score = {
        ...createTestScore(),
        staves: [],
      };
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, emptyScore);

      expect(result).toBe(selection);
    });

    it('should set anchor to first selected note', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      expect(result.anchor).toEqual(result.selectedNotes[0]);
    });
  });
});
