import React, { useState, useEffect } from 'react';
import { X, Music } from 'lucide-react';
import { Key } from 'tonal';
import {
  KEY_SIGNATURES,
  KEY_SIGNATURE_OFFSETS,
  KeySignatureOffsets,
  KeySignature,
} from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { ACCIDENTALS, BRAVURA_FONT } from '@/constants/SMuFL';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

interface KeySignatureOverlayProps {
  current: string;
  clef?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

// ==========================================
// 2. CONSTANTS
// ==========================================

// Circle of fifths order for key signature selection UI
// Derived dynamically using Tonal.js Key.majorKey().minorRelative
const FLAT_ROOTS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
const SHARP_ROOTS = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'];

const CIRCLE_OF_FIFTHS = {
  flats: FLAT_ROOTS.map(
    (root) => [root, `${Key.majorKey(root).minorRelative}m`] as [string, string]
  ),
  sharps: SHARP_ROOTS.map(
    (root) => [root, `${Key.majorKey(root).minorRelative}m`] as [string, string]
  ),
};

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

/**
 * StaffPreview: Handles the SVG rendering of the staff lines and accidentals
 */
const StaffPreview = ({ data, clef, theme }: { data: KeySignature; clef: string; theme: any }) => {
  const { type, count, accidentals } = data;
  const accWidth = Math.max(40, count * 10 + 20);

  return (
    <div className="h-16 flex items-center justify-center w-full">
      <svg
        width={accWidth}
        height="60"
        viewBox={`0 0 ${accWidth} 60`}
        style={{ overflow: 'visible' }}
      >
        {/* Staff Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={10 + i * 10}
            x2={accWidth}
            y2={10 + i * 10}
            stroke={theme.secondaryText}
            strokeWidth="1"
            opacity="0.5"
          />
        ))}

        {/* Accidentals */}
        {accidentals.map((acc, i) => {
          const validClef =
            clef in KEY_SIGNATURE_OFFSETS ? (clef as keyof KeySignatureOffsets) : 'treble';
          const offset = KEY_SIGNATURE_OFFSETS[validClef][type][acc];

          return (
            <text
              key={i}
              x={10 + i * 10}
              y={10 + offset}
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
  );
};

/**
 * KeyOptionButton: The interactive button wrapper
 */
const KeyOptionButton = ({
  keyId,
  current,
  clef,
  theme,
  onSelect,
}: {
  keyId: string;
  current: string;
  clef: string;
  theme: any;
  onSelect: (key: string) => void;
}) => {
  const data = KEY_SIGNATURES[keyId];
  if (!data) return null;

  const isSelected = current === keyId;

  return (
    <button
      onClick={() => onSelect(keyId)}
      className="flex flex-col items-center justify-center p-2 rounded-md transition-colors border"
      style={{
        backgroundColor: isSelected ? theme.buttonHoverBackground : 'transparent',
        borderColor: isSelected ? theme.accent : 'transparent',
        color: theme.text,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected
          ? theme.buttonHoverBackground
          : 'transparent';
      }}
    >
      <StaffPreview data={data} clef={clef} theme={theme} />

      <span className="text-xs font-medium text-center">{data.label}</span>
    </button>
  );
};

/**
 * ModeToggle: Major/Minor selector toggle
 */
const ModeToggle = ({
  mode,
  setMode,
  theme,
}: {
  mode: 'major' | 'minor';
  setMode: (mode: 'major' | 'minor') => void;
  theme: any;
}) => (
  <div className="flex rounded-lg p-1 mb-4" style={{ backgroundColor: theme.buttonBackground }}>
    <button
      onClick={() => setMode('major')}
      className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
      style={{
        backgroundColor: mode === 'major' ? theme.accent : 'transparent',
        color: mode === 'major' ? '#ffffff' : theme.secondaryText,
      }}
    >
      Major
    </button>
    <button
      onClick={() => setMode('minor')}
      className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
      style={{
        backgroundColor: mode === 'minor' ? theme.accent : 'transparent',
        color: mode === 'minor' ? '#ffffff' : theme.secondaryText,
      }}
    >
      Minor
    </button>
  </div>
);

/**
 * KeySection: Renders a titled grid of key options
 */
const KeySection = ({
  title,
  keys,
  current,
  clef,
  theme,
  onSelect,
  mode,
}: {
  title: string;
  keys: [string, string][]; // [majorKey, minorKey]
  current: string;
  clef: string;
  theme: any;
  onSelect: (key: string) => void;
  mode: 'major' | 'minor';
}) => (
  <div className="mb-4">
    <h3
      className="text-xs font-semibold uppercase tracking-wide mb-2 px-1"
      style={{ color: theme.secondaryText }}
    >
      {title}
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {keys.map(([majorKey, minorKey]) => (
        <KeyOptionButton
          key={mode === 'major' ? majorKey : minorKey}
          keyId={mode === 'major' ? majorKey : minorKey}
          current={current}
          clef={clef}
          theme={theme}
          onSelect={onSelect}
        />
      ))}
    </div>
  </div>
);

// ==========================================
// 4. MAIN COMPONENT
// ==========================================

const KeySignatureOverlay: React.FC<KeySignatureOverlayProps> = ({
  current,
  clef = 'treble',
  onSelect,
  onClose,
}) => {
  const { theme } = useTheme();

  // Determine initial mode from current key
  const currentData = KEY_SIGNATURES[current];
  const initialMode = currentData?.mode || 'major';
  const [mode, setMode] = useState<'major' | 'minor'>(initialMode);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
        style={{ backgroundColor: theme.panelBackground }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ backgroundColor: theme.background, borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <Music size={20} style={{ color: theme.accent }} />
            <h2 className="font-bold text-lg" style={{ color: theme.text }}>
              Key Signature
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-white/10"
            style={{ color: theme.secondaryText }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Major/Minor Toggle */}
          <ModeToggle mode={mode} setMode={setMode} theme={theme} />

          {/* Key Sections */}
          <KeySection
            title="Flats"
            keys={CIRCLE_OF_FIFTHS.flats}
            current={current}
            clef={clef}
            theme={theme}
            onSelect={onSelect}
            mode={mode}
          />

          <hr className="border-t my-3" style={{ borderColor: theme.border }} />

          <KeySection
            title="Sharps"
            keys={CIRCLE_OF_FIFTHS.sharps}
            current={current}
            clef={clef}
            theme={theme}
            onSelect={onSelect}
            mode={mode}
          />
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t text-center text-xs"
          style={{
            backgroundColor: theme.background,
            borderColor: theme.border,
            color: theme.secondaryText,
          }}
        >
          Press{' '}
          <kbd
            className="px-1 py-0.5 rounded border font-mono"
            style={{
              backgroundColor: theme.buttonBackground,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            Esc
          </kbd>{' '}
          to close
        </div>
      </div>
    </div>
  );
};

export default KeySignatureOverlay;
