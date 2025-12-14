/**
 * Configuration Constants for Sheet Music Editor
 */

// Re-export themes for backwards compatibility
export { COLORS, THEMES, DEFAULT_THEME } from './themes';
export type { ThemeName, Theme } from './themes';

// =============================================================================
// LAYOUT CONFIGURATION
// =============================================================================

export interface PitchRangeConfig {
  treble: { min: string; max: string };
  bass: { min: string; max: string };
}

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
  pitchRange: PitchRangeConfig;
  debug?: {
    enabled: boolean;
    logCommands: boolean;
    logStateChanges: boolean;
    logValidation: boolean;
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
  pitchRange: {
    treble: { min: 'G3', max: 'E6' },
    bass: { min: 'E1', max: 'F4' }
  },
  debug: {
    enabled: true,
    logCommands: true,
    logStateChanges: true,
    logValidation: true
  }
};
