import { MusicEditorAPI } from '@/api.types';
import { APIContext } from './types';
import { navigateSelection, getFirstNoteId } from '@/utils/core';
import { SelectEventCommand } from '@/commands/selection';

/**
 * Factory for creating Navigation API methods.
 *
 * @param ctx - Shared API context
 * @returns Partial API implementation for navigation
 */
export const createNavigationMethods = (ctx: APIContext): Pick<MusicEditorAPI, 'move' | 'jump' | 'select' | 'selectById' | 'selectAtQuant'> => {
  const { scoreRef, selectionRef, syncSelection, selectionEngine } = ctx;

  return {
    move(direction) {
      const sel = selectionRef.current;
      const staff = scoreRef.current.staves[sel.staffIndex];
      if (!staff) return this as unknown as MusicEditorAPI;

      const measures = staff.measures;

      if (direction === 'left' || direction === 'right') {
        // Use existing navigateSelection utility for horizontal movement
        const newSel = navigateSelection(measures, sel, direction);

        syncSelection({
          ...newSel,
          selectedNotes: newSel.eventId && newSel.measureIndex !== null
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
        // Vertical navigation (cross-staff logic placeholder - wired in Phase 1.5)
        // For now, no-op or simple behavior can be preserved if it existed
      }
      return this as unknown as MusicEditorAPI;
    },

    jump(target) {
      const sel = selectionRef.current;
      const staff = scoreRef.current.staves[sel.staffIndex];
      if (!staff || staff.measures.length === 0) return this as unknown as MusicEditorAPI;

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
          return this as unknown as MusicEditorAPI;
      }

      const measure = measures[targetMeasureIndex];
      if (!measure) return this as unknown as MusicEditorAPI;

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

      return this as unknown as MusicEditorAPI;
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

      return this as unknown as MusicEditorAPI;
    },

    selectAtQuant(_measureNum, _quant, _staffIndex = 0) {
      // TODO: Implement quant-based selection
      return this as unknown as MusicEditorAPI;
    },

    selectById(eventId, noteId) {
      const sel = selectionRef.current;
      const staff = scoreRef.current.staves[sel.staffIndex];
      if (!staff) return this as unknown as MusicEditorAPI;

      // Find the event and measure containing this eventId
      // TODO: Optimize lookup map
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
      return this as unknown as MusicEditorAPI;
    },
  };
};
