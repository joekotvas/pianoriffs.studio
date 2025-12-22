import { useCallback } from 'react';
import { ApplyTupletCommand } from '@/commands/TupletCommands';
import { RemoveTupletCommand } from '@/commands/RemoveTupletCommand';
import { Command } from '@/commands/types';

/**
 * Hook providing tuplet manipulation actions.
 * Handles applying and removing tuplets from selected events.
 */
export const useTupletActions = (
  scoreRef: any,
  selection: any,
  dispatch: (command: Command) => void
) => {
  /**
   * Applies a tuplet to a group of consecutive events starting from current selection.
   * @param ratio - Tuplet ratio, e.g., [3, 2] for triplet
   * @param groupSize - Number of events in tuplet group
   */
  const applyTuplet = useCallback(
    (ratio: [number, number], groupSize: number) => {
      if (!scoreRef.current) {
        console.warn('Score not initialized');
        return false;
      }

      if (selection.measureIndex === null || selection.eventId === null) {
        console.warn('No event selected for tuplet application');
        return false;
      }

      const currentScore = scoreRef.current;
      const staffIndex = selection.staffIndex ?? 0;
      const staff = currentScore.staves[staffIndex];
      const measure = staff?.measures[selection.measureIndex];

      if (!measure) {
        console.warn('Selected measure not found');
        return false;
      }

      // Find the index of the selected event
      const eventIndex = measure.events.findIndex((e: any) => e.id === selection.eventId);

      if (eventIndex === -1) {
        console.warn('Selected event not found in measure');
        return false;
      }

      // Validate that we have enough events for the tuplet
      if (eventIndex + groupSize > measure.events.length) {
        console.warn(
          `Not enough events for tuplet (need ${groupSize}, have ${measure.events.length - eventIndex})`
        );
        return false;
      }

      // Apply the tuplet
      dispatch(new ApplyTupletCommand(selection.measureIndex, eventIndex, groupSize, ratio, staffIndex));

      return true;
    },
    [selection, scoreRef, dispatch]
  );

  /**
   * Removes tuplet from the currently selected event's tuplet group.
   */
  const removeTuplet = useCallback(() => {
    if (!scoreRef.current) {
      console.warn('Score not initialized');
      return false;
    }

    if (selection.measureIndex === null || selection.eventId === null) {
      console.warn('No event selected for tuplet removal');
      return false;
    }

    const currentScore = scoreRef.current;
    const staffIndex = selection.staffIndex ?? 0;
    const staff = currentScore.staves[staffIndex];
    const measure = staff?.measures[selection.measureIndex];

    if (!measure) {
      console.warn('Selected measure not found');
      return false;
    }

    // Find the index of the selected event
    const eventIndex = measure.events.findIndex((e: any) => e.id === selection.eventId);

    if (eventIndex === -1) {
      console.warn('Selected event not found in measure');
      return false;
    }

    // Check if the event is part of a tuplet
    const event = measure.events[eventIndex];
    if (!event.tuplet) {
      console.warn('Selected event is not part of a tuplet');
      return false;
    }

    // Remove the tuplet
    dispatch(new RemoveTupletCommand(selection.measureIndex, eventIndex, staffIndex));

    return true;
  }, [selection, scoreRef, dispatch]);

  /**
   * Checks if the current selection can have a tuplet applied.
   * @param groupSize - Number of events needed for tuplet
   */
  const canApplyTuplet = useCallback(
    (groupSize: number): boolean => {
      if (!scoreRef.current) return false;

      if (selection.measureIndex === null || selection.eventId === null) {
        return false;
      }

      const currentScore = scoreRef.current;
      const staffIndex = selection.staffIndex ?? 0;
      const staff = currentScore.staves[staffIndex];
      const measure = staff?.measures[selection.measureIndex];

      if (!measure) return false;

      const eventIndex = measure.events.findIndex((e: any) => e.id === selection.eventId);
      if (eventIndex === -1) return false;

      // Check if we have enough consecutive events
      return eventIndex + groupSize <= measure.events.length;
    },
    [selection, scoreRef]
  );

  /**
   * Checks if the current selection is part of a tuplet.
   */
  /**
   * Returns the ratio of the tuplet the currently selected event is part of, or null.
   */
  const getActiveTupletRatio = useCallback((): [number, number] | null => {
    if (!scoreRef.current) return null;

    if (selection.measureIndex === null || selection.eventId === null) {
      return null;
    }

    const currentScore = scoreRef.current;
    const staffIndex = selection.staffIndex ?? 0;
    const staff = currentScore.staves[staffIndex];
    const measure = staff?.measures[selection.measureIndex];

    if (!measure) return null;

    const event = measure.events.find((e: any) => e.id === selection.eventId);
    return event?.tuplet?.ratio || null;
  }, [selection, scoreRef]);

  return {
    applyTuplet,
    removeTuplet,
    canApplyTuplet,
    getActiveTupletRatio,
  };
};
