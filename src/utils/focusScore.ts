import { Score, Selection, getActiveStaff } from '@/types';
import { calculateTotalQuants } from './core';
import { TIME_SIGNATURES } from '@/constants';

/** Creates an empty selection at the given position */
const createSelection = (
  measureIndex: number | null,
  eventId: string | number | null = null,
  noteId: string | number | null = null
): Selection => ({
  staffIndex: 0,
  measureIndex,
  eventId,
  noteId,
  selectedNotes: [],
});

/** Checks if an event still exists in the score */
const isSelectionValid = (score: Score, selection: Selection): boolean => {
  if (!selection.eventId || selection.measureIndex === null) return false;

  const staff = score.staves[selection.staffIndex || 0];
  const measure = staff?.measures[selection.measureIndex];
  return measure?.events.some((e: any) => e.id === selection.eventId) ?? false;
};

/**
 * Calculates the selection state for focusing the score.
 *
 * 1. Preserve valid selection (focus memory)
 * 2. Otherwise, position at first available entry point
 */
export function calculateFocusSelection(score: Score, existingSelection: Selection): Selection {
  // Preserve valid selection (focus memory)
  if (isSelectionValid(score, existingSelection)) {
    return existingSelection;
  }

  // Find first available entry point
  const activeStaff = getActiveStaff(score, 0);

  if (!activeStaff.measures?.length) {
    return createSelection(null);
  }

  const quantsPerMeasure =
    TIME_SIGNATURES[score.timeSignature as keyof typeof TIME_SIGNATURES] || 64;

  for (let i = 0; i < activeStaff.measures.length; i++) {
    const measure = activeStaff.measures[i];

    // Empty measure
    if (!measure.events?.length) {
      return createSelection(i);
    }

    // Incomplete measure - position after last event
    if (calculateTotalQuants(measure.events) < quantsPerMeasure) {
      const lastEvent = measure.events.at(-1)!;
      return createSelection(i, lastEvent.id, lastEvent.notes?.[0]?.id ?? null);
    }
  }

  // All measures full - position at end
  const lastIdx = activeStaff.measures.length - 1;
  const lastEvent = activeStaff.measures[lastIdx].events.at(-1);

  return createSelection(lastIdx, lastEvent?.id ?? null, lastEvent?.notes?.[0]?.id ?? null);
}
