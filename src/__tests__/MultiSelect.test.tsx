import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreEditor from '@components/Layout/ScoreEditor';
import { ThemeProvider } from '@/context/ThemeContext';
import { createDefaultScore } from '@/types';

// Mocks
jest.mock('../components/Toolbar/Toolbar', () => (props: any) => (
  <div data-testid="score-toolbar" />
));
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
  useMIDI: () => ({ midiStatus: 'disconnected' }),
}));
jest.mock('../engines/toneEngine', () => ({
  playNote: jest.fn(),
  setInstrument: jest.fn(),
  isSamplerLoaded: jest.fn(() => false),
  InstrumentType: {},
}));

// Mock Component to consume context and trigger actions
const MockNoteTrigger = () => {
  const { handleNoteSelection, selection, setSelection, transposeSelection } =
    require('../context/ScoreContext').useScoreContext();

  return (
    <div>
      <div data-testid="selection-count">
        {selection.selectedNotes ? selection.selectedNotes.length : 0}
      </div>
      <div data-testid="selected-note-ids">
        {selection.selectedNotes ? selection.selectedNotes.map((n: any) => n.noteId).join(',') : ''}
      </div>
      <button
        data-testid="select-note-1"
        onClick={(e: any) => handleNoteSelection(0, 'e1', 'n1', 0, e.metaKey)}
      />
      <button
        data-testid="select-note-2"
        onClick={(e: any) => handleNoteSelection(0, 'e2', 'n2', 0, e.metaKey)}
      />
      <button
        data-testid="simulate-add-note"
        onClick={() =>
          setSelection({
            staffIndex: 0,
            measureIndex: 0,
            eventId: 'e1',
            noteId: 'n1',
            selectedNotes: [],
          })
        }
      />
      <button data-testid="transpose-up" onClick={() => transposeSelection('up', false)} />
    </div>
  );
};

// Mock ScoreCanvas to use MockNoteTrigger
jest.mock('../components/Canvas/ScoreCanvas', () => {
  return () => <MockNoteTrigger />;
});

describe('Multi-Note Selection Integration', () => {
  // Setup a score with some notes
  const scoreWithNotes = createDefaultScore();
  scoreWithNotes.staves[0].measures[0].events = [
    { id: 'e1', duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] },
    { id: 'e2', duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] },
  ];

  test('Cmd+Click selects multiple notes', () => {
    render(
      <ThemeProvider>
        <ScoreEditor initialData={scoreWithNotes} />
      </ThemeProvider>
    );

    // 1. Select first note (Single click)
    fireEvent.click(screen.getByTestId('select-note-1'));
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n1');

    // 2. Select second note with Cmd (Multi click)
    fireEvent.click(screen.getByTestId('select-note-2'), { metaKey: true });

    // Should have 2 notes selected
    expect(screen.getByTestId('selection-count')).toHaveTextContent('2');
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n1');
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n2');

    // 3. Deselect first note with Cmd (Multi click toggle)
    fireEvent.click(screen.getByTestId('select-note-1'), { metaKey: true });

    // Should have 1 note selected (n2)
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n2');

    // 4. Select first note WITHOUT Cmd (Single click reset)
    fireEvent.click(screen.getByTestId('select-note-1'));

    // Should have 1 note selected (n1 only)
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n1');
  });

  test('Add Note -> Cmd+Click -> Transpose flow', () => {
    render(
      <ThemeProvider>
        <ScoreEditor initialData={scoreWithNotes} />
      </ThemeProvider>
    );

    // 1. Simulate "Note Entry" selection (programmatic setSelection via button)
    fireEvent.click(screen.getByTestId('simulate-add-note'));

    // 2. Cmd+Click second note (n2)
    fireEvent.click(screen.getByTestId('select-note-2'), { metaKey: true });

    // Verify selection state: Should have n1 and n2
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n1');
    expect(screen.getByTestId('selected-note-ids')).toHaveTextContent('n2');

    // 3. Transpose Up
    fireEvent.click(screen.getByTestId('transpose-up'));

    // If it doesn't crash, test passes.
  });
});
