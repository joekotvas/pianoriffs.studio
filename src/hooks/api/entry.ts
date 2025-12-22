import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { AddNoteToEventCommand } from '@/commands/AddNoteToEventCommand';
import { canAddEventToMeasure, isValidPitch } from '@/utils/validation';
import { generateId } from '@/utils/core';
import { createNotePayload } from '@/utils/entry';

/**
 * Entry method names provided by this factory
 */
type EntryMethodNames = 'addNote' | 'addRest' | 'addTone' | 'makeTuplet' | 'unmakeTuplet' | 'toggleTie' | 'setTie' | 'setInputMode';

/**
 * Factory for creating Entry API methods.
 * Handles note/rest creation, tuplets, and ties.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for entry
 */
export const createEntryMethods = (ctx: APIContext): Pick<MusicEditorAPI, EntryMethodNames> & ThisType<MusicEditorAPI> => {
  const { scoreRef, selectionRef, syncSelection, dispatch } = ctx;

  return {
    addNote(pitch, duration = 'quarter', dotted = false) {
      // Validate pitch format
      if (!isValidPitch(pitch)) {
        console.warn(`[RiffScore API] addNote failed: Invalid pitch format '${pitch}'. Expected format: 'C4', 'F#5', 'Bb3', etc.`);
        return this;
      }

      const sel = selectionRef.current;
      let staffIndex = sel.staffIndex;
      let measureIndex = sel.measureIndex;

      // If no measure is selected, default to first measure
      if (measureIndex === null) {
        staffIndex = 0;
        measureIndex = 0;
      }

      const staff = scoreRef.current.staves[staffIndex];
      if (!staff || staff.measures.length === 0) {
        console.warn('[RiffScore API] addNote failed: No measures exist in the score');
        return this;
      }

      const measure = staff.measures[measureIndex];
      if (!measure) {
        console.warn(`[RiffScore API] addNote failed: Measure ${measureIndex + 1} does not exist`);
        return this;
      }

      // Check if measure has capacity for this note
      if (!canAddEventToMeasure(measure.events, duration, dotted)) {
        console.warn(`[RiffScore API] addNote failed: Measure ${measureIndex + 1} is full. Cannot add ${dotted ? 'dotted ' : ''}${duration} note.`);
        return this;
      }

      // Create note payload using shared utility
      const note = createNotePayload({ pitch, id: generateId() });

      // Dispatch AddEventCommand
      const eventId = generateId();
      dispatch(new AddEventCommand(measureIndex, false, note, duration, dotted, undefined, eventId, staffIndex));

      // Advance cursor to the new event
      const newSelection = {
        staffIndex,
        measureIndex,
        eventId,
        noteId: note.id,
        selectedNotes: [{ staffIndex, measureIndex, eventId, noteId: note.id }],
        anchor: null,
      };
      syncSelection(newSelection);


      return this;
    },

    addRest(duration = 'quarter', dotted = false) {
      const sel = selectionRef.current;
      let staffIndex = sel.staffIndex;
      let measureIndex = sel.measureIndex;

      // If no measure is selected, default to first measure
      if (measureIndex === null) {
        staffIndex = 0;
        measureIndex = 0;
      }

      const staff = scoreRef.current.staves[staffIndex];
      if (!staff || staff.measures.length === 0) {
        console.warn('[RiffScore API] addRest failed: No measures exist in the score');
        return this;
      }

      const measure = staff.measures[measureIndex];
      if (!measure) {
        console.warn(`[RiffScore API] addRest failed: Measure ${measureIndex + 1} does not exist`);
        return this;
      }

      // Check if measure has capacity for this rest
      if (!canAddEventToMeasure(measure.events, duration, dotted)) {
        console.warn(`[RiffScore API] addRest failed: Measure ${measureIndex + 1} is full. Cannot add ${dotted ? 'dotted ' : ''}${duration} rest.`);
        return this;
      }

      // Dispatch AddEventCommand with isRest=true
      const eventId = generateId();
      dispatch(new AddEventCommand(measureIndex, true, null, duration, dotted, undefined, eventId, staffIndex));

      // Advance cursor - use the same rest note ID pattern as AddEventCommand
      const restNoteId = `${eventId}-rest`;
      const newSelection = {
        staffIndex,
        measureIndex,
        eventId,
        noteId: restNoteId,
        selectedNotes: [{ staffIndex, measureIndex, eventId, noteId: restNoteId }],
        anchor: null,
      };
      syncSelection(newSelection);

      return this;
    },

    addTone(pitch) {
      // Validate pitch format
      if (!isValidPitch(pitch)) {
        console.warn(`[RiffScore API] addTone failed: Invalid pitch format '${pitch}'. Expected format: 'C4', 'F#5', 'Bb3', etc.`);
        return this;
      }

      const sel = selectionRef.current;
      if (sel.measureIndex === null || sel.eventId === null) return this;

      const staffIndex = sel.staffIndex;
      const measureIndex = sel.measureIndex;
      const eventId = sel.eventId;

      // Create note using shared utility
      const note = createNotePayload({ pitch, id: generateId() });

      // Dispatch AddNoteToEventCommand
      dispatch(new AddNoteToEventCommand(measureIndex, eventId, note, staffIndex));

      // Update selection to include new note
      const newSelection = {
        ...sel,
        noteId: note.id,
        selectedNotes: [{ staffIndex, measureIndex, eventId, noteId: note.id }],
      };
      syncSelection(newSelection);

      return this;
    },

    makeTuplet(_numNotes, _inSpaceOf) {
      // TODO: Implement
      return this;
    },

    unmakeTuplet() {
      // TODO: Implement
      return this;
    },

    toggleTie() {
      // TODO: Implement
      return this;
    },

    setTie(_tied) {
      // TODO: Implement
      return this;
    },

    setInputMode(_mode) {
      // TODO: Implement
      return this;
    },
  };
};
