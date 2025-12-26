/**
 * ScoreAPI.cookbook.test.tsx
 *
 * Integration tests validating all recipes from docs/COOKBOOK.md.
 * These tests verify ACTUAL content, not just that operations don't throw.
 *
 * Purpose:
 * - Ensure documentation stays in sync with implementation
 * - Catch regressions in documented API workflows
 * - Verify notes are actually added, not silently dropped
 */

import { render, act, waitFor } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';
import type { Score, ScoreEvent } from '../types';

// =============================================================================
// TEST HELPERS
// =============================================================================

/** Get typed API instance */
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

/** Count total events across all measures in a staff */
const countEventsInStaff = (score: Score, staffIndex: number = 0): number => {
  return score.staves[staffIndex].measures.reduce((sum, m) => sum + m.events.length, 0);
};

/** Count events in a specific measure */
const countEventsInMeasure = (
  score: Score,
  measureIndex: number,
  staffIndex: number = 0
): number => {
  return score.staves[staffIndex].measures[measureIndex]?.events.length ?? 0;
};

/** Get all pitches from a measure (flattened from all events) */
const getPitchesInMeasure = (
  score: Score,
  measureIndex: number,
  staffIndex: number = 0
): string[] => {
  const measure = score.staves[staffIndex].measures[measureIndex];
  if (!measure) return [];
  return measure.events.flatMap((e: ScoreEvent) =>
    e.notes.filter((n) => n.pitch).map((n) => n.pitch as string)
  );
};

/** Get all pitches across all measures in a staff */
const getAllPitches = (score: Score, staffIndex: number = 0): string[] => {
  return score.staves[staffIndex].measures.flatMap((m) =>
    m.events.flatMap((e: ScoreEvent) =>
      e.notes.filter((n) => n.pitch).map((n) => n.pitch as string)
    )
  );
};

/** Check if an event is a rest */
const isRest = (event: ScoreEvent): boolean => {
  return event.isRest === true || event.notes.every((n) => !n.pitch);
};

/** Count rests in a measure */
const countRestsInMeasure = (
  score: Score,
  measureIndex: number,
  staffIndex: number = 0
): number => {
  const measure = score.staves[staffIndex].measures[measureIndex];
  if (!measure) return 0;
  return measure.events.filter(isRest).length;
};

// =============================================================================
// ENTRY RECIPES
// =============================================================================

