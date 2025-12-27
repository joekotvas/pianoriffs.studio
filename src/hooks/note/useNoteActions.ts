/**
 * useNoteActions - Composition Hook for Note CRUD Operations
 *
 * Provides a unified API for all note-level operations, following the CRUD pattern:
 *
 * | Operation | Hook            | Methods                              |
 * |-----------|-----------------|--------------------------------------|
 * | Create    | useNoteEntry    | addNoteToMeasure, addChordToMeasure  |
 * | Read      | useHoverPreview | handleMeasureHover (preview state)   |
 * | Update    | useNotePitch    | updateNotePitch                      |
 * | Delete    | useNoteDelete   | deleteSelected                       |
 *
 * This is a **Composition Hook** that bundles related sub-hooks to reduce prop
 * drilling. Use this when you need multiple note operations together. Use
 * individual hooks from `hooks/note/` for surgical access to a single operation.
 *
 * @see hooks/note/ - Individual focused hooks
 * @see CODING_PATTERNS.md - Composition Hook pattern documentation
 *
 * @module hooks/note/useNoteActions
 */

import { RefObject } from 'react';
import { Score, Selection } from '@/types';
import { Command } from '@/commands/types';
import { InputMode } from '../useEditorTools';
import { useHoverPreview } from './useHoverPreview';
import {
  useNoteEntry,
  NoteInput,
  PlacementOverride,
  ChordNoteInput,
  SelectOptions,
} from './useNoteEntry';
import { useNoteDelete } from './useNoteDelete';
import { useNotePitch } from './useNotePitch';
import { PreviewNote } from '@/utils/entry';
import { HitZone } from '@/engines/layout/types';

/**
 * Props for the useNoteActions composition hook.
 *
 * Bundles the props required by all note-related sub-hooks into a single interface,
 * reducing prop drilling in consumers.
 *
 * @see UseNoteActionsReturn - Return type
 */
export interface UseNoteActionsProps {
  /** Ref to current score state (for reading measure/event data) */
  scoreRef: RefObject<Score>;

  /** Current selection state (for context-aware operations) */
  selection: Selection;

  /** Callback to update selection after operations */
  select: (
    measureIndex: number | null,
    eventId: string | null,
    noteId: string | null,
    staffIndex?: number,
    options?: SelectOptions
  ) => void;

  /** Callback to update preview note state (for hover/keyboard entry) */
  setPreviewNote: (
    note: PreviewNote | null | ((prev: PreviewNote | null) => PreviewNote | null)
  ) => void;

  /** Active duration from toolbar (e.g., 'quarter', 'eighth') */
  activeDuration: string;

  /** Whether dotted duration is active */
  isDotted: boolean;

  /** Active accidental from toolbar (null = natural/default) */
  activeAccidental: 'flat' | 'natural' | 'sharp' | null;

  /** Whether tie mode is active */
  activeTie: boolean;

  /** Quants per measure for current time signature (for capacity checks) */
  currentQuantsPerMeasure: number;

  /** Command dispatcher for state mutations */
  dispatch: (command: Command) => void;

  /** Current input mode (NOTE or REST) */
  inputMode: InputMode;
}

/**
 * Return type for useNoteActions composition hook.
 *
 * Provides a unified API for all note-level operations, organized by CRUD:
 *
 * - **Create:** `addNoteToMeasure`, `addChordToMeasure`
 * - **Read:** `handleMeasureHover` (updates preview state)
 * - **Update:** `updateNotePitch`
 * - **Delete:** `deleteSelected`
 *
 * @see UseNoteActionsProps - Props interface
 */
export interface UseNoteActionsReturn {
  /**
   * Handle mouse hover events to show preview note.
   * (Read operation - updates preview state based on hover position)
   *
   * @param measureIndex - Index of measure being hovered (null = mouse left)
   * @param hit - Hit zone information from layout engine
   * @param pitch - Resolved pitch at hover Y position
   * @param staffIndex - Staff index (0 = treble, 1 = bass for grand staff)
   */
  handleMeasureHover: (
    measureIndex: number | null,
    hit: HitZone | null,
    pitch: string,
    staffIndex?: number
  ) => void;

