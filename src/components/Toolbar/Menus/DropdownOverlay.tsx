import React, { useRef, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import Portal from '../../Layout/Portal';

// ========== DROPDOWN TRIGGER BUTTON ==========
interface DropdownTriggerProps {
  label: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  height?: string;
}

/**
 * Standardized dropdown trigger button with ghost styling:
 * - SM font, all caps
 * - ChevronDown icon
 * - Ghost style (transparent until hover/open)
 */
export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ label, icon, isOpen, onClick, height = 'h-9' }, ref) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);

    const borderColor = isOpen ? theme.accent : isHovered ? theme.border : 'transparent';
    const bgColor = isHovered || isOpen ? theme.buttonBackground : 'transparent';

    return (
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center gap-1.5 px-3 ${height} rounded border text-sm font-medium tracking-wide transition-colors`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: theme.secondaryText,
        }}
      >
        {icon}
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    );
  }
);

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
  className = '',
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
    enableArrowKeys: true,
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

// ========== DROPDOWN ITEM COMPONENT ==========
interface DropdownItemProps {
  onClick: () => void;
  children: React.ReactNode;
  isSelected?: boolean;
  className?: string;
}

/**
 * Standardized dropdown item with consistent styling:
 * - XS font size
 * - Pointer cursor
 * - Background color change on hover
 */
export const DropdownItem: React.FC<DropdownItemProps> = ({
  onClick,
  children,
  isSelected = false,
  className = '',
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full text-left px-3 py-2 rounded-md 
        text-sm font-medium 
        cursor-pointer
        transition-colors
        ${className}
      `}
      style={{
        backgroundColor: isSelected
          ? theme.buttonHoverBackground
          : isHovered
            ? theme.buttonHoverBackground
            : 'transparent',
        color: theme.secondaryText,
      }}
      role="menuitem"
    >
      {children}
    </button>
  );
};

export default DropdownOverlay;
