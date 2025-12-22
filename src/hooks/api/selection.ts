import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import {
  SelectAllCommand,
  SelectAllInEventCommand,
  SelectFullEventsCommand,
  ExtendSelectionVerticallyCommand,
} from '@/commands/selection';

/**
 * Selection method names provided by this factory
 */
type SelectionMethodNames = 'addToSelection' | 'selectRangeTo' | 'selectAll' | 'selectEvent' | 'deselectAll' | 'selectFullEvents' | 'extendSelectionUp' | 'extendSelectionDown' | 'extendSelectionAllStaves';

/**
 * Factory for creating Selection API methods.
 * Handles multi-selection, expansion, and range operations.
 *
 * Uses ThisType<MusicEditorAPI> so `this` is correctly typed without explicit casts.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for selection
 */
export const createSelectionMethods = (ctx: APIContext): Pick<MusicEditorAPI, SelectionMethodNames> & ThisType<MusicEditorAPI> => {
  const { scoreRef, selectionRef, syncSelection, selectionEngine } = ctx;

  return {
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

    /**
     * Select all notes in all touched events (fill partial chords).
     * "Touched" = any event that has at least one note selected.
     */
    selectFullEvents() {
      selectionEngine.dispatch(new SelectFullEventsCommand());
      selectionRef.current = selectionEngine.getState();
      return this;
    },

    /**
     * Extend selection to quant-aligned events in the staff above.
     * Uses anchor-based cursor model - can expand OR contract.
     */
    extendSelectionUp() {
      selectionEngine.dispatch(new ExtendSelectionVerticallyCommand({ direction: 'up' }));
      selectionRef.current = selectionEngine.getState();
      return this;
    },

    /**
     * Extend selection to quant-aligned events in the staff below.
     * Uses anchor-based cursor model - can expand OR contract.
     */
    extendSelectionDown() {
      selectionEngine.dispatch(new ExtendSelectionVerticallyCommand({ direction: 'down' }));
      selectionRef.current = selectionEngine.getState();
      return this;
    },

    /**
     * Extend selection to quant-aligned events across ALL staves.
     */
    extendSelectionAllStaves() {
      selectionEngine.dispatch(new ExtendSelectionVerticallyCommand({ direction: 'all' }));
      selectionRef.current = selectionEngine.getState();
      return this;
    },
  };
};
