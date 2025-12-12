import React from 'react';
import ToolbarButton from './ToolbarButton';

interface AccidentalControlsProps {
  activeAccidental: 'flat' | 'natural' | 'sharp' | null;
  onToggleAccidental: (accidental: 'flat' | 'natural' | 'sharp') => void;
  selectedAccidentals?: (string | null)[];
  editorState?: string;
}

const AccidentalControls: React.FC<AccidentalControlsProps> = ({
  activeAccidental,
  onToggleAccidental,
  selectedAccidentals = [],
  editorState = 'IDLE'
}) => {
  // Logic: 
  // If SELECTION_READY:
  // - If mixed selection (more than 1 type present), show DASHED for any present types.
  // - If homogeneous selection (only 1 type present), show ACTIVE for that type.
  // If IDLE/ENTRY:
  // - Show ACTIVE based on activeAccidental.

  const getVisualState = (type: 'flat' | 'natural' | 'sharp') => {
      let isActive = activeAccidental === type;
      let isDashed = false;
      let isEmphasized = false;

      if (editorState === 'SELECTION_READY' && selectedAccidentals.length > 0) {
          const present = selectedAccidentals.includes(type);
          
          if (selectedAccidentals.length > 1) {
              // Mixed state
              isActive = false;
              if (present) {
                  isDashed = true;
                  isEmphasized = true;
              }
          } else {
              // Homogeneous state
              // If only 'flat' is present, Flat button is active.
              isActive = present;
              isDashed = false;
          }
      } 
      
      return { isActive, isDashed, isEmphasized };
  };

  const flatState = getVisualState('flat');
  const naturalState = getVisualState('natural');
  const sharpState = getVisualState('sharp');

  return (
    <div className="flex gap-1">
        <ToolbarButton
          onClick={() => onToggleAccidental('flat')} 
          label="Flat"
          isActive={flatState.isActive}
          isDashed={flatState.isDashed}
          isEmphasized={flatState.isEmphasized}
          className="text-xl pb-1"
          icon="♭"
          preventFocus={true}
        />
        <ToolbarButton
          onClick={() => onToggleAccidental('natural')} 
          label="Natural"
          isActive={naturalState.isActive}
          isDashed={naturalState.isDashed}
          isEmphasized={naturalState.isEmphasized}
          className="text-xl pb-1"
          icon="♮"
          preventFocus={true}
        />
        <ToolbarButton
          onClick={() => onToggleAccidental('sharp')} 
          label="Sharp"
          isActive={sharpState.isActive}
          isDashed={sharpState.isDashed}
          isEmphasized={sharpState.isEmphasized}
          className="text-xl pb-1"
          icon="♯"
          preventFocus={true}
        />
    </div>
  );
};

export default AccidentalControls;
