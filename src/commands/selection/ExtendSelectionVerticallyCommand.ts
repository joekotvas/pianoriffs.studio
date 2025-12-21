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
 * ## Vertical Metric
 * Notes are ordered by a combined metric: (10 - staffIndex) * 1000 + midi
 * This ensures treble staff notes are always "above" bass staff notes,
 * and within a staff, higher pitches are "above" lower pitches.
 *
 * @example
 * ```typescript
 * // Extend selection downward
 * const cmd = new ExtendSelectionVerticallyCommand({ direction: 'down' });
 * const newSelection = cmd.execute(currentSelection, score);
 * ```
 *
 * @see VerticalAnchors in types.ts
 * @see Issue #101
 * @tested ExtendSelectionVertically.test.ts
 */

import type { Selection, Score, SelectedNote, ScoreEvent } from '../../types';
import type { SelectionCommand } from './types';
import { getNoteDuration } from '../../utils/core';
import { getMidi } from '../../services/MusicService';

/** Direction for vertical selection extension */
export type ExpandDirection = 'up' | 'down' | 'all';

/** Options for ExtendSelectionVerticallyCommand */
export interface ExtendSelectionVerticallyOptions {
  /** Direction to extend: 'up', 'down', or 'all' (select entire column) */
  direction: ExpandDirection;
}

/**
 * Represents a note's position in vertical space.
 * Used internally for sorting and comparison.
 * @internal
 */
interface VerticalPoint {
  measureIndex: number;
  staffIndex: number;
  eventId: string | number;
  noteId: string | number | null;
  /** MIDI pitch value (higher = higher pitch) */
  midi: number;
  /** Global quant time: measureIndex * 100000 + quant */
  time: number;
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
    const isFirstCall = !state.verticalAnchors || !this.selectionsMatch(
      state.verticalAnchors.originSelection,
      state.selectedNotes
    );
    
    // eslint-disable-next-line no-console
    console.info(`EXTEND VERTICAL: ${isFirstCall ? 'FIRST CALL' : 'CONTINUATION'} (direction: ${this.direction})`);

