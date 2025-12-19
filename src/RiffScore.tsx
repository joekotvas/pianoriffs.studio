// @ts-nocheck
/**
 * RiffScore Component
 *
 * Configurable React component for rendering and interacting with musical scores.
 * Supports two modes:
 * - Generator Mode: Create blank scores from templates (staff + measureCount)
 * - Render Mode: Load compositions from staves array
 *
 * Exposes an imperative API via `window.riffScore` registry for external script control.
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { DeepPartial, RiffScoreConfig } from './types';
import { useRiffScore } from './hooks/useRiffScore';
import { ScoreProvider, useScoreContext } from './context/ScoreContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ScoreEditorContent } from './components/Layout/ScoreEditor';
import { useScoreAPI } from './hooks/useScoreAPI';
import type { MusicEditorAPI, RiffScoreRegistry } from './api.types';

interface RiffScoreProps {
  /** Unique identifier for this RiffScore instance (auto-generated if not provided) */
  id?: string;
  config?: DeepPartial<RiffScoreConfig>;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    riffScore: RiffScoreRegistry;
  }
}

/**
 * Generate a unique ID for instances without explicit id prop
 */
const generateInstanceId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `riff-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Inner component that has access to ScoreContext and sets up the API
 */
const RiffScoreAPIBridge: React.FC<{
  instanceId: string;
  config: RiffScoreConfig;
  children: React.ReactNode;
}> = ({ instanceId, config, children }) => {
  const { score, selection, dispatch, setSelection } = useScoreContext();

  // Create API instance
  const api = useScoreAPI({
    score,
    selection,
    config,
    dispatch,
    setSelection,
  });

  // Store stable reference
  const apiRef = useRef<MusicEditorAPI>(api);
  apiRef.current = api;

  // Register/unregister with global registry
  useEffect(() => {
    // Initialize registry if needed
    if (!window.riffScore) {
      window.riffScore = {
        instances: new Map<string, MusicEditorAPI>(),
        active: null,
        get: (id: string) => window.riffScore.instances.get(id),
      };
    }

    // Register this instance
    window.riffScore.instances.set(instanceId, apiRef.current);
    window.riffScore.active = apiRef.current;

    // Cleanup on unmount
    return () => {
      window.riffScore.instances.delete(instanceId);
      // If this was the active instance, clear it
      if (window.riffScore.active === apiRef.current) {
        window.riffScore.active = null;
      }
    };
  }, [instanceId]);

  // Update registry reference when API changes
  useEffect(() => {
    if (window.riffScore) {
      window.riffScore.instances.set(instanceId, apiRef.current);
      window.riffScore.active = apiRef.current;
    }
  }, [api, instanceId]);

  return <>{children}</>;
};

/**
 * Internal component that handles the config-driven rendering
 */
const RiffScoreInner: React.FC<RiffScoreProps> = ({ id, config: userConfig }) => {
  const { config, initialScore } = useRiffScore(userConfig);
  const { theme } = useTheme();

  // Generate stable instance ID
  const instanceIdRef = useRef<string>(id || generateInstanceId());
  const instanceId = id || instanceIdRef.current;

  // Container style for interaction master switch
  const containerStyle = useMemo(
    () => ({
      pointerEvents: config.interaction.isEnabled ? 'auto' : 'none',
      userSelect: 'none' as const,
    }),
    [config.interaction.isEnabled]
  );

  return (
    <div className="RiffScore" style={containerStyle} data-riffscore-id={instanceId}>
      <ScoreProvider initialScore={initialScore}>
        <RiffScoreAPIBridge instanceId={instanceId} config={config}>
          <ScoreEditorContent
            scale={config.ui.scale}
            showToolbar={config.ui.showToolbar}
            enableKeyboard={config.interaction.enableKeyboard}
            enablePlayback={config.interaction.enablePlayback}
          />
        </RiffScoreAPIBridge>
      </ScoreProvider>
    </div>
  );
};

/**
 * RiffScore - Configurable Music Notation Editor
 *
 * @example
 * // Generator Mode - Create blank grand staff with 4 measures
 * <RiffScore config={{ score: { staff: 'grand', measureCount: 4 } }} />
 *
 * @example
 * // Render Mode - Load existing composition
 * <RiffScore config={{ score: { staves: myStaves } }} />
 *
 * @example
 * // Disable all interaction (read-only display)
 * <RiffScore config={{ interaction: { isEnabled: false } }} />
 *
 * @example
 * // Access API via window.riffScore
 * <RiffScore id="my-score" />
 * // Then in console: window.riffScore.get('my-score').addNote('C4')
 */
export const RiffScore: React.FC<RiffScoreProps> = ({ id, config }) => {
  return (
    <ThemeProvider initialTheme={config?.ui?.theme}>
      <RiffScoreInner id={id} config={config} />
    </ThemeProvider>
  );
};

export default RiffScore;
