// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CONFIG } from '../../config';
import { NOTE_TYPES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { calculateMeasureLayout, getOffsetForPitch, calculateChordLayout, calculateBeamingGroups, getPitchForOffset } from '../../engines/layout';
import { calculateTupletBrackets } from '../../engines/layout/tuplets'; // Restore tuplets import
import { getNoteDuration } from '../../utils/core';
import ChordGroup from './ChordGroup';
import { Rest } from './Rest';
import Beam from './Beam';
import TupletBracket from './TupletBracket';
import { MeasureProps } from '../../componentTypes';

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

  const [hoveredMeasure, setHoveredMeasure] = useState(false);
  const [hoveredPitch, setHoveredPitch] = useState<string | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [isNoteHovered, setIsNoteHovered] = useState(false);

  // --- Layout Calculation ---
  const measureLayout = useMemo(() => {
    return calculateMeasureLayout(events, undefined, clef, measureData.isPickup, forcedEventPositions);
  }, [events, clef, measureData.isPickup, forcedEventPositions]);

  const { hitZones, eventPositions, totalWidth, processedEvents } = measureLayout;

  // Calculate Beams separately (not part of core layout engine yet)
  const beamGroups = useMemo(() => {
      // Need to import calculateBeamingGroups!
      // We will assume it is available in imports, or update imports below.
      return calculateBeamingGroups(events, eventPositions, clef);
  }, [events, eventPositions, clef]);

  // Calculate Tuplets
  const tupletGroups = useMemo(() => {
      return calculateTupletBrackets(processedEvents, eventPositions, clef); 
  }, [processedEvents, eventPositions, clef]);

  // Use forced width if provided (Grand Staff sync), otherwise calculated width
  const effectiveWidth = forcedWidth || totalWidth;

  // --- Event Handlers ---

  const handleMeasureMouseMove = (e: React.MouseEvent) => {
    if (isNoteHovered) {
        setHoveredPitch(null);
        setCursorX(null);
        onHover?.(null, null, null); 
        return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Find closest hit zone
    const hit = hitZones.find(zone => x >= zone.startX && x < zone.endX);

    // Calculate Pitch from Y
    // rect is positioned at y = baseY - 50.
    // The visual Y relative to scale is `y` (from top of rect).
    // The Y offset relative to baseY is `(y + (baseY - 50)) - baseY` = `y - 50`.
    // We snap this to the nearest 6px (half line height) to match PITCH_TO_OFFSET steps.
    const yOffset = Math.round((y - 50) / 6) * 6;
    const pitch = getPitchForOffset(yOffset, clef) || null;

    setHoveredMeasure(true);
    setCursorX(hit ? hit.startX : x);
    
    if (hit) {
         // Pass raw event and calculated pitch
         onHover?.(measureIndex, hit, pitch); 
    } else {
        // Pass "gap" hit and calculated pitch
         onHover?.(measureIndex, { x: x, quant: 0, duration: activeDuration }, pitch);
    }
  };

  const handleMeasureMouseLeave = () => {
    setHoveredMeasure(false);
    setHoveredPitch(null);
    setCursorX(null);
    onHover?.(null, null, null);
  };

  const handleMeasureClick = (e: React.MouseEvent) => {
    if (isNoteHovered) return;
    e.stopPropagation();

    if (hoveredMeasure && onAddNote) {
       // We'll trust the parent's `previewNote` state which serves as the "buffer" for the new note
       // If previewNote exists and is on this measure, commit it.
       if (previewNote && previewNote.measureIndex === measureIndex) {
           onAddNote(measureIndex, previewNote, true);
       }
    }
  };
  
  // PREVIEW LOGIC
  const previewRender = useMemo(() => {
    if (!previewNote) return null;
    
    // Allow rendering if it's for this measure OR if it's for the next measure (overflow) and we are the last measure
    const isOverflowPreview = isLast && previewNote.measureIndex === measureIndex + 1;
    if (previewNote.measureIndex !== measureIndex && !isOverflowPreview) {
        return null;
    }
    
    const visualTempNote = { 
        ...previewNote, 
        quant: 0, // Not used for positioning anymore
        id: 'preview' 
    };

    let combinedNotes = [visualTempNote];
    let xPos = 0;
    
    if (isOverflowPreview) {
         const lastInsertZone = hitZones.find(z => z.type === 'INSERT' && z.index === events.length);
         if (lastInsertZone) {
             xPos = lastInsertZone.startX + (lastInsertZone.endX - lastInsertZone.startX) / 2;
         } else {
             xPos = totalWidth - CONFIG.measurePaddingRight;
         }
    } else if (previewNote.mode === 'CHORD') {
        const existingEvent = events[previewNote.index];
        if(existingEvent) {
             xPos = eventPositions[existingEvent.id];
             combinedNotes = [...existingEvent.notes, visualTempNote];
        }
    } else if (previewNote.mode === 'INSERT') {
        const insertZone = hitZones.find(z => z.type === 'INSERT' && z.index === previewNote.index);
        if (insertZone) {
            xPos = insertZone.startX + (insertZone.endX - insertZone.startX) / 2;
        } else {
            if (previewNote.index < events.length) {
                 xPos = eventPositions[events[previewNote.index].id] - 20;
            } else {
                 xPos = totalWidth - CONFIG.measurePaddingRight;
            }
        }
    } else {
        // APPEND
        const appendZone = hitZones.find(z => z.type === 'APPEND');
        xPos = appendZone ? appendZone.startX : 0;
    }
    
    const chordLayout = calculateChordLayout(combinedNotes, clef);

    return {
        chordNotes: combinedNotes,
        quant: 0,
        x: xPos,
        chordLayout
    };

  }, [previewNote, events, measureIndex, layout, hitZones, eventPositions, totalWidth, clef, isLast]);

  // Map renderable events
  const beamMap = {};
  beamGroups.forEach(group => {
      group.ids.forEach(id => {
          beamMap[id] = group;
      });
  });
  
  const renderableEvents = processedEvents.map(ev => ({
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
        />
      ))}

      {/* RENDER EVENTS */}
      {renderableEvents.map((event, idx) => {
        if (event.isRest) {
            return (
                <Rest
                   key={event.id}
                   duration={event.duration}
                   dotted={event.dotted}
                   x={event.x}
                   quant={event.quant}
                   quantWidth={0} // To be refactored in Rest.tsx
                   baseY={baseY}
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
            />
        );
      })}

      {/* RENDER BEAMS */}
      {beamGroups.map((beam, idx) => (
          <Beam 
            key={`beam-${idx}`}
            beam={beam}
            color={theme.score.note}
          />
      ))}
      
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
      


      {/* Hit Area extended for Interaction */}
      <rect 
        x={0} 
        y={baseY - 50} 
        width={effectiveWidth} 
        height={CONFIG.lineHeight * 12} 
        fill="transparent" 
        style={{ cursor: 'crosshair' }} 
        onClick={handleMeasureClick}
        onMouseMove={handleMeasureMouseMove}
        onMouseLeave={handleMeasureMouseLeave}
      />
      
      {/* Bar Line */}
      {renderBarLine()}

      {/* PREVIEW GHOST */}
      {previewRender && !isNoteHovered && (
          <g style={{ pointerEvents: 'none' }}>
               {(() => {
                 const { chordNotes, quant, x } = previewRender;
                 const shouldDrawStem = NOTE_TYPES[previewNote.duration].stem && previewNote.mode !== 'CHORD';

                 return (
                    <ChordGroup
                        // Data
                        notes={chordNotes}
                        quant={quant}
                        duration={previewNote.duration}
                        dotted={previewNote.dotted}
                        eventId="preview"
                        x={x}
                        chordLayout={previewRender.chordLayout}
                        isGhost={true}
                        
                         // Contexts (Pass through)
                        layout={layout}
                        interaction={interaction}

                        // Local Options
                        measureIndex={measureIndex}
                        opacity={0.5}
                        renderStem={shouldDrawStem}
                        filterNote={(note) => note.id === 'preview'}
                    />
                 );
               })()}
          </g>
      )}
    </g>
  );
};

export default Measure;
