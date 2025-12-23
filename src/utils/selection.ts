import { Selection, createDefaultSelection, Score, Note } from '@/types';

interface NoteContext {
  staffIndex: number;
  measureIndex: number;
  eventId: string | number;
  noteId: string | number | null;
}

/**
 * Robustly compares two IDs.
 * Handles loose equality for string/number mismatches, but strict on null/undefined.
 */
export const compareIds = (
  id1: string | number | null | undefined,
  id2: string | number | null | undefined
): boolean => {
  // Treat null and undefined as equal to each other
  if (id1 == null && id2 == null) return true;
  if (id1 == null || id2 == null) return false;
  return String(id1) === String(id2);
};

/**
 * Checks if a specific note is currently selected.
 * Prioritizes the multi-selection list if it exists to ensure visual consistency.
 */
export const isNoteSelected = (selection: Selection, context: NoteContext): boolean => {
  const { staffIndex, measureIndex, eventId, noteId } = context;

  // 1. Check Multi-Selection List (Source of Truth for Multi)
  if (selection.selectedNotes && selection.selectedNotes.length > 0) {
    return selection.selectedNotes.some(
      (sn) =>
        compareIds(sn.noteId, noteId) &&
        compareIds(sn.eventId, eventId) &&
        sn.measureIndex === measureIndex &&
        sn.staffIndex === staffIndex
    );
  }

  // 2. Fallback: Check Primary Selection (Cursor) for Single Select
  return (
    compareIds(selection.eventId, eventId) &&
    compareIds(selection.noteId, noteId) &&
    selection.measureIndex === measureIndex &&
    (selection.staffIndex === undefined || selection.staffIndex === staffIndex)
  );
};

/**
 * Checks if all provided notes in an event are selected.
 */
export const areAllNotesSelected = (
  selection: Selection,
  staffIndex: number,
  measureIndex: number,
  eventId: string | number,
  notes: Note[]
): boolean => {
  if (!notes || notes.length === 0) return false;
  return notes.every((note) =>
    isNoteSelected(selection, { staffIndex, measureIndex, eventId, noteId: note.id })
  );
};

/**
 * Calculates the new selection state when toggling a note.
 * FIX: Ensures Event/Measure context updates when focus shifts to a different note.
 */
export const toggleNoteInSelection = (
  prevSelection: Selection,
  context: NoteContext,
  isMulti: boolean
): Selection => {
  const { staffIndex, measureIndex, eventId, noteId } = context;

  // Only eventId is required - noteId can be null for rests
  if (!eventId) {
    return { ...createDefaultSelection(), staffIndex };
  }

  // 1. Single Selection Mode (Simple Replace)
  if (!isMulti) {
    return {
      staffIndex,
      measureIndex,
      eventId,
      noteId,
      selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
      anchor: null, // Reset anchor on single click
    };
  }

  // 2. Multi-Selection Mode

  // Copy existing list or initialize
  const newSelectedNotes = prevSelection.selectedNotes ? [...prevSelection.selectedNotes] : [];

  // "Promote" existing primary selection to list if it wasn't there yet
  // (This handles the transition from Single -> Multi)
  // Note: noteId can be null for rests, so check eventId and measureIndex only
  if (prevSelection.eventId && prevSelection.measureIndex != null) {
    const isPrevInList = newSelectedNotes.some(
      (n) =>
        compareIds(n.noteId, prevSelection.noteId) && compareIds(n.eventId, prevSelection.eventId)
    );

    if (!isPrevInList) {
      newSelectedNotes.push({
        staffIndex: prevSelection.staffIndex ?? 0,
        measureIndex: prevSelection.measureIndex,
        eventId: prevSelection.eventId,
        noteId: prevSelection.noteId, // Can be null for rests
      });
    }
  }

  // Check if target is currently in the list
  const existingIndex = newSelectedNotes.findIndex(
    (n) => compareIds(n.noteId, noteId) && compareIds(n.eventId, eventId)
  );

  // -- Toggle Logic --
  if (existingIndex >= 0) {
    // REMOVE from selection
    newSelectedNotes.splice(existingIndex, 1);
  } else {
    // ADD to selection
    newSelectedNotes.push({ staffIndex, measureIndex, eventId, noteId });
  }

  // -- Calculate New Focus (Cursor) --
  // If list is empty, reset everything
  if (newSelectedNotes.length === 0) {
    return { ...createDefaultSelection(), staffIndex };
  }

  // We default the new focus to the note we just clicked...
  let newFocus: NoteContext = { staffIndex, measureIndex, eventId, noteId };

  // ...Unless we just toggled that note OFF. Then we focus the last item in the list.
  if (existingIndex >= 0) {
    newFocus = newSelectedNotes[newSelectedNotes.length - 1];
  }

  return {
    staffIndex: newFocus.staffIndex,
    measureIndex: newFocus.measureIndex,
    eventId: newFocus.eventId,
    noteId: newFocus.noteId,
    selectedNotes: newSelectedNotes,
    anchor: prevSelection.anchor, // Preserve anchor for shift-select ranges
  };
};

