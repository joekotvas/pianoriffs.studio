import { useState, useCallback, useMemo } from 'react';
import { Selection, createDefaultSelection, Score, getActiveStaff } from '../types';
import { toggleNoteInSelection, calculateNoteRange, getLinearizedNotes } from '../utils/selection';
import { playNote } from '../engines/toneEngine';

interface UseSelectionProps {
  score: Score;
  dispatch?: any; 
}

export const useSelection = ({ score }: UseSelectionProps) => {
  const [selection, setSelection] = useState<Selection>(createDefaultSelection());
  const [lastSelection, setLastSelection] = useState<Selection | null>(null);

  // --- Helpers ---
  
  const playAudioFeedback = useCallback((notes: any[]) => {
      notes.forEach(n => playNote(n.pitch));
  }, []);

  // --- Actions ---

  const clearSelection = useCallback(() => {
    setSelection(prev => {
       setLastSelection(prev);
       return {
           ...createDefaultSelection(),
           staffIndex: prev.staffIndex // Maintain current staff focus
       };
    });
  }, []);

  const select = useCallback((
    measureIndex: number | null, 
    eventId: string | number | null, 
    noteId: string | number | null, 
    staffIndex: number = 0, 
    options: { 
        isMulti?: boolean; 
        isShift?: boolean; 
        selectAllInEvent?: boolean;
        onlyHistory?: boolean;
    } = {}
  ) => {
    const { isMulti = false, isShift = false, selectAllInEvent = false, onlyHistory = false } = options;

    if (!eventId || measureIndex === null) {
        if (!onlyHistory) clearSelection();
        return;
    }

    const startStaffIndex = staffIndex !== undefined ? staffIndex : (selection.staffIndex || 0);

    // 1. Handle Shift+Click (Range Selection)
    if (isShift && !onlyHistory) {
        // ... (Logic from useNavigation)
        const anchor = selection.anchor || {
            staffIndex: selection.staffIndex || 0,
            measureIndex: selection.measureIndex!,
            eventId: selection.eventId!,
            noteId: selection.noteId
        };
        
        // If anchor is invalid (e.g. initial state), just select the target
        if (!anchor.eventId) {
             // Fallthrough to standard selection
        } else {
            const context = {
                staffIndex: startStaffIndex,
                measureIndex,
                eventId,
                noteId
            };
            
            // Note: We need linearization logic here. 
            // We can import calculateNoteRange from utils/selection
             const linearNotes = getLinearizedNotes(score);
             // We need to make sure 'noteId' is not null for calculation.
             // If noteId is null (event selection), pick first note of event.
             let targetNoteId = noteId;
             if (!targetNoteId) {
                  const measure = getActiveStaff(score, startStaffIndex).measures[measureIndex];
                  const event = measure?.events.find((e: any) => e.id === eventId);
                  if (event && event.notes.length > 0) targetNoteId = event.notes[0].id;
             }

             if (targetNoteId) {
                const focus = { ...context, noteId: targetNoteId };
                // Ensure anchor has noteId too
                // ... (Assumption: anchor always has noteId if set correctly)
                
                const selectedNotes = calculateNoteRange(anchor as any, focus, linearNotes);
                
                setSelection(prev => ({
                    ...prev,
                    staffIndex: startStaffIndex,
                    measureIndex,
                    eventId,
                    noteId: targetNoteId, // Update cursor
                    selectedNotes,
                    anchor // Keep anchor
                }));
                return;
             }
        }
    }

    // 2. Resolve Event Selection (Select All Notes in Event)
    // If selectAllInEvent is TRUE, OR if noteId is NULL (clicking stem/body), we select all notes.
    // "Events cannot be independently selected."
    let targetNoteId = noteId;
    let notesToSelect: any[] = [];
    
    const measure = getActiveStaff(score, startStaffIndex).measures[measureIndex];
    const event = measure?.events.find((e: any) => e.id === eventId);

    // Handle REST selection (events with no notes)
    const isRestEvent = event?.isRest || (event && (!event.notes || event.notes.length === 0));
    
    if (isRestEvent) {
        // For rests, we select at event level with noteId: null
        // Create a special selectedNotes entry for the rest
        notesToSelect = [{
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            noteId: null  // Rests don't have notes
        }];
        targetNoteId = null;
    } else if (selectAllInEvent || !noteId) {
        if (event && event.notes.length > 0) {
            notesToSelect = event.notes.map((n: any) => ({
                staffIndex: startStaffIndex,
                measureIndex,
                eventId,
                noteId: n.id
            }));
            // Set cursor to first note if not specified
            if (!targetNoteId) targetNoteId = event.notes[0].id;
        }
    }

    // Capture the selection object that WOULD be set
    let nextSelection: Selection | null = null;

    // 3. Update State
    if (notesToSelect.length > 0) {
        if (isMulti && !onlyHistory) {
             setSelection(prev => {
                const newSelectedNotes = prev.selectedNotes ? [...prev.selectedNotes] : [];
                notesToSelect.forEach(n => {
                    // For rests, compare by eventId only since noteId is null
                    const exists = isRestEvent 
                        ? newSelectedNotes.some(ex => ex.eventId === n.eventId && ex.noteId === null)
                        : newSelectedNotes.some(ex => ex.noteId === n.noteId);
                    if (!exists) {
                        newSelectedNotes.push(n);
                    }
                });
                return {
                    ...prev,
                    staffIndex: startStaffIndex,
                    measureIndex,
                    eventId,
                    noteId: targetNoteId,
                    selectedNotes: newSelectedNotes,
                    anchor: prev.anchor // Maintain anchor? Or reset?
                };
             });
             if (!isRestEvent) playAudioFeedback(event?.notes || []);
             return; // Multi-select handled directly via setSelection
        } else {
             // Single Select of Event -> Replace selection
             nextSelection = {
                 staffIndex: startStaffIndex,
                 measureIndex,
                 eventId,
                 noteId: targetNoteId,
                 selectedNotes: notesToSelect,
                 anchor: { staffIndex: startStaffIndex, measureIndex, eventId, noteId: targetNoteId } // New Anchor
             };
        }
    } else {
        // 4. Standard Note Toggle (Single Note)
        if (onlyHistory) {
             nextSelection = {
                 staffIndex: startStaffIndex,
                 measureIndex,
                 eventId,
                 noteId: targetNoteId,
                 selectedNotes: [{ staffIndex: startStaffIndex, measureIndex, eventId, noteId: targetNoteId }], // Mimic standard selection structure
                 anchor: { staffIndex: startStaffIndex, measureIndex, eventId, noteId: targetNoteId }
             } as Selection;
        } else {
             // Standard Toggle Behavior (defer to functional update)
            setSelection(prev => {
                const emptySelection = { ...createDefaultSelection(), staffIndex: startStaffIndex };
                const base = prev || emptySelection;
                
                const newSel = toggleNoteInSelection(base, { 
                    staffIndex: startStaffIndex, 
                    measureIndex, 
                    eventId, 
                    noteId: targetNoteId 
                }, isMulti);
                return newSel;
            });
            
            // Audio Feedback (Early return for toggle path)
            if (targetNoteId) {
                const note = event?.notes.find((n: any) => n.id === targetNoteId);
                if (note) playAudioFeedback([note]);
            }
            return;
        }
    }

    // Apply Logic
    if (onlyHistory && nextSelection) {
        setLastSelection(nextSelection);
        // Ensure visual selection is cleared
        setSelection(prev => ({
            ...createDefaultSelection(),
            staffIndex: startStaffIndex
        }));
    } else if (nextSelection) {
        setSelection(nextSelection);
        playAudioFeedback(event?.notes || []);
    }

  }, [selection, score, playAudioFeedback, clearSelection]);

  const updateSelection = useCallback((partial: Partial<Selection>) => {
      setSelection(prev => ({ ...prev, ...partial }));
  }, []);

  const selectAllInMeasure = useCallback((measureIndex: number, staffIndex: number = 0) => {
      const measure = getActiveStaff(score, staffIndex).measures[measureIndex];
      if (!measure) return;

      const allNotes: any[] = [];
      measure.events.forEach((event: any) => {
          if (event.notes) {
              event.notes.forEach((note: any) => {
                  allNotes.push({
                      staffIndex,
                      measureIndex,
                      eventId: event.id,
                      noteId: note.id
                  });
              });
          }
      });

      if (allNotes.length > 0) {
          const first = allNotes[0];
          setSelection({
              staffIndex,
              measureIndex,
              eventId: first.eventId,
              noteId: first.noteId,
              selectedNotes: allNotes,
              anchor: { ...first }
          });
      }
  }, [score]);

  return {
    selection,
    setSelection, // Exposed for low-level overrides if absolutely needed
    select,
    clearSelection,
    updateSelection,
    selectAllInMeasure,
    lastSelection
  };
};
