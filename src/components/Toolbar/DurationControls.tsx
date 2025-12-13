import React from 'react';
import { NOTE_TYPES } from '@/constants';
import NoteIcon from '../Assets/NoteIcon';
import RestIcon from '../Assets/RestIcon';
import ToolbarButton from './ToolbarButton';
import { InputMode } from './InputModeToggle';

interface DurationControlsProps {
  activeDuration: string;
  onDurationChange: (duration: string) => void;
  isDurationValid: (duration: string) => boolean;
  selectedDurations?: string[];
  editorState?: 'SELECTION_READY' | 'ENTRY_READY' | 'IDLE';
  /** Current input mode - shows rest icons when 'REST' */
  inputMode?: InputMode;
  variant?: 'default' | 'ghost';
}

/**
 * Duration selection controls for the toolbar.
 * 
 * Displays note or rest icons based on inputMode.
 * Handles visual states for selection (active, emphasized, dashed).
 */
const DurationControls: React.FC<DurationControlsProps> = ({
  activeDuration,
  onDurationChange,
  isDurationValid,
  selectedDurations = [],
  editorState = 'IDLE',
  inputMode = 'NOTE',
  variant = 'default'
}) => {
  return (
    <div className="flex gap-1">
      {Object.keys(NOTE_TYPES).map(type => {
        const shortcuts: Record<string, string> = {
          whole: '7',
          half: '6',
          quarter: '5',
          eighth: '4',
          sixteenth: '3',
          thirtysecond: '2',
          sixtyfourth: '1'
        };

        // Determine visual state
        let isActive = false;
        let isEmphasized = false;
        let isDashed = false;

        if (editorState === 'SELECTION_READY') {
            if (selectedDurations.length === 1 && selectedDurations.includes(type)) {
                isActive = true;
            } else if (selectedDurations.length > 1 && selectedDurations.includes(type)) {
                isEmphasized = true; // Outline style for mixed selection
                isDashed = true;     // Dashed border for mixed selection
            }
        } else {
            // Entry / Idle mode: show active input duration
            isActive = activeDuration === type;
        }

        // Choose icon based on input mode
        const IconComponent = inputMode === 'REST' ? RestIcon : NoteIcon;

        return (
          <ToolbarButton
            key={type}
            onClick={() => onDurationChange(type)}
            label={NOTE_TYPES[type].label}
            title={`${NOTE_TYPES[type].label} (${shortcuts[type]})`}
            isActive={isActive}
            isEmphasized={isEmphasized}
            isDashed={isDashed}
            icon={<IconComponent type={type} color={isActive ? "white" : "currentColor"} />}
            preventFocus={true}
            disabled={!isDurationValid(type)}
            variant={variant}
          />
        );
      })}
    </div>
  );
};

export default DurationControls;
