/**
 * Vertical Navigation Utilities
 *
 * Functions for calculating vertical (Cmd+Up/Down) keyboard navigation.
 * Handles chord traversal, cross-staff switching, and staff cycling.
 *
 * @tested navigationHelpers.test.ts
 */

import { calculateTotalQuants, getNoteDuration } from '../core';
import { getMidi } from '@/services/MusicService';
import { CONFIG } from '@/config';
import {
  Note,
  Score,
  ScoreEvent,
  PreviewNote,
  NavigationSelection,
  VerticalNavigationResult,
} from '@/types';
import { getAppendPreviewNote, getDefaultPitchForClef } from './previewNote';
import { findEventAtQuantPosition, selectNoteInEventByDirection } from './crossStaff';
import { getAdjustedDuration } from './horizontal';

/**
 * Calculates cross-staff selection based on quant alignment.
 * Finds the event in the target staff that overlaps with the current selection's
 * absolute quant position within the measure.
 *
 * @param score - The complete score object
 * @param selection - Current selection (must have valid staffIndex, measureIndex, eventId)
 * @param direction - 'up' or 'down'
 * @param activeDuration - Duration for ghost cursor if no aligned event found
 * @param isDotted - Whether duration is dotted
 * @returns New selection with aligned event, or null if target staff doesn't exist
 *
 * @see calculateVerticalNavigation - Higher-level function that includes chord traversal
 */
export const calculateCrossStaffSelection = (
  score: Score,
  selection: NavigationSelection,
  direction: 'up' | 'down',
  activeDuration: string = 'quarter',
  isDotted: boolean = false
): VerticalNavigationResult | null => {
  const { staffIndex, measureIndex, eventId } = selection;
  if (staffIndex === undefined || measureIndex === null || !eventId) return null;

  const currentStaff = score.staves[staffIndex];
  if (!currentStaff) return null;

  // Determine target staff
  const targetStaffIndex = direction === 'up' ? staffIndex - 1 : staffIndex + 1;
  if (targetStaffIndex < 0 || targetStaffIndex >= score.staves.length) return null;

  const targetStaff = score.staves[targetStaffIndex];

  // Get current event to determine Start Quant Offset within the measure
  const currentMeasure = currentStaff.measures[measureIndex];
  if (!currentMeasure) return null;

  let currentQuantStart = 0;
  const currentEvent = currentMeasure.events.find((e: ScoreEvent) => {
    if (e.id === eventId) return true;
    currentQuantStart += getNoteDuration(e.duration, e.dotted, e.tuplet);
    return false;
  });

  if (!currentEvent) return null;

  // Now look at target staff, same measure index assuming sync
  const targetMeasure = targetStaff.measures[measureIndex];

  if (!targetMeasure) return null;

  // Find event in target measure that contains currentQuantStart
  let targetEvent = null;
  let targetQuant = 0;

  for (const e of targetMeasure.events) {
    const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
    const start = targetQuant;
    const end = targetQuant + duration;

    // Check overlap: if currentQuantStart falls within [start, end)
    if (currentQuantStart >= start && currentQuantStart < end) {
      targetEvent = e;
      break;
    }
    targetQuant += duration;
  }

  if (targetEvent) {
    const noteId = targetEvent.notes.length > 0 ? targetEvent.notes[0].id : null;

    return {
      selection: {
        staffIndex: targetStaffIndex,
        measureIndex,
        eventId: targetEvent.id,
        noteId,
        selectedNotes: [], // Clear multi-select
        anchor: null, // Clear anchor
      },
      previewNote: null,
    };
  } else {
    // No event found at this time (Gap or Empty Measure)
    // Fallback to "Append Position" using consistent logic

    // Determine Pitch: Default to a "middle" note for the staff clef.
    const clef = targetStaff.clef || 'treble';
    const defaultPitch = getDefaultPitchForClef(clef);

    const previewNote = getAppendPreviewNote(
      targetMeasure,
      measureIndex,
      targetStaffIndex,
      activeDuration,
      isDotted,
      defaultPitch
    );

    return {
      selection: {
        staffIndex: targetStaffIndex,
        measureIndex,
        eventId: null,
        noteId: null,
        selectedNotes: [],
        anchor: null,
      },
      previewNote,
    };
  }
};

/**
 * Unified vertical navigation for Cmd+Up/Down keyboard shortcuts.
 * Handles three scenarios in priority order:
 * 1. **Chord traversal**: Navigate between notes within a chord
 * 2. **Cross-staff switching**: Move to aligned event in adjacent staff
 * 3. **Staff cycling**: Wrap to opposite staff at boundaries
 *
 * Also supports ghost cursor navigation (moving preview between staves).
 *
 * @param score - The complete score object
 * @param selection - Current selection state
 * @param direction - 'up' or 'down'
 * @param activeDuration - Duration for ghost cursor if needed
 * @param isDotted - Whether duration is dotted
 * @param previewNote - Optional ghost cursor state
 * @param currentQuantsPerMeasure - Time signature quants
 * @returns Navigation result, or null if no change
 *
 * @tested navigationHelpers.test.ts
 */
