import React from 'react';
import ClefIcon from '@assets/ClefIcon';
import { CLEF_TYPES } from '@/constants';
import { useTheme } from '@context/ThemeContext';
import DropdownOverlay from './DropdownOverlay';

interface ClefOverlayProps {
  current: string;
  onSelect: (clef: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
  triggerRef: React.RefObject<HTMLElement>;
}

const ClefOverlay: React.FC<ClefOverlayProps> = ({
  current,
  onSelect,
  onClose,
  position,
  triggerRef,
}) => {
  const { theme } = useTheme();

  return (
    <DropdownOverlay
      onClose={onClose}
      position={position}
      triggerRef={triggerRef}
      width="auto"
      className="w-[320px]"
    >
      <div className="p-2 grid grid-cols-3 gap-2">
        {['grand', 'treble', 'bass'].map((key) => {
          const data = CLEF_TYPES[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="flex flex-col items-center justify-center p-2 rounded-md transition-colors border"
              style={{
                backgroundColor: current === key ? theme.buttonHoverBackground : 'transparent',
                borderColor: current === key ? theme.accent : 'transparent',
                color: theme.text,
              }}
              onMouseEnter={(e) => {
                if (current !== key) {
                  e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  current === key ? theme.buttonHoverBackground : 'transparent';
              }}
            >
              <div className="mb-1 h-16 flex items-center justify-center w-full relative">
                <ClefIcon clef={key} width="60" height="60" />
              </div>
              <span className="text-xs font-medium">{data.label}</span>
            </button>
          );
        })}
      </div>
    </DropdownOverlay>
  );
};

export default ClefOverlay;
