// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ScoreEvent, KeySignatureConfig } from '../../types';
import { CONFIG, STEM, LAYOUT } from '../../config';
import { NOTE_TYPES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { getOffsetForPitch, calculateChordLayout, getPitchForOffset } from '../../engines/layout';
import { getNoteDuration, isRestEvent, getFirstNoteId } from '../../utils/core';
import ChordGroup from './ChordGroup';
import { Rest } from './Rest';
import Beam from './Beam';
import TupletBracket from './TupletBracket';
import { MeasureProps } from '../../componentTypes';
import { getEffectiveAccidental, getKeyAccidental, getDiatonicPitch } from '../../utils/accidentalContext';
import { useAccidentalContext } from '../../hooks/useAccidentalContext';
import { useMeasureLayout } from '../../hooks/useMeasureLayout';

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
  const [cursorStyle, setCursorStyle] = useState<string>('crosshair');

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
    console.log("y before clamping", y);
    let yOffset = Math.round((y - 50) / 6) * 6;
    
    // Clamp yOffset to valid pitch range to eliminate dead zones
    // Treble: -48 (G6) to 102 (C3), Bass: -48 (B4) to 102 (E1)
    const MIN_OFFSET = -48;
    const MAX_OFFSET = 102;
    console.log("yOffset before clamping", yOffset);
    yOffset = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, yOffset));
    console.log("yOffset after clamping", yOffset);
    const pitch = getPitchForOffset(yOffset, clef) || null;

    setHoveredMeasure(true);
    setCursorX(hit ? hit.startX : x);
    
    if (hit) {
         // Pass raw event and calculated pitch
         onHover?.(measureIndex, hit, pitch); 
         if (hit.type === 'EVENT') {
             setCursorStyle('default');
         } else {
             setCursorStyle('crosshair');
         }
    } else {
        // Pass "gap" hit and calculated pitch
         onHover?.(measureIndex, { x: x, quant: 0, duration: activeDuration }, pitch);
         setCursorStyle('crosshair');
    }
  };

  const handleMeasureMouseLeave = () => {
    setHoveredMeasure(false);
    setHoveredPitch(null);
    setCursorX(null);
    onHover?.(null, null, null);
    setCursorStyle('crosshair');
  };

  const handleMeasureClick = (e: React.MouseEvent) => {
    if (isNoteHovered) return;
    
    // If there's an active selection, don't add notes - let click bubble up to deselect
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      return; // Don't stop propagation - let container handle deselection
    }
    
    e.stopPropagation();

    if (hoveredMeasure && onAddNote) {
       // We'll trust the parent's `previewNote` state which serves as the "buffer" for the new note
       // If previewNote exists and is on this measure OR is an overflow for the next measure, commit it.
       const isOverflow = isLast && previewNote.measureIndex === measureIndex + 1;
       
       if (previewNote && (previewNote.measureIndex === measureIndex || isOverflow)) {
           onAddNote(measureIndex, previewNote, true);
       }
    }
  };
  
  // PREVIEW LOGIC
  // Cache for rest previews to prevent recalculation on pitch changes
  const restPreviewCacheRef = useRef<{ key: string; result: any } | null>(null);
  
  const previewRender = useMemo(() => {
    if (!previewNote) return null;
    
    // Hide preview when there are selected notes (user is in "edit selection" mode)
    if (selection.selectedNotes && selection.selectedNotes.length > 0) return null;
    
    // Allow rendering if it's for this measure OR if it's for the next measure (overflow) and we are the last measure
    const isOverflowPreview = isLast && previewNote.measureIndex === measureIndex + 1;
    if (previewNote.measureIndex !== measureIndex && !isOverflowPreview) {
        return null;
    }
    
    // For rests, use cached result if key fields haven't changed (ignore pitch)
    if (previewNote.isRest) {
      const cacheKey = `${previewNote.measureIndex}-${previewNote.index}-${previewNote.mode}-${previewNote.duration}-${previewNote.dotted}`;
      if (restPreviewCacheRef.current && restPreviewCacheRef.current.key === cacheKey) {
        return restPreviewCacheRef.current.result;
      }
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

    const result = {
        chordNotes: combinedNotes,
        quant: 0,
        x: xPos,
        chordLayout
    };
    
    // Cache rest preview result
    if (previewNote.isRest) {
      const cacheKey = `${previewNote.measureIndex}-${previewNote.index}-${previewNote.mode}-${previewNote.duration}-${previewNote.dotted}`;
      restPreviewCacheRef.current = { key: cacheKey, result };
    }

    return result;

  }, [previewNote, events, measureIndex, layout, hitZones, eventPositions, totalWidth, clef, isLast, selection.selectedNotes]);

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
      {previewRender && !isNoteHovered && (
          <g style={{ pointerEvents: 'none' }}>
               {(() => {
                 const { chordNotes, quant, x } = previewRender;
                 
                 // Render rest preview when in REST mode
                 if (previewNote?.isRest) {
                   return (
                     <Rest
                       duration={previewNote.duration}
                       dotted={previewNote.dotted}
                       x={x}
                       baseY={baseY}
                       isGhost={true}
                     />
                   );
                 }
                 
                 // Normal note preview
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
