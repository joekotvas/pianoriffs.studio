// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import { NOTE_TYPES } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { getStemOffset } from '@/engines/layout';
import { calculateStemGeometry } from '@/engines/layout/stems';
import { getAccidentalGlyph } from '@/services/MusicService';
import { isNoteSelected, areAllNotesSelected } from '@/utils/selection';

// Visual Components
import Note from './Note';
import Stem from './Stem';
import Flags from './Flags';

// =============================================================================
// CHORD GROUP COMPONENT
// =============================================================================

/**
 * Renders a chord (group of notes) with shared stem and flags.
 *
 * Hierarchy:
 * ChordGroup
 * ├── Stem (shared vertical line)
 * ├── Flags (if unbeamed 8th/16th/etc)
 * └── Note[] (one per pitch)
 *     ├── NoteHead, Accidental, Dot, LedgerLines, HitArea
 */
const ChordGroup = ({
  // Data
  notes,
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
  onNoteHover = null,
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
  const stemX = useMemo(
    () => x + getStemOffset(chordLayout, effectiveDirection),
    [x, chordLayout, effectiveDirection]
  );

  const { startY: stemStartY, endY: stemEndY } = useMemo(
    () =>
      calculateStemGeometry({
        beamSpec,
        stemX,
        direction: effectiveDirection,
        minY,
        maxY,
        duration,
      }),
    [beamSpec, stemX, effectiveDirection, minY, maxY, duration]
  );

  // --- 2. Selection & Lasso Preview State ---
  const isWholeChordSelected =
    !isGhost && areAllNotesSelected(selection, staffIndex, measureIndex, eventId, notes);
  const isAnyNoteHovered = !isGhost && !isDragging && hoveredNoteId !== null;

  // Check if entire chord is in lasso preview (all notes must be in preview)
  const isWholeChordInLassoPreview =
    !isGhost &&
    interaction.lassoPreviewIds?.size > 0 &&
    notes.every((note) => {
      const noteKey = `${staffIndex}-${measureIndex}-${eventId}-${note.id}`;
      return interaction.lassoPreviewIds?.has(noteKey);
    });

  // Color: Ghost/Selected/Hovered/LassoPreview -> Accent; Default -> Note Color
  const groupColor =
    isGhost || isWholeChordSelected || isAnyNoteHovered || isWholeChordInLassoPreview
      ? theme.accent
      : theme.score.note;

  // Filter Notes (if needed)
  const notesToRender = useMemo(() => {
    if (!filterNote) return sortedNotes;
    return typeof filterNote === 'function'
      ? sortedNotes.filter(filterNote)
      : sortedNotes.filter((n) => n.pitch === filterNote);
  }, [sortedNotes, filterNote]);

  // --- 3. Interaction Handlers ---
  const handlers = useMemo(
    () => ({
      onMouseEnter: (id) => {
        if (isGhost) return;
        setHoveredNoteId(id);
        onNoteHover?.(true);
      },
      onMouseLeave: () => {
        setHoveredNoteId(null);
        onNoteHover?.(false);
      },
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
          staffIndex,
        });
      },
      onDoubleClick: (e, note) => {
        if (isGhost || !onSelectNote) return;
        e.stopPropagation();
        onSelectNote(measureIndex, eventId, note.id, staffIndex, false, false);
      },
    }),
    [isGhost, onDragStart, onSelectNote, onNoteHover, measureIndex, eventId, staffIndex]
  );

  // Click on the Chord (stem area)
  const handleGroupClick = useCallback(
    (e) => {
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
        staffIndex,
      });
    },
    [isGhost, onDragStart, measureIndex, eventId, staffIndex, notes]
  );

  // --- 4. Render Decisions ---
  const showStem = renderStem && NOTE_TYPES[duration]?.stem;
  const showFlags =
    renderStem &&
    !beamSpec &&
    ['eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth'].includes(duration);

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
      {/* LAYER 1: Stem */}
      {showStem && <Stem x={stemX} startY={stemStartY} endY={stemEndY} color={groupColor} />}

      {/* LAYER 2: Flags (unbeamed notes only) */}
      {showFlags && (
        <Flags
          stemX={stemX}
          stemTipY={stemEndY}
          duration={duration}
          direction={effectiveDirection}
          color={groupColor}
        />
      )}

      {/* LAYER 3: Notes */}
      {notesToRender.map((note) => {
        const accidentalGlyph = getAccidentalGlyph(
          note.pitch,
          keySignature,
          accidentalOverrides?.[note.id]
        );

        const isSelected = isNoteSelected(selection, {
          staffIndex,
          measureIndex,
          eventId,
          noteId: note.id,
        });

        // Check if note is in lasso preview (O(1) Set lookup)
        const noteKey = `${staffIndex}-${measureIndex}-${eventId}-${note.id}`;
        const isInLassoPreview = interaction.lassoPreviewIds?.has(noteKey) ?? false;

        return (
          <Note
            key={note.id}
            note={note}
            duration={duration}
            dotted={dotted}
            x={x}
            baseY={baseY}
            clef={clef}
            xShift={noteOffsets[note.id] || 0}
            dotShift={maxNoteShift}
            isSelected={isSelected || isAnyNoteHovered}
            isPreview={isInLassoPreview}
            isGhost={isGhost}
            accidentalGlyph={accidentalGlyph}
            handlers={handlers}
          />
        );
      })}
    </g>
  );
};

export default ChordGroup;
