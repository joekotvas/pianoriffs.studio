/**
 * useAPISubscriptions Hook
 *
 * Encapsulates the logic for managing and notifying external event listeners
 * for the RiffScore API.
 * 
 * DESIGN:
 * - `on()` registers listeners in a Ref for identity stability
 * - `useEffect` hooks notify listeners when React state changes
 * - Listeners fire exactly once per state change (no double-notifications)
 * 
 * @see docs/adr/002-event-subscriptions.md
 * @tested ScoreAPI.events.test.tsx, ScoreAPI.cookbook.test.tsx
 */

import { useRef, useEffect, useCallback } from 'react';
import type { Unsubscribe } from '../api.types';
import type { Score, Selection } from '../types';

type Listener<T> = (state: T) => void;

interface Listeners {
  score: Set<Listener<Score>>;
  selection: Set<Listener<Selection>>;
  playback: Set<Listener<unknown>>;
}

/**
 * Safely executes a callback, catching any errors to prevent
 * crashing the main application loop.
 */
function safeCall<T>(callback: Listener<T>, state: T): void {
  try {
    callback(state);
  } catch (error) {
    console.error('[RiffScore API] External listener failed:', error);
  }
}

/**
 * Manages event subscriptions for the score API.
 * 
 * Returns:
 * - `on`: Subscribe to events (returns unsubscribe function)
 * 
 * Listeners are notified via useEffect when React state changes.
 * This ensures callbacks receive fresh, correct data.
 */
export function useAPISubscriptions(score: Score, selection: Selection) {
  // Store listeners in a Ref to avoid re-creation on render
  const listenersRef = useRef<Listeners>({
    score: new Set(),
    selection: new Set(),
    playback: new Set(),
  });

  // Notify SCORE listeners when React state updates
  // Callbacks fire after React processes state changes, ensuring fresh data
  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (prevScoreRef.current !== score) {
      prevScoreRef.current = score;
      listenersRef.current.score.forEach(cb => safeCall(cb, score));
    }
  }, [score]);

  // Notify SELECTION listeners when React state updates
  const prevSelectionRef = useRef(selection);
  useEffect(() => {
    if (prevSelectionRef.current !== selection) {
      prevSelectionRef.current = selection;
      listenersRef.current.selection.forEach(cb => safeCall(cb, selection));
    }
  }, [selection]);

  // Public subscription method
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const on = useCallback((event: 'score' | 'selection' | 'playback' | string, callback: any): Unsubscribe => {
    const listeners = listenersRef.current;
    let targetSet: Set<any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Route to appropriate listener set
    if (event === 'score') {
      targetSet = listeners.score;
    } else if (event === 'selection') {
      targetSet = listeners.selection;
    } else if (event === 'playback') {
      targetSet = listeners.playback;
    }

    if (targetSet) {
      targetSet.add(callback);
      // Return Unsubscribe function
      return () => {
        targetSet?.delete(callback);
      };
    }

    // Return no-op for unknown events
    console.warn(`[RiffScore API] Unknown event type: ${event}`);
    return () => {};
  }, []); // Empty dependency array ensures 'on' function identity is stable

  return { on };
}

