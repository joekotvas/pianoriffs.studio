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
  noteX?: number;
  /** Whether the rest is currently selected */
  isSelected?: boolean;
  /** Whether this is a ghost/preview rest */
  isGhost?: boolean;
  /** Click handler for selection */
  onClick?: (e: React.MouseEvent) => void;
  /** Event ID for testing */
  eventId?: string | number;
}

/**
 * Y-offset for each rest type, relative to baseY (top of staff).
 */
const getRestY = (duration: string, baseY: number): number => {
  const lineHeight = CONFIG.lineHeight;
  const staffMiddle = baseY + lineHeight * 2;
  
  switch (duration) {
    case 'whole':
      return baseY + lineHeight;
    case 'half':
      return baseY + lineHeight * 2;
    default:
      return staffMiddle;
  }
};

/**
 * Renders a rest symbol using Bravura font glyphs.
 * Supports selection highlighting and click interaction.
 */
export const Rest: React.FC<RestProps> = ({
  duration,
  dotted = false,
  x = 0,
  baseY = CONFIG.baseY,
  isSelected = false,
  isGhost = false,
  onClick,
  eventId
}) => {
  const { theme } = useTheme();
  
  const glyph = REST_GLYPHS[duration];
  if (!glyph) {
    console.warn(`Unknown rest duration: ${duration}`);
    return null;
  }
  
  const color = isGhost ? theme.accent : (isSelected ? theme.accent : theme.score.note);
  const finalX = x > 0 ? x : CONFIG.measurePaddingLeft;
  const restY = getRestY(duration, baseY);
  const fontSize = getFontSize(CONFIG.lineHeight);
  
  // Hit area dimensions - larger than notes since rest glyphs are taller
  const hitAreaWidth = 24;  // Slightly wider than notes
  const hitAreaHeight = 36; // Taller to cover rest glyph height
  
  const renderDot = () => {
    if (!dotted) return null;
    const dotX = finalX + fontSize * 0.4;
    const dotY = restY - CONFIG.lineHeight / 2;
    return (
      <text
        x={dotX}
        y={dotY}
        fontFamily={BRAVURA_FONT}
        fontSize={fontSize}
        textAnchor="start"
        fill={color}
        style={{ userSelect: 'none' }}
      >
        {DOTS.augmentationDot}
      </text>
    );
  };
  
  return (
    <g 
      className="rest-group" 
      data-selected={isSelected}
      data-testid={eventId ? `rest-${eventId}` : undefined}
      style={{ opacity: isGhost ? 0.5 : 1 }}
    >
      {/* Invisible hit area for click detection */}
      {onClick && (
        <rect
          x={finalX - hitAreaWidth / 2}
          y={restY - hitAreaHeight / 2}
          width={hitAreaWidth}
          height={hitAreaHeight}
          fill="white"
          fillOpacity={0.01}
          style={{ cursor: 'pointer' }}
          onClick={onClick}
        />
      )}
      
      {/* Rest glyph */}
      <text
        x={finalX}
        y={restY}
        fontFamily={BRAVURA_FONT}
        fontSize={fontSize}
        textAnchor="middle"
        fill={color}
        style={{ userSelect: 'none', pointerEvents: (isGhost || !onClick) ? 'none' : 'auto' }}
      >
        {glyph}
      </text>
      {renderDot()}
    </g>
  );
};
