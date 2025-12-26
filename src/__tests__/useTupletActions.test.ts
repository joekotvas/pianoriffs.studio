/**
 * Comprehensive tests for useTupletActions hook.
 * Tests tuplet application, removal, validation, and edge cases.
 */

import { renderHook, act } from '@testing-library/react';
import { useTupletActions } from '@/hooks/useTupletActions';
import { createTestScore, createTestEvent, createTestSelection } from './helpers/testMocks';
import type { Score } from '@/types';

// Mock ApplyTupletCommand and RemoveTupletCommand
jest.mock('../commands/TupletCommands', () => ({
  ApplyTupletCommand: jest
    .fn()
    .mockImplementation((measureIndex, eventIndex, groupSize, ratio) => ({
      type: 'APPLY_TUPLET',
      measureIndex,
      eventIndex,
      groupSize,
      ratio,
    })),
}));

jest.mock('../commands/RemoveTupletCommand', () => ({
  RemoveTupletCommand: jest.fn().mockImplementation((measureIndex, eventIndex) => ({
    type: 'REMOVE_TUPLET',
    measureIndex,
    eventIndex,
  })),
}));

describe('useTupletActions', () => {
  // Helper to create events (test-specific)
  const createEvent = (id: string, hasTuplet = false) =>
    createTestEvent(id, [{ id: `${id}-note`, pitch: 'C4' }], {
      ...(hasTuplet && {
        // Tuplet data must be added manually since createTestEvent doesn't support it
      }),
    });

  // Helper to add tuplet after creation
  const withTuplet = (event: ReturnType<typeof createEvent>) => ({
    ...event,
    tuplet: { ratio: [3, 2] as [number, number], groupIndex: 0, groupSize: 3, position: 0 },
  });

  describe('applyTuplet', () => {
    it('should dispatch ApplyTupletCommand with correct params', () => {
      const events = [createEvent('e1'), createEvent('e2'), createEvent('e3')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.applyTuplet([3, 2], 3);
        expect(success).toBe(true);
      });

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'APPLY_TUPLET',
          measureIndex: 0,
          eventIndex: 0,
          groupSize: 3,
          ratio: [3, 2],
        })
      );
    });

    it('should return false if score is not initialized', () => {
      const scoreRef = { current: null as unknown as Score };
      const selection = createTestSelection(0, 'e1');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.applyTuplet([3, 2], 3);
        expect(success).toBe(false);
      });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should return false if no event is selected', () => {
      const events = [createEvent('e1')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(null, null);
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.applyTuplet([3, 2], 3);
        expect(success).toBe(false);
      });
    });

    it('should return false if not enough events for tuplet group', () => {
      const events = [createEvent('e1'), createEvent('e2')]; // Only 2 events
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.applyTuplet([3, 2], 3); // Need 3 events
        expect(success).toBe(false);
      });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should return false if selected event not found', () => {
      const events = [createEvent('e1')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'nonexistent');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.applyTuplet([3, 2], 3);
        expect(success).toBe(false);
      });
    });

    it('should apply quintuplet (5:4) correctly', () => {
      const events = Array(5)
        .fill(null)
        .map((_, i) => createEvent(`e${i}`));
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e0', 'e0-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        result.current.applyTuplet([5, 4], 5);
      });

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          ratio: [5, 4],
          groupSize: 5,
        })
      );
    });
  });

  describe('removeTuplet', () => {
    it('should dispatch RemoveTupletCommand for event with tuplet', () => {
      const events = [withTuplet(createEvent('e1'))];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.removeTuplet();
        expect(success).toBe(true);
      });

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'REMOVE_TUPLET',
          measureIndex: 0,
          eventIndex: 0,
        })
      );
    });

    it('should return false if event has no tuplet', () => {
      const events = [createEvent('e1')]; // No tuplet
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.removeTuplet();
        expect(success).toBe(false);
      });

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should return false if score is not initialized', () => {
      const scoreRef = { current: null as unknown as Score };
      const selection = createTestSelection(0, 'e1');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      act(() => {
        const success = result.current.removeTuplet();
        expect(success).toBe(false);
      });
    });
  });

  describe('canApplyTuplet', () => {
    it('should return true when enough events are available', () => {
      const events = [createEvent('e1'), createEvent('e2'), createEvent('e3')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.canApplyTuplet(3)).toBe(true);
      expect(result.current.canApplyTuplet(2)).toBe(true);
    });

    it('should return false when not enough events', () => {
      const events = [createEvent('e1'), createEvent('e2')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.canApplyTuplet(3)).toBe(false);
      expect(result.current.canApplyTuplet(5)).toBe(false);
    });

    it('should return false if no selection', () => {
      const events = [createEvent('e1')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(null, null);
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.canApplyTuplet(1)).toBe(false);
    });

    it('should account for selection position in measure', () => {
      const events = [createEvent('e1'), createEvent('e2'), createEvent('e3')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      // Select last event - only 1 event from here
      const selection = createTestSelection(0, 'e3', 'e3-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.canApplyTuplet(1)).toBe(true);
      expect(result.current.canApplyTuplet(2)).toBe(false);
    });
  });

  describe('getActiveTupletRatio', () => {
    it('should return tuplet ratio for event with tuplet', () => {
      const events = [withTuplet(createEvent('e1'))];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.getActiveTupletRatio()).toEqual([3, 2]);
    });

    it('should return null for event without tuplet', () => {
      const events = [createEvent('e1')];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(0, 'e1', 'e1-note');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.getActiveTupletRatio()).toBeNull();
    });

    it('should return null if no selection', () => {
      const events = [withTuplet(createEvent('e1'))];
      const score = createTestScore({ events });
      const scoreRef = { current: score };
      const selection = createTestSelection(null, null);
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.getActiveTupletRatio()).toBeNull();
    });

    it('should return null if score not initialized', () => {
      const scoreRef = { current: null as unknown as Score };
      const selection = createTestSelection(0, 'e1');
      const dispatch = jest.fn();

      const { result } = renderHook(() => useTupletActions(scoreRef, selection, dispatch));

      expect(result.current.getActiveTupletRatio()).toBeNull();
    });
  });
});
