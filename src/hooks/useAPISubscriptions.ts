/**
 * useAPISubscriptions Hook
 *
 * Encapsulates the logic for managing and notifying external event listeners
 * for the RiffScore API.
 * 
 * @see docs/adr/002-event-subscriptions.md
 * @tested
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
 * DESIGN:
 * Uses `useEffect` to detect state changes and trigger notifications.
 * This ensures strict synchronization with React's render cycle.
 * Listeners are stored in a Ref to maintain identity stability.
 */
export function useAPISubscriptions(score: Score, selection: Selection) {
  // Store listeners in a Ref to avoid re-creation on render
  const listenersRef = useRef<Listeners>({
    score: new Set(),
    selection: new Set(),
    playback: new Set(),
  });

  // Notify SCORE listeners when score object changes
  useEffect(() => {
    listenersRef.current.score.forEach(cb => safeCall(cb, score));
  }, [score]);

  // Notify SELECTION listeners when selection object changes
  useEffect(() => {
    listenersRef.current.selection.forEach(cb => safeCall(cb, selection));
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
