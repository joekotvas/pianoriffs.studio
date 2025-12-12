import { useMemo, useRef } from 'react';
import { ScoreEvent } from '../types';
import { calculateChordLayout } from '../engines/layout';
import { HitZone } from '../engines/layout/types';
import { CONFIG } from '../config';

interface PreviewNote {
  measureIndex: number;
  index: number;
  mode: 'CHORD' | 'INSERT' | 'APPEND';
  duration: string;
  dotted: boolean;
  pitch?: string;
  isRest?: boolean;
  [key: string]: any;
}

interface UsePreviewRenderParams {
  previewNote: PreviewNote | null;
  events: ScoreEvent[];
  measureIndex: number;
  isLast: boolean;
  clef: string;
  hitZones: HitZone[];
  eventPositions: Record<string, number>;
  totalWidth: number;
  selectedNotes?: any[];
}

interface PreviewRenderResult {
  chordNotes: any[];
  quant: number;
  x: number;
  chordLayout: any;
}

/**
 * Hook to calculate preview (ghost note/rest) rendering data.
 * 
 * Handles:
 * - Preview positioning based on mode (CHORD, INSERT, APPEND)
 * - Overflow preview for last measure
 * - Rest preview caching to prevent recalculation on pitch changes
 * - Hiding preview when selection is active
 */
export function usePreviewRender({
  previewNote,
  events,
  measureIndex,
  isLast,
  clef,
  hitZones,
  eventPositions,
  totalWidth,
  selectedNotes
}: UsePreviewRenderParams): PreviewRenderResult | null {
  // Cache for rest previews to prevent recalculation on pitch changes
  const restPreviewCacheRef = useRef<{ key: string; result: PreviewRenderResult } | null>(null);

  return useMemo(() => {
    if (!previewNote) return null;

    // Hide preview when there are selected notes (user is in "edit selection" mode)
    if (selectedNotes && selectedNotes.length > 0) return null;

    // Allow rendering if it's for this measure OR if it's for the next measure (overflow) and we are the last measure
    const isOverflowPreview = isLast && previewNote.measureIndex === measureIndex + 1;
    if (previewNote.measureIndex !== measureIndex && !isOverflowPreview) {
      return null;
    }

    // For rests, use cached result if key fields haven't changed (ignore pitch)
    if (previewNote.isRest) {
      const cacheKey = `${previewNote.measureIndex}-${previewNote.index}-${previewNote.mode}-${previewNote.duration}-${previewNote.dotted}`;
      if (restPreviewCacheRef.current && restPreviewCacheRef.current.key === cacheKey) {
        return restPreviewCacheRef.current.result;
      }
    }

    const visualTempNote = {
      ...previewNote,
      quant: 0, // Not used for positioning anymore
      id: 'preview'
    };

    let combinedNotes: any[] = [visualTempNote];
    let xPos = 0;

    if (isOverflowPreview) {
      const lastInsertZone = hitZones.find(z => z.type === 'INSERT' && z.index === events.length);
      if (lastInsertZone) {
        xPos = lastInsertZone.startX + (lastInsertZone.endX - lastInsertZone.startX) / 2;
      } else {
        xPos = totalWidth - CONFIG.measurePaddingRight;
      }
    } else if (previewNote.mode === 'CHORD') {
      const existingEvent = events[previewNote.index];
      if (existingEvent) {
        xPos = eventPositions[existingEvent.id];
        combinedNotes = [...(existingEvent.notes as any[]), visualTempNote];
      }
    } else if (previewNote.mode === 'INSERT') {
      const insertZone = hitZones.find(z => z.type === 'INSERT' && z.index === previewNote.index);
      if (insertZone) {
        xPos = insertZone.startX + (insertZone.endX - insertZone.startX) / 2;
      } else {
        if (previewNote.index < events.length) {
          xPos = eventPositions[events[previewNote.index].id] - 20;
        } else {
          xPos = totalWidth - CONFIG.measurePaddingRight;
        }
      }
    } else {
      // APPEND
      const appendZone = hitZones.find(z => z.type === 'APPEND');
      xPos = appendZone ? appendZone.startX : 0;
    }

    // Use any to match layout engine's flexible typing
    const chordLayout = calculateChordLayout(combinedNotes as any, clef);

    const result: PreviewRenderResult = {
      chordNotes: combinedNotes,
      quant: 0,
      x: xPos,
      chordLayout
    };

    // Cache rest preview result
    if (previewNote.isRest) {
      const cacheKey = `${previewNote.measureIndex}-${previewNote.index}-${previewNote.mode}-${previewNote.duration}-${previewNote.dotted}`;
      restPreviewCacheRef.current = { key: cacheKey, result };
    }

    return result;
  }, [previewNote, events, measureIndex, isLast, clef, hitZones, eventPositions, totalWidth, selectedNotes]);
}
