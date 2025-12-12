// @ts-nocheck
import React from 'react';
import { NOTE_TYPES, LAYOUT } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { getOffsetForPitch } from '../../engines/layout';
import { NOTEHEADS, BRAVURA_FONT, getFontSize, DOTS } from '../../constants/SMuFL';

// =============================================================================
// SUB-COMPONENTS (Internal to Note)
// =============================================================================

/**
 * Renders the notehead glyph (whole, half, or black).
 */
const NoteHead = ({ x, y, duration, color }) => {
  const getGlyph = () => {
    if (duration === 'whole') return NOTEHEADS.whole;
    if (duration === 'half') return NOTEHEADS.half;
    return NOTEHEADS.black;
  };

  const fontSize = getFontSize(CONFIG.lineHeight);

  return (
    <text
      x={x}
      y={y}
      fontFamily={BRAVURA_FONT}
      fontSize={fontSize}
      textAnchor="middle"
      fill={color}
      style={{ userSelect: 'none' }}
    >
      {getGlyph()}
    </text>
  );
};

/**
 * Renders the accidental symbol using Bravura font glyphs.
 */
const Accidental = ({ x, y, symbol, color }) => {
  if (!symbol) return null;

  const fontSize = getFontSize(CONFIG.lineHeight);

  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={BRAVURA_FONT}
      fill={color}
      textAnchor="middle"
      style={{ userSelect: 'none' }}
    >
      {symbol}
    </text>
  );
};

/**
 * Renders the augmentation dot.
 */
const Dot = ({ x, y, color }) => {
  const fontSize = getFontSize(CONFIG.lineHeight);

  return (
    <text
      x={x}
      y={y}
      fontFamily={BRAVURA_FONT}
      fontSize={fontSize}
      fill={color}
      textAnchor="start"
      style={{ userSelect: 'none' }}
    >
      {DOTS.augmentationDot}
    </text>
  );
};

/**
 * Renders ledger lines above or below the staff.
 */
const LedgerLines = ({ x, y, baseY, color }) => {
  const lines = [];
  const relativeY = y - baseY;

  // Lines above staff
  if (relativeY < 0) {
    for (let i = -12; i >= relativeY; i -= 12) {
      lines.push(
        <line
          key={`ledger-${i}`}
          x1={x - LAYOUT.LEDGER_LINE_EXTENSION}
          y1={baseY + i}
          x2={x + LAYOUT.LEDGER_LINE_EXTENSION}
          y2={baseY + i}
          stroke={color}
          strokeWidth={LAYOUT.LINE_STROKE_WIDTH}
        />
      );
    }
  }

  // Lines below staff
  if (relativeY > 48) {
    for (let i = 60; i <= relativeY; i += 12) {
      lines.push(
        <line
          key={`ledger-${i}`}
          x1={x - LAYOUT.LEDGER_LINE_EXTENSION}
          y1={baseY + i}
          x2={x + LAYOUT.LEDGER_LINE_EXTENSION}
          y2={baseY + i}
          stroke={color}
          strokeWidth={LAYOUT.LINE_STROKE_WIDTH}
        />
      );
    }
  }

  return <>{lines}</>;
};

/**
 * Invisible hit area for easier clicking on notes.
 */
const HitArea = ({ x, y, cursor, onClick, onMouseDown, onDoubleClick, testId }) => (
  <rect
    x={x}
    y={y}
    width={LAYOUT.HIT_AREA.WIDTH}
    height={LAYOUT.HIT_AREA.HEIGHT}
    fill="white"
    fillOpacity={0.01}
    style={{ cursor }}
    onClick={onClick}
    onMouseDown={onMouseDown}
    onDoubleClick={onDoubleClick}
    data-testid={testId}
  />
);

// =============================================================================
// MAIN NOTE COMPONENT
// =============================================================================

/**
 * Renders a complete note with all its visual elements:
 * - NoteHead (glyph)
 * - Accidental
 * - Dot
 * - LedgerLines
 * - HitArea (interaction layer)
 * 
 * This is the primary building block used by ChordGroup.
 */
const Note = React.memo(({
  // Note data
  note,
  pitch, // Alternative to note.pitch for simpler use cases
  duration,
  dotted = false,
  
  // Positioning
  x,
  baseY,
  clef,
  xShift = 0,
  dotShift = 0,
  
  // Appearance
  isSelected = false,
  isGhost = false,
  accidentalGlyph = null,
  color: overrideColor = null,
  
  // Interaction handlers (optional for interactive notes)
  handlers = null, // { onMouseEnter, onMouseLeave, onMouseDown, onDoubleClick }
}) => {
  const { theme } = useTheme();
  
  // Resolve pitch from either direct prop or note object
  const effectivePitch = pitch || note?.pitch;
  if (!effectivePitch) return null;
  
  // Calculate position
  const noteX = x + xShift;
  const noteY = baseY + getOffsetForPitch(effectivePitch, clef);
  
  // Determine color
  const color = overrideColor || (isGhost ? theme.accent : (isSelected ? theme.accent : theme.score.note));
  
  // Dot Y position (move up if on a line)
  const relativeY = noteY - baseY;
  const dotY = relativeY % 12 === 0 ? noteY - 6 : noteY;
  const dotX = noteX + dotShift + LAYOUT.DOT_OFFSET_X;
  
  // Accidental position
  const accidentalX = noteX + LAYOUT.ACCIDENTAL.OFFSET_X;
  const accidentalY = noteY + LAYOUT.ACCIDENTAL.OFFSET_Y;
  
  // Hit area position
  const hitX = noteX + LAYOUT.HIT_AREA.OFFSET_X;
  const hitY = noteY + LAYOUT.HIT_AREA.OFFSET_Y;
  
  // Note ID for hit area test ID
  const noteId = note?.id || 'note';
  
  return (
    <g
      className={!isGhost ? "note-group-container" : ""}
      onMouseEnter={() => handlers?.onMouseEnter?.(note?.id)}
      onMouseLeave={handlers?.onMouseLeave}
    >
      {/* 1. Ledger Lines (behind everything) */}
      <LedgerLines x={noteX} y={noteY} baseY={baseY} color={color} />
      
      {/* 2. Accidental */}
      <Accidental x={accidentalX} y={accidentalY} symbol={accidentalGlyph} color={color} />
      
      {/* 3. Note Head */}
      <g style={{ pointerEvents: 'none' }}>
        <NoteHead x={noteX} y={noteY} duration={duration} color={color} />
      </g>
      
      {/* 4. Dot */}
      {dotted && <Dot x={dotX} y={dotY} color={color} />}
      
      {/* 5. Hit Area (on top for interaction) */}
      {handlers && (
        <HitArea
          x={hitX}
          y={hitY}
          cursor={!isGhost ? 'pointer' : 'default'}
          onClick={(e) => !isGhost && e.stopPropagation()}
          onMouseDown={(e) => handlers.onMouseDown?.(e, note)}
          onDoubleClick={(e) => handlers.onDoubleClick?.(e, note)}
          testId={`note-${noteId}`}
        />
      )}
    </g>
  );
});

// Also export sub-components for special use cases
export { NoteHead, Accidental, Dot, LedgerLines, HitArea };
export default Note;
