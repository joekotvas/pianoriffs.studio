import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { AddNoteToEventCommand } from '@/commands/AddNoteToEventCommand';
import { ApplyTupletCommand } from '@/commands/TupletCommands';
import { RemoveTupletCommand } from '@/commands/RemoveTupletCommand';
import { UpdateNoteCommand } from '@/commands/UpdateNoteCommand';
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
  const { getScore, getSelection, syncSelection, dispatch } = ctx;

  return {
    addNote(pitch, duration = 'quarter', dotted = false) {
      // Validate pitch format
      if (!isValidPitch(pitch)) {
        console.warn(`[RiffScore API] addNote failed: Invalid pitch format '${pitch}'. Expected format: 'C4', 'F#5', 'Bb3', etc.`);
        return this;
      }

      const sel = getSelection();
      let staffIndex = sel.staffIndex;
      let measureIndex = sel.measureIndex;

      // If no measure is selected, default to first measure
      if (measureIndex === null) {
        staffIndex = 0;
        measureIndex = 0;
      }

      const staff = getScore().staves[staffIndex];
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
      const sel = getSelection();
      let staffIndex = sel.staffIndex;
      let measureIndex = sel.measureIndex;

      // If no measure is selected, default to first measure
      if (measureIndex === null) {
        staffIndex = 0;
        measureIndex = 0;
      }

      const staff = getScore().staves[staffIndex];
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

      const sel = getSelection();
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

    makeTuplet(numNotes = 3, inSpaceOf = 2) {
      const sel = getSelection();
      if (sel.measureIndex === null || sel.eventId === null) {
        console.warn('[RiffScore API] makeTuplet failed: No selection');
        return this;
      }

      const staff = getScore().staves[sel.staffIndex];
      const measure = staff?.measures[sel.measureIndex];
      if (!measure) {
        console.warn('[RiffScore API] makeTuplet failed: Measure not found');
        return this;
      }

      // Find the index of the selected event
      const eventIndex = measure.events.findIndex((e) => e.id === sel.eventId);
      if (eventIndex === -1) {
        console.warn('[RiffScore API] makeTuplet failed: Event not found');
        return this;
      }

      // Check if we have enough events for the tuplet
      if (eventIndex + numNotes > measure.events.length) {
        console.warn(`[RiffScore API] makeTuplet failed: Not enough events (need ${numNotes}, have ${measure.events.length - eventIndex})`);
        return this;
      }

      // Check if any target events are already in a tuplet
      for (let i = 0; i < numNotes; i++) {
        if (measure.events[eventIndex + i]?.tuplet) {
          console.warn('[RiffScore API] makeTuplet failed: Target events already contain a tuplet');
          return this;
        }
      }

      dispatch(new ApplyTupletCommand(
        sel.measureIndex,
        eventIndex,
        numNotes,
        [numNotes, inSpaceOf] as [number, number],
        sel.staffIndex
      ));

      return this;
    },

    unmakeTuplet() {
      const sel = getSelection();
      if (sel.measureIndex === null || sel.eventId === null) {
        console.warn('[RiffScore API] unmakeTuplet failed: No selection');
        return this;
      }

      const staff = getScore().staves[sel.staffIndex];
      const measure = staff?.measures[sel.measureIndex];
      if (!measure) {
        console.warn('[RiffScore API] unmakeTuplet failed: Measure not found');
        return this;
      }

      // Find the selected event and its index
      const eventIndex = measure.events.findIndex((e) => e.id === sel.eventId);
      const event = eventIndex >= 0 ? measure.events[eventIndex] : null;
      if (!event?.tuplet) {
        console.warn('[RiffScore API] unmakeTuplet failed: Selected event is not part of a tuplet');
        return this;
      }

      dispatch(new RemoveTupletCommand(
        sel.measureIndex,
        eventIndex,
        sel.staffIndex
      ));

      return this;
    },

    toggleTie() {
      const sel = getSelection();
      if (sel.measureIndex === null || sel.eventId === null || sel.noteId === null) {
        console.warn('[RiffScore API] toggleTie failed: No note selected');
        return this;
      }

      const staff = getScore().staves[sel.staffIndex];
      const measure = staff?.measures[sel.measureIndex];
      const event = measure?.events.find((e) => e.id === sel.eventId);
      const note = event?.notes?.find((n) => n.id === sel.noteId);

      if (!note) {
        console.warn('[RiffScore API] toggleTie failed: Note not found');
        return this;
      }

      dispatch(new UpdateNoteCommand(
        sel.measureIndex,
        sel.eventId,
        sel.noteId,
        { tied: !note.tied },
        sel.staffIndex
      ));

      return this;
    },

    setTie(tied) {
      const sel = getSelection();
      if (sel.measureIndex === null || sel.eventId === null || sel.noteId === null) {
        console.warn('[RiffScore API] setTie failed: No note selected');
        return this;
      }

      const staff = getScore().staves[sel.staffIndex];
      const measure = staff?.measures[sel.measureIndex];
      const event = measure?.events.find((e) => e.id === sel.eventId);
      const note = event?.notes?.find((n) => n.id === sel.noteId);

      if (!note) {
        console.warn('[RiffScore API] setTie failed: Note not found');
        return this;
      }

      dispatch(new UpdateNoteCommand(
        sel.measureIndex,
        sel.eventId,
        sel.noteId,
        { tied },
        sel.staffIndex
      ));

      return this;
    },

    setInputMode(_mode) {
      // Note: setInputMode affects UI state (tools), not score state.
      // This requires access to the tools context which is not available here.
      // For programmatic API usage, mode is typically set before calling addNote/addRest.
      console.warn('[RiffScore API] setInputMode: Use addNote() for notes, addRest() for rests. Input mode is a UI concept.');
      return this;
    },
  };
};
