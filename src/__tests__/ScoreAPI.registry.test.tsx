/**
 * ScoreAPI Registry Tests
 *
 * Tests for the window.riffScore registry and API chainability.
 */

import { render, cleanup } from '@testing-library/react';
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
    cleanup();
    // Clean up registry between tests
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
  afterEach(cleanup);

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
  afterEach(cleanup);

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
