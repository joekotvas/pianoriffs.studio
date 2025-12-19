/**
 * NavigateCommand Tests
 *
 * Tests for the NavigateCommand selection command.
 * Covers: horizontal navigation, vertical chord cycling, edge cases.
 *
 * @see NavigateCommand.ts
 */

import { SelectionEngine } from '../engines/SelectionEngine';
import { NavigateCommand } from '../commands/selection/NavigateCommand';
import {
  createTestScore,
  createEmptyScore,
} from './helpers/selectionTestHelpers';

describe('NavigateCommand', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    const testScore = createTestScore();
    engine = new SelectionEngine(
      {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-1',
        noteId: 'note-1a',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1a' }],
        anchor: null,
      },
      () => testScore
    );
  });

  describe('horizontal navigation', () => {
    test('moves right within measure', () => {
      engine.dispatch(new NavigateCommand('right'));

      const state = engine.getState();
      expect(state.measureIndex).toBe(0);
      expect(state.eventId).toBe('event-2');
    });

    test('moves left within measure', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-2',
        noteId: 'note-2',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-2', noteId: 'note-2' }],
        anchor: null,
      });

      engine.dispatch(new NavigateCommand('left'));

      expect(engine.getState().eventId).toBe('event-1');
    });

    test('moves to next measure when at end', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-2',
        noteId: 'note-2',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-2', noteId: 'note-2' }],
        anchor: null,
      });

      engine.dispatch(new NavigateCommand('right'));

      const state = engine.getState();
      expect(state.measureIndex).toBe(1);
      expect(state.eventId).toBe('event-3');
    });

    test('moves to previous measure when at start', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: 1,
        eventId: 'event-3',
        noteId: 'note-3',
        selectedNotes: [{ staffIndex: 0, measureIndex: 1, eventId: 'event-3', noteId: 'note-3' }],
        anchor: null,
      });

      engine.dispatch(new NavigateCommand('left'));

      const state = engine.getState();
      expect(state.measureIndex).toBe(0);
      expect(state.eventId).toBe('event-2');
    });

    test('clears anchor on navigation', () => {
      engine.setState({
        ...engine.getState(),
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1a' },
      });

      engine.dispatch(new NavigateCommand('right'));

      expect(engine.getState().anchor).toBeNull();
    });
  });

  describe('vertical navigation - chord cycling', () => {
    test('moves down cycles through chord notes', () => {
      engine.dispatch(new NavigateCommand('down'));

      const state = engine.getState();
      expect(state.eventId).toBe('event-1');
      expect(state.noteId).toBe('note-1b');
    });

    test('moves up cycles through chord notes', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-1',
        noteId: 'note-1b',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1b' }],
        anchor: null,
      });

      engine.dispatch(new NavigateCommand('up'));

      expect(engine.getState().noteId).toBe('note-1a');
    });

    test('down wraps from last note to first', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-1',
        noteId: 'note-1b',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1b' }],
        anchor: null,
      });

      engine.dispatch(new NavigateCommand('down'));

      expect(engine.getState().noteId).toBe('note-1a');
    });

    test('up wraps from first note to last', () => {
      engine.dispatch(new NavigateCommand('up'));

      expect(engine.getState().noteId).toBe('note-1b');
    });
  });

  describe('edge cases', () => {
    test('no change on single-note event for vertical navigation', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-2',
        noteId: 'note-2',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-2', noteId: 'note-2' }],
        anchor: null,
      });

      const stateBefore = engine.getState();
      engine.dispatch(new NavigateCommand('down'));

      expect(engine.getState().noteId).toBe(stateBefore.noteId);
    });

    test('no change when staff is invalid', () => {
      const emptyScore = createEmptyScore();
      engine = new SelectionEngine(engine.getState(), () => emptyScore);

      const stateBefore = engine.getState();
      engine.dispatch(new NavigateCommand('right'));

      expect(engine.getState()).toBe(stateBefore);
    });

    test('no change when measureIndex is null', () => {
      engine.setState({
        staffIndex: 0,
        measureIndex: null,
        eventId: null,
        noteId: null,
        selectedNotes: [],
        anchor: null,
      });

      const stateBefore = engine.getState();
      engine.dispatch(new NavigateCommand('up'));

      expect(engine.getState()).toBe(stateBefore);
    });

    test('updates selectedNotes on navigation', () => {
      engine.dispatch(new NavigateCommand('right'));

      const state = engine.getState();
      expect(state.selectedNotes).toHaveLength(1);
      expect(state.selectedNotes[0].eventId).toBe('event-2');
    });
  });
});
