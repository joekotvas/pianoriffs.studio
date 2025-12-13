import { Command } from './types';
import { Score, Note } from '@/types';
import { updateEvent } from '@/utils/commandHelpers';

export class AddNoteToEventCommand implements Command {
  public readonly type = 'ADD_NOTE_TO_EVENT';

  constructor(
    private measureIndex: number,
    private eventId: string | number,
    private note: Note,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    return updateEvent(score, this.staffIndex, this.measureIndex, this.eventId, (event) => {
        // Check duplicate
        if (event.notes.some(n => n.pitch === this.note.pitch)) return false;

        event.notes = [...event.notes, this.note];
        return true;
    });
  }

  undo(score: Score): Score {
    return updateEvent(score, this.staffIndex, this.measureIndex, this.eventId, (event) => {
        const initialLength = event.notes.length;
        event.notes = event.notes.filter(n => n.id !== this.note.id);
        return event.notes.length !== initialLength;
    });
  }
}
