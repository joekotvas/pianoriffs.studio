import { useCallback } from 'react';
import { Selection } from '@/types';
import { Command } from '@/commands/types';
import { DeleteNoteCommand } from '@/commands/DeleteNoteCommand';
import { DeleteEventCommand } from '@/commands/DeleteEventCommand';

/**
 * Props for the useNoteDelete hook.
 */
export interface UseNoteDeleteProps {
  /** Current selection state */
  selection: Selection;
  /** Function to update selection */
  select: (
    measureIndex: number | null,
    eventId: string | number | null,
    noteId: string | number | null,
    staffIndex?: number
  ) => void;
  /** Command dispatcher */
  dispatch: (command: Command) => void;
}

/**
 * Return type for useNoteDelete hook.
 */
export interface UseNoteDeleteReturn {
  /** Delete currently selected notes/events */
  deleteSelected: () => void;
}

/**
 * Hook for handling note and event deletion.
 *
 * Handles:
 * - Multi-selection deletion (all selected notes)
 * - Single note deletion
 * - Event deletion (fallback when no noteId)
 *
 * @param props - Hook props
 * @returns Object with deleteSelected callback
 *
 * @example
 * ```typescript
 * const { deleteSelected } = useNoteDelete({
 *   selection,
 *   select,
 *   dispatch,
 * });
 *
 * // Delete on keypress
 * if (key === 'Delete') deleteSelected();
 * ```
 *
 * @tested src/__tests__/hooks/note/useNoteDelete.test.tsx
 */
export function useNoteDelete({
  selection,
  select,
  dispatch,
}: UseNoteDeleteProps): UseNoteDeleteReturn {
  const deleteSelected = useCallback(() => {
    // 1. Delete Multi-Selection
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      const notesToDelete = [...selection.selectedNotes];
      notesToDelete.forEach((note) => {
        if (note.noteId) {
          dispatch(
            new DeleteNoteCommand(note.measureIndex, note.eventId, note.noteId, note.staffIndex)
          );
        } else {
          // Fallback: delete event if no noteId
          dispatch(new DeleteEventCommand(note.measureIndex, note.eventId, note.staffIndex));
        }
      });
      // Clear selection after delete
      select(null, null, null, selection.staffIndex);
      return;
    }

    if (selection.measureIndex === null || !selection.eventId) return;

    // 2. Delete Single Selection
    if (selection.noteId) {
      dispatch(
        new DeleteNoteCommand(
          selection.measureIndex,
          selection.eventId,
          selection.noteId,
          selection.staffIndex
        )
      );
    } else {
      // Fallback for event without specific note
      dispatch(
        new DeleteEventCommand(selection.measureIndex, selection.eventId, selection.staffIndex)
      );
    }

    select(null, null, null, selection.staffIndex);
  }, [selection, dispatch, select]);

  return { deleteSelected };
}
