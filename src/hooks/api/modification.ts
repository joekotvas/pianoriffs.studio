import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import {
  ChangePitchCommand,
  AddMeasureCommand,
  DeleteMeasureCommand,
  DeleteEventCommand,
  DeleteNoteCommand,
  SetClefCommand,
  SetKeySignatureCommand,
  SetTimeSignatureCommand,
  TogglePickupCommand,
  SetGrandStaffCommand,
  SetSingleStaffCommand,
  UpdateTitleCommand,
  TransposeSelectionCommand,
  ChromaticTransposeCommand,
  UpdateEventCommand,
  UpdateNoteCommand,
  SetBpmCommand,
} from '@/commands';

/**
 * Modification method names provided by this factory
 */
type ModificationMethodNames =
  | 'setPitch'
  | 'setDuration'
  | 'setAccidental'
  | 'toggleAccidental'
  | 'transpose'
  | 'transposeDiatonic'
  | 'updateEvent'
  | 'addMeasure'
  | 'deleteMeasure'
  | 'deleteSelected'
  | 'setKeySignature'
  | 'setTimeSignature'
  | 'setMeasurePickup'
  | 'setClef'
  | 'setScoreTitle'
  | 'setBpm'
  | 'setTheme'
  | 'setScale'
  | 'setStaffLayout';

/**
 * Factory for creating Modification API methods.
 * Handles update, structure, and config operations.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for modification
 */
