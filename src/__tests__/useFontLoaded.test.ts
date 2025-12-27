/**
 * useFontLoaded Hook Tests
 *
 * Tests for font loading detection, SSR safety, and timeout fallback behavior.
 *
 * @see useFontLoaded
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFontLoaded, FontLoadedResult } from '@/hooks/layout';
import { ReactElement } from 'react';

// Helper to extract CSS content from styleElement
const getCSSContent = (result: { current: FontLoadedResult }): string => {
  const element = result.current.styleElement as ReactElement<{ children: string }>;
  // eslint-disable-next-line testing-library/no-node-access
  return element.props.children;
};

describe('useFontLoaded', () => {
  // Store original document.fonts to restore after tests
  const originalFonts = document.fonts;

  afterEach(() => {
    // Restore document.fonts after each test
    Object.defineProperty(document, 'fonts', {
      value: originalFonts,
      writable: true,
      configurable: true,
    });
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with isLoaded=false for SSR hydration safety', () => {
      const { result } = renderHook(() => useFontLoaded());

      expect(result.current.isLoaded).toBe(false);
      expect(result.current.className).toBe('font-loading');
    });

    it('returns a styleElement containing CSS rules', () => {
      const { result } = renderHook(() => useFontLoaded());

      expect(result.current.styleElement).toBeDefined();
      expect(result.current.styleElement.type).toBe('style');

      const cssContent = getCSSContent(result);
      expect(cssContent).toContain('font-loading');
      expect(cssContent).toContain('font-loaded');
    });
  });

  describe('with document.fonts API available', () => {
    it('sets isLoaded=true when fonts are ready', async () => {
      // Create a resolved promise to simulate fonts.ready
      const readyPromise = Promise.resolve();
      Object.defineProperty(document, 'fonts', {
        value: { ready: readyPromise },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useFontLoaded());

      // Initially loading
      expect(result.current.isLoaded).toBe(false);

      // Wait for fonts.ready promise to resolve
      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
      });

      expect(result.current.className).toBe('font-loaded');
    });

    it('uses timeout fallback if fonts.ready never resolves', async () => {
      jest.useFakeTimers();

      // Create a promise that never resolves
      const neverResolves = new Promise(() => {});
      Object.defineProperty(document, 'fonts', {
        value: { ready: neverResolves },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useFontLoaded(1000));

      expect(result.current.isLoaded).toBe(false);

      // Advance past the timeout
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.className).toBe('font-loaded');
    });
  });

  describe('without document.fonts API (legacy browsers)', () => {
    it('falls back to short timeout when document.fonts is undefined', async () => {
      jest.useFakeTimers();

      // Simulate legacy browser without fonts API
      Object.defineProperty(document, 'fonts', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useFontLoaded());

      expect(result.current.isLoaded).toBe(false);

      // Legacy fallback uses 100ms timeout
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.isLoaded).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('cancels pending operations on unmount', async () => {
      jest.useFakeTimers();

      // Create a promise that never resolves
      const neverResolves = new Promise(() => {});
      Object.defineProperty(document, 'fonts', {
        value: { ready: neverResolves },
        writable: true,
        configurable: true,
      });

      const { result, unmount } = renderHook(() => useFontLoaded(1000));

      expect(result.current.isLoaded).toBe(false);

      // Unmount before timeout
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No error thrown = success
    });
  });

  describe('CSS content', () => {
    it('includes prefers-reduced-motion media query', () => {
      const { result } = renderHook(() => useFontLoaded());

      const cssContent = getCSSContent(result);
      expect(cssContent).toContain('prefers-reduced-motion');
      expect(cssContent).toContain('animation: none');
    });

    it('includes fontLoadingPulse animation', () => {
      const { result } = renderHook(() => useFontLoaded());

      const cssContent = getCSSContent(result);
      expect(cssContent).toContain('@keyframes fontLoadingPulse');
    });

    it('includes typingEllipsis animation for loading title', () => {
      const { result } = renderHook(() => useFontLoaded());

      const cssContent = getCSSContent(result);
      expect(cssContent).toContain('@keyframes typingEllipsis');
      expect(cssContent).toContain("content: 'Loading...'");
    });

    it('disables pointer-events while loading', () => {
      const { result } = renderHook(() => useFontLoaded());

      const cssContent = getCSSContent(result);
      expect(cssContent).toContain('pointer-events: none');
    });
  });
});
