import { useEffect, useCallback } from 'react';
import { handlePlayback } from './handlers/handlePlayback';
import { handleNavigation } from './handlers/handleNavigation';
import { handleMutation } from './handlers/handleMutation';
import { getActiveStaff } from '@/types';

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
  scoreContainerRef: React.RefObject<HTMLDivElement>;
  isAnyMenuOpen?: () => boolean;
}

export const useKeyboardShortcuts = (logic: any, playback: any, meta: UIState, handlers: any) => {
    const { 
        selection, score, moveSelection, setSelection, scoreRef, switchStaff
    } = logic;

    const { isEditingTitle, isHoveringScore, scoreContainerRef, isAnyMenuOpen } = meta;
    const { handleTitleCommit } = handlers;

    const handleKeyDown = useCallback((e: any) => {
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
            const isFocused = document.activeElement === scoreContainerRef.current || scoreContainerRef.current.contains(document.activeElement);
            if (!isFocused && !isHoveringScore) {
                return; // Ignore input if not focused and not hovering
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault(); // Prevent default browser behavior for Escape key
            console.log('ESC Pressed. Focused:', document.activeElement?.getAttribute('data-testid'));

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
                const event = measure.events.find((ev: any) => ev.id === selection.eventId);
                
                if (event && event.notes.length > 1) {
                    // Check if we already have ALL notes selected
                    const allSelected = event.notes.every((n: any) => {
                         if (String(n.id) === String(selection.noteId)) return true;
                         return selection.selectedNotes.some((sn: any) => String(sn.noteId) === String(n.id));
                    });

                    if (!allSelected) {
                        // Select ALL notes in the chord
                        // We keep the current focus (noteId) but add everyone else to selectedNotes
                        const allNoteSelections = event.notes.map((n: any) => ({
                            staffIndex: selection.staffIndex || 0,
                            measureIndex: selection.measureIndex!,
                            eventId: selection.eventId!,
                            noteId: n.id
                        }));
                        
                        setSelection({
                            ...selection,
                            selectedNotes: allNoteSelections
                        });
                        return;
                    }
                }
                
                // If all selected OR single note, clear selection
                setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null, selectedNotes: [] });
            } else if (selection.eventId) {
                // If event is selected (fallback for rests), clear selection
                setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null, selectedNotes: [] });
            }
            return;
        }

        // 1. Playback
        if (handlePlayback(e, playback, selection, score)) return;

        // 2. Navigation (includes Alt+Up/Down for staff switching)
        if (handleNavigation(e, moveSelection, switchStaff)) return;

        // 3. Mutation
        if (handleMutation(e, logic)) return;

    }, [
        logic, playback, meta, handlers,
        selection, score, moveSelection, switchStaff, isEditingTitle, handleTitleCommit,
        isHoveringScore, scoreContainerRef
    ]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return handleKeyDown;
};
