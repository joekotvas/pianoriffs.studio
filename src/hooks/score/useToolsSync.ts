/**
 * useToolsSync
 *
 * Synchronizes toolbar state (accidental, tie, input mode) with the current selection.
 * When a note is selected, its properties are reflected in the toolbar.
 *
 * @see useScoreLogic - Orchestrator that uses this hook
 */

import { useEffect } from 'react';
import { Selection, Score, ScoreEvent, getActiveStaff } from '@/types';

interface UseToolsSyncProps {
  score: Score;
  selection: Selection;
  inputMode: 'NOTE' | 'REST';
  setActiveAccidental: (acc: 'flat' | 'natural' | 'sharp' | null) => void;
  setActiveTie: (tied: boolean) => void;
  setInputMode: (mode: 'NOTE' | 'REST') => void;
}

/**
 * Syncs toolbar state with current selection.
 *
 * Updates accidental, tie, and input mode when selection changes.
 * Uses "sticky" tools behavior - doesn't reset when no selection.
 *
 * @internal
 */
export const useToolsSync = ({
  score,
  selection,
  inputMode,
  setActiveAccidental,
  setActiveTie,
  setInputMode,
}: UseToolsSyncProps): void => {
  useEffect(() => {
    const { measureIndex, eventId, noteId, staffIndex } = selection;

    if (measureIndex === null || !eventId) {
      // No selection - DO NOT reset accidental/tie.
      // This allows "sticky" tools for note entry (User Request).
      return;
    }

    const measure = getActiveStaff(score, staffIndex || 0).measures[measureIndex];
    if (!measure) return;

    const event = measure.events.find((e: ScoreEvent) => e.id === eventId);

    if (event) {
      // Duration is NOT synced - user controls duration independently

      if (noteId) {
        const note = event.notes.find((n) => n.id === noteId);
        if (note) {
          setActiveAccidental(note.accidental || null);
          setActiveTie(!!note.tied);
        }
      } else {
        // When no specific note selected (rest or event selection), clear
        setActiveAccidental(null);
        setActiveTie(false);
      }

      // Sync inputMode based on selection composition
      const targetMode = event.isRest ? 'REST' : 'NOTE';
      if (inputMode !== targetMode) {
        setInputMode(targetMode);
      }
    }
  }, [selection, score, setActiveAccidental, setActiveTie, setInputMode, inputMode]);
};
