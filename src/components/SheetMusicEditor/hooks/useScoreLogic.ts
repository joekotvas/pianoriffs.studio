import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { TIME_SIGNATURES } from '../constants';
import { CONFIG } from '../config';
import { useScoreEngine } from './useScoreEngine';
import { useEditorTools } from './useEditorTools';
import { useMeasureActions } from './useMeasureActions';
import { useNoteActions } from './useNoteActions';
import { useModifiers } from './useModifiers';
import { useNavigation } from './useNavigation';
import { useTupletActions } from './useTupletActions';
import { useSelection } from './useSelection';
import { useEditorMode } from './useEditorMode';

import { Score, createDefaultScore, migrateScore, getActiveStaff } from '../types';
import { getAppendPreviewNote } from '../utils/interaction';

/**
 * Main score logic orchestrator hook.
 * Composes focused hooks for measure, note, modifier, and navigation actions.
 */
export const useScoreLogic = (initialScore: any) => {
  // --- STATE ---
  const defaultScore = createDefaultScore();

  // Migrate incoming score to new staves format
  const migratedInitialScore = initialScore ? migrateScore(initialScore) : defaultScore;

  // --- ENGINE INTEGRATION ---
  const { score, engine } = useScoreEngine(migratedInitialScore);

  const undo = useCallback(() => engine.undo(), [engine]);
  const redo = useCallback(() => engine.redo(), [engine]);

  const history = engine.getHistory();
  const redoStack = engine.getRedoStack();

  // --- REFS ---
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // --- EDITOR TOOLS ---
  const tools = useEditorTools();
  const { 
      activeDuration, setActiveDuration, 
      isDotted, setIsDotted, 
      activeAccidental, setActiveAccidental, 
      activeTie, setActiveTie,
  } = tools;

  // --- SELECTION & PREVIEW STATE ---
  const { selection, setSelection, select, clearSelection, updateSelection, selectAllInMeasure, lastSelection } = useSelection({ score });
  const [previewNote, setPreviewNote] = useState<any>(null);

  // --- COMPUTED VALUES ---
  if (!score || !score.staves) {
      console.error('CRITICAL: Score corrupted in useScoreLogic', score);
      // Fallback to prevent crash and allow inspection
      if (!score) console.error('Score is null/undefined');
      else if (!score.staves) console.error('Score.staves is undefined');
  }
  
  
  const currentQuantsPerMeasure = useMemo(() => {
      if (score.timeSignature) {
          return TIME_SIGNATURES[score.timeSignature as keyof typeof TIME_SIGNATURES] || 64;
      }
      return CONFIG.quantsPerMeasure;
  }, [score.timeSignature]);

  // --- SYNC TOOLBAR STATE ---
  // Automatically syncs accidental and tie state on selection change
  useEffect(() => {
      const { measureIndex, eventId, noteId, staffIndex } = selection;
      
      if (measureIndex === null || !eventId) {
          // No selection - reset accidental and tie only
          setActiveAccidental(null);
          setActiveTie(false);
          return;
      }

      const measure = getActiveStaff(score, staffIndex || 0).measures[measureIndex];
      if (!measure) return;
      
      const event = measure.events.find((e: any) => e.id === eventId);
      
      if (event) {
          // Duration is NOT synced - user controls duration independently
          
          if (noteId) {
              const note = event.notes.find((n: any) => n.id === noteId);
              if (note) {
                  setActiveAccidental(note.accidental || null);
                  setActiveTie(!!note.tied);
              }
          } else {
              // When no specific note selected, clear
              setActiveAccidental(null);
              setActiveTie(false);
          }
      }
  }, [selection, score, setActiveAccidental, setActiveTie]);

  // Deprecated shim
  const syncToolbarState = useCallback(() => {}, []); 

  // --- COMPOSED HOOKS ---
  
  // Measure Actions: time/key signature, add/remove measures
  const measureActions = useMeasureActions({
    score,
    setSelection,
    setPreviewNote,
    dispatch: engine.dispatch.bind(engine)
  });

  // Note Actions: add/delete notes, chords
  const noteActions = useNoteActions({
    scoreRef,
    selection,
    setSelection, // Still passed but might be unused if we fully switched
    select,
    setPreviewNote,
    syncToolbarState, // Deprecated
    activeDuration,
    isDotted,
    activeAccidental,
    activeTie,
    currentQuantsPerMeasure,
    dispatch: engine.dispatch.bind(engine)
  });

  // Modifiers: duration, dots, accidentals, ties
  const modifiers = useModifiers({
    scoreRef,
    selection,
    currentQuantsPerMeasure,
    tools,
    dispatch: engine.dispatch.bind(engine)
  });

  // Navigation: selection, movement, transposition
  const navigation = useNavigation({
    scoreRef,
    selection,
    lastSelection, // Pass history
    setSelection, 
    select,
    previewNote,
    setPreviewNote,
    activeDuration,
    isDotted,
    currentQuantsPerMeasure,
    dispatch: engine.dispatch.bind(engine)
  });

  // Tuplet Actions: apply/remove tuplets
  const tupletActions = useTupletActions(
    scoreRef,
    selection,
    engine.dispatch.bind(engine)
  );

  // --- EDITOR MODE ---
  const { editorState } = useEditorMode({ selection, previewNote });

  // --- DERIVED SELECTION PROPERTIES ---
  const selectedDurations = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const durations = new Set<string>();
    const currentScore = scoreRef.current;

    // Helper to add duration from an event
    const addFromEvent = (measureIndex: number, eventId: string | number, staffIndex: number) => {
        const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
        const measure = staff.measures[measureIndex];
        const event = measure?.events.find((e: any) => e.id === eventId);
        if (event) durations.add(event.duration);
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        // Multi-select
        selection.selectedNotes.forEach(n => {
            addFromEvent(n.measureIndex, n.eventId, n.staffIndex);
        });
    } else if (selection.measureIndex !== null && selection.eventId) {
        // Single select
        const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        addFromEvent(selection.measureIndex, selection.eventId, staffIndex);
    }

    return Array.from(durations);
  }, [selection, score, editorState]);

  // --- WRAPPED HANDLERS ---
  const handleDurationChangeWrapper = useCallback((newDuration: string) => {
      if (editorState === 'SELECTION_READY') {
          // Apply to selection
          modifiers.handleDurationChange(newDuration, true);
      } else {
          // Just update tool state
          setActiveDuration(newDuration);

          // If IDLE, try to bring focus back to last known position
          if (editorState === 'IDLE' && lastSelection && lastSelection.measureIndex !== null) {
               const staffIndex = lastSelection.staffIndex !== undefined ? lastSelection.staffIndex : 0;
               const staff = scoreRef.current.staves[staffIndex] || getActiveStaff(scoreRef.current);
               const measure = staff.measures[lastSelection.measureIndex];
               
               if (measure) {
                   // Restore focus using APPEND mode at the measure
                   const newPreview = getAppendPreviewNote(
                       measure,
                       lastSelection.measureIndex,
                       staffIndex,
                       newDuration, // Use the NEW duration
                       isDotted
                   );
                   setPreviewNote(newPreview);
               }
          } else if (editorState === 'ENTRY_READY' && previewNote) {
              // Update existing preview note immediately?
              // The preview note usually updates automatically via mouse hover, 
              // but if keyboard cursor is active, we should update it.
              setPreviewNote((prev: any) => ({
                  ...prev,
                  duration: newDuration
              }));
          }
      }
  }, [editorState, modifiers.handleDurationChange, setActiveDuration, lastSelection, scoreRef, isDotted, previewNote]);


  // --- EXPORTS ---
  return {
    score,
    selection,
    editorState,
    selectedDurations, // Expose derived durations
    setSelection,
    previewNote,
    setPreviewNote,
    history,
    redoStack,
    undo,
    redo,
    dispatch: engine.dispatch.bind(engine),
    activeDuration,
    setActiveDuration,
    isDotted,
    setIsDotted,
    activeAccidental,
    activeTie,
    handleTimeSignatureChange: measureActions.handleTimeSignatureChange,
    handleKeySignatureChange: measureActions.handleKeySignatureChange,
    addMeasure: measureActions.addMeasure,
    removeMeasure: measureActions.removeMeasure,
    togglePickup: measureActions.togglePickup,
    setGrandStaff: measureActions.setGrandStaff,
    handleMeasureHover: noteActions.handleMeasureHover,
    addNoteToMeasure: noteActions.addNoteToMeasure,
    addChordToMeasure: noteActions.addChordToMeasure,
    deleteSelected: noteActions.deleteSelected,
    handleNoteSelection: navigation.handleNoteSelection,
    handleDurationChange: handleDurationChangeWrapper, // Use wrapper
    handleDotToggle: modifiers.handleDotToggle,
    handleAccidentalToggle: modifiers.handleAccidentalToggle,
    handleTieToggle: modifiers.handleTieToggle,
    currentQuantsPerMeasure,
    scoreRef,
    checkDurationValidity: modifiers.checkDurationValidity,
    checkDotValidity: modifiers.checkDotValidity,
    updateNotePitch: noteActions.updateNotePitch,
    // Tuplet actions
    applyTuplet: tupletActions.applyTuplet,
    removeTuplet: tupletActions.removeTuplet,
    canApplyTuplet: tupletActions.canApplyTuplet,
    activeTupletRatio: tupletActions.getActiveTupletRatio(),
    transposeSelection: navigation.transposeSelection,
    moveSelection: navigation.moveSelection,
    switchStaff: navigation.switchStaff
  };
};
