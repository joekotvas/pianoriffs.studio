/**
 * handlePlayback Tests
 *
 * Tests for keyboard playback handler (P for play, Space for toggle).
 *
 * @see handlePlayback
 */

import { handlePlayback } from '@/hooks/handlers/handlePlayback';
import { createTestScore, createTestSelection, createMockKeyboardEvent } from './helpers/testMocks';
import type { UsePlaybackReturn } from '@/hooks/usePlayback';

describe('handlePlayback', () => {
  let mockPlayback: UsePlaybackReturn;

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
  });

  test('should play from selection when P is pressed', () => {
    const mockScore = createTestScore({
      events: [
        { id: 'e1', duration: 'quarter', dotted: false, notes: [] },
        { id: 'e2', duration: 'quarter', dotted: false, notes: [] },
      ],
    });
    const selection = createTestSelection(0, 'e2');
    const mockEvent = createMockKeyboardEvent({ key: 'p' });

    const result = handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection,
      mockScore
    );

    expect(result).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockPlayback.playScore).toHaveBeenCalledWith(0, 1);
  });

  test('should play from start when P is pressed with no selection', () => {
    const mockScore = createTestScore();
    const selection = createTestSelection(null, null);
    const mockEvent = createMockKeyboardEvent({ key: 'p' });

    const result = handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection,
      mockScore
    );

    expect(result).toBe(true);
    expect(mockPlayback.playScore).toHaveBeenCalledWith(0, 0);
  });

  test('should toggle playback with Space', () => {
    const mockScore = createTestScore();
    const selection = createTestSelection(null, null);
    const mockEvent = createMockKeyboardEvent({ code: 'Space', key: ' ' });

    // Start playback
    handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection,
      mockScore
    );
    expect(mockPlayback.playScore).toHaveBeenCalled();

    // Stop playback
    mockPlayback.isPlaying = true;
    handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      selection,
      mockScore
    );
    expect(mockPlayback.pausePlayback).toHaveBeenCalled();
  });

  test('should ignore other keys', () => {
    const mockScore = createTestScore();
    const mockEvent = createMockKeyboardEvent({ key: 'a' });

    const result = handlePlayback(
      mockEvent as unknown as KeyboardEvent,
      mockPlayback,
      createTestSelection(null, null),
      mockScore
    );
    expect(result).toBe(false);
  });
});
