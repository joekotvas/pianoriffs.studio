/**
 * Preview Note Utilities
 *
 * Functions for creating and managing ghost cursor/preview note states.
 * Used during navigation to show potential note placement positions.
 *
 * @tested interactionUtils.test.ts
 */

import { calculateTotalQuants } from '../core';
import { Measure, PreviewNote, HorizontalNavigationResult } from '@/types';
import { getClefConfig } from '@/constants';

/**
 * Generates preview note state for appending to a measure (APPEND mode ghost cursor).
 * Calculates the quant position based on total measure content and determines
 * default pitch from the last event or falls back to 'C4'.
 *
 * @param measure - The target measure to append to
 * @param measureIndex - Index of the measure in the staff
 * @param staffIndex - Index of the staff in the score
 * @param activeDuration - The duration to use for the preview
 * @param isDotted - Whether the duration is dotted
 * @param pitch - Optional explicit pitch (if not provided, derived from last event)
 * @param isRest - Whether the preview is a rest
 * @returns PreviewNote object for rendering the ghost cursor
 *
 * @internal Used by navigation functions to create preview states
 */
export const getAppendPreviewNote = (
  measure: Measure,
  measureIndex: number,
  staffIndex: number,
  activeDuration: string,
  isDotted: boolean,
  pitch?: string,
  isRest: boolean = false
): PreviewNote => {
  const totalQuants = calculateTotalQuants(measure.events || []);
  // Default pitch logic: try to use last event's pitch, or fallback
  let defaultPitch = pitch;
  if (!defaultPitch) {
    if (measure.events.length > 0) {
      const lastEvent = measure.events[measure.events.length - 1];
      // Skip rests when determining pitch
      if (!lastEvent.isRest && lastEvent.notes?.length > 0) {
        defaultPitch = lastEvent.notes[0].pitch || 'C4';
      } else {
        defaultPitch = 'C4'; // Fallback for rests
      }
    } else {
      defaultPitch = 'C4'; // Validation fallback
    }
  }

  return {
    measureIndex,
    staffIndex,
    quant: totalQuants,
    visualQuant: totalQuants,
    pitch: defaultPitch,
    duration: activeDuration,
    dotted: isDotted,
    mode: 'APPEND',
    index: measure.events.length,
    isRest,
  };
};

/**
 * Returns the default pitch for a given clef.
 * Used for initializing ghost cursors when no previous pitch context exists.
 *
 * @param clef - The clef type ('treble', 'bass', 'alto', 'tenor', etc.)
 * @returns Default pitch from CLEF_CONFIG
 *
 * @see CLEF_CONFIG in constants.ts
 * @tested navigationHelpers.test.ts
 */
export const getDefaultPitchForClef = (clef: string): string => {
  const config = getClefConfig(clef);
  return config.defaultPitch;
};

/**
 * Creates a navigation result for ghost cursor mode (no event selected).
 * Used when user navigates into empty space within a measure.
 *
 * @internal
 */
export const createGhostCursorResult = (
  staffIndex: number,
  previewNote: PreviewNote
): HorizontalNavigationResult => ({
  selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
  previewNote,
  audio: null,
  shouldCreateMeasure: false,
});
