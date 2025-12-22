/**
 * useSelection Hook
 *
 * Manages selection state for the score editor using the command pattern.
 * All selection mutations go through engine.dispatch() for consistency.
 *
 * Key exports:
 * - selection: Current selection state
 * - select: Select an event/note
 * - clearSelection: Clear current selection
 * - selectAllInMeasure: Select all notes in a measure
 * - engine: SelectionEngine instance for direct dispatch access
 *
 * @see SelectionEngine
 * @see Issue #135
 */

import { useState, useCallback, useEffect } from 'react';
import { Selection, createDefaultSelection, Score, getActiveStaff, Note, ScoreEvent, SelectedNote, Measure } from '@/types';
import { playNote } from '@/engines/toneEngine';
import { SelectionEngine } from '@/engines/SelectionEngine';
import {
  ClearSelectionCommand,
  SelectAllInEventCommand,
  ToggleNoteCommand,
  RangeSelectCommand,
  SelectEventCommand,
  SelectAllInMeasureCommand,
} from '@/commands/selection';

interface UseSelectionProps {
  score: Score;
}

/** Helper return type for looking up score data */
interface SelectionTarget {
  measure: Measure | undefined;
  event: ScoreEvent | undefined;
  note: Note | undefined;
  eventIndex: number;
  noteIndex: number;
}

