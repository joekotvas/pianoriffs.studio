/**
 * Comprehensive tests for usePlayback hook.
 * Tests playback state management, start/stop, position tracking, and edge cases.
 */

import { renderHook, act } from '@testing-library/react';
import { usePlayback } from '@/hooks/usePlayback';

// Mock toneEngine
const mockInitTone = jest.fn().mockResolvedValue(undefined);
const mockScheduleTonePlayback = jest.fn();
const mockStopTonePlayback = jest.fn();
const mockGetState = jest.fn().mockReturnValue({ instrumentState: 'ready' });

jest.mock('../engines/toneEngine', () => ({
  initTone: (...args: any[]) => mockInitTone(...args),
  scheduleTonePlayback: (...args: any[]) => mockScheduleTonePlayback(...args),
  stopTonePlayback: () => mockStopTonePlayback(),
  getState: () => mockGetState(),
}));

// Mock TimelineService
const mockCreateTimeline = jest.fn().mockReturnValue([
  { measureIndex: 0, quant: 0, time: 0, notes: [{ pitch: 'C4' }] },
  { measureIndex: 0, quant: 16, time: 0.5, notes: [{ pitch: 'D4' }] },
  { measureIndex: 1, quant: 0, time: 1.0, notes: [{ pitch: 'E4' }] },
]);

jest.mock('../services/TimelineService', () => ({
  createTimeline: (...args: any[]) => mockCreateTimeline(...args),
}));

describe('usePlayback', () => {
  const createMockScore = () => ({
    staves: [
      {
        clef: 'treble',
        measures: [
          { events: [{ id: 'e1', notes: [{ pitch: 'C4' }], duration: 'quarter' }] },
          { events: [{ id: 'e2', notes: [{ pitch: 'D4' }], duration: 'quarter' }] },
        ],
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with isPlaying = false', () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      expect(result.current.isPlaying).toBe(false);
    });

    it('should initialize with null playback position', () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      expect(result.current.playbackPosition).toEqual({
        measureIndex: null,
        quant: null,
        duration: 0,
      });
    });

    it('should initialize lastPlayStart at measure 0, quant 0', () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      expect(result.current.lastPlayStart).toEqual({
        measureIndex: 0,
        quant: 0,
      });
    });
  });

  describe('playScore', () => {
    it('should initialize Tone.js on first play', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      expect(mockInitTone).toHaveBeenCalled();
    });

    it('should set isPlaying to true when playing', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it('should create timeline from score and bpm', async () => {
      const score = createMockScore();
      const bpm = 120;
      const { result } = renderHook(() => usePlayback(score, bpm));

      await act(async () => {
        await result.current.playScore();
      });

      expect(mockCreateTimeline).toHaveBeenCalledWith(score, bpm);
    });

    it('should schedule playback with timeline', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      expect(mockScheduleTonePlayback).toHaveBeenCalled();
      const scheduledArgs = mockScheduleTonePlayback.mock.calls[0];
      expect(scheduledArgs[0]).toEqual(
        expect.arrayContaining([expect.objectContaining({ measureIndex: 0 })])
      );
    });

    it('should update lastPlayStart when starting from specific position', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore(1, 16);
      });

      expect(result.current.lastPlayStart).toEqual({
        measureIndex: 1,
        quant: 16,
      });
    });

    it('should stop existing playback before starting new', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      // Play again
      await act(async () => {
        await result.current.playScore();
      });

      // stopTonePlayback should have been called during second playScore
      expect(mockStopTonePlayback).toHaveBeenCalled();
    });
  });

  describe('stopPlayback', () => {
    it('should call stopTonePlayback', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      act(() => {
        result.current.stopPlayback();
      });

      expect(mockStopTonePlayback).toHaveBeenCalled();
    });

    it('should set isPlaying to false', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      act(() => {
        result.current.stopPlayback();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should reset playback position to null', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      act(() => {
        result.current.stopPlayback();
      });

      expect(result.current.playbackPosition).toEqual({
        measureIndex: null,
        quant: null,
        duration: 0,
      });
    });
  });

  describe('handlePlayToggle', () => {
    it('should start playback when not playing', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.handlePlayToggle();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it('should stop playback when already playing', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.handlePlayToggle();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('position callbacks', () => {
    it('should update playbackPosition when callback is invoked', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      // Get the position callback from scheduleTonePlayback call
      const positionCallback = mockScheduleTonePlayback.mock.calls[0][3];

      // Simulate position update
      act(() => {
        positionCallback(0, 16, 0.5);
      });

      expect(result.current.playbackPosition).toEqual({
        measureIndex: 0,
        quant: 16,
        duration: 0.5,
      });
    });

    it('should reset state when completion callback is invoked', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      // Get the completion callback from scheduleTonePlayback call
      const completionCallback = mockScheduleTonePlayback.mock.calls[0][4];

      // Simulate playback completion
      act(() => {
        completionCallback();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.playbackPosition).toEqual({
        measureIndex: null,
        quant: null,
        duration: 0,
      });
    });
  });

  describe('start offset', () => {
    it('should find correct start time offset from timeline', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore(1, 0); // Start at measure 1
      });

      // Check that scheduleTonePlayback was called with correct offset
      const startOffset = mockScheduleTonePlayback.mock.calls[0][2];
      expect(startOffset).toBe(1.0); // Timeline has measure 1 at time 1.0
    });

    it('should use 0 offset for start at beginning', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore(0, 0);
      });

      const startOffset = mockScheduleTonePlayback.mock.calls[0][2];
      expect(startOffset).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty score', async () => {
      const emptyScore = { staves: [{ measures: [] }] };
      mockCreateTimeline.mockReturnValueOnce([]);

      const { result } = renderHook(() => usePlayback(emptyScore, 120));

      await act(async () => {
        await result.current.playScore();
      });

      // Should still schedule (with empty timeline)
      expect(mockScheduleTonePlayback).toHaveBeenCalled();
    });

    it('should handle BPM changes', () => {
      const score = createMockScore();
      const { result, rerender } = renderHook(({ bpm }) => usePlayback(score, bpm), {
        initialProps: { bpm: 120 },
      });

      // BPM change should update the hook dependencies
      rerender({ bpm: 140 });

      // The hook should re-create callbacks with new BPM
      expect(result.current.playScore).toBeDefined();
    });

    it('should only initialize Tone.js once', async () => {
      const score = createMockScore();
      const { result } = renderHook(() => usePlayback(score, 120));

      await act(async () => {
        await result.current.playScore();
      });

      await act(async () => {
        await result.current.playScore();
      });

      // Should only be called once due to isInitialized ref
      expect(mockInitTone).toHaveBeenCalledTimes(1);
    });
  });
});
