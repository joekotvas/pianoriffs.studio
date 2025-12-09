import { useMemo } from 'react';
import { CONFIG } from '../config';
import { calculateSystemLayout, calculateMeasureLayout, getNoteWidth, calculateHeaderLayout, calculateMeasureWidth } from '../engines/layout';
import { Score, getActiveStaff } from '../types';
import { getNoteDuration } from '../utils/core';

interface UseGrandStaffLayoutProps {
  score: Score;
  playbackPosition: { measureIndex: number | null; eventIndex: number | null; duration: number };
  activeStaff: any; // Using activeStaff from ScoreCanvas for now
  keySignature: string;
  clef: string;
}

export const useGrandStaffLayout = ({
  score,
  playbackPosition,
  activeStaff,
  keySignature,
  clef
}: UseGrandStaffLayoutProps) => {

  // Calculate synchronized measure layouts for Grand Staff
  const synchronizedLayoutData = useMemo(() => {
    if (!score.staves || score.staves.length <= 1) return undefined;
    
    const maxMeasures = Math.max(...score.staves.map((s: any) => s.measures?.length || 0));
    const layouts: { width: number, forcedPositions: Record<number, number> }[] = [];
    
    for (let i = 0; i < maxMeasures; i++) {
        const measuresAtIndices = score.staves.map((staff: any) => staff.measures?.[i]).filter(Boolean);
        
        if (measuresAtIndices.length > 0) {
            const forcedPositions = calculateSystemLayout(measuresAtIndices);
            const maxX = Math.max(...Object.values(forcedPositions));
            
            const isPickup = measuresAtIndices[0]?.isPickup;
            const minDuration = isPickup ? 'quarter' : 'whole';
            const minWidth = getNoteWidth(minDuration, false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
            
            const width = Math.max(maxX + CONFIG.measurePaddingRight, minWidth);
            
            layouts.push({ width, forcedPositions });
        } else {
            const minWidth = getNoteWidth('whole', false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
            layouts.push({ width: minWidth, forcedPositions: {} });
        }
    }
    return layouts;
  }, [score.staves]);

  const numStaves = score.staves?.length || 1;
  const isGrandStaff = numStaves > 1;

  const unifiedCursor = useMemo(() => {
    if (!isGrandStaff) return null;
    if (playbackPosition.measureIndex === null || playbackPosition.eventIndex === null) return null;
    
    // Always use Staff 0 (Treble) as the reference for playback tracking
    const referenceStaff = score.staves?.[0];
    if (!referenceStaff) return null;

    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    let cursorX = startOfMeasures;
    let cursorWidth = 0;
    
    // Add widths of previous measures using synchronized data
    if (synchronizedLayoutData) {
        for (let i = 0; i < playbackPosition.measureIndex; i++) {
             if (synchronizedLayoutData[i]) {
                 cursorX += synchronizedLayoutData[i].width;
             }
        }
    } else {
        // Fallback (shouldn't happen in Grand Staff mode)
        for (let i = 0; i < playbackPosition.measureIndex; i++) {
           if (referenceStaff.measures && referenceStaff.measures[i]) {
             cursorX += calculateMeasureWidth(referenceStaff.measures[i].events, referenceStaff.measures[i].isPickup);
           }
        }
    }
    
    // Calculate position within current measure using forcedPositions
    const currentMeasureIndex = playbackPosition.measureIndex;
    const currentEventIndex = playbackPosition.eventIndex;
    
    // Calculate tick (accumulated duration) of the target event
    const measure = referenceStaff.measures[currentMeasureIndex];
    if (measure && measure.events[currentEventIndex]) {
        if (synchronizedLayoutData && synchronizedLayoutData[currentMeasureIndex]) {
             // Calculate absolute tick of the event within the measure
             let currentTick = 0;
             for (let i = 0; i < currentEventIndex; i++) {
                 const evt = measure.events[i];
                 currentTick += getNoteDuration(evt.duration, evt.dotted, evt.tuplet);
             }
             
             // Look up position in synchronized layout (keyed by tick)
             const forcedPositions = synchronizedLayoutData[currentMeasureIndex].forcedPositions;
             
             // Note: forcedPositions keys are numbers (ticks).
             // We need to match the tick exactly.
             if (forcedPositions && currentTick in forcedPositions) {
                 cursorX += forcedPositions[currentTick];
                 
                 // Calculate Width (Distance to next visual point)
                 const evt = measure.events[currentEventIndex];
                 const dur = getNoteDuration(evt.duration, evt.dotted, evt.tuplet);
                 const nextTick = currentTick + dur;
                 const nextX = forcedPositions[nextTick] ?? synchronizedLayoutData[currentMeasureIndex].width;
                 if (typeof nextX === 'number') {
                    cursorWidth = nextX - forcedPositions[currentTick];
                 } else {
                    cursorWidth = getNoteWidth(evt.duration, evt.dotted);
                 }
                 
             } else {
                 // Fallback: Use single-staff calculation if tick not found (should be rare)
                 const layout = calculateMeasureLayout(measure.events, undefined, clef);
                 const event = measure.events[currentEventIndex];
                 cursorX += layout.eventPositions[event.id] || CONFIG.measurePaddingLeft;
                 // Approximate fallback width
                 cursorWidth = getNoteWidth(event.duration, event.dotted);
             }
        }
    }
    
    return { x: cursorX, width: cursorWidth };
  }, [isGrandStaff, playbackPosition, score.staves, keySignature, synchronizedLayoutData, clef]);

  return { 
      synchronizedLayoutData, 
      unifiedCursorX: unifiedCursor?.x ?? null, 
      unifiedCursorWidth: unifiedCursor?.width ?? 0, 
      isGrandStaff, 
      numStaves 
  };
};
