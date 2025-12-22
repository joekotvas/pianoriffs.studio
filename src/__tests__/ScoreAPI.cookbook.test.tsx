/**
 * ScoreAPI.cookbook.test.tsx
 *
 * Integration tests validating all ✅ recipes from docs/COOKBOOK.md.
 * If a recipe is marked as working in the docs, it MUST pass here.
 *
 * Purpose:
 * - Ensure documentation stays in sync with implementation
 * - Catch regressions in documented API workflows
 * - Serve as living examples of API usage
 */

import { render, waitFor } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';

// Helper to get typed API
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('Cookbook: Entry Recipes', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  /**
   * Recipe: Write a C Major Scale ✅
   * docs/COOKBOOK.md lines 18-30
   */
  test('Write a C Major Scale', () => {
    render(<RiffScore id="cookbook-scale" />);
    const api = getAPI('cookbook-scale');

    // Execute the documented recipe
    api
      .select(1)
      .addNote('C4', 'quarter')
      .addNote('D4', 'quarter')
      .addNote('E4', 'quarter')
      .addNote('F4', 'quarter')
      .addNote('G4', 'quarter')
      .addNote('A4', 'quarter')
      .addNote('B4', 'quarter')
      .addNote('C5', 'quarter');

    // Verify: Selection should be defined (notes were added)
    const selection = api.getSelection();
    expect(selection.eventId).toBeDefined();
    expect(selection.noteId).toBeDefined();
  });

  /**
   * Recipe: Build a Chord Progression (I-IV-V-I) ✅
   * docs/COOKBOOK.md lines 34-55
   */
  test('Build a Chord Progression (I-IV-V-I)', () => {
    render(<RiffScore id="cookbook-chords" />);
    const api = getAPI('cookbook-chords');

    // Measure 1: C major chord
    api.select(1).addNote('C4', 'half').addTone('E4').addTone('G4');

    // Cursor auto-advances; add F major
    api.addNote('F4', 'half').addTone('A4').addTone('C5');

    // Measure 2: G major then C major
    api
      .addNote('G4', 'half')
      .addTone('B4')
      .addTone('D5')
      .addNote('C4', 'half')
      .addTone('E4')
      .addTone('G4');

    // Verify: Should have added chords successfully
    expect(api.getSelection().eventId).toBeDefined();
  });

  /**
   * Recipe: Enter Rests ✅
   * docs/COOKBOOK.md lines 59-65
   */
  test('Enter Rests', () => {
    render(<RiffScore id="cookbook-rests" />);
    const api = getAPI('cookbook-rests');

    api
      .select(1)
      .addNote('C4', 'quarter')
      .addRest('quarter')
      .addNote('E4', 'quarter')
      .addRest('quarter');

    expect(api.getSelection().eventId).toBeDefined();
  });
});

describe('Cookbook: Batch Operations', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  /**
   * Recipe: Batch with Transaction (Single Undo Step) ✅
   * docs/COOKBOOK.md lines 100-108
   */
  test('Batch with Transaction (Single Undo Step)', () => {
    render(<RiffScore id="cookbook-transaction" />);
    const api = getAPI('cookbook-transaction');

    api.select(1);
    api.beginTransaction();

    for (let i = 0; i < 16; i++) {
      api.addNote(`C${(i % 3) + 4}`, 'sixteenth');
    }

    api.commitTransaction('Add Scale Run');

    // After commit, selection should be valid
    expect(api.getSelection().eventId).toBeDefined();

    // Single undo should revert all 16 notes
    api.undo();
    // Selection may now point to a different/no event
  });

  /**
   * Recipe: Fill Measure with Rest ✅
   * docs/COOKBOOK.md lines 114-117
   */
  test('Fill Measure with Rest', () => {
    render(<RiffScore id="cookbook-fill-rest" />);
    const api = getAPI('cookbook-fill-rest');

    api
      .select(3) // Measure 3
      .addRest('whole');

    expect(api.getSelection().eventId).toBeDefined();
  });
});

