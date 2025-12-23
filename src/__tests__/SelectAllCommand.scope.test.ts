/**
 * SelectAllCommand - Explicit Scope Tests
 *
 * Tests for scope: 'event' | 'measure' | 'staff' | 'score'
 * and default behavior (no options).
 *
 * @see Issue #99
 */

import { SelectAllCommand } from '../commands/selection/SelectAllCommand';
import type { Selection } from '../types';
import { createDefaultSelection } from '../types';
import { createTestScore, createScoreWithRests } from './helpers/selectAllFixtures';

describe('SelectAllCommand - explicit scope', () => {
  const score = createTestScore();

  describe('scope: score', () => {
    it('should select all notes in the entire score', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  describe('scope: staff', () => {
    it('should select all notes on staff 0 (treble)', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'staff', staffIndex: 0 });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(4);
      expect(result.selectedNotes.every((n) => n.staffIndex === 0)).toBe(true);
    });

    it('should select all notes on staff 1 (bass)', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'staff', staffIndex: 1 });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(2);
      expect(result.selectedNotes.every((n) => n.staffIndex === 1)).toBe(true);
    });
  });

  describe('scope: measure', () => {
    it('should select all notes in a specific measure', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
      };
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(3);
      expect(result.selectedNotes.every((n) => n.measureIndex === 0)).toBe(true);
    });

    it('should select from bass staff measure', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 1, measureIndex: 1 });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(1);
      expect(result.selectedNotes[0].staffIndex).toBe(1);
      expect(result.selectedNotes[0].measureIndex).toBe(1);
    });
  });

  describe('scope: event', () => {
    it('should select all notes in the first event (chord)', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        staffIndex: 0,
        measureIndex: 0,
      };
      const command = new SelectAllCommand({ scope: 'event', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(2);
      expect(result.selectedNotes.every((n) => n.eventId === 'event-0-0-0')).toBe(true);
    });
  });

  describe('default behavior', () => {
    it('should select entire score when called with empty options', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({});
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });

    it('should select entire score when called with no options', () => {
      const selection = createDefaultSelection();
      const command = new SelectAllCommand();
      const result = command.execute(selection, score);

      expect(result.selectedNotes.length).toBe(6);
    });
  });

  describe('rest handling', () => {
    it('should include rests in selection', () => {
      const scoreWithRests = createScoreWithRests();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, scoreWithRests);

      expect(result.selectedNotes.length).toBe(2);
    });

    it('should select rest with noteId: null', () => {
      const scoreWithRests = createScoreWithRests();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'score' });
      const result = command.execute(selection, scoreWithRests);

      const rest = result.selectedNotes.find((n) => n.eventId === 'event-rest');
      expect(rest).toBeDefined();
      expect(rest?.noteId).toBeNull();
    });

    it('should include rest in measure selection', () => {
      const scoreWithRests = createScoreWithRests();
      const selection = createDefaultSelection();
      const command = new SelectAllCommand({ scope: 'measure', staffIndex: 0, measureIndex: 0 });
      const result = command.execute(selection, scoreWithRests);

      expect(result.selectedNotes.length).toBe(2);
    });
  });
});
