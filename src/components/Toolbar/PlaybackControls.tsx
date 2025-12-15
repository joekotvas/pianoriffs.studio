import React, { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ToolbarButton from './ToolbarButton';
import InstrumentSelector from './InstrumentSelector';
import { PRECOMPOSED_NOTES_UP, BRAVURA_FONT } from '@/constants/SMuFL';
import { InstrumentType } from '@/engines/toneEngine';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayToggle?: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  samplerLoaded: boolean;
  height?: string;
  variant?: 'default' | 'ghost';
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayToggle,
  bpm,
  onBpmChange,
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  height = 'h-9',
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const [bpmBuffer, setBpmBuffer] = useState(String(bpm));
  const [isFocused, setIsFocused] = useState(false);
  const [isBpmHovered, setIsBpmHovered] = useState(false);

  useEffect(() => {
    setBpmBuffer(String(bpm));
  }, [bpm]);

  const handleBpmBlur = () => {
    setIsFocused(false);
    const value = Number(bpmBuffer);
    if (!bpmBuffer || isNaN(value) || value <= 0) {
      setBpmBuffer('120');
      onBpmChange(120);
    } else {
      const clamped = Math.max(1, Math.min(300, value));
      setBpmBuffer(String(clamped));
      onBpmChange(clamped);
    }
  };

  const isGhost = variant === 'ghost';

  return (
    <div className="flex items-center gap-2">
      <ToolbarButton
        icon={
          isPlaying ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" />
          )
        }
        showLabel={true}
        label={isPlaying ? 'Pause' : 'Play'}
        onClick={onPlayToggle}
        isEmphasized={true}
        height={height}
        variant={variant}
      />

      <div
        className={`flex items-center gap-0 px-2 rounded border ${height} transition-colors`}
        style={{
          borderColor: isFocused
            ? theme.accent
            : isGhost && !isBpmHovered
              ? 'transparent'
              : theme.border,
          backgroundColor: isGhost && !isBpmHovered && !isFocused ? 'transparent' : 'transparent',
        }}
        onMouseEnter={() => setIsBpmHovered(true)}
        onMouseLeave={() => setIsBpmHovered(false)}
      >
        <span className="flex items-center gap-0.5" style={{ color: theme.secondaryText }}>
          <span
            style={{
              fontFamily: BRAVURA_FONT,
              fontSize: '1.5rem',
              lineHeight: 1,
              marginBottom: '-1rem',
              marginRight: '.25rem',
              marginLeft: '.25rem',
            }}
          >
            {PRECOMPOSED_NOTES_UP.quarter}
          </span>
          <span className="text-xs font-bold px-2"> = </span>
        </span>
        <input
          type="text"
          value={bpmBuffer}
          onChange={(e) => setBpmBuffer(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBpmBlur}
          className="w-8 bg-transparent text-sm font-bold text-center outline-none"
          style={{ color: theme.accent }}
        />
      </div>

      {/* Instrument Selector */}
      <InstrumentSelector
        selectedInstrument={selectedInstrument}
        onInstrumentChange={onInstrumentChange}
        samplerLoaded={samplerLoaded}
        height={height}
      />
    </div>
  );
};

export default PlaybackControls;
