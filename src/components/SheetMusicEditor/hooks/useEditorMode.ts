import { useMemo } from 'react';
import { Selection } from '../types';

export type EditorState = 
    | 'SELECTION_READY'   // User has an active selection (editing existing notes)
    | 'ENTRY_READY'       // User has a preview cursor (ready to place new notes)
    | 'IDLE';             // No active focus

interface UseEditorModeProps {
    selection: Selection;
    previewNote: any | null;
}

/**
 * Derives the high-level input state of the editor.
 * Distinguishes between "Editing Selection" vs "Entering Notes".
 */
export const useEditorMode = ({ selection, previewNote }: UseEditorModeProps) => {
    
    const editorState: EditorState = useMemo(() => {
        // 1. SELECTION_READY: Active event selection takes precedence
        if (selection.eventId && selection.measureIndex !== null) {
            return 'SELECTION_READY';
        }

        // 2. ENTRY_READY: Preview note exists (Mouse hover or Keyboard cursor)
        if (previewNote) {
            return 'ENTRY_READY';
        }

        // 3. IDLE: No focus
        return 'IDLE';
    }, [selection, previewNote]);

    return {
        editorState,
        // Helper booleans for easier JSX usage
        isSelectionMode: editorState === 'SELECTION_READY',
        isEntryMode: editorState === 'ENTRY_READY'
    };
};
