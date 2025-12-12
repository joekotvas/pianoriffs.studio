/**
 * Handles navigation keyboard shortcuts (Arrow keys).
 * @param switchStaff - Optional function to switch between staves (for Grand Staff)
 */
export const handleNavigation = (
    e: KeyboardEvent,
    moveSelection: (direction: string, isShift: boolean) => void,
    switchStaff?: (direction: 'up' | 'down') => void
) => {
    if (!e.key.startsWith('Arrow')) return false;

    const direction = e.key.replace('Arrow', '').toLowerCase(); // left, right, up, down

    // Alt+Up/Down = Switch Staff (for Grand Staff)
    if ((direction === 'up' || direction === 'down') && e.altKey && switchStaff) {
        e.preventDefault();
        switchStaff(direction as 'up' | 'down');
        return true;
    }

    if (direction === 'left' || direction === 'right') {
        e.preventDefault();
        moveSelection(direction, e.shiftKey);
        return true;
    }

    if (direction === 'up' || direction === 'down') {
        // Only handle navigation if Meta/Ctrl is pressed (Chord Navigation)
        // Otherwise it's transposition (handled by handleMutation)
        if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            moveSelection(direction, e.shiftKey);
            return true;
        }
    }

    return false;
};
