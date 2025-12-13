import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Info, Music2, HelpCircle, RotateCcw, RotateCw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ToolbarButton from './ToolbarButton';
import InstrumentSelector from './InstrumentSelector';
import FileMenu from './FileMenu';
import { InstrumentType } from '@/engines/toneEngine';
import { Score } from '@/types';

interface MainControlsProps {
  scoreTitle: string;
  isEditingTitle: boolean;
  onEditingChange: (isEditing: boolean) => void;
  onTitleChange: (title: string) => void;
  isPlaying: boolean;
  onPlayToggle?: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  midiStatus: { connected: boolean; deviceName: string | null; error: string | null };
  onToggleHelp: () => void;
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  samplerLoaded: boolean;
  score: Score;
  rowHeight?: string;
  buttonVariant?: 'default' | 'ghost';
}

const MainControls: React.FC<MainControlsProps & { children?: React.ReactNode }> = ({
  scoreTitle,
  isEditingTitle,
  onEditingChange,
  onTitleChange,
  isPlaying,
  onPlayToggle,
  bpm,
  onBpmChange,
  midiStatus,
  onToggleHelp,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  score,
  children,
  rowHeight = "h-9",
  buttonVariant = "default"
}) => {
  const { theme } = useTheme();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [titleBuffer, setTitleBuffer] = useState("");
  const [bpmBuffer, setBpmBuffer] = useState(String(bpm));

  const [isFocused, setIsFocused] = useState(false);
  const [isBpmHovered, setIsBpmHovered] = useState(false);
  const [isMidiHovered, setIsMidiHovered] = useState(false);

  useEffect(() => {
    setBpmBuffer(String(bpm));
  }, [bpm]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
        setTitleBuffer(scoreTitle);
        titleInputRef.current.focus();
        titleInputRef.current.select();
    }
  }, [isEditingTitle, scoreTitle]);

  const handleTitleCommit = () => {
    onEditingChange(false);
    if (titleBuffer !== scoreTitle) {
        onTitleChange(titleBuffer);
    }
  };

  const handleBpmBlur = () => {
    setIsFocused(false);
    const value = Number(bpmBuffer);
    if (!bpmBuffer || isNaN(value) || value <= 0) {
        setBpmBuffer("120");
        onBpmChange(120);
    } else {
        const clamped = Math.max(1, Math.min(300, value));
        setBpmBuffer(String(clamped));
        onBpmChange(clamped);
    }
  };

  const isGhost = buttonVariant === 'ghost';

  return (
    <div className="flex items-center gap-4">

      {/* File Menu */}
      <FileMenu score={score} bpm={bpm} height={rowHeight} variant={buttonVariant} />

      <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

      {/* Undo / Redo */}
      <div className="flex gap-1">
        <ToolbarButton
          icon={<RotateCcw size={18} />}
          label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
          height={rowHeight}
          variant={buttonVariant}
        />
        <ToolbarButton
          icon={<RotateCw size={18} />}
          label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
          height={rowHeight}
          variant={buttonVariant}
        />
      </div>

      <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          label={isPlaying ? "Pause" : "Play"}
          showLabel={true}
          onClick={onPlayToggle}
          isEmphasized={true}
          height={rowHeight}
          variant={buttonVariant}
        />

        <div 
          className={`flex items-center gap-0 px-2 rounded border ${rowHeight} transition-colors`}
          style={{ 
            borderColor: isFocused 
              ? theme.accent 
              : ((isGhost && !isBpmHovered) ? 'transparent' : theme.border),
            backgroundColor: (isGhost && !isBpmHovered && !isFocused) ? 'transparent' : 'transparent'
          }}
          onMouseEnter={() => setIsBpmHovered(true)}
          onMouseLeave={() => setIsBpmHovered(false)}
        >
            <span 
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: theme.secondaryText }}
            >
              BPM
            </span>
            <input 
              type="text" 
              value={bpmBuffer}
              onChange={(e) => setBpmBuffer(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBpmBlur}
              className="w-12 bg-transparent text-sm font-bold text-center outline-none"
              style={{ color: theme.accent }}
            />
        </div>
      </div>

      <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

      {/* MIDI Status Indicator */}
      <div 
        className={`flex items-center gap-1.5 px-3 ${rowHeight} rounded border text-xs font-medium ${
          midiStatus.connected 
            ? 'bg-[#0ac5b20f] border-[#507d7d] text-[#4f9e9e]' 
            : 'bg-slate-800/50 border-white/10 text-slate-400'
        }`}
        style={{
          borderColor: (isGhost && !isMidiHovered && !midiStatus.connected) 
            ? 'transparent' 
            : (midiStatus.connected ? '#507d7d' : (isMidiHovered ? theme.border : (isGhost? 'transparent' : theme.border))),
            // Note: Keep MIDI status distinct if connected, otherwise follow ghost rules
            backgroundColor: (isGhost && !midiStatus.connected) ? 'transparent' : undefined
        }}
        onMouseEnter={() => setIsMidiHovered(true)}
        onMouseLeave={() => setIsMidiHovered(false)}
        title={midiStatus.connected ? `MIDI: ${midiStatus.deviceName}` : (midiStatus.error || 'No MIDI device connected')}
      >
        <Music2 size={12} />
        <span>{midiStatus.connected ? 'MIDI' : 'No MIDI'}</span>
      </div>

      {/* Instrument Selector */}
      <InstrumentSelector
        selectedInstrument={selectedInstrument}
        onInstrumentChange={onInstrumentChange}
        samplerLoaded={samplerLoaded}
        height={rowHeight}
        variant={buttonVariant}
      />

      <div className="flex-1"></div>

      {children}

      <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

      <ToolbarButton 
        onClick={onToggleHelp}
        label="Keyboard Shortcuts"
        icon={<HelpCircle size={18} />}
        preventFocus={true}
        height={rowHeight}
        variant={buttonVariant}
      />
    </div>
  );
};

export default MainControls;
