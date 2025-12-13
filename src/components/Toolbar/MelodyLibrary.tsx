import React from 'react';
import { Melody } from '@/types';
import { BookOpen } from 'lucide-react';
import DropdownOverlay from './Menus/DropdownOverlay';
import { useTheme } from '@/context/ThemeContext';

interface MelodyLibraryProps {
  melodies: Melody[];
  onSelectMelody: (melody: Melody) => void;
  onClose: () => void;
  position: { x: number; y: number };
  triggerRef?: React.RefObject<HTMLElement>;
}

const MelodyLibrary: React.FC<MelodyLibraryProps> = ({ melodies, onSelectMelody, onClose, position, triggerRef }) => {
  const { theme } = useTheme();

  return (
    <DropdownOverlay
      onClose={onClose}
      position={position}
      triggerRef={triggerRef}
      width={256} // w-64
      maxHeight={320} // max-h-80
    >
      <div 
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ 
          backgroundColor: theme.buttonHoverBackground,
          borderColor: theme.border
        }}
      >
        <BookOpen size={16} style={{ color: theme.secondaryText }} />
        <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Melody Library</h3>
      </div>
      
      <div className="overflow-y-auto p-2 dropdown-scroll" style={{ maxHeight: '320px' }}>
        {melodies.map((melody) => (
          <button
            key={melody.id}
            onClick={() => onSelectMelody(melody)}
            className="w-full text-left px-3 py-2 rounded-md transition-colors text-sm mb-1"
            style={{
              color: theme.text
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
              e.currentTarget.style.color = theme.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.text;
            }}
          >
            {melody.title}
          </button>
        ))}
      </div>
    </DropdownOverlay>
  );
};

export default MelodyLibrary;
