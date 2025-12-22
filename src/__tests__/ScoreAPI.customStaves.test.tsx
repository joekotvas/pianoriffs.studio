import React from 'react';
import { render, act } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';
import { createSingleStaffScore } from './fixtures/selectionTestScores';

// Helper to access global registry
const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

// Mock ScoreAPI to test Alto Clef functionality
const TEST_ID = 'api-test-score';

// Mock scrollTo for JSDOM (doesn't implement it)
Element.prototype.scrollTo = jest.fn();

describe('ScoreAPI Custom Staves & Alto Clef (Phase 6B)', () => {

  beforeEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
  });

  // REPRODUCTION 1: Add note on single staff (assert failure if logic assumes staff index 0)
  it('api.addNote() works on single-staff score', async () => {
    const singleStaffScore = createSingleStaffScore();
    // singleStaffScore has 1 staff (Treble)
    
    render(<RiffScore id={TEST_ID} config={{ score: { staves: singleStaffScore.staves } }} />);
    const api = getAPI(TEST_ID);

    // Select first measure
    await act(async () => {
      api.select(1);
    });

    // Add note
    await act(async () => {
      api.addNote('C4', 'quarter', false);
    });

    // Verify - fixture has 1 event, we added 1 more = 2 events
    const score = api.getScore();
    const events = score.staves[0].measures[0].events;
    expect(events.length).toBe(2);
    expect(events[1].notes[0].pitch).toBe('C4');
  });

  // REPRODUCTION 2: Add note on 3rd staff (index 2)
  // Currently, logic might hardcode checking if index < 2 or similar
  it('api.addNote() works on staff index 2 (Multi-staff)', async () => {
     // Manually create multi-staff score
     const multiStaffScore = {
       ...createSingleStaffScore(),
       staves: [
         { id: 's1', clef: 'treble', keySignature: 'C', measures: [{ id: 'm0-s1', events: [] }] },
         { id: 's2', clef: 'treble', keySignature: 'C', measures: [{ id: 'm0-s2', events: [] }] },
         { id: 's3', clef: 'treble', keySignature: 'C', measures: [{ id: 'm0-s3', events: [] }] },
       ]
     } as any; // Cast as any because createSingleStaffScore returns strictly typed Score

     render(<RiffScore id={TEST_ID} config={{ score: { staves: multiStaffScore.staves } }} />);
     const api = getAPI(TEST_ID);

     // Select Staff 2 (3rd staff). Measure index 0 (1-based API = 1)
    await act(async () => {
      api.select(1, 2);
    });

    // Add note
    await act(async () => {
      api.addNote('E4', 'quarter', false);
    });

    // Verify note was added to staff 3 (index 2)
    // We can't easily inspect internal state via API getter for specific staves if not exposed,
    // but we can check the score object relative to the hook if we had access.
    // However, since we are using getAPI, we can use api.getScore().
    const score = api.getScore();
    const staff3 = score.staves[2];
    const staff3Events = staff3.measures[0].events;

    expect(staff3Events.length).toBeGreaterThan(0);
    expect(staff3Events[0].notes[0].pitch).toBe('E4');
  });

  it('renders Alto clef without crashing', async () => {
    // Setup score with Alto clef
    const altoScore = {
      staves: [
        {
          id: 's1',
          clef: 'alto',
          keySignature: 'C',
          measures: [{ id: 'm1', events: [] }],
        },
      ],
    } as any;

    // Just verify render succeeds without crashing (no need to query DOM)
    expect(() => {
      render(<RiffScore id={TEST_ID} config={{ score: { staves: altoScore.staves } }} />);
    }).not.toThrow();
  });
});