describe('Cookbook: Entry Recipes', () => {
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

  /**
   * Recipe: Write a C Major Scale (Quarter notes, 2 measures)
   * docs/COOKBOOK.md - 8 quarter notes, 4 per measure
   *
   * In 4/4 time, one measure holds 4 quarter notes.
   * Must explicitly select measure 2 for the second half.
   */
  test('Write a C Major Scale - quarter notes across 2 measures', () => {
    render(<RiffScore id="cookbook-scale" />);
    const score = getAPI('cookbook-scale');

    // Measure 1: C4-F4
    act(() => {
      score
        .select(1)
        .addNote('C4', 'quarter')
        .addNote('D4', 'quarter')
        .addNote('E4', 'quarter')
        .addNote('F4', 'quarter');
    });

    // Measure 2: G4-C5
    act(() => {
      score
        .select(2)
        .addNote('G4', 'quarter')
        .addNote('A4', 'quarter')
        .addNote('B4', 'quarter')
        .addNote('C5', 'quarter');
    });

    const data = score.getScore();

    // Verify all 8 notes were added
    expect(countEventsInStaff(data)).toBe(8);

    // Verify measure distribution (4 per measure)
    expect(countEventsInMeasure(data, 0)).toBe(4);
    expect(countEventsInMeasure(data, 1)).toBe(4);

    // Verify correct pitches
    expect(getPitchesInMeasure(data, 0)).toEqual(['C4', 'D4', 'E4', 'F4']);
    expect(getPitchesInMeasure(data, 1)).toEqual(['G4', 'A4', 'B4', 'C5']);
  });

  /**
   * Recipe: Write a Scale Using Eighth Notes (Single Measure)
   * All 8 notes fit in one 4/4 measure as eighths
   */
  test('Write a Scale using eighth notes - all in one measure', () => {
    render(<RiffScore id="cookbook-scale-eighths" />);
    const score = getAPI('cookbook-scale-eighths');

    act(() => {
      score
        .select(1)
        .addNote('C4', 'eighth')
        .addNote('D4', 'eighth')
        .addNote('E4', 'eighth')
        .addNote('F4', 'eighth')
        .addNote('G4', 'eighth')
        .addNote('A4', 'eighth')
        .addNote('B4', 'eighth')
        .addNote('C5', 'eighth');
    });

    const data = score.getScore();

    // Verify all 8 notes in measure 1
    expect(countEventsInMeasure(data, 0)).toBe(8);

    // Verify correct pitches
    const allPitches = getPitchesInMeasure(data, 0);
    expect(allPitches).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']);
  });

  /**
   * Recipe: Build a Chord Progression (I-IV-V-I)
   * 4 chords: C major, F major, G major, C major
   * Each chord is a half note with 3 tones
   */
  test('Build a Chord Progression - 4 chords with correct voicings', () => {
    render(<RiffScore id="cookbook-chords" />);
    const score = getAPI('cookbook-chords');

    act(() => {
      // Measure 1: C major chord
      score.select(1).addNote('C4', 'half').addTone('E4').addTone('G4');

      // Same measure: F major (cursor auto-advances after addNote)
      score.addNote('F4', 'half').addTone('A4').addTone('C5');
    });

    act(() => {
      // Measure 2: G major
      score.select(2).addNote('G4', 'half').addTone('B4').addTone('D5');

      // Same measure: C major
      score.addNote('C4', 'half').addTone('E4').addTone('G4');
    });

    const data = score.getScore();

    // Verify 4 chord events total (2 per measure)
    expect(countEventsInStaff(data)).toBe(4);
    expect(countEventsInMeasure(data, 0)).toBe(2);
    expect(countEventsInMeasure(data, 1)).toBe(2);

    // Verify each chord has 3 notes
    const measure1 = data.staves[0].measures[0];
    const measure2 = data.staves[0].measures[1];

    expect(measure1.events[0].notes.length).toBe(3); // C major
    expect(measure1.events[1].notes.length).toBe(3); // F major
    expect(measure2.events[0].notes.length).toBe(3); // G major
    expect(measure2.events[1].notes.length).toBe(3); // C major

    // Verify chord root notes
    expect(measure1.events[0].notes[0].pitch).toBe('C4');
    expect(measure1.events[1].notes[0].pitch).toBe('F4');
    expect(measure2.events[0].notes[0].pitch).toBe('G4');
    expect(measure2.events[1].notes[0].pitch).toBe('C4');
  });

  /**
   * Recipe: Enter Rests
   * Alternating pattern: note, rest, note, rest
   */
  test('Enter Rests - alternating notes and rests', () => {
    render(<RiffScore id="cookbook-rests" />);
    const score = getAPI('cookbook-rests');

    act(() => {
      score
        .select(1)
        .addNote('C4', 'quarter')
        .addRest('quarter')
        .addNote('E4', 'quarter')
        .addRest('quarter');
    });

    const data = score.getScore();
    const events = data.staves[0].measures[0].events;

    // Verify 4 events total
    expect(events.length).toBe(4);

    // Verify alternating pattern
    expect(events[0].notes[0].pitch).toBe('C4');
    expect(isRest(events[1])).toBe(true);
    expect(events[2].notes[0].pitch).toBe('E4');
    expect(isRest(events[3])).toBe(true);

    // Verify 2 rests total
    expect(countRestsInMeasure(data, 0)).toBe(2);
  });
});

// =============================================================================
// EDITING RECIPES
// =============================================================================

describe('Cookbook: Editing Recipes', () => {
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

  /**
   * Recipe: Change Duration of Selected Notes
   * Note: setDuration modifies the currently selected event
   */
  test('setDuration - changes event duration', () => {
    render(<RiffScore id="cookbook-duration" />);
    const score = getAPI('cookbook-duration');

    // Add a quarter note - this also selects it
    act(() => {
      score.select(1).addNote('C4', 'quarter');
    });

    // Change duration of the selected event
    act(() => {
      score.setDuration('eighth', true);
    });

    const data = score.getScore();
    const event = data.staves[0].measures[0].events[0];

    expect(event.duration).toBe('eighth');
    expect(event.dotted).toBe(true);
  });
});

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

