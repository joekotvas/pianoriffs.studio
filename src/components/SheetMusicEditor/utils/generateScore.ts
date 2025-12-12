/**
 * Score Generator Utility
 * 
 * Generates staff structures from templates for RiffScore initialization.
 */

import { Staff, Measure, StaffTemplate } from '../types';

let idCounter = 0;
const generateId = (prefix: string): string => `${prefix}-${++idCounter}`;

/**
 * Creates an empty measure (no events).
 * The layout engine will generate a centered, non-interactive placeholder rest for display.
 * 
 * NOTE: Empty measures have `events: []`. The layout engine's createEmptyMeasureLayout
 * handles rendering a centered whole rest placeholder that doesn't block input.
 */
export const createEmptyMeasure = (): Measure => ({
  id: generateId('m'),
  events: [],
});

/**
 * Creates a staff with the specified clef and number of measures
 */
const createStaff = (
  clef: 'treble' | 'bass',
  measureCount: number,
  keySignature: string
): Staff => ({
  id: generateId('staff'),
  clef,
  keySignature,
  measures: Array.from({ length: measureCount }, () => createEmptyMeasure()),
});

/**
 * Generates staves from a template
 * @param template - 'grand', 'treble', or 'bass'
 * @param measureCount - Number of measures per staff
 * @param keySignature - Key signature for all staves
 * @returns Array of Staff objects
 */
export const generateStaves = (
  template: StaffTemplate,
  measureCount: number,
  keySignature: string
): Staff[] => {
  // Reset counter for deterministic IDs in tests
  idCounter = 0;
  
  switch (template) {
    case 'grand':
      return [
        createStaff('treble', measureCount, keySignature),
        createStaff('bass', measureCount, keySignature),
      ];
    case 'treble':
      return [createStaff('treble', measureCount, keySignature)];
    case 'bass':
      return [createStaff('bass', measureCount, keySignature)];
    default:
      // Fallback to treble
      return [createStaff('treble', measureCount, keySignature)];
  }
};

/**
 * Resets the ID counter (useful for testing)
 */
export const resetIdCounter = (): void => {
  idCounter = 0;
};
