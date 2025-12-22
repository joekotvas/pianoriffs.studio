/**
 * Tests for SelectMeasureCommand
 * @see Issue #99
 */

import { SelectMeasureCommand } from '../commands/selection/SelectMeasureCommand';
import type { Selection, Score } from '../types';
import { createDefaultSelection } from '../types';

// Helper: Create test score
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
        keySignature: 'C',
        measures: [
          {
            id: 'measure-0-0',
            events: [
              {
                id: 'event-0-0-0',
                notes: [
                  { id: 'note-1', pitch: 'C4' },
                  { id: 'note-2', pitch: 'E4' },
                ],
                duration: 'quarter',
                dotted: false,
                isRest: false,
              },
              {
                id: 'event-0-0-1',
                notes: [{ id: 'note-3', pitch: 'D4' }],
                duration: 'quarter',

                dotted: false,
                isRest: false,
              },
            ],
          },
          {
            id: 'measure-0-1',
            events: [
              {
                id: 'event-0-1-0',
                notes: [{ id: 'note-4', pitch: 'E4' }],
                duration: 'half',
                dotted: false,
                isRest: false,
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('SelectMeasureCommand', () => {
  const score = createTestScore();

  it('should select all notes in a measure', () => {
    const selection = createDefaultSelection();
    const command = new SelectMeasureCommand({ staffIndex: 0, measureIndex: 0 });
    const result = command.execute(selection, score);

    // Measure 0 has 3 notes (2 in chord + 1)
    expect(result.selectedNotes.length).toBe(3);
    expect(result.measureIndex).toBe(0);
    expect(result.staffIndex).toBe(0);
  });

  it('should set cursor to first note in measure', () => {
    const selection = createDefaultSelection();
    const command = new SelectMeasureCommand({ staffIndex: 0, measureIndex: 0 });
    const result = command.execute(selection, score);

    expect(result.eventId).toBe('event-0-0-0');
    expect(result.noteId).toBe('note-1');
  });

  it('should set anchor to first note', () => {
    const selection = createDefaultSelection();
    const command = new SelectMeasureCommand({ staffIndex: 0, measureIndex: 0 });
    const result = command.execute(selection, score);

    expect(result.anchor).toEqual({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'event-0-0-0',
      noteId: 'note-1',
    });
  });

  describe('addToSelection mode', () => {
    it('should merge with existing selection', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 1,
        eventId: 'event-0-1-0',
        noteId: 'note-4',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
        ],
        anchor: { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
      };

      const command = new SelectMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
        addToSelection: true,
      });
      const result = command.execute(selection, score);

      // Should have original + new (1 + 3 = 4)
      expect(result.selectedNotes.length).toBe(4);
    });

    it('should preserve anchor when adding', () => {
      const originalAnchor = { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' };
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 1,
        eventId: 'event-0-1-0',
        noteId: 'note-4',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
        ],
        anchor: originalAnchor,
      };

      const command = new SelectMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
        addToSelection: true,
      });
      const result = command.execute(selection, score);

      expect(result.anchor).toEqual(originalAnchor);
    });

    it('should not duplicate notes when adding same measure', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
        ],
        anchor: null,
      };

      const command = new SelectMeasureCommand({
        staffIndex: 0,
        measureIndex: 0,
        addToSelection: true,
      });
      const result = command.execute(selection, score);

      // Should not duplicate: 3 total (not 4)
      expect(result.selectedNotes.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should return current state for invalid staff', () => {
      const selection = createDefaultSelection();
      const command = new SelectMeasureCommand({ staffIndex: 99, measureIndex: 0 });
      const result = command.execute(selection, score);

      expect(result).toBe(selection);
    });

    it('should return current state for invalid measure', () => {
      const selection = createDefaultSelection();
      const command = new SelectMeasureCommand({ staffIndex: 0, measureIndex: 99 });
      const result = command.execute(selection, score);

      expect(result).toBe(selection);
    });
  });
});
