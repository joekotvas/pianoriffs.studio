// @ts-nocheck
import React from 'react';
import { TIME_SIGNATURES } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import DropdownOverlay from './DropdownOverlay';

const TimeSignatureOverlay = ({ current, onSelect, onClose, position, triggerRef }) => {
  const { theme } = useTheme();

  return (
    <DropdownOverlay
      onClose={onClose}
      position={position}
      triggerRef={triggerRef}
      width={200}
    >
      <div className="p-2 grid grid-cols-2 gap-2">
        {Object.keys(TIME_SIGNATURES).map((sig) => {
          const [top, bottom] = sig.split('/');
          return (
            <button
              key={sig}
              onClick={() => onSelect(sig)}
              className="flex flex-col items-center justify-center p-2 rounded-md transition-colors border"
              style={{
                backgroundColor: current === sig ? theme.buttonHoverBackground : 'transparent',
                borderColor: current === sig ? theme.accent : 'transparent',
                color: theme.text,
              }}
              onMouseEnter={(e) => {
                if (current !== sig) {
                  e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = current === sig ? theme.buttonHoverBackground : 'transparent';
              }}
            >
              <div className="mb-1 h-16 flex items-center justify-center w-full">
                  <svg width="40" height="60" viewBox="0 0 40 60">
                      {/* Staff Lines (faint) */}
                      {[0, 1, 2, 3, 4].map(i => (
                          <line 
                            key={i} 
                            x1="0" 
                            y1={10 + (i * 10)} 
                            x2="40" 
                            y2={10 + (i * 10)} 
                            stroke={theme.secondaryText} 
                            strokeWidth="1" 
                            opacity="0.3"
                          />
                      ))}
                      
                      <text x="20" y="28" fontSize="24" fontWeight="bold" fontFamily="serif" textAnchor="middle" fill={theme.text}>{top}</text>
                      <text x="20" y="48" fontSize="24" fontWeight="bold" fontFamily="serif" textAnchor="middle" fill={theme.text}>{bottom}</text>
                  </svg>
              </div>
              <span className="text-xs font-medium">{sig}</span>
            </button>
          );
        })}
      </div>
    </DropdownOverlay>
  );
};

export default TimeSignatureOverlay;
