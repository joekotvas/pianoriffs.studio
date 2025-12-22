// RiffScore - Sheet Music Editor for React
// Main library exports

// Core components
export { RiffScore } from './RiffScore';
export { default as ScoreEditor, ScoreEditorContent } from './components/Layout/ScoreEditor';

// Context providers and hooks
export { ThemeProvider, useTheme } from './context/ThemeContext';
export { ScoreProvider, useScoreContext } from './context/ScoreContext';

// UI Components
export { default as ConfigMenu } from '../demo/app/ConfigMenu';

// Types
export type { Score, Selection, ScoreEvent, Note, Measure, Staff, RiffScoreConfig } from './types';

// API Types (Machine-Addressable Interface)
export type { MusicEditorAPI, RiffScoreRegistry, APIEventType, Unsubscribe } from './api.types';
