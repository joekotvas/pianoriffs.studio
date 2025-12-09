import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreCanvas from '../components/Canvas/ScoreCanvas';
import { createDefaultScore } from '../types';
import { ThemeProvider } from '../context/ThemeContext';

import { ScoreContext } from '../context/ScoreContext';

// Mock dependencies
jest.mock('../components/Canvas/Staff', () => {
    const MockStaff = ({ measures, interaction, staffIndex = 0 }: any) => {
      // Mock STAFF behavior:
      // We render a clickable element to simulate clicking a note
      // Staff now receives `interaction` prop containing onSelectNote
      const onSelectNote = interaction?.onSelectNote;
      return (
        <div data-testid={`staff-${staffIndex}-container`}>
          {measures.map((m: any, i: number) => (
             <button
                key={m.id}
                data-testid={`note-in-staff-${staffIndex}-measure-${i}`}
                onClick={() => {
                    // Simulate selecting a note in this staff
                    // measureIndex=i, eventId=123, noteId=456
                    onSelectNote?.(i, 123, 456); 
                }}
             >
                Click Note Staff {staffIndex}
             </button>
          ))}
        </div>
      );
    };
    return {
      __esModule: true,
      default: MockStaff,
      calculateStaffWidth: jest.fn(() => 1000)
    };
  });

describe('Bass Clef Selection Reproduction', () => {
  // Create a score with 2 staves (Grand Staff)
  const grandStaffScore = createDefaultScore();
  grandStaffScore.staves.push({
      id: 'staff-bass',
      clef: 'bass',
      keySignature: 'C',
      measures: JSON.parse(JSON.stringify(grandStaffScore.staves[0].measures)) // Deep copy measures
  });

  const mockContextValue: any = {
      score: grandStaffScore,
      selection: { measureIndex: null, eventId: null, noteId: null, staffIndex: 0 },
      setSelection: jest.fn(),
      handleNoteSelection: jest.fn(), // This is what we want to spy on!
      handleMeasureHover: jest.fn(),
      addNoteToMeasure: jest.fn(),
      activeDuration: 'quarter',
      isDotted: false,
      previewNote: null,
      setPreviewNote: jest.fn(),
      handleTimeSignatureChange: jest.fn(),
      handleKeySignatureChange: jest.fn(),
      handleClefChange: jest.fn(),
      scoreRef: { current: grandStaffScore },
      updateNotePitch: jest.fn()
  };

  const mockHandlers = {
      // Only keep props that ScoreCanvas still accepts
      scale: 1,
      containerRef: { current: null, focus: jest.fn() } as any,
      onHoverChange: jest.fn(),
      playbackPosition: { measureIndex: null, quant: null, duration: 0 }
  };

  test('should pass correct staffIndex when clicking note in bass staff', () => {
    render(
      <ThemeProvider>
        <ScoreContext.Provider value={mockContextValue}>
            <ScoreCanvas 
              {...mockHandlers}
            />
        </ScoreContext.Provider>
      </ThemeProvider>
    );

    // Verify both staves are rendered
    expect(screen.getByTestId('staff-0-container')).toBeInTheDocument();
    expect(screen.getByTestId('staff-1-container')).toBeInTheDocument();

    // Click note in Staff 1 (Bass)
    fireEvent.click(screen.getByTestId('note-in-staff-1-measure-0'));

    // Check if handleNoteSelection was called with staffIndex 1 (4th argument)
    expect(mockContextValue.handleNoteSelection).toHaveBeenCalledWith(0, 123, 456, 1);
  });
});
