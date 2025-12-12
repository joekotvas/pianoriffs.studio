import React from 'react';
import { LAYOUT } from '../../constants';

/**
 * Renders the vertical stem line for a note or chord.
 * Used by ChordGroup to draw the shared stem.
 */

interface StemProps {
  x: number;
  startY: number;
  endY: number;
  color: string;
}

const Stem: React.FC<StemProps> = ({ x, startY, endY, color }) => (
  <line 
    x1={x} 
    y1={startY} 
    x2={x} 
    y2={endY} 
    stroke={color} 
    strokeWidth={LAYOUT.LINE_STROKE_WIDTH} 
  />
);

export default Stem;
