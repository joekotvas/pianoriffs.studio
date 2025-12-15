import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, Theme, ThemeName, DEFAULT_THEME } from '@/config';
import { DEFAULT_SCALE } from '@/constants';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialTheme?: ThemeName }> = ({
  children,
  initialTheme,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme || DEFAULT_THEME);
  const [zoom, setZoom] = useState(DEFAULT_SCALE);

  useEffect(() => {
    if (initialTheme) {
      setThemeName(initialTheme);
    }
  }, [initialTheme]);

  const theme = THEMES[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName, zoom, setZoom }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
