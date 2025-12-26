/**
 * Core Score Utilities
 *
 * Fundamental score manipulation utilities including duration calculations,
 * score reflow, and horizontal navigation.
 *
 * @tested src/__tests__/core.test.ts
 */
import { NOTE_TYPES, TIME_SIGNATURES } from '@/constants';
import { Measure, ScoreEvent, Note, Selection } from '@/types';
import { measureId, eventId } from '@/utils/id';

/**
 * Calculates the duration of a note in quants.
 * @param type - The note type (e.g., 'quarter', 'eighth')
 * @param dotted - Whether the note is dotted (adds 50% duration)
 * @param tuplet - Optional tuplet ratio (e.g., [3, 2] for triplet)
 * @returns Duration in quants
 */
export const getNoteDuration = (
  duration: string,
  dotted: boolean = false,
  tuplet?: {
    ratio: [number, number];
    groupSize?: number;
    position?: number;
    baseDuration?: string;
    id?: string;
  }
): number => {
  const base = NOTE_TYPES[duration].duration;
  const dottedValue = dotted ? base * 1.5 : base;

  // Apply tuplet ratio if present
  // ratio[1] / ratio[0] because we're fitting ratio[0] notes into the space of ratio[1]
  // e.g., [3, 2] means 3 notes in space of 2, so each note is 2/3 the normal duration
  if (tuplet) {
    return (dottedValue * tuplet.ratio[1]) / tuplet.ratio[0];
  }

  return dottedValue;
};

/**
 * Calculates the total duration of a list of events in quants.
 * @param events - List of events
 * @returns Total quants
 */
export const calculateTotalQuants = (events: ScoreEvent[]) => {
  return events.reduce((acc, event) => {
    return acc + getNoteDuration(event.duration, event.dotted, event.tuplet);
  }, 0);
};

/**
 * Decomposes a total number of quants into a list of valid note durations.
 * Used for reflowing measures when time signature changes.
 * @param quants - Total quants to decompose
 * @returns Array of { duration, dotted, quants }
 */
export const getBreakdownOfQuants = (quants: number) => {
  const options = [
    { quants: 64, type: 'whole', dotted: false },
    { quants: 48, type: 'half', dotted: true },
    { quants: 32, type: 'half', dotted: false },
    { quants: 24, type: 'quarter', dotted: true },
    { quants: 16, type: 'quarter', dotted: false },
    { quants: 12, type: 'eighth', dotted: true },
    { quants: 8, type: 'eighth', dotted: false },
    { quants: 6, type: 'sixteenth', dotted: true },
    { quants: 4, type: 'sixteenth', dotted: false },
    { quants: 3, type: 'thirtysecond', dotted: true },
    { quants: 2, type: 'thirtysecond', dotted: false },
    { quants: 1, type: 'sixtyfourth', dotted: false },
  ];

  let remaining = quants;
  const parts = [];

  for (const opt of options) {
    while (remaining >= opt.quants) {
      parts.push({ duration: opt.type, dotted: opt.dotted, quants: opt.quants });
      remaining -= opt.quants;
    }
    if (remaining === 0) break;
  }
  return parts;
};

// --- LOGIC HELPERS ---

/**
 * Reflows the score based on a new time signature.
 * Redistributes events into measures, splitting and tying notes as needed.
 * @param measures - Current measures
 * @param newTimeSignature - New time signature string (e.g., '4/4')
 * @returns New list of measures
 */
