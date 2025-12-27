/**
 * useCursorLayout.ts
 *
 * Focused hook for calculating playback cursor position.
 * Consumes the centralized ScoreLayout to avoid duplicate calculations.
 *
 * @see Issue #109
 */
import { useMemo } from 'react';
import { ScoreLayout, MeasureLayoutV2 } from '@/engines/layout/types';

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
 * @returns Cursor x position and width
 */
export const useCursorLayout = (
  layout: ScoreLayout,
  playbackPosition: PlaybackPosition
): CursorLayout => {
  const numStaves = layout.staves.length;
  const isGrandStaff = numStaves > 1;

  const cursor = useMemo(() => {
    // No layout or single staff - no unified cursor needed
    if (!isGrandStaff || layout.staves.length === 0) {
      return { x: null, width: 0 };
    }

    const { measureIndex, quant } = playbackPosition;
    if (measureIndex === null || quant === null) {
      return { x: null, width: 0 };
    }

    // Use first staff as reference (all staves share same measure positions)
    const referenceStaff = layout.staves[0];
    if (!referenceStaff?.measures) {
      return { x: null, width: 0 };
    }

    // Get measure layout
    const measureLayout = referenceStaff.measures[measureIndex];
    if (!measureLayout) {
      return { x: null, width: 0 };
    }

    // Calculate X position using legacyLayout's forcedPositions
    const forcedPositions = measureLayout.legacyLayout?.eventPositions;
    if (!forcedPositions) {
      return { x: measureLayout.x, width: 20 };
    }

    // Find position for this quant
    const quantPosition = getQuantPosition(measureLayout, quant);

    return {
      x: measureLayout.x + quantPosition.x,
      width: quantPosition.width,
    };
  }, [isGrandStaff, layout.staves, playbackPosition]);

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

/** Calculate cursor position within a measure for a given quant value */
const getQuantPosition = (measureLayout: MeasureLayoutV2, quant: number): QuantPosition => {
  const legacyLayout = measureLayout.legacyLayout;
  if (!legacyLayout) {
    return { x: 0, width: 20 };
  }

  // Build quant->position map from events
  // The legacy layout has eventPositions keyed by eventId, not quant
  // We need to find the position for the current playback quant
  const eventPositions = legacyLayout.eventPositions;

  // For now, use a simple approach: find event at this quant from processedEvents
  const events = legacyLayout.processedEvents;
  let cursorX = 0;
  let cursorWidth = 20;

  // Find the event at this quant position
  let accumulatedQuant = 0;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const eventQuant = event.quant ?? 0;

    if (accumulatedQuant <= quant && quant < accumulatedQuant + eventQuant) {
      // Found the event at this quant
      cursorX = eventPositions[event.id] ?? 0;

      // Calculate width to next event
      if (i < events.length - 1) {
        const nextEventX = eventPositions[events[i + 1].id] ?? measureLayout.width;
        cursorWidth = nextEventX - cursorX;
      } else {
        // Last event - width to end of measure
        cursorWidth = Math.max(measureLayout.width - cursorX, 20);
      }
      break;
    }

    accumulatedQuant += eventQuant;
  }

  return { x: cursorX, width: Math.max(cursorWidth, 20) };
};
