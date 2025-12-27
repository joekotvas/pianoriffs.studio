/**
 * ExtendSelectionHorizontallyCommand
 *
 * Extends selection horizontally (left/right) using a unified model that handles
 * both keyboard (Shift+Arrow) and mouse (Shift+Click) interactions.
 *
 * ## Unified Extension Model
 * - **Shift+Arrow**: Extend by 1 event in direction (target = undefined)
 * - **Shift+Click**: Extend to clicked position (target = clicked note)
 *
 * Both preserve the anchor (first selected note) and extend per-staff
 * from the current selection edge.
 *
 * ## Per-Staff Extension
 * When selection spans multiple staves, each staff extends independently
 * from its edge to the target position. This prevents "dropping" notes
 * that the old RangeSelectCommand caused.
 *
 * ## Affected Staves Only
 * Only staves that already have some notes selected OR are the click target
 * will have notes added to the selection. Notes on other staves are not
 * automatically included.
 *
 * ## Full Event Selection
 * All notes in all events within the anchor-to-cursor range are selected
 * on affected staves (chords are fully selected).
 *
 * @example
 * ```typescript
 * // Extend by 1 (Shift+Arrow)
 * new ExtendSelectionHorizontallyCommand({ direction: 'right' })
 *
 * // Extend to target (Shift+Click)
 * new ExtendSelectionHorizontallyCommand({
 *   direction: 'right',
 *   target: { staffIndex: 0, measureIndex: 2, eventId: 'e3', noteId: 'n1' }
 * })
 * ```
 *
 * @see ExtendSelectionVerticallyCommand - Vertical counterpart
 * @see Issue #124
 * @tested ExtendSelectionHorizontally.test.ts
 */

import type { Selection, Score, SelectedNote, ScoreEvent } from '../../types';
import type { SelectionCommand } from './types';
import { getNoteDuration } from '../../utils/core';

/**
 * Multiplier for global position calculation.
 * Position = measureIndex * MEASURE_POSITION_MULTIPLIER + quantWithinMeasure
 * Value chosen to be larger than any reasonable quants-per-measure.
 */
const MEASURE_POSITION_MULTIPLIER = 10000;

/** Direction for horizontal selection extension */
export type HorizontalDirection = 'left' | 'right';

/** Options for ExtendSelectionHorizontallyCommand */
export interface ExtendSelectionHorizontallyOptions {
  /** Direction to extend: 'left' or 'right' */
  direction: HorizontalDirection;
  /** If provided, extend TO this point. Otherwise, extend by 1 event. */
  target?: SelectedNote;
}

/**
 * Represents a note's horizontal position in the score.
 * Uses a global position calculated from measure index and cumulative quants.
 */
interface HorizontalPoint {
  staffIndex: number;
  measureIndex: number;
  eventIndex: number;
  eventId: string;
  noteId: string;
  /** Global position for ordering: measureIndex * MEASURE_POSITION_MULTIPLIER + cumulative quant */
  globalPosition: number;
}

/**
 * Calculates cumulative quant position up to (but not including) the given event index.
 * @param events - Array of events in the measure
 * @param upToIndex - Calculate quants for events [0, upToIndex)
 * @returns Cumulative quant value
 */
function calculateCumulativeQuant(events: ScoreEvent[], upToIndex: number): number {
  let cumQuant = 0;
  for (let i = 0; i < upToIndex; i++) {
    const ev = events[i];
    cumQuant += getNoteDuration(ev.duration, ev.dotted, ev.tuplet);
  }
  return cumQuant;
}

/**
 * Command to extend selection horizontally (left/right) across events.
 *
 * Handles both single-step (keyboard) and multi-step (mouse) extension,
 * preserving multi-staff selection and the anchor model.
 */
export class ExtendSelectionHorizontallyCommand implements SelectionCommand {
  readonly type = 'EXTEND_SELECTION_HORIZONTALLY';
  private direction: HorizontalDirection;
  private target?: SelectedNote;

  constructor(options: ExtendSelectionHorizontallyOptions) {
    this.direction = options.direction;
    this.target = options.target;
  }

