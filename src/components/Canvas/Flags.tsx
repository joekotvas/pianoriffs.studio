import React from 'react';
import { CONFIG } from '@/config';
import { BRAVURA_FONT, getFontSize, FLAGS as SMUFL_FLAGS } from '@/constants/SMuFL';

/**
 * Renders flag glyphs for notes (eighth, sixteenth, etc.) using Bravura font.
 * Used by ChordGroup for unbeamed notes.
 */

interface FlagsProps {
  stemX: number;
  stemTipY: number;
  duration: string;
  direction: 'up' | 'down';
  color: string;
}

const getFlagGlyph = (duration: string, direction: 'up' | 'down'): string | null => {
  if (direction === 'up') {
    switch (duration) {
      case 'eighth':
        return SMUFL_FLAGS.eighthUp;
      case 'sixteenth':
        return SMUFL_FLAGS.sixteenthUp;
      case 'thirtysecond':
        return SMUFL_FLAGS.thirtysecondUp;
      case 'sixtyfourth':
        return SMUFL_FLAGS.sixtyfourthUp;
      default:
        return null;
    }
  } else {
    switch (duration) {
      case 'eighth':
        return SMUFL_FLAGS.eighthDown;
      case 'sixteenth':
        return SMUFL_FLAGS.sixteenthDown;
      case 'thirtysecond':
        return SMUFL_FLAGS.thirtysecondDown;
      case 'sixtyfourth':
        return SMUFL_FLAGS.sixtyfourthDown;
      default:
        return null;
    }
  }
};

const Flags: React.FC<FlagsProps> = ({ stemX, stemTipY, duration, direction, color }) => {
  const glyph = getFlagGlyph(duration, direction);
  if (!glyph) return null;

  const fontSize = getFontSize(CONFIG.lineHeight);

  return (
    <text
      x={stemX - 0.75}
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

export default Flags;
