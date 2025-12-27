import { useState, useEffect } from 'react';

/**
 * Tracks whether modifier keys (Ctrl/Meta) are being held.
 * Useful for cursor changes and chord entry hints.
 */
export function useModifierKeys() {
  const [modifierHeld, setModifierHeld] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) setModifierHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) setModifierHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return modifierHeld;
}
