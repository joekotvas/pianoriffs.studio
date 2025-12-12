// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import { NOTE_TYPES, LAYOUT } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { getOffsetForPitch, getStemOffset } from '../../engines/layout';
import { calculateStemGeometry } from '../../engines/layout/stems';
import { needsAccidental } from '../../services/MusicService';
import { isNoteSelected, areAllNotesSelected } from '../../utils/selection';
import { ACCIDENTALS } from '../../constants/SMuFL';

// Visual Components
import { Note, renderFlags } from './Note';
import { ChordStem, ChordAccidental, NoteHitArea } from './ChordComponents';

// --- Helper: Accidental Logic ---

const getAccidentalGlyph = (note, keySignature, overrideSymbol) => {
  // 1. Check for manual override from context (e.g., user forcing an accidental)
  if (overrideSymbol !== undefined) {
    // If explicitly null/undefined in override map, it might mean "force hide", 
    // but usually override maps contain the symbol string or null.
    // Based on original logic: if key exists, use value.
    return overrideSymbol;
  }

  // 2. Fallback to Music Theory (Standard Notation)
  const info = needsAccidental(note.pitch, keySignature);
  if (!info.show || !info.type) return null;

  const map = {
    sharp: ACCIDENTALS.sharp,
    flat: ACCIDENTALS.flat,
    natural: ACCIDENTALS.natural,
  };
  return map[info.type] || null;
};

// --- Sub-Component: Single Note Renderer ---
// Handles the positioning and interaction of one specific note head in the stack
const ChordNote = React.memo(({
  note,
  baseX,
  baseY,
  clef,
  xShift,
  maxNoteShift,
  quant,
  duration,
  dotted,
  isGhost,
  color,
  isSelected,
  accidentalGlyph,
  handlers // { onMouseDown, onDoubleClick, onMouseEnter, onMouseLeave }
}) => {
  const noteY = baseY + getOffsetForPitch(note.pitch, clef);

  return (
    <g
      className={!isGhost ? "note-group-container" : ""}
      onMouseEnter={() => handlers.onMouseEnter(note.id)}
      onMouseLeave={handlers.onMouseLeave}
    >
      {/* 1. Accidental */}
      <ChordAccidental
        x={baseX + xShift + LAYOUT.ACCIDENTAL.OFFSET_X}
        y={noteY + LAYOUT.ACCIDENTAL.OFFSET_Y}
        symbol={accidentalGlyph}
        color={color}
      />

      {/* 2. Note Head (Non-Interactive Visual) */}
      <g style={{ pointerEvents: 'none' }}>
        <Note
          quant={quant}
          pitch={note.pitch}
          type={duration}
          dotted={dotted}
          isSelected={isSelected}
          quantWidth={0}
          renderStem={false}
          xOffset={xShift}
          dotShift={maxNoteShift}
          isGhost={isGhost}
          x={baseX}
          clef={clef}
          baseY={baseY}
        />
      </g>

      {/* 3. Hit Area (Interactive Layer) */}
      <NoteHitArea
        x={baseX + xShift + LAYOUT.HIT_AREA.OFFSET_X}
        y={noteY + LAYOUT.HIT_AREA.OFFSET_Y}
        cursor={!isGhost ? 'pointer' : 'default'}
        onClick={(e) => !isGhost && e.stopPropagation()}
        onMouseDown={(e) => handlers.onMouseDown(e, note)}
        onDoubleClick={(e) => handlers.onDoubleClick(e, note)}
        data-testid={`note-${note.id}`}
      />
    </g>
  );
});

// --- Main Component ---

