import { Command } from './types';
import { Score, ScoreEvent, Note } from '../types';
import { updateMeasure } from '../utils/commandHelpers';

export class DeleteNoteCommand implements Command {
  public readonly type = 'DELETE_NOTE';
  private deletedEventIndex: number = -1;
  private deletedEvent: ScoreEvent | null = null;
  private deletedNote: Note | null = null;
  private wasLastNoteInEvent: boolean = false;

  constructor(
    private measureIndex: number,
    private eventId: string | number,
    private noteId: string | number,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
        const eventIndex = measure.events.findIndex(e => e.id === this.eventId);
        if (eventIndex === -1) return false;

        const event = { ...measure.events[eventIndex] };
        this.deletedEventIndex = eventIndex;

        const noteIndex = event.notes.findIndex(n => n.id === this.noteId);
        if (noteIndex === -1) return false;

        this.deletedNote = event.notes[noteIndex];

        if (event.notes.length === 1) {
            // Remove entire event
            this.wasLastNoteInEvent = true;
            this.deletedEvent = event;
            const newEvents = [...measure.events];
            newEvents.splice(eventIndex, 1);
            measure.events = newEvents;
        } else {
            // Remove just the note
            this.wasLastNoteInEvent = false;
            const newNotes = [...event.notes];
            newNotes.splice(noteIndex, 1);
            event.notes = newNotes;
            
            const newEvents = [...measure.events];
            newEvents[eventIndex] = event;
            measure.events = newEvents;
        }
        return true;
    });
  }

  undo(score: Score): Score {
    if (this.deletedEventIndex === -1 || !this.deletedNote) return score;

    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
        const newEvents = [...measure.events];

        if (this.wasLastNoteInEvent && this.deletedEvent) {
             // Restore entire event
             newEvents.splice(this.deletedEventIndex, 0, this.deletedEvent);
        } else {
             // Restore note to event
             // Try to find event at original index first (optimistic)
             let targetIndex = this.deletedEventIndex;
             let event = newEvents[targetIndex];
             
             // Verify ID match
             if (!event || event.id !== this.eventId) {
                 targetIndex = newEvents.findIndex(e => e.id === this.eventId);
                 if (targetIndex === -1) return false; // Cannot restore
                 event = newEvents[targetIndex];
             }

             // Clone event and add note
             const newEvent = { ...event };
             newEvent.notes = [...newEvent.notes, this.deletedNote!];
             
             newEvents[targetIndex] = newEvent;
        }
        
        measure.events = newEvents;
        return true;
    });
  }
}
