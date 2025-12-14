import React from 'react';
import { CONFIG } from '@/config';
import { useTheme } from '@/context/ThemeContext';
import { calculateMeasureWidth, calculateMeasureLayout, getOffsetForPitch, calculateHeaderLayout } from '@/engines/layout';
import { getNoteDuration } from '@/utils/core';
import { isNoteSelected } from '@/utils/selection';
import Measure from './Measure';
import Tie from './Tie';
import ScoreHeader from './ScoreHeader';

import { InteractionState } from '../../componentTypes';
import { Measure as MeasureData } from '@/types';

/**
 * Props for a self-contained Staff component.
 * Each Staff is independent and can be stacked for Grand Staff.
 */
export interface StaffProps {
  // Staff-specific data
  staffIndex: number; // Index of this staff in the score
  clef: string;
  keySignature: string;
  timeSignature: string;
  measures: MeasureData[];
  pitchRange: { min: string; max: string }; // Allowed pitch range for this staff
  
  // Layout
  baseY?: number; // Y offset for stacking staves (default: CONFIG.baseY)
  measureLayouts?: { width: number, forcedPositions: Record<number, number> }[]; // Synchronized layouts
  scale: number;

  // Interaction (Grouped)
  interaction: InteractionState;
  
  // Playback
  playbackPosition: { measureIndex: number | null; quant: number | null; duration: number };
  hidePlaybackCursor?: boolean; // Hide cursor when rendered by parent (Grand Staff)
  
  // Header click callbacks (Panel/Menu interactions)
  onClefClick?: () => void;
  onKeySigClick?: () => void;
  onTimeSigClick?: () => void;
}

/**
 * A self-contained Staff component that renders a single staff with:
 * - Header (clef, key signature, time signature)
 * - Measures with notes
 * - Ties between notes
 * 
 * Designed to be stacked for Grand Staff support.
 */