  execute(state: Selection, score: Score): Selection {
    // 1. Validate: Need anchor for extension
    if (!state.anchor?.eventId || state.anchor.measureIndex === null) {
      // No anchor - cannot extend. Fall back to treating current focus as anchor.
      if (!state.eventId || state.measureIndex === null) {
        return state; // No selection at all
      }
    }

    const anchor = state.anchor ?? {
      staffIndex: state.staffIndex ?? 0,
      measureIndex: state.measureIndex!,
      eventId: state.eventId!,
      noteId: state.noteId,
    };

    // 2. Build horizontal points for current selection
    const selectedPoints = this.buildHorizontalPoints(state.selectedNotes ?? [], score);

    if (selectedPoints.length === 0) {
      return state;
    }

    // 3. Determine target position for Shift+Arrow (no target means move by 1)
    let targetPosition: number;

    if (this.target) {
      // Shift+Click: Extend to specific target
      const targetPoint = this.noteToHorizontalPoint(this.target, score);
      if (!targetPoint) return state;
      targetPosition = targetPoint.globalPosition;
    } else {
      // Shift+Arrow: Move cursor by 1 event in direction
      // The cursor is the NON-ANCHOR edge of the selection

      const anchorPoint = this.noteToHorizontalPoint(anchor, score);
      if (!anchorPoint) return state;

      // Find both edges
      const leftEdge = this.findEdgePoint(selectedPoints, 'left');
      const rightEdge = this.findEdgePoint(selectedPoints, 'right');
      if (!leftEdge || !rightEdge) return state;

      // Determine which edge is the cursor (the one that's not the anchor)
      const anchorIsLeft = leftEdge.globalPosition === anchorPoint.globalPosition;
      const anchorIsRight = rightEdge.globalPosition === anchorPoint.globalPosition;

      let cursorPoint: HorizontalPoint;
      if (anchorIsLeft && !anchorIsRight) {
        // Anchor at left, cursor at right
        cursorPoint = rightEdge;
      } else if (anchorIsRight && !anchorIsLeft) {
        // Anchor at right, cursor at left
        cursorPoint = leftEdge;
      } else {
        // Single event selected (anchor = cursor), or anchor at both edges
        // In this case, we expand in the pressed direction
        cursorPoint = this.direction === 'right' ? rightEdge : leftEdge;
      }

      // Move cursor in the pressed direction
      const nextCursorPoint = this.findAdjacentEvent(
        score,
        cursorPoint.staffIndex,
        cursorPoint.measureIndex,
        cursorPoint.eventIndex,
        this.direction
      );

      if (nextCursorPoint) {
        // We found an adjacent event in the direction
        targetPosition = nextCursorPoint.globalPosition;
      } else {
        // At boundary - no change
        return state;
      }
    }

    // 4. Determine anchor position (if not already done)
    const anchorPointCheck = this.noteToHorizontalPoint(anchor, score);
    if (!anchorPointCheck) return state;
    const anchorPosition = anchorPointCheck.globalPosition;

    // 5. Collect all affected staves
    const affectedStaves = this.getAffectedStaves(state);

    // 6. For each staff, collect notes between anchor and target positions
    const newSelectedNotes: SelectedNote[] = [];
    const minPos = Math.min(anchorPosition, targetPosition);
    const maxPos = Math.max(anchorPosition, targetPosition);

    for (const staffIndex of affectedStaves) {
      const staff = score.staves[staffIndex];
      if (!staff) continue;

      for (let measureIndex = 0; measureIndex < staff.measures.length; measureIndex++) {
        const measure = staff.measures[measureIndex];
        let cumulativeQuant = 0;

        for (let eventIndex = 0; eventIndex < measure.events.length; eventIndex++) {
          const event = measure.events[eventIndex];
          const eventPosition = measureIndex * MEASURE_POSITION_MULTIPLIER + cumulativeQuant;

          // Check if event falls within range
          if (eventPosition >= minPos && eventPosition <= maxPos) {
            // Add all notes in this event (chord support)
            for (const note of event.notes ?? []) {
              newSelectedNotes.push({
                staffIndex,
                measureIndex,
                eventId: event.id,
                noteId: note.id,
              });
            }
          }

          // Advance cumulative quant for next event
          cumulativeQuant += getNoteDuration(event.duration, event.dotted, event.tuplet);
        }
      }
    }

    // Note: No vertical slice completion - horizontal extension only affects
    // staves that already have selection or are the click target.

    // 8. Dedupe
    const uniqueNotes = this.dedupeNotes(newSelectedNotes);

    if (uniqueNotes.length === 0) {
      return state;
    }

    // 9. Determine new focus (the non-anchor edge = cursor)
    // Find both edges and pick the one that's not the anchor
    const uniquePoints = this.buildHorizontalPoints(uniqueNotes, score);
    const leftEdgeP = this.findEdgePoint(uniquePoints, 'left');
    const rightEdgeP = this.findEdgePoint(uniquePoints, 'right');
    let newFocus: SelectedNote | null = null;

    if (leftEdgeP && rightEdgeP) {
      const anchorPos = anchorPosition;
      if (rightEdgeP.globalPosition !== anchorPos) {
        // Cursor is on the right
        newFocus = {
          staffIndex: rightEdgeP.staffIndex,
          measureIndex: rightEdgeP.measureIndex,
          eventId: rightEdgeP.eventId,
          noteId: rightEdgeP.noteId,
        };
      } else if (leftEdgeP.globalPosition !== anchorPos) {
        // Cursor is on the left
        newFocus = {
          staffIndex: leftEdgeP.staffIndex,
          measureIndex: leftEdgeP.measureIndex,
          eventId: leftEdgeP.eventId,
          noteId: leftEdgeP.noteId,
        };
      } else {
        // Single selection - focus at anchor
        newFocus = {
          staffIndex: leftEdgeP.staffIndex,
          measureIndex: leftEdgeP.measureIndex,
          eventId: leftEdgeP.eventId,
          noteId: leftEdgeP.noteId,
        };
      }
    }

    // 10. Return updated selection (anchor preserved)
    return {
      ...state,
      selectedNotes: uniqueNotes,
      staffIndex: newFocus?.staffIndex ?? state.staffIndex,
      measureIndex: newFocus?.measureIndex ?? state.measureIndex,
      eventId: newFocus?.eventId ?? state.eventId,
      noteId: newFocus?.noteId ?? state.noteId,
      anchor: state.anchor, // Always preserve anchor
    };
  }

