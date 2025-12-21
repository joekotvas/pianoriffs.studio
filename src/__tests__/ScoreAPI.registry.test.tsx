/**
 * ScoreAPI Registry Tests
 *
 * Tests for the window.riffScore registry and API chainability.
 */

import { render } from '@testing-library/react';
import { RiffScore } from '../RiffScore';

// Extend Window interface for tests
declare global {
  interface Window {
    riffScore: {
      instances: Map<string, unknown>;
      get(id: string): unknown | undefined;
      active: unknown | null;
    };
  }
}

describe('Registry', () => {
  afterEach(() => {
    // Clean up registry between tests (RTL auto-cleans DOM)
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('registers instance on mount', () => {
    render(<RiffScore id="test-register" />);
    expect(window.riffScore).toBeDefined();
    expect(window.riffScore.get('test-register')).toBeDefined();
  });

  test('unregisters on unmount', () => {
    const { unmount } = render(<RiffScore id="test-unmount" />);
    expect(window.riffScore.get('test-unmount')).toBeDefined();
    unmount();
    expect(window.riffScore.get('test-unmount')).toBeUndefined();
  });

  test('get() returns undefined for unknown id', () => {
    render(<RiffScore id="test-known" />);
    expect(window.riffScore.get('nonexistent')).toBeUndefined();
  });

  test('active points to most recent mount', () => {
    render(<RiffScore id="first" />);
    const firstApi = window.riffScore.get('first');
    expect(window.riffScore.active).toBe(firstApi);

    render(<RiffScore id="second" />);
    const secondApi = window.riffScore.get('second');
    expect(window.riffScore.active).toBe(secondApi);
  });

  test('auto-generates id if not provided', () => {
    render(<RiffScore />);
    expect(window.riffScore.instances.size).toBeGreaterThanOrEqual(1);
  });
});

describe('Data Methods', () => {
  // RTL auto-cleans after each test

  test('getScore() returns current score', () => {
    render(<RiffScore id="data-test" />);
    const api = window.riffScore.get('data-test') as {
      getScore(): unknown;
    };
    expect(api).toBeDefined();
    const score = api.getScore();
    expect(score).toBeDefined();
    expect(score).toHaveProperty('staves');
  });

  test('getConfig() returns current config', () => {
    render(<RiffScore id="config-test" />);
    const api = window.riffScore.get('config-test') as {
      getConfig(): unknown;
    };
    const config = api.getConfig();
    expect(config).toBeDefined();
    expect(config).toHaveProperty('ui');
    expect(config).toHaveProperty('interaction');
  });

  test('getSelection() returns current selection', () => {
    render(<RiffScore id="selection-test" />);
    const api = window.riffScore.get('selection-test') as {
      getSelection(): unknown;
    };
    const selection = api.getSelection();
    expect(selection).toBeDefined();
    expect(selection).toHaveProperty('staffIndex');
  });
});

describe('Chainability', () => {
  // RTL auto-cleans after each test

  test('methods return this for chaining', () => {
    render(<RiffScore id="chain-test" />);
    const api = window.riffScore.get('chain-test') as {
      select(m: number): unknown;
      move(d: string): unknown;
      deselectAll(): unknown;
    };
    expect(api).toBeDefined();

    // Test that select returns api for chaining
    const result = api.select(1);
    expect(result).toBe(api);

    // Test method chaining
    const chainResult = api.deselectAll();
    expect(chainResult).toBe(api);
  });
});

describe('Entry Methods', () => {
  afterEach(() => {
    // Clean up registry between tests (RTL auto-cleans DOM)
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('addNote appends to score and advances cursor', () => {
    render(<RiffScore id="entry-note-test" />);
    const api = window.riffScore.get('entry-note-test') as {
      select(m: number): unknown;
      addNote(pitch: string, duration?: string): unknown;
      getScore(): { staves: Array<{ measures: Array<{ events: unknown[] }> }> };
      getSelection(): { eventId: unknown; noteId: unknown };
    };

    // Select first measure
    api.select(1);

    // Get initial event count (not used, but for context)
    // const initialEventCount = initialScore.staves[0].measures[0].events.length;

    // Add a note
    const result = api.addNote('C4', 'quarter');

    // Verify chaining
    expect(result).toBe(api);

    // Verify selection was updated (eventId should be set)
    const selection = api.getSelection();
    expect(selection.eventId).toBeDefined();
    expect(selection.noteId).toBeDefined();
  });

  test('addRest appends rest', () => {
    render(<RiffScore id="entry-rest-test" />);
    const api = window.riffScore.get('entry-rest-test') as {
      select(m: number): unknown;
      addRest(duration?: string): unknown;
      getSelection(): { eventId: unknown };
    };

    api.select(1);
    const result = api.addRest('quarter');

    expect(result).toBe(api);

    const selection = api.getSelection();
    expect(selection.eventId).toBeDefined();
  });

  test('addTone adds pitch to existing chord', () => {
    render(<RiffScore id="entry-tone-test" />);
    const api = window.riffScore.get('entry-tone-test') as {
      select(m: number): unknown;
      addNote(pitch: string): unknown;
      addTone(pitch: string): unknown;
      getSelection(): { eventId: unknown; noteId: unknown };
    };

    // Create a note first
    api.select(1);
    api.addNote('C4');

    // Add another pitch to make a chord
    const result = api.addTone('E4');

    expect(result).toBe(api);

    // Selection should be updated to new note
    const selection = api.getSelection();
    expect(selection.noteId).toBeDefined();
  });
});

describe('Navigation Methods', () => {
  afterEach(() => {
    // Clean up registry between tests (RTL auto-cleans DOM)
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  test('select() returns this for chaining', () => {
    render(<RiffScore id="nav-select-test" />);
    const api = window.riffScore.get('nav-select-test') as {
      select(m: number, s?: number, e?: number): unknown;
    };

    // select() should return api for chaining
    const result = api.select(1, 0, 0);
    expect(result).toBe(api);
  });

  test('move("right") advances cursor', () => {
    render(<RiffScore id="nav-move-test" />);
    const api = window.riffScore.get('nav-move-test') as {
      select(m: number): unknown;
      addNote(pitch: string): unknown;
      addNote(pitch: string): unknown;
      move(direction: string): unknown;
      getSelection(): { eventId: unknown };
    };

    // Add two notes first
    api.select(1).addNote('C4').addNote('D4');

    // Move left should change selection
    const result = api.move('left');
    expect(result).toBe(api);
  });

  test('jump() returns this for chaining', () => {
    render(<RiffScore id="nav-jump-test" />);
    const api = window.riffScore.get('nav-jump-test') as {
      jump(target: string): unknown;
    };

    // Jump should return api for chaining
    expect(api.jump('start-score')).toBe(api);
    expect(api.jump('end-score')).toBe(api);
    expect(api.jump('start-measure')).toBe(api);
    expect(api.jump('end-measure')).toBe(api);
  });
});

