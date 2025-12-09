// @ts-nocheck
import React from 'react';
import { NOTE_TYPES, MIDDLE_LINE_Y, LAYOUT, STEM, FLAGS } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { PITCH_TO_OFFSET, getOffsetForPitch } from '../../engines/layout';

/**
 * Helper to render flags for notes (eighth, sixteenth, etc.).
 * @param stemX - X position of the stem
 * @param stemTipY - Y position of the stem tip
 * @param type - Duration type
 * @param direction - Stem direction ('up' or 'down')
 * @param color - Color of the flags
 * @param spacing - Vertical spacing between flags (default: 6)
 * @returns Array of SVG path elements
 */
const renderFlags = (stemX, stemTipY, type, direction, color, spacing = FLAGS.SPACING) => {
  const count = NOTE_TYPES[type]?.flag;
  if (!count) return null;
  const paths = [];
  // Move flags slightly down/up from the tip
  const offset = FLAGS.OFFSET; 
  
  const flagPath = "M 362.52561,545.59100 C 362.55523,547.70041 361.59345,549.72003 360.14610,551.22017 C 359.85055,551.58759 359.04629,552.27401 358.90096,552.17196 C 358.71377,552.04052 359.37760,551.43876 359.71032,551.11874 C 361.17865,549.59402 362.04044,547.42643 361.74674,545.30372 C 361.36799,543.36784 359.78964,541.96920 358.24068,540.89646 C 357.26129,540.22519 356.21650,539.64737 355.11860,539.19400 L 355.11860,534.50500 L 355.64087,534.50670 C 356.05925,536.43346 357.79685,537.93980 359.09566,539.29772 C 360.00232,540.26777 361.07070,541.12502 361.68096,542.33020 C 362.22847,543.32497 362.53043,544.45397 362.52561,545.59100 z";

  for (let i = 0; i < count; i++) {
    const shift = (i * spacing) + offset;
    const y = stemTipY + (shift * (direction === 'up' ? 1 : -1));
    
    // The flag closest to the note head (last one drawn) should be larger
    const isClosest = i === count - 1;
    const scale = isClosest ? FLAGS.SCALE_CLOSEST : FLAGS.SCALE_OTHERS;

    // Transform to normalize the path (translate(-355.1186, -534.5257))
    // And then position at (stemX, y)
    // For down stem, we flip vertically scale(1, -1)
    
    const transform = direction === 'up'
        ? `translate(${stemX}, ${y}) scale(${scale}) translate(-355.1186, -534.5257)`
        : `translate(${stemX}, ${y}) scale(${scale}, -${scale}) translate(-355.1186, -534.5257)`;

    paths.push(
      <path 
        key={`flag-${i}`} 
        d={flagPath} 
        fill={color} 
        transform={transform}
      />
    );
  }
  return paths;
};

/**
 * Renders a single note head, including ledger lines, dots, and stem (if enabled).
 * @param quant - Quant position
 * @param pitch - Pitch of the note
 * @param type - Duration type
 * @param isSelected - Whether the note is selected
 * @param quantWidth - Width per quant
 * @param isGhost - Whether this is a ghost note
 * @param renderStem - Whether to render the stem
 * @param xOffset - Horizontal offset for cluster handling
 * @param dotted - Whether the note is dotted
 * @param dotShift - Horizontal shift for the dot
 * @param visualQuant - Visual quant position (overrides quant)
 * @param x - Absolute X position (overrides quant-based calculation)
 */
