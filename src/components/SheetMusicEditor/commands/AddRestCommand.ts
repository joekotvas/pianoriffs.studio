import { Command } from './types';
import { Score, ScoreEvent } from '../types';
import { updateMeasure } from '../utils/commandHelpers';

/**
 * Command to add a rest event to a measure.
 * Rests have `notes: []` and `isRest: true`.
 */
export class AddRestCommand implements Command {
  public readonly type = 'ADD_REST';

  constructor(
    private measureIndex: number,
    private duration: string,
    private isDotted: boolean,
    private index?: number,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
        const newEvents = [...measure.events];
        
        const newEvent: ScoreEvent = {
            id: `rest-${Date.now()}`,
            duration: this.duration,
            dotted: this.isDotted,
            notes: [],
            isRest: true
        };

        if (this.index !== undefined && this.index >= 0 && this.index <= newEvents.length) {
            newEvents.splice(this.index, 0, newEvent);
        } else {
            newEvents.push(newEvent);
        }

        measure.events = newEvents;
        return true;
    });
  }

  undo(score: Score): Score {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
        const newEvents = [...measure.events];
        
        if (this.index !== undefined && this.index >= 0 && this.index < newEvents.length) {
             newEvents.splice(this.index, 1);
        } else {
             newEvents.pop(); // Remove last event
        }
        
        measure.events = newEvents;
        return true;
    });
  }
}
