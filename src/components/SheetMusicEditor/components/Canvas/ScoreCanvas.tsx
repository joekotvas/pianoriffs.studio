import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { calculateHeaderLayout, getNoteWidth, getOffsetForPitch } from '../../engines/layout';
import Staff, { calculateStaffWidth } from './Staff';
import { getActiveStaff, createDefaultSelection } from '../../types';
import { useScoreContext } from '../../context/ScoreContext';
import { useScoreInteraction } from '../../hooks/useScoreInteraction';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useGrandStaffLayout } from '../../hooks/useGrandStaffLayout';
import { useDragToSelect } from '../../hooks/useDragToSelect';
import GrandStaffBracket from '../Assets/GrandStaffBracket';
import { LAYOUT } from '../../constants';

interface ScoreCanvasProps {
  scale: number;
  playbackPosition?: { measureIndex: number | null; quant: number | null; duration: number };
  onKeySigClick?: () => void;
  onTimeSigClick?: () => void;
  onClefClick?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onHoverChange: (isHovering: boolean) => void;
  onBackgroundClick?: () => void;
}

/**
 * Renders the main score canvas, composing Staff components.
 * Consumes ScoreContext for data and handles interactions.
 */
const ScoreCanvas: React.FC<ScoreCanvasProps> = ({
  scale,
  playbackPosition = { measureIndex: null, quant: null, duration: 0 },
  onKeySigClick,
  onTimeSigClick,
  onClefClick,
  containerRef,
  onHoverChange,
  onBackgroundClick
}) => {
  const { theme } = useTheme();
  
  // Consume Score Context
  const {
      score,
      selection,
      setSelection, 
      handleNoteSelection,
      addNoteToMeasure,
      activeDuration,
      isDotted,
      previewNote,
      setPreviewNote,
      handleMeasureHover,
      scoreRef,
      updateNotePitch
  } = useScoreContext();

  // --- INTERACTION LOGIC MOVED FROM SCORE EDITOR ---
  
  // Track modifier key state for cursor changes
  const [modifierHeld, setModifierHeld] = useState(false);
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.metaKey || e.ctrlKey) setModifierHeld(true);
      };
      const handleKeyUp = (e: KeyboardEvent) => {
          if (!e.metaKey && !e.ctrlKey) setModifierHeld(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, []);

  const { dragState, handleDragStart } = useScoreInteraction({
      scoreRef,
      selection,
      onUpdatePitch: (m: number, e: string | number, n: string | number, p: string) => updateNotePitch(m, e, n, p),
      onSelectNote: (measureIndex: number | null, eventId: string | number | null, noteId: string | number | null, staffIndexParam?: number, isMulti?: boolean, selectAllInEvent?: boolean, isShift?: boolean) => {
          if (measureIndex !== null && eventId !== null) {
              const targetStaff = staffIndexParam !== undefined ? staffIndexParam : 0;
              handleNoteSelection(measureIndex, eventId, noteId, targetStaff, isMulti, selectAllInEvent, isShift);
          }
          setPreviewNote(null);
      }
  });


  // --- AUTO-SCROLL LOGIC ---
  const activeStaff = getActiveStaff(score);
  const keySignature = score.keySignature || activeStaff.keySignature || 'C';
  const timeSignature = score.timeSignature || '4/4';
  const clef = score.staves.length >= 2 ? 'grand' : (activeStaff.clef || 'treble');

  useAutoScroll({
    containerRef,
    score,
    selection,
    playbackPosition,
    previewNote,
    scale
  });


  // Calculate synchronized measure layouts for Grand Staff
  const { synchronizedLayoutData, unifiedCursorX, unifiedCursorWidth, isGrandStaff, numStaves } = useGrandStaffLayout({
      score,
      playbackPosition,
      activeStaff,
      keySignature,
      clef
  });

  const cursorRef = useRef<SVGGElement>(null);

  useEffect(() => {
      if (cursorRef.current && unifiedCursorX !== null && unifiedCursorWidth !== undefined) {
          // 1. Snap to Start (Instant)
          cursorRef.current.style.transition = 'none';
          cursorRef.current.style.transform = `translateX(${unifiedCursorX}px)`;
          
          // 2. Animate to End (Slide)
          // Use requestAnimationFrame to ensure the 'none' transition applies first
          if (playbackPosition.duration > 0) {
              requestAnimationFrame(() => {
                  if (!cursorRef.current) return;
                  cursorRef.current.style.transition = `transform ${playbackPosition.duration}s linear`;
                  cursorRef.current.style.transform = `translateX(${unifiedCursorX + unifiedCursorWidth}px)`;
              });
          }
      }
  }, [unifiedCursorX, unifiedCursorWidth, playbackPosition.duration]);

  const totalWidth = React.useMemo(() => {
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    
    if (synchronizedLayoutData) {
      const measuresWidth = synchronizedLayoutData.reduce((sum: any, layout: any) => sum + layout.width, 0);
      return startOfMeasures + measuresWidth + 50;
    }
    
    return calculateStaffWidth(activeStaff.measures, keySignature);
  }, [synchronizedLayoutData, activeStaff.measures, keySignature]);

  const svgHeight = CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 50;

  // --- DRAG TO SELECT ---
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate note positions for hit detection
  const notePositions = useMemo(() => {
    const positions: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      staffIndex: number;
      measureIndex: number;
      eventId: string | number;
      noteId: string | number | null;  // null for rests
    }> = [];
    
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    
    score.staves.forEach((staff: any, staffIdx: number) => {
      const staffBaseY = CONFIG.baseY + staffIdx * CONFIG.staffSpacing;
      const staffClef = staff.clef || (staffIdx === 0 ? 'treble' : 'bass');
      let measureX = startOfMeasures;
      
      staff.measures.forEach((measure: any, measureIdx: number) => {
        // Get forced positions from synchronized layout if available
        const forcedPositions = synchronizedLayoutData?.[measureIdx]?.forcedPositions;
        
        // Calculate actual layout to get event positions
        const { calculateMeasureLayout } = require('../../engines/layout');
        const layout = calculateMeasureLayout(measure.events, undefined, staffClef, false, forcedPositions);
        
        measure.events.forEach((event: any) => {
          const eventX = measureX + (layout.eventPositions?.[event.id] || 0);
          
          // Handle rest events (isRest flag set)
          if (event.isRest) {
            // Skip placeholder rests for empty measures
            if (event.id === 'rest-placeholder') return;
            
            // Get the rest note ID (rests now have a single note entry)
            const restNoteId = event.notes?.[0]?.id ?? null;
            
            // Add rest hit area - centered on event, spanning full staff height
            const staffHeight = CONFIG.lineHeight * 4;
            positions.push({
              x: eventX - 15,  // Center with ~30px width
              y: staffBaseY,
              width: 30,
              height: staffHeight,
              staffIndex: staffIdx,
              measureIndex: measureIdx,
              eventId: event.id,
              noteId: restNoteId  // Use the rest note ID for selection
            });
          } else {
            // Handle notes
            event.notes?.forEach((note: any) => {
              const noteY = staffBaseY + getOffsetForPitch(note.pitch, staffClef);
              
              positions.push({
                x: eventX - LAYOUT.NOTE_RX, // Center of ellipse minus radius
                y: noteY - LAYOUT.NOTE_RY,
                width: LAYOUT.NOTE_RX * 2,
                height: LAYOUT.NOTE_RY * 2,
                staffIndex: staffIdx,
                measureIndex: measureIdx,
                eventId: event.id,
                noteId: note.id
              });
            });
          }
        });
        
        measureX += layout.totalWidth || synchronizedLayoutData?.[measureIdx]?.width || 0;
      });
    });
    
    return positions;
  }, [score.staves, synchronizedLayoutData, keySignature]);

  // Drag to select hook
  const { isDragging, justFinishedDrag, selectionRect, handleMouseDown: handleDragSelectMouseDown } = useDragToSelect({
    svgRef,
    notePositions,
    onSelectionComplete: (notes, isAdditive) => {
      if (notes.length === 0) return;
      
      if (isAdditive) {
        // Add to existing selection
        setSelection(prev => ({
          ...prev,
          selectedNotes: [
            ...prev.selectedNotes,
            ...notes.filter(n => !prev.selectedNotes.some(
              sn => sn.noteId === n.noteId && sn.eventId === n.eventId
            ))
          ],
          // Update focus to first new note
          measureIndex: notes[0].measureIndex,
          eventId: notes[0].eventId,
          noteId: notes[0].noteId,
          staffIndex: notes[0].staffIndex
        }));
      } else {
        // Replace selection
        setSelection({
          staffIndex: notes[0].staffIndex,
          measureIndex: notes[0].measureIndex,
          eventId: notes[0].eventId,
          noteId: notes[0].noteId,
          selectedNotes: notes,
          anchor: { 
            staffIndex: notes[0].staffIndex, 
            measureIndex: notes[0].measureIndex, 
            eventId: notes[0].eventId, 
            noteId: notes[0].noteId 
          }
        });
      }
    },
    scale
  });

  const handleBackgroundClick = (e: React.MouseEvent) => {
      // Don't deselect if we were dragging or just finished dragging
      if (isDragging || justFinishedDrag) return;
      
      onBackgroundClick?.();
      // Default: deselect
      setSelection(createDefaultSelection());
      containerRef.current?.focus();
  };

  // --- MEMOIZED CALLBACKS FOR INTERACTION OBJECT ---
  // These prevent unnecessary re-renders of child components
  
  const memoizedOnSelectNote = useCallback((
    measureIndex: number | null, 
    eventId: number | string | null, 
    noteId: number | string | null, 
    staffIndexParam?: number, 
    isMulti?: boolean
  ) => {
    if (eventId !== null && measureIndex !== null) {
      const targetStaff = staffIndexParam !== undefined ? staffIndexParam : 0;
      handleNoteSelection(measureIndex, eventId, noteId, targetStaff, isMulti);
    }
  }, [handleNoteSelection]);
  
  const memoizedOnDragStart = useCallback((args: any) => {
    handleDragStart(args);
  }, [handleDragStart]);
  
  // Cache per-staff onHover handlers to prevent recreation
  const hoverHandlersRef = useRef<Map<number, (measureIndex: number | null, hit: any, pitch: string | null) => void>>(new Map());
  
  const getHoverHandler = useCallback((staffIndex: number) => {
    if (!hoverHandlersRef.current.has(staffIndex)) {
      hoverHandlersRef.current.set(staffIndex, (measureIndex: number | null, hit: any, pitch: string | null) => {
        if (!dragState.active) {
          handleMeasureHover(measureIndex, hit, pitch || '', staffIndex);
        }
      });
    }
    return hoverHandlersRef.current.get(staffIndex)!;
  }, [handleMeasureHover, dragState.active]);


  return (
    <div 
      ref={containerRef} 
      data-testid="score-canvas-container"
      className="overflow-x-auto relative outline-none z-10 pl-12 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/50" 
      style={{ marginTop: '-30px', backgroundColor: theme.background }} 
      onClick={handleBackgroundClick}
      tabIndex={0}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <svg 
        ref={svgRef}
        width={totalWidth * scale} 
        height={svgHeight * scale} 
        className="ml-0 overflow-visible"
        onMouseDown={handleDragSelectMouseDown}
      >
        <g transform={`scale(${scale})`}>
          
          {score.staves?.length > 1 && (
            <>
              {(() => {
                const topY = CONFIG.baseY;
                const bottomY = CONFIG.baseY + (score.staves.length - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4;
                const midY = (topY + bottomY) / 2;
                return (
                  <GrandStaffBracket topY={topY} bottomY={bottomY} x={-20} />
                );
              })()}
            </>
          )}

          {score.staves?.map((staff: any, staffIndex: number) => {
            const staffBaseY = CONFIG.baseY + staffIndex * CONFIG.staffSpacing;
            
            // Construct Interaction State - using memoized callbacks for stable references
            const interaction = {
                selection, // Always pass the real selection - isNoteSelected checks staffIndex per-note
                previewNote, // Global preview note (Staff filters it)
                activeDuration,
                isDotted,
                modifierHeld,
                isDragging: dragState.active,
                onAddNote: addNoteToMeasure,
                onSelectNote: memoizedOnSelectNote,
                onDragStart: memoizedOnDragStart,
                onHover: getHoverHandler(staffIndex)
            };

            return (
              <Staff
                key={staff.id || staffIndex}
                staffIndex={staffIndex}
                clef={staff.clef || (staffIndex === 0 ? 'treble' : 'bass')}
                keySignature={staff.keySignature || keySignature}
                timeSignature={timeSignature}
                measures={staff.measures}
                measureLayouts={synchronizedLayoutData}
                baseY={staffBaseY}
                scale={scale}
                interaction={interaction}
                playbackPosition={playbackPosition}
                onClefClick={onClefClick}
                onKeySigClick={onKeySigClick}
                onTimeSigClick={onTimeSigClick}
                hidePlaybackCursor={isGrandStaff}
              />
            );
          })}

          {isGrandStaff && unifiedCursorX !== null && (
            <g 
              ref={cursorRef}
              style={{ 
                transform: `translateX(${unifiedCursorX}px)`,
                pointerEvents: 'none'
              }}
            >
              <line
                x1={0}
                y1={CONFIG.baseY - 20}
                x2={0}
                y2={CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 20}
                stroke={theme.accent}
                strokeWidth="3"
                opacity="0.8"
              />
              <circle cx={0} cy={CONFIG.baseY - 20} r="4" fill={theme.accent} opacity="0.9" />
              <circle cx={0} cy={CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 20} r="4" fill={theme.accent} opacity="0.9" />
            </g>
          )}


          {/* Drag-to-Select Rectangle */}
          {isDragging && selectionRect && (
            <rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
          )}

        </g>
      </svg>
    </div>
  );
};

export default ScoreCanvas;