const Staff: React.FC<StaffProps> = ({
  staffIndex,
  clef,
  keySignature,
  timeSignature,
  measures,
  pitchRange,
  baseY = CONFIG.baseY,
  measureLayouts,
  scale,
  interaction,
  playbackPosition,
  hidePlaybackCursor = false,
  onClefClick,
  onKeySigClick,
  onTimeSigClick,
}) => {
  const { theme } = useTheme();
  
  // Calculate vertical offset for this staff relative to the standard position
  // This is used for the SVG transform and passed to children for hit detection
  const verticalOffset = baseY - CONFIG.baseY;
  
  // Use centralized layout calculation (SSOT)
  const { startOfMeasures } = calculateHeaderLayout(keySignature);
  
  // Calculate measure positions and render
  let currentX = startOfMeasures;
  
  const measureComponents = measures.map((measure, index: number) => {
    // Use synchronized layout if available, otherwise calculate
    const layoutData = measureLayouts?.[index];
    const width = layoutData ? layoutData.width : calculateMeasureWidth(measure.events, measure.isPickup);
    const forcedPositions = layoutData?.forcedPositions;
    
    // Only show preview note if it belongs to this staff
    // We create a DERIVED InteractionState for this scope
    const staffPreviewNote = (interaction.previewNote && interaction.previewNote.staffIndex === staffIndex) ? interaction.previewNote : null;
    
    const scopedInteraction = {
        ...interaction,
        previewNote: staffPreviewNote
    };

    const component = (
      <Measure 
        key={measure.id}
        startX={currentX}
        measureIndex={index}
        measureData={measure}
        isLast={index === measures.length - 1}
        forcedWidth={width}
        forcedEventPositions={forcedPositions}
        layout={{
          scale,
          baseY: CONFIG.baseY,
          clef,
          keySignature,
          staffIndex,
          verticalOffset,
          pitchRange
        }}
        interaction={scopedInteraction}
      />
    );
    currentX += width;
    return component;
  });

  // Calculate total width for this staff
  const totalWidth = currentX + 50;

  // Render ties between notes
  const renderTies = () => {
    const ties: React.ReactElement[] = [];
    const { startOfMeasures: tieStartX } = calculateHeaderLayout(keySignature);

    let currentMeasureX = tieStartX;
    const allNotes: any[] = [];
    
    measures.forEach((measure, mIndex: number) => {
      const layout = calculateMeasureLayout(measure.events, undefined, clef, false);
      measure.events.forEach((event, eIndex: number) => {
        const eventX = currentMeasureX + layout.eventPositions[event.id];
        event.notes.forEach((note: any, nIndex: number) => {
          allNotes.push({
            measureIndex: mIndex,
            eventIndex: eIndex,
            noteIndex: nIndex,
            pitch: note.pitch,
            tied: note.tied,
            x: eventX,
            y: CONFIG.baseY + getOffsetForPitch(note.pitch, clef),  // Use CONFIG.baseY for normalized coords
            id: note.id
          });
        });
      });
      currentMeasureX += layout.totalWidth;
    });
    
    allNotes.forEach((note) => {
      if (note.tied) {
        let nextNote = null;
        
        // Check Selection using global staffIndex
        const eventId = measures[note.measureIndex]?.events[note.eventIndex]?.id;
        const isSelected = isNoteSelected(interaction.selection, {
            staffIndex, // Staff prop
            measureIndex: note.measureIndex,
            eventId,
            noteId: note.id
        });

        // Use accent color if selected
        // Important: Use theme.score.note as default instead of hardcoded 'black'
        const tieColor = isSelected ? theme.accent : theme.score.note;

        let targetMIndex = note.measureIndex;
        let targetEIndex = note.eventIndex + 1;
        
        // Handle measure overflow
        if (targetEIndex >= measures[targetMIndex].events.length) {
          targetMIndex++;
          targetEIndex = 0;
        }
        
        // Check if valid event exists
        if (targetMIndex < measures.length && targetEIndex < measures[targetMIndex].events.length) {
          nextNote = allNotes.find(n => 
            n.measureIndex === targetMIndex && 
            n.eventIndex === targetEIndex && 
            n.pitch === note.pitch
          );
        }

        const direction = getOffsetForPitch(note.pitch, clef) > 24 ? 'down' : 'up';

        if (nextNote) {
          ties.push(
            <Tie 
              key={`tie-${note.id}`}
              startX={note.x + 10} 
              startY={note.y}
              endX={nextNote.x} 
              endY={nextNote.y}
              direction={direction}
              color={tieColor}
            />
          );
        } else {
          // Hanging Tie
          ties.push(
            <Tie 
              key={`tie-hanging-${note.id}`}
              startX={note.x + 10} 
              startY={note.y}
              endX={note.x + 35}
              endY={note.y}
              direction={direction}
              color={tieColor}
            />
          );
        }
      }
    });
    
    return ties;
  };

  // Calculate playback cursor X position for this staff
  const playbackCursorX = React.useMemo(() => {
    if (playbackPosition.measureIndex === null || playbackPosition.quant === null) {
      return null;
    }
    
    const { startOfMeasures: cursorStartX } = calculateHeaderLayout(keySignature);

    let absX = cursorStartX;
    
    for (let i = 0; i < playbackPosition.measureIndex; i++) {
      if (measures[i]) {
        absX += calculateMeasureWidth(measures[i].events, measures[i].isPickup);
      }
    }
    
    // Find event corresponding to the current quant
    const measure = measures[playbackPosition.measureIndex];
    if (measure) {
      const layout = calculateMeasureLayout(measure.events, undefined, clef, false);
      const targetQuant = playbackPosition.quant;
      
      // Find event covering this quant
      // Note: layout.processedEvents includes x and quant
      const targetEvent = layout.processedEvents.find((e: any) => {
          const dur = getNoteDuration(e.duration, e.dotted, e.tuplet);
          return e.quant <= targetQuant && (e.quant + dur) > targetQuant;
      });
      
      if (targetEvent) {
          absX += (targetEvent as any).x;
      } else {
          // If no note found at this quant (e.g. within a rest or beyond), use fallback
          // Try to find closest previous event? Or just use padding if at start.
          absX += CONFIG.measurePaddingLeft;
      }
    }
    
    return absX;
  }, [playbackPosition, measures, keySignature, clef]);

  return (
    <g className="staff" transform={`translate(0, ${verticalOffset})`}>
      {/* Staff Header (Clef, Key Sig, Time Sig) */}
      <ScoreHeader 
        clef={clef}
        keySignature={keySignature}
        timeSignature={timeSignature}
        baseY={CONFIG.baseY}  // Use normalized baseY
        onClefClick={(e) => {
          e.stopPropagation();
          if (onClefClick) onClefClick();
        }}
        onKeySigClick={(e) => {
          e.stopPropagation();
          if (onKeySigClick) onKeySigClick();
        }}
        onTimeSigClick={(e) => {
          e.stopPropagation();
          if (onTimeSigClick) onTimeSigClick();
        }}
      />
      
      {/* Measures */}
      {measureComponents}

      {/* Ties */}
      {renderTies()}

      {/* Playback Cursor */}
      {!hidePlaybackCursor && playbackCursorX !== null && (
        <g 
          style={{ 
            transform: `translateX(${playbackCursorX}px)`,
            transition: `transform ${playbackPosition.duration || 0.1}s linear`,
            pointerEvents: 'none'
          }}
        >
          <line
            x1={0}
            y1={CONFIG.baseY - 20}
            x2={0}
            y2={CONFIG.baseY + CONFIG.lineHeight * 4 + 20}
            stroke={theme.accent}
            strokeWidth="3"
            opacity="0.8"
          />
        </g>
      )}
    </g>
  );
};

// Export totalWidth calculation for parent container sizing
export const calculateStaffWidth = (measures: MeasureData[], keySignature: string): number => {
  const { startOfMeasures } = calculateHeaderLayout(keySignature);
  let width = startOfMeasures;
  measures.forEach((measure) => {
    width += calculateMeasureWidth(measure.events, measure.isPickup);
  });
  return width + 50;
};

export default Staff;
