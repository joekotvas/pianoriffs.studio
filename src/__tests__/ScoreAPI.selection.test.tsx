/**
 * ScoreAPI.selection.test.tsx
 *
 * Tests for selection enhancement methods (Phase 7C).
 * Covers: selectAtQuant, addToSelection, selectRangeTo.
 */

import { render, act } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';

const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('ScoreAPI Selection Enhancements (Phase 7C)', () => {
  beforeEach(() => {
    Element.prototype.scrollTo = jest.fn();
  });

  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
    jest.restoreAllMocks();
  });

  describe('selectAtQuant', () => {
    test('selects event at quant position 0', () => {
      render(<RiffScore id="quant-0" />);
      const api = getAPI('quant-0');

      // Add two notes to have events at different quants
      act(() => {
        api.select(1).addNote('C4', 'quarter').addNote('D4', 'quarter');
      });

      // Select at quant 0 (first quarter note)
      act(() => {
        api.selectAtQuant(1, 0, 0);
      });

      const sel = api.getSelection();
      expect(sel.measureIndex).toBe(0);
      // First event should be selected
      const firstEvent = api.getScore().staves[0].measures[0].events[0];
      expect(sel.eventId).toBe(firstEvent.id);
    });

    test('selects event at quant position 16 (second quarter)', () => {
      render(<RiffScore id="quant-16" />);
      const api = getAPI('quant-16');

      // Add two quarter notes (16 quants each)
      act(() => {
        api.select(1).addNote('C4', 'quarter').addNote('D4', 'quarter');
      });

      // Select at quant 16 (second quarter note)
      act(() => {
        api.selectAtQuant(1, 16, 0);
      });

      const sel = api.getSelection();
      const secondEvent = api.getScore().staves[0].measures[0].events[1];
      expect(sel.eventId).toBe(secondEvent.id);
    });

    test('returns this for chaining', () => {
      render(<RiffScore id="quant-chain" />);
      const api = getAPI('quant-chain');

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.selectAtQuant(1, 0, 0);
      });

      expect(result).toBe(api);
    });
  });

  describe('addToSelection', () => {
    test('adds note to existing selection', () => {
      render(<RiffScore id="add-sel" />);
      const api = getAPI('add-sel');

      // Add two notes
      act(() => {
        api.select(1).addNote('C4', 'quarter').addNote('D4', 'quarter');
      });

      // Select first note
      act(() => {
        api.select(1, 0, 0, 0);
      });

      // Add second note to selection
      act(() => {
        api.addToSelection(1, 0, 1, 0);
      });

      const sel = api.getSelection();
      expect(sel.selectedNotes.length).toBe(2);
    });

    test('toggles note off when already selected', () => {
      render(<RiffScore id="toggle-off" />);
      const api = getAPI('toggle-off');

      // Add two notes
      act(() => {
        api.select(1).addNote('C4', 'quarter').addNote('D4', 'quarter');
      });

      // Select first note
      act(() => {
        api.select(1, 0, 0, 0);
      });

      // Toggle same note (should remove it)
      act(() => {
        api.addToSelection(1, 0, 0, 0);
      });

      const sel = api.getSelection();
      // Should have no notes or the selection cleared
      expect(sel.selectedNotes.length).toBe(0);
    });

    test('returns this for chaining', () => {
      render(<RiffScore id="add-chain" />);
      const api = getAPI('add-chain');

      act(() => {
        api.select(1).addNote('C4', 'quarter');
      });

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.addToSelection(1, 0, 0, 0);
      });

      expect(result).toBe(api);
    });
  });

  describe('selectRangeTo', () => {
    test('selects range from anchor to focus', () => {
      render(<RiffScore id="range-sel" />);
      const api = getAPI('range-sel');

      // Add three notes
      act(() => {
        api.select(1).addNote('C4', 'quarter').addNote('D4', 'quarter').addNote('E4', 'quarter');
      });

      // Select first note (sets anchor)
      act(() => {
        api.select(1, 0, 0, 0);
      });

      // Range select to third note
      act(() => {
        api.selectRangeTo(1, 0, 2, 0);
      });

      const sel = api.getSelection();
      // Should have 3 notes selected
      expect(sel.selectedNotes.length).toBe(3);
    });

    test('returns this for chaining', () => {
      render(<RiffScore id="range-chain" />);
      const api = getAPI('range-chain');

      act(() => {
        api.select(1).addNote('C4', 'quarter').addNote('D4', 'quarter');
        api.select(1, 0, 0, 0);
      });

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.selectRangeTo(1, 0, 1, 0);
      });

      expect(result).toBe(api);
    });
  });
});
