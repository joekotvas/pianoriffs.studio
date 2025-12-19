import { navigateSelection, calculateTotalQuants, getNoteDuration } from './core';
import { movePitchVisual, getMidi } from '@/services/MusicService';
import { CONFIG } from '@/config';
import { PIANO_RANGE } from '@/constants';
import {
  Measure,
  Note,
  Score,
  ScoreEvent,
  PreviewNote,
  AudioFeedback,
  NavigationSelection,
  HorizontalNavigationResult,
  VerticalNavigationResult,
  TranspositionResult,
} from '@/types';

// ========== PREVIEW NOTE HELPERS ==========

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

// ========== HELPER FUNCTIONS ==========

/**
 * Returns the default pitch for a given clef.
 * Used for initializing ghost cursors when no previous pitch context exists.
 *
 * @param clef - The clef type ('treble', 'bass', etc.)
 * @returns 'C3' for bass clef, 'C4' for all others
 *
 * @tested navigationHelpers.test.ts
 */
export const getDefaultPitchForClef = (clef: string): string =>
  clef === 'bass' ? 'C3' : 'C4';

/**
 * Converts Note[] to AudioFeedback-compatible notes array.
 * Filters out notes with null pitches (rests shouldn't produce audio).
 *
 * @internal
 */
const notesToAudioNotes = (
  notes: Note[] | undefined
): Array<{ pitch: string; id?: string | number }> => {
  if (!notes) return [];
  return notes
    .filter((n): n is Note & { pitch: string } => n.pitch !== null)
    .map((n) => ({ pitch: n.pitch, id: n.id }));
};

/**
 * Finds an event at a specific quant position in a measure.
 * Used by cross-staff navigation to find aligned events.
 *
 * @param measure - The measure to search in
 * @param targetQuant - The quant position to find (0 = start of measure)
 * @returns The event that overlaps with the target quant, or null if none found
 *
 * @tested navigationHelpers.test.ts
 */
export const findEventAtQuantPosition = (
  measure: Measure | null | undefined,
  targetQuant: number
): ScoreEvent | null => {
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
 * Selects the entry-point note when landing on a chord during cross-staff navigation.
 * When moving UP to a higher staff, selects the lowest note (to continue upward).
 * When moving DOWN to a lower staff, selects the highest note (to continue downward).
 *
 * @param event - The event containing the chord
 * @param direction - 'up' or 'down'
 * @returns Note ID to select, or null if event is a rest/has no notes
 *
 * @tested navigationHelpers.test.ts
 */
export const selectNoteInEventByDirection = (
  event: ScoreEvent | null | undefined,
  direction: 'up' | 'down'
): string | number | null => {
  if (!event?.notes?.length || event.isRest) return null;
  const sorted = [...event.notes].sort(
    (a: Note, b: Note) => getMidi(a.pitch || 'C4') - getMidi(b.pitch || 'C4')
  );
  return direction === 'down' ? sorted[sorted.length - 1].id : sorted[0].id;
};

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
 * Creates a navigation result for ghost cursor mode (no event selected).
 * Used when user navigates into empty space within a measure.
 *
 * @internal
 */
const createGhostCursorResult = (
  staffIndex: number,
  previewNote: PreviewNote
): HorizontalNavigationResult => ({
  selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
  previewNote,
  audio: null,
  shouldCreateMeasure: false,
});

/**
 * Creates a navigation result for selecting an event.
 * Used when user navigates to an existing event in the score.
 *
 * @internal
 */
const createEventResult = (
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

// ========== MAIN NAVIGATION FUNCTIONS ==========

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
        const audioNotes = notesToAudioNotes(lastEventBeforeGhost.notes);
        const audio: AudioFeedback | null = lastEventBeforeGhost.isRest || audioNotes.length === 0
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
        const audio: AudioFeedback | null = lastEvent.isRest || audioNotes.length === 0
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

  // 1b. Handle Navigation from Ghost Note (Right Arrow - to next measure)
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

  // 2. Handle Left from First Event (selected note → ghost cursor in previous measure)
  if (direction === 'left' && selection.measureIndex !== null && selection.measureIndex > 0) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure?.events.findIndex((e: ScoreEvent) => e.id === selection.eventId);

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

  // 2b. Handle Right from Last Event (selected note → ghost cursor in current measure)
  // This MUST come before navigateSelection so we don't skip to next measure
  if (direction === 'right' && selection.measureIndex !== null && selection.eventId) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure?.events.findIndex((e: ScoreEvent) => e.id === selection.eventId);

    if (eventIdx === currentMeasure?.events.length - 1) {
      // At last event - check if current measure has space for ghost cursor
      const totalQuants = calculateTotalQuants(currentMeasure.events);
      const availableQuants = currentQuantsPerMeasure - totalQuants;

      if (availableQuants > 0) {
        const adjusted = getAdjustedDuration(availableQuants, activeDuration, isDotted);

        if (adjusted) {
          const currentEvent = currentMeasure.events[eventIdx];
          const pitch =
            !currentEvent?.isRest && currentEvent?.notes?.length > 0
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
              pitch || getDefaultPitchForClef(clef),
              inputMode === 'REST'
            )
          );
        }
      }
      // No space or no fitting duration - fall through to standard navigation
    }
  }

  // 3. Standard Navigation
  const newSelection = navigateSelection(measures, selection, direction);

  if (newSelection !== selection) {
    // Find the event to play audio
    const measure = measures[newSelection.measureIndex];
    let audio: AudioFeedback | null = null;
    if (measure) {
      const event = measure.events.find((e: ScoreEvent) => e.id === newSelection.eventId);
      if (event) {
        if (newSelection.noteId) {
          const note = event.notes.find((n: Note) => n.id === newSelection.noteId);
          if (note && note.pitch) {
            audio = { notes: [{ pitch: note.pitch, id: note.id }], duration: event.duration, dotted: event.dotted };
          }
        } else {
          const audioNotes = notesToAudioNotes(event.notes);
          if (audioNotes.length > 0) {
            audio = { notes: audioNotes, duration: event.duration, dotted: event.dotted };
          }
        }
      }
    }
    return { selection: { ...newSelection, staffIndex }, previewNote: null, audio, shouldCreateMeasure: false };
  }

  // 3. Handle Navigation Beyond Last Event (to Ghost Note or New Measure)
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