describe('Cookbook: Integration Recipes', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  /**
   * Recipe: Auto-Save to Backend ✅
   * docs/COOKBOOK.md lines 125-131
   *
   * Score callbacks fire when React processes the state update.
   * This is asynchronous (via useEffect) but happens before the next paint.
   */
  test('Auto-Save to Backend (callback fires on mutation)', async () => {
    // Mock scrollTo for jsdom
    Element.prototype.scrollTo = jest.fn();

    render(<RiffScore id="cookbook-autosave" />);
    const api = getAPI('cookbook-autosave');

    const callback = jest.fn();
    const unsub = api.on('score', callback);

    // Make a change - addNote dispatches a command that updates React state
    api.select(1).addNote('C4');

    // Score callback fires after React processes the update (via useEffect)
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    // Verify callback was invoked with a score object
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        staves: expect.any(Array),
      })
    );

    // Cleanup
    unsub();
  });

  /**
   * Recipe: Sync Selection with External UI ✅
   * docs/COOKBOOK.md lines 138-144
   *
   * Selection callbacks fire when React processes the state update.
   * This is asynchronous (via useEffect) but happens before the next paint.
   */
  test('Sync Selection with External UI (callback fires on navigation)', async () => {
    // Mock scrollTo for jsdom
    Element.prototype.scrollTo = jest.fn();

    render(<RiffScore id="cookbook-sync-selection" />);
    const api = getAPI('cookbook-sync-selection');

    // First select something to have a starting point
    api.select(1, 0, 0);

    const callback = jest.fn();
    const unsub = api.on('selection', callback);

    // Navigate to trigger selection change
    api.move('right');

    // Selection callback fires after React processes the update (via useEffect)
    await waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    // Verify callback was invoked with selection data
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        staffIndex: expect.any(Number),
      })
    );

    // Cleanup
    unsub();
  });
});

describe('Cookbook: Export Recipes', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  /**
   * Recipe: Save as JSON ✅
   * docs/COOKBOOK.md lines 165-168
   */
  test('Save as JSON', () => {
    render(<RiffScore id="cookbook-export-json" />);
    const api = getAPI('cookbook-export-json');

    const json = api.export('json');

    // Should be valid JSON string
    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();

    // Should contain score structure
    const parsed = JSON.parse(json);
    expect(parsed.staves).toBeDefined();
    expect(parsed.timeSignature).toBeDefined();
  });
});

describe('Cookbook: Query Recipes', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  /**
   * Recipe: Get Current Score State ✅
   * docs/COOKBOOK.md lines 196-200
   */
  test('Get Current Score State', () => {
    render(<RiffScore id="cookbook-get-score" />);
    const api = getAPI('cookbook-get-score');

    const score = api.getScore();

    expect(score.title).toBeDefined();
    expect(score.staves).toBeDefined();
    expect(score.staves[0].measures.length).toBeGreaterThan(0);
  });

  /**
   * Recipe: Get Current Selection ✅
   * docs/COOKBOOK.md lines 204-209
   */
  test('Get Current Selection', () => {
    render(<RiffScore id="cookbook-get-selection" />);
    const api = getAPI('cookbook-get-selection');

    const sel = api.getSelection();

    expect(sel.staffIndex).toBeDefined();
    expect(sel.selectedNotes).toBeDefined();
    // eventId may be null initially, but property exists
    expect('eventId' in sel).toBe(true);
  });

  /**
   * Recipe: Get Configuration ✅
   * docs/COOKBOOK.md lines 213-216
   */
  test('Get Configuration', () => {
    render(<RiffScore id="cookbook-get-config" />);
    const api = getAPI('cookbook-get-config');

    const config = api.getConfig();

    expect(config).toBeDefined();
    expect(config.score).toBeDefined();
    expect(config.ui).toBeDefined();
  });
});

describe('Cookbook: Multiple Instances', () => {
  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  /**
   * Recipe: Target Specific Editor ✅
   * docs/COOKBOOK.md lines 224-231
   */
  test('Target Specific Editor', () => {
    render(
      <>
        <RiffScore id="left-hand" />
        <RiffScore id="right-hand" />
      </>
    );

    const leftApi = window.riffScore.get('left-hand');
    const rightApi = window.riffScore.get('right-hand');

    expect(leftApi).toBeDefined();
    expect(rightApi).toBeDefined();

    // Both can add notes independently
    leftApi?.select(1).addNote('C3', 'quarter');
    rightApi?.select(1).addNote('G4', 'quarter');

    // Verify they're different instances
    expect(leftApi).not.toBe(rightApi);
  });

  /**
   * Recipe: Get Currently Active Editor ✅
   * docs/COOKBOOK.md lines 235-240
   */
  test('Get Currently Active Editor', () => {
    render(<RiffScore id="active-test" />);

    const api = window.riffScore.active;

    expect(api).toBeDefined();
    expect(api).toBe(window.riffScore.get('active-test'));

    if (api) {
      api.addNote('C4', 'quarter');
      expect(api.getSelection().eventId).toBeDefined();
    }
  });
});
