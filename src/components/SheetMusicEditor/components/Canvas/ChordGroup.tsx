// @ts-nocheck
import React, { useState } from 'react';
import { NOTE_TYPES, NOTE_SPACING_BASE_UNIT } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { PITCH_TO_OFFSET, getOffsetForPitch, getStemOffset } from '../../engines/layout';
import { needsAccidental } from '../../services/MusicService';
import { Note, renderFlags } from './Note';
import { getNoteDuration } from '../../utils/core';


/**
 * Renders a group of notes (chord) at a specific time.
 * Handles stemming, flags (if not beamed), and individual note rendering.
 * @param notes - Array of notes in the chord
 * @param quant - Quant position of the chord
 * @param duration - Duration type of the chord
 * @param dotted - Whether the chord is dotted
 * @param quantWidth - Width per quant (unused if x is provided)
 * @param measureIndex - Index of the measure
 * @param eventId - ID of the event
 * @param selection - Current selection state
 * @param onSelectNote - Callback to select a note
 * @param isGhost - Whether this is a ghost/preview chord
 * @param opacity - Opacity for ghost notes
 * @param renderStem - Whether to render the stem
 * @param filterNote - Optional filter to render only specific notes
 * @param x - Absolute X position
 * @param beamSpec - Beaming specification if part of a beam group
 * @param layout - Pre-calculated layout data for the chord
 */
