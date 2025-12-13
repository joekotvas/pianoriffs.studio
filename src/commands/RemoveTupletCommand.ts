import { Command } from './types';
import { Score } from '@/types';
import { updateMeasure } from '@/utils/commandHelpers';

/**
 * Command to remove tuplet metadata from a group of events.
 * Converts tuplet notes back to regular notes.
 */
export class RemoveTupletCommand implements Command {
  public readonly type = 'REMOVE_TUPLET';
  private previousStates: Array<{
    eventId: string | number;
    tuplet?: { ratio: [number, number]; groupSize: number; position: number; };
  }> = [];

  constructor(
    private measureIndex: number,
    private eventIndex: number  // Can be any event in the tuplet group
  ) {}

  execute(score: Score): Score {
    // Note: This command assumes STAFF 0 (Active Staff) as per current implementation logic 
    // seen in original file ("getActiveStaff(score)" usually defaults to 0 or active one).
    // Original implementation hardcoded "newStaves[0]". We will assume staffIndex 0.
    const staffIndex = 0;

    return updateMeasure(score, staffIndex, this.measureIndex, (measure) => {
        const events = measure.events;
        const targetEvent = events[this.eventIndex];
        
        if (!targetEvent?.tuplet) return false;

        const { groupSize, position } = targetEvent.tuplet;
        const startIndex = this.eventIndex - position;

        this.previousStates = [];
        const newEvents = [...events];

        for (let i = 0; i < groupSize; i++) {
            const idx = startIndex + i;
            if (idx < 0 || idx >= newEvents.length) continue;

            const event = newEvents[idx];
            this.previousStates.push({
                eventId: event.id,
                tuplet: event.tuplet ? { ...event.tuplet } : undefined
            });

            newEvents[idx] = { ...event, tuplet: undefined };
        }
        
        measure.events = newEvents;
        return true;
    });
  }

  undo(score: Score): Score {
    const staffIndex = 0; 
    
    return updateMeasure(score, staffIndex, this.measureIndex, (measure) => {
        const newEvents = [...measure.events];
        
        this.previousStates.forEach(({ eventId, tuplet }) => {
            const eventIndex = newEvents.findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                newEvents[eventIndex] = { ...newEvents[eventIndex], tuplet };
            }
        });
        
        measure.events = newEvents;
        return true;
    });
  }
}
