/**
 * useScoreAPI Hook
 *
 * Machine-addressable API hook that provides external script control
 * of RiffScore instances via `window.riffScore`.
 *
 * DESIGN NOTE:
 * This hook consumes the ScoreContext directly. It maintains internal Refs
 * to the latest state to ensure that imperative calls (which don't follow
 * React's render cycle) always have access to the latest data without
 * closure staleness.
 *
 * @see docs/migration/api_reference_draft.md
 */

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useScoreContext } from '../context/ScoreContext';
import type { MusicEditorAPI, RiffScoreRegistry, Unsubscribe } from '../api.types';
import type { RiffScoreConfig, Note, Score, Selection } from '../types';
import { AddEventCommand } from '../commands/AddEventCommand';
import { AddNoteToEventCommand } from '../commands/AddNoteToEventCommand';
import {
  SetSelectionCommand,
  SelectAllCommand,
  SelectAllInEventCommand,
  SelectEventCommand,
} from '../commands/selection';
import { navigateSelection, getFirstNoteId } from '../utils/core';
import { canAddEventToMeasure } from '../utils/validation';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    riffScore: RiffScoreRegistry;
  }
}

const generateId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Initialize the global registry if it doesn't exist
 */
const initRegistry = (): void => {
  if (typeof window === 'undefined') return;
  if (!window.riffScore) {
    window.riffScore = {
      instances: new Map<string, MusicEditorAPI>(),
      active: null,
      get: (id: string) => window.riffScore.instances.get(id),
    };
  }
};

/**
 * Props for the useScoreAPI hook
 */
export interface UseScoreAPIProps {
  /** Unique instance ID for registry */
  instanceId: string;
  /** Current config */
  config: RiffScoreConfig;
}

/**
 * Creates a MusicEditorAPI instance for external script control.
 *
 * This hook consumes ScoreContext internally, so it must be used within
 * a ScoreProvider. It only needs instanceId and config from props.
 *
 * @example
 * ```typescript
 * const api = useScoreAPI({ instanceId: 'my-score', config });
 * // API is automatically registered to window.riffScore
 * ```
 */
