import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface ToolbarButtonProps {
  icon?: React.ReactNode;
  label: string;
  showLabel?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
  ref?: React.Ref<HTMLButtonElement>;

  preventFocus?: boolean;
  isEmphasized?: boolean;
  isDashed?: boolean;
  height?: string;
  variant?: 'default' | 'ghost';
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (
    {
      icon,
      label,
      showLabel = false,
      isActive = false,
      onClick,
      className = '',
      disabled = false,
      title,
      preventFocus = false,
      isEmphasized = false,
      isDashed = false,
      height = 'h-9',
      variant = 'default',
    },
    ref
  ) => {
    const { theme } = useTheme();
    const baseStyles =
      'flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    const sizeStyles = showLabel ? 'min-w-9 px-3' : 'w-9';
    const borderStyle = isDashed ? 'border-dashed' : 'border-solid';
    const [isHovered, setIsHovered] = React.useState(false);

    // Ghost variant styles
    const isGhost = variant === 'ghost';

    const getBackgroundColor = () => {
      if (isActive) return theme.accent;
      if (isHovered) return theme.buttonHoverBackground;
      // Ghost variant: Always transparent unless Active or Hovered
      // This allows the border (mixed state) to show without a solid background
      if (isGhost) return 'transparent';

      if (isEmphasized) return theme.buttonBackground;
      return theme.buttonBackground;
    };

    const getBorderColor = () => {
      if (isActive) return theme.accent;
      if (isEmphasized) return theme.accent;
      // Ensure dashed border is visible even if not emphasized (fallback)
      if (isDashed) return theme.secondaryText;

      if (isGhost && !isHovered) return 'transparent';
      return theme.border;
    };

    const getColor = () => {
      if (isActive) return '#ffffff';
      if (isEmphasized) return theme.accent;
      return theme.secondaryText;
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => {
          if (preventFocus) {
            e.preventDefault();
          }
        }}
        disabled={disabled}
        className={`
        ${baseStyles}
        ${height}
        ${sizeStyles}
        ${borderStyle}
        ${className}
      `}
        style={{
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          color: getColor(),
        }}
        title={title || label}
        aria-label={label}
      >
        {icon && <span className={showLabel ? 'mr-2' : ''}>{icon}</span>}
        {showLabel ? (
          <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
