// @ts-nocheck
import React, { useMemo, useRef, useState } from 'react';
import { NOTE_TYPES } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';

import { getNoteDuration } from '../../utils/core';
import { calculateMeasureLayout, calculateBeamingGroups, calculateChordLayout, getNoteWidth, getYToPitch, calculateTupletBrackets } from '../../engines/layout';
import { applyKeySignature } from '../../services/MusicService';
import ChordGroup from './ChordGroup';
import Beam from './Beam';
import TupletBracket from './TupletBracket';

/**
 * Renders a single measure of the score.
 * Handles hit detection, event rendering, beaming, and ghost note preview.
 * @param measureData - Data for the measure (events, id)
 * @param measureIndex - Index of this measure in the score
 * @param onAddNote - Callback to add a note
 * @param activeDuration - Currently selected duration for new notes
 * @param selection - Current selection state
 * @param onSelectNote - Callback to select a note
 * @param scale - Zoom scale
 * @param startX - X-position where this measure starts
 * @param isLast - Whether this is the last measure (affects bar line)
 * @param onHover - Callback for hover state (preview)
 * @param previewNote - Current preview note data
 * @param isDotted - Whether the active note is dotted
 */
const Measure = ({ measureData, measureIndex, onAddNote, activeDuration, selection, onSelectNote, scale, startX, isLast, onHover, previewNote, isDotted, clef = 'treble', keySignature = 'C', onDragStart, modifierHeld = false, isDragging = false, baseY = CONFIG.baseY, verticalOffset = 0, forcedWidth, forcedEventPositions, staffIndex = 0 }) => {
  const { theme } = useTheme();
  const [isNoteHovered, setIsNoteHovered] = useState(false);
  // Use new layout calculator
  const layout = useMemo(() => calculateMeasureLayout(measureData.events, undefined, clef, measureData.isPickup, forcedEventPositions), [measureData.events, clef, measureData.isPickup, forcedEventPositions]);
  const width = forcedWidth || layout.totalWidth;

  // Calculate Beaming Groups
  const beamingGroups = useMemo(() => {
      return calculateBeamingGroups(measureData.events, layout.eventPositions, clef);
  }, [measureData.events, layout.eventPositions, clef]);

  // Map eventId -> beamSpec for easy lookup
  const beamMap = useMemo(() => {
      const map = {};
      beamingGroups.forEach(group => {
          group.ids.forEach(id => {
              map[id] = group;
          });
      });
      return map;
  }, [beamingGroups]);

  const renderGridLines = () => {
    return [];
  };

  /**
   * Calculates hit data from a mouse event.
   * Converts screen coordinates to virtual coordinates and resolves pitch/time.
   * @param e - Mouse event
   * @returns Object containing hit zone and resolved pitch
   */
  const calculateClickData = (e) => {
    const svgRect = e.target.closest('svg').getBoundingClientRect();
    const screenClickX = e.clientX - svgRect.left;
    const screenClickY = e.clientY - svgRect.top;
    const virtualClickX = screenClickX / scale;
    // Subtract verticalOffset to convert global SVG Y to local transformed Y
    const virtualClickY = (screenClickY / scale) - verticalOffset;
    const relativeX = virtualClickX - startX;
    const relativeY = virtualClickY - baseY;

    // Hit Testing against Zones
    let hit = null;
    for (const zone of layout.hitZones) {
        if (relativeX >= zone.startX && relativeX < zone.endX) {
            hit = zone;
            break;
        }
    }
    
    // Fallback to last zone if click is past everything
    if (!hit && layout.hitZones.length > 0) {
        hit = layout.hitZones[layout.hitZones.length - 1];
    }

    // Updated step calculation for wider pitch range
    const stepIndex = Math.round(relativeY / 6); 
    const snappedY = stepIndex * 6;
    const yOffsetKey = snappedY; // Use number key
    const yToPitch = getYToPitch(clef);
    const visualPitch = yToPitch[yOffsetKey];
    
    // Apply key signature to get absolute pitch (e.g., F4 → F#4 in G Major)
    const resolvedPitch = visualPitch ? applyKeySignature(visualPitch, keySignature) : undefined;

    return { hit, resolvedPitch };
  };
    
  const handleMeasureClick = (e) => {
    e.stopPropagation();
    const { hit, resolvedPitch } = calculateClickData(e);
    
    // Block clicks on existing notes UNLESS we're in EVENT zone (chord mode)
    if(e.target.closest('.note-group-container') && hit?.type !== 'EVENT') {
      return;
    }

    if (hit && resolvedPitch) {
      onAddNote(measureIndex, {
        pitch: resolvedPitch,
        duration: activeDuration,
        dotted: isDotted,
        id: Date.now(),
        staffIndex // Pass staffIndex to ensure correct placement
      }, true, {
          mode: hit.type === 'EVENT' ? 'CHORD' : (hit.type === 'INSERT' ? 'INSERT' : 'APPEND'),
          index: hit.index,
          eventId: hit.eventId
      }); 
    }
  };

  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Ignore scroll-induced events where mouse hasn't moved relative to screen
    if (e.clientX === lastMousePos.current.x && e.clientY === lastMousePos.current.y) {
        return;
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    const { hit, resolvedPitch } = calculateClickData(e);
    if (hit && resolvedPitch) {
      onHover(measureIndex, hit, resolvedPitch);
    } else {
      onHover(null);
    }
  };

  // Process Events -> Renderable Chords with calculated quants AND X positions AND Chord Layout
  // Now provided directly by layout engine
  const renderableEvents = layout.processedEvents;

  // PREVIEW LOGIC
  /**
   * Calculates the render data for the ghost note preview.
   * Determines position based on placement mode (CHORD, INSERT, APPEND).
   */
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
         // Overflow preview: Position at end, centered in the last INSERT zone
         const lastInsertZone = layout.hitZones.find(z => z.type === 'INSERT' && z.index === measureData.events.length);
         if (lastInsertZone) {
             xPos = lastInsertZone.startX + (lastInsertZone.endX - lastInsertZone.startX) / 2;
         } else {
             xPos = layout.totalWidth - CONFIG.measurePaddingRight;
         }
    } else if (previewNote.mode === 'CHORD') {
        // Grab the event at the target index
        const existingEvent = measureData.events[previewNote.index];
        if(existingEvent) {
             // Use existing event's X
             xPos = layout.eventPositions[existingEvent.id];
             // Add existing notes + new note
             combinedNotes = [...existingEvent.notes, visualTempNote];
        }
    } else if (previewNote.mode === 'INSERT') {
        // Find the INSERT zone for this index
        // The INSERT zone for index I is the one generated by event I-1
        const insertZone = layout.hitZones.find(z => z.type === 'INSERT' && z.index === previewNote.index);
        if (insertZone) {
            // Center in the insert zone
            xPos = insertZone.startX + (insertZone.endX - insertZone.startX) / 2;
        } else {
            // Fallback: If no insert zone (e.g. tight spacing?), maybe use event position?
            // Or if inserting at start (index 0)?
            if (previewNote.index < measureData.events.length) {
                 xPos = layout.eventPositions[measureData.events[previewNote.index].id] - 20; // Shift left?
            } else {
                 // Inserting at the end
                 xPos = layout.totalWidth - CONFIG.measurePaddingRight;
            }
        }
    } else {
        // APPEND
        const appendZone = layout.hitZones.find(z => z.type === 'APPEND');
        xPos = appendZone ? appendZone.startX : 0;
    }
    
    const chordLayout = calculateChordLayout(combinedNotes, clef);

    return {
        chordNotes: combinedNotes,
        quant: 0,
        x: xPos,
        chordLayout
    };

  }, [previewNote, measureData.events, measureIndex, layout]);


  return (
    <g transform={`translate(${startX}, 0)`} onMouseMove={handleMouseMove} onMouseLeave={() => onHover(null)}>
      {renderGridLines()}
      
      {/* Bar Lines & Staff Lines - Extended to left edge for Pre-Measure Area */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`staff-${i}`} x1={0} y1={baseY + (i * CONFIG.lineHeight)} x2={width} y2={baseY + (i * CONFIG.lineHeight)} stroke={theme.score.line} strokeWidth="1"/>
      ))}

      {isLast ? (
        <g>
          <line x1={width - 5} y1={baseY} x2={width - 5} y2={baseY + (CONFIG.lineHeight * 4)} stroke={theme.secondaryText} strokeWidth="1" />
          <line x1={width} y1={baseY} x2={width} y2={baseY + (CONFIG.lineHeight * 4)} stroke={theme.secondaryText} strokeWidth="3" />
        </g>
      ) : (
        <line x1={width} y1={baseY} x2={width} y2={baseY + (CONFIG.lineHeight * 4)} stroke={theme.secondaryText} strokeWidth="1" />
      )}

      {/* Hit Area extended for Ledger Lines */}
      <rect x={0} y={baseY - 50} width={width} height={CONFIG.lineHeight * 12} fill="transparent" style={{ cursor: 'crosshair' }} onClick={handleMeasureClick} />

      {/* RENDER BEAMS */}
      {beamingGroups.map((group, i) => (
          <Beam 
            key={`beam-${i}`}
            startX={group.startX}
            endX={group.endX}
            startY={group.startY + (baseY - CONFIG.baseY)}
            endY={group.endY + (baseY - CONFIG.baseY)}
            type={group.type}
            direction={group.direction}
          />
      ))}

      {/* RENDER TUPLET BRACKETS */}
      {(() => {
        const tupletGroups = calculateTupletBrackets(layout.processedEvents, layout.eventPositions, clef);
        
        return tupletGroups.map((bracket, i) => (
          <TupletBracket
            key={`tuplet-${i}`}
            startX={bracket.startX}
            endX={bracket.endX}
            startY={bracket.startY + (baseY - CONFIG.baseY)}
            endY={bracket.endY + (baseY - CONFIG.baseY)}
            number={bracket.number}
            direction={bracket.direction}
          />
        ));
      })()}

      {/* RENDER EVENTS */}
      {renderableEvents.map((event, idx) => (
        <ChordGroup
          key={event.id}
          notes={event.notes}
          quant={event.quant}
          duration={event.duration}
          dotted={event.dotted}
          quantWidth={0} // Not used when x is provided
          measureIndex={measureIndex}
          eventId={event.id}
          selection={selection}
          onSelectNote={onSelectNote}
          x={event.x}
          beamSpec={beamMap[event.id]}
          layout={event.chordLayout}
          isRest={event.isRest}
          clef={clef}
          onDragStart={onDragStart}
          modifierHeld={modifierHeld}
          activeDuration={activeDuration}
          activeDotted={isDotted}
          onNoteHover={(isHovering) => setIsNoteHovered(isHovering)}
          isDragging={isDragging}
          baseY={baseY}
          keySignature={keySignature}
        />
      ))}

      {/* PREVIEW GHOST - only show if not hovering an existing note */}
      {previewRender && !isNoteHovered && (
          <g style={{ pointerEvents: 'none' }}>
               {(() => {
                 const { chordNotes, quant, x } = previewRender;
                 const shouldDrawStem = NOTE_TYPES[previewNote.duration].stem && previewNote.mode !== 'CHORD';

                 return (
                    <ChordGroup
                        notes={chordNotes}
                        quant={quant}
                        duration={previewNote.duration}
                        dotted={previewNote.dotted}
                        quantWidth={0}
                        measureIndex={measureIndex}
                        eventId="preview"
                        isGhost={true}
                        opacity={0.5}
                        renderStem={shouldDrawStem}
                        filterNote={(note) => note.id === 'preview'}
                        x={x}
                        layout={previewRender.chordLayout}
                        clef={clef}
                        baseY={baseY}
                        keySignature={keySignature}
                    />
                 );
               })()}
          </g>
      )}
    </g>
  );
};

export default Measure;
