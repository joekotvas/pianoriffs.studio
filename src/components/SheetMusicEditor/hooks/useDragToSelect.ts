import { useState, useCallback, useEffect, RefObject } from 'react';

interface DragSelectState {
    isDragging: boolean;
    startPoint: { x: number; y: number } | null;
    currentPoint: { x: number; y: number } | null;
    isAdditive: boolean; // CMD key held
}

interface SelectedNote {
    staffIndex: number;
    measureIndex: number;
    eventId: string | number;
    noteId: string | number | null;
}

interface NotePosition {
    x: number;
    y: number;
    width: number;
    height: number;
    staffIndex: number;
    measureIndex: number;
    eventId: string | number;
    noteId: string | number;
}

interface UseDragToSelectProps {
    svgRef: RefObject<SVGSVGElement | null>;
    notePositions: NotePosition[];
    onSelectionComplete: (notes: SelectedNote[], isAdditive: boolean) => void;
    onEmptyClick?: () => void;  // Called when clicking empty space without dragging
    scale: number;
    enabled?: boolean;
}

interface UseDragToSelectReturn {
    isDragging: boolean;
    justFinishedDrag: boolean;  // True for a brief moment after drag ends, to prevent click from clearing selection
    selectionRect: { x: number; y: number; width: number; height: number } | null;
    handleMouseDown: (e: React.MouseEvent) => void;
}

export const useDragToSelect = ({
    svgRef,
    notePositions,
    onSelectionComplete,
    scale,
    enabled = true
}: UseDragToSelectProps): UseDragToSelectReturn => {
    const [dragState, setDragState] = useState<DragSelectState>({
        isDragging: false,
        startPoint: null,
        currentPoint: null,
        isAdditive: false
    });
    
    // Track if drag just finished to prevent click from clearing selection
    const [justFinishedDrag, setJustFinishedDrag] = useState(false);

    // Calculate selection rectangle from start and current points
    const selectionRect = dragState.isDragging && dragState.startPoint && dragState.currentPoint
        ? {
            x: Math.min(dragState.startPoint.x, dragState.currentPoint.x),
            y: Math.min(dragState.startPoint.y, dragState.currentPoint.y),
            width: Math.abs(dragState.currentPoint.x - dragState.startPoint.x),
            height: Math.abs(dragState.currentPoint.y - dragState.startPoint.y)
        }
        : null;

    // Check if a note intersects with the selection rectangle
    const noteIntersectsRect = useCallback((note: NotePosition, rect: { x: number; y: number; width: number; height: number }) => {
        const noteRight = note.x + note.width;
        const noteBottom = note.y + note.height;
        const rectRight = rect.x + rect.width;
        const rectBottom = rect.y + rect.height;

        return !(note.x > rectRight || noteRight < rect.x || note.y > rectBottom || noteBottom < rect.y);
    }, []);

    // Get all notes that intersect the selection rectangle
    const getSelectedNotes = useCallback((): SelectedNote[] => {
        if (!selectionRect) return [];
        
        return notePositions
            .filter(note => noteIntersectsRect(note, selectionRect))
            .map(note => ({
                staffIndex: note.staffIndex,
                measureIndex: note.measureIndex,
                eventId: note.eventId,
                noteId: note.noteId
            }));
    }, [selectionRect, notePositions, noteIntersectsRect]);

    // Start drag on mouseDown on empty space
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!enabled) return;
        
        // Only start if clicking on empty space (not on a note or other interactive element)
        const target = e.target as HTMLElement;
        if (target.closest('[data-note-hit-area]') || target.closest('[data-interactive]')) {
            return; // Clicked on a note, don't start drag selection
        }

        const svgElement = svgRef.current;
        if (!svgElement) return;

        const rect = svgElement.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        setDragState({
            isDragging: true,
            startPoint: { x, y },
            currentPoint: { x, y },
            isAdditive: e.metaKey || e.ctrlKey
        });

        e.preventDefault();
    }, [enabled, svgRef, scale]);

    // Handle mouse move during drag
    useEffect(() => {
        if (!dragState.isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const svgElement = svgRef.current;
            if (!svgElement) return;

            const rect = svgElement.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;

            setDragState(prev => ({
                ...prev,
                currentPoint: { x, y }
            }));
        };

        const handleMouseUp = () => {
            const selectedNotes = getSelectedNotes();
            
            if (selectedNotes.length > 0) {
                onSelectionComplete(selectedNotes, dragState.isAdditive);
            }

            setDragState({
                isDragging: false,
                startPoint: null,
                currentPoint: null,
                isAdditive: false
            });
            
            // Set justFinishedDrag to block the click event, then clear it
            setJustFinishedDrag(true);
            setTimeout(() => setJustFinishedDrag(false), 50);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState.isDragging, dragState.isAdditive, getSelectedNotes, onSelectionComplete, svgRef, scale]);

    return {
        isDragging: dragState.isDragging,
        justFinishedDrag,
        selectionRect,
        handleMouseDown
    };
};