/**
 * Flattens the score into a linear list.
 */
export const getLinearizedNotes = (score: Score): NoteContext[] => {
  const notes: NoteContext[] = [];
  score.staves.forEach((staff, staffInd) => {
    staff.measures.forEach((measure, measureInd) => {
      measure.events.forEach((event) => {
        if (event.notes && event.notes.length > 0) {
          event.notes.forEach((note) => {
            notes.push({
              staffIndex: staffInd,
              measureIndex: measureInd,
              eventId: event.id,
              noteId: note.id,
            });
          });
        }
      });
    });
  });
  return notes;
};

/**
 * Calculates range.
 * Includes logic to select ALL notes in any event touched by the range (Chord selection).
 */
export const calculateNoteRange = (
  anchor: NoteContext,
  focus: NoteContext,
  linearNotes: NoteContext[]
): NoteContext[] => {
  // Find indices in the linearized score
  const getIndex = (ctx: NoteContext) =>
    linearNotes.findIndex(
      (n) => compareIds(n.noteId, ctx.noteId) && compareIds(n.eventId, ctx.eventId)
    );

  const anchorIndex = getIndex(anchor);
  const focusIndex = getIndex(focus);

  if (anchorIndex === -1 || focusIndex === -1) return [];

  const start = Math.min(anchorIndex, focusIndex);
  const end = Math.max(anchorIndex, focusIndex);

  // Get the raw range of notes
  const rawSlice = linearNotes.slice(start, end + 1);

  // Expand: Identify all Event IDs touched by this slice
  const affectedEventIds = new Set(rawSlice.map((n) => n.eventId));

  // Return all notes (from the linear list) that belong to those events
  // We filter linearNotes again to ensure we pick up notes in the chords that
  // might have been physically "before" the start index in data structure but belong to the same event.
  return linearNotes.filter(
    (n) => affectedEventIds.has(n.eventId) && n.staffIndex === anchor.staffIndex // Generally prevent ranges spanning staves
  );
};

/**
 * Checks if a rest event is selected.
 * Uses the first (and only) note in a rest event for selection checking.
 */
export const isRestSelected = (
  selection: Selection,
  event: { id: string | number; notes?: { id: string | number }[] },
  measureIndex: number,
  staffIndex: number
): boolean => {
  const restNoteId = event.notes?.[0]?.id ?? null;

  // Check primary selection
  const isPrimary =
    selection.measureIndex === measureIndex &&
    compareIds(selection.eventId, event.id) &&
    selection.staffIndex === staffIndex;

  // Check multi-selection
  const isInMulti =
    selection.selectedNotes?.some(
      (sn) =>
        sn.measureIndex === measureIndex &&
        compareIds(sn.eventId, event.id) &&
        sn.staffIndex === staffIndex &&
        compareIds(sn.noteId, restNoteId)
    ) ?? false;

  return isPrimary || isInMulti;
};

/**
 * Checks if ALL notes in a beam group are selected.
 * A beam is considered selected only when every note it connects is selected.
 */
export const isBeamGroupSelected = (
  selection: Selection,
  beam: { ids: (string | number)[] },
  events: { id: string | number; notes?: { id: string | number }[] }[],
  measureIndex: number
): boolean => {
  // Collect all notes participating in this beam
  const beamNoteIds: { eventId: string | number; noteId: string | number }[] = [];

  beam.ids.forEach((eventId) => {
    const ev = events.find((e) => compareIds(e.id, eventId));
    if (ev?.notes) {
      ev.notes.forEach((n) => beamNoteIds.push({ eventId: ev.id, noteId: n.id }));
    }
  });

  if (beamNoteIds.length === 0) return false;

  // Check if every note is in the selection
  return beamNoteIds.every((bn) => {
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      return selection.selectedNotes.some(
        (sn) =>
          sn.measureIndex === measureIndex &&
          compareIds(sn.eventId, bn.eventId) &&
          compareIds(sn.noteId, bn.noteId)
      );
    }
    return (
      selection.measureIndex === measureIndex &&
      compareIds(selection.eventId, bn.eventId) &&
      compareIds(selection.noteId, bn.noteId)
    );
  });
};
