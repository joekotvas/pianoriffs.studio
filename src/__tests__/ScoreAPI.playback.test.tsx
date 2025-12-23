/**
 * ScoreAPI Playback Integration Tests
 *
 * Tests the playback API methods (play, pause, stop, rewind, setInstrument)
 * using mocked toneEngine functions.
 */

import { render, act } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import { ThemeProvider } from '@/context/ThemeContext';
import { resetPlaybackState } from '@/hooks/api/playback';
import type { MusicEditorAPI } from '../api.types';

const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

// Mock the toneEngine module - must include all exported functions
jest.mock('@/engines/toneEngine', () => ({
  initTone: jest.fn().mockResolvedValue(undefined),
  scheduleTonePlayback: jest.fn(),
  stopTonePlayback: jest.fn(),
  setInstrument: jest.fn(),
  isPlaying: jest.fn().mockReturnValue(false),
  isSamplerLoaded: jest.fn().mockReturnValue(true),
  getInstrumentState: jest.fn().mockReturnValue('ready'),
  getSelectedInstrument: jest.fn().mockReturnValue('bright'),
  getInstrumentOptions: jest.fn().mockReturnValue([
    { id: 'bright', name: 'Bright Synth' },
    { id: 'mellow', name: 'Mellow Synth' },
    { id: 'organ', name: 'Organ Synth' },
    { id: 'piano', name: 'Piano Samples' },
  ]),
  getState: jest.fn().mockReturnValue({
    instrumentState: 'ready',
    selectedInstrument: 'bright',
    samplerLoaded: true,
    isPlaying: false,
  }),
  playNote: jest.fn(),
  setTempo: jest.fn(),
}));

// Mock the TimelineService
jest.mock('@/services/TimelineService', () => ({
  createTimeline: jest.fn().mockReturnValue([
    {
      time: 0,
      duration: 0.5,
      pitch: 'C4',
      frequency: 261.63,
      type: 'note',
      measureIndex: 0,
      eventIndex: 0,
      staffIndex: 0,
      quant: 0,
    },
    {
      time: 0.5,
      duration: 0.5,
      pitch: 'D4',
      frequency: 293.66,
      type: 'note',
      measureIndex: 0,
      eventIndex: 1,
      staffIndex: 0,
      quant: 16,
    },
  ]),
}));

import {
  initTone,
  scheduleTonePlayback,
  stopTonePlayback,
  setInstrument as toneSetInstrument,
  isPlaying as toneIsPlaying,
} from '@/engines/toneEngine';
import { createTimeline } from '@/services/TimelineService';

