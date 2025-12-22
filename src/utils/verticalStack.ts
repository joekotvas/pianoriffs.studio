/**
 * Vertical Stack Utilities
 *
 * Shared utilities for vertical selection operations. These functions
 * handle the spatial representation of notes in vertical space, enabling
 * operations like vertical extension, navigation, and range selection.
 *
 * @see ExtendSelectionVerticallyCommand
 * @tested verticalStack.test.ts
 */

import type { Score, SelectedNote, ScoreEvent } from '../types';
import { getNoteDuration } from './core';
import { getMidi } from '../services/MusicService';
import { getClefConfig } from '../constants';

/**
 * Get the default MIDI value for a rest in a given clef.
 * Used for vertical stack sorting.
 *
 * @see CLEF_CONFIG in constants.ts
 */
const getRestMidi = (clef: string): number => {
  const config = getClefConfig(clef);
  return config.restMidi;
};

// =============================================================================
// TYPES
// =============================================================================

/**
 * Represents a note's position in vertical space.
 * Used for sorting and comparison in vertical operations.
 */
export interface VerticalPoint {
  measureIndex: number;
  staffIndex: number;
  eventId: string | number;
  noteId: string | number | null;
  /** MIDI pitch value (higher = higher pitch) */
  midi: number;
  /** Global quant time: measureIndex * 100000 + quant */
  time: number;
}

// =============================================================================
// FUNCTIONS
// =============================================================================

/**
 * Calculate a linear metric for vertical ordering.
 *
 * Formula: (100 - staffIndex) * 1000 + midi
 * - Staff contribution: treble (0) = 100000, bass (1) = 99000
 * - MIDI contribution: 0-127 range
 *
 * This ensures all treble notes are "above" all bass notes,
 * and within each staff, higher pitches have higher values.
 *
 * Uses 100 as base to support scores with up to 100 staves
 * before ordering inverts (sufficient for orchestral scores).
 *
 * @param staffIndex - Staff index (0 = treble, 1 = bass)
 * @param midi - MIDI pitch value (0-127)
 * @returns Combined metric suitable for vertical sorting
 */
export function calculateVerticalMetric(staffIndex: number, midi: number): number {
  return (100 - staffIndex) * 1000 + midi;
}

/**
 * Convert a SelectedNote to a VerticalPoint with pitch and time info.
 *
 * Walks through measure events to calculate the quant time,
 * then resolves the MIDI pitch from the note data.
 *
 * @param note - The selected note to convert
 * @param score - Full score for context
 * @returns VerticalPoint with all positioning info, or null if not found
 */
export function toVerticalPoint(note: SelectedNote, score: Score): VerticalPoint | null {
  const staff = score.staves[note.staffIndex];
  if (!staff) return null;
  const measure = staff.measures[note.measureIndex];
  if (!measure) return null;

  // Find event and time
  let time = 0;
  let foundEvent: ScoreEvent | undefined;
  let currentQuant = 0;

  for (const e of measure.events) {
    const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
    if (e.id === note.eventId) {
      foundEvent = e;
      time = note.measureIndex * 100000 + currentQuant;
      break;
    }
    currentQuant += duration;
  }

  if (!foundEvent) return null;

  // Resolve pitch
  let midi = 60; // Default
  let realNoteId = note.noteId;

  if (foundEvent.isRest) {
    midi = getRestMidi(staff.clef);
  } else if (note.noteId) {
    const n = foundEvent.notes.find((n) => n.id === note.noteId);
    if (n) midi = getMidi(n.pitch || 'C4');
  } else if (foundEvent.notes.length > 0) {
    midi = getMidi(foundEvent.notes[0].pitch || 'C4');
    realNoteId = foundEvent.notes[0].id;
  }

  return {
    measureIndex: note.measureIndex,
    staffIndex: note.staffIndex,
    eventId: note.eventId,
    noteId: realNoteId,
    midi,
    time,
  };
}

