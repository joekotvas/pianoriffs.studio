import { Score, Selection, getActiveStaff } from '../types';

/**
 * Calculates the selection state for focusing the score.
 * 
 * Priority:
 * 1. If existingSelection has an eventId, validate it still exists in the score
 * 2. If valid, keep the existing selection (focus memory)
 * 3. Otherwise, position at the end of the first staff for keyboard entry
 * 
 * @param score - The current score
 * @param existingSelection - The current selection state
 * @returns The new selection state for focusing the score
 */
export function calculateFocusSelection(
  score: Score,
  existingSelection: Selection
): Selection {
  // If there's an existing selection with a valid event, validate it
  if (existingSelection.eventId) {
    const staffIndex = existingSelection.staffIndex || 0;
    const staff = score.staves[staffIndex];
    
    if (staff && existingSelection.measureIndex !== null) {
      const measure = staff.measures[existingSelection.measureIndex];
      if (measure) {
        const event = measure.events.find(
          (e: any) => e.id === existingSelection.eventId
        );
        if (event) {
          // Selection is still valid - keep it (focus memory)
          return existingSelection;
        }
      }
    }
    // Selection was stale, fall through to default positioning
  }

  // No valid selection - position cursor at end of first staff
  const activeStaff = getActiveStaff(score, 0);
  const lastMeasureIndex = activeStaff.measures.length - 1;
  const lastMeasure = activeStaff.measures[lastMeasureIndex];

  if (lastMeasure && lastMeasure.events.length > 0) {
    // Select the last event
    const lastEvent = lastMeasure.events[lastMeasure.events.length - 1];
    return {
      staffIndex: 0,
      measureIndex: lastMeasureIndex,
      eventId: lastEvent.id,
      noteId: lastEvent.notes?.[0]?.id || null,
      selectedNotes: []
    };
  }

  // Empty measure - set measure position only (ready for append)
  return {
    staffIndex: 0,
    measureIndex: lastMeasureIndex,
    eventId: null,
    noteId: null,
    selectedNotes: []
  };
}
