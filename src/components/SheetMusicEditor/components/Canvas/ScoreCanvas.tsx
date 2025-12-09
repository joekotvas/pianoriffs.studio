import React, { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { calculateHeaderLayout, getNoteWidth } from '../../engines/layout';
import Staff, { calculateStaffWidth } from './Staff';
import { getActiveStaff } from '../../types';
import { useScoreContext } from '../../context/ScoreContext';
import { useScoreInteraction } from '../../hooks/useScoreInteraction';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useGrandStaffLayout } from '../../hooks/useGrandStaffLayout';
import GrandStaffBracket from '../Assets/GrandStaffBracket';

interface ScoreCanvasProps {
  scale: number;
  playbackPosition?: { measureIndex: number | null; eventIndex: number | null; duration: number };
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
  playbackPosition = { measureIndex: null, eventIndex: null, duration: 0 },
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
      onUpdatePitch: (m, e, n, p) => updateNotePitch(m, e, n, p),
      onSelectNote: (measureIndex, eventId, noteId, staffIndex) => {
          if (measureIndex !== null && eventId !== null) {
              handleNoteSelection(measureIndex, eventId, noteId, staffIndex);
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

  const handleBackgroundClick = () => {
      onBackgroundClick?.();
      // Default: deselect
      setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null });
      containerRef.current?.focus();
  };

  return (
    <div 
      ref={containerRef} 
      className="overflow-x-auto relative outline-none z-10 pl-12 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/50" 
      style={{ marginTop: '-30px', backgroundColor: theme.background }} 
      onClick={handleBackgroundClick}
      tabIndex={0}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <svg width={totalWidth * scale} height={svgHeight * scale} className="ml-0 overflow-visible">
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
            const isSelectedStaff = staffIndex === (selection.staffIndex || 0);
            const isPreviewStaff = previewNote?.staffIndex !== undefined ? previewNote.staffIndex === staffIndex : isSelectedStaff;
            
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
                selection={isSelectedStaff ? selection : { staffIndex, measureIndex: null, eventId: null, noteId: null }}
                previewNote={isPreviewStaff ? previewNote : null}
                activeDuration={activeDuration}
                isDotted={isDotted}
                scale={scale}
                playbackPosition={playbackPosition}
                onSelectNote={(measureIndex: number, eventId: number, noteId: number | null) => {
                  handleNoteSelection(measureIndex, eventId, noteId, staffIndex);
                }}
                onAddNote={addNoteToMeasure}
                onHover={(measureIndex, hit, pitch) => {
                    if (!dragState.active) {
                        // Pass 4 arguments to support multi-staff pitch calculation
                        handleMeasureHover(measureIndex, hit, pitch, staffIndex);
                    }
                }}
                onDragStart={(measureIndex, eventId, noteId, pitch, startY, modifierHeld) => {
                  handleDragStart(startY, measureIndex, eventId, noteId, pitch, staffIndex);
                }}
                onClefClick={onClefClick}
                onKeySigClick={onKeySigClick}
                onTimeSigClick={onTimeSigClick}
                modifierHeld={modifierHeld}
                isDragging={dragState.active}
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


        </g>
      </svg>
    </div>
  );
};

export default ScoreCanvas;
