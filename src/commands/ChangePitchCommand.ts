import { Command } from './types';
import { Score } from '@/types';
import { updateNote } from '@/utils/commandHelpers';

export class ChangePitchCommand implements Command {
  public readonly type = 'CHANGE_PITCH';
  private oldPitch: string | null = null;

  constructor(
    private measureIndex: number,
    private eventId: string | number,
    private noteId: string | number,
    private newPitch: string,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    return updateNote(score, this.staffIndex, this.measureIndex, this.eventId, this.noteId, (note) => {
        this.oldPitch = note.pitch;
        note.pitch = this.newPitch;
        return true;
    });
  }

  undo(score: Score): Score {
    if (this.oldPitch === null) return score;

    return updateNote(score, this.staffIndex, this.measureIndex, this.eventId, this.noteId, (note) => {
        note.pitch = this.oldPitch!;
        return true;
    });
  }
}
