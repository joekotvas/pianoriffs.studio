/**
 * Options for creating a preview note.
 */
export interface PreviewNoteOptions {
  /** Target measure index */
  measureIndex: number;
  /** Target staff index */
  staffIndex: number;
  /** Pitch to preview (e.g., 'C4') */
  pitch: string;
  /** Duration value (e.g., 'quarter', 'eighth') */
  duration: string;
  /** Whether the note is dotted */
  dotted: boolean;
  /** Preview mode: 'APPEND', 'INSERT', or 'CHORD' */
  mode: 'APPEND' | 'INSERT' | 'CHORD';
  /** Index for INSERT mode or event index for CHORD mode */
  index: number;
  /** Event ID for CHORD mode */
  eventId?: string;
  /** Whether this is a rest preview */
  isRest?: boolean;
  /** Source of the preview: 'hover' or 'keyboard' */
  source?: 'hover' | 'keyboard' | 'mouse';
}

/**
 * A preview note object used for visual feedback during note entry.
 */
export interface PreviewNote extends PreviewNoteOptions {
  /** Quantized position (usually 0 for previews) */
  quant: number;
  /** Visual quant position */
  visualQuant: number;
  /** Whether this is a rest preview (mandatory) */
  isRest: boolean;
}

/**
 * Creates a preview note object for visual feedback during note entry.
 *
 * This utility centralizes preview note construction to ensure consistency
 * and reduce duplication in hover and keyboard entry handlers.
 *
 * @param options - Preview note options
 * @returns A PreviewNote object for rendering
 *
 * @example
 * ```typescript
 * const preview = createPreviewNote({
 *   measureIndex: 0,
 *   staffIndex: 0,
 *   pitch: 'C4',
 *   duration: 'quarter',
 *   dotted: false,
 *   mode: 'APPEND',
 *   index: 0,
 *   source: 'hover',
 * });
 * setPreviewNote(preview);
 * ```
 *
 * @tested src/__tests__/utils/entry/previewNote.test.ts
 */
export function createPreviewNote(options: PreviewNoteOptions): PreviewNote {
  return {
    measureIndex: options.measureIndex,
    staffIndex: options.staffIndex,
    quant: 0,
    visualQuant: 0,
    pitch: options.pitch,
    duration: options.duration,
    dotted: options.dotted,
    mode: options.mode,
    index: options.index,
    eventId: options.eventId,
    isRest: options.isRest ?? false,
    source: options.source ?? 'hover',
  };
}

/**
 * Checks if two preview notes are equivalent (to avoid unnecessary re-renders).
 *
 * @param prev - Previous preview note (or null)
 * @param next - Next preview note
 * @returns true if previews are equivalent and should not trigger re-render
 *
 * @tested src/__tests__/utils/entry/previewNote.test.ts
 */
export function arePreviewsEqual(prev: PreviewNote | null, next: PreviewNote): boolean {
  if (!prev) return false;

  // For rests, ignore pitch since it's not used
  const pitchMatch = next.isRest ? true : prev.pitch === next.pitch;

  return (
    prev.measureIndex === next.measureIndex &&
    prev.staffIndex === next.staffIndex &&
    pitchMatch &&
    prev.mode === next.mode &&
    prev.index === next.index &&
    prev.isRest === next.isRest &&
    prev.duration === next.duration &&
    prev.dotted === next.dotted
  );
}
