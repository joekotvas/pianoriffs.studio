import React from 'react';
import { LAYOUT } from '../../constants';
import { CONFIG } from '../../config';
import { BRAVURA_FONT, getFontSize } from '../../constants/SMuFL';

/**
 * Renders the stem line for a chord.
 */
export const ChordStem = ({ x, startY, endY, color }: { x: number, startY: number, endY: number, color: string }) => (
  <line x1={x} y1={startY} x2={x} y2={endY} stroke={color} strokeWidth={LAYOUT.LINE_STROKE_WIDTH} />
);

/**
 * Renders an accidental symbol using Bravura font glyphs.
 * @param symbol - The Bravura glyph for the accidental (from ACCIDENTALS constants)
 */
export const ChordAccidental = ({ x, y, symbol, color }: { x: number, y: number, symbol: string | null, color: string }) => {
  if (!symbol) return null;
  
  // Use SMuFL font sizing for consistent typography with noteheads
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
 * Invisible hit area for easier clicking on notes.
 * Placed on top of other elements to capture events.
 */
export const NoteHitArea = ({ x, y, onClick, onMouseDown, onDoubleClick, cursor, ...rest }: { 
    x: number, 
    y: number, 
    onClick: (e: React.MouseEvent) => void, 
    onMouseDown: (e: React.MouseEvent) => void, 
    onDoubleClick?: (e: React.MouseEvent) => void, 
    cursor: string,
    'data-testid'?: string
}) => (
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
    data-testid={rest['data-testid']}
  />
);
