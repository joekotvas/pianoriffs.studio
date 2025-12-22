/**
 * Horizontal Navigation Utilities
 *
 * Functions for calculating left/right keyboard navigation between events.
 * Handles standard navigation, ghost cursor mode, and cross-measure navigation.
 *
 * @tested interactionUtils.test.ts
 */

import { navigateSelection, calculateTotalQuants, getNoteDuration } from '../core';
import { CONFIG } from '@/config';
import {
  Measure,
  Note,
  ScoreEvent,
  PreviewNote,
  AudioFeedback,
  NavigationSelection,
  HorizontalNavigationResult,
  Selection as ScoreSelection,
} from '@/types';
import {
  getAppendPreviewNote,
  getDefaultPitchForClef,
  createGhostCursorResult,
} from './previewNote';
import { notesToAudioNotes } from './transposition';

/**
 * Adjusts requested duration to fit available space in a measure.
 * If the requested duration doesn't fit, returns the largest duration that does.
 *
 * @param availableQuants - Remaining quants in the measure
 * @param requestedDuration - The duration the user requested
 * @param isDotted - Whether the user requested a dotted duration
 * @returns Adjusted duration/dotted pair, or null if nothing fits
 *
 * @tested navigationHelpers.test.ts
 */
export const getAdjustedDuration = (
  availableQuants: number,
  requestedDuration: string,
  isDotted: boolean
): { duration: string; dotted: boolean } | null => {
  // If requested duration fits, use it
  if (getNoteDuration(requestedDuration, isDotted) <= availableQuants) {
    return { duration: requestedDuration, dotted: isDotted };
  }

  // Find largest duration that fits
  const durations = ['whole', 'half', 'quarter', 'eighth', 'sixteenth', 'thirtysecond'];
  for (const dur of durations) {
    if (getNoteDuration(dur, true) <= availableQuants) return { duration: dur, dotted: true };
    if (getNoteDuration(dur, false) <= availableQuants) return { duration: dur, dotted: false };
  }

  return null; // No duration fits
};

/**
 * Creates AudioFeedback from an event for playback.
 * Returns null for rests or events with no valid pitches.
 *
 * @internal
 */
const createAudioFeedback = (event: ScoreEvent): AudioFeedback | null => {
  if (event.isRest) return null;
  const audioNotes = notesToAudioNotes(event.notes);
  if (audioNotes.length === 0) return null;
  return { notes: audioNotes, duration: event.duration, dotted: event.dotted };
};

/**
 * Creates a navigation result for selecting an event.
 * Used when user navigates to an existing event in the score.
 *
 * @internal
 */
export const createEventResult = (
  staffIndex: number,
  measureIndex: number,
  event: ScoreEvent
): HorizontalNavigationResult => {
  const noteId = event.isRest || !event.notes?.length ? null : event.notes[0].id;
  return {
    selection: { staffIndex, measureIndex, eventId: event.id, noteId },
    previewNote: null,
    audio: createAudioFeedback(event),
    shouldCreateMeasure: false,
  };
};

/**
 * Calculates the next selection state for horizontal (left/right) keyboard navigation.
 * Handles multiple scenarios:
 * - Standard navigation between events
 * - Ghost cursor navigation (navigating while in preview/append mode)
 * - Cross-measure navigation
 * - Boundary checks (start/end of score)
 *
 * @param measures - The measures array for the current staff
 * @param selection - Current selection state
 * @param direction - 'left' or 'right'
 * @param previewNote - Current ghost cursor state, or null if selecting an event
 * @param activeDuration - The currently active note duration
 * @param isDotted - Whether the active duration is dotted
 * @param currentQuantsPerMeasure - Time signature quants (default: CONFIG.quantsPerMeasure)
 * @param clef - Clef for default pitch selection ('treble' or 'bass')
 * @param staffIndex - Index of the staff being navigated
 * @param inputMode - Whether user is entering notes or rests
 * @returns Navigation result with new selection/previewNote, or null if no change
 *
 * @tested interactionUtils.test.ts
 */