describe('Cookbook: Batch Operations', () => {
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

  /**
   * Recipe: Batch with Transaction (Single Undo Step)
   * 16 sixteenth notes = 1 measure (16 × 4 quants = 64 quants)
   */
  test('Batch Transaction - 16 sixteenth notes, single undo reverts all', () => {
    render(<RiffScore id="cookbook-transaction" />);
    const score = getAPI('cookbook-transaction');

    act(() => {
      score.select(1);
      score.beginTransaction();

      for (let i = 0; i < 16; i++) {
        score.addNote(`C${(i % 3) + 4}`, 'sixteenth');
      }

      score.commitTransaction('Add Scale Run');
    });

    // Verify 16 notes were added
    const dataAfterAdd = score.getScore();
    expect(countEventsInStaff(dataAfterAdd)).toBe(16);

    // Single undo should revert all 16 notes
    act(() => {
      score.undo();
    });

    const dataAfterUndo = score.getScore();
    expect(countEventsInStaff(dataAfterUndo)).toBe(0);
  });

  /**
   * Recipe: Fill Measure with Rest
   */
  test('Fill Measure with Rest - whole rest fills measure', () => {
    render(<RiffScore id="cookbook-fill-rest" />);
    const score = getAPI('cookbook-fill-rest');

    // Add measures first (default score has 2 measures)
    act(() => {
      score.addMeasure().addMeasure();
      score.select(3).addRest('whole');
    });

    const data = score.getScore();
    const events = data.staves[0].measures[2].events;

    // Verify single whole rest
    expect(events.length).toBe(1);
    expect(isRest(events[0])).toBe(true);
    expect(events[0].duration).toBe('whole');
  });
});

// =============================================================================
// OBSERVABILITY
// =============================================================================

