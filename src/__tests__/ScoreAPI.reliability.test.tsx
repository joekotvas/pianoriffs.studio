import React from 'react';
import { render } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';
import { createTestScore } from './fixtures/selectionTestScores';

// Helper to access global registry
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('ScoreAPI Reliability (Issue #140)', () => {
  beforeEach(() => {
    // Clear registry between tests
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  const TEST_ID = 'reliability-test';
  
  // Use config to inject populated score
  const score = createTestScore();
  const config = { score: { staves: score.staves } };

  test('api.getScore() returns fresh data immediately after synchronous mutation', () => {
    render(<RiffScore id={TEST_ID} config={config} />);
    const api = getAPI(TEST_ID);

    // Initial State: createTestScore has 1 measure with events
    const initialScore = api.getScore();
    const initialMeasures = initialScore.staves[0].measures;
    // createTestScore measures: [m0, m1]
    expect(initialMeasures.length).toBe(2);

    // ACTION: Add a measure
    // This goes through dispatch -> ScoreEngine -> synchronous update
    api.addMeasure();

    // ASSERTION: Check state IMMEDIATELY (no await, no waitFor)
    // Currently this will FAIL (return 2) because getScore() reads a Ref updated by useEffect
    const freshScore = api.getScore();
    const freshMeasures = freshScore.staves[0].measures;

    expect(freshMeasures.length).toBe(3);
  });

  test('api.addNote() result is immediately visible in api.getScore()', () => {
    render(<RiffScore id={TEST_ID} config={config} />);
    const api = getAPI(TEST_ID);
    
    // Select the first event (m0.e0) which is a note (n0: C4)
    api.select(1, 0, 0); // Measure 1, Staff 0, Event 0
    
    // Changing pitch using setPitch (not updatePitch)
    api.setPitch('D4');
    
    const note = api.getScore().staves[0].measures[0].events[0].notes[0];
    
    // Should be D4 immediately
    expect(note.pitch).toBe('D4');
  });

  test('api.getSelection() is synchronous', () => {
    render(<RiffScore id={TEST_ID} config={config} />);
    const api = getAPI(TEST_ID);
    
    // Select something
    const firstEventId = api.getScore().staves[0].measures[0].events[0].id;
    api.select(1, 0, 0); // Measure 1, Staff 0, Event 0
    
    // Should be updated immediately (SelectionEngine is already sync)
    expect(api.getSelection().eventId).toBe(firstEventId);
  });

  test('api.setPitch() does nothing if no selection', () => {
    // New instance defaults to empty selection
    render(<RiffScore id={TEST_ID} config={config} />);
    const api = getAPI(TEST_ID);
    
    // Ensure selection is empty
    expect(api.getSelection().eventId).toBeNull();
    
    // Call setPitch
    api.setPitch('D4');
    
    // Verify no change (pitch remains C4 from createTestScore)
    const note = api.getScore().staves[0].measures[0].events[0].notes[0];
    expect(note.pitch).toBe('C4');
  });

  test('api.addMeasure() ignores arguments currently (robustness check)', () => {
    render(<RiffScore id={TEST_ID} config={config} />);
    const api = getAPI(TEST_ID);
    
    // Pass garbage arg
    api.addMeasure(999);
    
    const count = api.getScore().staves[0].measures.length;
    // Should still work (append) or fail gracefully. Current implementation ignores arg.
    expect(count).toBe(3); // 2 initial + 1 new
  });
});
