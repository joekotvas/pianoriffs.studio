import React from 'react';
import { TIE } from '@/constants';

interface TieProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  direction: 'up' | 'down';
  color?: string; // Optional color override
}

const Tie: React.FC<TieProps> = ({ startX, startY, endX, endY, direction, color = 'black' }) => {
  const dirMult = direction === 'up' ? -1 : 1;

  // 1. Add Gaps (Padding)
  const sX = startX + TIE.START_GAP;
  const eX = endX - TIE.END_GAP;

  // 2. Add Vertical Offset
  const sY = startY + TIE.VERTICAL_OFFSET * dirMult;
  const eY = endY + TIE.VERTICAL_OFFSET * dirMult;

  const width = eX - sX;
  if (width <= 0) return null; // Too short

  // 3. Calculate Height and Thickness
  const height = Math.min(25, Math.max(12, width * 0.2));
  const midThickness = TIE.MID_THICKNESS;
  const tipThickness = TIE.TIP_THICKNESS;

  // 4. Control Points
  // Outer Curve Control Point
  const cpX = sX + width / 2;
  const cpY_Outer = sY + height * dirMult;

  // Inner Curve Control Point
  // Slightly less height to create the crescent
  const cpY_Inner = sY + (height - midThickness) * dirMult;

  // 5. Construct Path with Blunt Ends
  // We need 4 points for the tips to create thickness
  // Start Tip: (sX, sY) to (sX, sY + tipThickness * dirMult) (conceptually, but we want it centered or offset?)
  // Let's assume sY is the "inner" side (closer to note) or "outer"?
  // sY is calculated from noteY + offset. So it's the start point closest to the note.
  // So the outer curve should start at sY + tipThickness? No, that would make it further.
  // Let's make sY the point closest to the note (Inner).
  // Actually, standard ties usually have the points on the same horizontal line (relative to staff),
  // and the curve goes away.

  // Let's define:
  // P1_Inner = (sX, sY)
  // P1_Outer = (sX, sY + tipThickness * dirMult) -- This moves "outward" (away from note)

  // But wait, if direction is UP (-1), adding (tip * -1) moves UP (away from note). Correct.
  // If direction is DOWN (1), adding (tip * 1) moves DOWN (away from note). Correct.

  const P1_Inner_Y = sY;
  const P1_Outer_Y = sY + tipThickness * dirMult;

  const P2_Inner_Y = eY;
  const P2_Outer_Y = eY + tipThickness * dirMult;

  // Path:
  // Move to Start Inner
  // Line to Start Outer
  // Quad to End Outer
  // Line to End Inner
  // Quad to Start Inner

  const path = `
    M ${sX} ${P1_Inner_Y}
    L ${sX} ${P1_Outer_Y}
    Q ${cpX} ${cpY_Outer} ${eX} ${P2_Outer_Y}
    L ${eX} ${P2_Inner_Y}
    Q ${cpX} ${cpY_Inner} ${sX} ${P1_Inner_Y}
    Z
  `;

  return <path d={path} fill={color} stroke="none" />;
};

export default Tie;
