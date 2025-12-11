// @ts-nocheck
import React from 'react';
import { REST_TYPES, LAYOUT } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { REST_GLYPHS } from '../Assets/RestGlyphs';

interface RestProps {
  duration: string;
  dotted?: boolean;
  x?: number;
  baseY?: number;
}

/**
 * Renders a rest symbol using SVG path glyphs.
 * Positioning follows standard engraving rules:
 * - Whole rest: Hangs from line 2
 * - Half rest: Sits on line 3
 * - Quarter and shorter: Vertically centered on staff
 */
export const Rest = ({
  duration,
  dotted = false,
  x = 0,
  baseY = CONFIG.baseY
}: RestProps) => {
  const { theme } = useTheme();

  // Get configuration for this rest duration
  const config = REST_TYPES[duration] || REST_TYPES.quarter;
  const pathData = REST_GLYPHS[duration] || REST_GLYPHS.quarter;

  // Calculate vertical position
  // offsetY is relative to staff center (line 3)
  const staffCenterY = baseY + (CONFIG.lineHeight * 2); // Line 3
  const y = staffCenterY + config.offsetY;

  // Render dot if dotted
  const renderDot = () => {
    if (!dotted) return null;
    // Position dot to the right of the rest
    const dotX = x + 15;
    const dotY = staffCenterY - 6; // In a space
    return <circle cx={dotX} cy={dotY} r={LAYOUT.DOT_RADIUS} fill={theme.score.note} />;
  };

  return (
    <g className="rest-group">
      <g transform={`translate(${x}, ${y}) scale(${config.scale})`}>
        <path d={pathData} fill={theme.score.note} />
      </g>
      {renderDot()}
    </g>
  );
};
