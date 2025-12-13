// @ts-nocheck
import React from 'react';
import { PRECOMPOSED_NOTES_UP, BRAVURA_FONT } from '@/constants/SMuFL';

// Custom sizing for notes that need adjustment
const NOTE_SIZING = {
  whole: { y: 14, fontSize: 24 },       // Centered (no stem)
  thirtysecond: { y: 20, fontSize: 20 },
  sixtyfourth: { y: 22, fontSize: 18 },
};

const NoteIcon = ({ type, color = "currentColor" }) => {
  const glyph = PRECOMPOSED_NOTES_UP[type] || PRECOMPOSED_NOTES_UP.quarter;
  const sizing = NOTE_SIZING[type] || { y: 20, fontSize: 24 };
  
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

export default NoteIcon;
