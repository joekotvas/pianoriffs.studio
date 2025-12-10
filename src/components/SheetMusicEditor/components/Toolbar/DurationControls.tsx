import React from 'react';
import { NOTE_TYPES } from '../../constants';
import NoteIcon from '../Assets/NoteIcon';
import ToolbarButton from './ToolbarButton';

interface DurationControlsProps {
  activeDuration: string;
  onDurationChange: (duration: string) => void;
  isDurationValid: (duration: string) => boolean;
  selectedDurations?: string[];
  editorState?: 'SELECTION_READY' | 'ENTRY_READY' | 'IDLE';
}

const DurationControls: React.FC<DurationControlsProps> = ({
  activeDuration,
  onDurationChange,
  isDurationValid,
  selectedDurations = [],
  editorState = 'IDLE'
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

        return (
          <ToolbarButton
            key={type}
            onClick={() => onDurationChange(type)}
            label={NOTE_TYPES[type].label}
            title={`${NOTE_TYPES[type].label} (${shortcuts[type]})`}
            isActive={isActive}
            isEmphasized={isEmphasized}
            isDashed={isDashed}
            icon={<NoteIcon type={type} color={isActive ? "white" : "currentColor"} />}
            preventFocus={true}
            disabled={!isDurationValid(type)}
          />
        );
      })}
    </div>
  );
};

export default DurationControls;
