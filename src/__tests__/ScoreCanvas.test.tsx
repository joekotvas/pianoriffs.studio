/**
 * ScoreCanvas Tests
 *
 * Tests for ScoreCanvas component rendering and measure interaction.
 *
 * @see ScoreCanvas
 */

import { render, screen, fireEvent } from '@testing-library/react';
import ScoreCanvas from '@/components/Canvas/ScoreCanvas';
import { createDefaultScore } from '@/types';
import { ThemeProvider } from '@/context/ThemeContext';
import { ScoreContext } from '@/context/ScoreContext';

// Mock dependencies
jest.mock('../components/Canvas/Staff', () => {
  const MockStaff = ({ measures, interaction, staffIndex = 0 }: any) => {
    // Staff now receives `interaction` prop containing onSelectNote
    const onSelectNote = interaction?.onSelectNote;
    return (
      <g data-testid={`staff-${staffIndex}`}>
        {measures.map((m: any, i: number) => (
          <rect
            key={m.id}
            data-testid={`measure-${i}-staff-${staffIndex}`}
            onClick={() => onSelectNote?.(i, undefined, undefined)} // Simulate interaction with separate args
          />
        ))}
      </g>
    );
  };
  return {
    __esModule: true,
    default: MockStaff,
    calculateStaffWidth: jest.fn(() => 1000),
  };
});

describe('ScoreCanvas', () => {
  const mockScore = createDefaultScore();

  const mockContextValue: any = {
    // Grouped API
    state: {
      score: mockScore,
      selection: { measureIndex: null, eventId: null, noteId: null, staffIndex: 0 },
      previewNote: null,
      editorState: 'IDLE',
      history: [],
      redoStack: [],
    },
    tools: {
      activeDuration: 'quarter',
      isDotted: false,
      activeAccidental: null,
      activeTie: false,
      inputMode: 'NOTE',
      setActiveDuration: jest.fn(),
      setIsDotted: jest.fn(),
      setInputMode: jest.fn(),
      toggleInputMode: jest.fn(),
    },
    navigation: {
      select: jest.fn(),
      move: jest.fn(),
      transpose: jest.fn(),
      switchStaff: jest.fn(),
      focus: jest.fn(),
    },
    entry: {
      addNote: jest.fn(),
      addChord: jest.fn(),
      delete: jest.fn(),
      handleMeasureHover: jest.fn(),
      updatePitch: jest.fn(),
    },
    modifiers: {
      duration: jest.fn(),
      dot: jest.fn(),
      accidental: jest.fn(),
      tie: jest.fn(),
      checkDurationValidity: jest.fn(() => true),
      checkDotValidity: jest.fn(() => true),
    },
    measures: {
      add: jest.fn(),
      remove: jest.fn(),
      setTimeSignature: jest.fn(),
      setKeySignature: jest.fn(),
      togglePickup: jest.fn(),
      setGrandStaff: jest.fn(),
    },
    tuplets: {
      apply: jest.fn(),
      remove: jest.fn(),
      canApply: jest.fn(() => false),
      activeRatio: null,
    },
    historyAPI: {
      undo: jest.fn(),
      redo: jest.fn(),
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    },
    engines: {
      dispatch: jest.fn(),
      selectionEngine: { dispatch: jest.fn() },
      scoreRef: { current: mockScore },
    },
    derived: {
      selectedDurations: [],
      selectedDots: [],
      selectedTies: [],
      selectedAccidentals: [],
    },
    // Additional exports
    setSelection: jest.fn(),
    setPreviewNote: jest.fn(),
    clearSelection: jest.fn(),
    currentQuantsPerMeasure: 64,
    // UI state from ScoreContext
    pendingClefChange: null,
    setPendingClefChange: jest.fn(),
    handleClefChange: jest.fn(),
  };

  const mockHandlers = {
    // Required props
    scale: 1,
    containerRef: { current: null } as any,
    onHoverChange: jest.fn(),
    playbackPosition: { measureIndex: null, quant: null, duration: 0 },
    onKeySigClick: jest.fn(),
    onTimeSigClick: jest.fn(),
    onClefClick: jest.fn(),
    onBackgroundClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all measures', () => {
    render(
      <ThemeProvider>
        <ScoreContext.Provider value={mockContextValue}>
          <ScoreCanvas {...mockHandlers} />
        </ScoreContext.Provider>
      </ThemeProvider>
    );

    // Default score has 2 measures
    expect(screen.getByTestId('measure-0-staff-0')).toBeInTheDocument();
    expect(screen.getByTestId('measure-1-staff-0')).toBeInTheDocument();
  });

  test('should handle measure clicks', () => {
    render(
      <ThemeProvider>
        <ScoreContext.Provider value={mockContextValue}>
          <ScoreCanvas {...mockHandlers} />
        </ScoreContext.Provider>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('measure-0-staff-0'));

    expect(mockContextValue.navigation.select).toHaveBeenCalled();
    // Now uses separate args: (measureIndex, eventId, noteId, staffIndex)
    expect(mockContextValue.navigation.select).toHaveBeenCalledWith(
      0,
      undefined,
      undefined,
      0,
      undefined
    );
  });
});