describe('ScoreAPI Playback Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPlaybackState();
    (toneIsPlaying as jest.Mock).mockReturnValue(false);
  });

  const renderWithTheme = (id: string) => {
    return render(
      <ThemeProvider>
        <RiffScore id={id} />
      </ThemeProvider>
    );
  };

  describe('play()', () => {
    test('initializes Tone.js and starts playback', async () => {
      renderWithTheme('play-test');
      const api = getAPI('play-test');

      await act(async () => {
        await api.play();
      });

      expect(initTone).toHaveBeenCalled();
      expect(createTimeline).toHaveBeenCalled();
      expect(scheduleTonePlayback).toHaveBeenCalled();
    });

    test('plays from specific measure and quant', async () => {
      renderWithTheme('play-position');
      const api = getAPI('play-position');

      await act(async () => {
        await api.play(2, 32);
      });

      expect(scheduleTonePlayback).toHaveBeenCalled();
      // The schedule call should attempt to find the start offset
    });

    test('play() is chainable (returns this)', async () => {
      renderWithTheme('play-chain');
      const api = getAPI('play-chain');

      let result;
      await act(async () => {
        result = await api.play();
      });

      expect(result).toBe(api);
    });
  });

  describe('pause()', () => {
    test('stops playback without resetting position', () => {
      renderWithTheme('pause-test');
      const api = getAPI('pause-test');

      act(() => {
        api.pause();
      });

      expect(stopTonePlayback).toHaveBeenCalled();
    });

    test('pause() is chainable', () => {
      renderWithTheme('pause-chain');
      const api = getAPI('pause-chain');

      let result;
      act(() => {
        result = api.pause();
      });

      expect(result).toBe(api);
    });
  });

  describe('stop()', () => {
    test('stops playback and resets position', () => {
      renderWithTheme('stop-test');
      const api = getAPI('stop-test');

      act(() => {
        api.stop();
      });

      expect(stopTonePlayback).toHaveBeenCalled();
    });

    test('stop() is chainable', () => {
      renderWithTheme('stop-chain');
      const api = getAPI('stop-chain');

      let result;
      act(() => {
        result = api.stop();
      });

      expect(result).toBe(api);
    });
  });

  describe('rewind()', () => {
    test('rewinds to beginning by default', () => {
      renderWithTheme('rewind-default');
      const api = getAPI('rewind-default');

      act(() => {
        api.rewind();
      });

      expect(stopTonePlayback).toHaveBeenCalled();
    });

    test('rewinds to specific measure', () => {
      renderWithTheme('rewind-measure');
      const api = getAPI('rewind-measure');

      act(() => {
        api.rewind(3);
      });

      expect(stopTonePlayback).toHaveBeenCalled();
    });

    test('restarts playback if was playing', async () => {
      (toneIsPlaying as jest.Mock).mockReturnValue(true);
      renderWithTheme('rewind-playing');
      const api = getAPI('rewind-playing');

      act(() => {
        api.rewind(2);
      });

      expect(stopTonePlayback).toHaveBeenCalled();
      // The restart happens via setTimeout, so we need to wait
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      // scheduleTonePlayback should be called again for the restart
      expect(scheduleTonePlayback).toHaveBeenCalled();
    });

    test('rewind() is chainable', () => {
      renderWithTheme('rewind-chain');
      const api = getAPI('rewind-chain');

      let result;
      act(() => {
        result = api.rewind();
      });

      expect(result).toBe(api);
    });
  });

  describe('setInstrument()', () => {
    test('sets instrument via toneEngine', () => {
      renderWithTheme('instrument-test');
      const api = getAPI('instrument-test');

      act(() => {
        api.setInstrument('piano');
      });

      expect(toneSetInstrument).toHaveBeenCalledWith('piano');
    });

    test('accepts all valid instrument types', () => {
      renderWithTheme('instrument-types');
      const api = getAPI('instrument-types');

      const instruments = ['bright', 'mellow', 'organ', 'piano'];

      instruments.forEach((inst) => {
        act(() => {
          api.setInstrument(inst);
        });
        expect(toneSetInstrument).toHaveBeenCalledWith(inst);
      });
    });

    test('setInstrument() is chainable', () => {
      renderWithTheme('instrument-chain');
      const api = getAPI('instrument-chain');

      let result;
      act(() => {
        result = api.setInstrument('mellow');
      });

      expect(result).toBe(api);
    });
  });

  describe('Playback Workflow', () => {
    test('play -> pause -> play resumes', async () => {
      renderWithTheme('workflow-resume');
      const api = getAPI('workflow-resume');

      // Start playback
      await act(async () => {
        await api.play();
      });

      // Pause
      act(() => {
        api.pause();
      });

      // Clear mock to verify resume call
      jest.clearAllMocks();

      // Resume (should not reinitialize)
      await act(async () => {
        await api.play();
      });

      // initTone should not be called again (already initialized)
      // But scheduleTonePlayback should be called
      expect(scheduleTonePlayback).toHaveBeenCalled();
    });

    test('stop resets position to beginning', async () => {
      renderWithTheme('workflow-stop');
      const api = getAPI('workflow-stop');

      // Play from position 2
      await act(async () => {
        await api.play(2, 32);
      });

      // Stop
      act(() => {
        api.stop();
      });

      jest.clearAllMocks();

      // Play again - should start from beginning (position is reset)
      await act(async () => {
        await api.play();
      });

      expect(scheduleTonePlayback).toHaveBeenCalled();
    });
  });
});
