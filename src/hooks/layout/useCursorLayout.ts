/**
 * useCursorLayout.ts
 *
 * Focused hook for calculating playback cursor position by consuming the centralized ScoreLayout.
 * It maps playback "quants" (time units) to X-pixels on the staff, handling both exact matches
 * and interpolated positions.
 *
 * @param layout - The centralized ScoreLayout (SSOT)
 * @param playbackPosition - Current playback state (measure, quant, duration)
 * @param isPlaying - Whether playback is active (affects lookahead logic)
 *
 * @returns CursorLayout (x, width, grandStaff metadata)
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
  const sortedQuants = Object.keys(quantToX)
    .map(Number)
    .sort((a, b) => a - b);

  // 1. Exact Match
  if (quant in quantToX) {
    const idx = sortedQuants.indexOf(quant);

    // Start at 0 for the vary first event to cover header space
    const startX = idx === 0 ? 0 : quantToX[quant];

    let nextX: number;
    if (idx < sortedQuants.length - 1) {
      nextX = quantToX[sortedQuants[idx + 1]];
    } else {
      nextX = measureWidth;
    }

    const width = Math.max(nextX - startX, 20);

    return {
      x: isPlaying ? nextX : startX,
      width,
    };
  }

  // 2. In-between (Range Search)
  for (let i = 0; i < sortedQuants.length; i++) {
    const eventQuant = sortedQuants[i];
    const nextQuant = i < sortedQuants.length - 1 ? sortedQuants[i + 1] : Infinity;

    if (eventQuant <= quant && quant < nextQuant) {
      const startX = i === 0 ? 0 : quantToX[eventQuant];

      const nextX = i < sortedQuants.length - 1 ? quantToX[sortedQuants[i + 1]] : measureWidth;

      const width = Math.max(nextX - startX, 20);

      return {
        x: isPlaying ? nextX : startX,
        width,
      };
    }
  }

  // 3. Fallback: After last event
  if (sortedQuants.length > 0) {
    const lastQuant = sortedQuants[sortedQuants.length - 1];
    const lastX = quantToX[lastQuant] ?? 0;
    return { x: lastX, width: Math.max(measureWidth - lastX, 20) };
  }

  // 4. Empty Measure
  return { x: 0, width: 20 };
};