describe('Cookbook: Observability', () => {
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

  /**
   * Recipe: Monitor System Health (batch event)
   * The batch event fires when commitTransaction is called
   */
  test('batch event fires on transaction commit', async () => {
    render(<RiffScore id="cookbook-batch-event" />);
    const score = getAPI('cookbook-batch-event');

    const callback = jest.fn();
    const unsub = score.on('batch', callback);

    act(() => {
      score.select(1);
      score.beginTransaction();
      score.addNote('C4', 'quarter');
      score.commitTransaction('Test Batch');
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    const payload = callback.mock.calls[0][0];
    expect(payload.type).toBe('batch');
    expect(payload.timestamp).toBeDefined();
    expect(Array.isArray(payload.commands)).toBe(true);
    expect(payload.commands.length).toBeGreaterThan(0);

    unsub();
  });
});

// =============================================================================
// INTEGRATION RECIPES
// =============================================================================

describe('Cookbook: Integration Recipes', () => {
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

  /**
   * Recipe: Auto-Save to Backend
   * Score callback fires when React processes state update.
   */
  test('score event fires with updated score data', async () => {
    render(<RiffScore id="cookbook-autosave" />);
    const score = getAPI('cookbook-autosave');

    const callback = jest.fn();
    const unsub = score.on('score', callback);

    act(() => {
      score.select(1).addNote('C4');
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    // Verify callback received a score with the added note
    const receivedScore = callback.mock.calls[callback.mock.calls.length - 1][0];
    const pitches = getAllPitches(receivedScore);
    expect(pitches).toContain('C4');

    unsub();
  });

  /**
   * Recipe: Sync Selection with External UI
   */
  test('selection event fires on navigation', async () => {
    render(<RiffScore id="cookbook-sync-selection" />);
    const score = getAPI('cookbook-sync-selection');

    act(() => {
      score.select(1, 0, 0);
    });

    const callback = jest.fn();
    const unsub = score.on('selection', callback);

    act(() => {
      score.move('right');
    });

    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    const selection = callback.mock.calls[0][0];
    expect(typeof selection.staffIndex).toBe('number');
    expect('measureIndex' in selection).toBe(true);

    unsub();
  });
});

// =============================================================================
// EXPORT RECIPES
// =============================================================================

describe('Cookbook: Export Recipes', () => {
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

  /**
   * Recipe: Save as JSON
   */
  test('export JSON - valid JSON with score structure', () => {
    render(<RiffScore id="cookbook-export-json" />);
    const score = getAPI('cookbook-export-json');

    // Add some content first
    act(() => {
      score.select(1).addNote('C4', 'quarter');
    });

    const json = score.export('json');

    // Should be valid JSON
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();

    // Should contain the note we added
    const parsed = JSON.parse(json);
    expect(parsed.staves).toBeDefined();
    expect(parsed.staves[0].measures[0].events.length).toBe(1);
  });

  /**
   * Recipe: Load Saved Score
   */
  test('loadScore replaces current composition', () => {
    render(<RiffScore id="cookbook-load" />);
    const score = getAPI('cookbook-load');

    // Add content to current score
    act(() => {
      score.select(1).addNote('C4', 'quarter');
    });
    expect(countEventsInStaff(score.getScore())).toBe(1);

    // Load a different score
    const newScore = {
      title: 'Loaded Score',
      timeSignature: '4/4',
      keySignature: 'G',
      bpm: 100,
      staves: [
        {
          id: 'staff-1',
          clef: 'treble' as const,
          keySignature: 'G',
          measures: [{ id: 'm1', events: [] }],
        },
      ],
    };

    act(() => {
      score.loadScore(newScore);
    });

    const data = score.getScore();

    // Verify score was replaced
    expect(data.title).toBe('Loaded Score');
    expect(data.keySignature).toBe('G');
    expect(countEventsInStaff(data)).toBe(0);
  });
});

// =============================================================================
// QUERY RECIPES
// =============================================================================

describe('Cookbook: Query Recipes', () => {
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

  /**
   * Recipe: Get Current Score State
   */
  test('getScore - returns complete score structure', () => {
    render(<RiffScore id="cookbook-get-score" />);
    const score = getAPI('cookbook-get-score');

    const data = score.getScore();

    expect(data.title).toBeDefined();
    expect(data.staves).toBeDefined();
    expect(data.staves.length).toBeGreaterThan(0);
    expect(data.staves[0].measures.length).toBeGreaterThan(0);
    expect(data.timeSignature).toBeDefined();
    expect(data.keySignature).toBeDefined();
  });

  /**
   * Recipe: Get Current Selection
   */
  test('getSelection - returns selection state', () => {
    render(<RiffScore id="cookbook-get-selection" />);
    const score = getAPI('cookbook-get-selection');

    // Make a selection
    act(() => {
      score.select(1).addNote('C4', 'quarter');
    });

    const sel = score.getSelection();

    expect(typeof sel.staffIndex).toBe('number');
    expect(sel.measureIndex).toBe(0);
    expect(sel.eventId).toBeDefined();
    expect(sel.noteId).toBeDefined();
    expect(Array.isArray(sel.selectedNotes)).toBe(true);
  });

  /**
   * Recipe: Get Configuration
   */
  test('getConfig - returns configuration object', () => {
    render(<RiffScore id="cookbook-get-config" />);
    const score = getAPI('cookbook-get-config');

    const config = score.getConfig();

    expect(config).toBeDefined();
    expect(config.score).toBeDefined();
    expect(config.ui).toBeDefined();
    expect(typeof config.score.bpm).toBe('number');
  });
});

// =============================================================================
// MULTIPLE INSTANCES
// =============================================================================

describe('Cookbook: Multiple Instances', () => {
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

  /**
   * Recipe: Target Specific Editor
   */
  test('Target Specific Editor - instances are independent', () => {
    render(
      <>
        <RiffScore id="left-hand" />
        <RiffScore id="right-hand" />
      </>
    );

    const leftScore = window.riffScore.get('left-hand');
    const rightScore = window.riffScore.get('right-hand');

    expect(leftScore).toBeDefined();
    expect(rightScore).toBeDefined();
    expect(leftScore).not.toBe(rightScore);

    // Add different notes to each
    act(() => {
      leftScore?.select(1).addNote('C3', 'quarter');
      rightScore?.select(1).addNote('G4', 'quarter');
    });

    // Verify they're independent
    const leftData = leftScore?.getScore();
    const rightData = rightScore?.getScore();

    expect(getAllPitches(leftData!)).toContain('C3');
    expect(getAllPitches(rightData!)).toContain('G4');
    expect(getAllPitches(leftData!)).not.toContain('G4');
    expect(getAllPitches(rightData!)).not.toContain('C3');
  });

  /**
   * Recipe: Get Currently Active Editor
   */
  test('Active editor - returns most recently mounted', () => {
    render(<RiffScore id="active-test" />);

    const score = window.riffScore.active;

    expect(score).toBeDefined();
    expect(score).toBe(window.riffScore.get('active-test'));

    // Can use active instance to add notes
    act(() => {
      score?.addNote('C4', 'quarter');
    });

    const data = score?.getScore();
    expect(getAllPitches(data!)).toContain('C4');
  });
});