  // --- Helper Methods ---

  /**
   * Builds horizontal points for a list of selected notes.
   */
  private buildHorizontalPoints(notes: SelectedNote[], score: Score): HorizontalPoint[] {
    const points: HorizontalPoint[] = [];
    for (const note of notes) {
      const pt = this.noteToHorizontalPoint(note, score);
      if (pt) points.push(pt);
    }
    return points;
  }

  /**
   * Converts a SelectedNote to a HorizontalPoint with global position.
   */
  private noteToHorizontalPoint(note: SelectedNote, score: Score): HorizontalPoint | null {
    const staff = score.staves[note.staffIndex];
    if (!staff) return null;

    const measure = staff.measures[note.measureIndex];
    if (!measure) return null;

    const eventIndex = measure.events.findIndex((e) => e.id === note.eventId);
    if (eventIndex === -1) return null;

    // Calculate cumulative quant up to this event
    const cumulativeQuant = calculateCumulativeQuant(measure.events, eventIndex);

    const globalPosition = note.measureIndex * MEASURE_POSITION_MULTIPLIER + cumulativeQuant;

    return {
      staffIndex: note.staffIndex,
      measureIndex: note.measureIndex,
      eventIndex,
      eventId: note.eventId,
      noteId: note.noteId ?? '',
      globalPosition,
    };
  }

  /**
   * Finds the edge point (leftmost or rightmost) in the selection.
   */
  private findEdgePoint(
    points: HorizontalPoint[],
    direction: HorizontalDirection
  ): HorizontalPoint | null {
    if (points.length === 0) return null;

    return points.reduce((edge, pt) => {
      if (direction === 'right') {
        return pt.globalPosition > edge.globalPosition ? pt : edge;
      } else {
        return pt.globalPosition < edge.globalPosition ? pt : edge;
      }
    });
  }

