import React from 'react';
import { CONFIG } from '@/config';
import { useTheme } from '@/context/ThemeContext';
import {
  calculateMeasureWidth,
  calculateMeasureLayout,
  getOffsetForPitch,
  calculateHeaderLayout,
} from '@/engines/layout';
import { StaffLayout } from '@/engines/layout/types';
import { isNoteSelected } from '@/utils/selection';
import Measure from './Measure';
import Tie from './Tie';
import ScoreHeader from './ScoreHeader';

import { InteractionState } from '../../componentTypes';
import { Measure as MeasureData } from '@/types';

/**
 * Represents a note with tie information for rendering
 */
interface TieNote {
  measureIndex: number;
  eventIndex: number;
  noteIndex: number;
  pitch: string;
  tied: boolean;
  x: number;
  y: number;
  id: string;
}

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

  // Layout
  baseY?: number; // Y offset for stacking staves (default: CONFIG.baseY)
  staffLayout?: StaffLayout;
  scale: number;

  // Interaction (Grouped)
  interaction: InteractionState;

  mouseLimits?: { min: number; max: number }; // For Grand Staff clamping

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
  baseY = CONFIG.baseY,
  staffLayout,
  scale,
  interaction,
  mouseLimits,
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
    // Use centralized layout if available, otherwise calculate
    const measureLayoutV2 = staffLayout?.measures[index];
    const legacyLayout = measureLayoutV2?.legacyLayout;

    const width = measureLayoutV2?.width ?? calculateMeasureWidth(measure.events, measure.isPickup);
    const forcedPositions = legacyLayout?.eventPositions;

    // Only show preview note if it belongs to this staff
    // We create a DERIVED InteractionState for this scope
    const staffPreviewNote =
      interaction.previewNote && interaction.previewNote.staffIndex === staffIndex
        ? interaction.previewNote
        : null;

    const scopedInteraction = {
      ...interaction,
      previewNote: staffPreviewNote,
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
        measureLayout={measureLayoutV2}
        layout={{
          scale,
          baseY: CONFIG.baseY,
          clef,
          keySignature,
          staffIndex,
          verticalOffset: 0, // Staff is at 0 relative to itself (positioned by parent)
          mouseLimits, // Pass clamping limits
        }}
        interaction={scopedInteraction}
      />
    );
    currentX += width;
    return component;
  });

  // Calculate total width for this staff
  currentX += 50;

  // Render ties between notes
  const renderTies = () => {
    const ties: React.ReactElement[] = [];
    const { startOfMeasures: tieStartX } = calculateHeaderLayout(keySignature);

    let currentMeasureX = tieStartX;

    const allNotes: TieNote[] = [];

    measures.forEach((measure, mIndex: number) => {
      const layout = calculateMeasureLayout(measure.events, undefined, clef, false);
      measure.events.forEach((event, eIndex: number) => {
        const eventX = currentMeasureX + layout.eventPositions[event.id];
        event.notes.forEach((note, nIndex: number) => {
          // Skip rest notes (which have null pitch) - they can't have ties
          if (note.pitch === null) return;

          allNotes.push({
            measureIndex: mIndex,
            eventIndex: eIndex,
            noteIndex: nIndex,
            pitch: note.pitch,
            tied: !!note.tied,
            x: eventX,
            y: CONFIG.baseY + getOffsetForPitch(note.pitch, clef), // Use CONFIG.baseY for normalized coords
            id: note.id,
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
          noteId: note.id,
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
          nextNote = allNotes.find(
            (n) =>
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

  return (
    <g className="staff" transform={`translate(0, ${verticalOffset})`}>
      {/* Staff Header (Clef, Key Sig, Time Sig) */}
      <ScoreHeader
        clef={clef}
        keySignature={keySignature}
        timeSignature={timeSignature}
        baseY={CONFIG.baseY} // Use normalized baseY
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
