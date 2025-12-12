// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScoreEvent, KeySignatureConfig } from '../../types';
import { CONFIG, STEM, LAYOUT } from '../../config';
import { NOTE_TYPES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { getOffsetForPitch, calculateChordLayout, getPitchForOffset } from '../../engines/layout';
import { getNoteDuration, isRestEvent, getFirstNoteId } from '../../utils/core';
import ChordGroup from './ChordGroup';
import GhostPreview from './GhostPreview';
import { Rest } from './Rest';
import Beam from './Beam';
import TupletBracket from './TupletBracket';
import { MeasureProps } from '../../componentTypes';
import { getEffectiveAccidental, getKeyAccidental, getDiatonicPitch } from '../../utils/accidentalContext';
import { useAccidentalContext } from '../../hooks/useAccidentalContext';
import { useMeasureLayout } from '../../hooks/useMeasureLayout';
import { useMeasureInteraction } from '../../hooks/useMeasureInteraction';
import { usePreviewRender } from '../../hooks/usePreviewRender';

/**
 * Renders a single measure of the score.
 * Handles hit detection, event rendering, beaming, and ghost note preview.
 * 
 * New Architecture: Uses grouped props (layout, interaction) for cleaner data flow.
 */
const Measure: React.FC<MeasureProps> = ({ 
  measureData, 
  measureIndex, 
  startX, 
  isLast, 
  forcedWidth, 
  forcedEventPositions, 
  layout, 
  interaction 
}) => {
  const { theme } = useTheme();
  
  // Destructure for easier access
  const { events, id } = measureData;
  const { scale, baseY, clef, keySignature, verticalOffset, staffIndex } = layout;
  const { 
    selection, 
    previewNote, 
    activeDuration, 
    isDotted, 
    modifierHeld, 
    isDragging,
    onAddNote,
    onSelectNote,
    onDragStart,
    onHover 
  } = interaction;

  const [hoveredPitch, setHoveredPitch] = useState<string | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  // --- Layout Calculation (Extracted to Hook) ---
  const {
    hitZones,
    eventPositions,
    totalWidth,
    effectiveWidth,
    centeredEvents,
    beamGroups,
    tupletGroups
  } = useMeasureLayout(events, clef, measureData.isPickup, forcedEventPositions, forcedWidth);

  // --- Accidental Context Calculation (Extracted to Hook) ---
  const accidentalOverrides = useAccidentalContext(events, keySignature);

  // --- Mouse Interaction (Extracted to Hook) ---
  const {
    handleMeasureMouseMove,
    handleMeasureMouseLeave,
    handleMeasureClick,
    cursorStyle,
    isNoteHovered,
    setIsNoteHovered,
    hoveredMeasure
  } = useMeasureInteraction({
    hitZones,
    clef,
    scale,
    measureIndex,
    isLast,
    activeDuration,
    previewNote,
    selection,
    onHover,
    onAddNote
  });

  // --- Preview Rendering (Extracted to Hook) ---
  const previewRender = usePreviewRender({
    previewNote,
    events,
    measureIndex,
    isLast,
    clef,
    hitZones,
    eventPositions,
    totalWidth,
    selectedNotes: selection.selectedNotes
  });

  // Map renderable events
  const beamMap = {};
  beamGroups.forEach(group => {
      group.ids.forEach(id => {
          beamMap[id] = group;
      });
  });
  
  const renderableEvents = centeredEvents.map(ev => ({
      ...ev,
      beamSpec: beamMap[ev.id]
  }));

  // Render Bar Lines
  const renderBarLine = () => {
      const x = effectiveWidth; 
      return (
          <line 
            x1={x} y1={baseY} 
            x2={x} y2={baseY + CONFIG.lineHeight * 4} 
            stroke={theme.score.line} 
            strokeWidth={isLast ? 3 : 1} 
          />
      );
  };

  return (
    <g transform={`translate(${startX}, 0)`}>
      
      {/* Hit Area extended for Interaction (Background Layer) */}
      <rect 
        data-testid={`measure-hit-area-${layout.staffIndex}-${measureIndex}`}
        x={0} 
        y={baseY - 50} 
        width={effectiveWidth} 
        height={CONFIG.lineHeight * 12} 
        fill="transparent" 
        style={{ cursor: cursorStyle }} 
        onClick={handleMeasureClick}
        onMouseMove={handleMeasureMouseMove}
        onMouseLeave={handleMeasureMouseLeave}
      />
      
      {/* Staff Lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line
          key={`staff-${i}`}
          x1={0}
          y1={baseY + i * CONFIG.lineHeight}
          x2={effectiveWidth}
          y2={baseY + i * CONFIG.lineHeight}
          stroke={theme.score.line}
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* RENDER EVENTS */}
      {renderableEvents.map((event, idx) => {
        if (event.isRest) {
            // Placeholder rests (for empty measures) should be non-interactive
            const isPlaceholder = event.id === 'rest-placeholder';
            


            // Get the rest note ID for selection checks
            const restNoteId = getFirstNoteId(event);
            
            // Check if this rest is selected (check both primary selection and multi-selection list)
            const isPrimarySelected = 
                interaction.selection.measureIndex === measureIndex &&
                interaction.selection.eventId === event.id &&
                layout.staffIndex === interaction.selection.staffIndex;
            
            const isInMultiSelection = interaction.selection.selectedNotes?.some(sn =>
                sn.measureIndex === measureIndex &&
                String(sn.eventId) === String(event.id) &&
                sn.staffIndex === layout.staffIndex &&
                (sn.noteId === restNoteId)
            ) ?? false;
            
            const isRestSelected = isPrimarySelected || isInMultiSelection;
            
            // Handle rest click for selection (only for real rests, not placeholders)
            const handleRestClick = isPlaceholder ? undefined : (e: React.MouseEvent) => {
                e.stopPropagation();
                // Get the rest note ID (rests now have a single pitchless note entry)
                const restNoteId = getFirstNoteId(event);
                interaction.onSelectNote(
                    measureIndex, 
                    event.id, 
                    restNoteId,  // Use the rest note ID for proper selection
                    layout.staffIndex,
                    e.metaKey || e.ctrlKey  // isMulti
                );
            };
            
            return (
                <Rest
                   key={event.id}
                   duration={event.duration}
                   dotted={event.dotted}
                   x={event.x}
                   quant={event.quant}
                   baseY={baseY}
                   isSelected={isRestSelected}
                   onClick={handleRestClick}
                   eventId={event.id}
                />
            );
        }

        return (
            <ChordGroup
              key={event.id}
              // Data
              notes={event.notes}
              quant={event.quant}
              duration={event.duration}
              dotted={event.dotted}
              eventId={event.id}
              x={event.x}
              beamSpec={beamMap[event.id]}
              chordLayout={event.chordLayout}
              isGhost={false}
              
              // Contexts (Pass through)
              layout={layout}
              interaction={interaction}
              
              // Local Options
              measureIndex={measureIndex}
              onNoteHover={(isHovering) => setIsNoteHovered(isHovering)}
              accidentalOverrides={accidentalOverrides}
            />
        );
      })}

      {/* RENDER BEAMS */}
      {beamGroups.map((beam, idx) => {
          // Check if ALL notes in the beam group are selected
          const isSelected = (() => {
               // 1. Collect all notes participating in this beam
               const beamNoteIds: Array<{eventId: string|number, noteId: string|number}> = [];
               beam.ids.forEach(eventId => {
                   const ev = events.find(e => e.id === eventId);
                   if (ev && ev.notes) {
                       ev.notes.forEach(n => beamNoteIds.push({ eventId: ev.id, noteId: n.id }));
                   }
               });
               
               if (beamNoteIds.length === 0) return false;

               // 2. Check if every single note is in the selection
               return beamNoteIds.every(bn => {
                    // Check against multi-selection
                    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
                        return selection.selectedNotes.some(sn => 
                            sn.measureIndex === measureIndex && 
                            sn.eventId === bn.eventId && 
                            sn.noteId === bn.noteId
                        );
                    }
                    // Check against single selection
                    return (
                        selection.measureIndex === measureIndex && 
                        selection.eventId === bn.eventId && 
                        selection.noteId === bn.noteId
                    );
               });
          })();

          return (
            <Beam 
              key={`beam-${idx}`}
              beam={beam}
              color={isSelected ? theme.accent : theme.score.note}
            />
          );
      })}
      
      {/* RENDER TUPLETS */}
      {tupletGroups.map((tuplet, idx) => (
          <TupletBracket
            key={`tuplet-${idx}`}
            group={tuplet}
            baseY={baseY}
            staffHeight={CONFIG.lineHeight * 4}
            theme={theme}
          />
      ))}
      
      {/* Bar Line */}
      {renderBarLine()}

      {/* PREVIEW GHOST */}
      {previewRender && !isNoteHovered && previewNote && (
        <g style={{ pointerEvents: 'none' }}>
          <GhostPreview
            previewRender={previewRender}
            previewNote={previewNote}
            baseY={baseY}
            layout={layout}
            interaction={interaction}
            measureIndex={measureIndex}
          />
        </g>
      )}
    </g>
  );
};

export default Measure;
