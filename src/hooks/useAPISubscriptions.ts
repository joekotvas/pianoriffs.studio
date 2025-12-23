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
import type { Unsubscribe, BatchEventPayload } from '../api.types';
import type { Score, Selection } from '../types';
import type { ScoreEngine } from '../engines/ScoreEngine';

type Listener<T> = (state: T) => void;

interface Listeners {
  score: Set<Listener<Score>>;
  selection: Set<Listener<Selection>>;
  playback: Set<Listener<unknown>>;
  batch: Set<Listener<BatchEventPayload>>;
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
 * - Score/Selection: Notified via React useEffect (stable state)
 * - Batch: Notified via ScoreEngine subscription (imperative event)
 */
export function useAPISubscriptions(score: Score, selection: Selection, engine?: ScoreEngine) {
  // Store listeners in a Ref to avoid re-creation on render
  const listenersRef = useRef<Listeners>({
    score: new Set(),
    selection: new Set(),
    playback: new Set(),
    batch: new Set(),
  });

  // Notify SCORE listeners when React state updates
  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (prevScoreRef.current !== score) {
      prevScoreRef.current = score;
      listenersRef.current.score.forEach((cb) => safeCall(cb, score));
    }
  }, [score]);

  // Notify SELECTION listeners when React state updates
  const prevSelectionRef = useRef(selection);
  useEffect(() => {
    if (prevSelectionRef.current !== selection) {
      prevSelectionRef.current = selection;
      listenersRef.current.selection.forEach((cb) => safeCall(cb, selection));
    }
  }, [selection]);

  // Subscribe to Engine Batch Events
  useEffect(() => {
    if (!engine) return;

    // Bridge Engine event -> API listeners
    const unsubscribeEngine = engine.subscribeBatch((payload) => {
      listenersRef.current.batch.forEach((cb) => safeCall(cb, payload));
    });

    return unsubscribeEngine;
  }, [engine]);

  // Public subscription method
  const on = useCallback(
    (
      event: 'score' | 'selection' | 'playback' | 'batch' | string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: any
    ): Unsubscribe => {
      const listeners = listenersRef.current;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let targetSet: Set<any> | undefined;

      // Route to appropriate listener set
      if (event === 'score') {
        targetSet = listeners.score;
      } else if (event === 'selection') {
        targetSet = listeners.selection;
      } else if (event === 'playback') {
        targetSet = listeners.playback;
      } else if (event === 'batch') {
        targetSet = listeners.batch;
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
    },
    // Empty dependency array ensures 'on' function identity is stable
    []
  );

  return { on };
}
