import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { TIME_SIGNATURES } from '@/constants';
import { CONFIG } from '@/config';
import { useScoreEngine } from './useScoreEngine';
import { useTransactionBatching } from './useTransactionBatching';
import { useEditorTools } from './useEditorTools';
import { useMeasureActions } from './useMeasureActions';
import { useNoteActions } from './useNoteActions';
import { useModifiers } from './useModifiers';
import { useNavigation } from './useNavigation';
import { useTupletActions } from './useTupletActions';
import { useSelection } from './useSelection';
import { useEditorMode } from './useEditorMode';

import { createDefaultScore, migrateScore, PreviewNote, Score } from '@/types';

// Extracted score modules
import { useDerivedSelection } from './score/useDerivedSelection';
import { useToolsSync } from './score/useToolsSync';
import { useFocusScore } from './score/useFocusScore';
import type {
  ScoreStateGroup,
  ScoreToolsGroup,
  ScoreNavigationGroup,
  ScoreEntryGroup,
  ScoreModifiersGroup,
  ScoreMeasuresGroup,
  ScoreTupletsGroup,
  ScoreHistoryGroup,
  ScoreEnginesGroup,
  ScoreDerivedGroup,
} from './score/types';

/**
 * useScoreLogic
 *
 * Main orchestrator hook that composes all focused domain hooks into a unified
 * score editing interface. Manages state synchronization between:
 * - ScoreEngine (undo/redo, state mutations)
 * - SelectionEngine (cursor, multi-select)
 * - Editor tools (duration, accidental, tie state)
 * - Preview/ghost note rendering
 *
 * @see useScoreEngine - Core state engine
 * @see useSelection - Selection management
 * @see useNavigation - Keyboard navigation
 * @see useNoteActions - Note entry/modification
 * @see useModifiers - Duration/accidental changes
 */

/**
 * Main score logic hook providing the complete editing API.
 *
 * Composes focused hooks for measure, note, modifier, navigation, and tuplet
 * actions into a single unified interface. Handles state synchronization between
 * the score engine, selection engine, and editor tool state.
 *
 * @param initialScore - Optional partial score to initialize with. If not provided,
 *                       creates a default score. Scores are migrated to current schema.
 * @returns Complete score editing interface including:
 *   - score: Current score state
 *   - selection: Current selection state
 *   - dispatch: Command dispatcher for score mutations
 *   - Navigation, entry, and modifier handlers
 *   - Undo/redo functionality
 *   - Transaction batching for atomic operations
 *
 * @example
 * ```tsx
 * const logic = useScoreLogic(savedScore);
 * logic.dispatch(new AddEventCommand({ ... }));
 * logic.undo();
 * ```
 *
 * @see ScoreContext - Context provider that wraps this hook
 * @internal Orchestrator hook, use via ScoreContext in most cases
 */