/**
 * Collect all notes at a specific time across all staves.
 *
 * Finds events at the exact quant position in each staff's measure,
 * creating a "vertical stack" of all notes that could be selected.
 * Results are sorted from highest to lowest (visual top to bottom).
 *
 * @param score - Full score to search
 * @param globalTime - Global time (measureIndex * 100000 + quant)
 * @returns Array of VerticalPoints sorted by descending metric (top to bottom)
 */
export function collectVerticalStack(score: Score, globalTime: number): VerticalPoint[] {
  const stack: VerticalPoint[] = [];

  const mIndex = Math.floor(globalTime / 100000);
  const timeQuant = globalTime % 100000;

  for (let sIdx = 0; sIdx < score.staves.length; sIdx++) {
    const staff = score.staves[sIdx];
    const measure = staff.measures[mIndex];
    if (!measure) continue;

    let q = 0;
    for (const event of measure.events) {
      const dur = getNoteDuration(event.duration, event.dotted, event.tuplet);

      if (q === timeQuant) {
        // Handle Rests - they have notes array with pitch: null
        // IMPORTANT: Rests DO have noteId in their notes array
        if (event.isRest && event.notes && event.notes.length > 0) {
          const restNote = event.notes[0];
          const midi = getRestMidi(staff.clef);
          stack.push({
            staffIndex: sIdx,
            measureIndex: mIndex,
            eventId: event.id,
            noteId: restNote.id,
            midi: midi,
            time: globalTime,
          });
        }
        // Handle regular notes
        else if (event.notes) {
          for (const note of event.notes) {
            stack.push({
              staffIndex: sIdx,
              measureIndex: mIndex,
              eventId: event.id,
              noteId: note.id,
              midi: getMidi(note.pitch || 'C4'),
              time: globalTime,
            });
          }
        }
      }

      q += dur;

      // OPTIMIZATION: Early break if we've passed the target quant
      if (q > timeQuant) break;
    }
  }

  // Sort High to Low (Visual Top to Bottom)
  return stack.sort((a, b) => {
    const mA = calculateVerticalMetric(a.staffIndex, a.midi);
    const mB = calculateVerticalMetric(b.staffIndex, b.midi);
    return mB - mA; // Descending
  });
}

/** Direction for vertical cursor movement */
export type VerticalDirection = 'up' | 'down' | 'all';

/**
 * Move the cursor one step in the vertical stack.
 *
 * Given the current cursor position in the stack, moves it
 * up (toward index 0) or down (toward end) by one step.
 * Direction 'all' moves to the bottom of the stack.
 *
 * @param stack - Sorted vertical stack (top to bottom)
 * @param current - Current cursor position
 * @param direction - Direction to move: 'up', 'down', or 'all'
 * @returns New cursor position, or current if at boundary or not found
 */
export function moveCursorInStack(
  stack: VerticalPoint[],
  current: VerticalPoint,
  direction: VerticalDirection
): VerticalPoint {
  if (stack.length === 0) return current;

  // Find index
  const idx = stack.findIndex(
    (p) =>
      p.staffIndex === current.staffIndex &&
      p.eventId === current.eventId &&
      p.noteId === current.noteId
  );

  if (idx === -1) {
    return current;
  }

  let newIdx = idx;
  if (direction === 'up') {
    newIdx = Math.max(0, idx - 1);
  } else if (direction === 'down') {
    newIdx = Math.min(stack.length - 1, idx + 1);
  } else if (direction === 'all') {
    newIdx = stack.length - 1;
  }

  return stack[newIdx];
}

/**
 * Compare two SelectedNote arrays for equality.
 *
 * Order-independent comparison using composite keys.
 * Used to detect if selection has changed externally.
 *
 * @param a - First selection array
 * @param b - Second selection array
 * @returns True if both arrays contain the same notes (regardless of order)
 */
export function selectionsMatch(a: SelectedNote[], b: SelectedNote[]): boolean {
  if (a.length !== b.length) return false;

  const toKey = (n: SelectedNote) => `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`;

  const setA = new Set(a.map(toKey));
  return b.every((note) => setA.has(toKey(note)));
}
