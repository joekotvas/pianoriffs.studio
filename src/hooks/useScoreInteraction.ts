import React, { useState, useRef, useEffect, useCallback } from 'react';
import { movePitchVisual } from '@/services/MusicService';
import { CONFIG } from '@/config';
import { isNoteSelected } from '@/utils/selection';
import { Selection } from '@/types';

interface DragState {
  active: boolean;
  measureIndex: number | null;
  eventId: string | null;
  noteId: string | number | null;
  startY: number;
  startPitch: string;
  currentPitch: string;
  staffIndex: number;
  initialPitches: Map<string, string>; // Map noteId -> pitch
}

interface UseScoreInteractionProps {
  scoreRef: React.MutableRefObject<any>;
  selection: Selection; 
  onUpdatePitch: (measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => void;
  onSelectNote: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndex?: number, isMulti?: boolean, selectAllInEvent?: boolean, isShift?: boolean) => void;
}

export const useScoreInteraction = ({ scoreRef, selection, onUpdatePitch, onSelectNote }: UseScoreInteractionProps) => {
    const [dragState, setDragState] = useState<DragState>({
        active: false,
        measureIndex: null,
        eventId: null,
        noteId: null,
        startY: 0,
        startPitch: '',
        currentPitch: '',
        staffIndex: 0,
        initialPitches: new Map()
    });
    
    const mouseDownTime = useRef<number>(0);
    const CLICK_THRESHOLD = 200; // ms to distinguish click from drag

    const handleDragStart = useCallback((params: {
      measureIndex: number;
      eventId: string | number;
      noteId: string | number;
      startPitch: string;
      startY: number;
      isMulti?: boolean;
      isShift?: boolean;
      selectAllInEvent?: boolean;
      staffIndex?: number;
    }) => {
        const { measureIndex, eventId, noteId, startPitch, startY, isMulti = false, isShift = false, selectAllInEvent = false, staffIndex = 0 } = params;
        
        mouseDownTime.current = Date.now();
        
        // Capture initial pitches
        const initialPitches = new Map<string, string>();
        
        // Helper to find pitch
        const getPitch = (sIndex: number, mIndex: number, eId: string, nId: string | number | null) => {
             const m = scoreRef.current.staves[sIndex]?.measures[mIndex];
             const e = m?.events.find((ev: any) => String(ev.id) === String(eId));
             if (nId) {
                 return e?.notes.find((n: any) => String(n.id) === String(nId))?.pitch;
             }
             return e?.notes[0]?.pitch; 
        };

        const isNoteInSelection = isNoteSelected(selection, { staffIndex, measureIndex, eventId, noteId });

        if (isNoteInSelection && selection.selectedNotes && selection.selectedNotes.length > 0) {
            // Multi-move: capture all currently selected notes
            selection.selectedNotes.forEach((n: any) => {
                const p = getPitch(n.staffIndex, n.measureIndex, n.eventId, n.noteId);
                if (p) initialPitches.set(String(n.noteId), p);
            });
        } else if (selectAllInEvent) {
            // Selecting all notes in event - capture all of them for drag
            const measure = scoreRef.current.staves[staffIndex]?.measures[measureIndex];
            const event = measure?.events.find((ev: any) => String(ev.id) === String(eventId));
            if (event && event.notes) {
                event.notes.forEach((n: any) => {
                    if (n.pitch) initialPitches.set(String(n.id), n.pitch);
                });
            }
        } else {
            // Single move
            initialPitches.set(String(noteId), startPitch);
        }

        setDragState({
            active: true,
            measureIndex,
            eventId: typeof eventId === 'number' ? String(eventId) : eventId,
            noteId,
            startY,
            startPitch,
            currentPitch: startPitch,
            staffIndex,
            initialPitches
        });
        
        // Optimistic selection update on mouse down
        onSelectNote(measureIndex, eventId, noteId, staffIndex, isMulti, selectAllInEvent, isShift);
    }, [onSelectNote, selection, scoreRef]);

    useEffect(() => {
        if (!dragState.active) return;
    
    const handleMouseMove = (e: MouseEvent) => {
            if (!dragState.active) return;
    
            const deltaY = dragState.startY - e.clientY;
            const stepHeight = CONFIG.lineHeight / 2; // e.g. 5px
            const steps = Math.round(deltaY / stepHeight);
            
            if (steps === 0) return;
    
            // Get proper context from score
            const currentScore = scoreRef.current;
            const currentStaff = currentScore?.staves?.[dragState.staffIndex];
            const keySignature = currentStaff?.keySignature || 'C';
    
            // Perform bulk update - use dragState context for same-event drags
            dragState.initialPitches.forEach((pStart: string, noteIdStr: string) => {
                const newP = movePitchVisual(pStart, steps, keySignature);
                
                // Check if this is a multi-event selection by looking at selection state
                // If selection contains notes from different events, use selection to find context
                // Otherwise, all notes share the same event as dragState
                if (selection.selectedNotes && selection.selectedNotes.length > 1) {
                    // Multi-select: find note in selection for its context
                    const noteInfo = selection.selectedNotes.find((n: any) => String(n.noteId) === noteIdStr);
                    if (noteInfo && noteInfo.noteId !== null) {
                        onUpdatePitch(noteInfo.measureIndex, noteInfo.eventId, noteInfo.noteId, newP);
                    } else if (dragState.measureIndex !== null && dragState.eventId) {
                        // Fallback: note is in same event as drag target
                        onUpdatePitch(dragState.measureIndex, dragState.eventId, noteIdStr, newP);
                    }
                } else if (dragState.measureIndex !== null && dragState.eventId) {
                    // Single event: all notes share dragState context
                    onUpdatePitch(dragState.measureIndex, dragState.eventId, noteIdStr, newP);
                }
            });

            if (dragState.initialPitches.size > 0) {
                 // Update local state just for the primary dragged note for smoothness (if tracked)
                 const primaryStart = dragState.initialPitches.get(String(dragState.noteId)) || dragState.startPitch;
                 const newPrimary = movePitchVisual(primaryStart, steps, keySignature);
                 if (newPrimary !== dragState.currentPitch) {
                    setDragState(prev => ({ ...prev, currentPitch: newPrimary }));
                 }
            }
        };
    
        const handleMouseUp = () => {
            const dragDuration = Date.now() - mouseDownTime.current;
            
            if (dragDuration < CLICK_THRESHOLD) {
                // Click handled elsewhere
            }
            
            setDragState(prev => ({ ...prev, active: false }));
            document.body.style.cursor = 'default';
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'ns-resize';
    
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
    }, [dragState, scoreRef, onUpdatePitch]);

    return {
        dragState,
        handleDragStart
    };
};
