/**
 * Transposition Utilities
 *
 * Functions for calculating pitch transposition on notes and chords.
 *
 * @tested interactionUtils.test.ts
 */

import { movePitchVisual } from '@/services/MusicService';
import { PIANO_RANGE } from '@/constants';
import {
  Measure,
  Note,
  ScoreEvent,
  PreviewNote,
  AudioFeedback,
  NavigationSelection,
  TranspositionResult,
} from '@/types';

/**
 * Converts Note[] to AudioFeedback-compatible notes array.
 * Filters out notes with null pitches (rests shouldn't produce audio).
 *
 * @internal
 */
export const notesToAudioNotes = (
  notes: Note[] | undefined
): Array<{ pitch: string; id?: string }> => {
  if (!notes) return [];
  return notes
    .filter((n): n is Note & { pitch: string } => n.pitch !== null)
    .map((n) => ({ pitch: n.pitch, id: n.id }));
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
    return { measures: newMeasures, audio };
  }

  return null;
};
