/**
 * useScoreAPI Hook
 *
 * Machine-addressable API hook that provides external script control
 * of RiffScore instances via `window.riffScore`.
 *
 * This is the "Glue Layer" that translates high-level API calls
 * into internal commands and state updates.
 *
 * @see docs/migration/api_reference_draft.md
 */

import { useRef, useMemo } from 'react';
import type {
  MusicEditorAPI,
  Unsubscribe,
  APIEventType,
} from '../api.types';
import type { Score, Selection, RiffScoreConfig, ScoreEvent } from '../types';

/**
 * Internal helpers
 */
const _generateId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Props for the useScoreAPI hook
 */
export interface UseScoreAPIProps {
  /** Current score state */
  score: Score;
  /** Current selection state */
  selection: Selection;
  /** Current config */
  config: RiffScoreConfig;
  /** Dispatch function for score commands */
  dispatch: (command: unknown) => void;
  /** Selection setter */
  setSelection: (selection: Selection) => void;
}

/**
 * Creates a MusicEditorAPI instance for external script control.
 *
 * @example
 * ```typescript
 * const api = useScoreAPI({ score, selection, config, dispatch, setSelection });
 * // Expose via ref or window.riffScore
 * ```
 */
export function useScoreAPI({
  score,
  selection,
  config,
  dispatch: _dispatch, // Unused in skeleton - will be used when implementing commands
  setSelection,
}: UseScoreAPIProps): MusicEditorAPI {
  // Synchronous state refs (authoritative for chaining)
  const scoreRef = useRef(score);
  const selectionRef = useRef(selection);

  // Keep refs in sync with React state
  scoreRef.current = score;
  selectionRef.current = selection;

  // Build API object (memoized to maintain stable reference)
  const api: MusicEditorAPI = useMemo(() => {
    const instance: MusicEditorAPI = {
      // ========== NAVIGATION ==========
      move(direction) {
        // TODO: Implement navigation
        return this;
      },

      jump(target) {
        // TODO: Implement jump
        return this;
      },

      select(measureNum, staffIndex = 0, eventIndex = 0) {
        // Convert 1-based measureNum to 0-based index
        const measureIndex = measureNum - 1;
        const staff = scoreRef.current.staves[staffIndex];
        if (!staff) return this;

        const measure = staff.measures[measureIndex];
        if (!measure) return this;

        const event = measure.events[eventIndex];
        const eventId = event?.id ?? null;
        const noteId = event?.notes?.[0]?.id ?? null;

        setSelection({
          staffIndex,
          measureIndex,
          eventId,
          noteId,
          selectedNotes: eventId
            ? [{ staffIndex, measureIndex, eventId, noteId }]
            : [],
          anchor: null,
        });

        return this;
      },

      selectAtQuant(measureNum, quant, staffIndex = 0) {
        // TODO: Implement quant-based selection
        return this;
      },

      selectById(eventId, noteId) {
        // TODO: Implement ID-based selection
        return this;
      },

      // ========== SELECTION (MULTI-SELECT) ==========
      addToSelection(measureNum, staffIndex, eventIndex) {
        // TODO: Implement
        return this;
      },

      selectRangeTo(measureNum, staffIndex, eventIndex) {
        // TODO: Implement
        return this;
      },

      selectAll(scope = 'score') {
        // TODO: Implement
        return this;
      },

      deselectAll() {
        setSelection({
          staffIndex: selectionRef.current.staffIndex,
          measureIndex: null,
          eventId: null,
          noteId: null,
          selectedNotes: [],
          anchor: null,
        });
        return this;
      },

      // ========== ENTRY (CREATE) ==========
      addNote(pitch, duration = 'quarter', dotted = false) {
        // TODO: Dispatch AddEventCommand
        // Skeleton: log and return for chaining test
        return this;
      },

      addRest(duration = 'quarter', dotted = false) {
        // TODO: Dispatch AddEventCommand with isRest
        return this;
      },

      addTone(pitch) {
        // TODO: Dispatch AddToneCommand
        return this;
      },

      makeTuplet(numNotes, inSpaceOf) {
        // TODO: Implement
        return this;
      },

      unmakeTuplet() {
        // TODO: Implement
        return this;
      },

      toggleTie() {
        // TODO: Implement
        return this;
      },

      setTie(tied) {
        // TODO: Implement
        return this;
      },

      setInputMode(mode) {
        // TODO: Implement
        return this;
      },

      // ========== MODIFICATION (UPDATE) ==========
      setPitch(pitch) {
        // TODO: Dispatch ChangePitchCommand
        return this;
      },

      setDuration(duration, dotted) {
        // TODO: Dispatch ChangeRhythmCommand
        return this;
      },

      setAccidental(type) {
        // TODO: Implement
        return this;
      },

      toggleAccidental() {
        // TODO: Implement
        return this;
      },

      transpose(semitones) {
        // TODO: Dispatch TransposeCommand
        return this;
      },

      transposeDiatonic(steps) {
        // TODO: Implement
        return this;
      },

      updateEvent(props: Partial<ScoreEvent>) {
        // TODO: Generic update
        return this;
      },

      // ========== STRUCTURE ==========
      addMeasure(atIndex) {
        // TODO: Dispatch AddMeasureCommand
        return this;
      },

      deleteMeasure(measureIndex) {
        // TODO: Dispatch DeleteMeasureCommand
        return this;
      },

      deleteSelected() {
        // TODO: Implement smart delete
        return this;
      },

      setKeySignature(key) {
        // TODO: Implement
        return this;
      },

      setTimeSignature(sig) {
        // TODO: Implement
        return this;
      },

      setMeasurePickup(isPickup) {
        // TODO: Implement
        return this;
      },

      // ========== CONFIGURATION ==========
      setClef(clef) {
        // TODO: Dispatch SetClefCommand
        return this;
      },

      setScoreTitle(title) {
        // TODO: Implement
        return this;
      },

      setBpm(bpm) {
        // TODO: Implement
        return this;
      },

      setTheme(theme) {
        // TODO: Implement
        return this;
      },

      setScale(scale) {
        // TODO: Implement
        return this;
      },

      setStaffLayout(type) {
        // TODO: Implement
        return this;
      },

      // ========== LIFECYCLE & IO ==========
      loadScore(newScore) {
        // TODO: Implement
        return this;
      },

      reset(template = 'grand', measures = 4) {
        // TODO: Implement
        return this;
      },

      export(format) {
        if (format === 'json') {
          return JSON.stringify(scoreRef.current, null, 2);
        }
        // TODO: ABC and MusicXML export
        throw new Error(`Export format '${format}' not yet implemented`);
      },

      // ========== PLAYBACK ==========
      play() {
        // TODO: Implement
        return this;
      },

      pause() {
        // TODO: Implement
        return this;
      },

      stop() {
        // TODO: Implement
        return this;
      },

      rewind(measureNum) {
        // TODO: Implement
        return this;
      },

      setInstrument(instrumentId) {
        // TODO: Implement
        return this;
      },

      // ========== DATA (QUERIES) ==========
      getScore(): Score {
        return scoreRef.current;
      },

      getConfig(): RiffScoreConfig {
        return config;
      },

      getSelection(): Selection {
        return selectionRef.current;
      },

      // ========== HISTORY & CLIPBOARD ==========
      undo() {
        // TODO: Implement
        return this;
      },

      redo() {
        // TODO: Implement
        return this;
      },

      beginTransaction() {
        // TODO: Implement (Phase 4)
        return this;
      },

      commitTransaction() {
        // TODO: Implement (Phase 4)
        return this;
      },

      copy() {
        // TODO: Implement
        return this;
      },

      cut() {
        // TODO: Implement
        return this;
      },

      paste() {
        // TODO: Implement
        return this;
      },

      // ========== EVENTS (Phase 3) ==========
      // Implementation uses 'any' to satisfy overloaded interface signatures
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on(_event: any, _callback: any): Unsubscribe {
        // TODO: Implement (Phase 3)
        return () => {};
      },
    };

    return instance;
  }, [config, setSelection]);

  return api;
}
