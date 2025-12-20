/**
 * Tests for SelectAllCommand
 * @see Issue #99
 */

import { SelectAllCommand } from '../commands/selection/SelectAllCommand';
import type { Selection, Score } from '../types';
import { createDefaultSelection } from '../types';

// Helper: Create test score with known structure
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

  describe('progressive expansion', () => {
    it('should expand from event to measure when event is fully selected', () => {
      // Pre-select all notes in first event
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

      // Should expand to measure level (3 notes)
      expect(result.selectedNotes.length).toBe(3);
    });

    it('should expand from measure to staff when measure is fully selected', () => {
      // Pre-select all notes in first measure
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

      // Should expand to staff level (4 notes)
      expect(result.selectedNotes.length).toBe(4);
    });

    it('should expand from staff to score when staff is fully selected', () => {
      // Pre-select all notes on staff 0
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

    it('should stay at score level when entire score is already selected', () => {
      // Pre-select all notes in score
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

      // Should stay at score level (6 notes)
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
