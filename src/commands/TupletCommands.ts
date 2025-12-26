import { Command } from './types';
import { Score } from '@/types';
import { tupletId as createTupletId } from '@/utils/id';

/**
 * Command to apply tuplet metadata to a group of consecutive events.
 * Converts a sequence of regular notes into a tuplet (e.g., triplet, quintuplet).
 */
export class ApplyTupletCommand implements Command {
  public readonly type = 'APPLY_TUPLET';
  private previousStates: Array<{
    eventId: string;
    tuplet?: { ratio: [number, number]; groupSize: number; position: number };
  }> = [];

  constructor(
    private measureIndex: number,
    private startEventIndex: number,
    private groupSize: number,
    private ratio: [number, number], // e.g., [3, 2] for triplet
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    const staff = score.staves[this.staffIndex];
    if (!staff) return score;
    const newMeasures = [...staff.measures];

    if (!newMeasures[this.measureIndex]) {
      return score; // Measure not found
    }

    const measure = { ...newMeasures[this.measureIndex] };
    const newEvents = [...measure.events];

    // Validate that we have enough events for the tuplet
    if (this.startEventIndex + this.groupSize > newEvents.length) {
      return score; // Not enough events
    }

    // Store previous states for undo
    this.previousStates = [];

    // Generate a unique ID for this tuplet group
    const tupletId = createTupletId();

    // Apply tuplet metadata to the group of events
    for (let i = 0; i < this.groupSize; i++) {
      const eventIndex = this.startEventIndex + i;

      if (eventIndex >= newEvents.length) {
        break; // Not enough events
      }

      const event = newEvents[eventIndex];

      // Store previous state
      this.previousStates.push({
        eventId: event.id,
        tuplet: event.tuplet ? { ...event.tuplet } : undefined,
      });

      // Apply tuplet metadata
      // Determine base duration from the first event (or passed in?)
      // For now, assume uniform duration or take the first one.
      // Ideally, the command should accept baseDuration or infer it.
      // Let's infer it from the first event in the selection if not mixed?
      // Or just take the duration of the current event?
      // Wait, for mixed duration support, the baseDuration is the "unit" of the tuplet.
      // e.g. "Eighth Note Triplet".
      // Usually the user selects notes of the same duration to make a tuplet.
      // So taking the duration of the first note is a safe bet for creation.

      const baseDuration = newEvents[this.startEventIndex].duration;

      newEvents[eventIndex] = {
        ...event,
        tuplet: {
          ratio: this.ratio,
          groupSize: this.groupSize,
          position: i,
          baseDuration,
          id: tupletId,
        },
      };
    }

    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;

    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = { ...staff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    const staff = score.staves[this.staffIndex];
    if (!staff) return score;
    const newMeasures = [...staff.measures];

    if (!newMeasures[this.measureIndex]) {
      return score;
    }

    const measure = { ...newMeasures[this.measureIndex] };
    const newEvents = [...measure.events];

    // Restore previous states
    this.previousStates.forEach(({ eventId, tuplet }) => {
      const eventIndex = newEvents.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        const event = newEvents[eventIndex];
        newEvents[eventIndex] = {
          ...event,
          tuplet,
        };
      }
    });

    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;

    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = { ...staff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }
}
