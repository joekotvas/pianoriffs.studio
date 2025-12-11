// @ts-nocheck
import React from 'react';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { REST_GLYPHS, BRAVURA_FONT, getFontSize, DOTS } from '../../constants/SMuFL';
import { LAYOUT } from '../../constants';

interface RestProps {
  duration: string;
  dotted?: boolean;
  x?: number;
  quant?: number;
  baseY?: number;
  noteX?: number; // Pre-calculated x-position if available
}

/**
 * Y-offset for each rest type, relative to baseY (top of staff).
 * In standard notation:
 * - Whole rest hangs from the 4th line (line index 1, at baseY + lineHeight)
 * - Half rest sits on the 3rd line (line index 2, at baseY + 2*lineHeight)
 * - Quarter/Eighth/Sixteenth rests are centered vertically on the staff
 */
const getRestY = (duration: string, baseY: number): number => {
  const lineHeight = CONFIG.lineHeight;
  const staffMiddle = baseY + lineHeight * 2; // Middle line (3rd line)
  
  switch (duration) {
    case 'whole':
      // Whole rest hangs from line 2 (the 4th line from bottom)
      return baseY + lineHeight;
    case 'half':
      // Half rest sits on line 3 (the middle line)
      return baseY + lineHeight * 2;
    default:
      // Quarter, eighth, sixteenth, etc. are centered on the staff
      return staffMiddle;
  }
};

/**
 * Renders a rest symbol using Bravura font glyphs.
 * @param {Object} props
 * @param {string} props.duration - Duration of the rest (whole, half, quarter, eighth, etc.)
 * @param {boolean} props.dotted - Whether the rest is dotted
 * @param {number} props.x - X position for the rest
 * @param {number} props.baseY - Y-offset for the staff (top line)
 */
export const Rest = ({
  duration,
  dotted = false,
  x = 0,
  baseY = CONFIG.baseY
}: RestProps) => {
  const { theme } = useTheme();
  
  // Get the appropriate glyph for this rest duration
  const glyph = REST_GLYPHS[duration];
  if (!glyph) {
    // Fallback: render nothing if unknown duration
    console.warn(`Unknown rest duration: ${duration}`);
    return null;
  }
  
  // Position rest at x (passed from layout engine) or at measure padding
  const finalX = x > 0 ? x : CONFIG.measurePaddingLeft;
  const restY = getRestY(duration, baseY);
  
  // Font size based on staff space (SMuFL: 1 staff space = 0.25em)
  const fontSize = getFontSize(CONFIG.lineHeight);
  
  // Dot positioning for dotted rests
  const renderDot = () => {
    if (!dotted) return null;
    // Position dot to the right of the rest, in a space
    const dotX = finalX + fontSize * 0.4; // Roughly half a glyph width to the right
    const dotY = restY - CONFIG.lineHeight / 2; // Move up to a space for visibility
    return (
      <text
        x={dotX}
        y={dotY}
        fontFamily={BRAVURA_FONT}
        fontSize={fontSize}
        textAnchor="start"
        fill={theme.score.note}
        style={{ userSelect: 'none' }}
      >
        {DOTS.augmentationDot}
      </text>
    );
  };
  
  return (
    <g className="rest-group">
      <text
        x={finalX}
        y={restY}
        fontFamily={BRAVURA_FONT}
        fontSize={fontSize}
        textAnchor="middle"
        fill={theme.score.note}
        style={{ userSelect: 'none' }}
      >
        {glyph}
      </text>
      {renderDot()}
    </g>
  );
};
