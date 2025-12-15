import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface ConfirmDialogProps {
  title: string;
  message: string;
  /** Array of action buttons. Each has label, onClick, and optional variant */
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger' | 'secondary';
  }>;
  onClose: () => void;
}

/**
 * Reusable confirmation dialog with customizable actions.
 * Renders as a modal overlay with centered content.
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ title, message, actions, onClose }) => {
  const { theme } = useTheme();

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Lock scroll on mount
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore scroll on unmount
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const getButtonStyle = (variant: 'primary' | 'danger' | 'secondary' = 'secondary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.accent,
          color: '#fff',
          border: 'none',
        };
      case 'danger':
        return {
          backgroundColor: '#ef4444', // Gentler red
          color: '#fff',
          border: 'none',
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'transparent',
          color: theme.text,
          border: `1px solid ${theme.border}`,
        };
    }
  };

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative"
        style={{ backgroundColor: theme.background, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>
          {title}
        </h2>

        <p className="mb-6" style={{ color: theme.secondaryText }}>
          {message}
        </p>

        <div className="flex justify-end gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-80"
              style={getButtonStyle(action.variant)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
