import { useEffect, useCallback, useMemo, useRef } from 'react';
import { CONFIG } from '@/config';
import {
  calculateMeasureWidth,
  calculateMeasureLayout,
  calculateHeaderLayout,
} from '@/engines/layout';
import { getActiveStaff, Score, Selection, PreviewNote } from '@/types';
import { getNoteDuration } from '@/utils/core';

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------



interface UseAutoScrollProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  score: Score;
  selection: Selection;
  playbackPosition: { measureIndex: number | null; quant: number | null; duration: number };
  previewNote: PreviewNote | null;
  scale: number;
}

type ScrollStrategy = 'scroll-to-start' | 'keep-in-view';

// ------------------------------------------------------------------
// Hook Implementation
// ------------------------------------------------------------------

export const useAutoScroll = ({
  containerRef,
  score,
  selection,
  playbackPosition,
  previewNote,
  scale,
}: UseAutoScrollProps) => {
  // 1. Memoize Derived Data
  const activeStaff = useMemo(() => getActiveStaff(score), [score]);

  const keySignature = useMemo(
    () => score.keySignature || activeStaff.keySignature || 'C',
    [score.keySignature, activeStaff.keySignature]
  );

  const clef = useMemo(
    () => (score.staves.length >= 2 ? 'grand' : activeStaff.clef || 'treble'),
    [score.staves.length, activeStaff.clef]
  );

  // 2. Measure Start X Cache (O(1) lookup during playback)
  // Cache invalidates when measures or keySignature changes
  const measureStartXCache = useMemo(() => {
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    const cache = [startOfMeasures];
    let x = startOfMeasures;

    for (const measure of activeStaff.measures || []) {
      x += calculateMeasureWidth(measure.events, measure.isPickup);
      cache.push(x);
    }
    return cache;
  }, [activeStaff.measures, keySignature]);

  // 3. Helper: Calculate Layout for a specific measure
  // Performance Note: If playback stutters on large scores (300+ measures) or
  // many instruments, consider pre-computing all measure layouts into a memoized
  // cache (like measureStartXCache) rather than calculating on each lookup.
  const getMeasureData = useCallback(
    (measureIndex: number) => {
      const measure = activeStaff.measures[measureIndex];
      if (!measure) return null;

      const layout = calculateMeasureLayout(measure.events, undefined, clef);
      const startX = measureStartXCache[measureIndex] ?? measureStartXCache[0] ?? 0;

      return { measure, layout, startX };
    },
    [activeStaff.measures, clef, measureStartXCache]
  );

  // 4. Unified Scroll Function
  const performScroll = useCallback(
    (targetX: number, strategy: ScrollStrategy) => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollLeft, clientWidth } = container;
      const scaledTargetX = targetX * scale;
      const padding = 100;

      let newScrollLeft: number | null = null;
      const rightEdge = scrollLeft + clientWidth - padding;
      const leftEdge = scrollLeft + padding;

      if (strategy === 'scroll-to-start') {
        // If target is OFF SCREEN, bring it to the left edge
        if (scaledTargetX > rightEdge || scaledTargetX < leftEdge) {
          newScrollLeft = Math.max(0, scaledTargetX - padding);
        }
      } else {
        // 'keep-in-view'
        if (scaledTargetX > rightEdge) {
          newScrollLeft = scaledTargetX - clientWidth + padding + 200;
        } else if (scaledTargetX < leftEdge) {
          newScrollLeft = Math.max(0, scaledTargetX - padding - 100);
        }
      }

      if (newScrollLeft !== null) {
        container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
      }
    },
    [containerRef, scale]
  );

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------

  // Effect: Handle Selection
  useEffect(() => {
    if (selection.measureIndex === null || !selection.eventId) return;

    const data = getMeasureData(selection.measureIndex);
    if (!data) return;

    const eventOffset = data.layout.eventPositions[selection.eventId] || 0;
    performScroll(data.startX + eventOffset, 'keep-in-view');
  }, [selection.measureIndex, selection.eventId, getMeasureData, performScroll]);

  // Effect: Handle Preview (Keyboard only)
  useEffect(() => {
    if (!previewNote || previewNote.source === 'hover' || previewNote.measureIndex === null) return;

    const data = getMeasureData(previewNote.measureIndex);
    if (!data) return;

    let localOffsetX = CONFIG.measurePaddingLeft;

    if (previewNote.mode === 'APPEND') {
      localOffsetX = data.layout.totalWidth - CONFIG.measurePaddingRight;
    } else if (previewNote.mode === 'INSERT' && previewNote.index > 0) {
      const prevEvent = data.measure.events[previewNote.index - 1];
      const GAP_SPACING = 30;
      localOffsetX = (data.layout.eventPositions[prevEvent?.id] || 0) + GAP_SPACING;
    }

    performScroll(data.startX + localOffsetX, 'keep-in-view');
  }, [previewNote, getMeasureData, performScroll]);

  // Effect: Handle Playback
  const lastScrolledMeasureRef = useRef<number | null>(null);

  useEffect(() => {
    if (playbackPosition.measureIndex === null || playbackPosition.quant === null) {
      lastScrolledMeasureRef.current = null;
      return;
    }

    const data = getMeasureData(playbackPosition.measureIndex);
    if (!data) return;

    // Find offset based on quant
    let localOffsetX = CONFIG.measurePaddingLeft;
    let currentQuant = 0;
    let found = false;

    for (const event of data.measure.events) {
      if (currentQuant >= playbackPosition.quant) {
        localOffsetX = data.layout.eventPositions[event.id] || CONFIG.measurePaddingLeft;
        found = true;
        break;
      }
      currentQuant += getNoteDuration(event.duration, event.dotted, event.tuplet);
    }

    if (!found && currentQuant < playbackPosition.quant) {
      localOffsetX = data.layout.totalWidth - CONFIG.measurePaddingRight;
    }

    performScroll(data.startX + localOffsetX, 'scroll-to-start');
  }, [playbackPosition, getMeasureData, performScroll]);
};
