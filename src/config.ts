/**
 * Configuration Constants for Sheet Music Editor
 */

// Re-export themes for backwards compatibility
export { COLORS, THEMES, DEFAULT_THEME } from './themes';
export type { ThemeName, Theme } from './themes';

// =============================================================================
// LAYOUT CONFIGURATION
// =============================================================================

export interface Config {
  lineHeight: number;
  topMargin: number;
  baseY: number;
  quantsPerMeasure: number;
  measurePaddingLeft: number;
  measurePaddingRight: number;
  scoreMarginLeft: number;
  headerWidth: number;
  staffSpacing: number;

  debug?: {
    enabled: boolean;
    logCommands: boolean;
    logStateChanges: boolean;
    logValidation: boolean;
    showHitZones?: boolean;
  };
}

export const CONFIG: Config = {
  lineHeight: 12,
  topMargin: 20,
  baseY: 70,
  quantsPerMeasure: 64,
  measurePaddingLeft: 36,
  measurePaddingRight: 0,
  scoreMarginLeft: 60,
  headerWidth: 60,
  staffSpacing: 120,

  debug: {
    enabled: true,
    logCommands: true,
    logStateChanges: true,
    logValidation: true,
    showHitZones: false, // Show red/cyan debug rectangles for hit zones
  },
};
