import React from 'react';
import { TREBLE_CLEF_PATH, CLEF_TYPES, KEY_SIGNATURES, KEY_SIGNATURE_OFFSETS, KeySignatureOffsets } from '../../constants';
import { CONFIG } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { calculateHeaderLayout, HEADER_CONSTANTS } from '../../engines/layout';

interface ScoreHeaderProps {
  clef: string;
  keySignature: string;
  timeSignature: string;
  baseY?: number; // Y position for this staff
  onClefClick: (e: React.MouseEvent) => void;
  onKeySigClick: (e: React.MouseEvent) => void;
  onTimeSigClick: (e: React.MouseEvent) => void;
}

const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  clef,
  keySignature,
  timeSignature,
  baseY = CONFIG.baseY,
  onClefClick,
  onKeySigClick,
  onTimeSigClick
}) => {
  const { theme } = useTheme();
  
  // Use centralized layout calculation (SSOT)
  const headerLayout = calculateHeaderLayout(keySignature);
  const { keySigStartX, keySigVisualWidth, timeSigStartX, startOfMeasures } = headerLayout;
  const { KEY_SIG_ACCIDENTAL_WIDTH, TIME_SIG_WIDTH } = HEADER_CONSTANTS;
  
  const CLEF_WIDTH = 40;

  return (
    <g>
      {/* Staff Lines for Clef Area - Extended to start of measures */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={`staff-head-${i}`} x1={0} y1={baseY + (i * CONFIG.lineHeight)} x2={startOfMeasures} y2={baseY + (i * CONFIG.lineHeight)} stroke={theme.score.line} strokeWidth="1"/>
      ))}
      <line x1={0} y1={baseY} x2={0} y2={baseY + (CONFIG.lineHeight * 4)} stroke={theme.secondaryText} strokeWidth="1" />

      {/* Clef - clickable */}
      <g 
        onClick={onClefClick}
        style={{ cursor: 'pointer' }}
        data-testid={`clef-${clef}`}
      >
        <rect x="-5" y={baseY - 25} width={CLEF_WIDTH} height="100" fill="transparent" />
        {clef === 'treble' ? (
          <g transform={`translate(-8, ${baseY - 20}) scale(0.6)`}>
            <path d={TREBLE_CLEF_PATH} fill={theme.score.fill} />
          </g>
        ) : (
          <g transform={`translate(6, ${baseY - 3}) scale(${CLEF_TYPES.bass.scale})`}>
            <path d={CLEF_TYPES.bass.path} fill={theme.score.fill} transform="translate(-150, -270)" />
          </g>
        )}
      </g>
      
      {/* Key Signature */}
      <g
        onClick={onKeySigClick}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        data-testid={`keysig-${keySignature}`}
      >
         <rect x={keySigStartX} y={baseY - 20} width={Math.max(20, keySigVisualWidth)} height="80" fill="transparent" />
         {KEY_SIGNATURES[keySignature]?.accidentals.map((acc, i) => {
            const type = KEY_SIGNATURES[keySignature].type;
            // Cast clef to ensure it matches KeySignatureOffsets keys
            const validClef = (clef in KEY_SIGNATURE_OFFSETS) ? (clef as keyof KeySignatureOffsets) : 'treble';
            const offset = KEY_SIGNATURE_OFFSETS[validClef][type][acc];
            const x = keySigStartX + 5 + (i * KEY_SIG_ACCIDENTAL_WIDTH);
            const y = baseY + offset;
            
            return (
              <text 
                key={i} 
                x={x} 
                y={y + 6} // Adjust for text baseline
                fontSize={type === 'flat' ? "20" : "24"}
                fontFamily="serif"
                fill={theme.score.fill}
              >
                {type === 'sharp' ? '♯' : '♭'}
              </text>
            );
         })}
      </g>

      {/* Time Signature */}
      <g 
        onClick={onTimeSigClick}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
         <rect x={timeSigStartX} y={baseY} width={TIME_SIG_WIDTH} height="48" fill="transparent" />
         <text x={timeSigStartX + 15} y={baseY + (CONFIG.lineHeight * 2) - 1} fontSize="28" fontWeight="bold" fontFamily="serif" textAnchor="middle" fill={theme.text}>{timeSignature.split('/')[0]}</text>
         <text x={timeSigStartX + 15} y={baseY + (CONFIG.lineHeight * 4) - 1} fontSize="28" fontWeight="bold" fontFamily="serif" textAnchor="middle" fill={theme.text}>{timeSignature.split('/')[1]}</text>
      </g>
    </g>
  );
};

export default ScoreHeader;
