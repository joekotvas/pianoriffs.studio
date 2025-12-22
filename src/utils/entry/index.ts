/**
 * Entry utilities for note creation and pitch handling.
 *
 * These utilities centralize common logic used by both UI interactions
 * (useNoteActions) and the programmatic API (hooks/api/entry.ts).
 *
 * @module utils/entry
 */

export { createNotePayload, type NotePayloadOptions } from './notePayload';
export {
  createPreviewNote,
  arePreviewsEqual,
  type PreviewNoteOptions,
  type PreviewNote,
} from './previewNote';
export { resolvePitch, type ResolvePitchOptions, type AccidentalType } from './pitchResolver';
