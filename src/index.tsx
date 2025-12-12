// RiffScore - Sheet Music Editor for React
// Main library exports

// Core components
export { RiffScore } from './RiffScore';
export { default as ScoreEditor, ScoreEditorContent } from './ScoreEditor';

// Context providers and hooks
export { ThemeProvider, useTheme } from './context/ThemeContext';
export { ScoreProvider, useScoreContext } from './context/ScoreContext';

// UI Components
export { default as ConfigMenu } from './components/Panels/ConfigMenu';

// Types
export type { Score, Selection, ScoreEvent, Note, Measure, Staff, RiffScoreConfig } from './types';
