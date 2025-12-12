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
import { calculateFocusSelection } from '../utils/focusScore';

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
      inputMode, setInputMode, toggleInputMode,
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
          // No selection - DO NOT reset accidental/tie.
          // This allows "sticky" tools for note entry (User Request).
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
              // When no specific note selected (rest or event selection), clear
              setActiveAccidental(null);
              setActiveTie(false);
          }
          
          // Sync inputMode based on selection composition
          // Only update if mode actually differs to prevent unnecessary re-renders
          const targetMode = event.isRest ? 'REST' : 'NOTE';
          if (inputMode !== targetMode) {
              setInputMode(targetMode);
          }
      }
  }, [selection, score, setActiveAccidental, setActiveTie, setInputMode, inputMode]);

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
    dispatch: engine.dispatch.bind(engine),
    inputMode
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
    dispatch: engine.dispatch.bind(engine),
    inputMode
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

  const selectedDots = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];
    
    const dots = new Set<boolean>();
    const currentScore = scoreRef.current;

    const addFromEvent = (measureIndex: number, eventId: string | number, staffIndex: number) => {
        const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
        const measure = staff.measures[measureIndex];
        const event = measure?.events.find((e: any) => e.id === eventId);
        if (event) dots.add(!!event.dotted);
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        selection.selectedNotes.forEach(n => addFromEvent(n.measureIndex, n.eventId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
        const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        addFromEvent(selection.measureIndex, selection.eventId, staffIndex);
    }
    return Array.from(dots);
  }, [selection, score, editorState]);

  const selectedTies = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const ties = new Set<boolean>();
    const currentScore = scoreRef.current;

    const addFromNote = (measureIndex: number, eventId: string | number, noteId: string | number | null, staffIndex: number) => {
        const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
        const measure = staff.measures[measureIndex];
        const event = measure?.events.find((e: any) => e.id === eventId);
        if (event) {
            if (noteId) {
                const note = event.notes.find((n: any) => n.id === noteId);
                if (note) ties.add(!!note.tied);
            } else {
                 event.notes.forEach((n: any) => ties.add(!!n.tied));
            }
        }
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        selection.selectedNotes.forEach(n => addFromNote(n.measureIndex, n.eventId, n.noteId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
        const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        addFromNote(selection.measureIndex, selection.eventId, selection.noteId, staffIndex);
    }
    return Array.from(ties);
  }, [selection, score, editorState]);

  const selectedAccidentals = useMemo(() => {
    if (editorState !== 'SELECTION_READY') return [];

    const accidentals = new Set<string>();
    const currentScore = scoreRef.current;

    // Helper to determine type from pitch
    const getAccidentalType = (pitch: string): string => {
        // Use very simple parsing or Tonal if imported.
        // Since we want to avoid import in this file if possible? 
        // Actually importing Note from tonal is fine.
        // Assuming Note is imported or we use MusicService.
        // Let's use basic regex for speed/dependency avoidance if simple, 
        // OR just import Note (preferred for robustness).
        const match = pitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
        if (!match) return 'natural';
        const acc = match[2];
        if (acc?.startsWith('#')) return 'sharp';
        if (acc?.startsWith('b')) return 'flat';
        return 'natural';
    };

    const addFromNote = (measureIndex: number, eventId: string | number, noteId: string | number | null, staffIndex: number) => {
        const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
        const measure = staff.measures[measureIndex];
        const event = measure?.events.find((e: any) => e.id === eventId);
        if (event) {
            if (noteId) {
                const note = event.notes.find((n: any) => n.id === noteId);
                // Skip rest notes (null pitch)
                if (note && note.pitch !== null) accidentals.add(getAccidentalType(note.pitch));
            } else {
                 event.notes.forEach((n: any) => {
                     // Skip rest notes (null pitch)
                     if (n.pitch !== null) accidentals.add(getAccidentalType(n.pitch));
                 });
            }
        }
    };

    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        selection.selectedNotes.forEach(n => addFromNote(n.measureIndex, n.eventId, n.noteId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
        const staffIndex = selection.staffIndex !== undefined ? selection.staffIndex : 0;
        addFromNote(selection.measureIndex, selection.eventId, selection.noteId, staffIndex);
    }
    return Array.from(accidentals); // ['sharp'], ['flat', 'natural'], etc.
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

  // --- FOCUS SCORE ---
  const focusScore = useCallback(() => {
    const newSelection = calculateFocusSelection(score, selection);
    setSelection(newSelection);
    
    // If focusing on an empty position (no eventId), create a preview note for ghost cursor
    if (!newSelection.eventId && newSelection.measureIndex !== null) {
      const staff = score.staves[newSelection.staffIndex || 0];
      const measure = staff?.measures[newSelection.measureIndex];
      if (measure) {
        const clef = staff.clef || 'treble';
        const defaultPitch = clef === 'bass' ? 'D3' : 'B4';
        const preview = getAppendPreviewNote(
          measure,
          newSelection.measureIndex,
          newSelection.staffIndex || 0,
          activeDuration,
          isDotted,
          defaultPitch,
          inputMode === 'REST'
        );
        setPreviewNote(preview);
      }
    }
  }, [score, selection, setSelection, setPreviewNote, activeDuration, isDotted, inputMode]);


  // --- EXPORTS ---
  return {
    score,
    selection,
    editorState,
    selectedDurations, // Expose derived durations
    selectedDots,
    selectedTies,
    selectedAccidentals,
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
    inputMode,
    setInputMode,
    toggleInputMode,
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
    switchStaff: navigation.switchStaff,
    focusScore
  };
};
