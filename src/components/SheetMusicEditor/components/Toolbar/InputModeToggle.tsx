import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import NoteIcon from '../Assets/NoteIcon';
import RestIcon from '../Assets/RestIcon';

/**
 * Input mode for the toolbar - determines whether clicks/keyboard
 * entry creates notes or rests.
 */
export type InputMode = 'NOTE' | 'REST';

interface InputModeToggleProps {
  /** Current input mode */
  mode: InputMode;
  /** Callback when mode changes */
  onChange: (mode: InputMode) => void;
}

/**
 * Segmented control for Note/Rest input mode.
 * 
 * Visual indicator syncs with toolbar state.
 * Clicking manually overrides selection-based auto-sync.
 * 
 * @param props.mode - Current input mode
 * @param props.onChange - Mode change handler
 */
const InputModeToggle: React.FC<InputModeToggleProps> = ({ mode, onChange }) => {
  const { theme } = useTheme();
  
  const baseButtonStyles = "flex items-center justify-center w-9 h-9 transition-colors cursor-pointer";
  
  return (
    <div 
      className="flex rounded-md overflow-hidden border"
      style={{ borderColor: theme.border }}
    >
      <button
        className={baseButtonStyles}
        style={{
          backgroundColor: mode === 'NOTE' ? theme.accent : theme.buttonBackground,
        }}
        onClick={() => onChange('NOTE')}
        title="Note entry mode (R to toggle)"
        onMouseDown={(e) => e.preventDefault()} // Prevent focus
      >
        <NoteIcon type="quarter" color={mode === 'NOTE' ? 'white' : theme.text} />
      </button>
      <button
        className={baseButtonStyles}
        style={{
          backgroundColor: mode === 'REST' ? theme.accent : theme.buttonBackground,
          borderLeft: `1px solid ${theme.border}`
        }}
        onClick={() => onChange('REST')}
        title="Rest entry mode (R to toggle)"
        onMouseDown={(e) => e.preventDefault()} // Prevent focus
      >
        <RestIcon type="quarter" color={mode === 'REST' ? 'white' : theme.text} />
      </button>
    </div>
  );
};

export default InputModeToggle;
