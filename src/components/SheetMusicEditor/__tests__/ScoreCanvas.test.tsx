import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreCanvas from '../components/Canvas/ScoreCanvas';
import { createDefaultScore } from '../types';
import { ThemeProvider } from '../context/ThemeContext';
import { ScoreContext } from '../context/ScoreContext';

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
    calculateStaffWidth: jest.fn(() => 1000)
  };
});

describe('ScoreCanvas', () => {
  const mockScore = createDefaultScore();
  
  const mockContextValue: any = {
      score: mockScore,
      selection: { measureIndex: null, eventId: null, noteId: null, staffIndex: 0 },
      setSelection: jest.fn(),
      handleNoteSelection: jest.fn(),
      handleMeasureHover: jest.fn(),
      addNoteToMeasure: jest.fn(),
      activeDuration: 'quarter',
      isDotted: false,
      previewNote: null,
      setPreviewNote: jest.fn(),
      handleTimeSignatureChange: jest.fn(),
      handleKeySignatureChange: jest.fn(),
      handleClefChange: jest.fn(),
      scoreRef: { current: mockScore },
      updateNotePitch: jest.fn()
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
    onBackgroundClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all measures', () => {
    render(
      <ThemeProvider>
        <ScoreContext.Provider value={mockContextValue}>
            <ScoreCanvas 
              {...mockHandlers}
            />
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
            <ScoreCanvas 
              {...mockHandlers}
            />
        </ScoreContext.Provider>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('measure-0-staff-0'));
    
    expect(mockContextValue.handleNoteSelection).toHaveBeenCalled();
    // Now uses separate args: (measureIndex, eventId, noteId, staffIndex)
    expect(mockContextValue.handleNoteSelection).toHaveBeenCalledWith(0, undefined, undefined, 0);
  });
});
