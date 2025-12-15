import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface DividerProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * A themed divider component for toolbar sections
 */
const Divider: React.FC<DividerProps> = ({ orientation = 'vertical', className = '' }) => {
  const { theme } = useTheme();

  if (orientation === 'horizontal') {
    return <div className={`w-full h-px ${className}`} style={{ backgroundColor: theme.border }} />;
  }

  return <div className={`w-px h-6 ${className}`} style={{ backgroundColor: theme.border }} />;
};

export default Divider;
