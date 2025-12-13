import React, { useState } from 'react';
import { Piano } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { InstrumentType } from '@/engines/toneEngine';

interface MidiControlsProps {
  midiStatus: { connected: boolean; deviceName: string | null; error: string | null };
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  samplerLoaded: boolean;
  height?: string;
  variant?: 'default' | 'ghost';
}

const MidiControls: React.FC<MidiControlsProps> = ({
  midiStatus,
  height = "h-9",
  variant = "default"
}) => {
  const { theme } = useTheme();
  const [isMidiHovered, setIsMidiHovered] = useState(false);
  const isGhost = variant === 'ghost';

  return (
    <div className="flex items-center gap-2">
      {/* MIDI Status Indicator */}
      <div 
        className={`flex items-center gap-1.5 px-3 ${height} rounded border text-xs font-medium ${
          midiStatus.connected 
            ? 'bg-[#0ac5b20f] border-[#507d7d] text-[#4f9e9e]' 
            : 'bg-slate-800/50 border-white/10 text-slate-400'
        }`}
        style={{
          borderColor: (isGhost && !isMidiHovered && !midiStatus.connected) 
            ? 'transparent' 
            : (midiStatus.connected ? '#507d7d' : (isMidiHovered ? theme.border : (isGhost ? 'transparent' : theme.border))),
          backgroundColor: (isGhost && !midiStatus.connected) ? 'transparent' : undefined
        }}
        onMouseEnter={() => setIsMidiHovered(true)}
        onMouseLeave={() => setIsMidiHovered(false)}
        title={midiStatus.connected ? `MIDI: ${midiStatus.deviceName}` : (midiStatus.error || 'No MIDI device connected')}
      >
        <Piano size={12} />
        <span>{midiStatus.connected ? 'MIDI' : 'No MIDI'}</span>
      </div>

    </div>
  );
};

export default MidiControls;
