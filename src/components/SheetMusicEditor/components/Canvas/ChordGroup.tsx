// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import { NOTE_TYPES, LAYOUT } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { getOffsetForPitch, getStemOffset } from '../../engines/layout';
import { calculateStemGeometry } from '../../engines/layout/stems';
import { needsAccidental } from '../../services/MusicService';
import { Note, renderFlags } from './Note';
import { ChordStem, ChordAccidental, NoteHitArea } from './ChordComponents';
import { isNoteSelected, areAllNotesSelected } from '../../utils/selection';

// --- Helper Functions (Pure Logic) ---

/**
 * Determines accidental symbol to render for a given note.
 * @param {Object} note - The note object
 * @param {string} keySignature - The key signature of the measure
 * @returns {string|null} The accidental symbol (♯, ♭, ♮) or null if none needed
 */
const getAccidentalSymbol = (note, keySignature) => {
  const info = needsAccidental(note.pitch, keySignature);
  const show = info.show || note.accidental;
  const type = note.accidental || info.type;

  if (!show || !type) return null;
  
  const map = { sharp: '♯', flat: '♭', natural: '♮' };
  return map[type] || null;
};

// --- Main Component ---

/**
 * Renders a group of notes (chord) at a specific time.
 * Handles stemming, flags (if not beamed), and individual note rendering.
 * 
 * @param {Object} props
 * @param {Array} props.notes - Array of notes in the chord
 * @param {number} props.quant - Quant position of the chord
 * @param {string} props.duration - Duration type of the chord
 * @param {boolean} props.dotted - Whether the chord is dotted
 * @param {number} props.measureIndex - Index of the measure
 * @param {string} props.eventId - ID of the event
 * @param {boolean} props.isGhost - Whether this is a ghost/preview chord
 * @param {number} props.opacity - Opacity for ghost notes
 * @param {boolean} props.renderStem - Whether to render the stem
 * @param {Function|string} props.filterNote - Optional filter to render only specific notes
 * @param {number} props.x - Absolute X position
 * @param {Object} props.beamSpec - Beaming specification if part of a beam group
 * @param {Object} props.chordLayout - Pre-calculated layout data for the chord
 * 
 * @param {Object} props.layout - Global Layout Config { baseY, clef, keySignature }
 * @param {Object} props.interaction - Interaction State { selection, activeDuration, etc }
 */