export function useScoreAPI({ instanceId, config }: UseScoreAPIProps): MusicEditorAPI {
  // 1. Consume Context Directly
  const { score, selection, dispatch, selectionEngine } = useScoreContext();

  // 2. Synchronous State Refs (authoritative for API methods to avoid stale closures)
  const scoreRef = useRef(score);
  const selectionRef = useRef(selection);

  // Keep refs in sync with React state on every render
  scoreRef.current = score;
  selectionRef.current = selection;

  // 3. Selection Sync Helper
  // Updates both the authoritative Ref (for immediate chaining) and dispatches to engine (for UI)
  const syncSelection = useCallback((newSelection: typeof selection) => {
    selectionRef.current = newSelection;
    selectionEngine.dispatch(new SetSelectionCommand({
      staffIndex: newSelection.staffIndex,
      measureIndex: newSelection.measureIndex,
      eventId: newSelection.eventId,
      noteId: newSelection.noteId,
      selectedNotes: newSelection.selectedNotes,
      anchor: newSelection.anchor,
    }));
  }, [selectionEngine]);

  // 4. Build API Object (memoized to maintain stable reference)
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
          // Note: Full ghost cursor support requires Phase 1.5 (wiring to calculateNextSelection)
          const newSel = navigateSelection(measures, sel, direction);

          syncSelection({
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
          // TODO: Wire to calculateVerticalNavigation in Phase 1.5
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

        syncSelection({
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

      select(measureNum, staffIndex = 0, eventIndex = 0, noteIndex = 0) {
        // Convert 1-based measureNum to 0-based index
        const measureIndex = measureNum - 1;
        
        // Use SelectEventCommand for proper selection
        selectionEngine.dispatch(new SelectEventCommand({
          staffIndex,
          measureIndex,
          eventIndex,
          noteIndex,
        }));

        // Sync the ref for chaining
        selectionRef.current = selectionEngine.getState();

        return this;
      },

      selectAtQuant(_measureNum, _quant, _staffIndex = 0) {
        // TODO: Implement quant-based selection
        return this;
      },

      selectById(eventId, noteId) {
        const sel = selectionRef.current;
        const staff = scoreRef.current.staves[sel.staffIndex];
        if (!staff) return this;

        // Find the event and measure containing this eventId
        for (let mIdx = 0; mIdx < staff.measures.length; mIdx++) {
          const measure = staff.measures[mIdx];
          const eIdx = measure.events.findIndex(e => e.id === eventId);
          if (eIdx !== -1) {
            const event = measure.events[eIdx];
            // Find note index if noteId provided
            let noteIndex = 0;
            if (noteId && event.notes) {
              const nIdx = event.notes.findIndex(n => n.id === noteId);
              if (nIdx !== -1) noteIndex = nIdx;
            }
            selectionEngine.dispatch(new SelectEventCommand({
              staffIndex: sel.staffIndex,
              measureIndex: mIdx,
              eventIndex: eIdx,
              noteIndex,
            }));
            selectionRef.current = selectionEngine.getState();
            break;
          }
        }
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

      selectAll(scope = 'score') {
        const sel = selectionRef.current;
        selectionEngine.dispatch(new SelectAllCommand({
          scope: scope as 'score' | 'staff' | 'measure' | 'event',
          staffIndex: sel.staffIndex,
          measureIndex: sel.measureIndex ?? undefined,
          expandIfSelected: false, // API uses explicit scope
        }));
        selectionRef.current = selectionEngine.getState();
        return this;
      },

      /** Select all notes in the current event (chord) */
      selectEvent(measureNum?: number, staffIndex?: number, eventIndex?: number) {
        const sel = selectionRef.current;
        const sIdx = staffIndex ?? sel.staffIndex;
        const mIdx = measureNum !== undefined ? measureNum - 1 : sel.measureIndex;
        
        if (mIdx === null) return this;
        
        const staff = scoreRef.current.staves[sIdx];
        if (!staff) return this;
        
        const measure = staff.measures[mIdx];
        if (!measure) return this;
        
        // Get event
        const eIdx = eventIndex ?? measure.events.findIndex(e => e.id === sel.eventId);
        const event = measure.events[eIdx];
        if (!event) return this;

        selectionEngine.dispatch(new SelectAllInEventCommand({
          staffIndex: sIdx,
          measureIndex: mIdx,
          eventId: event.id,
        }));
        selectionRef.current = selectionEngine.getState();
        return this;
      },

      deselectAll() {
        syncSelection({
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
        let staffIndex = sel.staffIndex;
        let measureIndex = sel.measureIndex;

        // If no measure is selected, default to first measure
        if (measureIndex === null) {
          staffIndex = 0;
          measureIndex = 0;
        }

        const staff = scoreRef.current.staves[staffIndex];
        if (!staff || staff.measures.length === 0) {
          console.warn('[RiffScore API] addNote failed: No measures exist in the score');
          return this;
        }

        const measure = staff.measures[measureIndex];
        if (!measure) {
          console.warn(`[RiffScore API] addNote failed: Measure ${measureIndex + 1} does not exist`);
          return this;
        }

        // Check if measure has capacity for this note
        if (!canAddEventToMeasure(measure.events, duration, dotted)) {
          console.warn(`[RiffScore API] addNote failed: Measure ${measureIndex + 1} is full. Cannot add ${dotted ? 'dotted ' : ''}${duration} note.`);
          return this;
        }

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
        syncSelection({
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
        let staffIndex = sel.staffIndex;
        let measureIndex = sel.measureIndex;

        // If no measure is selected, default to first measure
        if (measureIndex === null) {
          staffIndex = 0;
          measureIndex = 0;
        }

        const staff = scoreRef.current.staves[staffIndex];
        if (!staff || staff.measures.length === 0) {
          console.warn('[RiffScore API] addRest failed: No measures exist in the score');
          return this;
        }

        const measure = staff.measures[measureIndex];
        if (!measure) {
          console.warn(`[RiffScore API] addRest failed: Measure ${measureIndex + 1} does not exist`);
          return this;
        }

        // Check if measure has capacity for this rest
        if (!canAddEventToMeasure(measure.events, duration, dotted)) {
          console.warn(`[RiffScore API] addRest failed: Measure ${measureIndex + 1} is full. Cannot add ${dotted ? 'dotted ' : ''}${duration} rest.`);
          return this;
        }

        // Dispatch AddEventCommand with isRest=true
        const eventId = generateId();
        dispatch(new AddEventCommand(measureIndex, true, null, duration, dotted, undefined, eventId, staffIndex));

        // Advance cursor
        const restNoteId = `${eventId}-rest`;
        syncSelection({
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
        syncSelection({
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

      updateEvent(_props: Partial<{ id: string; notes: Note[]; duration: string; dotted: boolean }>) {
        // TODO: Generic update - will use proper ScoreEvent type when implemented
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
  }, [config, dispatch, syncSelection]);

  // 5. Registry registration/cleanup
  useEffect(() => {
    initRegistry();
    
    // Register this instance
    window.riffScore.instances.set(instanceId, api);
    window.riffScore.active = api;

    // Cleanup on unmount
    return () => {
      window.riffScore.instances.delete(instanceId);
      if (window.riffScore.active === api) {
        window.riffScore.active = null;
      }
    };
  }, [instanceId, api]);

  return api;
}