export const calculateVerticalNavigation = (
  score: Score,
  selection: NavigationSelection,
  direction: 'up' | 'down',
  activeDuration: string = 'quarter',
  isDotted: boolean = false,
  previewNote: PreviewNote | null = null,
  currentQuantsPerMeasure: number = CONFIG.quantsPerMeasure
): VerticalNavigationResult | null => {
  const { staffIndex = 0, measureIndex, eventId } = selection;

  // Handle ghost cursor navigation (no eventId)
  if (!eventId && previewNote) {
    const ghostMeasureIndex = previewNote.measureIndex;
    const ghostStaffIndex = previewNote.staffIndex ?? staffIndex;
    const currentQuantStart = previewNote.quant ?? 0;

    // Determine target staff for ghost cursor
    const targetStaffIndex = direction === 'up' ? ghostStaffIndex - 1 : ghostStaffIndex + 1;

    // Check if we can switch staff
    if (targetStaffIndex >= 0 && targetStaffIndex < score.staves.length) {
      const targetStaff = score.staves[targetStaffIndex];
      const targetMeasure = targetStaff?.measures[ghostMeasureIndex];

      if (targetMeasure) {
        // Find event that overlaps with ghost cursor's quant position
        let targetEvent = null;
        let targetQuant = 0;

        for (const e of targetMeasure.events) {
          const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
          const start = targetQuant;
          const end = targetQuant + duration;

          if (currentQuantStart >= start && currentQuantStart < end) {
            targetEvent = e;
            break;
          }
          targetQuant += duration;
        }

        if (targetEvent) {
          return {
            selection: {
              staffIndex: targetStaffIndex,
              measureIndex: ghostMeasureIndex,
              eventId: targetEvent.id,
              noteId: selectNoteInEventByDirection(targetEvent, direction),
              selectedNotes: [],
              anchor: null,
            },
            previewNote: null,
          };
        } else if (targetMeasure.events.length > 0) {
          // No overlapping event, but measure has events - select first event
          const firstEvent = targetMeasure.events[0];
          return {
            selection: {
              staffIndex: targetStaffIndex,
              measureIndex: ghostMeasureIndex,
              eventId: firstEvent.id,
              noteId: selectNoteInEventByDirection(firstEvent, direction),
              selectedNotes: [],
              anchor: null,
            },
            previewNote: null,
          };
        } else {
          // No events - move ghost cursor to target staff
          const defaultPitch = getDefaultPitchForClef(targetStaff.clef || 'treble');

          return {
            selection: {
              staffIndex: targetStaffIndex,
              measureIndex: null, // Ghost cursor: measure is in previewNote
              eventId: null,
              noteId: null,
              selectedNotes: [],
              anchor: null,
            },
            previewNote: {
              ...previewNote,
              staffIndex: targetStaffIndex,
              pitch: defaultPitch,
            },
          };
        }
      }
    }

    // At boundary - cycle to opposite staff (ghost cursor)
    // Guard: single-staff scores can't cycle
    if (score.staves.length <= 1) return null;

    const cycleStaffIndex = direction === 'up' ? score.staves.length - 1 : 0;
    const cycleStaff = score.staves[cycleStaffIndex];
    const cycleMeasure = cycleStaff?.measures[ghostMeasureIndex];

    // Cycle ghost cursor to opposite staff if measure exists and we're not already there
    if (cycleMeasure && cycleStaffIndex !== ghostStaffIndex) {
      const defaultPitch = getDefaultPitchForClef(cycleStaff.clef || 'treble');

      return {
        selection: {
          staffIndex: cycleStaffIndex,
          measureIndex: null, // Ghost cursor: measure is in previewNote
          eventId: null,
          noteId: null,
          selectedNotes: [],
          anchor: null,
        },
        previewNote: {
          ...previewNote,
          staffIndex: cycleStaffIndex,
          pitch: defaultPitch,
        },
      };
    }

    return null;
  }

  if (measureIndex === null || !eventId) return null;

  const currentStaff = score.staves[staffIndex];
  if (!currentStaff) return null;

  const measures = currentStaff.measures;
  const measure = measures[measureIndex];
  if (!measure) return null;

  // Find current event and its quant position
  let currentQuantStart = 0;
  const eventIdx = measure.events.findIndex((e: ScoreEvent) => {
    if (e.id === eventId) return true;
    currentQuantStart += getNoteDuration(e.duration, e.dotted, e.tuplet);
    return false;
  });

  if (eventIdx === -1) return null;

  const currentEvent = measure.events[eventIdx];
  const sortedNotes = currentEvent.notes?.length
    ? [...currentEvent.notes].sort((a: Note, b: Note) => getMidi(a.pitch ?? 'C4') - getMidi(b.pitch ?? 'C4'))
    : [];

  // 1. Try chord navigation first
  if (sortedNotes.length > 1 && selection.noteId) {
    const currentNoteIdx = sortedNotes.findIndex((n: Note) => n.id === selection.noteId);
    if (currentNoteIdx !== -1) {
      const newIdx = direction === 'up' ? currentNoteIdx + 1 : currentNoteIdx - 1;
      if (newIdx >= 0 && newIdx < sortedNotes.length) {
        // Navigate within chord
        return {
          selection: { ...selection, noteId: sortedNotes[newIdx].id },
          previewNote: null,
        };
      }
    }
  }

  // 2. At chord boundary - try cross-staff navigation
  const targetStaffIndex = direction === 'up' ? staffIndex - 1 : staffIndex + 1;
  const canSwitchStaff = targetStaffIndex >= 0 && targetStaffIndex < score.staves.length;

  if (canSwitchStaff) {
    const targetStaff = score.staves[targetStaffIndex];
    const targetMeasure = targetStaff.measures[measureIndex];

    if (targetMeasure) {
      // Find event that overlaps with current quant position
      let targetEvent = null;
      let targetQuant = 0;

      for (const e of targetMeasure.events) {
        const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
        const start = targetQuant;
        const end = targetQuant + duration;

        if (currentQuantStart >= start && currentQuantStart < end) {
          targetEvent = e;
          break;
        }
        targetQuant += duration;
      }

      if (targetEvent) {
        return {
          selection: {
            staffIndex: targetStaffIndex,
            measureIndex,
            eventId: targetEvent.id,
            noteId: selectNoteInEventByDirection(targetEvent, direction),
            selectedNotes: [],
            anchor: null,
          },
          previewNote: null,
        };
      } else {
        // No event at this quant - show ghost cursor with adjusted duration
        const totalQuants = calculateTotalQuants(targetMeasure.events);
        const availableQuants = currentQuantsPerMeasure - totalQuants;
        const adjusted = getAdjustedDuration(
          availableQuants,
          activeDuration,
          isDotted
        );

        if (adjusted) {
          const defaultPitch = getDefaultPitchForClef(targetStaff.clef || 'treble');

          return {
            selection: {
              staffIndex: targetStaffIndex,
              measureIndex: null, // Clear measureIndex for ghost cursor state
              eventId: null,
              noteId: null,
              selectedNotes: [],
              anchor: null,
            },
            previewNote: {
              measureIndex,
              staffIndex: targetStaffIndex,
              quant: totalQuants, // Position where ghost would be added
              visualQuant: totalQuants,
              pitch: defaultPitch,
              duration: adjusted.duration,
              dotted: adjusted.dotted,
              mode: 'APPEND',
              index: targetMeasure.events.length,
              isRest: false,
            },
          };
        }
      }
    }
  }

  // 3. At staff boundary (top or bottom) - cycle to opposite staff
  // Guard: single-staff scores can't cycle
  if (score.staves.length <= 1) return null;

  const cycleStaffIndex = direction === 'up' ? score.staves.length - 1 : 0;
  if (cycleStaffIndex === staffIndex) return null; // Already on this staff

  const cycleStaff = score.staves[cycleStaffIndex];
  const cycleMeasure = cycleStaff?.measures[measureIndex];

  if (cycleMeasure) {
    // Find event at current quant in cycle target
    const cycleEvent = findEventAtQuantPosition(cycleMeasure, currentQuantStart);

    if (cycleEvent) {
      return {
        selection: {
          staffIndex: cycleStaffIndex,
          measureIndex,
          eventId: cycleEvent.id,
          noteId: selectNoteInEventByDirection(cycleEvent, direction),
          selectedNotes: [],
          anchor: null,
        },
        previewNote: null,
      };
    } else {
      // No event - show ghost cursor with adjusted duration
      const totalQuants = calculateTotalQuants(cycleMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;
      const adjusted = getAdjustedDuration(
        availableQuants,
        activeDuration,
        isDotted
      );

      if (adjusted) {
        const defaultPitch = getDefaultPitchForClef(cycleStaff.clef || 'treble');

        return {
          selection: {
            staffIndex: cycleStaffIndex,
            measureIndex: null, // Clear for ghost cursor state
            eventId: null,
            noteId: null,
            selectedNotes: [],
            anchor: null,
          },
          previewNote: {
            measureIndex,
            staffIndex: cycleStaffIndex,
            quant: totalQuants,
            visualQuant: totalQuants,
            pitch: defaultPitch,
            duration: adjusted.duration,
            dotted: adjusted.dotted,
            mode: 'APPEND',
            index: cycleMeasure.events.length,
            isRest: false,
          },
        };
      }
    }
  }

  return null;
};
