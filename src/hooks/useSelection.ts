import { useState, useCallback, useEffect } from 'react';
import { Selection, createDefaultSelection, Score, getActiveStaff, Note, ScoreEvent, SelectedNote } from '@/types';
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

export const useSelection = ({ score }: UseSelectionProps) => {
  // Create SelectionEngine instance using useState with lazy initializer
  // This avoids React Compiler errors about accessing refs during render
  const [engine] = useState(
    () => new SelectionEngine(createDefaultSelection(), () => score)
  );

  // Keep engine's score reference in sync
  useEffect(() => {
    engine.setScoreGetter(() => score);
  }, [score, engine]);

  // React state syncs from engine
  const [selection, setSelectionState] = useState<Selection>(() => engine.getState());
  const [lastSelection, setLastSelection] = useState<Selection | null>(null);

  // Subscribe React state to engine changes
  useEffect(() => {
    const unsubscribe = engine.subscribe((newSelection) => {
      setSelectionState(newSelection);
    });
    return unsubscribe;
  }, [engine]);

  // --- Helpers ---

  const playAudioFeedback = useCallback((notes: Note[]) => {
    notes.forEach((n) => {
      if (n.pitch !== null) playNote(n.pitch);
    });
  }, []);

  // --- Actions (all via dispatch) ---

  /**
   * Clears the current selection via ClearSelectionCommand
   */
  const clearSelection = useCallback(() => {
    setLastSelection(engine.getState());
    engine.dispatch(new ClearSelectionCommand());
  }, [engine]);

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
      const {
        isMulti = false,
        isShift = false,
        selectAllInEvent = false,
        onlyHistory = false,
      } = options;

      // Early exit: no target specified
      if (!eventId || measureIndex === null) {
        if (!onlyHistory) {
          engine.dispatch(new ClearSelectionCommand());
        }
        return;
      }

      const startStaffIndex = staffIndex !== undefined ? staffIndex : selection.staffIndex || 0;

      // Get event for audio feedback and validation
      const measure = getActiveStaff(score, startStaffIndex).measures[measureIndex];
      const event = measure?.events.find((e: ScoreEvent) => e.id === eventId);

      // Handle Shift+Click (Range Selection)
      if (isShift && !onlyHistory) {
        const currentState = engine.getState();
        const anchor = currentState.anchor || {
          staffIndex: currentState.staffIndex || 0,
          measureIndex: currentState.measureIndex!,
          eventId: currentState.eventId!,
          noteId: currentState.noteId,
        };

        // If anchor is invalid, fall through to standard selection
        if (anchor.eventId && anchor.measureIndex !== null) {
          // Resolve noteId if null (pick first note of event)
          let targetNoteId = noteId;
          if (!targetNoteId && event && event.notes.length > 0) {
            targetNoteId = event.notes[0].id;
          }

          if (targetNoteId) {
            const focus: SelectedNote = {
              staffIndex: startStaffIndex,
              measureIndex,
              eventId,
              noteId: targetNoteId,
            };

            engine.dispatch(new RangeSelectCommand({ anchor: anchor as SelectedNote, focus }));

            // Audio feedback for range selection
            if (event && !event.isRest) {
              playAudioFeedback(event.notes || []);
            }
            return;
          }
        }
      }

      // Handle selectAllInEvent or null noteId (click on event body/stem)
      if (selectAllInEvent || !noteId) {
        if (onlyHistory) {
          // For onlyHistory, just record what would be selected
          const hasNotes = event && event.notes && event.notes.length > 0;
          const firstNoteId = hasNotes ? event.notes[0].id : null;
          setLastSelection({
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            noteId: firstNoteId,
            selectedNotes: hasNotes
              ? event.notes.map((n: Note) => ({
                  staffIndex: startStaffIndex,
                  measureIndex,
                  eventId,
                  noteId: n.id,
                }))
              : [{ staffIndex: startStaffIndex, measureIndex, eventId, noteId: null }],
            anchor: { staffIndex: startStaffIndex, measureIndex, eventId, noteId: firstNoteId },
          });
          engine.dispatch(new ClearSelectionCommand());
          return;
        }

        engine.dispatch(
          new SelectAllInEventCommand({
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            addToSelection: isMulti,
          })
        );

        // Audio feedback
        if (event && !event.isRest) {
          playAudioFeedback(event.notes || []);
        }
        return;
      }

      // Handle isMulti (Cmd+click toggle)
      if (isMulti && !onlyHistory) {
        engine.dispatch(
          new ToggleNoteCommand({
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            noteId,
          })
        );

        // Audio feedback for single note
        if (noteId && event) {
          const note = event.notes.find((n: Note) => n.id === noteId);
          if (note) playAudioFeedback([note]);
        }
        return;
      }

      // Handle onlyHistory (record selection without visual change)
      if (onlyHistory) {
        setLastSelection({
          staffIndex: startStaffIndex,
          measureIndex,
          eventId,
          noteId,
          selectedNotes: [{ staffIndex: startStaffIndex, measureIndex, eventId, noteId }],
          anchor: { staffIndex: startStaffIndex, measureIndex, eventId, noteId },
        });
        engine.dispatch(new ClearSelectionCommand());
        return;
      }

      // Standard single selection - find event index for SelectEventCommand
      const eventIndex = measure?.events.findIndex((e: ScoreEvent) => e.id === eventId) ?? 0;
      const noteIndex = noteId && event
        ? event.notes.findIndex((n: Note) => n.id === noteId)
        : 0;

      engine.dispatch(
        new SelectEventCommand({
          staffIndex: startStaffIndex,
          measureIndex,
          eventIndex: eventIndex >= 0 ? eventIndex : 0,
          noteIndex: noteIndex >= 0 ? noteIndex : 0,
        })
      );

      // Audio feedback
      if (noteId && event) {
        const note = event.notes.find((n: Note) => n.id === noteId);
        if (note) playAudioFeedback([note]);
      } else if (event && !event.isRest) {
        playAudioFeedback(event.notes || []);
      }
    },
    [selection, score, playAudioFeedback, engine]
  );

  /**
   * Updates selection with partial values (legacy compatibility)
   * @deprecated Use dispatch commands directly instead
   */
  const updateSelection = useCallback((partial: Partial<Selection>) => {
    const current = engine.getState();
    engine.setState({ ...current, ...partial });
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
   * Exposed setSelection for backward compatibility
   * @deprecated Use engine.dispatch() with commands instead
   */
  const setSelection = useCallback((newSelection: Selection | ((prev: Selection) => Selection)) => {
    if (typeof newSelection === 'function') {
      const updated = newSelection(engine.getState());
      engine.setState(updated);
    } else {
      engine.setState(newSelection);
    }
  }, [engine]);

  return {
    selection,
    setSelection, // @deprecated - use commands via dispatch
    select,
    clearSelection,
    updateSelection, // @deprecated - use commands via dispatch
    selectAllInMeasure,
    lastSelection,
    // Expose engine for direct dispatch access
    engine,
  };
};