const Note = ({ quant, pitch, type, isSelected, quantWidth, isGhost, renderStem = true, xOffset = 0, dotted = false, dotShift = 0, visualQuant, x: absoluteX, clef = 'treble', baseY = CONFIG.baseY }) => {
  const { theme } = useTheme();
  const noteConfig = NOTE_TYPES[type];
  
  const effectiveQuant = visualQuant !== undefined ? visualQuant : quant;
  
  // Use absoluteX if provided, otherwise calculate from quant
  const baseX = absoluteX !== undefined 
      ? absoluteX 
      : (effectiveQuant * quantWidth) + CONFIG.measurePaddingLeft;
      
  const x = baseX + xOffset;
  
  const yOffset = getOffsetForPitch(pitch, clef);
  const y = baseY + yOffset;

  const color = isGhost ? theme.accent : (isSelected ? theme.accent : theme.score.note); 
  const fill = noteConfig.fill === 'black' || noteConfig.fill === 'transparent' 
    ? (noteConfig.fill === 'transparent' ? 'transparent' : color) 
    : noteConfig.fill;
  
  const stemDirection = y <= (baseY + (MIDDLE_LINE_Y - CONFIG.baseY)) ? 'down' : 'up';
  // Note: MIDDLE_LINE_Y is likely hardcoded relative to CONFIG.baseY. 
  // We should calculate middle line relative to passed baseY.
  // MIDDLE_LINE_Y is usually 20 (line 3). 
  // If MIDDLE_LINE_Y is absolute, we need to adjust.
  // Let's assume MIDDLE_LINE_Y is relative offset 20? 
  // No, constants.ts says: export const MIDDLE_LINE_Y = CONFIG.baseY + (CONFIG.lineHeight * 2);
  // So we should calculate local middle line.
  const localMiddleLineY = baseY + (CONFIG.lineHeight * 2);
  const stemDirectionCorrected = y <= localMiddleLineY ? 'down' : 'up';
  
  let stemHeight = STEM.LENGTHS.default;
  if (type === 'thirtysecond') stemHeight = STEM.LENGTHS.thirtysecond;
  if (type === 'sixtyfourth') stemHeight = STEM.LENGTHS.sixtyfourth;

  const stemX = stemDirectionCorrected === 'up' ? x + LAYOUT.STEM_OFFSET_X : x - LAYOUT.STEM_OFFSET_X;
  const stemEndY = stemDirectionCorrected === 'up' ? y - stemHeight : y + stemHeight;

  const drawLedgerLines = () => {
    const lines = [];
    const relativeY = y - baseY;
    const ledgerX = x; 
    
    // Draw lines above staff
    if (relativeY < 0) {
      for (let i = -12; i >= relativeY; i -= 12) {
        lines.push(<line key={`ledger-${i}`} x1={ledgerX - LAYOUT.LEDGER_LINE_EXTENSION} y1={baseY + i} x2={ledgerX + LAYOUT.LEDGER_LINE_EXTENSION} y2={baseY + i} stroke={color} strokeWidth={LAYOUT.LINE_STROKE_WIDTH} />);
      }
    }
    // Draw lines below staff
    if (relativeY > 48) {
      for (let i = 60; i <= relativeY; i += 12) {
        lines.push(<line key={`ledger-${i}`} x1={ledgerX - LAYOUT.LEDGER_LINE_EXTENSION} y1={baseY + i} x2={ledgerX + LAYOUT.LEDGER_LINE_EXTENSION} y2={baseY + i} stroke={color} strokeWidth={LAYOUT.LINE_STROKE_WIDTH} />);
      }
    }
    return lines;
  };

  const drawDot = () => {
    if (!dotted) return null;
    let dotY = y;
    const relativeY = y - baseY;
    if (relativeY % 12 === 0) {
        dotY -= 6; // Move up to space
    }
    const dotX = baseX + dotShift + LAYOUT.DOT_OFFSET_X;
    return <circle cx={dotX} cy={dotY} r={LAYOUT.DOT_RADIUS} fill={color} />;
  };

  return (
    <g className="note-group">
      {drawLedgerLines()}
      {type === 'whole' ? (
        <g transform={`translate(${x}, ${y}) scale(1.5) translate(-6, -3.5)`}>
           <g transform="translate(-199.3990,-536.4730)">
              <path
                 d="M 206.04921,542.89329 C 204.33221,542.80244 202.99047,541.27833 202.45208,539.70226 C 202.12589,538.77722 202.30505,537.38950 203.39174,537.12966 C 204.96615,536.86226 206.27260,538.19967 207.00481,539.47953 C 207.52641,540.42880 207.81478,541.92368 206.83679,542.67615 C 206.60458,542.83188 206.32387,542.89434 206.04921,542.89329 z M 208.78446,537.49000 C 206.85001,536.31510 204.40641,536.22358 202.28813,536.88110 C 200.94630,537.35025 199.41169,538.34823 199.39900,539.97250 C 199.39807,541.56396 200.87900,542.55675 202.18949,543.02959 C 204.26418,543.70824 206.65796,543.64856 208.59501,542.56669 C 209.69149,541.98333 210.66334,540.77535 210.33379,539.43643 C 210.15258,538.57546 209.49304,537.93123 208.78446,537.49000 z "
                 fill={color}
                 stroke="none"
               />
           </g>
        </g>
      ) : (
        <ellipse cx={x} cy={y} rx={LAYOUT.NOTE_RX} ry={LAYOUT.NOTE_RY} fill={fill} stroke={color} strokeWidth="2" transform={`rotate(-20 ${x} ${y})`} />
      )}
      {drawDot()}
      
      {renderStem && noteConfig.stem && (
        <>
          <line x1={stemX} y1={y} x2={stemX} y2={stemEndY} stroke={color} strokeWidth={LAYOUT.LINE_STROKE_WIDTH} />
          {renderFlags(stemX, stemEndY, type, stemDirection, color)}
        </>
      )}
    </g>
  );
};

export { Note, renderFlags };
export default Note;
