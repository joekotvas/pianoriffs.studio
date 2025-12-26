import { useState, useEffect, useMemo } from 'react';
import React from 'react';

/** CSS rules to hide/show music glyphs based on font loading state */
const FONT_LOADING_CSS = `
  @keyframes fontLoadingPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.3; }
  }
  @keyframes typingEllipsis {
    0% { content: 'Loading'; }
    25% { content: 'Loading.'; }
    50% { content: 'Loading..'; }
    75% { content: 'Loading...'; }
    100% { content: 'Loading'; }
  }
  .RiffScore.font-loading .score-editor-content {
    animation: fontLoadingPulse 3s ease-in-out infinite;
  }
  .RiffScore.font-loaded .score-editor-content {
    animation: none;
    opacity: 1;
    transition: opacity 0.15s ease-in;
  }
  .RiffScore.font-loading svg text {
    visibility: hidden !important;
  }
  .RiffScore.font-loaded svg text {
    visibility: visible;
  }
  /* Loading title overlay */
  .RiffScore.font-loading .ScoreTitleField {
    visibility: hidden;
    position: relative;
  }
  .RiffScore.font-loading .ScoreTitleField::after {
    content: 'Loading';
    animation: typingEllipsis 3s steps(1) infinite;
    position: absolute;
    left: 1.75rem;
    top: 0;
    visibility: visible;
  }
`;

export interface FontLoadedResult {
  isLoaded: boolean; // Whether fonts have finished loading
  className: string; // CSS class name to apply ('font-loaded' or 'font-loading')
  style: React.CSSProperties; // Inline styles for glyph opacity transition
  styleElement: React.ReactElement; // Style element to render for font loading CSS rules
}

/**
 * Hook to detect when fonts have finished loading and provide
 * all necessary styling to prevent FOUC (Flash of Unstyled Content).
 *
 * Uses the document.fonts.ready API to detect font loading completion.
 * Handles SSR environments gracefully by returning loaded state immediately
 * when document.fonts is unavailable.
 *
 * @param timeoutMs - Max time to wait before assuming fonts are loaded (default: 3000ms)
 * @returns Object containing load state, className, inline styles, and CSS style element
 *
 * @example
 * ```tsx
 * const { className, style, styleElement } = useFontLoaded();
 * return (
 *   <div className={`RiffScore ${className}`} style={style}>
 *     {styleElement}
 *     ...content
 *   </div>
 * );
 * ```
 */
export const useFontLoaded = (timeoutMs = 3000): FontLoadedResult => {
  // Always start with false to ensure SSR/client hydration match
  // The actual font check happens in useEffect (client-only)
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Skip if already loaded
    if (isLoaded) return;

    let cancelled = false;

    // No fonts API (legacy browsers) - use timeout only
    if (!document.fonts) {
      const timeout = setTimeout(() => {
        if (!cancelled) setIsLoaded(true);
      }, 100); // Short delay for legacy browsers
      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }

    // Wait for all fonts to finish loading
    document.fonts.ready.then(() => {
      if (!cancelled) {
        setIsLoaded(true);
      }
    });

    // Fallback timeout to prevent indefinite hidden state
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setIsLoaded(true);
      }
    }, timeoutMs);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isLoaded, timeoutMs]);

  // Memoize derived values
  const className = isLoaded ? 'font-loaded' : 'font-loading';

  const style: React.CSSProperties = useMemo(
    () =>
      ({
        '--glyph-opacity': isLoaded ? 1 : 0,
        '--glyph-transition': isLoaded ? 'opacity 0.15s ease-in' : 'none',
      }) as React.CSSProperties,
    [isLoaded]
  );

  const styleElement = useMemo(() => React.createElement('style', null, FONT_LOADING_CSS), []);

  return { isLoaded, className, style, styleElement };
};
