/**
 * Cross-Staff Navigation Tests
 *
 * Tests for Alt+Arrow navigation between staves in grand staff.
 * Covers: switchStaff, quant alignment, empty measure handling.
 *
 * @see useNavigation
 */

import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '@/hooks/interaction';
import { Score, Measure } from '@/types';
import { createDefaultSelection } from '@/types';

jest.mock('../engines/toneEngine', () => ({
  playNote: jest.fn(),
}));

// Mock Score Factory (Same as before)
const createMockScore = (): Score => {
  const createMeasure = (events: any[]): Measure => ({
    id: String(Math.random()),
    events,
    isPickup: false,
  });

  const createNote = (pitch: string, id: string) => ({
    id,
    pitch,
  });
  const createEvent = (id: string, notes: any[], duration: string = 'quarter', dotted: false) => ({
    id,
    notes,
    duration,
    dotted,
    tuplet: undefined,
    isRest: false,
  });

  // Staff 0: 4 Quarter Notes (0, 24, 48, 72)
  const staff0Measures = [
    createMeasure([
      createEvent('e1-0', [createNote('C4', '101')], 'quarter', false), // 0-24
      createEvent('e1-1', [createNote('D4', '102')], 'quarter', false), // 24-48
      createEvent('e1-2', [createNote('E4', '103')], 'quarter', false), // 48-72
      createEvent('e1-3', [createNote('F4', '104')], 'quarter', false), // 72-96
    ]),
  ];

  // Staff 1: 2 Half Notes (0-48, 48-96)
  const staff1Measures = [
    createMeasure([
      createEvent('e2-0', [createNote('C3', '201')], 'half', false), // 0-48
      createEvent('e2-1', [createNote('G2', '202')], 'half', false), // 48-96
    ]),
    createMeasure([]), // Measure 1 is empty on Staff 1
  ];

  // Staff 0 needs a Measure 1 too for the test
  staff0Measures.push(
    createMeasure([
      createEvent('e1-4', [createNote('C4', '105')], 'whole', false), // Measure 1, Whole note
    ])
  );

  return {
    title: 'Test Score',
    bpm: 120,
    timeSignature: '4/4',
    keySignature: 'C',
    staves: [
      { id: 's1', clef: 'treble', measures: staff0Measures, keySignature: 'C' },
      { id: 's2', clef: 'bass', measures: staff1Measures, keySignature: 'C' },
    ],
  };
};

