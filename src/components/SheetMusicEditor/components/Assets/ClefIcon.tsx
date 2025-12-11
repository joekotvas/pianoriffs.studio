import React from 'react';
import { CLEFS, BRAVURA_FONT } from '../../constants/SMuFL';

interface ClefIconProps extends React.SVGProps<SVGSVGElement> {
  clef: string;
}

/**
 * ClefIcon renders clef symbols using Bravura font glyphs.
 * Designed for use in toolbars and overlays.
 */
const ClefIcon: React.FC<ClefIconProps> = ({ clef, ...props }) => {
  // Default to 60x60 coordinate system
  const viewBox = props.viewBox || "0 0 60 60";
  
  const key = clef || 'treble';
  
  // Get the appropriate Bravura glyph
  const getClefGlyph = () => {
    switch (key) {
      case 'treble': return CLEFS.gClef;
      case 'bass': return CLEFS.fClef;
      case 'alto': 
      case 'tenor': return CLEFS.cClef;
      default: return CLEFS.gClef;
    }
  };
  
  // Font size and positioning vary by clef type
  const getClefConfig = () => {
    switch (key) {
      case 'treble':
        return { fontSize: 55, x: 30, y: 42 };
      case 'bass':
        return { fontSize: 45, x: 28, y: 28 };
      case 'alto':
      case 'tenor':
        return { fontSize: 40, x: 30, y: 30 };
      default:
        return { fontSize: 55, x: 30, y: 42 };
    }
  };

  const config = getClefConfig();

  return (
    <svg viewBox={viewBox} fill="none" {...props}>
      {key === 'grand' ? (
        <>
          {/* Brace */}
          <path d="M5,10 Q0,10 0,20 L0,40 Q0,50 5,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
          
          {/* Top Staff (Treble) */}
          {[0, 1, 2].map(i => (
              <line key={`t-${i}`} x1="8" y1={12 + (i * 6)} x2="55" y2={12 + (i * 6)} stroke="currentColor" strokeWidth="1" opacity="0.4" />
          ))}
          <text
            x={22}
            y={26}
            fontFamily={BRAVURA_FONT}
            fontSize={28}
            fill="currentColor"
            textAnchor="middle"
          >
            {CLEFS.gClef}
          </text>

          {/* Bottom Staff (Bass) */}
          {[0, 1, 2].map(i => (
              <line key={`b-${i}`} x1="8" y1={38 + (i * 6)} x2="55" y2={38 + (i * 6)} stroke="currentColor" strokeWidth="1" opacity="0.4" />
          ))}
          <text
            x={22}
            y={46}
            fontFamily={BRAVURA_FONT}
            fontSize={22}
            fill="currentColor"
            textAnchor="middle"
          >
            {CLEFS.fClef}
          </text>
        </>
      ) : (
        <>
          {/* Staff lines for context */}
          {[0, 1, 2, 3, 4].map(i => (
              <line 
                key={i} 
                x1="0" 
                y1={10 + (i * 10)} 
                x2="60" 
                y2={10 + (i * 10)} 
                stroke="currentColor" 
                strokeWidth="1" 
                opacity="0.3"
              />
          ))}
          
          {/* Clef rendered with Bravura font */}
          <text
            x={config.x}
            y={config.y}
            fontFamily={BRAVURA_FONT}
            fontSize={config.fontSize}
            fill="currentColor"
            textAnchor="middle"
          >
            {getClefGlyph()}
          </text>
        </>
      )}
    </svg>
  );
};

export default ClefIcon;

