/**
 * Note-related hooks for UI interactions.
 *
 * These hooks handle note entry, modification, and deletion operations
 * triggered by user interactions (mouse, keyboard).
 *
 * @module hooks/note
 */

// Composition hook (bundles sub-hooks below)
export {
  useNoteActions,
  type UseNoteActionsProps,
  type UseNoteActionsReturn,
} from './useNoteActions';

// Individual sub-hooks (for surgical access)
export {
  useHoverPreview,
  type UseHoverPreviewProps,
  type UseHoverPreviewReturn,
} from './useHoverPreview';
export { useNoteEntry, type UseNoteEntryProps, type UseNoteEntryReturn } from './useNoteEntry';
export { useNoteDelete, type UseNoteDeleteProps, type UseNoteDeleteReturn } from './useNoteDelete';
export { useNotePitch, type UseNotePitchProps, type UseNotePitchReturn } from './useNotePitch';

// Re-export types from utilities for convenience
export type { PreviewNote, PreviewNoteOptions } from '@/utils/entry';