export const reflowScore = (measures: Measure[], newTimeSignature: string) => {
  const maxQuants = TIME_SIGNATURES[newTimeSignature as keyof typeof TIME_SIGNATURES] || 64;

  // 1. Identify if first measure is a pickup
  const isPickup = measures.length > 0 && measures[0].isPickup;

  // 2. Flatten all events
  const allEvents: ScoreEvent[] = [];
  measures.forEach((m: Measure) => {
    m.events.forEach((e: ScoreEvent) => {
      // Clone event to avoid mutation issues
      // Reset ties as we will recalculate them
      const event = {
        ...e,
        notes: e.notes.map((n: Note) => ({ ...n, tied: false })),
      };
      allEvents.push(event);
    });
  });

  const newMeasures: Measure[] = [];
  let currentMeasureEvents: ScoreEvent[] = [];
  let currentMeasureQuants = 0;

  const commitMeasure = (isPickupMeasure = false) => {
    newMeasures.push({
      id: measureId(),
      events: currentMeasureEvents,
      isPickup: isPickupMeasure,
    });
    currentMeasureEvents = [];
    currentMeasureQuants = 0;
  };

  // 3. Handle Pickup Measure
  // Pickup measures are incomplete by definition. When reflowing:
  // - Preserve the original pickup duration if it fits in the new time signature
  // - If pickup overflows new time sig, split at maxQuants
  // - Target duration = min(original pickup duration, maxQuants)

  // Calculate target pickup duration (0 if not a pickup)
  const targetPickupDuration = isPickup
    ? Math.min(calculateTotalQuants(measures[0].events), maxQuants)
    : 0;

  // Initialize loop state based on whether we're filling a pickup
  let isFillingPickup = isPickup;
  const pickupTarget = targetPickupDuration;

  // 4. Redistribute events
  allEvents.forEach((event) => {
    const eventDuration = getNoteDuration(event.duration, event.dotted, event.tuplet);

    // Determine current max for this measure
    let currentMax = maxQuants;
    if (isFillingPickup) {
      currentMax = pickupTarget;
    }

    // Does it fit in current measure?
    if (currentMeasureQuants + eventDuration <= currentMax) {
      currentMeasureEvents.push(event);
      currentMeasureQuants += eventDuration;
    } else {
      // Split event
      const available = currentMax - currentMeasureQuants;
      const remaining = eventDuration - available;

      // If available is 0, we are full.
      if (available > 0) {
        const firstParts = getBreakdownOfQuants(available);
        firstParts.forEach((part) => {
          const newEvent = {
            ...event,
            id: eventId(),
            duration: part.duration,
            dotted: part.dotted,
            notes: event.notes.map((n: Note) => ({ ...n, tied: true })),
          };
          currentMeasureEvents.push(newEvent);
        });
      }

      // Commit current measure
      commitMeasure(isFillingPickup);

      // If we were filling pickup, we are done with it.
      if (isFillingPickup) {
        isFillingPickup = false;
      }

      // Now handle remaining parts
      // We might have remaining > 0.
      if (remaining > 0) {
        const secondParts = getBreakdownOfQuants(remaining);
        secondParts.forEach((part) => {
          const newEvent = {
            ...event,
            id: eventId(),
            duration: part.duration,
            dotted: part.dotted,
            notes: event.notes.map((n: Note) => ({ ...n, tied: event.notes[0].tied })),
          };

          // Check if fits in NEW measure (which is standard size)
          if (currentMeasureQuants + part.quants <= maxQuants) {
            currentMeasureEvents.push(newEvent);
            currentMeasureQuants += part.quants;
          } else {
            // Overflow again (rare for standard notes)
            // Just push and let it overflow for now or split again (omitted for brevity)
            currentMeasureEvents.push(newEvent);
            currentMeasureQuants += part.quants;
          }
        });
      }
    }
  });

  // Commit last measure if not empty
  if (currentMeasureEvents.length > 0) {
    commitMeasure(isFillingPickup); // If we ended while still filling pickup, it's a pickup
  }

  // Ensure at least one measure
  if (newMeasures.length === 0) {
    newMeasures.push({ id: measureId(), events: [], isPickup: isPickup });
  }

  return newMeasures;
};

/**
 * Helper: Robust check for rest event
 */
export const isRestEvent = (event: ScoreEvent): boolean => {
  return !!event.isRest;
};

/**
 * Helper: Robust check for note event (has at least one pitch)
 */
export const isNoteEvent = (event: ScoreEvent): boolean => {
  return !isRestEvent(event) && event.notes?.length > 0;
};

/**
 * Helper to get noteId for an event.
 * Returns ID for first note (pitch or rest).
 */
export const getFirstNoteId = (event: ScoreEvent | undefined | null): string | null => {
  if (!event || !event.notes?.length) return null;
  return event.notes[0].id; // Rests now have notes, so this works for both
};

/**
 * Navigates the selection horizontally (left/right).
 * Vertical navigation (up/down) is handled by calculateVerticalNavigation in interaction.ts.
 */
export const navigateSelection = (
  measures: Measure[],
  selection: Selection,
  direction: 'left' | 'right'
) => {
  const { measureIndex, eventId } = selection;
  if (measureIndex === null || !eventId) return selection;

  const measure = measures[measureIndex];
  if (!measure) return selection;

  const eventIdx = measure.events.findIndex((e: ScoreEvent) => e.id === eventId);
  if (eventIdx === -1) return selection;

  if (direction === 'left') {
    if (eventIdx > 0) {
      const prevEvent = measure.events[eventIdx - 1];
      return { ...selection, eventId: prevEvent.id, noteId: getFirstNoteId(prevEvent) };
    } else if (measureIndex > 0) {
      const prevMeasure = measures[measureIndex - 1];
      if (prevMeasure.events.length > 0) {
        const prevEvent = prevMeasure.events[prevMeasure.events.length - 1];
        return {
          ...selection,
          measureIndex: measureIndex - 1,
          eventId: prevEvent.id,
          noteId: getFirstNoteId(prevEvent),
        };
      }
    }
  } else if (direction === 'right') {
    if (eventIdx < measure.events.length - 1) {
      const nextEvent = measure.events[eventIdx + 1];
      return { ...selection, eventId: nextEvent.id, noteId: getFirstNoteId(nextEvent) };
    } else if (measureIndex < measures.length - 1) {
      const nextMeasure = measures[measureIndex + 1];
      if (nextMeasure.events.length > 0) {
        const nextEvent = nextMeasure.events[0];
        return {
          ...selection,
          measureIndex: measureIndex + 1,
          eventId: nextEvent.id,
          noteId: getFirstNoteId(nextEvent),
        };
      }
    }
  }
  // Note: up/down is handled by calculateVerticalNavigation in interaction.ts

  return selection;
};
