/**
 * useDerivedSelection
 *
 * Computes derived selection metadata from the current selection state.
 * Extracts durations, dots, ties, and accidentals from selected notes/events.
 *
 * @see useScoreLogic - Orchestrator that uses this hook
 */

import { useMemo } from 'react';
import { Selection, Score, ScoreEvent, getActiveStaff } from '@/types';

/**
 * Return type for derived selection metadata
 */
export interface DerivedSelectionResult {
  /** Unique durations of selected events */
  selectedDurations: string[];
  /** Unique dotted states of selected events */
  selectedDots: boolean[];
  /** Unique tie states of selected notes */
  selectedTies: boolean[];
  /** Unique accidental types of selected notes */
  selectedAccidentals: string[];
}

/**
 * Computes derived selection metadata.
 *
 * @param score - Current score state
 * @param selection - Current selection state
 * @param editorState - Current editor mode
 * @returns Object with arrays of unique durations, dots, ties, and accidentals
 *
 * @internal
 */
export const useDerivedSelection = (
  score: Score,
  selection: Selection,
  editorState: string
): DerivedSelectionResult => {
  const selectedDurations = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const durations = new Set<string>();

    const addFromEvent = (measureIndex: number, eventId: string | number, staffIndex: number) => {
      const staff = score.staves[staffIndex] || getActiveStaff(score);
      const measure = staff.measures[measureIndex];
      const event = measure?.events.find((e: ScoreEvent) => e.id === eventId);
      if (event) durations.add(event.duration);
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => {
        addFromEvent(n.measureIndex, n.eventId, n.staffIndex);
      });
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
      addFromEvent(selection.measureIndex, selection.eventId, staffIndex);
    }

    return Array.from(durations);
  }, [selection, score, editorState]);

  const selectedDots = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const dots = new Set<boolean>();

    const addFromEvent = (measureIndex: number, eventId: string | number, staffIndex: number) => {
      const staff = score.staves[staffIndex] || getActiveStaff(score);
      const measure = staff.measures[measureIndex];
      const event = measure?.events.find((e: ScoreEvent) => e.id === eventId);
      if (event) dots.add(!!event.dotted);
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => addFromEvent(n.measureIndex, n.eventId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
      addFromEvent(selection.measureIndex, selection.eventId, staffIndex);
    }
    return Array.from(dots);
  }, [selection, score, editorState]);

  const selectedTies = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const ties = new Set<boolean>();

    const addFromNote = (
      measureIndex: number,
      eventId: string | number,
      noteId: string | number | null,
      staffIndex: number
    ) => {
      const staff = score.staves[staffIndex] || getActiveStaff(score);
      const measure = staff.measures[measureIndex];
      const event = measure?.events.find((e: ScoreEvent) => e.id === eventId);
      if (event) {
        if (noteId) {
          const note = event.notes.find((n) => n.id === noteId);
          if (note) ties.add(!!note.tied);
        } else {
          event.notes.forEach((n) => ties.add(!!n.tied));
        }
      }
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) =>
        addFromNote(n.measureIndex, n.eventId, n.noteId, n.staffIndex)
      );
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
      addFromNote(selection.measureIndex, selection.eventId, selection.noteId, staffIndex);
    }
    return Array.from(ties);
  }, [selection, score, editorState]);

  const selectedAccidentals = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const accidentals = new Set<string>();

    const getAccidentalType = (pitch: string): string => {
      const match = pitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
      if (!match) return 'natural';
      const acc = match[2];
      if (acc?.startsWith('#')) return 'sharp';
      if (acc?.startsWith('b')) return 'flat';
      return 'natural';
    };

    const addFromNote = (
      measureIndex: number,
      eventId: string | number,
      noteId: string | number | null,
      staffIndex: number
    ) => {
      const staff = score.staves[staffIndex] || getActiveStaff(score);
      const measure = staff.measures[measureIndex];
      const event = measure?.events.find((e: ScoreEvent) => e.id === eventId);
      if (event) {
        if (noteId) {
          const note = event.notes.find((n) => n.id === noteId);
          if (note && note.pitch !== null) accidentals.add(getAccidentalType(note.pitch));
        } else {
          event.notes.forEach((n) => {
            if (n.pitch !== null) accidentals.add(getAccidentalType(n.pitch));
          });
        }
      }
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) =>
        addFromNote(n.measureIndex, n.eventId, n.noteId, n.staffIndex)
      );
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
      addFromNote(selection.measureIndex, selection.eventId, selection.noteId, staffIndex);
    }
    return Array.from(accidentals);
  }, [selection, score, editorState]);

  return {
    selectedDurations,
    selectedDots,
    selectedTies,
    selectedAccidentals,
  };
};