export const useScoreLogic = (initialScore?: Partial<Score>) => {
  // --- STATE ---
  // Memoize migration to prevent re-execution on every render
  // Uses useMemo since initialScore may change (though typically only once at mount)
  const migratedInitialScore = useMemo(() => {
    if (initialScore) {
      return migrateScore(initialScore);
    }
    return createDefaultScore();
  }, [initialScore]);

  // --- ENGINE INTEGRATION ---
  const { score, engine } = useScoreEngine(migratedInitialScore);
  const {
    dispatch,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
  } = useTransactionBatching(engine);

  const undo = useCallback(() => engine.undo(), [engine]);
  const redo = useCallback(() => engine.redo(), [engine]);

  const history = engine.getHistory();
  const redoStack = engine.getRedoStack();

  // --- REFS ---
  // Keep ref synced with score for use in event handlers (not during render)
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // --- EDITOR TOOLS ---
  const tools = useEditorTools();
  const {
    activeDuration,
    setActiveDuration,
    isDotted,
    setIsDotted,
    activeAccidental,
    setActiveAccidental,
    activeTie,
    setActiveTie,
    inputMode,
    setInputMode,
    toggleInputMode,
  } = tools;

  const {
    selection,
    setSelection,
    select,
    clearSelection,
    lastSelection,
    engine: selectionEngine,
  } = useSelection({ score });
  const [previewNote, setPreviewNote] = useState<PreviewNote | null>(null);

  // --- COMPUTED VALUES ---
  // Fail-fast: throw for Error Boundary instead of logging and continuing
  if (!score || !score.staves) {
    throw new Error(
      `Score state corruption detected in useScoreLogic: ${
        !score ? 'score is null/undefined' : 'score.staves is undefined'
      }`
    );
  }

  const currentQuantsPerMeasure = useMemo(() => {
    if (score.timeSignature) {
      return TIME_SIGNATURES[score.timeSignature as keyof typeof TIME_SIGNATURES] || 64;
    }
    return CONFIG.quantsPerMeasure;
  }, [score.timeSignature]);

  // --- SYNC TOOLBAR STATE ---
  // Uses extracted hook for cleaner separation
  useToolsSync({
    score,
    selection,
    inputMode,
    setActiveAccidental,
    setActiveTie,
    setInputMode,
  });


  // --- COMPOSED HOOKS ---

  // Measure Actions: time/key signature, add/remove measures
  const measureActions = useMeasureActions({
    score,
    clearSelection,
    setPreviewNote,
    dispatch,
  });

  // Note Actions: add/delete notes, chords
  const noteActions = useNoteActions({
    scoreRef,
    selection,
    setSelection, // Still passed but might be unused if we fully switched
    select,
    setPreviewNote,
    activeDuration,
    isDotted,
    activeAccidental,
    activeTie,
    currentQuantsPerMeasure,
    dispatch,
    inputMode,
  });

  // Modifiers: duration, dots, accidentals, ties
  const modifiers = useModifiers({
    scoreRef,
    selection,
    currentQuantsPerMeasure,
    tools,
    dispatch,
  });

  // Navigation: selection, movement, transposition
  const navigation = useNavigation({
    scoreRef,
    selection,
    setSelection,
    select,
    previewNote,
    setPreviewNote,
    activeDuration,
    isDotted,
    currentQuantsPerMeasure,
    dispatch: engine.dispatch.bind(engine),
    inputMode,
  });

  // Tuplet Actions: apply/remove tuplets
  const tupletActions = useTupletActions(scoreRef, selection, dispatch);

  // --- EDITOR MODE ---
  const { editorState } = useEditorMode({ selection, previewNote });

  // --- DERIVED SELECTION PROPERTIES ---
  // Uses extracted hook for selection metadata computation
  const { selectedDurations, selectedDots, selectedTies, selectedAccidentals } =
    useDerivedSelection(score, selection, editorState);

  // --- FOCUS HANDLERS ---
  // Uses extracted hook for focus restoration and duration wrapper
  const { focusScore, handleDurationChangeWrapper } = useFocusScore({
    score,
    scoreRef,
    selection,
    lastSelection,
    selectionEngine,
    setPreviewNote,
    activeDuration,
    isDotted,
    inputMode,
    editorState,
    previewNote,
    modifiers,
    setActiveDuration,
  });

  // --- EXPORTS ---
  // Grouped domain objects for organized API access
  const state: ScoreStateGroup = {
    score,
    selection,
    editorState,
    previewNote,
    history,
    redoStack,
  };

  const toolsGroup: ScoreToolsGroup = {
    activeDuration,
    setActiveDuration,
    isDotted,
    setIsDotted,
    activeAccidental,
    activeTie,
    inputMode,
    setInputMode,
    toggleInputMode,
  };

  const navigationGroup: ScoreNavigationGroup = {
    move: navigation.moveSelection,
    select: navigation.handleNoteSelection,
    transpose: navigation.transposeSelection,
    switchStaff: navigation.switchStaff,
    focus: focusScore,
  };

  const entryGroup: ScoreEntryGroup = {
    addNote: noteActions.addNoteToMeasure,
    addChord: noteActions.addChordToMeasure,
    delete: noteActions.deleteSelected,
    handleMeasureHover: noteActions.handleMeasureHover,
    updatePitch: noteActions.updateNotePitch,
  };

  const modifiersGroup: ScoreModifiersGroup = {
    duration: handleDurationChangeWrapper,
    dot: modifiers.handleDotToggle,
    accidental: modifiers.handleAccidentalToggle,
    tie: modifiers.handleTieToggle,
    checkDurationValidity: modifiers.checkDurationValidity,
    checkDotValidity: modifiers.checkDotValidity,
  };

  const measuresGroup: ScoreMeasuresGroup = {
    add: measureActions.addMeasure,
    remove: measureActions.removeMeasure,
    setTimeSignature: measureActions.handleTimeSignatureChange,
    setKeySignature: measureActions.handleKeySignatureChange,
    togglePickup: measureActions.togglePickup,
    setGrandStaff: measureActions.setGrandStaff,
  };

  const tupletsGroup: ScoreTupletsGroup = {
    apply: tupletActions.applyTuplet,
    remove: tupletActions.removeTuplet,
    canApply: tupletActions.canApplyTuplet,
    activeRatio: tupletActions.getActiveTupletRatio(),
  };

  const historyGroup: ScoreHistoryGroup = {
    undo,
    redo,
    begin: beginTransaction,
    commit: commitTransaction,
    rollback: rollbackTransaction,
  };

  const enginesGroup: ScoreEnginesGroup = {
    dispatch,
    selectionEngine,
    scoreRef,
  };

  const derivedGroup: ScoreDerivedGroup = {
    selectedDurations,
    selectedDots,
    selectedTies,
    selectedAccidentals,
  };

  return {
    // --- GROUPED API ---
    state,
    tools: toolsGroup,
    navigation: navigationGroup,
    entry: entryGroup,
    modifiers: modifiersGroup,
    measures: measuresGroup,
    tuplets: tupletsGroup,
    historyAPI: historyGroup,
    engines: enginesGroup,
    derived: derivedGroup,

    // --- ADDITIONAL EXPORTS (not yet grouped) ---
    // These are commonly needed and will be grouped in future refactors
    setSelection,
    setPreviewNote,
    clearSelection,
    currentQuantsPerMeasure,
  };
};