describe('Cross-Staff Navigation (Alt+Arrows)', () => {
  it('should move from Staff 0 (Quarter 2, Q=24) to Staff 1 (Half 1, Q=0-48) using switchStaff', () => {
    const score = createMockScore();
    const scoreRef = { current: score };
    let selection = createDefaultSelection();
    // Select Staff 0, Measure 0, Event 1 (the 2nd quarter note, 24 ticks)
    selection = {
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e1-1',
      noteId: '102',
      selectedNotes: [],
      anchor: null,
    };

    const setPreviewNote = jest.fn();
    const dispatch = jest.fn();

    const select = jest.fn((measureIndex, eventId, noteId, staffIndex) => {
      selection = {
        ...selection,
        staffIndex: staffIndex ?? selection.staffIndex,
        measureIndex: measureIndex ?? selection.measureIndex,
        eventId,
        noteId,
      };
    });

    const { result } = renderHook(() =>
      useNavigation({
        scoreRef,
        selection,
        select,
        previewNote: null,
        setPreviewNote,
        activeDuration: 'quarter',
        isDotted: false,
        currentQuantsPerMeasure: 96,
        dispatch,
        inputMode: 'NOTE',
      })
    );

    // Use switchStaff('down') which corresponds to Alt+Down
    act(() => {
      result.current.switchStaff('down');
    });

    // Expectation: Staff 1 (select is called instead of setSelection now)
    expect(select).toHaveBeenCalled();
    expect(selection.staffIndex).toBe(1);
    // Expect to select the first half note (e2-0) because it contains quant 24
    expect(selection.eventId).toBe('e2-0');
    // Expect single selection
    expect(selection.selectedNotes).toEqual([]);
  });

  it('should move from Staff 1 (Half 2, Q=48) to Staff 0 (Quarter 3, Q=48) using switchStaff', () => {
    const score = createMockScore();
    const scoreRef = { current: score };
    let selection = createDefaultSelection();
    // Select Staff 1, Event 1 (2nd half note, starts at 48)
    selection = {
      staffIndex: 1,
      measureIndex: 0,
      eventId: 'e2-1',
      noteId: '202',
      selectedNotes: [],
      anchor: null,
    };

    const setPreviewNote = jest.fn();
    const dispatch = jest.fn();

    const select = jest.fn((measureIndex, eventId, noteId, staffIndex) => {
      selection = {
        ...selection,
        staffIndex: staffIndex ?? selection.staffIndex,
        measureIndex: measureIndex ?? selection.measureIndex,
        eventId,
        noteId,
      };
    });

    const { result } = renderHook(() =>
      useNavigation({
        scoreRef,
        selection,
        select,
        previewNote: null,
        setPreviewNote,
        activeDuration: 'quarter',
        isDotted: false,
        currentQuantsPerMeasure: 96,
        dispatch,
        inputMode: 'NOTE',
      })
    );

    act(() => {
      result.current.switchStaff('up');
    });

    // Expectation: Staff 0
    expect(selection.staffIndex).toBe(0);
    // At quant 48, top staff has 3rd quarter note (e1-2)
    expect(selection.eventId).toBe('e1-2');
  });

  it('should fallback to simple staff switch if no event selected', () => {
    const score = createMockScore();
    const scoreRef = { current: score };
    let selection = createDefaultSelection();
    // Select Staff 0, Measure 0, NO EVENT
    selection = {
      staffIndex: 0,
      measureIndex: 0,
      eventId: null,
      noteId: null,
      selectedNotes: [],
      anchor: null,
    };

    const setPreviewNote = jest.fn();
    const dispatch = jest.fn();

    const select = jest.fn((measureIndex, eventId, noteId, staffIndex) => {
      selection = {
        ...selection,
        staffIndex: staffIndex ?? selection.staffIndex,
        measureIndex: measureIndex ?? selection.measureIndex,
        eventId,
        noteId,
      };
    });

    const { result } = renderHook(() =>
      useNavigation({
        scoreRef,
        selection,
        select,
        previewNote: null,
        setPreviewNote,
        activeDuration: 'quarter',
        isDotted: false,
        currentQuantsPerMeasure: 96,
        dispatch,
        inputMode: 'NOTE',
      })
    );

    act(() => {
      result.current.switchStaff('down');
    });

    // Expectation: Staff 1, Measure 0, Event NULL
    expect(selection.staffIndex).toBe(1);
    expect(selection.measureIndex).toBe(0);
    expect(selection.eventId).toBeNull();
  });

  it('should place cursor at the START of an empty measure even if coming from a later quant', () => {
    const score = createMockScore();
    const scoreRef = { current: score };
    let selection = createDefaultSelection();

    // Select Staff 0, Measure 0, Event 'e1-2' (Starts at Quant 48)
    // Note: For this to work with Measure 1 being empty, we should interpret "Measure 1" alignment.
    // Wait, the test setup:
    // Staff 0 Measure 1 is 'e1-4' (Whole note).
    // Staff 1 Measure 1 is [].
    // If I select 'e1-4', existing test was: Start=0.
    // I need to select something later. 'e1-4' is a whole note (0-96).
    // If I can select 'e1-4' but hypothetically represent a later time?
    // Or better: Let's use Measure 0.
    // Staff 0 Measure 0 has events at 0, 24, 48, 72.
    // Staff 1 Measure 0 has events at 0, 48.
    // If I empty Staff 1 Measure 0 for this test? Or add a new Measure 2 that is empty?

    // Let's modify the mock score for this test specifically or add a Measure 2.
    score.staves[0].measures.push({
      id: '999',
      events: [
        {
          id: 'late-event',
          notes: [{ id: '998', pitch: 'C4' }],
          duration: 'quarter',
          dotted: false,
          tuplet: undefined,
          isRest: false,
        },
      ],
      isPickup: false,
    }); // Measure 2, event at 0? No, let's make it start later?
    // Actually, easiest is to use the existing Staff 0 Measure 0 (Quant 48) -> Staff 1 Measure 0.
    // But Staff 1 Measure 0 IS NOT EMPTY.

    // Let's stick to Measure 1.
    // Staff 0 Measure 1: 'e1-4' (Whole note).
    // Staff 1 Measure 1: Empty.
    // But 'e1-4' starts at 0. `currentQuantStart` calculation depends on finding the event and summing previous.
    // In Measure 1, `e1-4` is the first event. So `currentQuantStart` is 0.

    // Use a measure with multiple events on Staff 0, and Empty on Staff 1.
    // Let's overwrite Measure 1 on Staff 0 for this test instance.
    score.staves[0].measures[1] = {
      id: '888',
      isPickup: false,
      events: [
        {
          id: 'm1-e1',
          notes: [{ id: 'm1n1', pitch: 'C4' }],
          duration: 'quarter',
          dotted: false,
          tuplet: undefined,
          isRest: false,
        }, // 0-24
        {
          id: 'm1-e2',
          notes: [{ id: 'm1n2', pitch: 'C4' }],
          duration: 'quarter',
          dotted: false,
          tuplet: undefined,
          isRest: false,
        }, // 24-48
      ],
    };

    // Select 'm1-e2' (Quant 24).
    selection = {
      staffIndex: 0,
      measureIndex: 1,
      eventId: 'm1-e2',
      noteId: '2',
      selectedNotes: [],
      anchor: null,
    };

    let capturedPreviewNote: any = null;

    const setPreviewNote = jest.fn((note) => {
      capturedPreviewNote = note;
    });
    const dispatch = jest.fn();

    const select = jest.fn((measureIndex, eventId, noteId, staffIndex) => {
      selection = {
        ...selection,
        staffIndex: staffIndex ?? selection.staffIndex,
        measureIndex: measureIndex ?? selection.measureIndex,
        eventId,
        noteId,
      };
    });

    const { result } = renderHook(() =>
      useNavigation({
        scoreRef,
        selection,
        select,
        previewNote: null,
        setPreviewNote,
        activeDuration: 'quarter',
        isDotted: false,
        currentQuantsPerMeasure: 96,
        dispatch,
        inputMode: 'NOTE',
      })
    );

    act(() => {
      result.current.switchStaff('down');
    });

    // Expectation: Staff 1, Measure 1
    expect(selection.staffIndex).toBe(1);
    expect(selection.measureIndex).toBe(1);
    // NO event selected
    expect(selection.eventId).toBeNull();

    // Preview Note should be set (Cursor)
    expect(setPreviewNote).toHaveBeenCalled();
    expect(capturedPreviewNote).not.toBeNull();
    // It should be at Quant 0 (Start of empty measure), NOT 24.
    expect(capturedPreviewNote.quant).toBe(0);
    expect(capturedPreviewNote.mode).toBe('APPEND');
  });
});
