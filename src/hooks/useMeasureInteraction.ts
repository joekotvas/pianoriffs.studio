import { useState, useCallback, useMemo } from 'react';
import { getPitchForOffset, getOffsetForPitch } from '@/engines/layout';
import { HitZone } from '@/engines/layout/types';

interface UseMeasureInteractionParams {
  hitZones: HitZone[];
  clef: string;
  scale: number;
  measureIndex: number;
  isLast: boolean;
  activeDuration: string;
  previewNote: any;
  selection: { selectedNotes?: any[] };
  pitchRange: { min: string; max: string };
  onHover?: (measureIndex: number | null, hit: any, pitch: string | null) => void;
  onAddNote?: (measureIndex: number, note: any, autoAdvance: boolean) => void;
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
  measureIndex,
  isLast,
  activeDuration,
  previewNote,
  selection,
  pitchRange,
  onHover,
  onAddNote
}: UseMeasureInteractionParams): UseMeasureInteractionReturn {
  const [hoveredMeasure, setHoveredMeasure] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<string>('crosshair');
  const [isNoteHovered, setIsNoteHovered] = useState(false);

  // Calculate offset limits from pitch range passed in
  const { minOffset, maxOffset } = useMemo(() => {
    // Min pitch = higher on staff = lower offset (negative)
    // Max pitch = lower on staff = higher offset (positive)
    const minOff = getOffsetForPitch(pitchRange.max, clef); // max pitch = lowest offset
    const maxOff = getOffsetForPitch(pitchRange.min, clef); // min pitch = highest offset
    return { minOffset: minOff, maxOffset: maxOff };
  }, [clef, pitchRange]);

  const handleMeasureMouseMove = useCallback((e: React.MouseEvent) => {
    if (isNoteHovered) {
      onHover?.(null, null, null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Find closest hit zone
    const hit = hitZones.find(zone => x >= zone.startX && x < zone.endX);

    // Calculate pitch from Y position
    // Snap to nearest half-line (6px) for staff positioning
    let yOffset = Math.round((y - 50) / 6) * 6;

    // Clamp to valid pitch range from config
    yOffset = Math.max(minOffset, Math.min(maxOffset, yOffset));
    const pitch = getPitchForOffset(yOffset, clef) || null;

    setHoveredMeasure(true);

    if (hit) {
      onHover?.(measureIndex, hit, pitch);
      setCursorStyle(hit.type === 'EVENT' ? 'default' : 'crosshair');
    } else {
      // Gap hit
      onHover?.(measureIndex, { x, quant: 0, duration: activeDuration }, pitch);
      setCursorStyle('crosshair');
    }
  }, [isNoteHovered, hitZones, clef, scale, measureIndex, activeDuration, onHover, minOffset, maxOffset]);

  const handleMeasureMouseLeave = useCallback(() => {
    setHoveredMeasure(false);
    onHover?.(null, null, null);
    setCursorStyle('crosshair');
  }, [onHover]);

  const handleMeasureClick = useCallback((e: React.MouseEvent) => {
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
  }, [isNoteHovered, selection.selectedNotes, hoveredMeasure, onAddNote, previewNote, isLast, measureIndex]);

  return {
    handleMeasureMouseMove,
    handleMeasureMouseLeave,
    handleMeasureClick,
    cursorStyle,
    isNoteHovered,
    setIsNoteHovered,
    hoveredMeasure
  };
}
