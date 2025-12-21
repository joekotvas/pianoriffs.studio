/**
 * Comprehensive Rendering Tests
 *
 * Smoke test ensuring beams, tuplets, and rests render without crash.
 *
 * @see ScoreEditor
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';
import ScoreEditor from '@components/Layout/ScoreEditor';
import { Score, ScoreEvent } from '@/types';

// Create a score with Beams, Tuplets, and Rests to force rendering of all Measure sub-components
const createComplexScore = (): Score => {
  // 1. Beamed Group (2 eighths)
  const beamedNotes: ScoreEvent[] = [
    {
      id: 'e1',
      duration: 'eighth',
      isRest: false,
      dotted: false,
      notes: [{ id: 'n1', pitch: 'C4' }],
    },
    {
      id: 'e2',
      duration: 'eighth',
      isRest: false,
      dotted: false,
      notes: [{ id: 'n2', pitch: 'D4' }],
    },
  ];

  // 2. Tuplet
  const tupletNotes: ScoreEvent[] = [
    {
      id: 't1',
      duration: 'eighth',
      dotted: false,
      isRest: false,
      notes: [{ id: 'tn1', pitch: 'E4' }],
      tuplet: { ratio: [3, 2], groupSize: 3, position: 0 },
    },
    {
      id: 't2',
      duration: 'eighth',
      dotted: false,
      isRest: false,
      notes: [{ id: 'tn2', pitch: 'F4' }],
      tuplet: { ratio: [3, 2], groupSize: 3, position: 1 },
    },
    {
      id: 't3',
      duration: 'eighth',
      dotted: false,
      isRest: false,
      notes: [{ id: 'tn3', pitch: 'G4' }],
      tuplet: { ratio: [3, 2], groupSize: 3, position: 2 },
    },
  ];

  // 3. Rest
  const restEvent: ScoreEvent = {
    id: 'r1',
    duration: 'quarter',
    isRest: true,
    dotted: false,
    notes: [],
  };

  return {
    title: 'Complex Render Test',
    bpm: 120,
    timeSignature: '4/4',
    keySignature: 'C',
    staves: [
      {
        id: 'staff-1',
        clef: 'treble',
        keySignature: 'C',
        measures: [
          {
            id: 'm1',
            events: [...beamedNotes, ...tupletNotes, restEvent],
          },
        ],
      },
    ],
  };
};

// Mock the audio engine to avoid WebAudio errors
jest.mock('../engines/toneEngine', () => ({
  playNote: jest.fn(),
  setInstrument: jest.fn(),
  isSamplerLoaded: jest.fn(() => false),
  InstrumentType: {},
}));

describe('Comprehensive Rendering Test', () => {
  test('renders Beams, Tuplets, and Rests without crashing', () => {
    const score = createComplexScore();

    // This render should trigger Measure.tsx to render <Beam>, <TupletBracket>, and <Rest>
    // If imports are invalid (e.g. named import for default export), this often crashes Jest/TS-Jest
    render(
      <ThemeProvider>
        <ScoreEditor initialData={score} />
      </ThemeProvider>
    );

    // If we got here without error, success?
    // We can also check for DOM elements if we add test-ids or classes
  });
});
