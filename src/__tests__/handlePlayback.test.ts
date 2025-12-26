/**
 * handlePlayback Tests
 *
 * Tests for keyboard playback handler (P for play, Space for toggle).
 *
 * @see handlePlayback
 */

import { handlePlayback } from '@/hooks/handlers/handlePlayback';
import type { Score, Selection } from '@/types';
import type { UsePlaybackReturn } from '@/hooks/usePlayback';

describe('handlePlayback', () => {
  let mockPlayback: UsePlaybackReturn;
  let mockScore: Score;

  const createMockEvent = (overrides: { key?: string; code?: string } = {}) => ({
    key: '',
    code: '',
    preventDefault: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    mockPlayback = {
      playScore: jest.fn(),
      stopPlayback: jest.fn(),
      pausePlayback: jest.fn(),
      isPlaying: false,
      lastPlayStart: { measureIndex: 0, quant: 0 },
      playbackPosition: { measureIndex: null, quant: null, duration: 0 },
      handlePlayToggle: jest.fn(),
      instrumentState: 'ready',
    };
    mockScore = {
      title: 'Test Score',
      timeSignature: '4/4',
      keySignature: 'C',
      bpm: 120,
      staves: [
        {
          id: 'staff-1',
          clef: 'treble' as const,
          keySignature: 'C',
          measures: [
            {
              id: 'm1',
              events: [
                { id: 'e1', duration: 'quarter', dotted: false, notes: [] },
                { id: 'e2', duration: 'quarter', dotted: false, notes: [] },
              ],
            },
          ],
        },
      ],
    };
  });

  test('should play from selection when P is pressed', () => {
    const selection: Partial<Selection> = { measureIndex: 0, eventId: 'e2' };
    const mockEvent = createMockEvent({ key: 'p' });

    const result = handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection as Selection,
      mockScore
    );

    expect(result).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockPlayback.playScore).toHaveBeenCalledWith(0, 1);
  });

  test('should play from start when P is pressed with no selection', () => {
    const selection: Partial<Selection> = { measureIndex: null, eventId: null };
    const mockEvent = createMockEvent({ key: 'p' });

    const result = handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection as Selection,
      mockScore
    );

    expect(result).toBe(true);
    expect(mockPlayback.playScore).toHaveBeenCalledWith(0, 0);
  });

  test('should toggle playback with Space', () => {
    const selection: Partial<Selection> = { measureIndex: null, eventId: null };
    const mockEvent = createMockEvent({ code: 'Space', key: ' ' });

    // Start playback
    handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection as Selection,
      mockScore
    );
    expect(mockPlayback.playScore).toHaveBeenCalled();

    // Stop playback
    mockPlayback.isPlaying = true;
    handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection as Selection,
      mockScore
    );
    expect(mockPlayback.pausePlayback).toHaveBeenCalled();
  });

  test('should ignore other keys', () => {
    const mockEvent = createMockEvent({ key: 'a' });
    const result = handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      {} as Selection,
      mockScore
    );
    expect(result).toBe(false);
  });
});
