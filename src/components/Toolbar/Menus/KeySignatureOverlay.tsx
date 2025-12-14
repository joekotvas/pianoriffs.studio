import React from 'react';
import { KEY_SIGNATURE_OFFSETS, KeySignatureOffsets } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import DropdownOverlay from './DropdownOverlay';
import { ACCIDENTALS, BRAVURA_FONT } from '@/constants/SMuFL';

interface KeySignatureOverlayProps {
  current: string;
  clef?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
  triggerRef: React.RefObject<HTMLElement>;
}

// Standard order of sharps and flats
const SHARPS = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
const FLATS  = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// Key signature data with precomputed accidentals
interface KeyPairData {
  majorKey: string;
  minorKey: string;
  type: 'sharp' | 'flat';
  count: number;
  accidentals: string[];
}

// Flats section: C (no accidentals) then around the flat side
const FLAT_KEYS: KeyPairData[] = [
  { majorKey: 'C', minorKey: 'A', type: 'flat', count: 0, accidentals: [] },
  { majorKey: 'F', minorKey: 'D', type: 'flat', count: 1, accidentals: FLATS.slice(0, 1) },
  { majorKey: 'Bb', minorKey: 'G', type: 'flat', count: 2, accidentals: FLATS.slice(0, 2) },
  { majorKey: 'Eb', minorKey: 'C', type: 'flat', count: 3, accidentals: FLATS.slice(0, 3) },
  { majorKey: 'Ab', minorKey: 'F', type: 'flat', count: 4, accidentals: FLATS.slice(0, 4) },
  { majorKey: 'Db', minorKey: 'Bb', type: 'flat', count: 5, accidentals: FLATS.slice(0, 5) },
  { majorKey: 'Gb', minorKey: 'Eb', type: 'flat', count: 6, accidentals: FLATS.slice(0, 6) },
  { majorKey: 'Cb', minorKey: 'Ab', type: 'flat', count: 7, accidentals: FLATS.slice(0, 7) },
];

// Sharps section: G (1 sharp) then around the sharp side
const SHARP_KEYS: KeyPairData[] = [
  { majorKey: 'G', minorKey: 'E', type: 'sharp', count: 1, accidentals: SHARPS.slice(0, 1) },
  { majorKey: 'D', minorKey: 'B', type: 'sharp', count: 2, accidentals: SHARPS.slice(0, 2) },
  { majorKey: 'A', minorKey: 'F#', type: 'sharp', count: 3, accidentals: SHARPS.slice(0, 3) },
  { majorKey: 'E', minorKey: 'C#', type: 'sharp', count: 4, accidentals: SHARPS.slice(0, 4) },
  { majorKey: 'B', minorKey: 'G#', type: 'sharp', count: 5, accidentals: SHARPS.slice(0, 5) },
  { majorKey: 'F#', minorKey: 'D#', type: 'sharp', count: 6, accidentals: SHARPS.slice(0, 6) },
  { majorKey: 'C#', minorKey: 'A#', type: 'sharp', count: 7, accidentals: SHARPS.slice(0, 7) },
];

// Render a key signature button showing major/minor pair
const KeyPairButton = ({
  data,
  current,
  clef,
  theme,
  onSelect,
}: {
  data: KeyPairData;
  current: string;
  clef: string;
  theme: any;
  onSelect: (key: string) => void;
}) => {
  const { majorKey, minorKey, type, count, accidentals } = data;
  
  // Selected if either the major or minor key matches current
  const isSelected = current === majorKey || current === minorKey;
  const accWidth = Math.max(40, (count * 10) + 20);
  
  return (
    <button
      onClick={() => onSelect(majorKey)}
      className="flex flex-col items-center justify-center p-2 rounded-md transition-colors border"
      style={{
        backgroundColor: isSelected ? theme.buttonHoverBackground : 'transparent',
        borderColor: isSelected ? theme.accent : 'transparent',
        color: theme.text,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected ? theme.buttonHoverBackground : 'transparent';
      }}
    >
      {/* Staff preview */}
      <div className="mb-2 h-16 flex items-center justify-center w-full">
        <svg width={accWidth} height="60" viewBox={`0 0 ${accWidth} 60`}>
          {/* Staff Lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={10 + (i * 10)}
              x2={accWidth}
              y2={10 + (i * 10)}
              stroke={theme.secondaryText}
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
          
          {/* Accidentals */}
          {accidentals.map((acc, i) => {
            const validClef = (clef in KEY_SIGNATURE_OFFSETS) ? (clef as keyof KeySignatureOffsets) : 'treble';
            const offset = KEY_SIGNATURE_OFFSETS[validClef][type][acc];
            const x = 10 + (i * 10);
            const y = 10 + offset;
            
            return (
              <text
                key={i}
                x={x}
                y={y}
                fontSize="32"
                fontFamily={BRAVURA_FONT}
                fill={theme.text}
              >
                {type === 'sharp' ? ACCIDENTALS.sharp : ACCIDENTALS.flat}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Label: Major / Minor pair */}
      <span className="text-xs font-medium text-center">
        {majorKey} Major / {minorKey} minor
      </span>
    </button>
  );
};

const KeySignatureOverlay: React.FC<KeySignatureOverlayProps> = ({
  current,
  clef = 'treble',
  onSelect,
  onClose,
  position,
  triggerRef
}) => {
  const { theme } = useTheme();

  return (
    <DropdownOverlay
      onClose={onClose}
      position={position}
      triggerRef={triggerRef}
      width="auto"
      className="w-80 md:w-[600px] max-w-full"
      maxHeight={500}
    >
      <div className="p-3 dropdown-scroll overflow-y-auto" style={{ maxHeight: '500px' }}>
        {/* Flats Section (including C Major with no accidentals) */}
        <div className="mb-4">
          <h3 
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-1"
            style={{ color: theme.secondaryText }}
          >
            Flats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FLAT_KEYS.map((data) => (
              <KeyPairButton
                key={data.majorKey}
                data={data}
                current={current}
                clef={clef}
                theme={theme}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t my-3" style={{ borderColor: theme.border }} />

        {/* Sharps Section */}
        <div>
          <h3 
            className="text-xs font-semibold uppercase tracking-wide mb-2 px-1"
            style={{ color: theme.secondaryText }}
          >
            Sharps
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SHARP_KEYS.map((data) => (
              <KeyPairButton
                key={data.majorKey}
                data={data}
                current={current}
                clef={clef}
                theme={theme}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </DropdownOverlay>
  );
};

export default KeySignatureOverlay;
