import { useCallback } from 'react';
import { Selection } from '@/types';
import { Command } from '@/commands/types';
import { ChangePitchCommand } from '@/commands/ChangePitchCommand';

/**
 * Props for the useNotePitch hook.
 */
export interface UseNotePitchProps {
  /** Current selection state (for staffIndex) */
  selection: Selection;
  /** Command dispatcher */
  dispatch: (command: Command) => void;
}

/**
 * Return type for useNotePitch hook.
 */
export interface UseNotePitchReturn {
  /** Update the pitch of a specific note */
  updateNotePitch: (
    measureIndex: number,
    eventId: string | number,
    noteId: string | number,
    newPitch: string
  ) => void;
}

/**
 * Hook for updating note pitches.
 *
 * @param props - Hook props
 * @returns Object with updateNotePitch callback
 *
 * @example
 * ```typescript
 * const { updateNotePitch } = useNotePitch({ selection, dispatch });
 *
 * // Change pitch via arrow keys
 * updateNotePitch(0, 'event-1', 'note-1', 'D4');
 * ```
 *
 * @tested src/__tests__/hooks/note/useNotePitch.test.tsx
 */
export function useNotePitch({
  selection,
  dispatch,
}: UseNotePitchProps): UseNotePitchReturn {
  const updateNotePitch = useCallback(
    (measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => {
      dispatch(
        new ChangePitchCommand(measureIndex, eventId, noteId, newPitch, selection.staffIndex)
      );
    },
    [dispatch, selection.staffIndex]
  );

  return { updateNotePitch };
}