  /**
   * Add a single note or rest to a measure.
   * (Create operation)
   *
   * @param measureIndex - Target measure index
   * @param newNote - Note data (pitch, mode, index, staffIndex)
   * @param shouldAutoAdvance - Whether to advance cursor after entry
   * @param placementOverride - Optional placement override (INSERT/APPEND/CHORD)
   */
  addNoteToMeasure: (
    measureIndex: number,
    newNote: NoteInput,
    shouldAutoAdvance?: boolean,
    placementOverride?: PlacementOverride | null
  ) => void;

  /**
   * Add a chord (multiple notes) to a measure as a single event.
   * (Create operation)
   *
   * @param measureIndex - Target measure index
   * @param notes - Array of notes to add as chord
   * @param duration - Duration for the chord event
   * @param dotted - Whether the chord is dotted
   */
  addChordToMeasure: (
    measureIndex: number,
    notes: ChordNoteInput[],
    duration: string,
    dotted: boolean
  ) => void;

  /**
   * Delete currently selected notes/events.
   * (Delete operation)
   *
   * Handles both single selection and multi-selection. Clears selection after delete.
   */
  deleteSelected: () => void;

  /**
   * Update the pitch of a specific note (e.g., from drag or arrow keys).
   * (Update operation)
   *
   * @param measureIndex - Measure containing the note
   * @param eventId - Event containing the note
   * @param noteId - ID of the note to update
   * @param newPitch - New pitch value (e.g., 'C4', 'F#5')
   */
  updateNotePitch: (
    measureIndex: number,
    eventId: string,
    noteId: string,
    newPitch: string
  ) => void;
}

/**
 * Composition Hook for note-level CRUD operations.
 *
 * Bundles related sub-hooks into a unified API, reducing prop drilling when
 * multiple note operations are needed together.
 *
 * **CRUD Mapping:**
 * - **Create:** `useNoteEntry` → `addNoteToMeasure`, `addChordToMeasure`
 * - **Read:** `useHoverPreview` → `handleMeasureHover`
 * - **Update:** `useNotePitch` → `updateNotePitch`
 * - **Delete:** `useNoteDelete` → `deleteSelected`
 *
 * @param props - Bundled props for all sub-hooks
 * @returns Unified API for note operations
 *
 * @example
 * ```typescript
 * const noteActions = useNoteActions({
 *   scoreRef, selection, select, setPreviewNote,
 *   activeDuration, isDotted, activeAccidental, activeTie,
 *   currentQuantsPerMeasure, dispatch, inputMode,
 * });
 *
 * // Create: Add a note
 * noteActions.addNoteToMeasure(0, { pitch: 'C4' }, true);
 *
 * // Update: Change pitch
 * noteActions.updateNotePitch(0, 'event-1', 'note-1', 'D4');
 *
 * // Delete: Remove selected
 * noteActions.deleteSelected();
 * ```
 *
 * @see hooks/note/ - Individual focused hooks for surgical access
 * @see CODING_PATTERNS.md - Composition Hook pattern documentation
 */
export const useNoteActions = ({
  scoreRef,
  selection,
  select,
  setPreviewNote,
  activeDuration,
  isDotted,
  activeAccidental,
  activeTie,
  currentQuantsPerMeasure,
  dispatch,
  inputMode,
}: UseNoteActionsProps): UseNoteActionsReturn => {
  // --- READ: Hover preview for ghost note display ---
  const { handleMeasureHover } = useHoverPreview({
    scoreRef,
    setPreviewNote,
    activeDuration,
    isDotted,
    activeAccidental,
    currentQuantsPerMeasure,
    inputMode,
  });

  // --- CREATE: Note and chord entry ---
  const { addNoteToMeasure, addChordToMeasure } = useNoteEntry({
    scoreRef,
    selection,
    select,
    setPreviewNote,
    activeDuration,
    isDotted,
    activeAccidental,
    activeTie,
    currentQuantsPerMeasure,
    dispatch,
    inputMode,
  });

  // --- DELETE: Note/event removal ---
  const { deleteSelected } = useNoteDelete({
    selection,
    select,
    dispatch,
  });

  // --- UPDATE: Pitch modification ---
  const { updateNotePitch } = useNotePitch({
    selection,
    dispatch,
  });

  return {
    // Read
    handleMeasureHover,
    // Create
    addNoteToMeasure,
    addChordToMeasure,
    // Delete
    deleteSelected,
    // Update
    updateNotePitch,
  };
};
