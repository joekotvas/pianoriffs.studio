// @ts-nocheck
import React from 'react';
import { NOTE_TYPES, LAYOUT } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { getOffsetForPitch } from '../../engines/layout';
import { NOTEHEADS, BRAVURA_FONT, getFontSize, FLAGS as SMUFL_FLAGS } from '../../constants/SMuFL';

/**
 * Helper to render flags for notes (eighth, sixteenth, etc.) using Bravura font glyphs.
 * Used by ChordGroup for flag rendering.
 * @param stemX - X position of the stem
 * @param stemTipY - Y position of the stem tip
 * @param type - Duration type (eighth, sixteenth, thirtysecond, sixtyfourth)
 * @param direction - Stem direction ('up' or 'down')
 * @param color - Color of the flags
 * @returns SVG text element with the appropriate flag glyph, or null if no flags
 */
const renderFlags = (stemX: number, stemTipY: number, type: string, direction: 'up' | 'down', color: string) => {
  // Determine flag glyph based on duration and stem direction
  const getFlagGlyph = () => {
    if (direction === 'up') {
      switch (type) {
        case 'eighth': return SMUFL_FLAGS.eighthUp;
        case 'sixteenth': return SMUFL_FLAGS.sixteenthUp;
        case 'thirtysecond': return SMUFL_FLAGS.thirtysecondUp;
        case 'sixtyfourth': return SMUFL_FLAGS.sixtyfourthUp;
        default: return null;
      }
    } else {
      switch (type) {
        case 'eighth': return SMUFL_FLAGS.eighthDown;
        case 'sixteenth': return SMUFL_FLAGS.sixteenthDown;
        case 'thirtysecond': return SMUFL_FLAGS.thirtysecondDown;
        case 'sixtyfourth': return SMUFL_FLAGS.sixtyfourthDown;
        default: return null;
      }
    }
  };
  
  const glyph = getFlagGlyph();
  if (!glyph) return null;
  
  const fontSize = getFontSize(CONFIG.lineHeight);
  
  return (
    <text
      key="flag"
      x={stemX}
      y={stemTipY}
      fontFamily={BRAVURA_FONT}
      fontSize={fontSize}
      fill={color}
      textAnchor="start"
      style={{ userSelect: 'none' }}
    >
      {glyph}
    </text>
  );
};

/**
 * Renders a single notehead with ledger lines and dots.
 * Stems are now handled by ChordGroup.
 */
const Note = ({ 
  pitch, 
  type, 
  isSelected, 
  isGhost, 
  xOffset = 0, 
  dotted = false, 
  dotShift = 0, 
  x: absoluteX, 
  clef = 'treble', 
  baseY = CONFIG.baseY 
}) => {
  const { theme } = useTheme();
  const noteConfig = NOTE_TYPES[type];
  
  const x = (absoluteX ?? 0) + xOffset;
  const yOffset = getOffsetForPitch(pitch, clef);
  const y = baseY + yOffset;

  const color = isGhost ? theme.accent : (isSelected ? theme.accent : theme.score.note); 

  const drawLedgerLines = () => {
    const lines = [];
    const relativeY = y - baseY;
    const ledgerX = x; 
    
    // Draw lines above staff
    if (relativeY < 0) {
      for (let i = -12; i >= relativeY; i -= 12) {
        lines.push(<line key={`ledger-${i}`} x1={ledgerX - LAYOUT.LEDGER_LINE_EXTENSION} y1={baseY + i} x2={ledgerX + LAYOUT.LEDGER_LINE_EXTENSION} y2={baseY + i} stroke={color} strokeWidth={LAYOUT.LINE_STROKE_WIDTH} />);
      }
    }
    // Draw lines below staff
    if (relativeY > 48) {
      for (let i = 60; i <= relativeY; i += 12) {
        lines.push(<line key={`ledger-${i}`} x1={ledgerX - LAYOUT.LEDGER_LINE_EXTENSION} y1={baseY + i} x2={ledgerX + LAYOUT.LEDGER_LINE_EXTENSION} y2={baseY + i} stroke={color} strokeWidth={LAYOUT.LINE_STROKE_WIDTH} />);
      }
    }
    return lines;
  };

  const drawDot = () => {
    if (!dotted) return null;
    let dotY = y;
    const relativeY = y - baseY;
    if (relativeY % 12 === 0) {
        dotY -= 6; // Move up to space
    }
    const dotX = x + dotShift + LAYOUT.DOT_OFFSET_X;
    return <circle cx={dotX} cy={dotY} r={LAYOUT.DOT_RADIUS} fill={color} />;
  };

  // Get the appropriate notehead glyph based on duration
  const getNoteheadGlyph = () => {
    if (type === 'whole') return NOTEHEADS.whole;
    if (type === 'half') return NOTEHEADS.half;
    return NOTEHEADS.black;
  };

  const fontSize = getFontSize(CONFIG.lineHeight);

  return (
    <g className="note-group">
      {drawLedgerLines()}
      
      {/* Notehead rendered with Bravura font */}
      <text
        x={x}
        y={y}
        fontFamily={BRAVURA_FONT}
        fontSize={fontSize}
        textAnchor="middle"
        fill={color}
        style={{ userSelect: 'none' }}
      >
        {getNoteheadGlyph()}
      </text>
      
      {drawDot()}
    </g>
  );
};

export { Note, renderFlags };
export default Note;

