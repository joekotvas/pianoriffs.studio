import React from 'react';
import { KEY_SIGNATURES, KEY_SIGNATURE_OFFSETS, KeySignatureOffsets } from '@/constants';
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
      className="w-72 md:w-[600px] max-w-full"
      maxHeight={400}
    >
      <div className="p-2 grid grid-cols-2 md:grid-cols-5 gap-2 dropdown-scroll overflow-y-auto" style={{ maxHeight: '400px' }}>
        {Object.entries(KEY_SIGNATURES).map(([key, data]) => {
           // Calculate width based on accidentals
           const accWidth = Math.max(40, (data.count * 10) + 20);
           
           return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="flex flex-col items-center justify-center p-2 rounded-md transition-colors border"
              style={{
                backgroundColor: current === key ? theme.buttonHoverBackground : 'transparent',
                borderColor: current === key ? theme.accent : 'transparent',
                color: theme.text,
              }}
              onMouseEnter={(e) => {
                if (current !== key) {
                  e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = current === key ? theme.buttonHoverBackground : 'transparent';
              }}
            >
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
                      {data.accidentals.map((acc, i) => {
                          const type = data.type;
                          const validClef = (clef in KEY_SIGNATURE_OFFSETS) ? (clef as keyof KeySignatureOffsets) : 'treble';
                          // Base Y is 10 (top line)
                          // Offsets are relative to a base Y in constants, but here we need to map them to our local SVG
                          // Let's assume the offsets in constants are relative to some base.
                          // In ScoreHeader: y = CONFIG.baseY + offset. CONFIG.baseY is usually top line or similar.
                          // Let's try to map the offsets directly.
                          // In constants: F sharp treble is 2. Top line is 0?
                          // Let's look at ScoreHeader again.
                          // y = CONFIG.baseY + offset.
                          // CONFIG.baseY is 70.
                          // Line 0 is at CONFIG.baseY.
                          // So offset 0 is top line.
                          // Here top line is y=10.
                          
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
              <span className="text-xs font-medium">{data.label}</span>
            </button>
          );
        })}
      </div>
    </DropdownOverlay>
  );
};

export default KeySignatureOverlay;
