
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { RESTS, NOTEHEADS, BRAVURA_FONT } from '@/constants/SMuFL';

/**
 * Input mode for the toolbar - determines whether clicks/keyboard
 * entry creates notes or rests.
 */
export type InputMode = 'NOTE' | 'REST';

interface InputModeToggleProps {
  /** Current input mode */
  mode: InputMode;
  /** Callback when mode is toggled */
  onToggle: () => void;
  variant?: 'default' | 'ghost';
}

/**
 * Composite icon showing multiple rests to represent "Rest Mode".
 * Used when current mode is "NOTE" (shows what clicking will switch to).
 */
const RestGroupIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Eighth Rest */}
      <text 
        x={5} 
        y={15} 
        fontFamily={BRAVURA_FONT} 
        fontSize={20} 
        fill={color} 
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {RESTS.eighth}
      </text>
      
      {/* Quarter Rest (Center, larger) */}
      <text 
        x={12} 
        y={14} 
        fontFamily={BRAVURA_FONT} 
        fontSize={24} 
        fill={color} 
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {RESTS.quarter}
      </text>
      
       {/* Sixteenth Rest */}
       <text 
        x={19} 
        y={13} 
        fontFamily={BRAVURA_FONT} 
        fontSize={18} 
        fill={color} 
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {RESTS.sixteenth}
      </text>
  </svg>
);

/**
 * Composite icon showing multiple notes to represent "Note Mode".
 * Used when current mode is "REST" (shows what clicking will switch to).
 */
const NoteGroupIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Eighth Note (Black notehead) */}
      <text 
        x={6} 
        y={18} 
        fontFamily={BRAVURA_FONT} 
        fontSize={20} 
        fill={color} 
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {NOTEHEADS.black}
      </text>
      {/* Stem for Eighth */}
      <line x1={8.5} y1={18} x2={8.5} y2={8} stroke={color} strokeWidth={1.5} />
      
      {/* Quarter Note (Center, larger) */}
      <text 
        x={12} 
        y={19} 
        fontFamily={BRAVURA_FONT} 
        fontSize={24} 
        fill={color} 
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {NOTEHEADS.black}
      </text>
      <line x1={15} y1={19} x2={15} y2={6} stroke={color} strokeWidth={2} />
      
       {/* Half Note (White notehead) */}
       <text 
        x={18} 
        y={18} 
        fontFamily={BRAVURA_FONT} 
        fontSize={20} 
        fill={color} 
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {NOTEHEADS.half}
      </text>
      <line x1={20.5} y1={18} x2={20.5} y2={8} stroke={color} strokeWidth={1.5} />
  </svg>
);

import ToolbarButton from './ToolbarButton';

const InputModeToggle: React.FC<InputModeToggleProps> = ({ mode, onToggle, variant = 'default' }) => {
  const { theme } = useTheme();
  
  const isActive = mode === 'REST';

  return (
    <ToolbarButton
      label="Toggle Input Mode"
      onClick={onToggle}
      isActive={false}
      title={isActive ? "Switch to Note Mode (R)" : "Switch to Rest Mode (R)"}
      preventFocus={true}
      icon={isActive 
        ? <NoteGroupIcon color={theme.secondaryText} /> 
        : <RestGroupIcon color={theme.secondaryText} />
      }
      variant={variant}
    />
  );
};

export default InputModeToggle;
