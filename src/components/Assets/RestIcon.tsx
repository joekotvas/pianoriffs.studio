// @ts-nocheck
import React from 'react';
import { REST_GLYPHS, BRAVURA_FONT } from '@/constants/SMuFL';

/**
 * Renders rest glyphs for toolbar display using Bravura font.
 * Each glyph is handled in its own case for easy individual tuning.
 *
 * @param props.type - Duration type (whole, half, quarter, etc.)
 * @param props.color - Fill color for the glyph
 */
const RestIcon = ({ type, color = 'currentColor' }: { type: string; color?: string }) => {
  const commonProps = {
    fontFamily: BRAVURA_FONT,
    fill: color,
    textAnchor: 'middle' as const,
    style: { userSelect: 'none' as const },
  };

  const renderGlyph = () => {
    switch (type) {
      case 'whole':
        return (
          <>
            {/* Staff line visual aid (above) */}
            <line x1={6} y1={9.5} x2={18} y2={9.5} stroke={color} strokeWidth={1} />
            <text x={12} y={10} fontSize={24} {...commonProps}>
              {REST_GLYPHS.whole}
            </text>
          </>
        );

      case 'half':
        return (
          <>
            {/* Staff line visual aid (below) */}
            <line x1={6} y1={14} x2={18} y2={14} stroke={color} strokeWidth={1} />
            <text x={12} y={14} fontSize={24} {...commonProps}>
              {REST_GLYPHS.half}
            </text>
          </>
        );

      case 'quarter':
        return (
          <text x={12} y={14} fontSize={24} {...commonProps}>
            {REST_GLYPHS.quarter}
          </text>
        );

      case 'eighth':
        return (
          <text x={12} y={12} fontSize={26} {...commonProps}>
            {REST_GLYPHS.eighth}
          </text>
        );

      case 'sixteenth':
        return (
          <text x={12} y={10} fontSize={24} {...commonProps}>
            {REST_GLYPHS.sixteenth}
          </text>
        );

      case 'thirtysecond':
        return (
          <text x={12} y={12} fontSize={24} {...commonProps}>
            {REST_GLYPHS.thirtysecond}
          </text>
        );

      case 'sixtyfourth':
        return (
          <text x={12} y={10} fontSize={20} {...commonProps}>
            {REST_GLYPHS.sixtyfourth}
          </text>
        );

      default:
        // Default to quarter if unknown
        return (
          <text x={12} y={14} fontSize={24} {...commonProps}>
            {REST_GLYPHS.quarter}
          </text>
        );
    }
  };

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {renderGlyph()}
    </svg>
  );
};

export default RestIcon;
