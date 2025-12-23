/**
 * Smoke Tests
 *
 * Basic rendering and interaction tests for ScoreEditor.
 * Verifies component mounts and handles clef clicks.
 *
 * @see ScoreEditor
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScoreEditor from '@components/Layout/ScoreEditor';
import { ThemeProvider } from '@/context/ThemeContext';
import { createDefaultScore } from '@/types';

// Mock Child Component: Toolbar (Must support refs for imperative methods)
// We mock this because we want to intercept the "openClefMenu" call
jest.mock('../components/Toolbar/Toolbar', () => {
  return forwardRef((props: any, ref: any) => {
    const [lastAction, setLastAction] = useState<string>('');

    useImperativeHandle(ref, () => ({
      openClefMenu: () => setLastAction('CLEF_MENU_OPENED'),
      openKeySigMenu: () => setLastAction('KEYSIG_MENU_OPENED'),
      openTimeSigMenu: () => setLastAction('TIMESIG_MENU_OPENED'),
      isMenuOpen: () => false,
    }));

    return <div data-testid="score-toolbar">Mock Toolbar Check: {lastAction}</div>;
  });
});

// Mock hooks
jest.mock('../hooks/usePlayback', () => ({
  usePlayback: () => ({
    isPlaying: false,
    playbackPosition: { measureIndex: null, eventIndex: null, duration: 0 },
    playScore: jest.fn(),
    stopPlayback: jest.fn(),
    handlePlayToggle: jest.fn(),
    lastPlayStart: 0,
  }),
}));

jest.mock('../hooks/useMIDI', () => ({
  useMIDI: () => ({
    midiStatus: 'disconnected',
  }),
}));

jest.mock('../engines/toneEngine', () => ({
  playNote: jest.fn(),
  setInstrument: jest.fn(),
  isSamplerLoaded: jest.fn(() => false),
  InstrumentType: {},
}));

describe('ScoreEditor Smoke Test', () => {
  test('renders without crashing and handles clef clicks', () => {
    // Setup Grand Staff Score (createDefaultScore returns Treble + Bass by default)
    const grandStaffScore = createDefaultScore();

    render(
      <ThemeProvider>
        <ScoreEditor label="Test Editor" initialData={grandStaffScore} />
      </ThemeProvider>
    );

    // Verify key structural elements exist
    expect(screen.getByTestId('score-toolbar')).toBeInTheDocument();
    // Since we un-mocked ScoreCanvas, it renders real SVG.
    // ScoreCanvas renders Staff -> ScoreHeader -> Clef with data-testid="clef-treble"/"clef-bass"

    // 1. Check Treble Clef Click
    const trebleClef = screen.getByTestId('clef-treble');
    expect(trebleClef).toBeInTheDocument();

    fireEvent.click(trebleClef);

    // Verify Toolbar received the signal (via our mock text update)
    expect(screen.getByText('Mock Toolbar Check: CLEF_MENU_OPENED')).toBeInTheDocument();

    // 2. Check Bass Clef Click
    const bassClef = screen.getByTestId('clef-bass');
    expect(bassClef).toBeInTheDocument();

    fireEvent.click(bassClef);

    // Verify signal again (text remains same, but we confirm element presence)
    expect(screen.getByText('Mock Toolbar Check: CLEF_MENU_OPENED')).toBeInTheDocument();
  });
});
