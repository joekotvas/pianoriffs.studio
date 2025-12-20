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

// ============================================================================
// TEST FIXTURES
// ============================================================================

/**
 * Standard test score with known structure:
 * Staff 0 (Treble): Measure 0 (3 notes in 2 events), Measure 1 (1 note)
 * Staff 1 (Bass): Measure 0 (1 note), Measure 1 (1 note)
 * Total: 6 notes
 */
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

/**
 * Score with rests to test rest handling
 * Staff 0: Measure 0 (1 note + 1 rest)
 */
function createScoreWithRests(): Score {
  return {
    title: 'Rest Score',
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
                id: 'event-note',
                notes: [{ id: 'note-1', pitch: 'C4', duration: 'quarter' }],
                duration: 'quarter',
                quant: 0,
                isRest: false,
              },
              {
                id: 'event-rest',
                notes: [],
                duration: 'quarter',
                quant: 24,
                isRest: true,
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Single staff score for testing without cross-staff complexity
 */
function createSingleStaffScore(): Score {
  return {
    title: 'Single Staff',
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
                notes: [{ id: 'note-1', pitch: 'C4', duration: 'quarter' }],
                duration: 'quarter',
                quant: 0,
                isRest: false,
              },
            ],
          },
          {
            id: 'measure-0-1',
            events: [
              {
                id: 'event-0-1-0',
                notes: [{ id: 'note-2', pitch: 'D4', duration: 'quarter' }],
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

// ============================================================================
// TESTS
// ============================================================================

describe('SelectAllCommand', () => {
  const score = createTestScore();

  // --------------------------------------------------------------------------
  // EXPLICIT SCOPE SELECTION
  // --------------------------------------------------------------------------

  describe('explicit scope selection', () => {
    describe('scope: score', () => {
      it('should select all notes in the entire score', () => {
        const selection = createDefaultSelection();
        const command = new SelectAllCommand({ scope: 'score' });
        const result = command.execute(selection, score);

        expect(result.selectedNotes.length).toBe(6);
      });
    });

    describe('scope: staff', () => {
      it('should select all notes on staff 0 (treble)', () => {
        const selection = createDefaultSelection();
        const command = new SelectAllCommand({ scope: 'staff', staffIndex: 0 });
        const result = command.execute(selection, score);

        expect(result.selectedNotes.length).toBe(4);
        expect(result.selectedNotes.every(n => n.staffIndex === 0)).toBe(true);
      });

      it('should select all notes on staff 1 (bass)', () => {
        const selection = createDefaultSelection();
        const command = new SelectAllCommand({ scope: 'staff', staffIndex: 1 });
        const result = command.execute(selection, score);

        expect(result.selectedNotes.length).toBe(2);
        expect(result.selectedNotes.every(n => n.staffIndex === 1)).toBe(true);
      });
    });

    describe('scope: measure', () => {
      it('should select all notes in a specific measure', () => {
        const selection: Selection = {
          ...createDefaultSelection(),
          staffIndex: 0,
          measureIndex: 0,
        };
        const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
        const result = command.execute(selection, score);

        expect(result.selectedNotes.length).toBe(3);
        expect(result.selectedNotes.every(n => n.measureIndex === 0)).toBe(true);
      });

      it('should select from bass staff measure', () => {
        const selection = createDefaultSelection();
        const command = new SelectAllCommand({ scope: 'measure', staffIndex: 1, measureIndex: 1 });
        const result = command.execute(selection, score);

        expect(result.selectedNotes.length).toBe(1);
        expect(result.selectedNotes[0].staffIndex).toBe(1);
        expect(result.selectedNotes[0].measureIndex).toBe(1);
      });
    });

    describe('scope: event', () => {
      it('should select all notes in the first event (chord)', () => {
        const selection: Selection = {
          ...createDefaultSelection(),
          staffIndex: 0,
          measureIndex: 0,
        };
        const command = new SelectAllCommand({ scope: 'event', staffIndex: 0, measureIndex: 0 });
        const result = command.execute(selection, score);

        // First event has 2 notes (chord)
        expect(result.selectedNotes.length).toBe(2);
        expect(result.selectedNotes.every(n => n.eventId === 'event-0-0-0')).toBe(true);
      });
    });
  });

  // --------------------------------------------------------------------------
  // DEFAULT BEHAVIOR (NO OPTIONS)
  // --------------------------------------------------------------------------

  describe('default behavior', () => {
    it('should select entire score when called with empty options', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({});
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });

    it('should select entire score when called with no options', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand();
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  // --------------------------------------------------------------------------
  // REST HANDLING
  // --------------------------------------------------------------------------

  describe('rest handling', () => {
    it('should include rests in selection', () => {
      const scoreWithRests = createScoreWithRests();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, scoreWithRests);

      // 1 note + 1 rest = 2 selected items
      expect(result.selectedNotes.length).toBe(2);
    });

    it('should select rest with noteId: null', () => {
      const scoreWithRests = createScoreWithRests();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, scoreWithRests);

      const rest = result.selectedNotes.find(n => n.eventId === 'event-rest');
      expect(rest).toBeDefined();
      expect(rest?.noteId).toBeNull();
    });

    it('should include rest in measure selection', () => {
      const scoreWithRests = createScoreWithRests();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, scoreWithRests);

      expect(result.selectedNotes.length).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // PROGRESSIVE EXPANSION - SPECIFICATION SCENARIOS
  // --------------------------------------------------------------------------

  describe('progressive expansion - specification scenarios', () => {
    /**
     * Scenario 1: Multi-Measure Selection (Partial measures)
     */
    it('Scenario 1: should fill partial measures across multiple measures', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(4);
      expect(result.selectedNotes.every(n => n.staffIndex === 0)).toBe(true);
    });

    /**
     * Scenario 2: Mixed Completeness ("Bubble Up" Check)
     */
    it('Scenario 2: should fill partial measure even when other measures are full', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(4);

      const trebleM0Notes = result.selectedNotes.filter(
        n => n.staffIndex === 0 && n.measureIndex === 0
      );
      expect(trebleM0Notes.length).toBe(3);

      const bassM0Notes = result.selectedNotes.filter(
        n => n.staffIndex === 1 && n.measureIndex === 0
      );
      expect(bassM0Notes.length).toBe(1);
    });

    /**
     * Scenario 3: Staff Expansion
     */
    it('Scenario 3: should expand to staves when all touched measures are full', () => {
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

      expect(result.selectedNotes.length).toBe(6);

      const trebleNotes = result.selectedNotes.filter(n => n.staffIndex === 0);
      expect(trebleNotes.length).toBe(4);

      const bassNotes = result.selectedNotes.filter(n => n.staffIndex === 1);
      expect(bassNotes.length).toBe(2);
    });

    /**
     * Scenario 4: Score Expansion
     */
    it('Scenario 4: should stay at score level when all staves are full', () => {
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

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  // --------------------------------------------------------------------------
  // LEGACY TESTS - PROGRESSIVE EXPANSION
  // --------------------------------------------------------------------------

  describe('legacy tests - progressive expansion', () => {
    it('should expand from event to measure when event is fully selected', () => {
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

      expect(result.selectedNotes.length).toBe(3);
    });

    it('should expand from measure to staff when measure is fully selected', () => {
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

      expect(result.selectedNotes.length).toBe(4);
    });

    it('should expand from staff to score when staff is fully selected', () => {
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

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  // --------------------------------------------------------------------------
  // SINGLE STAFF SCORE
  // --------------------------------------------------------------------------

  describe('single staff score', () => {
    it('should work correctly on single staff score', () => {
      const singleStaff = createSingleStaffScore();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, singleStaff);

      expect(result.selectedNotes.length).toBe(2);
    });

    it('should expand from measure to score directly on single staff', () => {
      const singleStaff = createSingleStaffScore();
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, singleStaff);

      // Should expand to staff level (which is same as score for single staff)
      expect(result.selectedNotes.length).toBe(2);
    });
  });

  // --------------------------------------------------------------------------
  // EDGE CASES
  // --------------------------------------------------------------------------

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

    it('should set cursor (eventId, noteId) to first selected note', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      expect(result.eventId).toBe(result.selectedNotes[0].eventId);
      expect(result.noteId).toBe(result.selectedNotes[0].noteId);
    });

    it('should handle invalid staff index gracefully', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'staff', staffIndex: 99 });
      const result = command.execute(selection, score);

      // Should return original state (no notes in invalid staff)
      expect(result).toBe(selection);
    });

    it('should handle invalid measure index gracefully', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 99 });
      const result = command.execute(selection, score);

      expect(result).toBe(selection);
    });

    it('should handle empty measure gracefully', () => {
      const scoreWithEmptyMeasure: Score = {
        ...createTestScore(),
        staves: [
          {
            id: 'staff-0',
            clef: 'treble',
            measures: [{ id: 'empty-measure', events: [] }],
          },
        ],
      };
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, scoreWithEmptyMeasure);

      expect(result).toBe(selection);
    });
  });

  // --------------------------------------------------------------------------
  // SELECTION STATE INTEGRITY
  // --------------------------------------------------------------------------

  describe('selection state integrity', () => {
    it('should maintain staffIndex consistency', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      // First note determines the staffIndex in result
      expect(result.staffIndex).toBe(result.selectedNotes[0].staffIndex);
    });

    it('should maintain measureIndex consistency', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, score);

      expect(result.measureIndex).toBe(0);
    });

    it('should not mutate original selection', () => {
      const selection = createDefaultSelection();
      const originalNotes = [...selection.selectedNotes];
      const command = new SelectAllCommand({ scope: 'score' });
      command.execute(selection, score);

      expect(selection.selectedNotes).toEqual(originalNotes);
    });
  });
});
