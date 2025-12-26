import { Score, Measure, ScoreEvent, Note } from '@/types';

/**
 * Helper to update a specific measure in the score.
 * Handles cloning of the staff and measures array.
 *
 * @param score The current score state
 * @param staffIndex Index of the staff containing the measure
 * @param measureIndex Index of the measure to update
 * @param updateFn Callback to modify the measure. Return true if modification happened, false to abort.
 *                 The measure passed to this function is already a clone.
 * @returns New score state (with updates) or original score (if invalid path or aborted)
 */
export const updateMeasure = (
  score: Score,
  staffIndex: number,
  measureIndex: number,
  updateFn: (measure: Measure) => boolean | void
): Score => {
  const activeStaff = score.staves[staffIndex];
  if (!activeStaff) return score;

  const newMeasures = [...activeStaff.measures];
  if (!newMeasures[measureIndex]) return score;

  const measure = { ...newMeasures[measureIndex] };

  // Execute update logic
  const shouldUpdate = updateFn(measure);

  if (shouldUpdate === false) return score;

  newMeasures[measureIndex] = measure;

  const newStaves = [...score.staves];
  newStaves[staffIndex] = { ...activeStaff, measures: newMeasures };

  return { ...score, staves: newStaves };
};

/**
 * Helper to update a specific event in a measure.
 * Handles cloning of the event array.
 *
 * @param score The current score state
 * @param staffIndex Index of the staff
 * @param measureIndex Index of the measure
 * @param eventIdOrIndex ID or Index of the event to update
 * @param updateFn Callback to modify the event. Return true if modification happened, false to abort.
 *                 The event passed to this function is already a clone.
 * @returns New score state or original score
 */
export const updateEvent = (
  score: Score,
  staffIndex: number,
  measureIndex: number,
  eventIdOrIndex: string,
  updateFn: (event: ScoreEvent) => boolean | void
): Score => {
  return updateMeasure(score, staffIndex, measureIndex, (measure) => {
    const events = [...measure.events];

    let eventIndex = -1;
    if (
      typeof eventIdOrIndex === 'number' &&
      eventIdOrIndex < events.length &&
      events[eventIdOrIndex]
    ) {
      // Treat as index if it matches valid range, though ID usually string.
      // To be safe, usually we assume ID. Let's strictly check logic.
      // If we passed an Index (like in RemoveTuplet), we should support it.
      // But usually commands act by ID.
      eventIndex = eventIdOrIndex;
    } else {
      eventIndex = events.findIndex((e) => e.id === eventIdOrIndex);
    }

    if (eventIndex === -1) return false;

    const event = { ...events[eventIndex] };
    const result = updateFn(event);

    if (result === false) return false;

    events[eventIndex] = event;
    measure.events = events;
    return true;
  });
};

/**
 * Helper to update a specific note in an event.
 * Handles cloning of the note array.
 *
 * @param score The current score state
 * @param staffIndex Index of the staff
 * @param measureIndex Index of the measure
 * @param eventId ID of the event
 * @param noteId ID of the note
 * @param updateFn Callback to modify the note. Return true if modification happened, false to abort.
 *                 The note passed to this function is already a clone.
 * @returns New score state or original score
 */
export const updateNote = (
  score: Score,
  staffIndex: number,
  measureIndex: number,
  eventId: string,
  noteId: string,
  updateFn: (note: Note) => boolean | void
): Score => {
  return updateEvent(score, staffIndex, measureIndex, eventId, (event) => {
    const noteIndex = event.notes.findIndex((n) => String(n.id) === String(noteId));
    if (noteIndex === -1) return false;

    const newNotes = [...event.notes];
    const note = { ...newNotes[noteIndex] };

    const result = updateFn(note);
    if (result === false) return false;

    newNotes[noteIndex] = note;
    event.notes = newNotes;
    return true;
  });
};
