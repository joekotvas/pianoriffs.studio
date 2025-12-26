/**
 * Selection Utility Tests
 *
 * Tests for selection utilities: compareIds, isNoteSelected, toggleNoteInSelection.
 *
 * @see selection
 */

import { toggleNoteInSelection, isNoteSelected, compareIds } from '@/utils/selection';
import { createDefaultSelection } from '@/types';

describe('Selection Utils', () => {
  describe('compareIds', () => {
    it('compares strings correctly', () => {
      expect(compareIds('1', '1')).toBe(true);
      expect(compareIds('foo', 'foo')).toBe(true);
      expect(compareIds('1', '2')).toBe(false);
      expect(compareIds(null, undefined)).toBe(true);
    });
  });

  describe('isNoteSelected', () => {
    const mockSelection = {
      ...createDefaultSelection(),
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1',
      noteId: 'n1',
      selectedNotes: [
        { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n1' },
        { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n2' },
      ],
    };

    it('returns true for primary cursor note', () => {
      expect(
        isNoteSelected(mockSelection, {
          staffIndex: 0,
          measureIndex: 0,
          eventId: 'e1',
          noteId: 'n1',
        })
      ).toBe(true);
    });

    it('returns true for secondary selected note', () => {
      expect(
        isNoteSelected(mockSelection, {
          staffIndex: 0,
          measureIndex: 0,
          eventId: 'e1',
          noteId: 'n2',
        })
      ).toBe(true);
    });

    it('returns false for unselected note', () => {
      expect(
        isNoteSelected(mockSelection, {
          staffIndex: 0,
          measureIndex: 0,
          eventId: 'e1',
          noteId: 'n3',
        })
      ).toBe(false);
    });
  });

  describe('toggleNoteInSelection', () => {
    it('adds note if isMulti is true and not present', () => {
      const initial = createDefaultSelection();
      const context = { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n5' };
      const result = toggleNoteInSelection(initial, context, true);

      expect(result.selectedNotes).toHaveLength(1);
      expect(result.selectedNotes[0]).toEqual(expect.objectContaining(context));
      expect(result.noteId).toBe('n5'); // Should become primary
    });

    it('removes note if isMulti is true and already present', () => {
      const context = { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n5' };
      let selection = toggleNoteInSelection(createDefaultSelection(), context, true);

      // Toggle again
      selection = toggleNoteInSelection(selection, context, true);
      expect(selection.selectedNotes).toHaveLength(0);
    });

    it('replaces selection if isMulti is false', () => {
      const initial = {
        ...createDefaultSelection(),
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }],
      };
      const context = { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n5' };
      const result = toggleNoteInSelection(initial, context, false);

      expect(result.selectedNotes).toHaveLength(1);
      expect(result.selectedNotes[0].noteId).toBe('n5');
      expect(result.noteId).toBe('n5');
    });
  });
});
