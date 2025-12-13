import React from 'react';
import ToolbarButton from './ToolbarButton';
import { useTheme } from '@/context/ThemeContext';

interface TupletControlsProps {
  onApplyTuplet: (ratio: [number, number], groupSize: number) => void;
  onRemoveTuplet: () => void;
  canApplyTriplet: boolean;
  canApplyQuintuplet: boolean;
  activeTupletRatio: [number, number] | null;
  variant?: 'default' | 'ghost';
}

/**
 * Tuplet controls for the toolbar.
 * Allows users to apply common tuplets (triplet, quintuplet) to selected notes.
 */
const TupletControls: React.FC<TupletControlsProps> = ({
  onApplyTuplet,
  onRemoveTuplet,
  canApplyTriplet,
  canApplyQuintuplet,
  activeTupletRatio,
  variant = 'default'
}) => {
  const { theme } = useTheme();

  const isTripletActive = activeTupletRatio?.[0] === 3 && activeTupletRatio?.[1] === 2;
  const isQuintupletActive = activeTupletRatio?.[0] === 5 && activeTupletRatio?.[1] === 4;

  const handleTriplet = () => {
    if (isTripletActive) {
      onRemoveTuplet();
    } else {
      onApplyTuplet([3, 2], 3);
    }
  };

  const handleQuintuplet = () => {
    if (isQuintupletActive) {
      onRemoveTuplet();
    } else {
      onApplyTuplet([5, 4], 5);
    }
  };

  return (
    <div className="flex gap-1">
      {/* Triplet Button */}
      <ToolbarButton
        onClick={handleTriplet}
        label="Triplet (3)"
        isActive={isTripletActive}
        disabled={!canApplyTriplet && !isTripletActive}
        preventFocus={true}
        icon={
          <div className="flex flex-col items-center justify-center" style={{ fontSize: '10px', lineHeight: '1' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>3</span>
            <div className="flex gap-0.5 mt-0.5">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
            </div>
          </div>
        }
        variant={variant}
      />

      {/* Quintuplet Button */}
      <ToolbarButton
        onClick={handleQuintuplet}
        label="Quintuplet (5)"
        isActive={isQuintupletActive}
        disabled={!canApplyQuintuplet && !isQuintupletActive}
        preventFocus={true}
        icon={
          <div className="flex flex-col items-center justify-center" style={{ fontSize: '10px', lineHeight: '1' }}>
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>5</span>
            <div className="flex gap-0.5 mt-0.5">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor' }}></div>
            </div>
          </div>
        }
        variant={variant}
      />

      {/* Remove Tuplet Button */}

    </div>
  );
};

export default TupletControls;
