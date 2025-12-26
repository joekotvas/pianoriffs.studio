/**
 * Cross-Staff Navigation Utilities
 *
 * Functions for navigating between staves at the same rhythmic position.
 *
 * @tested navigationHelpers.test.ts
 */

import { getNoteDuration } from '../core';
import { getMidi } from '@/services/MusicService';
import { Measure, ScoreEvent, Note } from '@/types';

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
): string | null => {
  if (!event?.notes?.length || event.isRest) return null;
  const sorted = [...event.notes].sort(
    (a: Note, b: Note) => getMidi(a.pitch || 'C4') - getMidi(b.pitch || 'C4')
  );
  return direction === 'down' ? sorted[sorted.length - 1].id : sorted[0].id;
};
