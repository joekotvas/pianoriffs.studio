import { useEffect, useCallback } from 'react';

interface UseFocusTrapOptions {
  /** Ref to the container element that traps focus */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Whether the focus trap is active */
  isActive: boolean;
  /** Called when ESC is pressed */
  onEscape?: () => void;
  /** Ref to element to return focus to when trap is deactivated */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /** Whether to focus the first element on activation */
  autoFocus?: boolean;
  /** Whether to handle arrow key navigation */
  enableArrowKeys?: boolean;
}

/**
 * Hook to trap focus within a container, cycling through focusable elements.
 * Used for toolbars, dropdown menus, and modal dialogs.
 */
export function useFocusTrap({
  containerRef,
  isActive,
  onEscape,
  returnFocusRef,
  autoFocus = true,
  enableArrowKeys = false,
}: UseFocusTrapOptions) {
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, [containerRef]);

  useEffect(() => {
    if (!isActive) return;

    // Auto-focus first element
    if (autoFocus) {
      const timer = setTimeout(() => {
        const elements = getFocusableElements();
        if (elements.length > 0) {
          elements[0].focus();
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isActive, autoFocus, getFocusableElements]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is inside our container
      if (!containerRef.current?.contains(document.activeElement)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onEscape?.();
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = focusableElements.indexOf(activeElement);

      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();

        if (e.shiftKey) {
          const prevIndex =
            (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          focusableElements[prevIndex].focus();
        } else {
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
        }
      } else if (enableArrowKeys && ['ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
      } else if (enableArrowKeys && ['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex].focus();
      }
    };

    // Use capture phase to intercept before default handlers
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);

      // Return focus when trap is deactivated
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
    };
  }, [isActive, onEscape, containerRef, returnFocusRef, enableArrowKeys, getFocusableElements]);
}