    // 3. Group current selection by Time Slice
    const slices = new Map<number, VerticalPoint[]>();
    for (const note of state.selectedNotes) {
       const pt = this.toVerticalPoint(note, score);
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
        let minM = this.calculateVerticalMetric(minPt.staffIndex, minPt.midi);
        let maxM = minM;

        for (let i = 1; i < points.length; i++) {
          const p = points[i];
          const m = this.calculateVerticalMetric(p.staffIndex, p.midi);
          if (m < minM) { minM = m; minPt = p; }
          if (m > maxM) { maxM = m; maxPt = p; }
        }
        
        // Set anchor at the OPPOSITE extreme from the direction
        // DOWN: anchor at TOP (maxPt), so cursor expands downward
        // UP: anchor at BOTTOM (minPt), so cursor expands upward
        const anchorPt = (this.direction === 'down' || this.direction === 'all') ? maxPt : minPt;
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
       
       const sliceAnchorPt = this.toVerticalPoint(storedAnchor, score);
       if (!sliceAnchorPt) continue;

       // Find current cursor (the extreme in the direction of movement)
       let minPt = points[0];
       let maxPt = points[0];
       let minM = this.calculateVerticalMetric(minPt.staffIndex, minPt.midi);
       let maxM = minM;

       for (let i = 1; i < points.length; i++) {
         const p = points[i];
         const m = this.calculateVerticalMetric(p.staffIndex, p.midi);
         if (m < minM) { minM = m; minPt = p; }
         if (m > maxM) { maxM = m; maxPt = p; }
       }
       
       // Cursor is at the OPPOSITE extreme from the anchor
       // This allows both expansion (cursor away from anchor) and contraction (cursor toward anchor)
       const anchorMetric = this.calculateVerticalMetric(sliceAnchorPt.staffIndex, sliceAnchorPt.midi);
       const sliceCursorPt = (anchorMetric >= maxM) ? minPt : maxPt;
       
       // Collect Stack (All notes at this time, sorted Top to Bottom)
       const stack = this.collectVerticalStack(score, time);
       
       // Move Cursor
       const newCursorPt = this.moveCursorInStack(stack, sliceCursorPt, this.direction);
       
       if (newCursorPt.noteId !== sliceCursorPt.noteId || newCursorPt.eventId !== sliceCursorPt.eventId) {
           hasChanged = true;
       }
       
       // Check if this slice contained the global focus to update it
       const wasFocusSlice = points.some(p => p.noteId === state.noteId && p.eventId === state.eventId);
       if (wasFocusSlice) {
          newFocusPoint = newCursorPt;
       }
       
       // Collect Range (Anchor..NewCursor)
       const m1 = this.calculateVerticalMetric(sliceAnchorPt.staffIndex, sliceAnchorPt.midi);
       const m2 = this.calculateVerticalMetric(newCursorPt.staffIndex, newCursorPt.midi);
       const low = Math.min(m1, m2);
       const high = Math.max(m1, m2);

       for (const p of stack) {
          const m = this.calculateVerticalMetric(p.staffIndex, p.midi);
          if (m >= low && m <= high) {
             newSelectedNotes.push({
               staffIndex: p.staffIndex,
               measureIndex: p.measureIndex,
               eventId: p.eventId,
               noteId: p.noteId
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
      originSelection: isFirstCall ? [...state.selectedNotes] : state.verticalAnchors!.originSelection,
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

  // =========================================================================================
  // HELPERS
  // =========================================================================================

  /**
   * Calculate a linear metric for vertical ordering.
   *
   * Formula: (100 - staffIndex) * 1000 + midi
   * - Staff contribution: treble (0) = 100000, bass (1) = 99000
   * - MIDI contribution: 0-127 range
   *
   * This ensures all treble notes are "above" all bass notes,
   * and within each staff, higher pitches have higher values.
   *
   * Uses 100 as base to support scores with up to 100 staves
   * before ordering inverts (sufficient for orchestral scores).
   *
   * @param staffIndex - Staff index (0 = treble, 1 = bass)
   * @param midi - MIDI pitch value (0-127)
   * @returns Combined metric suitable for vertical sorting
   * @internal
   */
  private calculateVerticalMetric(staffIndex: number, midi: number): number {
    // BUG FIX: Increased from 10 to 100 to prevent negative values
    // in orchestral scores with many staves
    return ((100 - staffIndex) * 1000) + midi;
  }

  /**
   * Convert a SelectedNote to a VerticalPoint with pitch and time info.
   *
   * Walks through measure events to calculate the quant time,
   * then resolves the MIDI pitch from the note data.
   *
   * @param note - The selected note to convert
   * @param score - Full score for context
   * @returns VerticalPoint with all positioning info, or null if not found
   * @internal
   */
  private toVerticalPoint(note: SelectedNote, score: Score): VerticalPoint | null {
    const staff = score.staves[note.staffIndex];
    if (!staff) return null;
    const measure = staff.measures[note.measureIndex];
    if (!measure) return null;
    
    // Find event and time
    let time = 0;
    let foundEvent: ScoreEvent | undefined;
    let currentQuant = 0;

    for (const e of measure.events) {
      const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
      if (e.id === note.eventId) {
        foundEvent = e;
        time = (note.measureIndex * 100000) + currentQuant;
        break;
      }
      currentQuant += duration;
    }

    if (!foundEvent) return null;

    // Resolve pitch
    let midi = 60; // Default
    let realNoteId = note.noteId;
    
    if (foundEvent.isRest) {
      midi = staff.clef === 'bass' ? 48 : 71; 
    } else if (note.noteId) {
      const n = foundEvent.notes.find((n) => n.id === note.noteId);
      if (n) midi = getMidi(n.pitch || 'C4');
    } else if (foundEvent.notes.length > 0) {
       midi = getMidi(foundEvent.notes[0].pitch || 'C4');
       realNoteId = foundEvent.notes[0].id;
    }

    return {
      measureIndex: note.measureIndex,
      staffIndex: note.staffIndex,
      eventId: note.eventId,
      noteId: realNoteId,
      midi,
      time
    };
  }

  /**
   * Collect all notes at a specific time across all staves.
   *
   * Finds events at the exact quant position in each staff's measure,
   * creating a "vertical stack" of all notes that could be selected.
   * Results are sorted from highest to lowest (visual top to bottom).
   *
   * @param score - Full score to search
   * @param globalTime - Global time (measureIndex * 100000 + quant)
   * @returns Array of VerticalPoints sorted by descending metric (top to bottom)
   * @internal
   */
  private collectVerticalStack(score: Score, globalTime: number): VerticalPoint[] {
    const stack: VerticalPoint[] = [];
    
    const mIndex = Math.floor(globalTime / 100000);
    const timeQuant = globalTime % 100000;

    for (let sIdx = 0; sIdx < score.staves.length; sIdx++) {
      const staff = score.staves[sIdx];
      const measure = staff.measures[mIndex];
      if (!measure) continue;

      let q = 0;
      for (const event of measure.events) {
        const dur = getNoteDuration(event.duration, event.dotted, event.tuplet);
        
        if (q === timeQuant) { 
          // Handle Rests - they have notes array with pitch: null
          // IMPORTANT: Rests DO have noteId in their notes array
          if (event.isRest && event.notes && event.notes.length > 0) {
            const restNote = event.notes[0];
            const midi = staff.clef === 'bass' ? 48 : 71; // Match toVerticalPoint logic
            stack.push({
              staffIndex: sIdx,
              measureIndex: mIndex,
              eventId: event.id,
              noteId: restNote.id, // Use actual noteId from rest's notes array
              midi: midi,
              time: globalTime
            });
          }
          // Handle regular notes
          else if (event.notes) {
            for (const note of event.notes) {
               stack.push({
                 staffIndex: sIdx,
                 measureIndex: mIndex,
                 eventId: event.id,
                 noteId: note.id,
                 midi: getMidi(note.pitch || 'C4'),
                 time: globalTime
               });
            }
          }
        }
        
        q += dur;
        
        // OPTIMIZATION: Early break if we've passed the target quant
        if (q > timeQuant) break;
      }
    }

    // Sort High to Low (Visual Top to Bottom)
    return stack.sort((a, b) => {
      const mA = this.calculateVerticalMetric(a.staffIndex, a.midi);
      const mB = this.calculateVerticalMetric(b.staffIndex, b.midi);
      return mB - mA; // Descending
    });
  }

  /**
   * Move the cursor one step in the vertical stack.
   *
   * Given the current cursor position in the stack, moves it
   * up (toward index 0) or down (toward end) by one step.
   * Direction 'all' moves to the bottom of the stack.
   *
   * @param stack - Sorted vertical stack (top to bottom)
   * @param current - Current cursor position
   * @param direction - Direction to move: 'up', 'down', or 'all'
   * @returns New cursor position, or current if at boundary or not found
   * @internal
   */
  private moveCursorInStack(
    stack: VerticalPoint[], 
    current: VerticalPoint, 
    direction: ExpandDirection
  ): VerticalPoint {
    if (stack.length === 0) return current;

    // Find index
    const idx = stack.findIndex(p => 
      p.staffIndex === current.staffIndex &&
      p.eventId === current.eventId &&
      p.noteId === current.noteId
    );

    if (idx === -1) {
      return current;
    }

    let newIdx = idx;
    if (direction === 'up') {
      newIdx = Math.max(0, idx - 1);
    } else if (direction === 'down') {
      newIdx = Math.min(stack.length - 1, idx + 1);
    } else if (direction === 'all') {
      newIdx = stack.length - 1; 
    }

    return stack[newIdx];
  }

  /**
   * Compare two SelectedNote arrays for equality.
   *
   * Order-independent comparison using composite keys.
   * Used to detect if selection has changed externally (triggering first-call behavior).
   *
   * @param a - First selection array
   * @param b - Second selection array
   * @returns True if both arrays contain the same notes (regardless of order)
   * @internal
   */
  private selectionsMatch(a: SelectedNote[], b: SelectedNote[]): boolean {
    if (a.length !== b.length) return false;
    
    const toKey = (n: SelectedNote) => 
      `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`;
    
    const setA = new Set(a.map(toKey));
    return b.every(note => setA.has(toKey(note)));
  }
}
