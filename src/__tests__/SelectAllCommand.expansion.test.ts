/**
 * SelectAllCommand - Progressive Expansion Tests
 *
 * Tests hierarchical expansion logic:
 * Hierarchy: Note → Measure → Staff → Score
 *
 * Core Principle: Fill lowest incomplete container level first,
 * only expand up when current level is fully selected for all touched items.
 *
 * @see Issue #99
 */

import { SelectAllCommand } from '../commands/selection/SelectAllCommand';
import type { Selection } from '../types';
import { createDefaultSelection } from '../types';
import { createTestScore, createSingleStaffScore } from './helpers/selectAllFixtures';

describe('SelectAllCommand - progressive expansion', () => {
  const score = createTestScore();

  describe('specification scenarios', () => {
    /**
     * Scenario 1: Multi-Measure Selection (Partial measures)
     */
    it('Scenario 1: should fill partial measures across multiple measures', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(4);
      expect(result.selectedNotes.every(n => n.staffIndex === 0)).toBe(true);
    });

    /**
     * Scenario 2: Mixed Completeness ("Bubble Up" Check)
     */
    it('Scenario 2: should fill partial measure even when other measures are full', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(4);

      const trebleM0Notes = result.selectedNotes.filter(
        n => n.staffIndex === 0 && n.measureIndex === 0
      );
      expect(trebleM0Notes.length).toBe(3);

      const bassM0Notes = result.selectedNotes.filter(
        n => n.staffIndex === 1 && n.measureIndex === 0
      );
      expect(bassM0Notes.length).toBe(1);
    });

    /**
     * Scenario 3: Staff Expansion
     */
    it('Scenario 3: should expand to staves when all touched measures are full', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);

      const trebleNotes = result.selectedNotes.filter(n => n.staffIndex === 0);
      expect(trebleNotes.length).toBe(4);

      const bassNotes = result.selectedNotes.filter(n => n.staffIndex === 1);
      expect(bassNotes.length).toBe(2);
    });

    /**
     * Scenario 4: Score Expansion
     */
    it('Scenario 4: should stay at score level when all staves are full', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
          { staffIndex: 1, measureIndex: 0, eventId: 'event-1-0-0', noteId: 'note-5' },
          { staffIndex: 1, measureIndex: 1, eventId: 'event-1-1-0', noteId: 'note-6' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });

    it('should select entire score when no notes are selected', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        selectedNotes: [],
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  describe('level transitions', () => {
    it('should expand from event to measure when event is fully selected', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(3);
    });

    it('should expand from measure to staff when measure is fully selected', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(4);
    });

    it('should expand from staff to score when staff is fully selected', () => {
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-2' },
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-1', noteId: 'note-3' },
          { staffIndex: 0, measureIndex: 1, eventId: 'event-0-1-0', noteId: 'note-4' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  describe('single staff score', () => {
    it('should work correctly on single staff score', () => {
      const singleStaff = createSingleStaffScore();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, singleStaff);

      expect(result.selectedNotes.length).toBe(2);
    });

    it('should expand from measure to score directly on single staff', () => {
      const singleStaff = createSingleStaffScore();
      const selection: Selection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: 'event-0-0-0',
        noteId: 'note-1',
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'event-0-0-0', noteId: 'note-1' },
        ],
        anchor: null,
      };

      const command = new SelectAllCommand({ expandIfSelected: true });
      const result = command.execute(selection, singleStaff);

      expect(result.selectedNotes.length).toBe(2);
    });
  });
});