const ChordGroup = ({
  notes,
  quant,
  duration,
  dotted,
  quantWidth,
  measureIndex,
  eventId,
  selection = {},
  onSelectNote,
  isGhost = false,
  opacity = 1,
  renderStem = true,
  filterNote = null,
  x = 0,
  beamSpec = null, // { startY, endY, startX, endX, direction } for the beam this chord belongs to
  layout, // { sortedNotes, direction, noteOffsets, maxNoteShift, minY, maxY }
  isRest = false,
  clef = 'treble',
  onDragStart,
  modifierHeld = false,
  activeDuration = null,
  activeDotted = false,
  onNoteHover = null,
  isDragging = false,
  baseY = CONFIG.baseY,
  keySignature = 'C'
}) => {
  const { theme } = useTheme();
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const { sortedNotes, direction, noteOffsets, maxNoteShift, minY, maxY } = layout;

  // No deltaY needed - staff positioning is handled by SVG transform at Staff level
  // All layout calculations use CONFIG.baseY, and Staff applies the vertical offset
   
  // Override direction if beamed
  let effectiveDirection = direction;
  if (beamSpec && beamSpec.direction) {
      effectiveDirection = beamSpec.direction;
  }

  // Use absolute X if provided, otherwise fallback (though we should always provide x now)
  const noteX = x > 0 ? x : (quant * quantWidth) + CONFIG.measurePaddingLeft;

  if (isRest) {
      // Render Whole Rest (Hanging from 2nd line)
      // Line 1 Y = baseY + CONFIG.lineHeight
      const restY = baseY + CONFIG.lineHeight;
      const restHeight = CONFIG.lineHeight / 2;
      const restWidth = 12;

      // Calculate Center
      // Measure Width = PadL + NoteW + PadR
      // NoteW = Spacing * sqrt(quants)
      const quants = getNoteDuration(duration, dotted, undefined);
      const noteWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(quants);
      
      // Center X relative to Note Start (x)
      // Center = x + NoteW/2 - (PadL - PadR)/2
      const centerOffset = (CONFIG.measurePaddingLeft - CONFIG.measurePaddingRight) / 2;
      const centerX = noteX + (noteWidth / 2) - centerOffset;
      
      return (
          <g className="rest-placeholder">
              <rect 
                  x={centerX - (restWidth / 2)} 
                  y={restY} 
                  width={restWidth} 
                  height={restHeight} 
                  fill={theme.score.note} 
              />
          </g>
      );
  }
  
  // Use shared function for stem positioning
  const stemX = noteX + getStemOffset(layout, effectiveDirection);
  
  let STEM_LENGTH = 35;
  if (duration === 'thirtysecond') STEM_LENGTH = 45;
  if (duration === 'sixtyfourth') STEM_LENGTH = 55;

  let stemStartY, stemEndY;

  if (beamSpec) {
      // Calculate stem end based on beam line
      // y = m*x + b
      // m = (y2 - y1) / (x2 - x1)
      const m = (beamSpec.endY - beamSpec.startY) / (beamSpec.endX - beamSpec.startX);
      // y at stemX - beamSpec uses same CONFIG.baseY coordinates, no offset needed
      const beamY = beamSpec.startY + m * (stemX - beamSpec.startX);

      stemEndY = beamY;

      // Stem Start is the anchor note
      if (effectiveDirection === 'up') {
          stemStartY = maxY; // Lowest note (highest Y)
      } else {
          stemStartY = minY; // Highest note (lowest Y)
      }

  } else {
      // Normal Stem Logic
      if (effectiveDirection === 'up') {
        stemStartY = maxY;
        stemEndY = minY - STEM_LENGTH;
      } else {
        stemStartY = minY;
        stemEndY = maxY + STEM_LENGTH;
      }
  }

  const isEventSelected = !isGhost && selection.measureIndex === measureIndex && selection.eventId === eventId;
  const isWholeChordSelected = isEventSelected && !selection.noteId;
  
  // Stem/Group color: Only highlight if whole chord is selected (or ghost)
  const groupColor = isGhost ? theme.accent : (isWholeChordSelected ? theme.accent : theme.score.note);

  // Filter notes if needed (for ghost note specific pitch)
  const notesToRender = filterNote 
    ? (typeof filterNote === 'function' ? sortedNotes.filter(filterNote) : sortedNotes.filter(n => n.pitch === filterNote))
    : sortedNotes;

  return (
    <g className={`chord-group ${isGhost ? 'ghost' : ''}`} opacity={opacity}>
      {/* Stem */}
      {renderStem && NOTE_TYPES[duration]?.stem && (
        <line x1={stemX} y1={stemStartY} x2={stemX} y2={stemEndY} stroke={groupColor} strokeWidth="1.5" />
      )}

      {/* Flags (Only if NOT beamed and NOT quarter/whole) */}
      {renderStem && !beamSpec && ['eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth'].includes(duration) && (
         <g transform={`translate(0, 0)`}>
             {renderFlags(stemX, stemEndY, duration, effectiveDirection, groupColor)}
         </g>
      )}

      {notesToRender.map((note, idx) => {
        const xShift = noteOffsets[note.id] || 0;
        const noteY = baseY + getOffsetForPitch(note.pitch, clef);

        return (
          <g
            key={note.id || `note-${idx}`}
            className={!isGhost ? "note-group-container" : ""}
            onMouseDown={(e) => {
                if (isGhost || !onDragStart) return;
                e.stopPropagation();
                const modifierHeld = e.metaKey || e.ctrlKey;
                onDragStart(measureIndex, eventId, note.id, note.pitch, e.clientY, modifierHeld);
            }}
            onClick={(e) => {
                // Stop click from bubbling to background click handler
                if (!isGhost) {
                    e.stopPropagation();
                }
            }}
            onMouseEnter={() => {
              if (!isGhost) {
                setHoveredNoteId(note.id);
                if (onNoteHover) onNoteHover(true);
              }
            }}
            onMouseLeave={() => {
              setHoveredNoteId(null);
              if (onNoteHover) onNoteHover(false);
            }}
            style={{ cursor: !isGhost ? (modifierHeld ? 'pointer' : 'crosshair') : 'default' }}
          >
            {/* Invisible Hit Area for easier clicking - reduced height to allow chord tone insertion */}
             <rect 
              x={noteX + xShift - 10}
              y={noteY - 8}
              width={20}
              height={16}
              fill="white"
              fillOpacity={0.01}
            />
            {/* Accidental - calculated based on key signature */}
            {(() => {
                // Calculate if accidental is needed based on key
                const accidentalInfo = needsAccidental(note.pitch, keySignature);
                // Show accidental if: key requires it OR note has explicit override accidental
                const showAccidental = accidentalInfo.show || note.accidental;
                const accidentalType = note.accidental || accidentalInfo.type;
                
                if (showAccidental && accidentalType) {
                    return (
                        <text 
                            x={noteX + xShift - 16} 
                            y={noteY + 6} 
                            fontSize="22" 
                            fontFamily="serif" 
                            fill={groupColor} 
                            textAnchor="middle"
                            style={{ userSelect: 'none' }}
                        >
                            {accidentalType === 'sharp' ? '♯' : accidentalType === 'flat' ? '♭' : '♮'}
                        </text>
                    );
                }
                return null;
            })()}

            <Note 
              quant={quant} 
              pitch={note.pitch} 
              type={duration} 
              dotted={dotted}
              isSelected={isEventSelected && (selection.noteId === note.id || !selection.noteId)} 
              quantWidth={quantWidth}
              renderStem={false} 
              xOffset={xShift}
              dotShift={maxNoteShift}
              isGhost={isGhost}
              x={noteX}
              clef={clef}
              baseY={baseY}
            />

            {/* Ghost Preview - shows what duration will be applied on click */}
            {/* Hide preview when dragging */}
            {!isGhost && !isDragging && hoveredNoteId === note.id && activeDuration && (
              <g style={{ pointerEvents: 'none' }}>
                <Note 
                  quant={quant} 
                  pitch={note.pitch} 
                  type={activeDuration} 
                  dotted={activeDotted}
                  isSelected={false} 
                  quantWidth={quantWidth}
                  renderStem={true} 
                  xOffset={xShift}
                  dotShift={maxNoteShift}
                  isGhost={true}
                  x={noteX}
                  clef={clef}
                  baseY={baseY}
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default ChordGroup;
