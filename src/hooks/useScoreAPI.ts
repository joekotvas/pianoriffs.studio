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
import type { MusicEditorAPI, Unsubscribe } from '../api.types';
import type { Score, Selection, RiffScoreConfig, ScoreEvent, Note } from '../types';
import { AddEventCommand } from '../commands/AddEventCommand';
import { AddNoteToEventCommand } from '../commands/AddNoteToEventCommand';
import { navigateSelection } from '../utils/core';

/**
 * Internal helper to generate unique IDs
 */
const generateId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Get first note ID from an event
 */
const getFirstNoteId = (event: ScoreEvent | undefined): string | number | null => {
  if (!event || !event.notes || event.notes.length === 0) return null;
  return event.notes[0].id;
};

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
  dispatch,
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
        const sel = selectionRef.current;
        const staff = scoreRef.current.staves[sel.staffIndex];
        if (!staff) return this;

        const measures = staff.measures;

        if (direction === 'left' || direction === 'right') {
          // Use existing navigateSelection utility for horizontal movement
          const newSel = navigateSelection(measures, sel, direction);
          setSelection({
            ...newSel,
            selectedNotes: newSel.eventId
              ? [
                  {
                    staffIndex: newSel.staffIndex,
                    measureIndex: newSel.measureIndex,
                    eventId: newSel.eventId,
                    noteId: newSel.noteId,
                  },
                ]
              : [],
            anchor: null,
          });
        } else if (direction === 'up' || direction === 'down') {
          // Vertical navigation (cross-staff) - for single staff, cycle within notes
          // TODO: Handle cross-staff navigation properly in Phase 2
          // For now, just stay on current selection
        }
        return this;
      },

      jump(target) {
        const sel = selectionRef.current;
        const staff = scoreRef.current.staves[sel.staffIndex];
        if (!staff || staff.measures.length === 0) return this;

        const measures = staff.measures;
        let targetMeasureIndex: number;
        let targetEventIndex: number;

        switch (target) {
          case 'start-score':
            targetMeasureIndex = 0;
            targetEventIndex = 0;
            break;
          case 'end-score':
            targetMeasureIndex = measures.length - 1;
            targetEventIndex = Math.max(0, measures[targetMeasureIndex].events.length - 1);
            break;
          case 'start-measure':
            targetMeasureIndex = sel.measureIndex ?? 0;
            targetEventIndex = 0;
            break;
          case 'end-measure':
            targetMeasureIndex = sel.measureIndex ?? 0;
            targetEventIndex = Math.max(0, measures[targetMeasureIndex]?.events.length - 1);
            break;
          default:
            return this;
        }

        const measure = measures[targetMeasureIndex];
        if (!measure) return this;

        const event = measure.events[targetEventIndex];
        const eventId = event?.id ?? null;
        const noteId = getFirstNoteId(event);

        setSelection({
          staffIndex: sel.staffIndex,
          measureIndex: targetMeasureIndex,
          eventId,
          noteId,
          selectedNotes: eventId
            ? [{ staffIndex: sel.staffIndex, measureIndex: targetMeasureIndex, eventId, noteId }]
            : [],
          anchor: null,
        });

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
        const noteId = getFirstNoteId(event);

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

      selectAtQuant(_measureNum, _quant, _staffIndex = 0) {
        // TODO: Implement quant-based selection
        return this;
      },

      selectById(_eventId, _noteId) {
        // TODO: Implement ID-based selection
        return this;
      },

      // ========== SELECTION (MULTI-SELECT) ==========
      addToSelection(_measureNum, _staffIndex, _eventIndex) {
        // TODO: Implement
        return this;
      },

      selectRangeTo(_measureNum, _staffIndex, _eventIndex) {
        // TODO: Implement
        return this;
      },

      selectAll(_scope = 'score') {
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
        const sel = selectionRef.current;
        const staffIndex = sel.staffIndex;
        const measureIndex = sel.measureIndex ?? 0;

        // Create note payload
        const noteId = generateId();
        const note: Note = {
          id: noteId,
          pitch,
          accidental: null,
          tied: false,
        };

        // Dispatch AddEventCommand
        const eventId = generateId();
        dispatch(new AddEventCommand(measureIndex, false, note, duration, dotted, undefined, eventId, staffIndex));

        // Advance cursor to the new event
        // We need to wait for state update, but for chainability we update selection immediately
        // The event will be at the end of the measure
        const staff = scoreRef.current.staves[staffIndex];
        const newEventIndex = staff?.measures[measureIndex]?.events.length ?? 0;

        setSelection({
          staffIndex,
          measureIndex,
          eventId,
          noteId,
          selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
          anchor: null,
        });

        return this;
      },

      addRest(duration = 'quarter', dotted = false) {
        const sel = selectionRef.current;
        const staffIndex = sel.staffIndex;
        const measureIndex = sel.measureIndex ?? 0;

        // Dispatch AddEventCommand with isRest=true
        const eventId = generateId();
        dispatch(new AddEventCommand(measureIndex, true, null, duration, dotted, undefined, eventId, staffIndex));

        // Advance cursor
        const restNoteId = `${eventId}-rest`;
        setSelection({
          staffIndex,
          measureIndex,
          eventId,
          noteId: restNoteId,
          selectedNotes: [{ staffIndex, measureIndex, eventId, noteId: restNoteId }],
          anchor: null,
        });

        return this;
      },

      addTone(pitch) {
        const sel = selectionRef.current;
        if (sel.measureIndex === null || sel.eventId === null) return this;

        const staffIndex = sel.staffIndex;
        const measureIndex = sel.measureIndex;
        const eventId = sel.eventId;

        // Create note to add to chord
        const noteId = generateId();
        const note: Note = {
          id: noteId,
          pitch,
          accidental: null,
          tied: false,
        };

        // Dispatch AddNoteToEventCommand
        dispatch(new AddNoteToEventCommand(measureIndex, eventId, note, staffIndex));

        // Update selection to include new note
        setSelection({
          ...sel,
          noteId,
          selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
        });

        return this;
      },

      makeTuplet(_numNotes, _inSpaceOf) {
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

      setTie(_tied) {
        // TODO: Implement
        return this;
      },

      setInputMode(_mode) {
        // TODO: Implement
        return this;
      },

      // ========== MODIFICATION (UPDATE) ==========
      setPitch(_pitch) {
        // TODO: Dispatch ChangePitchCommand
        return this;
      },

      setDuration(_duration, _dotted) {
        // TODO: Dispatch ChangeRhythmCommand
        return this;
      },

      setAccidental(_type) {
        // TODO: Implement
        return this;
      },

      toggleAccidental() {
        // TODO: Implement
        return this;
      },

      transpose(_semitones) {
        // TODO: Dispatch TransposeCommand
        return this;
      },

      transposeDiatonic(_steps) {
        // TODO: Implement
        return this;
      },

      updateEvent(_props: Partial<ScoreEvent>) {
        // TODO: Generic update
        return this;
      },

      // ========== STRUCTURE ==========
      addMeasure(_atIndex) {
        // TODO: Dispatch AddMeasureCommand
        return this;
      },

      deleteMeasure(_measureIndex) {
        // TODO: Dispatch DeleteMeasureCommand
        return this;
      },

      deleteSelected() {
        // TODO: Implement smart delete
        return this;
      },

      setKeySignature(_key) {
        // TODO: Implement
        return this;
      },

      setTimeSignature(_sig) {
        // TODO: Implement
        return this;
      },

      setMeasurePickup(_isPickup) {
        // TODO: Implement
        return this;
      },

      // ========== CONFIGURATION ==========
      setClef(_clef) {
        // TODO: Dispatch SetClefCommand
        return this;
      },

      setScoreTitle(_title) {
        // TODO: Implement
        return this;
      },

      setBpm(_bpm) {
        // TODO: Implement
        return this;
      },

      setTheme(_theme) {
        // TODO: Implement
        return this;
      },

      setScale(_scale) {
        // TODO: Implement
        return this;
      },

      setStaffLayout(_type) {
        // TODO: Implement
        return this;
      },

      // ========== LIFECYCLE & IO ==========
      loadScore(_newScore) {
        // TODO: Implement
        return this;
      },

      reset(_template = 'grand', _measures = 4) {
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

      rewind(_measureNum) {
        // TODO: Implement
        return this;
      },

      setInstrument(_instrumentId) {
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
  }, [config, dispatch, setSelection]);

  return api;
}
