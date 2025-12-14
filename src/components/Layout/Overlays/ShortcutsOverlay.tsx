import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';

import { Theme } from '@config';

interface Shortcut {
  label: string;
  keys: string[];
}

interface ShortcutGroupProps {
  title: string;
  shortcuts: Shortcut[];
  theme: Theme;
}

const ShortcutGroup: React.FC<ShortcutGroupProps> = ({ title, shortcuts, theme }) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1" style={{ color: theme.secondaryText, borderColor: theme.border }}>{title}</h3>
    <div className="grid grid-cols-1 gap-2">
      {shortcuts.map((s, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span style={{ color: theme.text }}>{s.label}</span>
          <div className="flex gap-1">
            {s.keys.map((k, j) => (
              <kbd key={j} className="px-2 py-1 rounded text-xs font-mono min-w-[24px] text-center" style={{ backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.secondaryText }}>
                {k}
              </kbd>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface ShortcutsOverlayProps {
  onClose: () => void;
}

const ShortcutsOverlay: React.FC<ShortcutsOverlayProps> = ({ onClose }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const shortcuts = {
    selection: [
      { label: 'Move Selection', keys: ['←', '→'] },
      { label: 'Extend Selection', keys: ['Shift', '←/→'] },
      { label: 'Chord Navigation', keys: ['Cmd/Ctrl', '↑/↓'] },
      { label: 'Switch Staff (Grand)', keys: ['Alt', '↑/↓'] },
      { label: 'Select Note', keys: ['Cmd/Ctrl', 'Click'] },
      { label: 'Clear Selection', keys: ['Esc'] },
    ],
    playback: [
      { label: 'Toggle Playback', keys: ['Space'] },
      { label: 'Play Selection', keys: ['P'] },
      { label: 'Replay Last Start', keys: ['Shift', 'Space'] },
      { label: 'Play From Start', keys: ['Shift', 'Alt', 'Space'] },
    ],
    editing: [
      { label: 'Add Note', keys: ['Enter'] },
      { label: 'Remove Note', keys: ['Backspace'] },
      { label: 'Toggle Rest Mode', keys: ['R'] },
      { label: 'Undo', keys: ['Cmd/Ctrl', 'Z'] },
      { label: 'Redo', keys: ['Cmd/Ctrl', 'Shift', 'Z'] },
      { label: 'Pitch Up/Down', keys: ['↑', '↓'] },
      { label: 'Octave Jump', keys: ['Shift', '↑/↓'] },
    ],
    modifiers: [
      { label: 'Toggle Dot', keys: ['.'] },
      { label: 'Toggle Tie', keys: ['T'] },
      { label: 'Flat', keys: ['-'] },
      { label: 'Sharp', keys: ['='] },
      { label: 'Natural', keys: ['0'] },
    ],
    durations: [
      { label: 'Whole Note', keys: ['7'] },
      { label: 'Half Note', keys: ['6'] },
      { label: 'Quarter Note', keys: ['5'] },
      { label: 'Eighth Note', keys: ['4'] },
      { label: '16th Note', keys: ['3'] },
      { label: '32nd Note', keys: ['2'] },
      { label: '64th Note', keys: ['1'] },
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" style={{ backgroundColor: theme.panelBackground }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
          <div className="flex items-center gap-2" style={{ color: theme.accent }}>
            <Keyboard size={20} />
            <h2 className="font-bold text-lg" style={{ color: theme.text }}>Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full transition-colors" style={{ color: theme.secondaryText }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* Welcome & Instructions */}
          <div className="mb-8 p-4 rounded-lg border" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}>
             <h3 className="font-bold mb-2" style={{ color: theme.accent }}>Welcome to RiffScore!</h3>
             <p className="text-sm mb-4" style={{ color: theme.text }}>
               This editor allows you to create sheet music using both mouse and keyboard. 
               Use the toolbar above to change note duration, add dots, or manage measures.
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                   <h4 className="font-bold mb-1" style={{ color: theme.text }}>🖱️ Mouse Interactions</h4>
                   <ul className="list-disc list-inside space-y-1" style={{ color: theme.secondaryText }}>
                      <li>Click anywhere in a measure to place the cursor.</li>
                      <li>Click existing notes to select them.</li>
                      <li>Click the background to deselect.</li>
                   </ul>
                </div>
                <div>
                   <h4 className="font-bold mb-1" style={{ color: theme.text }}>⌨️ Keyboard Interactions</h4>
                   <ul className="list-disc list-inside space-y-1" style={{ color: theme.secondaryText }}>
                      <li>Use <kbd className="font-mono px-1 rounded" style={{ backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.accent }}>Arrow Keys</kbd> to move the cursor.</li>
                      <li>Press <kbd className="font-mono px-1 rounded" style={{ backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.accent }}>Enter</kbd> to add a note at the cursor.</li>
                      <li>Press <kbd className="font-mono px-1 rounded" style={{ backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.accent }}>Space</kbd> to play/pause.</li>
                   </ul>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ShortcutGroup title="Playback" shortcuts={shortcuts.playback} theme={theme} />
              <ShortcutGroup title="Selection" shortcuts={shortcuts.selection} theme={theme} />
            </div>
            <div>
              <ShortcutGroup title="Editing" shortcuts={shortcuts.editing} theme={theme} />
              <ShortcutGroup title="Modifiers" shortcuts={shortcuts.modifiers} theme={theme} />
              <ShortcutGroup title="Durations" shortcuts={shortcuts.durations} theme={theme} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-center text-xs" style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.secondaryText }}>
          Press <kbd className="px-1 py-0.5 rounded border font-mono" style={{ backgroundColor: theme.buttonBackground, borderColor: theme.border, color: theme.text }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default ShortcutsOverlay;