const ChordGroup = ({
  // Identity/Data
  notes,
  quant,
  duration,
  dotted,
  measureIndex,
  eventId,
  isGhost = false,
  x = 0,
  beamSpec = null,
  chordLayout, // Renamed from 'layout' to avoid collision with context layout
  
  // Contexts
  layout,       // Global Layout Config { baseY, clef, keySignature }
  interaction,  // Interaction State { selection, activeDuration, etc }

  // Render Options
  opacity = 1,
  renderStem = true,
  filterNote = null,
  onNoteHover = null, // Local callback
}) => {
  const { theme } = useTheme();
  
  // Destructure contexts
  const { baseY, clef, keySignature, staffIndex } = layout;
  const { 
    selection, 
    onDragStart,
    onSelectNote, 
    modifierHeld, 
    activeDuration, 
    isDotted: activeDotted, 
    isDragging 
  } = interaction;

  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  
  // Use chordLayout for internal positioning
  const { sortedNotes, direction, noteOffsets, maxNoteShift, minY, maxY } = chordLayout;

  // 1. Derived State & Calculations
  const effectiveDirection = beamSpec?.direction || direction;
  
  // X Position Calculation
  // We assume x is always provided by layout engine. Fallback to 0 if missing.
  const noteX = x;

  const stemX = useMemo(() => 
    noteX + getStemOffset(chordLayout, effectiveDirection), 
  [noteX, chordLayout, effectiveDirection]);

  const { startY: stemStartY, endY: stemEndY } = useMemo(() => 
    calculateStemGeometry({ beamSpec, stemX, direction: effectiveDirection, minY, maxY, duration }),
  [beamSpec, stemX, effectiveDirection, minY, maxY, duration]);

  // Selection Logic
  const isEventSelected = !isGhost && selection.measureIndex === measureIndex && selection.eventId === eventId;
  const isWholeChordSelected = !isGhost && areAllNotesSelected(selection, staffIndex, measureIndex, eventId, notes);
  const groupColor = isGhost ? theme.accent : (isWholeChordSelected ? theme.accent : theme.score.note);

  // Filter Logic
  const notesToRender = useMemo(() => {
    if (!filterNote) return sortedNotes;
    // ... logic same as before
    return typeof filterNote === 'function' 
      ? sortedNotes.filter(filterNote) 
      : sortedNotes.filter(n => n.pitch === filterNote);
  }, [sortedNotes, filterNote]);

  // 2. Event Handlers
  const handleMouseEnter = useCallback((id) => {
    if (isGhost) return;
    setHoveredNoteId(id);
    onNoteHover?.(true);
  }, [isGhost, onNoteHover]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNoteId(null);
    onNoteHover?.(false);
  }, [onNoteHover]);

  // Single Click: Select ALL notes in the event (whole chord)
  // Shift+Click: Range select from anchor to clicked note
  const handleNoteMouseDown = useCallback((e, note) => {
    if (isGhost || !onDragStart) return;
    e.stopPropagation();
    const isModifier = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    onDragStart({
        measureIndex, 
        eventId, 
        noteId: note.id, 
        startPitch: note.pitch, 
        startY: e.clientY, 
        isMulti: isModifier,
        isShift: isShift, // For range selection
        selectAllInEvent: !isModifier && !isShift, // Select all unless modifier or shift held
        staffIndex: staffIndex
    });
  }, [isGhost, onDragStart, measureIndex, eventId, staffIndex]);

  // Double Click: Select ONLY the clicked note (drill down) - NO drag
  const handleNoteDoubleClick = useCallback((e, note) => {
    if (isGhost || !onSelectNote) return;
    e.stopPropagation();
    // Use onSelectNote directly to select single note without triggering drag
    onSelectNote(measureIndex, eventId, note.id, staffIndex, false, false);
  }, [isGhost, onSelectNote, measureIndex, eventId, staffIndex]);

  // Clicking the chord group background (stem area)
  const handleChordClick = useCallback((e) => {
    if (isGhost || !onDragStart) return;
    e.stopPropagation();
    const isModifier = e.metaKey || e.ctrlKey;
    onDragStart({
        measureIndex, 
        eventId, 
        noteId: notes[0]?.id, 
        startPitch: null, 
        startY: e.clientY, 
        isMulti: isModifier,
        selectAllInEvent: !isModifier, // Select all notes when clicking stem
        staffIndex: staffIndex
    });
  }, [isGhost, onDragStart, measureIndex, eventId, staffIndex, notes]);


  // 3. Render
  const shouldRenderFlags = renderStem && !beamSpec && ['eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth'].includes(duration);
  const hasStem = renderStem && NOTE_TYPES[duration]?.stem;

  return (
    <g 
      className={`chord-group ${isGhost ? 'opacity-50' : ''}`}
      data-testid={isGhost ? 'ghost-note' : `chord-${eventId}`}
      data-selected={isWholeChordSelected}
      style={{ opacity }}
      onMouseEnter={() => onNoteHover?.(true)}
      onMouseLeave={() => onNoteHover?.(false)}
      onClick={handleChordClick}
    >
      
      {/* Stem */}
      {hasStem && (
        <ChordStem x={stemX} startY={stemStartY} endY={stemEndY} color={groupColor} />
      )}

      {/* Flags */}
      {shouldRenderFlags && (
        <g>{renderFlags(stemX, stemEndY, duration, effectiveDirection, groupColor)}</g>
      )}

      {/* Individual Notes */}
      {notesToRender.map((note, idx) => {
        const xShift = noteOffsets[note.id] || 0;
        const noteY = baseY + getOffsetForPitch(note.pitch, clef);
        const accidentalSymbol = getAccidentalSymbol(note, keySignature);
        const isHovered = !isGhost && !isDragging && hoveredNoteId === note.id;
        const noteSelected = isNoteSelected(selection, { 
            staffIndex, // Use the actual staffIndex from layout, not selection.staffIndex
            measureIndex,
            eventId,
            noteId: note.id
        });
        
        // Ghost Preview Logic
        const showPreview = isHovered && activeDuration;

        return (
          <g
            key={note.id || `note-${idx}`}
            className={!isGhost ? "note-group-container" : ""}
            onMouseEnter={() => handleMouseEnter(note.id)}
            onMouseLeave={handleMouseLeave}
          >
            <ChordAccidental 
              x={noteX + xShift + LAYOUT.ACCIDENTAL.OFFSET_X}
              y={noteY + LAYOUT.ACCIDENTAL.OFFSET_Y}
              symbol={accidentalSymbol}
              color={groupColor}
            />

            <g style={{ pointerEvents: 'none' }}>
              <Note 
                quant={quant} 
                pitch={note.pitch} 
                type={duration} 
                dotted={dotted}
                isSelected={noteSelected} 
                quantWidth={0}
                renderStem={false} 
                xOffset={xShift}
                dotShift={maxNoteShift}
                isGhost={isGhost}
                x={noteX}
                clef={clef}
                baseY={baseY}
              />
            </g>

            {/* Note Duration Preview (Ghost on Hover) */}
            {showPreview && (
              <g style={{ pointerEvents: 'none' }}>
                <Note 
                  quant={quant} 
                  pitch={note.pitch} 
                  type={activeDuration} 
                  dotted={activeDotted}
                  isSelected={false} 
                  quantWidth={0}
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

            {/* Hit Area - Must be LAST to sit on top of everything */}
            <NoteHitArea 
              x={noteX + xShift + LAYOUT.HIT_AREA.OFFSET_X}
              y={noteY + LAYOUT.HIT_AREA.OFFSET_Y}
              cursor={!isGhost ? (modifierHeld ? 'pointer' : 'crosshair') : 'default'}
              onClick={(e) => !isGhost && e.stopPropagation()}
              onMouseDown={(e) => handleNoteMouseDown(e, note)}
              onDoubleClick={(e) => handleNoteDoubleClick(e, note)}
              data-testid={`note-${note.id}`}
            />
          </g>
        );
      })}
    </g>
  );
};
export default ChordGroup;
