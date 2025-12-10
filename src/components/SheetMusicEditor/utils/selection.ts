
import { Selection, createDefaultSelection, Score, Staff, Measure } from '../types';

/**
 * Robustly compares two IDs (string or number)
 */
export const compareIds = (id1: string | number | null | undefined, id2: string | number | null | undefined): boolean => {
    if (id1 == null && id2 == null) return true; // Both null or undefined
    if (id1 == null || id2 == null) return false; // One is nullish
    return String(id1) === String(id2);
};

interface NoteContext {
    staffIndex: number;
    measureIndex: number;
    eventId: string | number;
    noteId: string | number | null;
}

/**
 * Checks if a specific note is currently selected.
 * Handles both primary selection (cursor) and multi-selection list.
 */
export const isNoteSelected = (selection: Selection, context: NoteContext): boolean => {
    const { staffIndex, measureIndex, eventId, noteId } = context;

    // 1. Check Primary Selection (Cursor)
    const isPrimaryEventMatch = 
        compareIds(selection.eventId, eventId) && 
        selection.measureIndex === measureIndex &&
        (selection.staffIndex === undefined || selection.staffIndex === staffIndex);

    if (isPrimaryEventMatch) {
        if (!selection.noteId) return true; // Whole event selected
        if (compareIds(selection.noteId, noteId)) return true; // Specific note match
    }

    // 2. Check Multi-Selection List
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        return selection.selectedNotes.some(sn => 
            compareIds(sn.noteId, noteId) &&
            compareIds(sn.eventId, eventId) &&
            sn.measureIndex === measureIndex &&
            sn.staffIndex === staffIndex
        );
    }

    return false;
};

/**
 * Calculates the new selection state when toggling a note.
 * Handles single-select vs multi-select logic.
 */
export const toggleNoteInSelection = (
    prevSelection: Selection, 
    context: NoteContext, 
    isMulti: boolean
): Selection => {
    const { staffIndex, measureIndex, eventId, noteId } = context;

    if (!eventId) {
        return { ...createDefaultSelection(), staffIndex };
    }

    // Initialize list: preserve existing if multi, or reset if single
    let newSelectedNotes = isMulti ? (prevSelection.selectedNotes ? [...prevSelection.selectedNotes] : []) : [];

    // "Promote" existing primary selection to list if starting multi-select
    if (isMulti && prevSelection.noteId && prevSelection.eventId && prevSelection.measureIndex !== null) {
        const alreadyInList = newSelectedNotes.some(n => 
            compareIds(n.noteId, prevSelection.noteId) && 
            compareIds(n.eventId, prevSelection.eventId) &&
            n.measureIndex === prevSelection.measureIndex &&
            n.staffIndex === prevSelection.staffIndex
        );
        
        if (!alreadyInList) {
            newSelectedNotes.push({
                staffIndex: prevSelection.staffIndex,
                measureIndex: prevSelection.measureIndex,
                eventId: prevSelection.eventId,
                noteId: prevSelection.noteId
            });
        }
    }

    // Determine if target is currently in the list
    const existingIndex = newSelectedNotes.findIndex(n => 
        compareIds(n.noteId, noteId) && 
        compareIds(n.eventId, eventId) &&
        n.measureIndex === measureIndex &&
        n.staffIndex === staffIndex
    );

    if (isMulti) {
        if (existingIndex >= 0) {
            // Toggle OFF
            newSelectedNotes.splice(existingIndex, 1);
        } else {
            // Toggle ON
            if (noteId) {
                newSelectedNotes.push({ staffIndex, measureIndex, eventId, noteId });
            }
        }
        
        return {
            staffIndex,
            measureIndex,
            eventId,
            noteId, // Set as primary cursor
            selectedNotes: newSelectedNotes,
            anchor: prevSelection.anchor // Preserve anchor if it exists
        };

    } else {
        // Single Selection Mode
        // Clear list, set this as the only selected item, clear anchor
        if (noteId) {
            newSelectedNotes = [{ staffIndex, measureIndex, eventId, noteId }];
        }
        
        return {
            staffIndex,
            measureIndex,
            eventId,
            noteId,
            selectedNotes: newSelectedNotes,
            anchor: null // Clear anchor on single, non-shift selection
        };
    }
};

/**
 * Flattens the score into a linear list of note contexts.
 * Useful for range calculations.
 */
export const getLinearizedNotes = (score: Score): NoteContext[] => {
    const notes: NoteContext[] = [];
    
    score.staves.forEach((staff, staffInd) => {
        staff.measures.forEach((measure, measureInd) => {
             measure.events.forEach(event => {
                 if (event.notes && event.notes.length > 0) {
                     event.notes.forEach(note => {
                         notes.push({
                             staffIndex: staffInd,
                             measureIndex: measureInd,
                             eventId: event.id,
                             noteId: note.id
                         });
                     });
                 }
             });
        });
    });
    
    return notes;
};

/**
 * Calculates the range of selected notes between the anchor and the focus note.
 */
export const calculateNoteRange = (
    anchor: NoteContext, 
    focus: NoteContext, 
    linearNotes: NoteContext[]
): NoteContext[] => {
    const anchorIndex = linearNotes.findIndex(n => 
        compareIds(n.noteId, anchor.noteId) && 
        compareIds(n.eventId, anchor.eventId) &&
        n.measureIndex === anchor.measureIndex &&
        n.staffIndex === anchor.staffIndex
    );

    const focusIndex = linearNotes.findIndex(n => 
        compareIds(n.noteId, focus.noteId) && 
        compareIds(n.eventId, focus.eventId) &&
        n.measureIndex === focus.measureIndex &&
        n.staffIndex === focus.staffIndex
    );
    
    if (anchorIndex === -1 || focusIndex === -1) return [];

    const start = Math.min(anchorIndex, focusIndex);
    const end = Math.max(anchorIndex, focusIndex);
    
    return linearNotes.slice(start, end + 1);
};
