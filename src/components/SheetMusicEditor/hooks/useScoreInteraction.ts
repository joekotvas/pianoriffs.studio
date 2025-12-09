import { useState, useRef, useEffect, useCallback } from 'react';
import { movePitchVisual } from '../services/MusicService';
import { CONFIG } from '../config';

interface DragState {
  active: boolean;
  measureIndex: number | null;
  eventId: string | null;
  noteId: string | number | null;
  startY: number;
  startPitch: string;
  currentPitch: string;
  staffIndex: number; // Added staffIndex to DragState
}

interface UseScoreInteractionProps {
  scoreRef: React.MutableRefObject<any>; // Using any for Score to avoid circular deps if types are tricky, but preferably Score
  onUpdatePitch: (measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => void;
  onSelectNote: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndex?: number) => void;
}

export const useScoreInteraction = ({ scoreRef, onUpdatePitch, onSelectNote }: UseScoreInteractionProps) => {
    const [dragState, setDragState] = useState<DragState>({
        active: false,
        measureIndex: null,
        eventId: null,
        noteId: null,
        startY: 0,
        startPitch: '',
        currentPitch: '',
        staffIndex: 0
    });
    
    const mouseDownTime = useRef<number>(0);
    const CLICK_THRESHOLD = 200; // ms to distinguish click from drag

    const handleDragStart = useCallback((
      startY: number,
      measureIndex: number, 
      eventId: string | number, 
      noteId: string | number, 
      startPitch: string,
      staffIndex: number = 0
    ) => {
        mouseDownTime.current = Date.now();
        
        setDragState({
            active: true,
            measureIndex,
            eventId: typeof eventId === 'number' ? String(eventId) : eventId,
            noteId,
            startY,
            startPitch,
            currentPitch: startPitch,
            staffIndex
        });
        
        // Optimistic selection update on mouse down
        onSelectNote(measureIndex, eventId, noteId, staffIndex);
    }, [onSelectNote]);

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
    
            // Use MusicService for visual pitch movement (Key-Aware)
            const newPitch = movePitchVisual(dragState.startPitch, steps, keySignature);
            
            if (newPitch !== dragState.currentPitch) {
                // Update local state for smooth UI
                setDragState(prev => ({ ...prev, currentPitch: newPitch }));
                
                // Dispatch update to store
                if (dragState.measureIndex !== null && dragState.eventId && dragState.noteId) {
                    onUpdatePitch(dragState.measureIndex, dragState.eventId, dragState.noteId, newPitch);
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
