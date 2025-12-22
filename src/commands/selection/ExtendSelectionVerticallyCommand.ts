/**
 * ExtendSelectionVerticallyCommand
 *
 * Extends selection vertically using a per-slice anchor approach.
 * Each "Vertical Slice" (time point) maintains its own anchor, allowing
 * independent chords at different times to be extended simultaneously.
 *
 * ## Per-Slice Anchors
 * On the first call (or when selection changes externally), anchors are
 * computed for each slice based on the extension direction:
 * - DOWN: Anchor at TOP of slice (selection expands downward)
 * - UP: Anchor at BOTTOM of slice (selection expands upward)
 *
 * On subsequent calls (continuation), stored anchors are reused, enabling
 * both expansion (cursor moves away from anchor) and contraction (cursor
 * moves toward anchor when direction changes).
 *
 * @example
 * ```typescript
 * // Extend selection downward
 * const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
 * const newSelection = cmd.execute(currentSelection, score);
 * ```
 *
 * @see VerticalAnchors in types.ts
 * @see verticalStack.ts for utility functions
 * @see Issue #101
 * @tested ExtendSelectionVertically.test.ts
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';
import {
  VerticalPoint,
  calculateVerticalMetric,
  toVerticalPoint,
  collectVerticalStack,
  moveCursorInStack,
  selectionsMatch,
} from '../../utils/verticalStack';

/** Direction for vertical selection extension */
export type ExpandDirection = 'up' | 'down' | 'all';

/** Options for ExtendSelectionVerticallyCommand */
export interface ExtendSelectionVerticallyOptions {
  /** Direction to extend: 'up', 'down', or 'all' (select entire column) */
  direction: ExpandDirection;
}

/**
 * Command to extend selection vertically (up/down) through chords and staves.
 *
 * Implements per-slice anchoring for predictable expansion and contraction
 * when repeatedly pressing shift+up/down.
 */
export class ExtendSelectionVerticallyCommand implements SelectionCommand {
  readonly type = 'EXTEND_SELECTION_VERTICALLY';
  private direction: ExpandDirection;

  /**
   * Create a new ExtendSelectionVerticallyCommand.
   * @param options - Configuration with direction to extend
   */
  constructor(options: ExtendSelectionVerticallyOptions) {
    this.direction = options.direction;
  }

