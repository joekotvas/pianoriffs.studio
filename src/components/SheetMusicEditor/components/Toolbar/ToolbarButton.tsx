import React from 'react';
import { useTheme } from '../../context/ThemeContext';

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
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(({
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
  isDashed = false
}, ref) => {
  const { theme } = useTheme();
  const baseStyles = "flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-9";
  const sizeStyles = showLabel ? "min-w-9 px-3" : "w-9";
  const borderStyle = isDashed ? "border-dashed" : "border-solid";
  const [isHovered, setIsHovered] = React.useState(false);

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
        ${sizeStyles}
        ${borderStyle}
        ${className}
      `}
      style={{
        backgroundColor: isActive 
          ? theme.accent 
          : (isHovered 
              ? theme.buttonHoverBackground 
              : (isEmphasized ? theme.buttonBackground : theme.buttonBackground)),
        borderColor: isActive 
          ? theme.accent 
          : (isEmphasized ? theme.accent : theme.border),
        color: isActive 
          ? '#ffffff' 
          : (isEmphasized ? theme.accent : theme.secondaryText),
      }}
      title={title || label}
      aria-label={label}
    >
      {icon && <span className={showLabel ? "mr-2" : ""}>{icon}</span>}
      {showLabel ? (
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </button>
  );
});

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
