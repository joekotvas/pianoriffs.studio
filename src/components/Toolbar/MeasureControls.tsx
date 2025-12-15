import React from 'react';
import { SquarePlus, SquareMinus } from 'lucide-react';
import ToolbarButton from './ToolbarButton';

interface MeasureControlsProps {
  onAddMeasure: () => void;
  onRemoveMeasure: () => void;
  onTogglePickup: () => void;
  isPickup?: boolean;
  variant?: 'default' | 'ghost';
}

const MeasureControls: React.FC<MeasureControlsProps> = ({
  onAddMeasure,
  onRemoveMeasure,
  onTogglePickup,
  isPickup,
  variant = 'default',
}) => {
  return (
    <div className="flex gap-1">
      <ToolbarButton
        onClick={onAddMeasure}
        label="Add Measure"
        icon={<SquarePlus size={16} />}
        variant={variant}
      />
      <ToolbarButton
        onClick={onRemoveMeasure}
        label="Remove Measure"
        icon={<SquareMinus size={16} />}
        variant={variant}
      />
      <ToolbarButton
        onClick={onTogglePickup}
        isActive={isPickup}
        label="Toggle Pickup"
        icon={<span className="text-xs font-bold">PK</span>}
        variant={variant}
      />
    </div>
  );
};

export default MeasureControls;
