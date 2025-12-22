/**
 * SelectionEngine Tests
 *
 * Tests for the SelectionEngine class.
 * Covers: constructor, getState, setState, dispatch, subscribe, setScoreGetter.
 *
 * @see SelectionEngine.ts
 */

import { SelectionEngine } from '../engines/SelectionEngine';
import { SelectEventCommand } from '../commands/selection/SelectEventCommand';
import { createDefaultSelection, Selection } from '../types';
import { createTestScore, createEmptyScore } from './helpers/selectionTestHelpers';

describe('SelectionEngine', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    const testScore = createTestScore();
    engine = new SelectionEngine(undefined, () => testScore);
  });

  describe('constructor', () => {
    test('initializes with default selection when no initial state provided', () => {
      const state = engine.getState();
      expect(state).toBeDefined();
      expect(state.staffIndex).toBe(0);
      expect(state.measureIndex).toBeNull();
      expect(state.eventId).toBeNull();
      expect(state.selectedNotes).toEqual([]);
    });

    test('initializes with provided selection', () => {
      const testScore = createTestScore();
      const initial: Selection = {
        staffIndex: 1,
        measureIndex: 0,
        eventId: 'test',
        noteId: 'note-test',
        selectedNotes: [],
        anchor: null,
      };
      engine = new SelectionEngine(initial, () => testScore);

      expect(engine.getState()).toBe(initial);
      expect(engine.getState().staffIndex).toBe(1);
    });

    test('uses empty score getter when none provided', () => {
      engine = new SelectionEngine();
      // Should not throw
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0 }));
    });
  });

  describe('getState', () => {
    test('returns current selection synchronously', () => {
      const testScore = createTestScore();
      const initial = createDefaultSelection();
      engine = new SelectionEngine(initial, () => testScore);

      expect(engine.getState()).toBe(initial);
    });

    test('returns updated state after dispatch', () => {
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 1 }));
      expect(engine.getState().eventId).toBe('event-2');
    });
  });

  describe('setState', () => {
    test('updates state directly', () => {
      const newState: Selection = {
        staffIndex: 0,
        measureIndex: 1,
        eventId: 'event-3',
        noteId: 'note-3',
        selectedNotes: [{ staffIndex: 0, measureIndex: 1, eventId: 'event-3', noteId: 'note-3' }],
        anchor: null,
      };

      engine.setState(newState);

      expect(engine.getState()).toEqual(newState);
    });

    test('notifies all listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      engine.subscribe(listener1);
      engine.subscribe(listener2);

      const newState = createDefaultSelection();
      engine.setState(newState);

      expect(listener1).toHaveBeenCalledWith(newState);
      expect(listener2).toHaveBeenCalledWith(newState);
    });
  });

  describe('dispatch', () => {
    test('updates state synchronously', () => {
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 1 }));

      const state = engine.getState();
      expect(state.measureIndex).toBe(0);
      expect(state.eventId).toBe('event-2');
      expect(state.noteId).toBe('note-2');
    });

    test('notifies listeners after dispatch', () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 0 }));

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(engine.getState());
    });
  });

  describe('subscribe', () => {
    test('adds listener that receives updates', () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      engine.setState(createDefaultSelection());

      expect(listener).toHaveBeenCalled();
    });

    test('returns unsubscribe function', () => {
      const listener = jest.fn();
      const unsubscribe = engine.subscribe(listener);

      unsubscribe();
      engine.setState(createDefaultSelection());

      expect(listener).not.toHaveBeenCalled();
    });

    test('supports multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      engine.subscribe(listener1);
      engine.subscribe(listener2);
      engine.subscribe(listener3);

      engine.setState(createDefaultSelection());

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
    });

    test('unsubscribe only removes specific listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      engine.subscribe(listener1);
      const unsub2 = engine.subscribe(listener2);

      unsub2();
      engine.setState(createDefaultSelection());

      expect(listener1).toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('setScoreGetter', () => {
    test('updates the score reference for commands', () => {
      engine = new SelectionEngine(undefined, createEmptyScore);

      // With empty score, command fails
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0 }));
      expect(engine.getState().eventId).toBeNull();

      // Update score getter
      engine.setScoreGetter(createTestScore);

      // Now command succeeds
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0 }));
      expect(engine.getState().eventId).toBe('event-1');
    });
  });
});