/**
 * Calculates transposition for selected notes.
 * Moves notes by visual steps (diatonic intervals) while respecting key signature.
 *
 * @param measures - Array of measures to modify
 * @param selection - Current selection (must have valid measureIndex and eventId)
 * @param steps - Visual steps to move (positive = up, negative = down)
 * @param keySignature - Key signature root for diatonic movement (default: 'C')
 * @returns Object with modified measures and event, or null if invalid selection
 */
export const calculateTransposition = (
  measures: Measure[],
  selection: NavigationSelection,
  steps: number,
  keySignature: string = 'C'
): { measures: Measure[]; event: ScoreEvent } | null => {
  const { measureIndex, eventId, noteId } = selection;
  if (measureIndex === null || !eventId) return null;

  const newMeasures = [...measures];
  const measure = { ...newMeasures[measureIndex] };
  const events = [...measure.events];
  const eventIdx = events.findIndex((e: ScoreEvent) => e.id === eventId);

  if (eventIdx === -1) return null;

  const event = { ...events[eventIdx] };
  const notes = [...event.notes];

  const modifyNote = (note: Note): Note => {
    // Use movePitchVisual with piano range for clamping
    const newPitch = movePitchVisual(note.pitch ?? 'C4', steps, keySignature, PIANO_RANGE);
    return { ...note, pitch: newPitch };
  };

  if (noteId) {
    const noteIdx = notes.findIndex((n: Note) => n.id === noteId);
    if (noteIdx !== -1) {
      notes[noteIdx] = modifyNote(notes[noteIdx]);
    }
  } else {
    notes.forEach((n: Note, i: number) => {
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
 * Handles both ghost cursor pitch changes and actual note transposition.
 *
 * @param measures - The current measures of the score
 * @param selection - The current selection state
 * @param previewNote - The current preview note state (for ghost cursor)
 * @param direction - 'up' or 'down'
 * @param isShift - Whether shift key is pressed (octave jump: 7 steps)
 * @param keySignature - The current key signature (default 'C')
 * @returns New measures/previewNote with audio feedback, or null if no change
 *
 * @tested interactionUtils.test.ts
 */
export const calculateTranspositionWithPreview = (
  measures: Measure[],
  selection: NavigationSelection,
  previewNote: PreviewNote | null,
  direction: 'up' | 'down',
  isShift: boolean,
  keySignature: string = 'C'
): TranspositionResult | null => {
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
    let audio: AudioFeedback | null = null;
    if (selection.noteId) {
      const note = event.notes.find((n: Note) => n.id === selection.noteId);
      if (note && note.pitch) {
        audio = { notes: [{ pitch: note.pitch, id: note.id }], duration: event.duration, dotted: event.dotted };
      }
    } else {
      const audioNotes = notesToAudioNotes(event.notes);
      if (audioNotes.length > 0) {
        audio = { notes: audioNotes, duration: event.duration, dotted: event.dotted };
      }
    }
    return { measures: newMeasures, audio };
  }

  return null;
};

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
