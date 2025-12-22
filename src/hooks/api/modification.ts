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
  UpdateEventCommand,
} from '@/commands';

/**
 * Modification method names provided by this factory
 */
type ModificationMethodNames = 'setPitch' | 'setDuration' | 'setAccidental' | 'toggleAccidental' | 'transpose' | 'transposeDiatonic' | 'updateEvent' | 'addMeasure' | 'deleteMeasure' | 'deleteSelected' | 'setKeySignature' | 'setTimeSignature' | 'setMeasurePickup' | 'setClef' | 'setScoreTitle' | 'setBpm' | 'setTheme' | 'setScale' | 'setStaffLayout';

/**
 * Factory for creating Modification API methods.
 * Handles update, structure, and config operations.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for modification
 */
export const createModificationMethods = (ctx: APIContext): Pick<MusicEditorAPI, ModificationMethodNames> & ThisType<MusicEditorAPI> => {
  const { dispatch, selectionRef, scoreRef } = ctx;

  return {
    setPitch(pitch) {
      const sel = selectionRef.current;
      if (sel.eventId && sel.noteId && sel.measureIndex !== null) {
        dispatch(new ChangePitchCommand(
          sel.measureIndex,
          sel.eventId,
          sel.noteId,
          pitch,
          sel.staffIndex
        ));
      }
      return this;
    },

    setDuration(_duration, _dotted) {
      // TODO: Dispatch ChangeRhythmCommand
      return this;
    },

    setAccidental(_type) {
      // TODO: Implement
      return this;
    },

    toggleAccidental() {
      // TODO: Implement
      return this;
    },

    transpose(_semitones) {
      // TODO: Implement chromatic transposition
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
        dispatch(new UpdateEventCommand(
          sel.measureIndex,
          sel.eventId,
          props,
          sel.staffIndex
        ));
      }
      return this;
    },

    // ========== STRUCTURE ==========
    addMeasure(_atIndex) {
      dispatch(new AddMeasureCommand());
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
        dispatch(new DeleteNoteCommand(
          sel.measureIndex,
          sel.eventId,
          sel.noteId,
          sel.staffIndex
        ));
      } else if (sel.eventId && sel.measureIndex !== null) {
        dispatch(new DeleteEventCommand(
          sel.measureIndex,
          sel.eventId,
          sel.staffIndex
        ));
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

    setBpm(_bpm) {
      // TODO: Implement
      return this;
    },

    setTheme(_theme) {
      // TODO: Implement
      return this;
    },

    setScale(_scale) {
      // TODO: Implement
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
