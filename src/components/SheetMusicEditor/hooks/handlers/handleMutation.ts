/**
 * Handles mutation keyboard shortcuts (Enter, Delete, Accidentals, Ties, Transposition, Undo/Redo).
 */
export const handleMutation = (
    e: KeyboardEvent,
    logic: any
) => {
    const { 
        undo, redo, 
        handleAccidentalToggle, handleTieToggle, handleDotToggle,
        deleteSelected, 
        transposeSelection,
        addNoteToMeasure,
        previewNote,
        handleDurationChange
    } = logic;

    // DURATION SHORTCUTS
    // DURATION SHORTCUTS
    const durationMap: { [key: string]: string } = {
        '1': 'sixtyfourth',
        '2': 'thirtysecond',
        '3': 'sixteenth',
        '4': 'eighth',
        '5': 'quarter',
        '6': 'half',
        '7': 'whole'
    };

    if (durationMap[e.key]) {
        e.preventDefault();
        const applyToSelection = e.metaKey || e.ctrlKey;
        handleDurationChange(durationMap[e.key], applyToSelection);
        return true;
    }

    // UNDO / REDO
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return true;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return true;
    }

    // ACCIDENTALS
    if (e.key === '-' || e.key === '_') { e.preventDefault(); handleAccidentalToggle('flat'); return true; }
    if (e.key === '=' || e.key === '+') { e.preventDefault(); handleAccidentalToggle('sharp'); return true; }
    if (e.key === '0') { e.preventDefault(); handleAccidentalToggle('natural'); return true; }

    // TIE
    if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleTieToggle();
        return true;
    }

    // DOT
    if (e.key === '.') {
        e.preventDefault();
        handleDotToggle();
        return true;
    }

    // ENTER (Insert Note)
    if (e.key === 'Enter') {
      e.preventDefault();
      if (previewNote) {
        addNoteToMeasure(previewNote.measureIndex, previewNote, true, { mode: previewNote.mode, index: previewNote.index });
      }
      return true;
    }

    // TRANSPOSITION (Arrow Up/Down)
    // Note: Cmd/Ctrl+ArrowUp/Down is handled by handleNavigation for chord navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        transposeSelection(direction, e.shiftKey);
        return true;
    }

    // DELETE
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return true;
    }

    return false;
};
