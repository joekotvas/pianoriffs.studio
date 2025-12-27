/**
 * useCursorLayout.ts
 *
 * Focused hook for calculating playback cursor position.
 * Consumes the centralized ScoreLayout to avoid duplicate calculations.
 *
 * @see Issue #109
 */
import { useMemo } from 'react';
import { ScoreLayout } from '@/engines/layout/types';

interface PlaybackPosition {
  measureIndex: number | null;
  quant: number | null;
  duration: number;
}

interface CursorLayout {
  x: number | null;
  width: number;
  isGrandStaff: boolean;
  numStaves: number;
}

/**
 * Calculates playback cursor position from centralized layout.
 *
 * @param layout - ScoreLayout from useScoreLayout (SSOT)
 * @param playbackPosition - Current playback position
 * @param isPlaying - Whether playback is currently active
 * @returns Cursor x position and width
 */
export const useCursorLayout = (
  layout: ScoreLayout,
  playbackPosition: PlaybackPosition,
  isPlaying: boolean = false
): CursorLayout => {
  const numStaves = layout.staves.length;
  const isGrandStaff = numStaves > 1;

  const cursor = useMemo(() => {
    // No layout - no cursor
    if (layout.staves.length === 0) {
      return { x: null, width: 0 };
    }

    const { measureIndex, quant } = playbackPosition;
    if (measureIndex === null || quant === null) {
      return { x: null, width: 0 };
    }

    // Aggregate events from ALL staves to build unified system grid
    // This ensures we respect timepoints that exist on Staff 1 but not Staff 0
    const relevantMeasures = layout.staves
      .map((staff) => staff.measures[measureIndex])
      .filter(Boolean);

    if (relevantMeasures.length === 0) {
      return { x: null, width: 0 };
    }

    // Use first measure for base X (they are all aligned)
    const baseMeasureX = relevantMeasures[0].x;
    const baseMeasureWidth = relevantMeasures[0].width;

    // Build unified quant -> x map
    // We want relative X within the measure
    const quantToX: Record<number, number> = {};
    
    relevantMeasures.forEach((measure) => {
      // Use legacyLayout.processedEvents to get quants
      // And use legacyLayout.eventPositions to get relative X
      const events = measure.legacyLayout?.processedEvents || [];
      const positions = measure.legacyLayout?.eventPositions || {};

      events.forEach((event) => {
        const q = event.quant ?? 0;
        // Verify this event has a position
        if (event.id in positions) {
          // If multiple staves have events at same quant, they will have same X (by definition of sync)
          quantToX[q] = positions[event.id];
        }
      });
    });

    // If map is empty (rest measure), default to 0
    if (Object.keys(quantToX).length === 0) {
      quantToX[0] = 0;
    }

    // Now find position for current quant
    const quantPosition = getQuantPositionFromMap(quantToX, quant, baseMeasureWidth, isPlaying);

    return {
      x: baseMeasureX + quantPosition.x,
      width: quantPosition.width,
    };
  }, [layout.staves, playbackPosition, isPlaying]);

  return {
    x: cursor.x,
    width: cursor.width,
    isGrandStaff,
    numStaves,
  };
};

// --- Helper ---

interface QuantPosition {
  x: number;
  width: number;
}

/** Calculate cursor position from a unified quant->x map */
const getQuantPositionFromMap = (
  quantToX: Record<number, number>,
  quant: number,
  measureWidth: number,
  isPlaying: boolean = false
): QuantPosition => {
  // Look up exact position for this quant
  if (quant in quantToX) {
    const startX = quantToX[quant];

    // Calculate width to next quant
    const sortedQuants = Object.keys(quantToX)
      .map(Number)
      .sort((a, b) => a - b);
    const idx = sortedQuants.indexOf(quant);

    let nextX: number;
    if (idx !== -1 && idx < sortedQuants.length - 1) {
      const nextQuant = sortedQuants[idx + 1];
      nextX = quantToX[nextQuant];
    } else {
      // Last event - width to end of measure
      nextX = measureWidth;
    }

    const width = Math.max(nextX - startX, 20);

    // If playing, target the NEXT position (or end of segment) to allow CSS transition to animate FROM start
    // If paused, target the START position
    return { 
      x: isPlaying ? nextX : startX,
      width,
    };
  }

  // Quant not found - find the event that covers this quant
  const sortedQuants = Object.keys(quantToX)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < sortedQuants.length; i++) {
    const eventQuant = sortedQuants[i];
    const nextQuant = i < sortedQuants.length - 1 ? sortedQuants[i + 1] : Infinity;

    if (eventQuant <= quant && quant < nextQuant) {
      const startX = quantToX[eventQuant];
      const nextX =
        i < sortedQuants.length - 1
          ? quantToX[nextQuant]
          : measureWidth;
      
      const width = Math.max(nextX - startX, 20);
      
      return { 
        x: isPlaying ? nextX : startX,
        width,
      };
    }
  }

  // Fallback: position at last event
  if (sortedQuants.length > 0) {
    const lastQuant = sortedQuants[sortedQuants.length - 1];
    const lastX = quantToX[lastQuant] ?? 0;
    // For last event, width goes to end of measure
    return { x: lastX, width: Math.max(measureWidth - lastX, 20) };
  }

  return { x: 0, width: 20 };
};
