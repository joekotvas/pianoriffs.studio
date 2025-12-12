import { renderHook } from '@testing-library/react';
import { useEditorMode } from '../hooks/useEditorMode';
import { createDefaultSelection } from '../types';

describe('useEditorMode', () => {
    
    it('returns IDLE when nothing is selected or previewed', () => {
        const { result } = renderHook(() => useEditorMode({ 
            selection: createDefaultSelection(), 
            previewNote: null 
        }));
        
        expect(result.current.editorState).toBe('IDLE');
        expect(result.current.isSelectionMode).toBe(false);
        expect(result.current.isEntryMode).toBe(false);
    });

    it('returns SELECTION_READY when an event is selected', () => {
        const selection = { ...createDefaultSelection(), measureIndex: 0, eventId: 'e1' };
        const { result } = renderHook(() => useEditorMode({ 
            selection, 
            previewNote: null 
        }));
        
        expect(result.current.editorState).toBe('SELECTION_READY');
        expect(result.current.isSelectionMode).toBe(true);
    });

    it('returns ENTRY_READY when a preview note exists', () => {
        const { result } = renderHook(() => useEditorMode({ 
            selection: createDefaultSelection(), 
            previewNote: { pitch: 'C4' } 
        }));
        
        expect(result.current.editorState).toBe('ENTRY_READY');
        expect(result.current.isEntryMode).toBe(true);
    });

    it('prioritizes SELECTION_READY over ENTRY_READY if both exist', () => {
        // This simulates the case where user might hover (preview) while having a selection.
        // We decided that "Selection" implies the primary keyboard context is Editing.
        const selection = { ...createDefaultSelection(), measureIndex: 0, eventId: 'e1' };
        const { result } = renderHook(() => useEditorMode({ 
            selection, 
            previewNote: { pitch: 'C4' } 
        }));
        
        expect(result.current.editorState).toBe('SELECTION_READY');
    });
});
