import React from 'react';
import { Circle } from 'lucide-react';
import TieIcon from '../Assets/TieIcon';
import ToolbarButton from './ToolbarButton';

interface ModifierControlsProps {
  isDotted: boolean;
  onDotToggle: () => void;
  activeTie: boolean;
  onToggleTie: () => void;
  isDotValid: boolean;
  selectedDots?: boolean[];
  selectedTies?: boolean[];
  editorState?: string;
}

const ModifierControls: React.FC<ModifierControlsProps> = ({
  isDotted,
  onDotToggle,
  activeTie,
  onToggleTie,
  isDotValid,
  selectedDots = [],
  selectedTies = [],
  editorState = 'IDLE'
}) => {
    
    // Calculate visual states
    let dotActive = isDotted;
    let dotDashed = false;
    let dotEmphasized = false;
    
    if (editorState === 'SELECTION_READY') {
        if (selectedDots.length > 1) {
            // Mixed state
            dotActive = false;
            dotDashed = true;
            dotEmphasized = true;
        } else if (selectedDots.length === 1 && selectedDots[0] === true) {
            dotActive = true;
        } else {
            dotActive = false;
        }
    }

    let tieActive = activeTie;
    let tieDashed = false;
    let tieEmphasized = false;

    if (editorState === 'SELECTION_READY') {
        if (selectedTies.length > 1) {
            // Mixed state
            tieActive = false;
            tieDashed = true;
            tieEmphasized = true;
        } else if (selectedTies.length === 1 && selectedTies[0] === true) {
            tieActive = true;
        } else {
            tieActive = false;
        }
    }

  return (
    <div className="flex gap-1">
      <ToolbarButton
        onClick={onDotToggle}
        label="Dotted Note"
        isActive={dotActive}
        isDashed={dotDashed}
        isEmphasized={dotEmphasized}
        icon={<Circle size={8} fill="currentColor" />}
        preventFocus={true}
        disabled={!isDotValid}
      />

      <ToolbarButton
        onClick={onToggleTie}
        label="Tie (T)"
        isActive={tieActive}
        isDashed={tieDashed}
        isEmphasized={tieEmphasized}
        icon={<TieIcon size={16} />}
        preventFocus={true}
      />
    </div>
  );
};

export default ModifierControls;