export const calculateNextSelection = (
  measures: Measure[],
  selection: NavigationSelection,
  direction: 'left' | 'right',
  previewNote: PreviewNote | null,
  activeDuration: string,
  isDotted: boolean,
  currentQuantsPerMeasure: number = CONFIG.quantsPerMeasure,
  clef: string = 'treble',
  staffIndex: number = 0,
  inputMode: 'NOTE' | 'REST' = 'NOTE'
): HorizontalNavigationResult | null => {
  // 1a. Ghost Left: Navigate left from ghost cursor
  if (selection.eventId === null && previewNote && direction === 'left') {
    const measureIndex = previewNote.measureIndex;
    const measure = measures[measureIndex];

    // For APPEND mode, quant represents the append position (after all events)
    // If quant is missing, calculate it from measure events
    const totalMeasureQuants = measure ? calculateTotalQuants(measure.events) : 0;
    const ghostQuant =
      previewNote.quant != null
        ? previewNote.quant
        : previewNote.mode === 'APPEND'
          ? totalMeasureQuants
          : 0;

    if (measure && measure.events.length > 0) {
      // Find the last event that ends at or before the ghost cursor's quant position
      let lastEventBeforeGhost = null;
      let eventQuant = 0;

      for (const e of measure.events) {
        const eventDuration = getNoteDuration(e.duration, e.dotted, e.tuplet);
        const eventEnd = eventQuant + eventDuration;

        // Check if this event ends at or before the ghost position
        if (eventEnd <= ghostQuant) {
          lastEventBeforeGhost = e;
        } else if (eventQuant < ghostQuant && ghostQuant < eventEnd) {
          // Ghost is in the middle of this event - select it
          lastEventBeforeGhost = e;
          break;
        }
        eventQuant += eventDuration;
      }

      if (lastEventBeforeGhost) {
        const noteId =
          lastEventBeforeGhost.isRest || !lastEventBeforeGhost.notes?.length
            ? null
            : lastEventBeforeGhost.notes[0].id;
        const audioNotes = notesToAudioNotes(lastEventBeforeGhost.notes);
        const audio: AudioFeedback | null =
          lastEventBeforeGhost.isRest || audioNotes.length === 0
            ? null
            : {
                notes: audioNotes,
                duration: lastEventBeforeGhost.duration,
                dotted: lastEventBeforeGhost.dotted,
              };
        return {
          selection: { staffIndex, measureIndex, eventId: lastEventBeforeGhost.id, noteId },
          previewNote: null,
          audio,
          shouldCreateMeasure: false,
        };
      }
    }

    // No events before ghost in current measure - go to previous measure
    if (measureIndex > 0) {
      // Navigate to previous measure
      const prevMeasure = measures[measureIndex - 1];
      const totalQuants = calculateTotalQuants(prevMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;

      // Try to get an adjusted duration that fits
      const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

      if (adjusted && availableQuants > 0) {
        // Move ghost cursor to append position in previous measure
        const pitch = previewNote.pitch || getDefaultPitchForClef(clef);
        return createGhostCursorResult(
          staffIndex,
          getAppendPreviewNote(
            prevMeasure,
            measureIndex - 1,
            staffIndex,
            adjusted.duration,
            adjusted.dotted,
            pitch,
            inputMode === 'REST'
          )
        );
      } else if (prevMeasure.events.length > 0) {
        // No space - select last event in previous measure
        const lastEvent = prevMeasure.events[prevMeasure.events.length - 1];
        const noteId = lastEvent.isRest || !lastEvent.notes?.length ? null : lastEvent.notes[0].id;
        const audioNotes = notesToAudioNotes(lastEvent.notes);
        const audio: AudioFeedback | null =
          lastEvent.isRest || audioNotes.length === 0
            ? null
            : { notes: audioNotes, duration: lastEvent.duration, dotted: lastEvent.dotted };
        return {
          selection: { staffIndex, measureIndex: measureIndex - 1, eventId: lastEvent.id, noteId },
          previewNote: null,
          audio,
          shouldCreateMeasure: false,
        };
      }
    }
  }

  // 1b. Ghost Right: Navigate right from ghost cursor to next measure
  if (selection.eventId === null && previewNote && direction === 'right') {
    const currentMeasureIndex = previewNote.measureIndex;
    const nextMeasureIndex = currentMeasureIndex + 1;

    if (nextMeasureIndex < measures.length) {
      const nextMeasure = measures[nextMeasureIndex];

      // First, check if next measure has events - select first event
      if (nextMeasure.events.length > 0) {
        return createEventResult(staffIndex, nextMeasureIndex, nextMeasure.events[0]);
      }

      // Next measure is empty - show ghost cursor with adjusted duration
      const totalQuants = calculateTotalQuants(nextMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;
      const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

      if (adjusted) {
        const pitch = previewNote.pitch || getDefaultPitchForClef(clef);
        return createGhostCursorResult(
          staffIndex,
          getAppendPreviewNote(
            nextMeasure,
            nextMeasureIndex,
            staffIndex,
            adjusted.duration,
            adjusted.dotted,
            pitch,
            inputMode === 'REST'
          )
        );
      }
    }
  }

  // 2a. Boundary Left: At first event → ghost cursor in previous measure
  if (direction === 'left' && selection.measureIndex !== null && selection.measureIndex > 0) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure?.events.findIndex(
      (e: ScoreEvent) => e.id === selection.eventId
    );

    if (eventIdx === 0) {
      // At first event - check if previous measure has space for ghost cursor
      const prevMeasure = measures[selection.measureIndex - 1];
      const totalQuants = calculateTotalQuants(prevMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;

      // Get adjusted duration that fits
      const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

      if (adjusted && availableQuants > 0) {
        // Move ghost cursor to append position in previous measure
        const currentEvent = currentMeasure.events[eventIdx];
        const pitch = currentEvent?.notes?.[0]?.pitch || getDefaultPitchForClef(clef);
        return createGhostCursorResult(
          staffIndex,
          getAppendPreviewNote(
            prevMeasure,
            selection.measureIndex - 1,
            staffIndex,
            adjusted.duration,
            adjusted.dotted,
            pitch,
            inputMode === 'REST'
          )
        );
      }
      // If no space or empty measure with no space, fall through to standard navigation
      // (which selects last note of previous measure)
    }
  }

  // 2b. Boundary Right: At last event → ghost cursor in current measure
  // This MUST come before navigateSelection so we don't skip to next measure
  if (direction === 'right' && selection.measureIndex !== null && selection.eventId) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure?.events.findIndex(
      (e: ScoreEvent) => e.id === selection.eventId
    );

    if (eventIdx === currentMeasure?.events.length - 1) {
      // At last event - check if current measure has space for ghost cursor
      const totalQuants = calculateTotalQuants(currentMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;

      if (availableQuants > 0) {
        const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

        if (adjusted) {
          const currentEvent = currentMeasure.events[eventIdx];
          const pitch =
            !currentEvent?.isRest && currentEvent?.notes?.length > 0 && currentEvent.notes[0].pitch
              ? currentEvent.notes[0].pitch
              : getDefaultPitchForClef(clef);

          return createGhostCursorResult(
            staffIndex,
            getAppendPreviewNote(
              currentMeasure,
              selection.measureIndex,
              staffIndex,
              adjusted.duration,
              adjusted.dotted,
              pitch,
              inputMode === 'REST'
            )
          );
        }
      }
      // No space or no fitting duration - fall through to standard navigation
    }
  }

  // 3. Standard Navigation
  const fullSelection: ScoreSelection = {
    staffIndex: selection.staffIndex,
    measureIndex: selection.measureIndex,
    eventId: selection.eventId,
    noteId: selection.noteId,
    selectedNotes: selection.selectedNotes ?? [],
    anchor: selection.anchor ?? null,
  };
  const newSelection = navigateSelection(measures, fullSelection, direction);

  if (newSelection !== selection) {
    // Find the event to play audio
    if (newSelection.measureIndex === null) {
      return {
        selection: { ...newSelection, staffIndex },
        previewNote: null,
        audio: null,
        shouldCreateMeasure: false,
      };
    }
    const measure = measures[newSelection.measureIndex];
    let audio: AudioFeedback | null = null;
    if (measure) {
      const event = measure.events.find((e: ScoreEvent) => e.id === newSelection.eventId);
      if (event) {
        if (newSelection.noteId) {
          const note = event.notes.find((n: Note) => n.id === newSelection.noteId);
          if (note && note.pitch) {
            audio = {
              notes: [{ pitch: note.pitch, id: note.id }],
              duration: event.duration,
              dotted: event.dotted,
            };
          }
        } else {
          const audioNotes = notesToAudioNotes(event.notes);
          if (audioNotes.length > 0) {
            audio = { notes: audioNotes, duration: event.duration, dotted: event.dotted };
          }
        }
      }
    }
    return {
      selection: { ...newSelection, staffIndex },
      previewNote: null,
      audio,
      shouldCreateMeasure: false,
    };
  }

  // 4. End of Score: Navigate right past last event → ghost or new measure
  if (direction === 'right' && selection.measureIndex !== null) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure.events.findIndex((e: ScoreEvent) => e.id === selection.eventId);

    if (eventIdx === currentMeasure.events.length - 1) {
      // We are at the last event, try to move to ghost note
      const totalQuants = calculateTotalQuants(currentMeasure.events);
      const currentEvent = currentMeasure.events[eventIdx];

      // Guard against undefined event (can happen if selection is stale)
      if (!currentEvent) {
        return null;
      }

      // Get pitch: from note if available, else default based on clef
      const defaultPitch = getDefaultPitchForClef(clef);
      const pitch: string =
        !currentEvent.isRest && currentEvent.notes?.length > 0 && currentEvent.notes[0].pitch
          ? currentEvent.notes[0].pitch
          : defaultPitch;

      if (totalQuants < currentQuantsPerMeasure) {
        // Move to ghost note in current measure with adjusted duration
        const availableQuants = currentQuantsPerMeasure - totalQuants;
        const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

        if (adjusted) {
          return createGhostCursorResult(
            staffIndex,
            getAppendPreviewNote(
              currentMeasure,
              selection.measureIndex,
              staffIndex,
              adjusted.duration,
              adjusted.dotted,
              pitch,
              inputMode === 'REST'
            )
          );
        }
        // If no duration fits, fall through to next measure below
      }

      // Move to next measure (either measure is full or no duration fits)
      const nextMeasureIndex = selection.measureIndex + 1;
      const shouldCreateMeasure = nextMeasureIndex >= measures.length;

      return {
        selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
        previewNote: {
          measureIndex: nextMeasureIndex,
          staffIndex,
          quant: 0,
          visualQuant: 0,
          pitch: pitch,
          duration: activeDuration,
          dotted: isDotted,
          mode: 'APPEND',
          index: 0,
          isRest: inputMode === 'REST',
        },
        shouldCreateMeasure,
        audio: null,
      };
    }
  }

  return null; // No change
};
