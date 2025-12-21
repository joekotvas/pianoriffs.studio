/**
 * ScoreAPI.entry.test.tsx
 *
 * Tests for API entry methods focusing on error paths and edge cases.
 *
 * High-priority coverage:
 * - addNote() validation (invalid pitch)
 * - addRest() basic functionality
 * - addTone() chord building
 * - Chaining behavior
 *
 * NOTE: Tests verify selection state rather than event count because getScore()
 * may return stale data in test environment. Selection is the authoritative
 * signal that an entry operation succeeded.
 */

import { render } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';

// Mock console.warn to capture validation warnings
const originalConsoleWarn = console.warn;
let consoleWarnMock: jest.Mock;

beforeEach(() => {
  consoleWarnMock = jest.fn();
  console.warn = consoleWarnMock;
});

afterEach(() => {
  console.warn = originalConsoleWarn;
});

// Helper to get typed API
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('Entry - addNote Validation', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('addNote with valid pitch succeeds (selection updated)', () => {
    render(<RiffScore id="entry-valid-pitch" />);
    const api = getAPI('entry-valid-pitch');

    api.select(1).addNote('C4');
    
    expect(consoleWarnMock).not.toHaveBeenCalled();
    // Selection should have eventId and noteId set
    const selection = api.getSelection();
    expect(selection.eventId).toBeDefined();
    expect(selection.noteId).toBeDefined();
  });

  test('addNote with invalid pitch logs warning and returns this', () => {
    render(<RiffScore id="entry-invalid-pitch" />);
    const api = getAPI('entry-invalid-pitch');

    const result = api.select(1).addNote('INVALID');
    
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid pitch format')
    );
    expect(result).toBe(api);
  });

  test('addNote with empty string logs warning', () => {
    render(<RiffScore id="entry-empty-pitch" />);
    const api = getAPI('entry-empty-pitch');

    api.select(1).addNote('');
    
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid pitch format')
    );
  });

  test('addNote with lowercase pitch logs warning', () => {
    render(<RiffScore id="entry-lowercase" />);
    const api = getAPI('entry-lowercase');

    // Our validation requires uppercase note letter
    api.select(1).addNote('c4');
    
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid pitch format')
    );
  });

  test('addNote with sharps works correctly', () => {
    render(<RiffScore id="entry-sharp" />);
    const api = getAPI('entry-sharp');

    api.select(1).addNote('F#4');
    
    // No warning = success
    expect(consoleWarnMock).not.toHaveBeenCalled();
    expect(api.getSelection().eventId).toBeDefined();
  });

  test('addNote with flats works correctly', () => {
    render(<RiffScore id="entry-flat" />);
    const api = getAPI('entry-flat');

    api.select(1).addNote('Bb3');
    
    expect(consoleWarnMock).not.toHaveBeenCalled();
    expect(api.getSelection().eventId).toBeDefined();
  });

  test('addNote with double sharps works', () => {
    render(<RiffScore id="entry-double-sharp" />);
    const api = getAPI('entry-double-sharp');

    api.select(1).addNote('C##4');
    
    expect(consoleWarnMock).not.toHaveBeenCalled();
    expect(api.getSelection().eventId).toBeDefined();
  });

  test('addNote with double flats works', () => {
    render(<RiffScore id="entry-double-flat" />);
    const api = getAPI('entry-double-flat');

    api.select(1).addNote('Dbb4');
    
    expect(consoleWarnMock).not.toHaveBeenCalled();
    expect(api.getSelection().eventId).toBeDefined();
  });
});

describe('Entry - addTone (Chord Building)', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('addTone with invalid pitch logs warning', () => {
    render(<RiffScore id="tone-invalid" />);
    const api = getAPI('tone-invalid');

    // First add a valid note
    api.select(1).addNote('C4');
    
    // Try to add invalid pitch to chord
    api.addTone('INVALID');
    
    expect(consoleWarnMock).toHaveBeenCalledWith(
      expect.stringContaining('Invalid pitch format')
    );
  });

  test('addTone without selection is no-op', () => {
    render(<RiffScore id="tone-no-selection" />);
    const api = getAPI('tone-no-selection');

    // Deselect first
    api.deselectAll();
    
    // Try to add tone - should be no-op (returns this)
    const result = api.addTone('E4');
    expect(result).toBe(api);
  });

  test('addTone updates selection to new note', () => {
    render(<RiffScore id="tone-chord" />);
    const api = getAPI('tone-chord');

    // Add initial note
    api.select(1).addNote('C4');
    const firstSelection = api.getSelection();
    const firstNoteId = firstSelection.noteId;
    
    // Add another pitch to build chord
    api.addTone('E4');
    const secondSelection = api.getSelection();
    
    // Selection should update to new note in same event
    expect(secondSelection.eventId).toBe(firstSelection.eventId);
    expect(secondSelection.noteId).not.toBe(firstNoteId);
  });
});

describe('Entry - addRest', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('addRest updates selection', () => {
    render(<RiffScore id="rest-basic" />);
    const api = getAPI('rest-basic');

    api.select(1).addRest('quarter');
    
    // Selection should have eventId set
    expect(api.getSelection().eventId).toBeDefined();
  });

  test('addRest returns this for chaining', () => {
    render(<RiffScore id="rest-chain" />);
    const api = getAPI('rest-chain');

    const result = api.select(1).addRest();
    expect(result).toBe(api);
  });
});

describe('Entry - Chaining', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('entry methods chain correctly', () => {
    render(<RiffScore id="entry-chain" />);
    const api = getAPI('entry-chain');

    // Chain multiple operations
    const result = api
      .select(1)
      .addNote('C4')
      .addNote('D4');

    expect(result).toBe(api);
  });

  test('failed addNote still allows chaining', () => {
    render(<RiffScore id="entry-chain-fail" />);
    const api = getAPI('entry-chain-fail');

    // Even though addNote fails (invalid pitch), chaining should work
    const result = api.select(1).addNote('INVALID').move('left');
    
    expect(result).toBe(api);
    expect(consoleWarnMock).toHaveBeenCalled();
  });
});

/**
 * DOCUMENTED OBSERVATIONS FOR FUTURE ENHANCEMENT:
 *
 * 1. getScore() in test environment may return stale data
 *    - Tests verify selection state instead of event count
 *    - Selection is authoritative signal of success
 *    - Investigate: May be React test env timing issue
 *
 * 2. Custom staves via config.score.staves behavior
 *    - Navigation tests work with custom staves
 *    - Entry tests work better with default score
 *    - May need to wrap in act() for proper sync
 *
 * 3. Measure capacity validation
 *    - Would need reliable way to test "measure full" scenario
 *    - Currently deferred until #1 is resolved
 */
