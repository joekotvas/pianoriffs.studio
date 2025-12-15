import { useCallback, RefObject } from 'react';
import { canModifyEventDuration, canToggleEventDot } from '@/utils/validation';
import { getNoteDuration } from '@/utils/core';
import { playNote } from '@/engines/toneEngine';
import { Score, getActiveStaff, Selection, Note as ScoreNote } from '@/types';
import { Command } from '@/commands/types';
import { UpdateEventCommand } from '@/commands/UpdateEventCommand';
import { UpdateNoteCommand } from '@/commands/UpdateNoteCommand';
import { Note as TonalNote } from 'tonal';

interface UseModifiersProps {
  scoreRef: RefObject<Score>;
  selection: Selection;
  currentQuantsPerMeasure: number;
  tools: {
    handleDurationChange: (duration: string) => void;
    handleDotToggle: () => boolean;
    handleAccidentalToggle: (type: 'flat' | 'natural' | 'sharp' | null) => string | null;
    handleTieToggle: () => boolean;
    isDotted: boolean;
    activeTie: boolean;
    activeAccidental: 'flat' | 'natural' | 'sharp' | null;
  };
  dispatch: (command: Command) => void;
}

interface UseModifiersReturn {
  handleDurationChange: (newDuration: string, applyToSelection?: boolean) => void;
  handleDotToggle: () => void;
  handleAccidentalToggle: (type: 'flat' | 'natural' | 'sharp' | null) => void;
  handleTieToggle: () => void;
  checkDurationValidity: (targetDuration: string) => boolean;
  checkDotValidity: () => boolean;
}

// --- Helpers ---

const getNoteTargets = (
  selection: Selection
): Array<{
  measureIndex: number;
  eventId: string | number;
  noteId: string | number;
  staffIndex: number;
}> => {
  if (selection.selectedNotes && selection.selectedNotes.length > 0) {
    return selection.selectedNotes
      .filter((n) => n.noteId)
      .map((n) => ({
        measureIndex: n.measureIndex,
        eventId: n.eventId,
        noteId: n.noteId!,
        staffIndex: n.staffIndex,
      }));
  } else if (selection.measureIndex !== null && selection.eventId && selection.noteId) {
    return [
      {
        measureIndex: selection.measureIndex,
        eventId: selection.eventId,
        noteId: selection.noteId,
        staffIndex: selection.staffIndex !== undefined ? selection.staffIndex : 0,
      },
    ];
  }
  return [];
};

const getEventTargets = (
  selection: Selection
): Array<{ measureIndex: number; eventId: string | number; staffIndex: number }> => {
  const targets: Array<{ measureIndex: number; eventId: string | number; staffIndex: number }> = [];

  if (selection.selectedNotes && selection.selectedNotes.length > 0) {
    selection.selectedNotes.forEach((n) => {
      const exists = targets.find(
        (t) =>
          t.measureIndex === n.measureIndex &&
          t.eventId === n.eventId &&
          t.staffIndex === n.staffIndex
      );
      if (!exists) {
        targets.push({
          measureIndex: n.measureIndex,
          eventId: n.eventId,
          staffIndex: n.staffIndex,
        });
      }
    });
  } else if (selection.measureIndex !== null && selection.eventId) {
    targets.push({
      measureIndex: selection.measureIndex,
      eventId: selection.eventId,
      staffIndex: selection.staffIndex !== undefined ? selection.staffIndex : 0,
    });
  }
  return targets;
};

// State Setting Logic:
// Sharp Button -> Set to X#
// Flat Button -> Set to Xb
// Natural Button -> Set to X (natural)
const calculateNewPitch = (
  currentPitch: string,
  targetType: 'flat' | 'natural' | 'sharp'
): string | null => {
  const note = TonalNote.get(currentPitch);
  if (note.empty) return null;

  const letter = note.letter; // e.g., "C"
  const oct = note.oct; // e.g., 4
  if (!letter || oct === undefined) return null;

  if (targetType === 'sharp') {
    return `${letter}#${oct}`;
  } else if (targetType === 'flat') {
    return `${letter}b${oct}`;
  } else if (targetType === 'natural') {
    return `${letter}${oct}`;
  }

  return currentPitch;
};

/**
 * Hook for modifier actions: duration, dot, accidental, and tie toggles.
 */
