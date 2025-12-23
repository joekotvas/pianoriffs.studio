/**
 * ScoreAPI.navigation.test.tsx
 *
 * Comprehensive tests for API navigation methods.
 * Covers vertical navigation, boundary conditions, and edge cases.
 *
 * High-priority coverage gaps addressed:
 * - move('up'/'down') - cross-staff, chord traversal, cycling
 * - move('left'/'right') - boundary conditions
 * - selectById() - lookup by ID
 */

import { render } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';
import type { Staff, DeepPartial, RiffScoreConfig } from '../types';

// Helper to get typed API
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

// Helper to create staves for a grand staff score with notes for testing
const createGrandStaffStaves = (): Staff[] => [
  {
    id: 'treble-staff',
    clef: 'treble',
    keySignature: 'C',
    measures: [
      {
        id: 'm1-treble',
        events: [
          { id: 'e1-t', duration: 'quarter', dotted: false, notes: [{ id: 'n1-t', pitch: 'E5' }] },
          { id: 'e2-t', duration: 'quarter', dotted: false, notes: [{ id: 'n2-t', pitch: 'F5' }] },
        ],
      },
      {
        id: 'm2-treble',
        events: [
          { id: 'e3-t', duration: 'quarter', dotted: false, notes: [{ id: 'n3-t', pitch: 'G5' }] },
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
        id: 'm1-bass',
        events: [
          { id: 'e1-b', duration: 'quarter', dotted: false, notes: [{ id: 'n1-b', pitch: 'C3' }] },
          { id: 'e2-b', duration: 'quarter', dotted: false, notes: [{ id: 'n2-b', pitch: 'D3' }] },
        ],
      },
      {
        id: 'm2-bass',
        events: [
          { id: 'e3-b', duration: 'quarter', dotted: false, notes: [{ id: 'n3-b', pitch: 'E3' }] },
        ],
      },
    ],
  },
];

// Helper to create a single-staff staves array
const createSingleStaffStaves = (): Staff[] => [
  {
    id: 'treble-staff',
    clef: 'treble',
    keySignature: 'C',
    measures: [
      {
        id: 'm1',
        events: [
          { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
          { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
        ],
      },
    ],
  },
];

// Helper to create a chord staves array
const createChordStaves = (): Staff[] => [
  {
    id: 'treble-staff',
    clef: 'treble',
    keySignature: 'C',
    measures: [
      {
        id: 'm1',
        events: [
          {
            id: 'chord-event',
            duration: 'quarter',
            dotted: false,
            notes: [
              { id: 'chord-n1', pitch: 'C4' }, // Bottom note
              { id: 'chord-n2', pitch: 'E4' }, // Middle note
              { id: 'chord-n3', pitch: 'G4' }, // Top note
            ],
          },
        ],
      },
    ],
  },
];

// Helper to create config from staves
const configWithStaves = (staves: Staff[]): DeepPartial<RiffScoreConfig> => ({
  score: { staves },
});

describe('Navigation - Horizontal Boundaries', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('move("left") at start of score stays at first event', () => {
    render(
      <RiffScore id="nav-left-boundary" config={configWithStaves(createSingleStaffStaves())} />
    );
    const api = getAPI('nav-left-boundary');

    // Select first event
    api.select(1, 0, 0);
    const initialSelection = api.getSelection();
    expect(initialSelection.eventId).toBe('e1');

    // Move left - should stay at first event
    api.move('left');
    const afterMove = api.getSelection();
    expect(afterMove.eventId).toBe('e1');
  });

  test('move("right") at end of measure advances to next measure', () => {
    render(
      <RiffScore id="nav-right-measure" config={configWithStaves(createGrandStaffStaves())} />
    );
    const api = getAPI('nav-right-measure');

    // Select last event in first measure
    api.select(1, 0, 1);
    expect(api.getSelection().eventId).toBe('e2-t');

    // Move right - should go to first event of second measure
    api.move('right');
    const afterMove = api.getSelection();
    expect(afterMove.measureIndex).toBe(1);
    expect(afterMove.eventId).toBe('e3-t');
  });

  test('move("right") at end of score stays at last event', () => {
    render(
      <RiffScore id="nav-right-boundary" config={configWithStaves(createGrandStaffStaves())} />
    );
    const api = getAPI('nav-right-boundary');

    // Select last event in last measure (measure 2, event 0)
    api.select(2, 0, 0);
    expect(api.getSelection().eventId).toBe('e3-t');

    // Move right - should stay at last event
    api.move('right');
    const afterMove = api.getSelection();
    expect(afterMove.eventId).toBe('e3-t');
  });

  test('move returns this for chaining', () => {
    render(<RiffScore id="nav-chain" config={configWithStaves(createSingleStaffStaves())} />);
    const api = getAPI('nav-chain');

    api.select(1, 0, 0);
    const result = api.move('right');
    expect(result).toBe(api);
  });
});

describe('Navigation - Vertical (Cross-Staff)', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('move("down") switches from treble to bass staff', () => {
    render(<RiffScore id="nav-down-staff" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('nav-down-staff');

    // Select first event in treble staff
    api.select(1, 0, 0);
    expect(api.getSelection().staffIndex).toBe(0);
    expect(api.getSelection().eventId).toBe('e1-t');

    // Move down - should switch to bass staff
    api.move('down');
    const afterMove = api.getSelection();
    expect(afterMove.staffIndex).toBe(1);
    expect(afterMove.eventId).toBe('e1-b');
  });

  test('move("up") switches from bass to treble staff', () => {
    render(<RiffScore id="nav-up-staff" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('nav-up-staff');

    // Select first event in bass staff
    api.select(1, 1, 0);
    expect(api.getSelection().staffIndex).toBe(1);
    expect(api.getSelection().eventId).toBe('e1-b');

    // Move up - should switch to treble staff
    api.move('up');
    const afterMove = api.getSelection();
    expect(afterMove.staffIndex).toBe(0);
    expect(afterMove.eventId).toBe('e1-t');
  });

  test('move("down") at bottom staff cycles to top staff', () => {
    render(<RiffScore id="nav-down-cycle" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('nav-down-cycle');

    // Select event in bass staff (bottom)
    api.select(1, 1, 0);
    expect(api.getSelection().staffIndex).toBe(1);

    // Move down - should cycle to treble (top)
    api.move('down');
    const afterMove = api.getSelection();
    expect(afterMove.staffIndex).toBe(0);
  });

  test('move("up") at top staff cycles to bottom staff', () => {
    render(<RiffScore id="nav-up-cycle" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('nav-up-cycle');

    // Select event in treble staff (top)
    api.select(1, 0, 0);
    expect(api.getSelection().staffIndex).toBe(0);

    // Move up - should cycle to bass (bottom)
    api.move('up');
    const afterMove = api.getSelection();
    expect(afterMove.staffIndex).toBe(1);
  });

  test('move("up"/"down") is no-op on single-staff score', () => {
    render(
      <RiffScore id="nav-single-staff" config={configWithStaves(createSingleStaffStaves())} />
    );
    const api = getAPI('nav-single-staff');

    // Select first event
    api.select(1, 0, 0);
    const initialSelection = api.getSelection();

    // Move up - should be no-op
    api.move('up');
    expect(api.getSelection().staffIndex).toBe(initialSelection.staffIndex);
    expect(api.getSelection().eventId).toBe(initialSelection.eventId);

    // Move down - should be no-op
    api.move('down');
    expect(api.getSelection().staffIndex).toBe(initialSelection.staffIndex);
    expect(api.getSelection().eventId).toBe(initialSelection.eventId);
  });
});

describe('Navigation - Vertical (Chord Traversal)', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('move("up") within chord navigates to higher note', () => {
    render(<RiffScore id="nav-chord-up" config={configWithStaves(createChordStaves())} />);
    const api = getAPI('nav-chord-up');

    // Select bottom note of chord (C4)
    api.selectById('chord-event', 'chord-n1');
    expect(api.getSelection().noteId).toBe('chord-n1');

    // Move up - should go to middle note (E4)
    api.move('up');
    expect(api.getSelection().noteId).toBe('chord-n2');

    // Move up again - should go to top note (G4)
    api.move('up');
    expect(api.getSelection().noteId).toBe('chord-n3');
  });

  test('move("down") within chord navigates to lower note', () => {
    render(<RiffScore id="nav-chord-down" config={configWithStaves(createChordStaves())} />);
    const api = getAPI('nav-chord-down');

    // Select top note of chord (G4)
    api.selectById('chord-event', 'chord-n3');
    expect(api.getSelection().noteId).toBe('chord-n3');

    // Move down - should go to middle note (E4)
    api.move('down');
    expect(api.getSelection().noteId).toBe('chord-n2');

    // Move down again - should go to bottom note (C4)
    api.move('down');
    expect(api.getSelection().noteId).toBe('chord-n1');
  });

  test('move("up") at top of chord cycles staff (single staff = no-op)', () => {
    render(<RiffScore id="nav-chord-top" config={configWithStaves(createChordStaves())} />);
    const api = getAPI('nav-chord-top');

    // Select top note of chord
    api.selectById('chord-event', 'chord-n3');

    // Move up at top - single staff, should be no-op
    api.move('up');
    // Still on same chord, same or different note depending on implementation
    expect(api.getSelection().eventId).toBe('chord-event');
  });
});

describe('Navigation - selectById', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('selectById finds event by ID', () => {
    render(<RiffScore id="selectbyid-event" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('selectbyid-event');

    api.selectById('e2-t');
    const selection = api.getSelection();
    expect(selection.eventId).toBe('e2-t');
    expect(selection.measureIndex).toBe(0);
  });

  test('selectById finds event and note by ID', () => {
    render(<RiffScore id="selectbyid-note" config={configWithStaves(createChordStaves())} />);
    const api = getAPI('selectbyid-note');

    api.selectById('chord-event', 'chord-n2');
    const selection = api.getSelection();
    expect(selection.eventId).toBe('chord-event');
    expect(selection.noteId).toBe('chord-n2');
  });

  test('selectById with non-existent ID gracefully handles (no crash)', () => {
    render(
      <RiffScore id="selectbyid-missing" config={configWithStaves(createSingleStaffStaves())} />
    );
    const api = getAPI('selectbyid-missing');

    const initialSelection = api.getSelection();

    // Should not crash
    api.selectById('non-existent-id');

    // Selection should be unchanged
    expect(api.getSelection().eventId).toBe(initialSelection.eventId);
  });

  test('selectById returns this for chaining', () => {
    render(
      <RiffScore id="selectbyid-chain" config={configWithStaves(createSingleStaffStaves())} />
    );
    const api = getAPI('selectbyid-chain');

    const result = api.selectById('e1');
    expect(result).toBe(api);
  });
});

describe('Navigation - jump() Edge Cases', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('jump("start-score") selects first event in first measure', () => {
    render(<RiffScore id="jump-start" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('jump-start');

    // Start somewhere else
    api.select(2, 0, 0);
    expect(api.getSelection().measureIndex).toBe(1);

    // Jump to start
    api.jump('start-score');
    const selection = api.getSelection();
    expect(selection.measureIndex).toBe(0);
    expect(selection.eventId).toBe('e1-t');
  });

  test('jump("end-score") selects last event in last measure', () => {
    render(<RiffScore id="jump-end" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('jump-end');

    // Start at beginning
    api.select(1, 0, 0);

    // Jump to end
    api.jump('end-score');
    const selection = api.getSelection();
    expect(selection.measureIndex).toBe(1); // Second measure (index 1)
    expect(selection.eventId).toBe('e3-t');
  });

  test('jump("start-measure") stays in current measure', () => {
    render(
      <RiffScore id="jump-measure-start" config={configWithStaves(createGrandStaffStaves())} />
    );
    const api = getAPI('jump-measure-start');

    // Select second event in first measure
    api.select(1, 0, 1);
    expect(api.getSelection().eventId).toBe('e2-t');

    // Jump to start of measure
    api.jump('start-measure');
    const selection = api.getSelection();
    expect(selection.measureIndex).toBe(0);
    expect(selection.eventId).toBe('e1-t');
  });

  test('jump("end-measure") selects last event in current measure', () => {
    render(<RiffScore id="jump-measure-end" config={configWithStaves(createGrandStaffStaves())} />);
    const api = getAPI('jump-measure-end');

    // Select first event in first measure
    api.select(1, 0, 0);

    // Jump to end of measure
    api.jump('end-measure');
    const selection = api.getSelection();
    expect(selection.measureIndex).toBe(0);
    expect(selection.eventId).toBe('e2-t');
  });
});
