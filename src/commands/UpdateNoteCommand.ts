import { Command } from './types';
import { Score, Note } from '@/types';
import { updateNote } from '@/utils/commandHelpers';

export class UpdateNoteCommand implements Command {
  public readonly type = 'UPDATE_NOTE';
  private previousNote: Note | null = null;

  constructor(
    private measureIndex: number,
    private eventId: string | number,
    private noteId: string | number,
    private updates: Partial<Note>,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    return updateNote(
      score,
      this.staffIndex,
      this.measureIndex,
      this.eventId,
      this.noteId,
      (note) => {
        this.previousNote = { ...note };
        Object.assign(note, this.updates);
        return true;
      }
    );
  }

  undo(score: Score): Score {
    if (!this.previousNote) return score;

    return updateNote(
      score,
      this.staffIndex,
      this.measureIndex,
      this.eventId,
      this.noteId,
      (note) => {
        // Restore all properties from previousNote
        // Note: Object.assign implies we overwrite keys, but if 'updates' added keys that were undefined,
        // previousNote might not have them. A strict 'replace' logic is safer if we want full undo.
        // updateNote gives us a clone of the current note.
        // The safest way is to replace the properties we changed.

        // Since 'updates' is Partial<Note>, we can just re-apply previousNote properties?
        // Actually, updateNote expects modification of the passed 'note' object.
        // We can just Object.assign(note, this.previousNote).
        Object.assign(note, this.previousNote);
        return true;
      }
    );
  }
}
