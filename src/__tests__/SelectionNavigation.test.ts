/**
 * Selection Navigation Tests
 *
 * Comprehensive tests for selection state transitions based on documented behavior
 * from INTERACTION.md and KEYBOARD_NAVIGATION.md.
 *
 * Tests the following patterns from the documentation:
 * - Horizontal navigation: ghost cursor ↔ selected note
 * - Vertical navigation: chord cycling, cross-staff
 * - Range selection (Shift+click)
 * - Toggle selection (Cmd+click)
 *
 * @see docs/INTERACTION.md
 * @see docs/KEYBOARD_NAVIGATION.md
 */

import { SelectionEngine } from '../engines/SelectionEngine';
import {
  NavigateCommand,
  SelectEventCommand,
  ToggleNoteCommand,
  RangeSelectCommand,
  SelectAllInEventCommand,
  ClearSelectionCommand,
} from '../commands/selection';
import { createDefaultSelection, Score, SelectedNote } from '../types';

/**
 * Creates a test score with multiple events for navigation testing.
 * - 2 measures
 * - Measure 1: 2 events (1st is 2-note chord, 2nd is single note)
 * - Measure 2: 1 event (single note)
 */
const createNavigationTestScore = (): Score => ({
  title: 'Navigation Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'staff-treble',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm1',
          events: [
            {
              id: 'e1',
              isRest: false,
              duration: 'quarter',
              dotted: false,
              notes: [
                { id: 'n1a', pitch: 'C4', accidental: null, tied: false },
                { id: 'n1b', pitch: 'E4', accidental: null, tied: false },
              ],
            },
            {
              id: 'e2',
              isRest: false,
              duration: 'quarter',
              dotted: false,
              notes: [{ id: 'n2', pitch: 'D4', accidental: null, tied: false }],
            },
          ],
        },
        {
          id: 'm2',
          events: [
            {
              id: 'e3',
              isRest: false,
              duration: 'half',
              dotted: false,
              notes: [{ id: 'n3', pitch: 'E4', accidental: null, tied: false }],
            },
          ],
        },
      ],
    },
  ],
});

describe('Selection Navigation - Horizontal', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    engine = new SelectionEngine(createDefaultSelection(), createNavigationTestScore);
  });

  describe('Right Arrow Behavior (per KEYBOARD_NAVIGATION.md)', () => {
    test('from middle note → select next event', () => {
      // Start at first event
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 0 }));
      expect(engine.getState().eventId).toBe('e1');

      // Move right
      engine.dispatch(new NavigateCommand('right'));

      // Should be at second event
      expect(engine.getState().eventId).toBe('e2');
      expect(engine.getState().noteId).toBe('n2');
    });

    test('from last note in measure → first note of next measure', () => {
      // Start at last event of measure 1
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 1 }));
      expect(engine.getState().eventId).toBe('e2');

      // Move right
      engine.dispatch(new NavigateCommand('right'));

      // Should be at first event of measure 2
      expect(engine.getState().measureIndex).toBe(1);
      expect(engine.getState().eventId).toBe('e3');
    });
  });

  describe('Left Arrow Behavior (per KEYBOARD_NAVIGATION.md)', () => {
    test('from middle note → select previous event', () => {
      // Start at second event
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 1 }));
      expect(engine.getState().eventId).toBe('e2');

      // Move left
      engine.dispatch(new NavigateCommand('left'));

      // Should be at first event
      expect(engine.getState().eventId).toBe('e1');
    });

    test('from first note in measure → last note of previous measure', () => {
      // Start at first event of measure 2
      engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 1, eventIndex: 0 }));
      expect(engine.getState().eventId).toBe('e3');

      // Move left
      engine.dispatch(new NavigateCommand('left'));

      // Should be at last event of measure 1
      expect(engine.getState().measureIndex).toBe(0);
      expect(engine.getState().eventId).toBe('e2');
    });
  });
});

describe('Selection Navigation - Vertical (Chord Cycling)', () => {
  // NOTE: Vertical navigation is deferred to Phase 7
  // These tests document expected behavior for when it's implemented
  
  test.skip('CMD+Up within chord → select higher note', () => {
    // Will be implemented in Phase 7
  });

  test.skip('CMD+Down within chord → select lower note', () => {
    // Will be implemented in Phase 7
  });

  test.skip('at chord boundary → cross-staff navigation', () => {
    // Will be implemented in Phase 7
  });
});

describe('Selection Navigation - Cross-Staff', () => {
  // NOTE: Cross-staff navigation is deferred to Phase 7
  // These tests document expected behavior for when it's implemented

  test.skip('vertical nav to other staff with event at same quant → select that event', () => {
    // Will be implemented in Phase 7
  });

  test.skip('vertical nav to other staff without event → ghost cursor', () => {
    // Will be implemented in Phase 7
  });
});

