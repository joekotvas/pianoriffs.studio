import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import ToolbarButton from './ToolbarButton';

interface HistoryControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  onUndo,
  canRedo,
  onRedo
}) => {
  return (
    <div className="flex items-center gap-1">
        <ToolbarButton
            onClick={onUndo}
            disabled={!canUndo}
            label="Undo (Ctrl+Z)"
            icon={<Undo2 size={16} />}
            preventFocus={true}
        />
        <ToolbarButton
            onClick={onRedo}
            disabled={!canRedo}
            label="Redo (Ctrl+Shift+Z)"
            icon={<Redo2 size={16} />}
            preventFocus={true}
        />
    </div>
  );
};

export default HistoryControls;
