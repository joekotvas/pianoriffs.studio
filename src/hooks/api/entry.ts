import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import { Note } from '@/types';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { AddNoteToEventCommand } from '@/commands/AddNoteToEventCommand';
import { canAddEventToMeasure } from '@/utils/validation';
import { generateId } from '@/utils/core';

/**
 * Factory for creating Entry API methods.
 * Handles note/rest creation, tuplets, and ties.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for entry
 */
export const createEntryMethods = (ctx: APIContext): Pick<MusicEditorAPI, 'addNote' | 'addRest' | 'addTone' | 'makeTuplet' | 'unmakeTuplet' | 'toggleTie' | 'setTie' | 'setInputMode'> => {
  const { scoreRef, selectionRef, syncSelection, dispatch } = ctx;

  return {
    addNote(pitch, duration = 'quarter', dotted = false) {
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
        return this as unknown as MusicEditorAPI;
      }

      const measure = staff.measures[measureIndex];
      if (!measure) {
        console.warn(`[RiffScore API] addNote failed: Measure ${measureIndex + 1} does not exist`);
        return this as unknown as MusicEditorAPI;
      }

      // Check if measure has capacity for this note
      if (!canAddEventToMeasure(measure.events, duration, dotted)) {
        console.warn(`[RiffScore API] addNote failed: Measure ${measureIndex + 1} is full. Cannot add ${dotted ? 'dotted ' : ''}${duration} note.`);
        return this as unknown as MusicEditorAPI;
      }

      // Create note payload
      const noteId = generateId();
      const note: Note = {
        id: noteId,
        pitch,
        accidental: null,
        tied: false,
      };

      // Dispatch AddEventCommand
      const eventId = generateId();
      dispatch(new AddEventCommand(measureIndex, false, note, duration, dotted, undefined, eventId, staffIndex));

      // Advance cursor to the new event
      syncSelection({
        staffIndex,
        measureIndex,
        eventId,
        noteId,
        selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
        anchor: null,
      });

      return this as unknown as MusicEditorAPI;
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
        return this as unknown as MusicEditorAPI;
      }

      const measure = staff.measures[measureIndex];
      if (!measure) {
        console.warn(`[RiffScore API] addRest failed: Measure ${measureIndex + 1} does not exist`);
        return this as unknown as MusicEditorAPI;
      }

      // Check if measure has capacity for this rest
      if (!canAddEventToMeasure(measure.events, duration, dotted)) {
        console.warn(`[RiffScore API] addRest failed: Measure ${measureIndex + 1} is full. Cannot add ${dotted ? 'dotted ' : ''}${duration} rest.`);
        return this as unknown as MusicEditorAPI;
      }

      // Dispatch AddEventCommand with isRest=true
      const eventId = generateId();
      dispatch(new AddEventCommand(measureIndex, true, null, duration, dotted, undefined, eventId, staffIndex));

      // Advance cursor
      const restNoteId = `${eventId}-rest`;
      syncSelection({
        staffIndex,
        measureIndex,
        eventId,
        noteId: restNoteId,
        selectedNotes: [{ staffIndex, measureIndex, eventId, noteId: restNoteId }],
        anchor: null,
      });

      return this as unknown as MusicEditorAPI;
    },

    addTone(pitch) {
      const sel = selectionRef.current;
      if (sel.measureIndex === null || sel.eventId === null) return this as unknown as MusicEditorAPI;

      const staffIndex = sel.staffIndex;
      const measureIndex = sel.measureIndex;
      const eventId = sel.eventId;

      // Create note to add to chord
      const noteId = generateId();
      const note: Note = {
        id: noteId,
        pitch,
        accidental: null,
        tied: false,
      };

      // Dispatch AddNoteToEventCommand
      dispatch(new AddNoteToEventCommand(measureIndex, eventId, note, staffIndex));

      // Update selection to include new note
      syncSelection({
        ...sel,
        noteId,
        selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
      });

      return this as unknown as MusicEditorAPI;
    },

    makeTuplet(_numNotes, _inSpaceOf) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    unmakeTuplet() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    toggleTie() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setTie(_tied) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setInputMode(_mode) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },
  };
};
