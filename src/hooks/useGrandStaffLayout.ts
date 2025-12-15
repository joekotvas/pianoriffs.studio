import { useMemo } from 'react';
import { CONFIG } from '@/config';
import {
  calculateSystemLayout,
  calculateMeasureLayout,
  getNoteWidth,
  calculateHeaderLayout,
  calculateMeasureWidth,
} from '@/engines/layout';
import { Score, getActiveStaff } from '@/types';
import { getNoteDuration } from '@/utils/core';

interface UseGrandStaffLayoutProps {
  score: Score;
  playbackPosition: { measureIndex: number | null; quant: number | null; duration: number };
  activeStaff: any; // Using activeStaff from ScoreCanvas for now
  keySignature: string;
  clef: string;
}

export const useGrandStaffLayout = ({
  score,
  playbackPosition,
  activeStaff,
  keySignature,
  clef,
}: UseGrandStaffLayoutProps) => {
  // Calculate synchronized measure layouts for Grand Staff
  const synchronizedLayoutData = useMemo(() => {
    if (!score.staves || score.staves.length <= 1) return undefined;

    const maxMeasures = Math.max(...score.staves.map((s: any) => s.measures?.length || 0));
    const layouts: { width: number; forcedPositions: Record<number, number> }[] = [];

    for (let i = 0; i < maxMeasures; i++) {
      const measuresAtIndices = score.staves
        .map((staff: any) => staff.measures?.[i])
        .filter(Boolean);

      if (measuresAtIndices.length > 0) {
        const forcedPositions = calculateSystemLayout(measuresAtIndices);
        const maxX = Math.max(...Object.values(forcedPositions));

        const isPickup = measuresAtIndices[0]?.isPickup;
        const minDuration = isPickup ? 'quarter' : 'whole';
        const minWidth =
          getNoteWidth(minDuration, false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;

        const width = Math.max(maxX + CONFIG.measurePaddingRight, minWidth);

        layouts.push({ width, forcedPositions });
      } else {
        const minWidth =
          getNoteWidth('whole', false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
        layouts.push({ width: minWidth, forcedPositions: {} });
      }
    }
    return layouts;
  }, [score.staves]);

  const numStaves = score.staves?.length || 1;
  const isGrandStaff = numStaves > 1;

  const unifiedCursor = useMemo(() => {
    if (!isGrandStaff) return null;
    if (playbackPosition.measureIndex === null || playbackPosition.quant === null) return null; // Logic updated to use quant

    // Always use Staff 0 (Treble) as the reference for layout (shared layout)
    const referenceStaff = score.staves?.[0];
    if (!referenceStaff) return null;

    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    let cursorX = startOfMeasures;
    let cursorWidth = 0;

    // 1. Add widths of previous measures
    if (synchronizedLayoutData) {
      for (let i = 0; i < playbackPosition.measureIndex; i++) {
        if (synchronizedLayoutData[i]) {
          cursorX += synchronizedLayoutData[i].width;
        }
      }
    } else {
      // Fallback
      for (let i = 0; i < playbackPosition.measureIndex; i++) {
        if (referenceStaff.measures && referenceStaff.measures[i]) {
          cursorX += calculateMeasureWidth(
            referenceStaff.measures[i].events,
            referenceStaff.measures[i].isPickup
          );
        }
      }
    }

    // 2. Calculate position within current measure using forcedPositions (Grid)
    const currentMeasureIndex = playbackPosition.measureIndex;
    const currentQuant = playbackPosition.quant;

    if (synchronizedLayoutData && synchronizedLayoutData[currentMeasureIndex]) {
      const forcedPositions = synchronizedLayoutData[currentMeasureIndex].forcedPositions;

      // Loop up exact position for this quant
      if (forcedPositions && currentQuant in forcedPositions) {
        cursorX += forcedPositions[currentQuant];

        // Calculate Width: Find next quant in the map
        // Get all keys, sort them, find currentQuant, find next.
        const sortedQuants = Object.keys(forcedPositions)
          .map(Number)
          .sort((a, b) => a - b);
        const idx = sortedQuants.indexOf(currentQuant);

        if (idx !== -1 && idx < sortedQuants.length - 1) {
          const nextQuant = sortedQuants[idx + 1];
          const nextX = forcedPositions[nextQuant];
          cursorWidth = nextX - forcedPositions[currentQuant];
        } else {
          // Last event/quant in layout: Width is Distance to End of Measure
          // Note: measure.width includes padding
          const measureWidth = synchronizedLayoutData[currentMeasureIndex].width;
          // forcedPositions[currentQuant] is where we are.
          // We slide to end? Or use a fallback default?
          // If we slide to end of measure, it's consistent for last note.
          cursorWidth = measureWidth - forcedPositions[currentQuant];

          // If resulting width is suspiciously large (e.g. whole rest logic), it's fine.
          // If width is negative (padding issues?), clamp it.
          cursorWidth = Math.max(cursorWidth, 20);
        }
      } else {
        // Quant not found in layout map? Should not happen if Audio Engine matches Layout.
        // Fallback to approximate
        cursorWidth = 20;
      }
    }

    return { x: cursorX, width: cursorWidth };
  }, [isGrandStaff, playbackPosition, score.staves, keySignature, synchronizedLayoutData, clef]);

  return {
    synchronizedLayoutData,
    unifiedCursorX: unifiedCursor?.x ?? null,
    unifiedCursorWidth: unifiedCursor?.width ?? 0,
    isGrandStaff,
    numStaves,
  };
};
