/**
 * ScoreAPI.events.test.tsx
 *
 * Comprehensive tests for the Event Subscription API (Phase 3).
 * Verifies event firing, unsubscription, error isolation, and reference stability.
 *
 * @see src/hooks/useAPISubscriptions.ts
 * @see docs/adr/002-event-subscriptions.md
 */

import { renderHook, act } from '@testing-library/react';
import { useScoreAPI } from '../hooks/useScoreAPI';
import { ScoreProvider } from '../context/ScoreContext';
import { createDefaultScore } from '../types';
import { RiffScoreConfig } from '../types';

// Mock console.error/warn to keep test output clean during error tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

const defaultConfig = {} as RiffScoreConfig;

const defaultScore = createDefaultScore();

// Wrapper to provide context
const wrapper = ({ children }: any) => (
  <ScoreProvider initialScore={defaultScore}>
    {children}
  </ScoreProvider>
);

describe('ScoreAPI Events', () => {
  const instanceId = 'test-instance';

  test('notifies selection listeners on navigation', async () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId, config: defaultConfig }), { wrapper });
    
    const callback = jest.fn();
    
    // Subscribe
    act(() => {
      result.current.on('selection', callback);
    });

    // Initial state: ensure no immediate callback unless implemented as BehaviorSubject (ours is Event Emitter)
    expect(callback).not.toHaveBeenCalled();

    // Trigger change via navigation
    await act(async () => {
      // Assuming selecting a measure triggers a selection update
      result.current.select(1, 0, 0, 0); 
    });

    // Callback should fire with new selection state
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toHaveProperty('measureIndex', 0);
  });

  test('notifies score listeners on mutation', async () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId, config: defaultConfig }), { wrapper });
    
    const callback = jest.fn();
    
    // Subscribe
    act(() => {
      result.current.on('score', callback);
    });

    // Trigger mutations (e.g., adding a note)
    await act(async () => {
      result.current.addNote('C4', 'quarter', false);
    });

    // Callback should fire with updated score
    expect(callback).toHaveBeenCalled();
  });

  test('unsubscribe stops notifications', async () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId, config: defaultConfig }), { wrapper });
    
    const callback = jest.fn();
    let unsubscribe: () => void;
    
    act(() => {
      unsubscribe = result.current.on('selection', callback);
    });

    // Trigger first event
    await act(async () => {
      result.current.select(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Unsubscribe
    act(() => {
      unsubscribe();
    });

    // Trigger second event
    await act(async () => {
      result.current.select(1); // Re-selecting same or different
    });
    
    // Callback count remains 1
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('supports multiple independent listeners', async () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId, config: defaultConfig }), { wrapper });
    
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    
    act(() => {
      result.current.on('selection', cb1);
      result.current.on('selection', cb2);
    });

    await act(async () => {
      result.current.select(1);
    });

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });

  test('isolates errors from buggy subscribers', async () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId, config: defaultConfig }), { wrapper });
    
    const safeCallback = jest.fn();
    const buggyCallback = () => {
      throw new Error('Subscriber crashed!');
    };
    
    act(() => {
      result.current.on('selection', buggyCallback);
      result.current.on('selection', safeCallback);
    });

    // Trigger event
    await act(async () => {
      result.current.select(1);
    });

    // Safe callback should still run despite the other one crashing
    expect(safeCallback).toHaveBeenCalledTimes(1);
    
    // Verify console.error was called for the crash (suppressed in test output)
    expect(console.error).toHaveBeenCalled();
  });

  test('API object identity remains stable when adding listeners', () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId, config: defaultConfig }), { wrapper });
    
    const initialApi = result.current;
    
    act(() => {
      result.current.on('score', jest.fn());
    });

    const newApi = result.current;

    // Adding listeners should NOT cause the API object to be re-created
    expect(newApi).toBe(initialApi);
  });
});
