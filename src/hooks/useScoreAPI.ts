/**
 * useScoreAPI Hook
 *
 * Machine-addressable API hook that provides external script control
 * of RiffScore instances via `window.riffScore`.
 *
 * DESIGN NOTE:
 * This hook consumes the ScoreContext directly. It maintains internal Refs
 * to the latest state to ensure that imperative calls (which don't follow
 * React's render cycle) always have access to the latest data without
 * closure staleness.
 *
 * @see docs/migration/api_reference_draft.md
 */

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useScoreContext } from '../context/ScoreContext';
import { useAPISubscriptions } from './useAPISubscriptions';
import type { MusicEditorAPI, RiffScoreRegistry } from '../api.types';
import type { RiffScoreConfig } from '../types';
import { SetSelectionCommand } from '../commands/selection';
import {
  createNavigationMethods,
  createSelectionMethods,
  createEntryMethods,
  createModificationMethods,
  createHistoryMethods,
  createPlaybackMethods,
  createIOMethods,
  APIContext,
} from './api';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    riffScore: RiffScoreRegistry;
  }
}

/**
 * Initialize the global registry if it doesn't exist
 */
const initRegistry = (): void => {
  if (typeof window === 'undefined') return;
  if (!window.riffScore) {
    window.riffScore = {
      instances: new Map<string, MusicEditorAPI>(),
      active: null,
      get: (id: string) => window.riffScore.instances.get(id),
    };
  }
};

/**
 * Props for the useScoreAPI hook
 */
export interface UseScoreAPIProps {
  /** Unique instance ID for registry */
  instanceId: string;
  /** Current config */
  config: RiffScoreConfig;
}

/**
 * Creates a MusicEditorAPI instance for external script control.
 *
 * This hook consumes ScoreContext internally, so it must be used within
 * a ScoreProvider. It only needs instanceId and config from props.
 *
 * @example
 * ```typescript
 * const api = useScoreAPI({ instanceId: 'my-score', config });
 * // API is automatically registered to window.riffScore
 * ```
 */
export function useScoreAPI({ instanceId, config }: UseScoreAPIProps): MusicEditorAPI {
  // 1. Consume Context Directly (Grouped API)
  const ctx = useScoreContext();
  const { score, selection } = ctx.state;
  const { dispatch, selectionEngine } = ctx.engines;
  const {
    begin: beginTransaction,
    commit: commitTransaction,
    rollback: rollbackTransaction,
    undo,
    redo,
  } = ctx.historyAPI;

  // 2. Synchronous State Refs (authoritative for API methods to avoid stale closures)
  const scoreRef = useRef(score);
  const selectionRef = useRef(selection);

  // Keep refs in sync with React state
  useEffect(() => {
    scoreRef.current = score;
    selectionRef.current = selection;
  }, [score, selection]);

  // 3. Selection Sync Helper
  // Updates both the authoritative Ref (for immediate chaining) and dispatches to engine (for UI)
  const syncSelection = useCallback(
    (newSelection: typeof selection) => {
      selectionRef.current = newSelection;
      selectionEngine.dispatch(
        new SetSelectionCommand({
          staffIndex: newSelection.staffIndex,
          measureIndex: newSelection.measureIndex,
          eventId: newSelection.eventId,
          noteId: newSelection.noteId,
          selectedNotes: newSelection.selectedNotes,
          anchor: newSelection.anchor,
        })
      );
    },
    [selectionEngine]
  );

  // 4. API Event Subscriptions
  // Delegates listener management to the dedicated hook
  const { on } = useAPISubscriptions(score, selection);

  // 5. Build API Object (memoized to maintain stable reference)
  const api: MusicEditorAPI = useMemo(() => {
    const context: APIContext = {
      scoreRef,
      selectionRef,
      getScore: () => ctx.engines.engine.getState(),
      getSelection: () => selectionEngine.getState(),
      syncSelection,
      dispatch,
      selectionEngine,
      history: {
        undo,
        redo,
        begin: beginTransaction,
        commit: commitTransaction,
        rollback: rollbackTransaction,
      },
      config,
    };

    // Factory methods access refs via context, not directly during render.
    // The refs are only read when API methods are called (in event handlers).
    /* eslint-disable react-hooks/refs */
    const instance: MusicEditorAPI = {
      // Composition: Mixin all factory methods
      ...createNavigationMethods(context),
      ...createSelectionMethods(context),
      ...createEntryMethods(context),
      ...createModificationMethods(context),
      ...createHistoryMethods(context),
      ...createPlaybackMethods(context),
      ...createIOMethods(context),

      // Data Accessors (Bound Closures)
      getScore: () => ctx.engines.engine.getState(),
      getConfig: () => config,
      getSelection: () => selectionRef.current,

      // Events
      on,
    };
    /* eslint-enable react-hooks/refs */

    return instance;
  }, [
    config,
    dispatch,
    syncSelection,
    selectionEngine,
    on,
    undo,
    redo,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    ctx.engines.engine,
  ]);

  // 5. Registry registration/cleanup
  useEffect(() => {
    initRegistry();

    // Register this instance
    window.riffScore.instances.set(instanceId, api);
    window.riffScore.active = api;

    // Cleanup on unmount
    return () => {
      window.riffScore.instances.delete(instanceId);
      if (window.riffScore.active === api) {
        window.riffScore.active = null;
      }
    };
  }, [instanceId, api]);

  return api;
}
