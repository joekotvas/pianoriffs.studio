import { Command } from './types';
import { Score, Note, ScoreEvent } from '@/types';
import { updateMeasure } from '@/utils/commandHelpers';

/**
 * Unified command to add a score event (note or rest) to a measure.
 *
 * This replaces the separate AddNoteCommand and AddRestCommand with a single,
 * unified implementation that handles both cases.
 *
 * @example
 * // Add a note
 * dispatch(new AddEventCommand(0, false, notePayload, 'quarter', false));
 *
 * // Add a rest
 * dispatch(new AddEventCommand(0, true, null, 'quarter', false));
 */
export class AddEventCommand implements Command {
  public readonly type = 'ADD_EVENT';

  /**
   * @param measureIndex - Index of the target measure
   * @param isRest - Whether this event is a rest
   * @param note - Note payload (null for rests)
   * @param duration - Duration of the event (whole, half, quarter, etc.)
   * @param isDotted - Whether the event is dotted
   * @param index - Optional insertion index within measure events
   * @param eventId - Optional custom event ID (defaults to timestamp)
   * @param staffIndex - Staff index (default 0)
   */
  constructor(
    private measureIndex: number,
    private isRest: boolean,
    private note: Note | null,
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

      let newEvent: ScoreEvent;

      if (this.isRest) {
        // Create a rest event with a "pitchless note" for selection compatibility
        const restNoteId = `${eventId}-rest`;
        newEvent = {
          id: eventId,
          duration: this.duration,
          dotted: this.isDotted,
          isRest: true,
          notes: [
            {
              id: restNoteId,
              pitch: null,
              isRest: true,
            },
          ],
        };
      } else {
        // Create a note event
        newEvent = {
          id: eventId,
          duration: this.duration,
          dotted: this.isDotted,
          isRest: false,
          notes: this.note ? [this.note] : [],
        };
      }

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
