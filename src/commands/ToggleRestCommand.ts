import { Command } from './types';
import { Score, Note, ScoreEvent, Selection, getActiveStaff } from '@/types';
import { updateEvent } from '@/utils/commandHelpers';

/**
 * Represents the previous state of an event for undo purposes.
 */
interface EventPreviousState {
  staffIndex: number;
  measureIndex: number;
  eventId: string | number;
  isRest: boolean;
  notes: Note[];
}

/**
 * Returns the center pitch for a staff based on its clef.
 * Used when converting rests to notes.
 *
 * @param clef - 'treble' | 'bass' | 'grand'
 * @returns Center pitch (B4 for treble, D3 for bass)
 */
const getCenterPitch = (clef: 'treble' | 'bass' | 'grand'): string => {
  return clef === 'bass' ? 'D3' : 'B4';
};

/**
 * Command to toggle selected events between notes and rests.
 *
 * Logic:
 * - If ALL selected events are rests → convert to notes (centered pitch)
 * - Otherwise (any notes, or mixed) → convert ALL to rests
 *
 * When converting rests to notes:
 * - Pitch is centered on staff (B4 treble, D3 bass)
 * - Single note per event
 *
 * @example
 * dispatch(new ToggleRestCommand(selection));
 */
export class ToggleRestCommand implements Command {
  public readonly type = 'TOGGLE_REST';

  /** Stores previous state for each event for undo */
  private previousStates: EventPreviousState[] = [];

  /**
   * @param selection - Current selection containing events to toggle
   */
  constructor(private selection: Selection) {}

  execute(score: Score): Score {
    // Collect unique events from selection
    const eventMap = new Map<
      string,
      { staffIndex: number; measureIndex: number; eventId: string | number }
    >();

    for (const item of this.selection.selectedNotes) {
      const key = `${item.staffIndex}-${item.measureIndex}-${item.eventId}`;
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          staffIndex: item.staffIndex,
          measureIndex: item.measureIndex,
          eventId: item.eventId,
        });
      }
    }

    // Also include primary selection if not in selectedNotes
    if (this.selection.measureIndex !== null && this.selection.eventId !== null) {
      const key = `${this.selection.staffIndex}-${this.selection.measureIndex}-${this.selection.eventId}`;
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          staffIndex: this.selection.staffIndex,
          measureIndex: this.selection.measureIndex,
          eventId: this.selection.eventId,
        });
      }
    }

    if (eventMap.size === 0) return score;

    // Check if all are rests
    let allRests = true;
    for (const { staffIndex, measureIndex, eventId } of eventMap.values()) {
      const staff = getActiveStaff(score, staffIndex);
      const measure = staff.measures[measureIndex];
      const event = measure?.events.find((e) => e.id === eventId);
      if (event && !event.isRest) {
        allRests = false;
        break;
      }
    }

    // Store previous states and apply changes
    let newScore = score;

    for (const { staffIndex, measureIndex, eventId } of eventMap.values()) {
      const staff = getActiveStaff(newScore, staffIndex);
      const measure = staff.measures[measureIndex];
      const event = measure?.events.find((e) => e.id === eventId);

      if (!event) continue;

      // Store previous state
      this.previousStates.push({
        staffIndex,
        measureIndex,
        eventId,
        isRest: event.isRest ?? false,
        notes: [...event.notes],
      });

      // Apply change
      if (allRests) {
        // Convert to notes - keep existing ID for selection continuity
        const clef = staff.clef;
        const centeredPitch = getCenterPitch(clef);
        const firstNoteId = event.notes[0]?.id || `note-${Date.now()}`;

        newScore = updateEvent(newScore, staffIndex, measureIndex, eventId, (e) => {
          e.isRest = false;
          e.notes = [
            {
              id: firstNoteId,
              pitch: centeredPitch,
            },
          ];
          return true;
        });
      } else {
        // Convert to rests - create a pitchless note to maintain selection compatibility
        const firstNoteId = event.notes[0]?.id || `${eventId}-rest`;
        newScore = updateEvent(newScore, staffIndex, measureIndex, eventId, (e) => {
          e.isRest = true;
          e.notes = [
            {
              id: firstNoteId,
              pitch: null,
              isRest: true,
            },
          ];
          return true;
        });
      }
    }

    return newScore;
  }

  undo(score: Score): Score {
    let newScore = score;

    // Restore all previous states
    for (const state of this.previousStates) {
      newScore = updateEvent(
        newScore,
        state.staffIndex,
        state.measureIndex,
        state.eventId,
        (event) => {
          event.isRest = state.isRest;
          event.notes = [...state.notes];
          return true;
        }
      );
    }

    return newScore;
  }
}
