import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import ScoreEditor from '@components/Layout/ScoreEditor';
import { ScoreEvent, Note } from '@/engines/layout/types';
import { Score } from '@/types'; // Correct Score type import for the Editor props
import { CONFIG } from '@/config';

// Create a score with Beams, Tuplets, and Rests to force rendering of all Measure sub-components
const createComplexScore = (): Score => {
  // 1. Beamed Group (2 eighths)
  const beamedNotes: ScoreEvent[] = [
    {
      id: 'e1',
      duration: 'eighth',
      isRest: false,
      dotted: false,
      notes: [{ id: 'n1', pitch: 'C4', accidental: undefined }],
      quant: 0,
    },
    {
      id: 'e2',
      duration: 'eighth',
      isRest: false,
      dotted: false,
      notes: [{ id: 'n2', pitch: 'D4', accidental: undefined }],
      quant: 8, // 8th note spacing
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
      quant: 16,
    },
    {
      id: 't2',
      duration: 'eighth',
      dotted: false,
      isRest: false,
      notes: [{ id: 'tn2', pitch: 'F4' }],
      tuplet: { ratio: [3, 2], groupSize: 3, position: 1 },
      quant: 21.33,
    },
    {
      id: 't3',
      duration: 'eighth',
      dotted: false,
      isRest: false,
      notes: [{ id: 'tn3', pitch: 'G4' }],
      tuplet: { ratio: [3, 2], groupSize: 3, position: 2 },
      quant: 26.66,
    },
  ];

  // 3. Rest
  const restEvent: ScoreEvent = {
    id: 'r1',
    duration: 'quarter',
    isRest: true,
    dotted: false, // Added missing required property
    notes: [],
    quant: 32,
  };

  return {
    title: 'Complex Render Test',
    composer: 'Test',
    timeSignature: '4/4',
    keySignature: 'C',
    staves: [
      {
        clef: 'treble',
        measures: [
          {
            timeSignature: '4/4',
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
