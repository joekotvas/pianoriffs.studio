import { Command } from './types';
import { Score, getActiveStaff, ScoreEvent } from '@/types';

export class UpdateEventCommand implements Command {
  public readonly type = 'UPDATE_EVENT';
  private previousEvent: ScoreEvent | null = null;

  constructor(
    private measureIndex: number,
    private eventId: string | number,
    private updates: Partial<ScoreEvent>,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    const activeStaff = score.staves[this.staffIndex];
    if (!activeStaff) return score;

    const newMeasures = [...activeStaff.measures];
    
    if (!newMeasures[this.measureIndex]) return score;

    const measure = { ...newMeasures[this.measureIndex] };
    const eventIndex = measure.events.findIndex(e => e.id === this.eventId);

    if (eventIndex === -1) return score;

    const event = { ...measure.events[eventIndex] };
    this.previousEvent = event;

    const newEvent = { ...event, ...this.updates };
    
    const newEvents = [...measure.events];
    newEvents[eventIndex] = newEvent;
    measure.events = newEvents;

    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = { ...activeStaff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    if (!this.previousEvent) return score;

    const activeStaff = score.staves[this.staffIndex];
    if (!activeStaff) return score;

    const newMeasures = [...activeStaff.measures];
    
    if (!newMeasures[this.measureIndex]) return score;

    const measure = { ...newMeasures[this.measureIndex] };
    const eventIndex = measure.events.findIndex(e => e.id === this.eventId);

    if (eventIndex === -1) return score;

    const newEvents = [...measure.events];
    newEvents[eventIndex] = this.previousEvent;
    measure.events = newEvents;

    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = { ...activeStaff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }
}
