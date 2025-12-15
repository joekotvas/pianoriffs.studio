import { Command } from './types';
import { Score, getActiveStaff, ScoreEvent } from '@/types';

export class DeleteEventCommand implements Command {
  public readonly type = 'DELETE_EVENT';
  private deletedEventIndex: number = -1;
  private deletedEvent: ScoreEvent | null = null;

  constructor(
    private measureIndex: number,
    private eventId: string | number,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    const activeStaff = getActiveStaff(score, this.staffIndex);
    const newMeasures = [...activeStaff.measures];

    if (!newMeasures[this.measureIndex]) return score;

    const measure = { ...newMeasures[this.measureIndex] };
    const eventIndex = measure.events.findIndex((e) => e.id === this.eventId);

    if (eventIndex === -1) return score;

    this.deletedEvent = measure.events[eventIndex];
    this.deletedEventIndex = eventIndex;

    const newEvents = [...measure.events];
    newEvents.splice(eventIndex, 1);
    measure.events = newEvents;

    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = { ...activeStaff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    if (this.deletedEventIndex === -1 || !this.deletedEvent) return score;

    const activeStaff = getActiveStaff(score, this.staffIndex);
    const newMeasures = [...activeStaff.measures];

    if (!newMeasures[this.measureIndex]) return score;

    const measure = { ...newMeasures[this.measureIndex] };
    const newEvents = [...measure.events];

    newEvents.splice(this.deletedEventIndex, 0, this.deletedEvent);

    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;

    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = { ...activeStaff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }
}
