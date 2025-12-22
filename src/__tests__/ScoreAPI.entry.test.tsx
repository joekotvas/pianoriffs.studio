/**
 * ScoreAPI.entry.test.tsx
 *
 * Tests for API entry methods: makeTuplet, unmakeTuplet, toggleTie, setTie, setInputMode
 * Validates error handling, validation logic, and success cases.
 */

import { render, act } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';

// Helper to get typed API
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('ScoreAPI Entry Methods', () => {
  beforeEach(() => {
    // Mock scrollTo for jsdom
    Element.prototype.scrollTo = jest.fn();
  });

  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
    jest.restoreAllMocks();
  });

  describe('makeTuplet', () => {
    test('warns when no selection exists', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<RiffScore id="tuplet-no-sel" />);
      const api = getAPI('tuplet-no-sel');

      // No selection yet - makeTuplet should warn
      act(() => {
        api.makeTuplet(3, 2);
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No selection')
      );
    });

    test('creates tuplet on consecutive events', () => {
      render(<RiffScore id="tuplet-create" />);
      const api = getAPI('tuplet-create');

      // Add 3 notes
      act(() => {
        api.select(1)
          .addNote('C4', 'eighth')
          .addNote('D4', 'eighth')
          .addNote('E4', 'eighth');
      });

      // Verify notes were added
      let score = api.getScore();
      expect(score.staves[0].measures[0].events.length).toBe(3);

      // Select first event and create triplet
      act(() => {
        api.select(1, 0, 0, 0);
      });

      // Verify selection is set
      const sel = api.getSelection();
      expect(sel.measureIndex).toBe(0);
      expect(sel.eventId).not.toBeNull();

      act(() => {
        api.makeTuplet(3, 2);
      });

      // Verify tuplet was created
      score = api.getScore();
      const events = score.staves[0].measures[0].events;
      expect(events[0].tuplet).toBeDefined();
      expect(events[0].tuplet?.ratio).toEqual([3, 2]);
      expect(events[0].tuplet?.groupSize).toBe(3);
    });

    test('warns when target events already contain a tuplet', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<RiffScore id="tuplet-nested" />);
      const api = getAPI('tuplet-nested');

      // Add notes
      act(() => {
        api.select(1)
          .addNote('C4', 'eighth')
          .addNote('D4', 'eighth')
          .addNote('E4', 'eighth');
      });

      // Select first event and create tuplet
      act(() => {
        api.select(1, 0, 0, 0);
      });

      act(() => {
        api.makeTuplet(3, 2);
      });

      // Verify first tuplet was created
      let score = api.getScore();
      expect(score.staves[0].measures[0].events[0].tuplet).toBeDefined();

      warnSpy.mockClear();

      // Try to create another tuplet starting from event 0 (which is already in a tuplet)
      act(() => {
        api.select(1, 0, 0, 0); // Select first event (already in tuplet)
      });

      // Verify selection points to event with tuplet
      const sel = api.getSelection();
      score = api.getScore();
      const event = score.staves[0].measures[0].events.find(e => e.id === sel.eventId);
      expect(event?.tuplet).toBeDefined();

      act(() => {
        api.makeTuplet(3, 2);
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already contain a tuplet')
      );
    });

    test('supports method chaining', () => {
      render(<RiffScore id="tuplet-chain" />);
      const api = getAPI('tuplet-chain');

      // Should be able to chain after makeTuplet
      act(() => {
        api.select(1)
          .addNote('C4', 'eighth')
          .addNote('D4', 'eighth')
          .addNote('E4', 'eighth');
      });

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.select(1, 0, 0, 0).makeTuplet(3, 2);
      });

      expect(result).toBe(api);
    });
  });

  describe('unmakeTuplet', () => {
    test('warns when selected event is not part of a tuplet', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<RiffScore id="unmake-no-tuplet" />);
      const api = getAPI('unmake-no-tuplet');

      act(() => {
        api.select(1).addNote('C4', 'quarter');
        api.unmakeTuplet();
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not part of a tuplet')
      );
    });

    test('removes tuplet from events', () => {
      render(<RiffScore id="unmake-success" />);
      const api = getAPI('unmake-success');

      // Create tuplet
      act(() => {
        api.select(1)
          .addNote('C4', 'eighth')
          .addNote('D4', 'eighth')
          .addNote('E4', 'eighth');
      });

      act(() => {
        api.select(1, 0, 0, 0);
      });

      act(() => {
        api.makeTuplet(3, 2);
      });

      // Verify tuplet exists
      let score = api.getScore();
      expect(score.staves[0].measures[0].events[0].tuplet).toBeDefined();

      // Select an event in the tuplet for removal
      act(() => {
        api.select(1, 0, 0, 0); // Select first event in the tuplet
      });

      // Verify selection
      const sel = api.getSelection();
      expect(sel.eventId).not.toBeNull();

      // Remove tuplet
      act(() => {
        api.unmakeTuplet();
      });

      // Verify tuplet removed from all events
      score = api.getScore();
      expect(score.staves[0].measures[0].events[0].tuplet).toBeUndefined();
      expect(score.staves[0].measures[0].events[1].tuplet).toBeUndefined();
      expect(score.staves[0].measures[0].events[2].tuplet).toBeUndefined();
    });
  });

  describe('toggleTie', () => {
    test('warns when no note selected', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<RiffScore id="tie-no-sel" />);
      const api = getAPI('tie-no-sel');

      act(() => {
        api.toggleTie();
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No note selected')
      );
    });

    test('toggles tie on selected note', () => {
      render(<RiffScore id="tie-toggle" />);
      const api = getAPI('tie-toggle');

      act(() => {
        api.select(1).addNote('C4', 'quarter');
      });

      // Toggle on
      act(() => {
        api.toggleTie();
      });

      let score = api.getScore();
      expect(score.staves[0].measures[0].events[0].notes[0].tied).toBe(true);

      // Toggle off
      act(() => {
        api.toggleTie();
      });

      score = api.getScore();
      expect(score.staves[0].measures[0].events[0].notes[0].tied).toBe(false);
    });
  });

  describe('setTie', () => {
    test('warns when no note selected', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<RiffScore id="tie-set-no-sel" />);
      const api = getAPI('tie-set-no-sel');

      act(() => {
        api.setTie(true);
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No note selected')
      );
    });

    test('sets tie explicitly', () => {
      render(<RiffScore id="tie-set" />);
      const api = getAPI('tie-set');

      act(() => {
        api.select(1).addNote('C4', 'quarter');
      });

      act(() => {
        api.setTie(true);
      });

      let score = api.getScore();
      expect(score.staves[0].measures[0].events[0].notes[0].tied).toBe(true);

      act(() => {
        api.setTie(false);
      });

      score = api.getScore();
      expect(score.staves[0].measures[0].events[0].notes[0].tied).toBe(false);
    });
  });

  describe('setInputMode', () => {
    test('logs warning about UI concept', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<RiffScore id="mode-warn" />);
      const api = getAPI('mode-warn');

      act(() => {
        api.setInputMode('rest');
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Input mode is a UI concept')
      );
    });

    test('supports method chaining', () => {
      render(<RiffScore id="mode-chain" />);
      const api = getAPI('mode-chain');

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.setInputMode('note');
      });

      expect(result).toBe(api);
    });
  });
});
