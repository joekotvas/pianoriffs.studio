/**
 * useSelection Hook Tests
 *
 * Tests for selection state management: select, clear, multi-select, event selection.
 *
 * @see useSelection
 */

import { renderHook, act } from '@testing-library/react';
import { useSelection } from '@/hooks/score';
import { createDefaultScore } from '@/types';

// Mock toneEngine
jest.mock('../engines/toneEngine', () => ({
  playNote: jest.fn(),
  setInstrument: jest.fn(),
  isSamplerLoaded: jest.fn(() => false),
  InstrumentType: {},
}));

describe('useSelection', () => {
  const mockScore = createDefaultScore();
  // Add some test data
  mockScore.staves[0].measures[0].events = [
    {
      id: 'e1',
      duration: 'quarter',
      dotted: false,
      notes: [
        { id: 'n1', pitch: 'C4' },
        { id: 'n2', pitch: 'E4' },
      ],
    },
    { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n3', pitch: 'F4' }] },
  ];

  it('initializes with default selection', () => {
    const { result } = renderHook(() => useSelection({ score: mockScore }));
    expect(result.current.selection.measureIndex).toBeNull();
    expect(result.current.selection.eventId).toBeNull();
  });

  it('selects a single note', () => {
    const { result } = renderHook(() => useSelection({ score: mockScore }));

    act(() => {
      result.current.select(0, 'e1', 'n1', 0);
    });

    expect(result.current.selection.measureIndex).toBe(0);
    expect(result.current.selection.eventId).toBe('e1');
    expect(result.current.selection.noteId).toBe('n1');
    expect(result.current.selection.selectedNotes).toHaveLength(1);
  });

  it('should update lastSelection but not selection when onlyHistory is true', () => {
    const { result } = renderHook(() => useSelection({ score: mockScore }));

    act(() => {
      // Mock event exists
      result.current.select(0, 'e1', 'n1', 0, { onlyHistory: true });
    });

    // Visual selection should be default/cleared
    expect(result.current.selection.noteId).toBeNull();
    // lastSelection should act as memory
    expect(result.current.lastSelection).not.toBeNull();
    expect(result.current.lastSelection?.noteId).toBe('n1');
  });

  it('handles event selection (all notes)', () => {
    const { result } = renderHook(() => useSelection({ score: mockScore }));

    // Select event 'e1' (which has n1 and n2) by passing noteId=null
    act(() => {
      result.current.select(0, 'e1', null, 0);
    });

    expect(result.current.selection.measureIndex).toBe(0);
    expect(result.current.selection.eventId).toBe('e1');
    expect(result.current.selection.selectedNotes).toHaveLength(2); // Should select both n1 and n2
    expect(result.current.selection.noteId).not.toBeNull(); // Should default to one of them (e.g. n1)
    expect(result.current.selection.selectedNotes.map((n) => n.noteId)).toContain('n1');
    expect(result.current.selection.selectedNotes.map((n) => n.noteId)).toContain('n2');
  });

  it('handles multi-select (Cmd/Ctrl)', () => {
    const { result } = renderHook(() => useSelection({ score: mockScore }));

    // Select n1
    act(() => {
      result.current.select(0, 'e1', 'n1', 0);
    });

    // Multi-select n3
    act(() => {
      result.current.select(0, 'e2', 'n3', 0, { isMulti: true });
    });

    expect(result.current.selection.selectedNotes).toHaveLength(2);
    const ids = result.current.selection.selectedNotes.map((n) => n.noteId);
    expect(ids).toContain('n1');
    expect(ids).toContain('n3');
  });

  it('clears selection', () => {
    const { result } = renderHook(() => useSelection({ score: mockScore }));

    act(() => {
      result.current.select(0, 'e1', 'n1', 0);
      result.current.clearSelection();
    });

    expect(result.current.selection.measureIndex).toBeNull();
    expect(result.current.selection.eventId).toBeNull();
  });
});
