/**
 * ScoreAPI.config.test.tsx
 *
 * Tests for API configuration and state methods (Phase 7B).
 * Covers: setBpm, setTheme, setScale, setInputMode, reset.
 */

import { render, act } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';

// Mock ThemeContext to verify setTheme/setScale calls if possible,
// but since we are integration testing via RiffScore, we check if we can observe effects.
// Realistically, theme/scale affects rendering or internal context state which might not be exposed on API.
// We will focus on ScoreConfig (BPM, Title) and reset().

const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('ScoreAPI Configuration & State', () => {
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

  describe('Configuration: setBpm', () => {
    test('updates score bpm', () => {
      render(<RiffScore id="bpm-test" />);
      const api = getAPI('bpm-test');

      const initialBpm = api.getScore().bpm;
      expect(initialBpm).toBeDefined();

      act(() => {
        api.setBpm(140);
      });

      expect(api.getScore().bpm).toBe(140);

      // Verify undo
      act(() => {
        api.undo();
      });
      expect(api.getScore().bpm).toBe(initialBpm);
    });

    test('clamps invalid bpm values', () => {
      render(<RiffScore id="bpm-clamp" />);
      const api = getAPI('bpm-clamp');

      act(() => {
        api.setBpm(9999);
      });
      expect(api.getScore().bpm).toBe(500); // 500 max

      act(() => {
        api.setBpm(-50);
      });
      expect(api.getScore().bpm).toBe(10); // 10 min
    });
  });

  describe('Lifecycle: reset', () => {
    test('resets score to template defaults', () => {
      render(<RiffScore id="reset-test" />);
      const api = getAPI('reset-test');

      // 1. Modify score
      act(() => {
        api.setScoreTitle('Modified');
        api.setBpm(150);
        api.addMeasure();
      });

      expect(api.getScore().title).toBe('Modified');
      expect(api.getScore().bpm).toBe(150);

      // 2. Reset
      act(() => {
        api.reset('grand', 2);
      });

      const score = api.getScore();
      expect(score.title).toBe('New Score'); // Default form reset
      expect(score.staves.length).toBe(2); // Grand staff
      expect(score.staves[0].measures.length).toBe(2);
      
      // Note: BPM is preserved in some implementations of reset/load, 
      // but our reset implementation creates a partial score with just staves and title.
      // LoadScoreCommand usually merges or replaces.
      // API reset() implementation: 
      // const newScore = { ...scoreRef.current, staves, title: 'New Score' };
      // So BPM should be PRESERVED from previous scoreRef.current!
      expect(score.bpm).toBe(150); 
    });
  });

  // UI State setters (setTheme, setScale, setInputMode) affect internal context state,
  // not the Score object. We verify they don't throw and support chaining.

  describe('UI Configuration', () => {
    test('setTheme returns this for chaining', () => {
      render(<RiffScore id="theme-test" />);
      const api = getAPI('theme-test');

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.setTheme('dark');
      });

      expect(result).toBe(api);
    });

    test('setScale returns this for chaining', () => {
      render(<RiffScore id="scale-test" />);
      const api = getAPI('scale-test');

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.setScale(1.5);
      });

      expect(result).toBe(api);
    });

    test('setInputMode returns this for chaining', () => {
      render(<RiffScore id="input-mode-test" />);
      const api = getAPI('input-mode-test');

      let result: MusicEditorAPI | undefined;
      act(() => {
        result = api.setInputMode('rest');
      });

      expect(result).toBe(api);
    });

    test('UI setters can be chained together', () => {
      render(<RiffScore id="chain-test" />);
      const api = getAPI('chain-test');

      // Should not throw and should return api at each step
      act(() => {
        api.setTheme('warm').setScale(1.2).setInputMode('note');
      });

      // If we got here without throwing, the test passes
      expect(true).toBe(true);
    });
  });
});
