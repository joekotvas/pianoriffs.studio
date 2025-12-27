/**
 * Cursor Playback Timing Test
 *
 * Verifies that the cursor receives the correct duration immediately upon playback start,
 * preventing the "initial jump" issue where the cursor would animate too quickly (0.1s fallback)
 * instead of sweeping across the first note over its full duration.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScoreEditor from '../components/Layout/ScoreEditor';
import { ThemeProvider } from '@/context/ThemeContext';
import { createDefaultScore } from '@/types';

// Mock Tone.js engines
jest.mock('../engines/toneEngine', () => ({
  initTone: jest.fn((cb) => cb({ instrumentState: 'ready' })),
  scheduleTonePlayback: jest.fn(),
  stopTonePlayback: jest.fn(),
  playNote: jest.fn(),
  setInstrument: jest.fn(),
  isSamplerLoaded: jest.fn(() => true),
  InstrumentType: {},
}));

// Mock MIDI to prevent warnings
jest.mock('../hooks/audio/useMIDI', () => ({
  useMIDI: () => ({ midiStatus: 'disconnected' }),
}));

// Fix JSDOM missing scrollTo
Element.prototype.scrollTo = jest.fn();

// Mock ResizeObserver for ScoreEditor layout
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Cursor Playback Timing Integration', () => {
  test('Cursor transition duration matches first note duration immediately when Play is clicked', async () => {
    // 1. Setup Score with a known note duration
    const score = createDefaultScore();
    // Default BPM is 120. Quarter note = 0.5s (500ms).
    // Ensure first event at 0:0 is a quarter note.
    const noteEvent = {
      id: 'e1',
      measureIndex: 0,
      quant: 0,
      duration: 'quarter', // 0.5s at 120BPM
      isRest: false,
      dotted: false,
      notes: [{ id: 'n1', pitch: 'C4' }],
    };
    score.staves[0].measures[0].events = [noteEvent];

    render(
      <ThemeProvider>
        <ScoreEditor label="Cursor Test" initialData={score} />
      </ThemeProvider>
    );

    // 2. Playback Button
    const playButton = screen.getByRole('button', { name: /play/i });

    // 3. User Clicks Play
    // 3. User Clicks Play
    fireEvent.click(playButton);

    // 4. Verify Cursor State
    // The cursor is rendered inside ScoreCanvas (SVG).

    // Wait for async playback start (20ms yield)
    await waitFor(() => {
      const cursorGroup = screen.getByTestId('playback-cursor');
      const style = cursorGroup.style;

      // CRITICAL ASSERTION:
      // We expect 0.5s.
      expect(style.transition).toMatch(/0\.5s/);
    });
  });
});
