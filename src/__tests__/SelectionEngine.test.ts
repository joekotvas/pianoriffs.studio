/**
 * SelectionEngine Tests
 *
 * Unit tests for the SelectionEngine and selection commands.
 */

import { SelectionEngine } from '../engines/SelectionEngine';
import { SelectEventCommand } from '../commands/selection/SelectEventCommand';
import { NavigateCommand } from '../commands/selection/NavigateCommand';
import { createDefaultSelection, Selection, Score } from '../types';

// Helper to create a test score
const createTestScore = (): Score => ({
  staves: [
    {
      clef: 'treble',
      measures: [
        {
          events: [
            {
              id: 'event-1',
              isRest: false,
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'note-1a', pitch: 'C4', accidental: null, tied: false },
                { id: 'note-1b', pitch: 'E4', accidental: null, tied: false },
              ],
            },
            {
              id: 'event-2',
              isRest: false,
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'note-2', pitch: 'D4', accidental: null, tied: false }],
            },
          ],
        },
        {
          events: [
            {
              id: 'event-3',
              isRest: false,
              duration: 'half',
              dotted: false,
              notes: [{ id: 'note-3', pitch: 'E4', accidental: null, tied: false }],
            },
          ],
        },
      ],
    },
  ],
  metadata: { title: 'Test Score' },
});

describe('SelectionEngine', () => {
  let engine: SelectionEngine;
  let testScore: Score;

  beforeEach(() => {
    testScore = createTestScore();
    engine = new SelectionEngine(undefined, () => testScore);
  });

  test('initializes with default selection', () => {
    const state = engine.getState();
    expect(state).toBeDefined();
    expect(state.staffIndex).toBe(0);
    expect(state.selectedNotes).toEqual([]);
  });

  test('getState returns current selection', () => {
    const initial = createDefaultSelection();
    engine = new SelectionEngine(initial, () => testScore);

    expect(engine.getState()).toBe(initial);
  });

  test('setState updates state and notifies', () => {
    const listener = jest.fn();
    engine.subscribe(listener);

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
    expect(listener).toHaveBeenCalledWith(newState);
  });

  test('dispatch updates state synchronously', () => {
    const command = new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventIndex: 1,
    });

    engine.dispatch(command);

    const state = engine.getState();
    expect(state.measureIndex).toBe(0);
    expect(state.eventId).toBe('event-2');
    expect(state.noteId).toBe('note-2');
  });

  test('subscribe notifies on state change', () => {
    const listener = jest.fn();
    engine.subscribe(listener);

    const command = new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventIndex: 0,
    });

    engine.dispatch(command);

    expect(listener).toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith(engine.getState());
  });

  test('unsubscribe removes listener', () => {
    const listener = jest.fn();
    const unsubscribe = engine.subscribe(listener);

    unsubscribe();

    engine.dispatch(
      new SelectEventCommand({
        staffIndex: 0,
        measureIndex: 0,
        eventIndex: 0,
      })
    );

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('SelectEventCommand', () => {
  let testScore: Score;
  let initialState: Selection;

  beforeEach(() => {
    testScore = createTestScore();
    initialState = createDefaultSelection();
  });

  test('selects event by indices', () => {
    const command = new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventIndex: 1,
    });

    const newState = command.execute(initialState, testScore);

    expect(newState.measureIndex).toBe(0);
    expect(newState.eventId).toBe('event-2');
    expect(newState.noteId).toBe('note-2');
    expect(newState.selectedNotes).toHaveLength(1);
  });

  test('selects note within chord', () => {
    const command = new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventIndex: 0,
      noteIndex: 1, // Second note in chord
    });

    const newState = command.execute(initialState, testScore);

    expect(newState.eventId).toBe('event-1');
    expect(newState.noteId).toBe('note-1b'); // Second note
  });

  test('returns unchanged state for invalid staff index', () => {
    const command = new SelectEventCommand({
      staffIndex: 99, // Invalid
      measureIndex: 0,
      eventIndex: 0,
    });

    const newState = command.execute(initialState, testScore);

    expect(newState).toBe(initialState); // Unchanged
  });

  test('returns unchanged state for invalid measure index', () => {
    const command = new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 99, // Invalid
      eventIndex: 0,
    });

    const newState = command.execute(initialState, testScore);

    expect(newState).toBe(initialState); // Unchanged
  });
});

describe('NavigateCommand', () => {
  let testScore: Score;
  let engine: SelectionEngine;

  beforeEach(() => {
    testScore = createTestScore();
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

  test('moves right within measure', () => {
    const command = new NavigateCommand('right');
    engine.dispatch(command);

    const state = engine.getState();
    expect(state.eventId).toBe('event-2');
  });

  test('moves left within measure', () => {
    // Start at event-2
    engine.setState({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'event-2',
      noteId: 'note-2',
      selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-2', noteId: 'note-2' }],
      anchor: null,
    });

    const command = new NavigateCommand('left');
    engine.dispatch(command);

    const state = engine.getState();
    expect(state.eventId).toBe('event-1');
  });

  test('moves down cycles through chord notes', () => {
    const command = new NavigateCommand('down');
    engine.dispatch(command);

    const state = engine.getState();
    expect(state.eventId).toBe('event-1');
    expect(state.noteId).toBe('note-1b'); // Cycled to second note
  });

  test('moves up cycles through chord notes', () => {
    // Start at second note
    engine.setState({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'event-1',
      noteId: 'note-1b',
      selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'event-1', noteId: 'note-1b' }],
      anchor: null,
    });

    const command = new NavigateCommand('up');
    engine.dispatch(command);

    const state = engine.getState();
    expect(state.noteId).toBe('note-1a'); // Cycled to first note
  });
});
