import React from 'react';
import { CLEFS, BRAVURA_FONT } from '@/constants/SMuFL';

interface ClefIconProps extends React.SVGProps<SVGSVGElement> {
  clef: string;
}

/**
 * ClefIcon renders clef symbols using Bravura font glyphs.
 * Designed for use in toolbars and overlays.
 */
const ClefIcon: React.FC<ClefIconProps> = ({ clef, ...props }) => {
  // Default to 60x60 coordinate system
  const viewBox = props.viewBox || '0 0 60 60';

  const key = clef || 'treble';

  // Get the appropriate Bravura glyph
  const getClefGlyph = () => {
    switch (key) {
      case 'treble':
        return CLEFS.gClef;
      case 'bass':
        return CLEFS.fClef;
      case 'alto':
      case 'tenor':
        return CLEFS.cClef;
      default:
        return CLEFS.gClef;
    }
  };

  // Font size and positioning vary by clef type
  const getClefConfig = () => {
    switch (key) {
      case 'treble':
        return { fontSize: 42, x: 30, y: 40 };
      case 'bass':
        return { fontSize: 42, x: 28, y: 20 };
      case 'alto':
      case 'tenor':
        return { fontSize: 32, x: 30, y: 32 };
      default:
        return { fontSize: 42, x: 30, y: 40 };
    }
  };

  const config = getClefConfig();

  return (
    <svg viewBox={viewBox} fill="none" {...props}>
      {key === 'grand' ? (
        <>
          {/* Brace - using same path as GrandStaffBracket, scaled to fit */}
          <svg
            x={0}
            y={10}
            width={6}
            height={44}
            viewBox="0 0 13 159"
            preserveAspectRatio="none"
            overflow="visible"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.1337 0.00122854C10.6545 0.0294863 10.1459 0.537114 9.27963 1.78379C7.52747 4.10559 5.01383 9.54316 4.00961 12.3786C2.50364 18.3271 2.00972 25.5609 2.51171 32.5444C2.75767 34.8636 3.25184 40.0279 4.00961 44.1631C5.25979 53.9925 5.51663 58.1278 5.51663 62.2629C5.2606 68.9819 3.51492 74.4037 0.748947 78.0226C0.246709 78.5389 0 79.0561 0 79.3207C0 79.5853 0.246709 80.1025 0.748947 80.6188C3.51492 84.2377 5.2606 89.6552 5.51663 96.1225C5.51663 100.509 5.25979 104.639 4.00961 114.204C3.25184 118.604 2.75767 123.773 2.51171 125.841C2.00972 133.076 2.50364 140.314 4.00961 145.998C5.25979 150.649 9.78239 158.668 11.0424 158.668C11.5444 158.668 12.0471 158.144 12.0471 157.625C12.0471 157.363 11.5444 156.596 11.0424 155.816C8.03022 151.429 6.76757 147.031 6.26558 140.312C6.26558 136.177 6.52243 132.296 7.77261 122.477C8.27459 118.606 8.77725 113.954 9.03303 112.138C10.0373 99.7353 8.03443 89.1381 3.01405 81.3866C2.25603 80.3516 1.75363 79.3207 1.75363 79.3207C1.75363 79.3207 2.25603 78.2807 3.01405 77.2456C8.03443 69.4942 10.0373 58.8965 9.03303 46.229C8.77725 44.6777 8.27459 40.0318 7.77261 35.8993C6.52243 26.3423 6.26558 22.4556 6.26558 18.3205C6.76757 11.6015 8.03022 7.20354 11.0424 2.81676C12.0464 1.26543 12.3025 0.755146 11.8005 0.238904C11.5636 0.0767645 11.3516 -0.0116103 11.1337 0.00122854Z"
              fill="currentColor"
            />
          </svg>

          <line
            x1="10"
            y1={10}
            x2="10"
            y2={54}
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.5"
          />
          {/* Top Staff (Treble) - 5 lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`t-${i}`}
              x1="10"
              y1={10 + i * 4}
              x2="50"
              y2={10 + i * 4}
              stroke="currentColor"
              strokeWidth="0.75"
              opacity="0.5"
            />
          ))}
          <text
            x={22}
            y={20}
            fontFamily={BRAVURA_FONT}
            fontSize={20}
            fill="currentColor"
            textAnchor="middle"
          >
            {CLEFS.gClef}
          </text>

          {/* Bottom Staff (Bass) - 5 lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`b-${i}`}
              x1="10"
              y1={38 + i * 4}
              x2="50"
              y2={38 + i * 4}
              stroke="currentColor"
              strokeWidth="0.75"
              opacity="0.5"
            />
          ))}
          <text
            x={22}
            y={42}
            fontFamily={BRAVURA_FONT}
            fontSize={20}
            fill="currentColor"
            textAnchor="middle"
          >
            {CLEFS.fClef}
          </text>
        </>
      ) : (
        <>
          {/* Staff lines for context */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={10 + i * 10}
              x2="60"
              y2={10 + i * 10}
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
