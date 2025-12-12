import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { THEMES, ThemeName } from '../../config';

const ConfigMenu = () => {
  const { theme, themeName, setTheme, zoom, setZoom } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full shadow-lg transition-colors"
        style={{
          backgroundColor: theme.buttonBackground,
          color: theme.text,
          border: `1px solid ${theme.border}`
        }}
      >
        {isOpen ? <X size={24} /> : <Settings size={24} />}
      </button>

      {isOpen && (
        <div 
          className="absolute top-12 right-0 w-64 p-4 rounded-lg shadow-xl backdrop-blur-md border"
          style={{
            backgroundColor: theme.panelBackground,
            borderColor: theme.border,
            color: theme.text
          }}
        >
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: theme.secondaryText }}>Configuration</h3>
          
          <div className="mb-6">
            <label className="block text-xs font-bold mb-2 uppercase" style={{ color: theme.secondaryText }}>Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeName[]).map((name) => (
                <button
                  key={name}
                  onClick={() => setTheme(name)}
                  className={`px-3 py-2 rounded text-xs font-medium transition-all border ${
                    themeName === name ? 'ring-2 ring-offset-1 ring-offset-transparent' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: THEMES[name].background,
                    color: THEMES[name].text,
                    borderColor: themeName === name ? theme.accent : THEMES[name].border,
                    '--tw-ring-color': theme.accent
                  } as React.CSSProperties}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase" style={{ color: theme.secondaryText }}>
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: theme.border,
                accentColor: theme.accent
              }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: theme.secondaryText }}>
              <span>50%</span>
              <span>100%</span>
              <span>200%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigMenu;
