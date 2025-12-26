/**
 * useEditorMode Hook Tests
 *
 * Tests for editor state determination (IDLE, SELECTION_READY, ENTRY_READY).
 *
 * @see useEditorMode
 */

import { renderHook } from '@testing-library/react';
import { useEditorMode } from '@/hooks/useEditorMode';
import { createDefaultSelection } from '@/types';
import type { Selection, PreviewNote } from '@/types';

describe('useEditorMode', () => {
  it('returns IDLE when nothing is selected or previewed', () => {
    const { result } = renderHook(() =>
      useEditorMode({
        selection: createDefaultSelection(),
        previewNote: null,
      })
    );

    expect(result.current.editorState).toBe('IDLE');
    expect(result.current.isSelectionMode).toBe(false);
    expect(result.current.isEntryMode).toBe(false);
  });

  it('returns SELECTION_READY when an event is selected', () => {
    const selection: Selection = { ...createDefaultSelection(), measureIndex: 0, eventId: 'e1' };
    const { result } = renderHook(() =>
      useEditorMode({
        selection,
        previewNote: null,
      })
    );

    expect(result.current.editorState).toBe('SELECTION_READY');
    expect(result.current.isSelectionMode).toBe(true);
  });

  it('returns ENTRY_READY when a preview note exists', () => {
    const previewNote: PreviewNote = {
      pitch: 'C4',
      measureIndex: 0,
      staffIndex: 0,
      quant: 0,
      visualQuant: 0,
      duration: 'quarter',
      dotted: false,
      mode: 'APPEND',
      index: 0,
      isRest: false,
    };
    const { result } = renderHook(() =>
      useEditorMode({
        selection: createDefaultSelection(),
        previewNote,
      })
    );

    expect(result.current.editorState).toBe('ENTRY_READY');
    expect(result.current.isEntryMode).toBe(true);
  });

  it('prioritizes SELECTION_READY over ENTRY_READY if both exist', () => {
    // This simulates the case where user might hover (preview) while having a selection.
    // We decided that "Selection" implies the primary keyboard context is Editing.
    const selection: Selection = { ...createDefaultSelection(), measureIndex: 0, eventId: 'e1' };
    const previewNote: PreviewNote = {
      pitch: 'C4',
      measureIndex: 0,
      staffIndex: 0,
      quant: 0,
      visualQuant: 0,
      duration: 'quarter',
      dotted: false,
      mode: 'APPEND',
      index: 0,
      isRest: false,
    };
    const { result } = renderHook(() =>
      useEditorMode({
        selection,
        previewNote,
      })
    );

    expect(result.current.editorState).toBe('SELECTION_READY');
  });
});
