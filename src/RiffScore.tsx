// @ts-nocheck
/**
 * RiffScore Component
 *
 * Configurable React component for rendering and interacting with musical scores.
 * Supports two modes:
 * - Generator Mode: Create blank scores from templates (staff + measureCount)
 * - Render Mode: Load compositions from staves array
 */

import React, { useMemo } from 'react';
import { DeepPartial, RiffScoreConfig } from './types';
import { useRiffScore } from './hooks/useRiffScore';
import { ScoreProvider } from './context/ScoreContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ScoreEditorContent } from './components/Layout/ScoreEditor';

interface RiffScoreProps {
  config?: DeepPartial<RiffScoreConfig>;
}

/**
 * Internal component that handles the config-driven rendering
 */
const RiffScoreInner: React.FC<RiffScoreProps> = ({ config: userConfig }) => {
  const { config, initialScore } = useRiffScore(userConfig);
  const { theme } = useTheme();

  // Container style for interaction master switch
  const containerStyle = useMemo(
    () => ({
      pointerEvents: config.interaction.isEnabled ? 'auto' : 'none',
      userSelect: 'none' as const,
    }),
    [config.interaction.isEnabled]
  );

  return (
    <div className="RiffScore" style={containerStyle}>
      <ScoreProvider initialScore={initialScore}>
        <ScoreEditorContent
          scale={config.ui.scale}
          showToolbar={config.ui.showToolbar}
          enableKeyboard={config.interaction.enableKeyboard}
          enablePlayback={config.interaction.enablePlayback}
        />
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
 */
export const RiffScore: React.FC<RiffScoreProps> = ({ config }) => {
  return (
    <ThemeProvider initialTheme={config?.ui?.theme}>
      <RiffScoreInner config={config} />
    </ThemeProvider>
  );
};

export default RiffScore;
