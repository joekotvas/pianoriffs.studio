import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';

/**
 * Factory for creating Modification API methods.
 * Handles update, structure, and config operations.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for modification
 */
export const createModificationMethods = (_ctx: APIContext): Pick<MusicEditorAPI, 'setPitch' | 'setDuration' | 'setAccidental' | 'toggleAccidental' | 'transpose' | 'transposeDiatonic' | 'updateEvent' | 'addMeasure' | 'deleteMeasure' | 'deleteSelected' | 'setKeySignature' | 'setTimeSignature' | 'setMeasurePickup' | 'setClef' | 'setScoreTitle' | 'setBpm' | 'setTheme' | 'setScale' | 'setStaffLayout'> => {
  // const { dispatch } = ctx;

  return {
    setPitch(_pitch) {
      // TODO: Dispatch ChangePitchCommand
      return this as unknown as MusicEditorAPI;
    },

    setDuration(_duration, _dotted) {
      // TODO: Dispatch ChangeRhythmCommand
      return this as unknown as MusicEditorAPI;
    },

    setAccidental(_type) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    toggleAccidental() {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    transpose(_semitones) {
      // TODO: Dispatch TransposeCommand
      return this as unknown as MusicEditorAPI;
    },

    transposeDiatonic(_steps) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    updateEvent(_props) {
      // TODO: Generic update - will use proper ScoreEvent type when implemented
      return this as unknown as MusicEditorAPI;
    },

    // ========== STRUCTURE ==========
    addMeasure(_atIndex) {
      // TODO: Dispatch AddMeasureCommand
      return this as unknown as MusicEditorAPI;
    },

    deleteMeasure(_measureIndex) {
      // TODO: Dispatch DeleteMeasureCommand
      return this as unknown as MusicEditorAPI;
    },

    deleteSelected() {
      // TODO: Implement smart delete
      return this as unknown as MusicEditorAPI;
    },

    setKeySignature(_key) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setTimeSignature(_sig) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setMeasurePickup(_isPickup) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    // ========== CONFIGURATION ==========
    setClef(_clef) {
      // TODO: Dispatch SetClefCommand
      return this as unknown as MusicEditorAPI;
    },

    setScoreTitle(_title) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setBpm(_bpm) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setTheme(_theme) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setScale(_scale) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },

    setStaffLayout(_type) {
      // TODO: Implement
      return this as unknown as MusicEditorAPI;
    },
  };
};
