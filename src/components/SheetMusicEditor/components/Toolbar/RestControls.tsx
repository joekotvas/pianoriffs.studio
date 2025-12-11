import React from 'react';
import { REST_TYPES } from '../../constants';
import RestIcon from '../Assets/RestIcon';
import ToolbarButton from './ToolbarButton';

interface RestControlsProps {
  activeRestDuration: string | null;
  onRestSelect: (duration: string) => void;
}

/**
 * Toolbar controls for inserting rests.
 * Mirrors the DurationControls pattern.
 */
const RestControls: React.FC<RestControlsProps> = ({
  activeRestDuration,
  onRestSelect
}) => {
  // Show a subset of durations (whole through sixteenth for now)
  const restDurations = ['whole', 'half', 'quarter', 'eighth', 'sixteenth'];

  return (
    <div className="flex gap-1">
      {restDurations.map(type => {
        const isActive = activeRestDuration === type;

        return (
          <ToolbarButton
            key={`rest-${type}`}
            onClick={() => onRestSelect(type)}
            label={`${REST_TYPES[type] ? type.charAt(0).toUpperCase() + type.slice(1) : type} Rest`}
            title={`${type.charAt(0).toUpperCase() + type.slice(1)} Rest`}
            isActive={isActive}
            icon={<RestIcon type={type} color={isActive ? "white" : "currentColor"} />}
            preventFocus={true}
          />
        );
      })}
    </div>
  );
};

export default RestControls;