export const useSelection = ({ score }: UseSelectionProps) => {
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Engine Initialization
  // ─────────────────────────────────────────────────────────────────────────────
  // Using lazy initializer to avoid React Compiler side-effect warnings
  const [engine] = useState(
    () => new SelectionEngine(createDefaultSelection(), () => score)
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Sync Engine with React State
  // ─────────────────────────────────────────────────────────────────────────────
  const [selection, setSelectionState] = useState<Selection>(() => engine.getState());
  const [lastSelection, setLastSelection] = useState<Selection | null>(null);

  useEffect(() => {
    engine.setScoreGetter(() => score);
  }, [score, engine]);

  useEffect(() => {
    const unsubscribe = engine.subscribe(setSelectionState);
    return unsubscribe;
  }, [engine]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  /** Play audio feedback for notes */
  const playAudioFeedback = useCallback((notes: Note[]) => {
    notes.forEach((n) => {
      if (n.pitch !== null) playNote(n.pitch);
    });
  }, []);

  /**
   * Resolves IDs to actual Score objects and indices.
   * Centralizes the lookup logic used by multiple selection modes.
   */
  const getSelectionTarget = useCallback((
    staffIndex: number,
    measureIndex: number,
    eventId: string | number,
    noteId: string | number | null
  ): SelectionTarget => {
    const measure = getActiveStaff(score, staffIndex).measures[measureIndex];
    
    // Find Event
    const eventIndex = measure?.events.findIndex((e: ScoreEvent) => e.id === eventId) ?? -1;
    const event = eventIndex >= 0 ? measure?.events[eventIndex] : undefined;

    // Find Note
    const noteIndex = (noteId && event)
      ? event.notes.findIndex((n: Note) => n.id === noteId)
      : -1;
    const note = noteIndex >= 0 ? event?.notes[noteIndex] : undefined;

    return { measure, event, note, eventIndex, noteIndex };
  }, [score]);

  /**
   * Updates lastSelection state without changing the active engine selection.
   * Used for "onlyHistory" actions.
   */
  const updateHistoryOnly = useCallback((
    staffIndex: number, 
    measureIndex: number, 
    eventId: string | number, 
    noteId: string | number | null,
    notes: Note[]
  ) => {
    setLastSelection({
      staffIndex,
      measureIndex,
      eventId,
      noteId,
      selectedNotes: notes.map(n => ({
        staffIndex,
        measureIndex,
        eventId,
        noteId: n.id
      })),
      anchor: { staffIndex, measureIndex, eventId, noteId }
    });
    // Ensure the engine is visually clear
    engine.dispatch(new ClearSelectionCommand());
  }, [engine]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Actions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Clears the current selection via ClearSelectionCommand.
   * Stores the previous selection in lastSelection for history.
   */
  const clearSelection = useCallback(() => {
    setLastSelection(engine.getState());
    engine.dispatch(new ClearSelectionCommand());
  }, [engine]);

  /**
   * Selects all notes in a measure.
   *
   * Uses dispatch pattern via SelectAllInMeasureCommand.
   *
   * @param measureIndex - Index of measure to select
   * @param staffIndex - Staff index (defaults to 0)
   *
   * @tested (via SelectAllInMeasureCommand tests)
   */
  const selectAllInMeasure = useCallback(
    (measureIndex: number, staffIndex: number = 0) => {
      engine.dispatch(new SelectAllInMeasureCommand({ staffIndex, measureIndex }));
    },
    [engine]
  );

  /**
   * Selects an event or note in the score.
   *
   * Handles multiple selection modes:
   * - **Standard selection**: Replaces current selection with target
   * - **Multi-select (isMulti)**: Toggles target in selection
   * - **Range select (isShift)**: Selects all notes between anchor and target
   * - **Select all in event (selectAllInEvent)**: Selects all notes in the target event
   * - **History only (onlyHistory)**: Updates lastSelection without visual selection
   *
   * All selection changes go through engine.dispatch() as the canonical pattern.
   *
   * @param measureIndex - Measure index (null to clear)
   * @param eventId - Event ID (null to clear)
   * @param noteId - Note ID (null for event-level selection)
   * @param staffIndex - Staff index (defaults to 0)
   * @param options - Selection mode options
   */
  const select = useCallback(
    (
      measureIndex: number | null,
      eventId: string | number | null,
      noteId: string | number | null,
      staffIndex: number = 0,
      options: {
        isMulti?: boolean;
        isShift?: boolean;
        selectAllInEvent?: boolean;
        onlyHistory?: boolean;
      } = {}
    ) => {
      const { isMulti, isShift, selectAllInEvent, onlyHistory } = options;

      // Guard: No target - clear selection
      if (!eventId || measureIndex === null) {
        if (!onlyHistory) engine.dispatch(new ClearSelectionCommand());
        return;
      }

      const effectiveStaffIndex = staffIndex ?? selection.staffIndex ?? 0;
      const target = getSelectionTarget(effectiveStaffIndex, measureIndex, eventId, noteId);

      // Guard: Invalid target (data out of sync?)
      if (!target.event) return;

      // ── Mode 1: Range Selection (Shift+Click) ──
      if (isShift && !onlyHistory) {
        const currentState = engine.getState();
        const anchor = currentState.anchor;
        
        // Only proceed with range selection if we have a valid anchor
        if (anchor?.eventId && anchor.measureIndex !== null) {
          // Resolve target note (default to first note if clicking event body)
          const targetNoteId = noteId || (target.event.notes[0]?.id);
          
          if (targetNoteId) {
            engine.dispatch(new RangeSelectCommand({
              anchor: anchor as SelectedNote,
              focus: {
                staffIndex: effectiveStaffIndex,
                measureIndex,
                eventId,
                noteId: targetNoteId,
              }
            }));
            if (!target.event.isRest) playAudioFeedback(target.event.notes);
            return;
          }
        }
        // No valid anchor - fall through to standard selection
      }

      // ── Mode 2: Event Selection (Click on Body/Stem OR selectAllInEvent) ──
      if (selectAllInEvent || !noteId) {
        if (onlyHistory) {
          const notes = target.event.notes || [];
          const firstNoteId = notes[0]?.id || null;
          updateHistoryOnly(effectiveStaffIndex, measureIndex, eventId, firstNoteId, notes);
          return;
        }

        engine.dispatch(new SelectAllInEventCommand({
          staffIndex: effectiveStaffIndex,
          measureIndex,
          eventId,
          addToSelection: !!isMulti,
        }));

        if (!target.event.isRest) playAudioFeedback(target.event.notes);
        return;
      }

      // ── Mode 3: Toggle Selection (Cmd/Ctrl+Click) ──
      if (isMulti && !onlyHistory) {
        engine.dispatch(new ToggleNoteCommand({
          staffIndex: effectiveStaffIndex,
          measureIndex,
          eventId,
          noteId,
        }));
        if (target.note) playAudioFeedback([target.note]);
        return;
      }

      // ── Mode 4: History Only ──
      if (onlyHistory) {
        const notes = target.note ? [target.note] : [];
        updateHistoryOnly(effectiveStaffIndex, measureIndex, eventId, noteId, notes);
        return;
      }

      // ── Mode 5: Standard Single Selection ──
      engine.dispatch(new SelectEventCommand({
        staffIndex: effectiveStaffIndex,
        measureIndex,
        eventIndex: Math.max(0, target.eventIndex),
        noteIndex: Math.max(0, target.noteIndex),
      }));

      // Audio feedback
      if (target.note) {
        playAudioFeedback([target.note]);
      } else if (!target.event.isRest) {
        playAudioFeedback(target.event.notes);
      }
    },
    [selection, engine, getSelectionTarget, playAudioFeedback, updateHistoryOnly]
  );

  return {
    selection,
    select,
    clearSelection,
    selectAllInMeasure,
    lastSelection,
    engine,
  };
};
