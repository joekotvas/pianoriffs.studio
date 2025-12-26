import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CONFIG } from '@/config';
import { useTheme } from '@/context/ThemeContext';
import { calculateHeaderLayout, getOffsetForPitch, calculateMeasureLayout } from '@/engines/layout';
import { isRestEvent, getFirstNoteId } from '@/utils/core';
import Staff, { calculateStaffWidth } from './Staff';
import { getActiveStaff, Staff as StaffType, Measure, ScoreEvent, Note } from '@/types';
import { HitZone } from '@/engines/layout/types';
import { useScoreContext } from '@/context/ScoreContext';
import { useScoreInteraction } from '@/hooks/useScoreInteraction';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useGrandStaffLayout } from '@/hooks/useGrandStaffLayout';
import { useDragToSelect } from '@/hooks/useDragToSelect';
import GrandStaffBracket from '../Assets/GrandStaffBracket';
import { LAYOUT, CLAMP_LIMITS, STAFF_HEIGHT } from '@/constants';
import { LassoSelectCommand } from '@/commands/selection';

interface ScoreCanvasProps {
  scale: number;
  playbackPosition?: { measureIndex: number | null; quant: number | null; duration: number };
  onKeySigClick?: () => void;
  onTimeSigClick?: () => void;
  onClefClick?: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
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
  onBackgroundClick,
}) => {
  const { theme } = useTheme();

  // Consume Score Context (Grouped API)
  const ctx = useScoreContext();
  const { score, selection, previewNote } = ctx.state;
  const { selectionEngine, scoreRef } = ctx.engines;
  const { activeDuration, isDotted } = ctx.tools;
  const { select: handleNoteSelection } = ctx.navigation;
  const { addNote: addNoteToMeasure, handleMeasureHover, updatePitch: updateNotePitch } = ctx.entry;
  const { clearSelection, setPreviewNote } = ctx;

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
    onUpdatePitch: (m: number, e: string, n: string, p: string) => updateNotePitch(m, e, n, p),
    onSelectNote: (
      measureIndex: number | null,
      eventId: string | null,
      noteId: string | null,
      staffIndexParam?: number,
      isMulti?: boolean,
      selectAllInEvent?: boolean,
      isShift?: boolean
    ) => {
      if (measureIndex !== null && eventId !== null) {
        const targetStaff = staffIndexParam !== undefined ? staffIndexParam : 0;
        handleNoteSelection(
          measureIndex,
          eventId,
          noteId,
          targetStaff,
          isMulti,
          selectAllInEvent,
          isShift
        );
      }
      setPreviewNote(null);
    },
  });

  const activeStaff = getActiveStaff(score);
  const keySignature = score.keySignature || activeStaff.keySignature || 'C';
  const timeSignature = score.timeSignature || '4/4';
  const clef = score.staves.length >= 2 ? 'grand' : activeStaff.clef || 'treble';

  // --- AUTO-SCROLL LOGIC ---
  useAutoScroll({
    containerRef,
    score,
    selection,
    playbackPosition,
    previewNote,
    scale,
  });

  // Calculate synchronized measure layouts for Grand Staff
  const { synchronizedLayoutData, unifiedCursorX, unifiedCursorWidth, isGrandStaff, numStaves } =
    useGrandStaffLayout({
      score,
      playbackPosition,
      _activeStaff: activeStaff,
      keySignature,
      clef,
    });

  const cursorRef = useRef<SVGGElement>(null);

  // --- PLAYBACK CURSOR ANIMATION LOGIC ---
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
      const measuresWidth = synchronizedLayoutData.reduce(
        (sum: number, layout: { width: number }) => sum + layout.width,
        0
      );
      return startOfMeasures + measuresWidth + 50;
    }

    return calculateStaffWidth(activeStaff.measures, keySignature);
  }, [synchronizedLayoutData, activeStaff.measures, keySignature]);

  const svgHeight =
    CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 50;

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
      eventId: string;
      noteId: string | null; // null for rests
    }> = [];

    const { startOfMeasures } = calculateHeaderLayout(keySignature);

    score.staves.forEach((staff: StaffType, staffIdx: number) => {
      const staffBaseY = CONFIG.baseY + staffIdx * CONFIG.staffSpacing;
      const staffClef = staff.clef || (staffIdx === 0 ? 'treble' : 'bass');
      let measureX = startOfMeasures;

      staff.measures.forEach((measure: Measure, measureIdx: number) => {
        // Get forced positions from synchronized layout if available
        const forcedPositions = synchronizedLayoutData?.[measureIdx]?.forcedPositions;

        // Calculate actual layout to get event positions
        // IMPORTANT: Use measure.isPickup to match visual rendering!
        const layout = calculateMeasureLayout(
          measure.events,
          undefined,
          staffClef,
          measure.isPickup || false,
          forcedPositions
        );

        measure.events.forEach((event: ScoreEvent) => {
          const eventX = measureX + (layout.eventPositions?.[event.id] || 0);

          // Handle rest events (isRest flag set)
          if (isRestEvent(event)) {
            // Skip placeholder rests for empty measures
            if (event.id === 'rest-placeholder') return;

            // Get the rest note ID (rests now have a single note entry)
            const restNoteId = getFirstNoteId(event);

            // Add rest hit area - centered on event, spanning full staff height
            const staffHeight = CONFIG.lineHeight * 4;
            positions.push({
              x: eventX - 15, // Center with ~30px width
              y: staffBaseY,
              width: 30,
              height: staffHeight,
              staffIndex: staffIdx,
              measureIndex: measureIdx,
              eventId: event.id,
              noteId: restNoteId, // Use the rest note ID for selection
            });
          } else {
            // Handle notes
            event.notes?.forEach((note: Note) => {
              const noteY = staffBaseY + getOffsetForPitch(note.pitch, staffClef);

              positions.push({
                x: eventX - LAYOUT.NOTE_RX, // Center of ellipse minus radius
                y: noteY - LAYOUT.NOTE_RY,
                width: LAYOUT.NOTE_RX * 2,
                height: LAYOUT.NOTE_RY * 2,
                staffIndex: staffIdx,
                measureIndex: measureIdx,
                eventId: event.id,
                noteId: note.id,
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
  const {
    isDragging,
    justFinishedDrag,
    selectionRect,
    previewNoteIds,
    handleMouseDown: handleDragSelectMouseDown,
  } = useDragToSelect({
    svgRef,
    notePositions,
    onSelectionComplete: (notes, isAdditive) => {
      if (notes.length === 0) return;

      // Use dispatch for lasso selection
      selectionEngine.dispatch(
        new LassoSelectCommand({
          notes,
          addToSelection: isAdditive,
        })
      );
    },
    scale,
  });

  const handleBackgroundClick = (_e: React.MouseEvent) => {
    // Don't deselect if we were dragging or just finished dragging
    if (isDragging || justFinishedDrag) return;

    onBackgroundClick?.();
    // Default: deselect via dispatch
    clearSelection();
    containerRef.current?.focus();
  };

  // --- MEMOIZED CALLBACKS FOR INTERACTION OBJECT ---
  // These prevent unnecessary re-renders of child components

  const memoizedOnSelectNote = useCallback(
    (
      measureIndex: number | null,
      eventId: string | null,
      noteId: string | null,
      staffIndexParam?: number,
      isMulti?: boolean
    ) => {
      if (eventId !== null && measureIndex !== null) {
        const targetStaff = staffIndexParam !== undefined ? staffIndexParam : 0;
        handleNoteSelection(measureIndex, eventId, noteId, targetStaff, isMulti);
      }
    },
    [handleNoteSelection]
  );

  const memoizedOnDragStart = useCallback(
    (args: {
      measureIndex: number;
      eventId: string;
      noteId: string;
      startPitch: string;
      startY: number;
      isMulti?: boolean;
      isShift?: boolean;
      selectAllInEvent?: boolean;
      staffIndex?: number;
    }) => {
      handleDragStart(args);
    },
    [handleDragStart]
  );

  // Create stable onHover handlers for each staff index
  const staffHoverHandlers = useMemo(() => {
    const handlers = new Map<
      number,
      (measureIndex: number | null, hit: HitZone | null, pitch: string | null) => void
    >();

    const createHandler =
      (sIdx: number) =>
      (measureIndex: number | null, hit: HitZone | null, pitch: string | null) => {
        if (!dragState.active) {
          handleMeasureHover(measureIndex, hit, pitch || '', sIdx);
        }
      };

    score.staves.forEach((_, index) => {
      handlers.set(index, createHandler(index));
    });

    return handlers;
  }, [dragState.active, score.staves, handleMeasureHover]);

  const getHoverHandler = useCallback(
    (staffIndex: number) => {
      const handler = staffHoverHandlers.get(staffIndex);
      if (!handler) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `ScoreCanvas: hover handler requested for non-existent staff index ${staffIndex}.`
          );
        }
        return (() => {}) as (
          measureIndex: number | null,
          hit: HitZone | null,
          pitch: string | null
        ) => void;
      }
      return handler;
    },
    [staffHoverHandlers]
  );

  return (
    <div
      ref={containerRef}
      data-testid="score-canvas-container"
      className="ScoreCanvas overflow-x-auto relative outline-none z-10 pl-8 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/50"
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
                const bottomY =
                  CONFIG.baseY +
                  (score.staves.length - 1) * CONFIG.staffSpacing +
                  CONFIG.lineHeight * 4;
                return <GrandStaffBracket topY={topY} bottomY={bottomY} x={-20} />;
              })()}
            </>
          )}

          {score.staves?.map((staff: StaffType, staffIndex: number) => {
            const staffBaseY = CONFIG.baseY + staffIndex * CONFIG.staffSpacing;

            // Construct Interaction State - using memoized callbacks for stable references
            const interaction = {
              selection, // Always pass the real selection - isNoteSelected checks staffIndex per-note
              previewNote, // Global preview note (Staff filters it)
              activeDuration,
              isDotted,
              modifierHeld,
              isDragging: dragState.active,
              lassoPreviewIds: previewNoteIds, // Set<string> for O(1) lasso preview lookup
              onAddNote: addNoteToMeasure,
              onSelectNote: memoizedOnSelectNote,
              onDragStart: memoizedOnDragStart,
              onHover: getHoverHandler(staffIndex),
            };

            // Calculate clamping limits for Grand Staff
            // Outer limits: 4 ledger lines (-48, 90)
            // Inner limits: 2 ledger lines (24, -24) to avoid overlap
            const isTop = staffIndex === 0;
            const isBottom = staffIndex === score.staves.length - 1;

            const mouseLimits = {
              min: isTop ? CLAMP_LIMITS.OUTER_TOP : -CLAMP_LIMITS.INNER_OFFSET,
              max: isBottom ? CLAMP_LIMITS.OUTER_BOTTOM : STAFF_HEIGHT + CLAMP_LIMITS.INNER_OFFSET,
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
                mouseLimits={mouseLimits}
              />
            );
          })}

          {isGrandStaff && unifiedCursorX !== null && (
            <g
              ref={cursorRef}
              style={{
                transform: `translateX(${unifiedCursorX}px)`,
                pointerEvents: 'none',
              }}
            >
              <line
                x1={0}
                y1={CONFIG.baseY - 20}
                x2={0}
                y2={
                  CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 20
                }
                stroke={theme.accent}
                strokeWidth="3"
                opacity="0.8"
              />
              <circle cx={0} cy={CONFIG.baseY - 20} r="4" fill={theme.accent} opacity="0.9" />
              <circle
                cx={0}
                cy={
                  CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 20
                }
                r="4"
                fill={theme.accent}
                opacity="0.9"
              />
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

          {/* DEBUG: Lasso hit zone positions (cyan) - compare to red Note hit zones */}
          {CONFIG.debug?.showHitZones &&
            notePositions.map((pos, idx) => (
              <rect
                key={`debug-lasso-${idx}`}
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                fill="cyan"
                fillOpacity={0.3}
                stroke="cyan"
                strokeWidth={1}
                style={{ pointerEvents: 'none' }}
              />
            ))}
        </g>
      </svg>
    </div>
  );
};

export default ScoreCanvas;