  /**
   * Execute the vertical extension command.
   *
   * Algorithm:
   * 1. Validate selection exists
   * 2. Determine if first call or continuation (compare selection snapshot)
   * 3. Group selected notes by time slice
   * 4. Compute or retrieve per-slice anchors
   * 5. For each slice: move cursor, collect notes in range
   * 6. Return updated selection with new verticalAnchors state
   *
   * @param state - Current selection state
   * @param score - Full score data for context
   * @returns Updated selection with extended notes
   */
  execute(state: Selection, score: Score): Selection {
    // 1. Basic Validation - need at least one selected note
    if (state.selectedNotes.length === 0) {
      return state;
    }

    // 2. Determine if this is the first call or a continuation
    //    First call: verticalAnchors is null OR selection has changed from snapshot
    const isFirstCall =
      !state.verticalAnchors ||
      !selectionsMatch(state.verticalAnchors.originSelection, state.selectedNotes);

    // 3. Group current selection by Time Slice
    const slices = new Map<number, VerticalPoint[]>();
    for (const note of state.selectedNotes) {
      const pt = toVerticalPoint(note, score);
      if (pt) {
        if (!slices.has(pt.time)) slices.set(pt.time, []);
        slices.get(pt.time)!.push(pt);
      }
    }

    // 4. Compute or retrieve per-slice anchors
    let sliceAnchors: Record<number, SelectedNote>;

    if (isFirstCall) {
      // First call: Compute anchors based on input direction
      sliceAnchors = {};
      for (const [time, points] of slices.entries()) {
        if (points.length === 0) continue;

        // Find extremes in this slice
        let minPt = points[0];
        let maxPt = points[0];
        let minM = calculateVerticalMetric(minPt.staffIndex, minPt.midi);
        let maxM = minM;

        for (let i = 1; i < points.length; i++) {
          const p = points[i];
          const m = calculateVerticalMetric(p.staffIndex, p.midi);
          if (m < minM) {
            minM = m;
            minPt = p;
          }
          if (m > maxM) {
            maxM = m;
            maxPt = p;
          }
        }

        // Set anchor at the OPPOSITE extreme from the direction
        // DOWN: anchor at TOP (maxPt), so cursor expands downward
        // UP: anchor at BOTTOM (minPt), so cursor expands upward
        const anchorPt = this.direction === 'down' || this.direction === 'all' ? maxPt : minPt;
        sliceAnchors[time] = {
          staffIndex: anchorPt.staffIndex,
          measureIndex: anchorPt.measureIndex,
          eventId: anchorPt.eventId,
          noteId: anchorPt.noteId,
        };
      }
    } else {
      // Continuation: Use stored anchors
      sliceAnchors = state.verticalAnchors!.sliceAnchors;
    }

    // 5. Process Slices - expand selection
    const newSelectedNotes: SelectedNote[] = [];
    let newFocusPoint: VerticalPoint | null = null;
    let hasChanged = false;

    for (const [time, points] of slices.entries()) {
      if (points.length === 0) continue;

      // Get the stored anchor for this slice
      const storedAnchor = sliceAnchors[time];
      if (!storedAnchor) continue;

      const sliceAnchorPt = toVerticalPoint(storedAnchor, score);
      if (!sliceAnchorPt) continue;

      // Find current cursor (the extreme in the direction of movement)
      let minPt = points[0];
      let maxPt = points[0];
      let minM = calculateVerticalMetric(minPt.staffIndex, minPt.midi);
      let maxM = minM;

      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        const m = calculateVerticalMetric(p.staffIndex, p.midi);
        if (m < minM) {
          minM = m;
          minPt = p;
        }
        if (m > maxM) {
          maxM = m;
          maxPt = p;
        }
      }

      // Cursor is at the OPPOSITE extreme from the anchor
      // This allows both expansion (cursor away from anchor) and contraction (cursor toward anchor)
      const anchorMetric = calculateVerticalMetric(sliceAnchorPt.staffIndex, sliceAnchorPt.midi);
      const sliceCursorPt = anchorMetric >= maxM ? minPt : maxPt;

      // Collect Stack (All notes at this time, sorted Top to Bottom)
      const stack = collectVerticalStack(score, time);

      // Move Cursor
      const newCursorPt = moveCursorInStack(stack, sliceCursorPt, this.direction);

      if (
        newCursorPt.noteId !== sliceCursorPt.noteId ||
        newCursorPt.eventId !== sliceCursorPt.eventId
      ) {
        hasChanged = true;
      }

      // Check if this slice contained the global focus to update it
      const wasFocusSlice = points.some(
        (p) => p.noteId === state.noteId && p.eventId === state.eventId
      );
      if (wasFocusSlice) {
        newFocusPoint = newCursorPt;
      }

      // Collect Range (Anchor..NewCursor)
      const m1 = calculateVerticalMetric(sliceAnchorPt.staffIndex, sliceAnchorPt.midi);
      const m2 = calculateVerticalMetric(newCursorPt.staffIndex, newCursorPt.midi);
      const low = Math.min(m1, m2);
      const high = Math.max(m1, m2);

      for (const p of stack) {
        const m = calculateVerticalMetric(p.staffIndex, p.midi);
        if (m >= low && m <= high) {
          newSelectedNotes.push({
            staffIndex: p.staffIndex,
            measureIndex: p.measureIndex,
            eventId: p.eventId,
            noteId: p.noteId,
          });
        }
      }
    }

    // 6. Build verticalAnchors for result
    // Keep sliceAnchors from first call; update originSelection to NEW selection
    const effectiveDirection = this.direction === 'all' ? 'down' : this.direction;
    const newVerticalAnchors = {
      direction: effectiveDirection,
      sliceAnchors,
      // On first call, originSelection is the input. On change, update to new selection.
      originSelection: isFirstCall
        ? [...state.selectedNotes]
        : state.verticalAnchors!.originSelection,
    };

    // If no change happened, still update verticalAnchors if this was first call
    if (!hasChanged) {
      if (isFirstCall) {
        return { ...state, verticalAnchors: newVerticalAnchors };
      }
      return state;
    }

    // 7. Return Result with verticalAnchors
    // IMPORTANT: Update originSelection to the NEW selection so next call detects continuation
    return {
      ...state,
      selectedNotes: newSelectedNotes,
      noteId: newFocusPoint?.noteId ?? state.noteId,
      eventId: newFocusPoint?.eventId ?? state.eventId,
      staffIndex: newFocusPoint?.staffIndex ?? state.staffIndex,
      measureIndex: newFocusPoint?.measureIndex ?? state.measureIndex,
      verticalAnchors: {
        ...newVerticalAnchors,
        originSelection: [...newSelectedNotes], // Update snapshot to new selection
      },
    };
  }
}
