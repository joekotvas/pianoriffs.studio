/**
 * Theme Configuration for Sheet Music Editor
 * 
 * Defines color palettes and semantic theme mappings.
 */

// =============================================================================
// LAYER 1: Descriptive Colors
// =============================================================================

export const COLORS = {
  // Slate (Dark/Default)
  slate800: '#1e293b', // Converted from hsla(217, 33%, 18%, 1.00) for hex-alpha compatibility
  slate700: 'hsla(218, 33%, 28%, 1.00)',
  slate600: 'hsla(215, 16%, 38%, 1.00)',
  slate500: 'hsla(215, 16%, 47%, 1.00)',
  slate400: 'hsla(215, 20%, 65%, 1.00)',
  slate200: '#e2e8f0',
  teal: '#1DA59C', // #1DA59C
  
  // Blue (Cool)
  blue950: '#0f172a',
  blue900: '#1e3a8a',
  blue800: '#1e40af',
  blue400: '#60a5fa',
  blue200: '#bfdbfe',
  cyan400: '#22d3ee',

  // Warm
  stone900: '#1c1917',
  stone800: '#292524',
  stone500: '#78716c',
  stone400: '#a8a29e',
  stone200: '#e7e5e4',
  orange400: '#fb923c',
  amber400: '#fbbf24',

  // Common
  whiteAlpha10: 'rgba(255, 255, 255, 0.1)',
  slate800Alpha80: 'rgba(30, 41, 59, 0.8)',
  blue950Alpha80: 'rgba(15, 23, 42, 0.8)',
  stone900Alpha80: 'rgba(28, 25, 23, 0.8)',
} as const;

// =============================================================================
// LAYER 2: Semantic Themes
// =============================================================================

const DARK = {
  accent: COLORS.teal,
  background: COLORS.slate800,
  panelBackground: COLORS.slate800Alpha80,
  text: COLORS.slate200,
  secondaryText: COLORS.slate400,
  border: COLORS.whiteAlpha10,
  buttonBackground: COLORS.slate800Alpha80,
  buttonHoverBackground: COLORS.slate700,
  score: {
    line: COLORS.slate500,
    note: COLORS.slate200,
    fill: COLORS.slate200,
  }
};

const COOL = {
  accent: COLORS.cyan400,
  background: COLORS.blue950,
  panelBackground: COLORS.blue950Alpha80,
  text: COLORS.blue200,
  secondaryText: COLORS.blue400,
  border: COLORS.whiteAlpha10,
  buttonBackground: COLORS.blue950Alpha80,
  buttonHoverBackground: COLORS.blue900,
  score: {
    line: COLORS.blue400,
    note: COLORS.blue200,
    fill: COLORS.blue200,
  }
};

const WARM = {
  accent: COLORS.orange400,
  background: COLORS.stone900,
  panelBackground: COLORS.stone900Alpha80,
  text: COLORS.stone200,
  secondaryText: COLORS.stone400,
  border: COLORS.whiteAlpha10,
  buttonBackground: COLORS.stone900Alpha80,
  buttonHoverBackground: COLORS.stone800,
  score: {
    line: COLORS.stone500,
    note: COLORS.stone200,
    fill: COLORS.stone200,
  }
};

const LIGHT = {
  accent: COLORS.teal,
  background: '#ffffff',
  panelBackground: '#f9f9f9',
  text: COLORS.slate800,
  secondaryText: COLORS.slate500,
  border: '#e2e8f0',
  buttonBackground: '#ffffff',
  buttonHoverBackground: '#f1f5f9',
  score: {
    line: COLORS.slate400,
    note: '#000000',
    fill: '#000000',
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export const THEMES = {
  DARK,
  COOL,
  WARM,
  LIGHT
} as const;

export const DEFAULT_THEME = 'DARK';

export type ThemeName = keyof typeof THEMES;

// Theme interface (structural type, not literal)
export interface Theme {
  accent: string;
  background: string;
  panelBackground: string;
  text: string;
  secondaryText: string;
  border: string;
  buttonBackground: string;
  buttonHoverBackground: string;
  score: {
    line: string;
    note: string;
    fill: string;
  };
}
