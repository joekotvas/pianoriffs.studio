/**
 * SelectEventCommand Tests
 *
 * Tests for the SelectEventCommand selection command.
 * Covers: happy paths, multi-selection, edge cases.
 *
 * @see SelectEventCommand.ts
 */

import { SelectEventCommand } from '../commands/selection/SelectEventCommand';
import { createDefaultSelection, Selection } from '../types';
import {
  createTestScore,
  createScoreWithEmptyMeasure,
} from './helpers/selectionTestHelpers';

describe('SelectEventCommand', () => {
  let initialState: Selection;

  beforeEach(() => {
    initialState = createDefaultSelection();
  });

  describe('happy paths', () => {
    test('selects first event by default', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState.measureIndex).toBe(0);
      expect(newState.eventId).toBe('event-1');
      expect(newState.noteId).toBe('note-1a');
      expect(newState.selectedNotes).toHaveLength(1);
    });

    test('selects event by index', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 1,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState.eventId).toBe('event-2');
      expect(newState.noteId).toBe('note-2');
    });

    test('selects specific note in chord', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
        noteIndex: 1,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState.eventId).toBe('event-1');
      expect(newState.noteId).toBe('note-1b');
    });

    test('selects event in different measure', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 1,
        eventIndex: 0,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState.measureIndex).toBe(1);
      expect(newState.eventId).toBe('event-3');
    });
  });

  describe('multi-selection', () => {
    test('addToSelection adds to existing selection', () => {
      const testScore = createTestScore();
      const existingState: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-1',
        noteId: 'note-1a',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1a' }],
        anchor: null,
      };

      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 1,
        addToSelection: true,
      });

      const newState = command.execute(existingState, testScore);

      expect(newState.selectedNotes).toHaveLength(2);
      expect(newState.selectedNotes[0].noteId).toBe('note-1a');
      expect(newState.selectedNotes[1].noteId).toBe('note-2');
    });

    test('addToSelection sets anchor if not already set', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
        addToSelection: true,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState.anchor).not.toBeNull();
      expect(newState.anchor?.eventId).toBe('event-1');
    });

    test('addToSelection preserves existing anchor', () => {
      const testScore = createTestScore();
      const existingAnchor = { staffIndex: 0, measureIndex: 0, eventId: 'anchor-event', noteId: 'anchor-note' };
      const existingState: Selection = {
        ...initialState,
        anchor: existingAnchor,
      };

      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
        addToSelection: true,
      });

      const newState = command.execute(existingState, testScore);

      expect(newState.anchor).toBe(existingAnchor);
    });
  });

  describe('edge cases', () => {
    test('returns unchanged state for invalid staff index', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 99,
        measureIndex: 0,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState).toBe(initialState);
    });

    test('returns unchanged state for invalid measure index', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 99,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState).toBe(initialState);
    });

    test('clamps noteIndex to last note in chord', () => {
      const testScore = createTestScore();
      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
        noteIndex: 99,
      });

      const newState = command.execute(initialState, testScore);

      expect(newState.noteId).toBe('note-1b');
    });

    test('handles empty event (no notes)', () => {
      const testScore = createTestScore();
      const scoreWithEmptyEvent = {
        ...testScore,
        staves: [
          {
            ...testScore.staves[0],
            measures: [
              {
                id: 'measure-1',
                events: [
                  { id: 'empty-event', isRest: false, duration: 'quarter', dotted: false, notes: [] },
                ],
              },
            ],
          },
        ],
      };

      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
      });

      const newState = command.execute(initialState, scoreWithEmptyEvent);

      expect(newState.eventId).toBe('empty-event');
      expect(newState.noteId).toBeNull();
      expect(newState.selectedNotes).toHaveLength(1);
      expect(newState.selectedNotes[0].noteId).toBeNull();
    });

    test('handles empty measure (no events)', () => {
      const emptyMeasureScore = createScoreWithEmptyMeasure();

      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
      });

      const newState = command.execute(initialState, emptyMeasureScore);

      expect(newState.eventId).toBeNull();
      expect(newState.selectedNotes).toHaveLength(0);
    });

    test('replaces selection when addToSelection is false', () => {
      const testScore = createTestScore();
      const existingState: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-1',
        noteId: 'note-1a',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1a' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1b' },
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1a' },
      };

      const command = new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 1,
        addToSelection: false,
      });

      const newState = command.execute(existingState, testScore);

      expect(newState.selectedNotes).toHaveLength(1);
      expect(newState.selectedNotes[0].noteId).toBe('note-2');
      expect(newState.anchor).toBeNull();
    });
  });
});
