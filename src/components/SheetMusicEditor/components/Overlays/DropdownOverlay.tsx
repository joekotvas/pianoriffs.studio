import React, { useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import Portal from '../Portal';

interface DropdownOverlayProps {
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
  position: { x: number; y: number };
  children: React.ReactNode;
  width?: string | number;
  maxHeight?: string | number;
  className?: string;
}

const DropdownOverlay: React.FC<DropdownOverlayProps> = ({
  onClose,
  triggerRef,
  position,
  children,
  width = 'auto',
  maxHeight = 'auto',
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Use unified focus trap hook
  useFocusTrap({
    containerRef: ref,
    isActive: true,
    onEscape: onClose,
    returnFocusRef: triggerRef,
    autoFocus: true,
    enableArrowKeys: true
  });

  return (
    <Portal>
      {/* Backdrop to catch clicks and prevent interaction with background */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
      
      {/* Dropdown Content */}
      <div
        ref={ref}
        className={`fixed z-50 rounded-lg shadow-xl border overflow-hidden backdrop-blur-md ${className}`}
        style={{
          left: position.x,
          top: position.y,
          ...(width !== 'auto' && { width }),
          maxHeight: maxHeight,
          backgroundColor: theme.panelBackground,
          borderColor: theme.border,
          color: theme.text,
        }}
        role="menu"
        aria-modal="true"
      >
        {children}
        <style>{`
          .dropdown-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .dropdown-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .dropdown-scroll::-webkit-scrollbar-thumb {
            background-color: ${theme.border};
            border-radius: 3px;
          }
          .dropdown-scroll::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.secondaryText};
          }
        `}</style>
      </div>
    </Portal>
  );
};

export default DropdownOverlay;
