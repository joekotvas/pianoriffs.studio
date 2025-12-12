import { Command } from './types';
import { Score, ScoreEvent } from '../types';
import { updateMeasure } from '../utils/commandHelpers';

/**
 * Command to add a rest event to a measure.
 * 
 * Creates a ScoreEvent with:
 * - isRest: true
 * - notes: [] (empty array)
 * - duration and dotted as specified
 * 
 * @example
 * dispatch(new AddRestCommand(0, 'quarter', false, 2, undefined, 0));
 */
export class AddRestCommand implements Command {
  public readonly type = 'ADD_REST';

  /**
   * @param measureIndex - Index of the target measure
   * @param duration - Duration of the rest (whole, half, quarter, etc.)
   * @param isDotted - Whether the rest is dotted
   * @param index - Optional insertion index within measure events
   * @param eventId - Optional custom event ID (defaults to timestamp)
   * @param staffIndex - Staff index (default 0)
   */
  constructor(
    private measureIndex: number,
    private duration: string,
    private isDotted: boolean,
    private index?: number,
    private eventId?: string,
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
      const newEvents = [...measure.events];
      
      const eventId = this.eventId || Date.now().toString();
      // Create a "rest note" - a pitchless note entry that integrates with selection
      const restNoteId = `${eventId}-rest`;
      
      const newEvent: ScoreEvent = {
        id: eventId,
        duration: this.duration,
        dotted: this.isDotted,
        notes: [{
          id: restNoteId,
          pitch: null,  // Rests have no pitch
          isRest: true
        }],
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
        newEvents.pop();
      }
      
      measure.events = newEvents;
      return true;
    });
  }
}