describe('Selection - Toggle (Cmd+Click)', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    engine = new SelectionEngine(createDefaultSelection(), createNavigationTestScore);
  });

  test('toggle adds note to selection when not selected', () => {
    // Select first note
    engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 0, noteIndex: 0 }));
    expect(engine.getState().selectedNotes).toHaveLength(1);

    // Toggle second event
    engine.dispatch(new ToggleNoteCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e2',
      noteId: 'n2',
    }));

    // Should have both notes selected
    expect(engine.getState().selectedNotes).toHaveLength(2);
    expect(engine.getState().selectedNotes.map(n => n.noteId)).toContain('n1a');
    expect(engine.getState().selectedNotes.map(n => n.noteId)).toContain('n2');
  });

  test('toggle removes note from selection when already selected', () => {
    // Setup: two notes selected
    engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 0, noteIndex: 0 }));
    engine.dispatch(new ToggleNoteCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e2',
      noteId: 'n2',
    }));
    expect(engine.getState().selectedNotes).toHaveLength(2);

    // Toggle first note (remove it)
    engine.dispatch(new ToggleNoteCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
      noteId: 'n1a',
    }));

    // Should only have second note
    expect(engine.getState().selectedNotes).toHaveLength(1);
    expect(engine.getState().selectedNotes[0].noteId).toBe('n2');
  });

  test('toggle last note clears selection', () => {
    // Select one note
    engine.dispatch(new SelectEventCommand({ staffIndex: 0, measureIndex: 0, eventIndex: 0, noteIndex: 0 }));
    expect(engine.getState().selectedNotes).toHaveLength(1);

    // Toggle it off
    engine.dispatch(new ToggleNoteCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
      noteId: 'n1a',
    }));

    // Selection should be cleared
    expect(engine.getState().selectedNotes).toHaveLength(0);
    expect(engine.getState().eventId).toBeNull();
  });

  test('toggle infers current selection from cursor when selectedNotes is empty', () => {
    // Simulate "add note" state: cursor positioned but selectedNotes empty
    engine.setState({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
      noteId: 'n1a',
      selectedNotes: [], // Empty!
      anchor: null,
    });

    // Toggle second note - should infer n1a is selected
    engine.dispatch(new ToggleNoteCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e2',
      noteId: 'n2',
    }));

    // Should have both notes
    expect(engine.getState().selectedNotes).toHaveLength(2);
    expect(engine.getState().selectedNotes.map(n => n.noteId)).toContain('n1a');
    expect(engine.getState().selectedNotes.map(n => n.noteId)).toContain('n2');
  });
});

describe('Selection - Range (Shift+Click)', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    engine = new SelectionEngine(createDefaultSelection(), createNavigationTestScore);
  });

  test('range select with anchor and focus', () => {
    const anchor: SelectedNote = {
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
      noteId: 'n1a',
    };

    const focus: SelectedNote = {
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e2',
      noteId: 'n2',
    };

    engine.dispatch(new RangeSelectCommand({ anchor, focus }));

    const state = engine.getState();
    expect(state.anchor).toEqual(anchor);
    expect(state.noteId).toBe('n2'); // Cursor at focus
  });
});

describe('Selection - Select All In Event', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    engine = new SelectionEngine(createDefaultSelection(), createNavigationTestScore);
  });

  test('selects all notes in a chord event', () => {
    engine.dispatch(new SelectAllInEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
    }));

    const state = engine.getState();
    expect(state.selectedNotes).toHaveLength(2);
    expect(state.selectedNotes.map(n => n.noteId)).toContain('n1a');
    expect(state.selectedNotes.map(n => n.noteId)).toContain('n1b');
  });

  test('addToSelection adds without removing existing', () => {
    // First select note in e2
    engine.dispatch(new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventIndex: 1,
    }));
    expect(engine.getState().selectedNotes).toHaveLength(1);

    // Add all notes in e1
    engine.dispatch(new SelectAllInEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
      addToSelection: true,
    }));

    // Should have 3 notes total
    expect(engine.getState().selectedNotes).toHaveLength(3);
  });
});

describe('Selection - Clear', () => {
  let engine: SelectionEngine;

  beforeEach(() => {
    engine = new SelectionEngine(createDefaultSelection(), createNavigationTestScore);
  });

  test('clears selection and preserves staff index', () => {
    // Setup: select something in staff 0
    engine.dispatch(new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 0,
      eventIndex: 0,
    }));
    expect(engine.getState().eventId).toBe('e1');

    // Clear
    engine.dispatch(new ClearSelectionCommand());

    const state = engine.getState();
    expect(state.eventId).toBeNull();
    expect(state.measureIndex).toBeNull();
    expect(state.selectedNotes).toHaveLength(0);
    expect(state.staffIndex).toBe(0); // Preserved!
  });
});
