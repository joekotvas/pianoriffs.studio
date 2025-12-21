/**
 * useScoreLogic Integration Tests
 *
 * Tests for core score logic: add, delete, duration change, accidental toggle.
 *
 * @see useScoreLogic
 */

import { renderHook, act } from '@testing-library/react';
import { useScoreLogic } from '@/hooks/useScoreLogic';
import { createDefaultScore } from '@/types';

// Mock audio engine to prevent actual playback during tests
jest.mock('../engines/toneEngine', () => ({
  playNote: jest.fn(),
  setInstrument: jest.fn(),
  isSamplerLoaded: jest.fn(() => false),
  InstrumentType: {},
}));

describe('useScoreLogic Integration', () => {
  const initialScore = createDefaultScore();

  test('should initialize with default score', () => {
    const { result } = renderHook(() => useScoreLogic(initialScore));

    expect(result.current.state.score).toBeDefined();
    expect(result.current.state.score.staves).toHaveLength(2);
    // Default score has 2 measures
    expect(result.current.state.score.staves[0].measures).toHaveLength(2);
  });

  test('should add a note to the score', () => {
    const { result } = renderHook(() => useScoreLogic(initialScore));

    const newNote = { pitch: 'C4', duration: 'quarter', dotted: false };

    act(() => {
      // Add note to first measure
      result.current.entry.addNote(0, newNote);
    });

    const measure = result.current.state.score.staves[0].measures[0];
    expect(measure.events).toHaveLength(1);
    expect(measure.events[0].notes[0].pitch).toBe('C4');
    expect(measure.events[0].duration).toBe('quarter');
  });

  test('should delete a selected note', () => {
    const { result } = renderHook(() => useScoreLogic(initialScore));

    // 1. Add a note
    const newNote = { pitch: 'C4', duration: 'quarter', dotted: false };
    act(() => {
      result.current.entry.addNote(0, newNote);
    });

    // Verify addition
    let measure = result.current.state.score.staves[0].measures[0];
    const eventId = measure.events[0].id;
    const noteId = measure.events[0].notes[0].id;

    // 2. Select the note (addNote auto-selects, but let's be explicit)
    act(() => {
      result.current.setSelection({ staffIndex: 0, measureIndex: 0, eventId, noteId, selectedNotes: [] });
    });

    // 3. Delete it
    act(() => {
      result.current.entry.delete();
    });

    // Verify deletion
    measure = result.current.state.score.staves[0].measures[0];
    expect(measure.events).toHaveLength(0);
  });

  test('should modify note duration', () => {
    const { result } = renderHook(() => useScoreLogic(initialScore));

    // 1. Add a note
    const newNote = { pitch: 'C4', duration: 'quarter', dotted: false };
    act(() => {
      result.current.entry.addNote(0, newNote);
    });

    const measure = result.current.state.score.staves[0].measures[0];
    const eventId = measure.events[0].id;
    const noteId = measure.events[0].notes[0].id;

    // 2. Select it
    act(() => {
      result.current.setSelection({ staffIndex: 0, measureIndex: 0, eventId, noteId, selectedNotes: [] });
    });

    // 3. Change duration to eighth
    act(() => {
      result.current.modifiers.duration('eighth');
    });

    // Verify change
    const updatedMeasure = result.current.state.score.staves[0].measures[0];
    expect(updatedMeasure.events[0].duration).toBe('eighth');
  });

  test('should toggle accidental (modifies pitch)', () => {
    const { result } = renderHook(() => useScoreLogic(initialScore));

    // 1. Add a note
    const newNote = { pitch: 'C4', duration: 'quarter', dotted: false };
    act(() => {
      result.current.entry.addNote(0, newNote);
    });

    const measure = result.current.state.score.staves[0].measures[0];
    const eventId = measure.events[0].id;
    const noteId = measure.events[0].notes[0].id;

    // 2. Select it
    act(() => {
      result.current.setSelection({ staffIndex: 0, measureIndex: 0, eventId, noteId, selectedNotes: [] });
    });

    // 3. Toggle Sharp - should raise pitch by semitone
    act(() => {
      result.current.modifiers.accidental('sharp');
    });

    // Verify pitch changed from C4 to C#4 (preserves letter name)
    const updatedMeasure = result.current.state.score.staves[0].measures[0];
    const updatedPitch = updatedMeasure.events[0].notes[0].pitch;
    expect(updatedPitch).toBe('C#4');
  });
});