export const createModificationMethods = (
  ctx: APIContext
): Pick<MusicEditorAPI, ModificationMethodNames> & ThisType<MusicEditorAPI> => {
  const { dispatch, selectionRef, scoreRef } = ctx;

  return {
    setPitch(pitch) {
      const sel = selectionRef.current;
      if (sel.eventId && sel.noteId && sel.measureIndex !== null) {
        dispatch(
          new ChangePitchCommand(sel.measureIndex, sel.eventId, sel.noteId, pitch, sel.staffIndex)
        );
      }
      return this;
    },

    setDuration(duration, dotted = false) {
      const sel = selectionRef.current;

      // Multi-selection: update each unique event
      if (sel.selectedNotes && sel.selectedNotes.length > 1) {
        ctx.history.begin();

        const processedEvents = new Set<string>();
        sel.selectedNotes.forEach((note) => {
          const eventKey = `${note.staffIndex}-${note.measureIndex}-${note.eventId}`;
          if (processedEvents.has(eventKey)) return;
          processedEvents.add(eventKey);

          dispatch(
            new UpdateEventCommand(note.measureIndex, note.eventId, { duration, dotted }, note.staffIndex)
          );
        });

        ctx.history.commit();
        return this;
      }

      // Single selection
      if (sel.measureIndex === null || sel.eventId === null) {
        console.warn('[RiffScore API] setDuration failed: No event selected');
        return this;
      }

      dispatch(
        new UpdateEventCommand(sel.measureIndex, sel.eventId, { duration, dotted }, sel.staffIndex)
      );
      return this;
    },

    transpose(semitones) {
      const sel = selectionRef.current;
      if (sel.measureIndex === null) {
        console.warn('[RiffScore API] transpose failed: No selection');
        return this;
      }
      dispatch(new ChromaticTransposeCommand(sel, semitones));
      return this;
    },

    transposeDiatonic(steps) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const sel = selectionRef.current;
      dispatch(new TransposeSelectionCommand(sel, steps));
      return this;
    },

    updateEvent(props) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const sel = selectionRef.current;
      if (sel.eventId && sel.measureIndex !== null) {
        dispatch(new UpdateEventCommand(sel.measureIndex, sel.eventId, props, sel.staffIndex));
      }
      return this;
    },

    // ========== STRUCTURE ==========
    addMeasure(atIndex) {
      dispatch(new AddMeasureCommand(atIndex));
      return this;
    },

    deleteMeasure(measureIndex) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const idx = measureIndex ?? selectionRef.current.measureIndex ?? -1;
      if (idx >= 0) {
        dispatch(new DeleteMeasureCommand(idx));
      }
      return this;
    },

    deleteSelected() {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const sel = selectionRef.current;
      if (sel.eventId && sel.noteId && sel.measureIndex !== null) {
        dispatch(new DeleteNoteCommand(sel.measureIndex, sel.eventId, sel.noteId, sel.staffIndex));
      } else if (sel.eventId && sel.measureIndex !== null) {
        dispatch(new DeleteEventCommand(sel.measureIndex, sel.eventId, sel.staffIndex));
      }
      return this;
    },

    setKeySignature(key) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      dispatch(new SetKeySignatureCommand(key));
      return this;
    },

    setTimeSignature(sig) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      dispatch(new SetTimeSignatureCommand(sig));
      return this;
    },

    setMeasurePickup(isPickup) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      const firstMeasure = scoreRef.current.staves[0]?.measures[0];
      const currentlyPickup = !!firstMeasure?.isPickup;

      if (currentlyPickup !== isPickup) {
        dispatch(new TogglePickupCommand());
      }
      return this;
    },

    // ========== CONFIGURATION ==========
    setClef(clef) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      if (clef === 'grand') {
        dispatch(new SetGrandStaffCommand());
      } else {
        dispatch(new SetClefCommand(clef, selectionRef.current.staffIndex));
      }
      return this;
    },

    setScoreTitle(title) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      dispatch(new UpdateTitleCommand(title));
      return this;
    },

    setAccidental(type) {
      const sel = selectionRef.current;
      const { selectedNotes } = sel;

      // Batch update for multiple selection
      if (selectedNotes.length > 0) {
        ctx.history.begin();
        selectedNotes.forEach((note) => {
          // Validate all required properties before dispatch
          if (note.noteId && note.eventId && note.measureIndex != null && note.staffIndex != null) {
            dispatch(
              new UpdateNoteCommand(
                note.measureIndex,
                note.eventId,
                note.noteId,
                { accidental: type },
                note.staffIndex
              )
            );
          }
        });
        ctx.history.commit();
      } else if (sel.eventId && sel.noteId && sel.measureIndex !== null) {
        // Single selection
        dispatch(
          new UpdateNoteCommand(
            sel.measureIndex,
            sel.eventId,
            sel.noteId,
            { accidental: type },
            sel.staffIndex
          )
        );
      }
      return this;
    },

    toggleAccidental() {
      const sel = selectionRef.current;
      const { selectedNotes } = sel;
      const score = ctx.getScore();

      /**
       * Determines the next accidental in the cycle:
       * (none/undefined) -> sharp -> flat -> natural -> null
       */
      const getNextAccidental = (
        current: 'sharp' | 'flat' | 'natural' | null | undefined
      ): 'sharp' | 'flat' | 'natural' | null => {
        if (current === 'sharp') return 'flat';
        if (current === 'flat') return 'natural';
        if (current === 'natural') return null;
        return 'sharp'; // undefined or null -> sharp
      };

      // Multi-select: toggle each note independently
      if (selectedNotes.length > 0) {
        ctx.history.begin();
        selectedNotes.forEach((noteRef) => {
          if (
            noteRef.noteId &&
            noteRef.eventId &&
            noteRef.measureIndex != null &&
            noteRef.staffIndex != null
          ) {
            const staff = score.staves[noteRef.staffIndex];
            const measure = staff?.measures[noteRef.measureIndex];
            const event = measure?.events.find((e) => e.id === noteRef.eventId);
            const note = event?.notes.find((n) => n.id === noteRef.noteId);

            if (note) {
              dispatch(
                new UpdateNoteCommand(
                  noteRef.measureIndex,
                  noteRef.eventId,
                  noteRef.noteId,
                  { accidental: getNextAccidental(note.accidental) },
                  noteRef.staffIndex
                )
              );
            }
          }
        });
        ctx.history.commit();
      } else if (sel.eventId && sel.noteId && sel.measureIndex !== null) {
        // Single selection fallback
        const staff = score.staves[sel.staffIndex];
        const measure = staff?.measures[sel.measureIndex];
        const event = measure?.events.find((e) => e.id === sel.eventId);
        const note = event?.notes.find((n) => n.id === sel.noteId);

        if (note) {
          dispatch(
            new UpdateNoteCommand(
              sel.measureIndex,
              sel.eventId,
              sel.noteId,
              { accidental: getNextAccidental(note.accidental) },
              sel.staffIndex
            )
          );
        }
      }
      return this;
    },

    setBpm(bpm) {
      dispatch(new SetBpmCommand(bpm));
      return this;
    },

    setTheme(themeName) {
      ctx.setTheme(themeName);
      return this;
    },

    setScale(scale) {
      ctx.setZoom(scale);
      return this;
    },

    setStaffLayout(type) {
      /** @tested src/__tests__/ScoreAPI.modification.test.tsx */
      if (type === 'grand') {
        dispatch(new SetGrandStaffCommand());
      } else {
        dispatch(new SetSingleStaffCommand('treble'));
      }
      return this;
    },
  };
};