export const useModifiers = ({
  scoreRef,
  selection,
  currentQuantsPerMeasure,
  tools,
  dispatch,
}: UseModifiersProps): UseModifiersReturn => {
  const handleDurationChange = useCallback(
    (newDuration: string, applyToSelection = false) => {
      // Always update the active tool state
      tools.handleDurationChange(newDuration);

      // If requested, try to apply to selection
      if (applyToSelection) {
        const targets = getEventTargets(selection);

        // Iterate and apply if valid
        targets.forEach((target) => {
          const staff =
            scoreRef.current.staves[target.staffIndex] || getActiveStaff(scoreRef.current);
          const measure = staff.measures[target.measureIndex];
          if (
            measure &&
            canModifyEventDuration(
              measure.events,
              target.eventId,
              newDuration,
              currentQuantsPerMeasure
            )
          ) {
            dispatch(
              new UpdateEventCommand(
                target.measureIndex,
                target.eventId,
                { duration: newDuration },
                target.staffIndex
              )
            );
          }
        });
      }
    },
    [selection, tools, dispatch, scoreRef, currentQuantsPerMeasure]
  );

  const handleDotToggle = useCallback(() => {
    const targets = getEventTargets(selection);

    // Entry Mode / No Selection: Toggle tool state only
    if (targets.length === 0) {
      tools.handleDotToggle();
      return;
    }

    const score = scoreRef.current;

    // 1. Fetch event objects to determine global state
    const eventObjects = targets
      .map((t) => {
        const staff = score.staves[t.staffIndex] || getActiveStaff(score);
        return staff.measures[t.measureIndex]?.events.find((e: any) => e.id === t.eventId);
      })
      .filter((e): e is any => !!e);

    if (eventObjects.length === 0) return;

    // 2. Determine consistency
    // User Request: Turn OFF if heterogeneous.
    // If ANY are dotted, we turn OFF. Only if NONE are dotted do we turn ON.
    const hasAnyDotted = eventObjects.some((e) => e.dotted);
    const targetState = !hasAnyDotted;

    // Update tool state to match target
    // We can't set directly, but we can try to sync if mismatched (optional)
    // tools.isDotted is local.

    // 3. Apply to all targets
    targets.forEach((target) => {
      const staff = score.staves[target.staffIndex] || getActiveStaff(score);
      const measure = staff.measures[target.measureIndex];
      const event = measure?.events.find((e: any) => e.id === target.eventId);

      if (event) {
        // Skip if already in target state
        if (!!event.dotted === targetState) return;

        if (canToggleEventDot(measure.events, target.eventId, currentQuantsPerMeasure)) {
          dispatch(
            new UpdateEventCommand(
              target.measureIndex,
              target.eventId,
              { dotted: targetState },
              target.staffIndex
            )
          );
        }
      }
    });

    // Sync tool UI (approximate)
    if (tools.isDotted !== targetState) tools.handleDotToggle();
  }, [selection, tools, dispatch, scoreRef, currentQuantsPerMeasure]);

  const handleAccidentalToggle = useCallback(
    (type: 'flat' | 'natural' | 'sharp' | null) => {
      if (!type) return;

      // Apply logic to finding target
      const targets = getNoteTargets(selection);

      // Entry Mode: Toggle tool state
      if (targets.length === 0) {
        tools.handleAccidentalToggle(type);
        return;
      }

      const score = scoreRef.current; // access current ref

      // 1. Determine consistency ("Are all selected notes already this type?")
      const noteObjects = targets
        .map((t) => {
          const staff = score.staves[t.staffIndex] || getActiveStaff(score);
          const event = staff.measures[t.measureIndex]?.events.find((e: any) => e.id === t.eventId);
          // Explicitly cast or check if it matches ScoreNote interface roughly
          return event?.notes.find((n: any) => n.id === t.noteId);
        })
        .filter((n): n is ScoreNote => !!n && n.pitch !== null); // Filter out rests

      if (noteObjects.length === 0) return;

      const allMatch = noteObjects.every((n) => {
        const note = TonalNote.get(n.pitch!);
        if (type === 'sharp') return note.acc === '#';
        if (type === 'flat') return note.acc === 'b';
        if (type === 'natural') return !note.acc;
        return false;
      });

      // 2. Decide Target Action
      // If all match the requested type, toggle OFF (to natural).
      // EXCEPTION: If request is Natural, and all match Natural -> Stay Natural (idempotent).
      let targetType = type;
      if (allMatch && type !== 'natural') {
        targetType = 'natural';
      }

      // 3. Apply to all targets
      targets.forEach((target) => {
        const staff = score.staves[target.staffIndex] || getActiveStaff(score);
        const measure = staff.measures[target.measureIndex];
        const event = measure?.events.find((e: any) => e.id === target.eventId);
        const note = event?.notes.find((n: any) => n.id === target.noteId);

        // Skip rest notes (null pitch)
        if (note && note.pitch !== null) {
          const newPitch = calculateNewPitch(note.pitch, targetType);
          if (newPitch && newPitch !== note.pitch) {
            dispatch(
              new UpdateNoteCommand(
                target.measureIndex,
                target.eventId,
                target.noteId,
                { pitch: newPitch },
                target.staffIndex
              )
            );
          }
        }
      });

      // Play tone for the PRIMARY selection (if it was updated)
      if (selection.measureIndex !== null && selection.eventId && selection.noteId) {
        // Re-calculate simply for preview
        const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        const staff = score.staves[staffIdx] || getActiveStaff(score);
        const measure = staff.measures[selection.measureIndex];
        const event = measure?.events.find((e: any) => e.id === selection.eventId);
        const note = event?.notes.find((n: any) => n.id === selection.noteId);
        // Skip rest notes (null pitch)
        if (note && note.pitch !== null) {
          const newPitch = calculateNewPitch(note.pitch, targetType);
          if (newPitch) playNote(newPitch);
        }
      }

      // Update toolbar state
      tools.handleAccidentalToggle(null);
    },
    [selection, tools, dispatch, scoreRef]
  );

  const handleTieToggle = useCallback(() => {
    const targets = getNoteTargets(selection);

    // Entry Mode
    if (targets.length === 0) {
      tools.handleTieToggle();
      return;
    }

    const score = scoreRef.current;

    // 1. Fetch note objects
    const noteObjects = targets
      .map((t) => {
        const staff = score.staves[t.staffIndex] || getActiveStaff(score);
        const measure = staff.measures[t.measureIndex];
        const event = measure?.events.find((e: any) => e.id === t.eventId);
        return event?.notes.find((n: any) => n.id === t.noteId);
      })
      .filter((n): n is any => !!n);

    if (noteObjects.length === 0) return;

    // 2. Determine target state
    // "Use the same pattern for ties" -> If ANY tied, turn OFF.
    const hasAnyTied = noteObjects.some((n) => n.tied);
    const targetState = !hasAnyTied;

    // 3. Apply to all targets
    targets.forEach((target) => {
      // We just dispatch. Note updates don't require measure-level validation usually (unless changing pitch/duration invalidates something else?)
      // Ties don't affect duration. Safe.
      dispatch(
        new UpdateNoteCommand(
          target.measureIndex,
          target.eventId,
          target.noteId,
          { tied: targetState },
          target.staffIndex
        )
      );
    });

    // Sync tool UI
    if (tools.activeTie !== targetState) tools.handleTieToggle();
  }, [selection, tools, dispatch, scoreRef]);

  const checkDurationValidity = useCallback(
    (targetDuration: string) => {
      if (selection.measureIndex === null || !selection.eventId) return true;

      const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
      const staff = scoreRef.current.staves[staffIdx];
      if (!staff) return true;

      const measure = staff.measures[selection.measureIndex];
      if (!measure) return true;

      return canModifyEventDuration(
        measure.events,
        selection.eventId,
        targetDuration,
        currentQuantsPerMeasure
      );
    },
    [selection, currentQuantsPerMeasure, scoreRef]
  );

  const checkDotValidity = useCallback(() => {
    if (selection.measureIndex === null || !selection.eventId) return true;

    const staffIdx = selection.staffIndex !== undefined ? selection.staffIndex : 0;
    const staff = scoreRef.current.staves[staffIdx];
    if (!staff) return true;

    const measure = staff.measures[selection.measureIndex];
    if (!measure) return true;

    return canToggleEventDot(measure.events, selection.eventId, currentQuantsPerMeasure);
  }, [selection, currentQuantsPerMeasure, scoreRef]);

  return {
    handleDurationChange,
    handleDotToggle,
    handleAccidentalToggle,
    handleTieToggle,
    checkDurationValidity,
    checkDotValidity,
  };
};