  /**
   * Finds the adjacent event in the given direction.
   * Returns null if at boundary.
   */
  private findAdjacentEvent(
    score: Score,
    staffIndex: number,
    measureIndex: number,
    eventIndex: number,
    direction: HorizontalDirection
  ): HorizontalPoint | null {
    const staff = score.staves[staffIndex];
    if (!staff) return null;

    const measure = staff.measures[measureIndex];
    if (!measure) return null;

    if (direction === 'right') {
      // Try next event in same measure
      if (eventIndex + 1 < measure.events.length) {
        const nextEvent = measure.events[eventIndex + 1];
        // Calculate cumulative quant up to the NEXT event (so include current event)
        const cumQuant = calculateCumulativeQuant(measure.events, eventIndex + 1);

        return {
          staffIndex,
          measureIndex,
          eventIndex: eventIndex + 1,
          eventId: nextEvent.id,
          noteId: nextEvent.notes?.[0]?.id ?? '',
          globalPosition: measureIndex * MEASURE_POSITION_MULTIPLIER + cumQuant,
        };
      }
      // Try first event in next measure
      if (measureIndex + 1 < staff.measures.length) {
        const nextMeasure = staff.measures[measureIndex + 1];
        if (nextMeasure.events.length > 0) {
          const firstEvent = nextMeasure.events[0];
          return {
            staffIndex,
            measureIndex: measureIndex + 1,
            eventIndex: 0,
            eventId: firstEvent.id,
            noteId: firstEvent.notes?.[0]?.id ?? '',
            globalPosition: (measureIndex + 1) * MEASURE_POSITION_MULTIPLIER,
          };
        }
      }
    } else {
      // Try previous event in same measure
      if (eventIndex > 0) {
        const prevEvent = measure.events[eventIndex - 1];
        const cumQuant = calculateCumulativeQuant(measure.events, eventIndex - 1);

        return {
          staffIndex,
          measureIndex,
          eventIndex: eventIndex - 1,
          eventId: prevEvent.id,
          noteId: prevEvent.notes?.[0]?.id ?? '',
          globalPosition: measureIndex * MEASURE_POSITION_MULTIPLIER + cumQuant,
        };
      }
      // Try last event in previous measure
      if (measureIndex > 0) {
        const prevMeasure = staff.measures[measureIndex - 1];
        if (prevMeasure.events.length > 0) {
          const lastEventIndex = prevMeasure.events.length - 1;
          const lastEvent = prevMeasure.events[lastEventIndex];
          const cumQuant = calculateCumulativeQuant(prevMeasure.events, lastEventIndex);

          return {
            staffIndex,
            measureIndex: measureIndex - 1,
            eventIndex: lastEventIndex,
            eventId: lastEvent.id,
            noteId: lastEvent.notes?.[0]?.id ?? '',
            globalPosition: (measureIndex - 1) * MEASURE_POSITION_MULTIPLIER + cumQuant,
          };
        }
      }
    }

    return null;
  }

  /**
   * Gets all staves that should be affected by this extension.
   */
  private getAffectedStaves(state: Selection): number[] {
    const selectedStaves = new Set<number>();

    // Collect staves from current selection
    for (const note of state.selectedNotes ?? []) {
      selectedStaves.add(note.staffIndex);
    }

    // If target is on a different staff, include it
    if (this.target) {
      selectedStaves.add(this.target.staffIndex);
    }

    // If no selection, use current staff
    if (selectedStaves.size === 0) {
      selectedStaves.add(state.staffIndex ?? 0);
    }

    return Array.from(selectedStaves).sort((a, b) => a - b);
  }

  /**
   * Removes duplicate notes from the list.
   */
  private dedupeNotes(notes: SelectedNote[]): SelectedNote[] {
    const seen = new Set<string>();
    const unique: SelectedNote[] = [];

    for (const note of notes) {
      const key = `${note.staffIndex}-${note.measureIndex}-${note.eventId}-${note.noteId}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(note);
      }
    }

    return unique;
  }
}