const ChordGroup = ({
  // Data
  notes,
  quant,
  duration,
  dotted,
  measureIndex,
  eventId,
  chordLayout,
  beamSpec = null,
  
  // Appearance & Options
  isGhost = false,
  opacity = 1,
  renderStem = true,
  x = 0,
  filterNote = null,
  accidentalOverrides = null,

  // Contexts
  layout,
  interaction,
  onNoteHover = null, // Local callback
}) => {
  const { theme } = useTheme();
  const { baseY, clef, keySignature, staffIndex } = layout;
  const { selection, onDragStart, onSelectNote, isDragging } = interaction;
  
  // Local State
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  // --- 1. Layout Calculations ---
  const { sortedNotes, direction, noteOffsets, maxNoteShift, minY, maxY } = chordLayout;
  const effectiveDirection = beamSpec?.direction || direction;
  
  // Stem Geometry
  const stemX = useMemo(() => 
    x + getStemOffset(chordLayout, effectiveDirection), 
    [x, chordLayout, effectiveDirection]
  );
  
  const { startY: stemStartY, endY: stemEndY } = useMemo(() => 
    calculateStemGeometry({ beamSpec, stemX, direction: effectiveDirection, minY, maxY, duration }),
    [beamSpec, stemX, effectiveDirection, minY, maxY, duration]
  );

  // --- 2. Selection State ---
  const isWholeChordSelected = !isGhost && areAllNotesSelected(selection, staffIndex, measureIndex, eventId, notes);
  const isAnyNoteHovered = !isGhost && !isDragging && hoveredNoteId !== null;
  
  // Determine Color: Ghost -> Accent; Selected/Hovered -> Accent; Default -> Note Color
  const groupColor = (isGhost || isWholeChordSelected || isAnyNoteHovered) 
    ? theme.accent 
    : theme.score.note;

  // Filter Notes (if needed)
  const notesToRender = useMemo(() => {
    if (!filterNote) return sortedNotes;
    return typeof filterNote === 'function' 
      ? sortedNotes.filter(filterNote) 
      : sortedNotes.filter(n => n.pitch === filterNote);
  }, [sortedNotes, filterNote]);


  // --- 3. Interaction Handlers ---
  
  const handlers = useMemo(() => ({
    onMouseEnter: (id) => {
      if (isGhost) return;
      setHoveredNoteId(id);
      onNoteHover?.(true);
    },
    onMouseLeave: () => {
      setHoveredNoteId(null);
      onNoteHover?.(false);
    },
    // Click on specific Note Head
    onMouseDown: (e, note) => {
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
        isShift: isShift,
        selectAllInEvent: !isModifier && !isShift,
        staffIndex
      });
    },
    // Double Click (Drill down selection)
    onDoubleClick: (e, note) => {
      if (isGhost || !onSelectNote) return;
      e.stopPropagation();
      onSelectNote(measureIndex, eventId, note.id, staffIndex, false, false);
    }
  }), [isGhost, onDragStart, onSelectNote, onNoteHover, measureIndex, eventId, staffIndex]);

  // Click on the Chord Stem/Group Background
  const handleGroupClick = useCallback((e) => {
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
      selectAllInEvent: !isModifier,
      staffIndex
    });
  }, [isGhost, onDragStart, measureIndex, eventId, staffIndex, notes]);


  // --- 4. Render ---
  
  const showFlags = renderStem && !beamSpec && ['eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth'].includes(duration);
  const showStem = renderStem && NOTE_TYPES[duration]?.stem;

  return (
    <g
      className={`chord-group ${isGhost ? 'opacity-50' : ''}`}
      data-testid={isGhost ? 'ghost-note' : `chord-${eventId}`}
      data-selected={isWholeChordSelected}
      style={{ opacity }}
      onMouseEnter={() => onNoteHover?.(true)}
      onMouseLeave={() => onNoteHover?.(false)}
      onClick={handleGroupClick}
    >
      {/* LAYER 1: Stem & Flags */}
      {showStem && (
        <ChordStem x={stemX} startY={stemStartY} endY={stemEndY} color={groupColor} />
      )}
      {showFlags && (
        <g>{renderFlags(stemX, stemEndY, duration, effectiveDirection, groupColor)}</g>
      )}

      {/* LAYER 2: Note Heads */}
      {notesToRender.map((note) => {
        const accidentalGlyph = getAccidentalGlyph(
          note, 
          keySignature, 
          accidentalOverrides?.[note.id]
        );

        const isSelected = isNoteSelected(selection, {
          staffIndex,
          measureIndex,
          eventId,
          noteId: note.id,
        });

        return (
          <ChordNote
            key={note.id}
            note={note}
            baseX={x}
            baseY={baseY}
            clef={clef}
            xShift={noteOffsets[note.id] || 0}
            maxNoteShift={maxNoteShift}
            quant={quant}
            duration={duration}
            dotted={dotted}
            isGhost={isGhost}
            color={groupColor}
            isSelected={isSelected || isAnyNoteHovered}
            accidentalGlyph={accidentalGlyph}
            handlers={handlers}
          />
        );
      })}
    </g>
  );
};

export default ChordGroup;
