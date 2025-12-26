/**
 * Note Payload Utilities
 *
 * Centralizes note creation logic for consistency across UI and API.
 *
 * @tested src/__tests__/utils/entry/notePayload.test.ts
 */
import { noteId } from '@/utils/id';
import { Note } from '@/types';

/**
 * Options for creating a note payload.
 */
export interface NotePayloadOptions {
  /** The pitch of the note (e.g., 'C4', 'F#5') */
  pitch: string;
  /** Optional accidental override ('sharp' | 'flat' | 'natural' | null) */
  accidental?: 'sharp' | 'flat' | 'natural' | null;
  /** Whether the note is tied to the next note */
  tied?: boolean;
  /** Optional explicit ID (defaults to noteId()) */
  id?: string;
}

/**
 * Creates a standardized note payload for use in commands.
 *
 * This utility centralizes note creation logic to ensure consistency
 * across both UI interactions (useNoteActions) and the programmatic API.
 *
 * @param options - Note creation options
 * @returns A Note object ready for command dispatch
 *
 * @example
 * ```typescript
 * const note = createNotePayload({ pitch: 'C4' });
 * dispatch(new AddEventCommand(measureIndex, false, note, 'quarter', false));
 * ```
 *
 * @tested src/__tests__/utils/entry/notePayload.test.ts
 */
export function createNotePayload(options: NotePayloadOptions): Note {
  const { pitch, accidental = null, tied = false, id } = options;

  return {
    id: id ?? noteId(),
    pitch,
    accidental,
    tied,
  };
}
