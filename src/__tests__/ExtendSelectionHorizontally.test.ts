/**
 * ExtendSelectionHorizontally Tests
 *
 * Tests for horizontal selection extension command.
 * Covers: single-staff, multi-staff, anchor slice, contraction/expansion, edge cases.
 *
 * @see ExtendSelectionHorizontallyCommand
 * @see Issue #124
 */

import { ExtendSelectionHorizontallyCommand } from '@/commands/selection';
import { Selection, createDefaultSelection } from '@/types';
import {
  createTwoStaffScore,
  createMultiStaffSelection,
  createTestScore,
} from './fixtures/selectionTestScores';

describe('ExtendSelectionHorizontallyCommand', () => {
  describe('single-staff extension (Shift+Arrow)', () => {
    it('extends right by 1 event', () => {
      const score = createTwoStaffScore();
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e1',
        noteId: 't-n1',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
      };

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      const result = command.execute(selection, score);

      // Should now have 2 notes selected (original + next event)
      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes).toContainEqual({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e1',
        noteId: 't-n1',
      });
      expect(result.selectedNotes).toContainEqual({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e2',
        noteId: 't-n2',
      });
      // Focus should be on the newly added note
      expect(result.eventId).toBe('t-e2');
      // Anchor preserved
      expect(result.anchor).toEqual(selection.anchor);
    });

    it('extends left by 1 event', () => {
      const score = createTwoStaffScore();
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e2',
        noteId: 't-n2',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' },
      };

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      const result = command.execute(selection, score);

      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes).toContainEqual({
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e1',
        noteId: 't-n1',
      });
      expect(result.eventId).toBe('t-e1');
    });

    it('no-op when at score start (left)', () => {
      const score = createTwoStaffScore();
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e1',
        noteId: 't-n1',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
      };

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      const result = command.execute(selection, score);

      // Selection unchanged
      expect(result.selectedNotes).toHaveLength(1);
      expect(result).toEqual(selection);
    });
  });

  describe('anchor-cursor contraction and expansion', () => {
    it('contracts selection when pressing Shift+Left after extending right', () => {
      const score = createTwoStaffScore();

      // Start with anchor at e1, selection extended to e1, e2, e3
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e3', // Focus at rightmost
        noteId: 't-n3',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
          { staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' },
          { staffIndex: 0, measureIndex: 0, eventId: 't-e3', noteId: 't-n3' },
        ],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
      };

      // Shift+Left should CONTRACT (remove e3)
      const command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      const result = command.execute(selection, score);

      // Should now have only e1 and e2
      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e1');
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e2');
      expect(result.selectedNotes.map((n) => n.eventId)).not.toContain('t-e3');
      // Focus should move to e2
      expect(result.eventId).toBe('t-e2');
      // Anchor preserved
      expect(result.anchor).toEqual(selection.anchor);
    });

    it('contracts to anchor only, then expands left past anchor', () => {
      const score = createTwoStaffScore();

      // Start with anchor at e2, selection is just e2 (anchor only)
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e2',
        noteId: 't-n2',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' },
      };

      // Shift+Left should EXPAND left (add e1)
      const command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      const result = command.execute(selection, score);

      // Should now have e1 and e2
      expect(result.selectedNotes).toHaveLength(2);
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e1');
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e2');
      // Focus should be on e1
      expect(result.eventId).toBe('t-e1');
      // Anchor preserved at e2
      expect(result.anchor).toEqual(selection.anchor);
    });

    it('full cycle: expand right, contract to anchor, expand left', () => {
      const score = createTwoStaffScore();

      // Step 1: Start with single selection at e2 (anchor)
      let selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e2',
        noteId: 't-n2',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e2', noteId: 't-n2' },
      };

      // Step 2: Extend RIGHT to e3
      let command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      selection = command.execute(selection, score);
      expect(selection.selectedNotes).toHaveLength(2);
      expect(selection.selectedNotes.map((n) => n.eventId)).toEqual(
        expect.arrayContaining(['t-e2', 't-e3'])
      );

      // Step 3: Extend RIGHT to e4
      command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      selection = command.execute(selection, score);
      expect(selection.selectedNotes).toHaveLength(3);
      expect(selection.selectedNotes.map((n) => n.eventId)).toEqual(
        expect.arrayContaining(['t-e2', 't-e3', 't-e4'])
      );

      // Step 4: Contract LEFT (should remove e4)
      command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      selection = command.execute(selection, score);
      expect(selection.selectedNotes).toHaveLength(2);
      expect(selection.selectedNotes.map((n) => n.eventId)).toEqual(
        expect.arrayContaining(['t-e2', 't-e3'])
      );

      // Step 5: Contract LEFT (should remove e3, back to anchor only)
      command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      selection = command.execute(selection, score);
      expect(selection.selectedNotes).toHaveLength(1);
      expect(selection.selectedNotes[0].eventId).toBe('t-e2');

      // Step 6: Expand LEFT (now past anchor, should add e1)
      command = new ExtendSelectionHorizontallyCommand({ direction: 'left' });
      selection = command.execute(selection, score);
      expect(selection.selectedNotes).toHaveLength(2);
      expect(selection.selectedNotes.map((n) => n.eventId)).toEqual(
        expect.arrayContaining(['t-e1', 't-e2'])
      );
    });
  });

  describe('multi-staff extension', () => {
    it('extends right on ALL staves independently', () => {
      const { score, selection } = createMultiStaffSelection();

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      const result = command.execute(selection, score);

      // Should have extended on both staves
      const trebleNotes = result.selectedNotes.filter((n) => n.staffIndex === 0);
      const bassNotes = result.selectedNotes.filter((n) => n.staffIndex === 1);

      // Both staves should have more notes than before
      expect(trebleNotes.length).toBeGreaterThan(1);
      expect(bassNotes.length).toBeGreaterThan(1);

      // Anchor preserved
      expect(result.anchor).toEqual(selection.anchor);
    });

    it('preserves multi-staff selection (the bug fix)', () => {
      const { score, selection } = createMultiStaffSelection();

      // Verify starting state has notes on both staves
      const initialTreble = selection.selectedNotes.filter((n) => n.staffIndex === 0);
      const initialBass = selection.selectedNotes.filter((n) => n.staffIndex === 1);
      expect(initialTreble.length).toBeGreaterThan(0);
      expect(initialBass.length).toBeGreaterThan(0);

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      const result = command.execute(selection, score);

      // After extension, BOTH staves should still have notes (not dropped)
      const resultTreble = result.selectedNotes.filter((n) => n.staffIndex === 0);
      const resultBass = result.selectedNotes.filter((n) => n.staffIndex === 1);
      expect(resultTreble.length).toBeGreaterThan(0);
      expect(resultBass.length).toBeGreaterThan(0);
    });
  });

  describe('Shift+Click extension (with target)', () => {
    it('extends to target position on affected staves only', () => {
      const score = createTwoStaffScore();
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e1',
        noteId: 't-n1',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' },
      };

      // Click on t-e3 (2 events to the right) - only treble staff affected
      const command = new ExtendSelectionHorizontallyCommand({
        direction: 'right',
        target: { staffIndex: 0, measureIndex: 0, eventId: 't-e3', noteId: 't-n3' },
      });
      const result = command.execute(selection, score);

      // Should have ONLY treble notes: t-e1, t-e2, t-e3
      // No bass notes - bass staff was not in original selection and is not click target
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e1');
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e2');
      expect(result.selectedNotes.map((n) => n.eventId)).toContain('t-e3');
      expect(result.selectedNotes.map((n) => n.eventId)).not.toContain('b-e3');
      expect(result.selectedNotes).toHaveLength(3);

      // All selected notes should be on treble staff
      expect(result.selectedNotes.every((n) => n.staffIndex === 0)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('no-op on empty selection', () => {
      const score = createTwoStaffScore();
      const selection = createDefaultSelection();

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      const result = command.execute(selection, score);

      expect(result).toEqual(selection);
    });

    it('handles selection without anchor by creating one from focus', () => {
      const score = createTwoStaffScore();
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 't-e1',
        noteId: 't-n1',
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 't-e1', noteId: 't-n1' }],
        anchor: null, // No anchor
      };

      const command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      const result = command.execute(selection, score);

      // Should still extend (using focus as implicit anchor)
      expect(result.selectedNotes).toHaveLength(2);
    });
  });

  describe('anchor slice full selection', () => {
    it('includes all notes in anchor chord when extending', () => {
      // Use a score with chords (createTestScore has a 3-note chord at e0)
      const score = createTestScore();

      // Start with only ONE note from the 3-note chord selected as anchor
      // Chord at e0 has notes: n0, n1, n2
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'e0',
        noteId: 'n0', // Only the first note selected
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }],
        anchor: { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      };

      // Extend right to the next event (e1)
      const command = new ExtendSelectionHorizontallyCommand({ direction: 'right' });
      const result = command.execute(selection, score);

      // The selection should include:
      // - ALL notes from anchor chord (n0, n1, n2) at e0
      // - The single note from e1 (n3)
      const e0Notes = result.selectedNotes.filter((n) => n.eventId === 'e0');
      const e1Notes = result.selectedNotes.filter((n) => n.eventId === 'e1');

      // All 3 notes from the anchor chord should be included
      expect(e0Notes).toHaveLength(3);
      expect(e0Notes.map((n) => n.noteId)).toEqual(expect.arrayContaining(['n0', 'n1', 'n2']));

      // The next event's note should be included
      expect(e1Notes).toHaveLength(1);
      expect(e1Notes[0].noteId).toBe('n3');

      // Total: 4 notes
      expect(result.selectedNotes).toHaveLength(4);

      // Anchor should still be the original single note
      expect(result.anchor).toEqual(selection.anchor);
    });
  });
});
