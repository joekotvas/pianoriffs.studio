import React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import ToolbarButton from './ToolbarButton';

interface HistoryControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  height?: string;
  variant?: 'default' | 'ghost';
}

const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  height = 'h-9',
  variant = 'default',
}) => {
  return (
    <div className="flex gap-1">
      <ToolbarButton
        icon={<RotateCcw size={18} />}
        label="Undo"
        onClick={onUndo}
        disabled={!canUndo}
        height={height}
        variant={variant}
      />
      <ToolbarButton
        icon={<RotateCw size={18} />}
        label="Redo"
        onClick={onRedo}
        disabled={!canRedo}
        height={height}
        variant={variant}
      />
    </div>
  );
};

export default HistoryControls;
