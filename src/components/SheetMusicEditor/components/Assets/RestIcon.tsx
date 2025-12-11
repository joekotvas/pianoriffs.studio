// @ts-nocheck
import React from 'react';
import { REST_GLYPHS, BRAVURA_FONT } from '../../constants/SMuFL';

/**
 * Custom sizing for rest glyphs that need adjustment.
 * Rest glyphs have different vertical extents than notes.
 */
const REST_SIZING: Record<string, { y: number; fontSize: number }> = {
  whole: { y: 10, fontSize: 24 },       // Hangs from line
  half: { y: 14, fontSize: 24 },        // Sits on line
  quarter: { y: 14, fontSize: 20 },     // Centered
  eighth: { y: 14, fontSize: 20 },
  sixteenth: { y: 16, fontSize: 18 },
  thirtysecond: { y: 18, fontSize: 16 },
  sixtyfourth: { y: 20, fontSize: 14 },
};

const DEFAULT_SIZING = { y: 14, fontSize: 20 };

/**
 * Renders rest glyphs for toolbar display using Bravura font.
 * 
 * @param props.type - Duration type (whole, half, quarter, etc.)
 * @param props.color - Fill color for the glyph
 */
const RestIcon = ({ type, color = "currentColor" }: { type: string; color?: string }) => {
  const glyph = REST_GLYPHS[type] || REST_GLYPHS.quarter;
  const sizing = REST_SIZING[type] || DEFAULT_SIZING;
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <text
        x={12}
        y={sizing.y}
        fontFamily={BRAVURA_FONT}
        fontSize={sizing.fontSize}
        fill={color}
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {glyph}
      </text>
    </svg>
  );
};

export default RestIcon;
