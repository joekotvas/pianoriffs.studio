import { useEffect, useCallback } from 'react';
import { handlePlayback } from '../handlers/handlePlayback';
import { handleNavigation } from '../handlers/handleNavigation';
import { handleMutation } from '../handlers/handleMutation';
import { getActiveStaff, ScoreEvent, Note, SelectedNote } from '@/types';
import { UseScoreLogicGroupedReturn } from '@/hooks/score/types';
import { UsePlaybackReturn } from '../audio';
import {
  SelectAllInEventCommand,
  ClearSelectionCommand,
  SelectAllCommand,
  ExtendSelectionVerticallyCommand,
} from '@/commands/selection';

/**
 * Hook to handle global keyboard shortcuts.
 * Delegates actions to the provided logic and playback controllers.
 *
 * @param {Object} logic - The score logic object (from useScoreLogic or useGrandStaffLogic)
 * @param {Object} playback - The playback control object (from usePlayback)
 * @param {Object} meta - Meta state (isEditingTitle, etc.)
 * @param {Object} handlers - Specific handlers (handleTitleCommit, etc.)
 */
interface UIState {
  isEditingTitle: boolean;
  isHoveringScore: boolean;
  scoreContainerRef: React.RefObject<HTMLDivElement | null>;
  isAnyMenuOpen?: () => boolean;
  isDisabled?: boolean;
}

export const useKeyboardShortcuts = (
  logic: UseScoreLogicGroupedReturn,
  playback: UsePlaybackReturn,
  meta: UIState,
  handlers: { handleTitleCommit: () => void }
) => {
  // Access grouped API from logic
  const { selection } = logic.state;
  const score = logic.state.score;
  const { move: moveSelection, switchStaff } = logic.navigation;
  const { selectionEngine, scoreRef } = logic.engines;

  const { isEditingTitle, isHoveringScore, scoreContainerRef, isAnyMenuOpen } = meta;
  const { handleTitleCommit } = handlers;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tagName = (e.target as HTMLElement).tagName?.toLowerCase() || '';
      if (tagName === 'input' || tagName === 'textarea') {
        if (e.key === 'Enter' && isEditingTitle) {
          e.preventDefault();
          handleTitleCommit();
        }
        return;
      }

      if (isEditingTitle) return;

      // CHECK FOCUS / HOVER
      // If we have a ref to the score container, ensure we are focused on it OR hovering it
      if (scoreContainerRef && scoreContainerRef.current) {
        const isFocused =
          document.activeElement === scoreContainerRef.current ||
          scoreContainerRef.current.contains(document.activeElement);
        if (!isFocused && !isHoveringScore) {
          return; // Ignore input if not focused and not hovering
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault(); // Prevent default browser behavior for Escape key

        // First priority: Pause playback if playing
        if (playback.isPlaying) {
          playback.handlePlayToggle();
          return; // Don't clear selection when pausing
        }

        if (isAnyMenuOpen && isAnyMenuOpen()) {
          // Menu is open, let the menu handle close (or it closed via blur/click outside)
          // Do NOT clear selection
          return;
        }

        if (selection.noteId) {
          // If a single note is selected...
          const activeStaff = getActiveStaff(scoreRef.current);
          const measure = activeStaff.measures[selection.measureIndex!];
          const event = measure.events.find((ev: ScoreEvent) => ev.id === selection.eventId);

          if (event && event.notes.length > 1) {
            // Check if we already have ALL notes selected
            const allSelected = event.notes.every((n: Note) => {
              if (String(n.id) === String(selection.noteId)) return true;
              return selection.selectedNotes.some(
                (sn: SelectedNote) => String(sn.noteId) === String(n.id)
              );
            });

            if (!allSelected) {
              // Select ALL notes in the chord via dispatch
              selectionEngine.dispatch(
                new SelectAllInEventCommand({
                  staffIndex: selection.staffIndex || 0,
                  measureIndex: selection.measureIndex!,
                  eventId: selection.eventId!,
                })
              );
              return;
            }
          }

          // If all selected OR single note, clear selection via dispatch
          selectionEngine.dispatch(new ClearSelectionCommand());
        } else if (selection.eventId) {
          // If event is selected (fallback for rests), clear selection via dispatch
          selectionEngine.dispatch(new ClearSelectionCommand());
        }
        return;
      }

      // Cmd/Ctrl+A: Select all with progressive expansion
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectionEngine.dispatch(
          new SelectAllCommand({
            expandIfSelected: true,
            staffIndex: selection.staffIndex,
            measureIndex: selection.measureIndex ?? undefined,
          })
        );
        return;
      }

      // Cmd/Ctrl+Shift+Up/Down: Extend selection vertically
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === 'ArrowUp' || e.key === 'ArrowDown')
      ) {
        e.preventDefault();
        const direction = e.key === 'ArrowUp' ? 'up' : 'down';
        selectionEngine.dispatch(new ExtendSelectionVerticallyCommand({ direction }));
        return;
      }

      // 1. Playback
      if (handlePlayback(e, playback, selection, score)) return;

      // 2. Navigation (includes Alt+Up/Down for staff switching)
      if (handleNavigation(e, moveSelection, switchStaff)) return;

      // 3. Mutation
      if (handleMutation(e, logic)) return;
    },
    [
      logic,
      playback,
      selection,
      score,
      moveSelection,
      switchStaff,
      selectionEngine,
      isEditingTitle,
      handleTitleCommit,
      isHoveringScore,
      scoreContainerRef,
      isAnyMenuOpen,
      scoreRef,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return handleKeyDown;
};
