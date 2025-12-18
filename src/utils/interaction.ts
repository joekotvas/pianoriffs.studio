import { navigateSelection, calculateTotalQuants, getNoteDuration } from './core';
import { movePitchVisual, getMidi } from '@/services/MusicService';
import { CONFIG } from '@/config';
import { PIANO_RANGE } from '@/constants';

/**
 * Calculates the next selection state based on navigation direction.
 * Handles standard navigation, ghost note navigation, and boundary checks.
 *
 * @param measures - The current measures of the score
 * @param selection - The current selection state
 * @param direction - The direction of navigation ('left', 'right', 'up', 'down')
 * @param previewNote - The current preview note state (ghost cursor)
 * @param activeDuration - The currently active note duration
 * @param isDotted - Whether the currently active note is dotted
 * @param currentQuantsPerMeasure - The number of quants per measure
 * @returns An object containing the new selection, new previewNote, and optional audio feedback
 */

/**
 * Helper to generate the preview note state for appending to a measure.
 */
export const getAppendPreviewNote = (
  measure: any,
  measureIndex: number,
  staffIndex: number,
  activeDuration: string,
  isDotted: boolean,
  pitch?: string,
  isRest: boolean = false
) => {
  const totalQuants = calculateTotalQuants(measure.events || []);
  // Default pitch logic: try to use last event's pitch, or fallback
  let defaultPitch = pitch;
  if (!defaultPitch) {
    if (measure.events.length > 0) {
      const lastEvent = measure.events[measure.events.length - 1];
      // Skip rests when determining pitch
      if (!lastEvent.isRest && lastEvent.notes?.length > 0) {
        defaultPitch = lastEvent.notes[0].pitch;
      } else {
        defaultPitch = 'C4'; // Fallback for rests
      }
    } else {
      defaultPitch = 'C4'; // Validation fallback, caller should ideally provide better default based on clef
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

// ========== HELPER FUNCTIONS (Phase 1 DRY Refactoring) ==========

/**
 * Returns default pitch for a given clef.
 */
export const getDefaultPitchForClef = (clef: string): string =>
  clef === 'bass' ? 'C3' : 'C4';

/**
 * Finds an event at a specific quant position in a measure.
 * Returns the event that overlaps with the target quant, or null if none found.
 */
export const findEventAtQuantPosition = (measure: any, targetQuant: number): any | null => {
  if (!measure?.events?.length) return null;
  let quant = 0;
  for (const e of measure.events) {
    const dur = getNoteDuration(e.duration, e.dotted, e.tuplet);
    if (targetQuant >= quant && targetQuant < quant + dur) return e;
    quant += dur;
  }
  return null;
};

/**
 * Selects the appropriate note ID from an event based on direction.
 * Up = lowest note (bottom of chord), Down = highest note (top of chord).
 */
export const selectNoteInEventByDirection = (event: any, direction: 'up' | 'down'): string | null => {
  if (!event?.notes?.length) return null;
  const sorted = [...event.notes].sort((a: any, b: any) => getMidi(a.pitch) - getMidi(b.pitch));
  return direction === 'down' ? sorted[sorted.length - 1].id : sorted[0].id;
};

/**
 * Adjusts duration to fit available space in a measure.
 * Returns the largest duration that fits, or null if no duration fits.
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

export const calculateNextSelection = (
  measures: any[],
  selection: any,
  direction: string,
  previewNote: any,
  activeDuration: string,
  isDotted: boolean,
  currentQuantsPerMeasure: number = CONFIG.quantsPerMeasure,
  clef: string = 'treble',

  staffIndex: number = 0,
  inputMode: 'NOTE' | 'REST' = 'NOTE'
) => {
  // 1. Handle Navigation from Preview Note (Ghost Note)
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
        const audio = lastEventBeforeGhost.isRest
          ? null
          : {
              notes: lastEventBeforeGhost.notes,
              duration: lastEventBeforeGhost.duration,
              dotted: lastEventBeforeGhost.dotted,
            };
        return {
          selection: { staffIndex, measureIndex, eventId: lastEventBeforeGhost.id, noteId },
          previewNote: null,
          audio,
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
        return {
          selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
          previewNote: getAppendPreviewNote(
            prevMeasure,
            measureIndex - 1,
            staffIndex,
            adjusted.duration,
            adjusted.dotted,
            pitch,
            inputMode === 'REST'
          ),
          audio: null,
        };
      } else if (prevMeasure.events.length > 0) {
        // No space - select last event in previous measure
        const lastEvent = prevMeasure.events[prevMeasure.events.length - 1];
        const noteId = lastEvent.isRest || !lastEvent.notes?.length ? null : lastEvent.notes[0].id;
        const audio = lastEvent.isRest
          ? null
          : { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted };
        return {
          selection: { staffIndex, measureIndex: measureIndex - 1, eventId: lastEvent.id, noteId },
          previewNote: null,
          audio,
        };
      }
    }
  }

  // 1b. Handle Navigation from Ghost Note (Right Arrow - to next measure)
  if (selection.eventId === null && previewNote && direction === 'right') {
    const currentMeasureIndex = previewNote.measureIndex;
    const nextMeasureIndex = currentMeasureIndex + 1;

    if (nextMeasureIndex < measures.length) {
      const nextMeasure = measures[nextMeasureIndex];
      const totalQuants = calculateTotalQuants(nextMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;

      // Try to get an adjusted duration that fits
      const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

      if (adjusted) {
        // Move ghost cursor to next measure with adjusted duration
        const pitch = previewNote.pitch || getDefaultPitchForClef(clef);
        return {
          selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
          previewNote: getAppendPreviewNote(
            nextMeasure,
            nextMeasureIndex,
            staffIndex,
            adjusted.duration,
            adjusted.dotted,
            pitch,
            inputMode === 'REST'
          ),
          audio: null,
        };
      } else if (nextMeasure.events.length > 0) {
        // No space - select first event in next measure
        const firstEvent = nextMeasure.events[0];
        const noteId = firstEvent.isRest || !firstEvent.notes?.length ? null : firstEvent.notes[0].id;
        const audio = firstEvent.isRest
          ? null
          : { notes: firstEvent.notes, duration: firstEvent.duration, dotted: firstEvent.dotted };
        return {
          selection: { staffIndex, measureIndex: nextMeasureIndex, eventId: firstEvent.id, noteId },
          previewNote: null,
          audio,
        };
      }
    }
  }

  // 2. Handle Left from First Event (selected note → ghost cursor in previous measure)
  if (direction === 'left' && selection.measureIndex !== null && selection.measureIndex > 0) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure?.events.findIndex((e: any) => e.id === selection.eventId);

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
        return {
          selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
          previewNote: getAppendPreviewNote(
            prevMeasure,
            selection.measureIndex - 1,
            staffIndex,
            adjusted.duration,
            adjusted.dotted,
            pitch,
            inputMode === 'REST'
          ),
          audio: null,
        };
      }
      // If no space or empty measure with no space, fall through to standard navigation
      // (which selects last note of previous measure)
    }
  }

  // 3. Standard Navigation
  const newSelection = navigateSelection(measures, selection, direction, clef);

  if (newSelection !== selection) {
    // Find the event to play audio
    const measure = measures[newSelection.measureIndex];
    let audio = null;
    if (measure) {
      const event = measure.events.find((e: any) => e.id === newSelection.eventId);
      if (event) {
        if (newSelection.noteId) {
          const note = event.notes.find((n: any) => n.id === newSelection.noteId);
          if (note) audio = { notes: [note], duration: event.duration, dotted: event.dotted };
        } else {
          audio = { notes: event.notes, duration: event.duration, dotted: event.dotted };
        }
      }
    }
    return { selection: { ...newSelection, staffIndex }, previewNote: null, audio };
  }

  // 3. Handle Navigation Beyond Last Event (to Ghost Note or New Measure)
  if (direction === 'right' && selection.measureIndex !== null) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure.events.findIndex((e: any) => e.id === selection.eventId);

    if (eventIdx === currentMeasure.events.length - 1) {
      // We are at the last event, try to move to ghost note
      const totalQuants = calculateTotalQuants(currentMeasure.events);
      const currentEvent = currentMeasure.events[eventIdx];

      // Guard against undefined event (can happen if selection is stale)
      if (!currentEvent) {
        return null;
      }

      // Get pitch: from note if available, else default based on clef
      const defaultPitch = clef === 'bass' ? 'D3' : 'B4';
      const pitch =
        !currentEvent.isRest && currentEvent.notes?.length > 0
          ? currentEvent.notes[0].pitch
          : defaultPitch;

      if (totalQuants < currentQuantsPerMeasure) {
        // Move to ghost note in current measure with adjusted duration
        const availableQuants = currentQuantsPerMeasure - totalQuants;
        const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

        if (adjusted) {
          return {
            selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
            previewNote: getAppendPreviewNote(
              currentMeasure,
              selection.measureIndex,
              staffIndex,
              adjusted.duration,
              adjusted.dotted,
              pitch,
              inputMode === 'REST'
            ),
            audio: null,
          };
        }
        // If no duration fits, fall through to next measure
      } else {
        // Move to next measure
        const nextMeasureIndex = selection.measureIndex + 1;
        // Check if next measure exists, if not we signal to create it
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
  }

  return null; // No change
};

/**
 * Calculates transposition for selected notes.
 * @param {Array} measures - List of measures
 * @param {Object} selection - Current selection
 * @param {number} steps - Visual steps to move (positive or negative)
 * @param {string} keySignature - Key signature root
 * @param {string} clef - Clef for pitch range clamping ('treble' or 'bass')
 * @returns {Object|null} Object containing new measures and the modified event, or null if no change
 */
export const calculateTransposition = (
  measures: any[],
  selection: any,
  steps: number,
  keySignature: string = 'C'
) => {
  const { measureIndex, eventId, noteId } = selection;
  if (measureIndex === null || !eventId) return null;

  const newMeasures = [...measures];
  const measure = { ...newMeasures[measureIndex] };
  const events = [...measure.events];
  const eventIdx = events.findIndex((e: any) => e.id === eventId);

  if (eventIdx === -1) return null;

  const event = { ...events[eventIdx] };
  const notes = [...event.notes];

  const modifyNote = (note: any) => {
    // Use movePitchVisual with piano range for clamping
    const newPitch = movePitchVisual(note.pitch, steps, keySignature, PIANO_RANGE);
    return { ...note, pitch: newPitch };
  };

  if (noteId) {
    const noteIdx = notes.findIndex((n: any) => n.id === noteId);
    if (noteIdx !== -1) {
      notes[noteIdx] = modifyNote(notes[noteIdx]);
    }
  } else {
    notes.forEach((n: any, i: number) => {
      notes[i] = modifyNote(n);
    });
  }

  event.notes = notes;
  events[eventIdx] = event;
  measure.events = events;
  newMeasures[measureIndex] = measure;

  return { measures: newMeasures, event };
};

/**
 * Calculates transposition for selected notes or the preview note.
 *
 * @param measures - The current measures of the score
 * @param selection - The current selection state
 * @param previewNote - The current preview note state
 * @param direction - The direction of transposition ('up', 'down')
 * @param isShift - Whether shift key is pressed (octave jump)
 * @param keySignature - The current key signature (default 'C')
 * @returns An object containing the new measures (if changed), new previewNote (if changed), and audio feedback
 */
export const calculateTranspositionWithPreview = (
  measures: any[],
  selection: any,
  previewNote: any,
  direction: string,
  isShift: boolean,
  keySignature: string = 'C'
) => {
  // Determine steps (Visual Movement)
  // Up = 1, Down = -1. Shift = 7 (Octave)
  let steps = direction === 'up' ? 1 : -1;
  if (isShift) steps *= 7;

  // 1. Handle Preview Note (Ghost Note)
  if (selection.eventId === null && previewNote) {
    const newPitch = movePitchVisual(previewNote.pitch, steps, keySignature, PIANO_RANGE);
    if (newPitch !== previewNote.pitch) {
      return {
        previewNote: { ...previewNote, pitch: newPitch },
        audio: {
          notes: [{ pitch: newPitch }],
          duration: previewNote.duration,
          dotted: previewNote.dotted,
        },
      };
    }
    return null;
  }

  // 2. Handle Selection Transposition
  const result = calculateTransposition(measures, selection, steps, keySignature);

  if (result) {
    const { measures: newMeasures, event } = result;
    let audio = null;
    if (selection.noteId) {
      const note = event.notes.find((n: any) => n.id === selection.noteId);
      if (note) audio = { notes: [note], duration: event.duration, dotted: event.dotted };
    } else {
      audio = { notes: event.notes, duration: event.duration, dotted: event.dotted };
    }
    return { measures: newMeasures, audio };
  }

  return null;
};

/**
 * Calculates the cross-staff selection based on quant alignment.
 * Finds the closest event in the target staff that overlaps with the current selection's absolute quant.
 *
 * @param score - The complete score object
 * @param selection - The current selection state
 * @param direction - 'up' or 'down'
 * @returns {Object|null} New selection object or null if invalid move
 */
export const calculateCrossStaffSelection = (
  score: any,
  selection: any,
  direction: string,
  activeDuration: string = 'quarter',
  isDotted: boolean = false
) => {
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
  const currentEvent = currentMeasure.events.find((e: any) => {
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
    let defaultPitch = 'C4';
    if (clef === 'bass') defaultPitch = 'C3';
    if (clef === 'alto') defaultPitch = 'C4';

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
 * Unified vertical navigation for CMD+Up/Down.
 * Handles: 1) Chord traversal, 2) Cross-staff switching, 3) Cycling at boundaries.
 * Also supports ghost cursor navigation.
 *
 * @param score - The complete score object
 * @param selection - The current selection state
 * @param direction - 'up' or 'down'
 * @param activeDuration - Active note duration for ghost cursor
 * @param isDotted - Whether note is dotted
 * @param previewNote - Optional preview note (ghost cursor state)
 * @returns Navigation result with selection/previewNote, or null if no change
 */
export const calculateVerticalNavigation = (
  score: any,
  selection: any,
  direction: 'up' | 'down',
  activeDuration: string = 'quarter',
  isDotted: boolean = false,
  previewNote: any = null
) => {
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
              measureIndex: ghostMeasureIndex,
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

    if (cycleMeasure && cycleStaffIndex !== ghostStaffIndex) {
      const defaultPitch = getDefaultPitchForClef(cycleStaff.clef || 'treble');

      return {
        selection: {
          staffIndex: cycleStaffIndex,
          measureIndex: ghostMeasureIndex,
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
  const eventIdx = measure.events.findIndex((e: any) => {
    if (e.id === eventId) return true;
    currentQuantStart += getNoteDuration(e.duration, e.dotted, e.tuplet);
    return false;
  });

  if (eventIdx === -1) return null;

  const currentEvent = measure.events[eventIdx];
  const sortedNotes = currentEvent.notes?.length
    ? [...currentEvent.notes].sort((a: any, b: any) => getMidi(a.pitch) - getMidi(b.pitch))
    : [];

  // 1. Try chord navigation first
  if (sortedNotes.length > 1 && selection.noteId) {
    const currentNoteIdx = sortedNotes.findIndex((n: any) => n.id === selection.noteId);
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
        // No event at this quant - show ghost cursor
        const defaultPitch = getDefaultPitchForClef(targetStaff.clef || 'treble');

        return {
          selection: {
            staffIndex: targetStaffIndex,
            measureIndex,
            eventId: null,
            noteId: null,
            selectedNotes: [],
            anchor: null,
          },
          previewNote: getAppendPreviewNote(
            targetMeasure,
            measureIndex,
            targetStaffIndex,
            activeDuration,
            isDotted,
            defaultPitch
          ),
        };
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
      // No event - show ghost cursor
      const defaultPitch = getDefaultPitchForClef(cycleStaff.clef || 'treble');

      return {
        selection: {
          staffIndex: cycleStaffIndex,
          measureIndex,
          eventId: null,
          noteId: null,
          selectedNotes: [],
          anchor: null,
        },
        previewNote: getAppendPreviewNote(
          cycleMeasure,
          measureIndex,
          cycleStaffIndex,
          activeDuration,
          isDotted,
          defaultPitch
        ),
      };
    }
  }

  return null;
};
