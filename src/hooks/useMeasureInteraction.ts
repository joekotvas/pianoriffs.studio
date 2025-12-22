import { useState, useCallback } from 'react';
import { getPitchForOffset } from '@/engines/layout';
import { HitZone } from '@/engines/layout/types';
import { CLAMP_LIMITS, MOUSE_OFFSET_SNAP } from '@/constants';
import { PreviewNote, Selection } from '@/types';
import { NoteInput } from './note/useNoteEntry';

interface UseMeasureInteractionParams {
  hitZones: HitZone[];
  clef: string;
  scale: number;
  baseY: number;
  topMargin: number;
  mouseLimits?: { min: number; max: number };
  measureIndex: number;
  isLast: boolean;
  previewNote: PreviewNote | null;
  selection: Selection;
  onHover?: (measureIndex: number | null, hit: HitZone | null, pitch: string | null) => void;
  onAddNote?: (measureIndex: number, note: NoteInput, autoAdvance: boolean) => void;
}

interface UseMeasureInteractionReturn {

  handleMeasureMouseMove: (e: React.MouseEvent) => void;
  handleMeasureMouseLeave: () => void;
  handleMeasureClick: (e: React.MouseEvent) => void;
  cursorStyle: string;
  isNoteHovered: boolean;
  setIsNoteHovered: (value: boolean) => void;
  hoveredMeasure: boolean;
}

/**
 * Hook to manage mouse interaction within a measure.
 *
 * Handles:
 * - Mouse move: Hit zone detection, pitch calculation, preview updates
 * - Mouse leave: Reset hover state
 * - Click: Commit preview note or delegate to parent
 */
export function useMeasureInteraction({
  hitZones,
  clef,
  scale,
  baseY,
  topMargin,
  mouseLimits,
  measureIndex,
  isLast,
  previewNote,
  selection,
  onHover,
  onAddNote,
}: UseMeasureInteractionParams): UseMeasureInteractionReturn {
  const [hoveredMeasure, setHoveredMeasure] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<string>('crosshair');
  const [isNoteHovered, setIsNoteHovered] = useState(false);

  const handleMeasureMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isNoteHovered) {
        onHover?.(null, null, null);
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      // Find closest hit zone
      const hit = hitZones.find((zone) => x >= zone.startX && x < zone.endX);

      // Calculate pitch from Y position
      // Snap to nearest half-line (6px) for staff positioning
      // Y is relative to measure bounding box.
      // Original working logic was y - 50.
      // 50 = CONFIG.baseY (70) - CONFIG.topMargin (20).
      // So currentY (relative to box) needs to be adjusted by (baseY - topMargin).
      const yOffset = Math.round((y - (baseY - topMargin)) / MOUSE_OFFSET_SNAP) * MOUSE_OFFSET_SNAP;

      // Check visual limits
      // Default: 4 ledger lines above/below.
      // Props can restrict this (e.g. Grand Staff inner zones).
      const minLimit = mouseLimits?.min ?? CLAMP_LIMITS.OUTER_TOP;
      const maxLimit = mouseLimits?.max ?? CLAMP_LIMITS.OUTER_BOTTOM;

      // Strict bounds check: If outside, ignore interaction (allows other staves to handle, or shows nothing)
      if (yOffset < minLimit || yOffset > maxLimit) {
        if (hoveredMeasure) {
          setHoveredMeasure(false);
          onHover?.(null, null, null);
          setCursorStyle('crosshair');
        }
        return;
      }

      const pitch = getPitchForOffset(yOffset, clef) || null;

      setHoveredMeasure(true);

      if (hit) {
        onHover?.(measureIndex, hit, pitch);
        setCursorStyle(hit.type === 'EVENT' ? 'default' : 'crosshair');
      } else {
        // Gap hit - we pass null for hit, meaning "no valid insert position"
        // This effectively clears the preview when hovering in dead space
        onHover?.(measureIndex, null, pitch);
        setCursorStyle('crosshair');
      }
    },
    [
      isNoteHovered,
      hitZones,
      clef,
      scale,
      baseY,
      topMargin,
      mouseLimits,
      measureIndex,
      hoveredMeasure,
      onHover,
    ]
  );

  const handleMeasureMouseLeave = useCallback(() => {
    setHoveredMeasure(false);
    onHover?.(null, null, null);
    setCursorStyle('crosshair');
  }, [onHover]);

  const handleMeasureClick = useCallback(
    (e: React.MouseEvent) => {
      if (isNoteHovered) return;

      // If there's an active selection, let click bubble up to deselect
      if (selection.selectedNotes && selection.selectedNotes.length > 0) {
        return;
      }

      e.stopPropagation();

      if (hoveredMeasure && onAddNote && previewNote) {
        const isOverflow = isLast && previewNote.measureIndex === measureIndex + 1;
        if (previewNote.measureIndex === measureIndex || isOverflow) {
          onAddNote(measureIndex, previewNote, true);
        }
      }
    },
    [
      isNoteHovered,
      selection.selectedNotes,
      hoveredMeasure,
      onAddNote,
      previewNote,
      isLast,
      measureIndex,
    ]
  );

  return {
    handleMeasureMouseMove,
    handleMeasureMouseLeave,
    handleMeasureClick,
    cursorStyle,
    isNoteHovered,
    setIsNoteHovered,
    hoveredMeasure,
  };
}
