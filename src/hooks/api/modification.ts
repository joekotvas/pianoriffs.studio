import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import { ChangePitchCommand, AddMeasureCommand } from '@/commands';

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
  const { dispatch, selectionRef } = ctx;

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
      // TODO: Dispatch TransposeCommand
      return this;
    },

    transposeDiatonic(_steps) {
      // TODO: Implement
      return this;
    },

    updateEvent(_props) {
      // TODO: Generic update
      return this;
    },

    // ========== STRUCTURE ==========
    addMeasure(_atIndex) {
      dispatch(new AddMeasureCommand());
      return this;
    },

    deleteMeasure(_measureIndex) {
      // TODO: Dispatch DeleteMeasureCommand
      return this;
    },

    deleteSelected() {
      // TODO: Implement smart delete
      return this;
    },

    setKeySignature(_key) {
      // TODO: Implement
      return this;
    },

    setTimeSignature(_sig) {
      // TODO: Implement
      return this;
    },

    setMeasurePickup(_isPickup) {
      // TODO: Implement
      return this;
    },

    // ========== CONFIGURATION ==========
    setClef(_clef) {
      // TODO: Dispatch SetClefCommand
      return this;
    },

    setScoreTitle(_title) {
      // TODO: Implement
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

    setStaffLayout(_type) {
      // TODO: Implement
      return this;
    },
  };
};
