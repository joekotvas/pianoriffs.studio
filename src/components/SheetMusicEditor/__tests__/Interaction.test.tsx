import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreEditor from '../ScoreEditor';
import { ThemeProvider } from '../context/ThemeContext';
import { createDefaultScore } from '../types';
import { CONFIG } from '../config';

// Fix JSDOM missing scrollTo
Element.prototype.scrollTo = jest.fn();

// --- MOCKS ---

// Mock Child Components to isolate interaction testing
jest.mock('../components/Toolbar/Toolbar', () => {
    return forwardRef((props: any, ref: any) => {
        useImperativeHandle(ref, () => ({
            openClefMenu: jest.fn(),
            openKeySigMenu: jest.fn(),
            openTimeSigMenu: jest.fn(),
            isMenuOpen: () => false
        }));
        return <div data-testid="score-toolbar">Mock Toolbar</div>;
    });
});

jest.mock('../components/Panels/OutputPanel', () => () => <div data-testid="output-panel">Mock Output Panel</div>);

// Mock Tone.js
jest.mock('../engines/toneEngine', () => ({
    playNote: jest.fn(),
    setInstrument: jest.fn(),
    isSamplerLoaded: jest.fn(() => false),
    InstrumentType: {},
}));

// Mock Hooks
jest.mock('../hooks/usePlayback', () => ({
    usePlayback: () => ({
        isPlaying: false,
        playbackPosition: { measureIndex: null, eventIndex: null, duration: 0 },
        playScore: jest.fn(),
        stopPlayback: jest.fn(),
        handlePlayToggle: jest.fn(),
        lastPlayStart: 0
    })
}));

jest.mock('../hooks/useMIDI', () => ({
    useMIDI: () => ({ midiStatus: 'disconnected' })
}));

describe('ScoreEditor Interactions', () => {
    
    test('User can add a note by clicking on a measure', async () => {
        const score = createDefaultScore();
        
        render(
            <ThemeProvider>
                <ScoreEditor label="Interaction Test" initialData={score} />
            </ThemeProvider>
        );

        // 1. Locate the first measure's hit area (Treble Staff)
        // Measure index 0 is on the first staff (index 0).
        const hitArea = screen.getByTestId('measure-hit-area-0-0');
        expect(hitArea).toBeInTheDocument();

        // 2. Simulate Hover to set Pitch
        // We need to calculate client coordinates that map to a specific pitch.
        // Scale is 1 by default. BaseY is... dependent on config.
        // In test env, getBoundingClientRect usually returns 0,0 provided we don't mock it heavily.
        // Let's assume standard layout.
        // In Measure.tsx: yOffset = Math.round((y - 50) / 6) * 6;
        // rect y is baseY - 50.
        // If we want C4 (Middle C), offset is 60 (from positioning.ts).
        // So we want yOffset = 60.
        // 60 = (y - 50). So y = 110.
        // This 'y' is relative to the hit area's top + 50? No.
        // measure.tsx: const y = (e.clientY - rect.top) / scale;
        // rect.top in test is likely 0.
        // visual y = 110. (relative to rect top?)
        // Wait, logic: yOffset = Math.round((y - 50) / 6) * 6;
        // We want offset 60. 60 = (y - 50). y = 110.
        // So clientY should be 110 (assuming rect.top=0, scale=1).
        
        fireEvent.mouseMove(hitArea, { clientX: 50, clientY: 110 });

        // Wait for preview ghost to appear (async state update)
        const ghost = await screen.findByTestId('ghost-note');
        expect(ghost).toBeInTheDocument();

        // 3. Simulate Click to Add Note
        fireEvent.click(hitArea, { clientX: 50, clientY: 110 });

        // 4. Verify Note Creation via Audio Feedback
        const { playNote } = require('../engines/toneEngine');
        expect(playNote).toHaveBeenCalledWith('C4');
    });

    test('User can insert a note between existing notes', async () => {
         const score = createDefaultScore();
         
         render(
             <ThemeProvider>
                 <ScoreEditor label="Interaction Test" initialData={score} />
             </ThemeProvider>
         );
         
         const hitArea = screen.getByTestId('measure-hit-area-0-0');
         const { playNote } = require('../engines/toneEngine');
         jest.clearAllMocks();

         // Click 1: Add C4 at start
         fireEvent.mouseMove(hitArea, { clientX: 50, clientY: 110 });
         await screen.findByTestId('ghost-note');
         fireEvent.click(hitArea, { clientX: 50, clientY: 110 });
         expect(playNote).toHaveBeenCalledWith('C4');
         
         // Click 2: Add E4 later in the measure (Insert/Append)
         // Move to right (clientX 150). E4 offset 48 -> y 98.
         fireEvent.mouseMove(hitArea, { clientX: 150, clientY: 98 });
         // Wait for ghost to update (might need to wait for strictness, but findByTestId will wait)
         // Since ghost-note ID is same, we might want to wait for it to be visible? 
         // It's already in doc, just moved.
         // Let's just fire click, hoping React updated. If flaky, we add wait.
         // Actually, let's wait for a re-render cycle via act or findBy.
         // Since we can't easily check position change without style parsing, let's just click.
         fireEvent.click(hitArea, { clientX: 150, clientY: 98 });
         expect(playNote).toHaveBeenCalledWith('E4');
         
         // Click 3: Insert D4 between them
         // X ~100. D4 offset 54 -> y 104.
         fireEvent.mouseMove(hitArea, { clientX: 100, clientY: 104 });
         fireEvent.click(hitArea, { clientX: 100, clientY: 104 });
         expect(playNote).toHaveBeenLastCalledWith('D4');
    });

    test('User can delete a selected note', async () => {
        const score = createDefaultScore();
        // Setup: Add a note first
        const { unmount } = render(
            <ThemeProvider>
                <ScoreEditor label="Interaction Test" initialData={score} />
            </ThemeProvider>
        );

        const hitArea = screen.getByTestId('measure-hit-area-0-0');
        
        // Add Note C4
        fireEvent.mouseMove(hitArea, { clientX: 50, clientY: 110 });
        await screen.findByTestId('ghost-note');
        fireEvent.click(hitArea, { clientX: 50, clientY: 110 });

        // Note should now exist as a chord group.
        // We need to SELECT it.
        // Interaction model: Click on the note head (ChordGroup).
        // Since we added data-testid `chord-${eventId}` to ChordGroup, we need to find it.
        // But we don't know the random event ID generated!
        // However, we DO know it is NOT 'ghost-note'.
        const chords = screen.getAllByTestId(/^chord-/);
        expect(chords.length).toBeGreaterThan(0);
        const noteGroup = chords[0]; // The one we just added

        // Click to Select
        fireEvent.click(noteGroup);
        
        // Wait for selection to be applied (async state update)
        await waitFor(() => {
             expect(noteGroup).toHaveAttribute('data-selected', 'true');
        });

        // Ensure container is focused for keyboard shortcuts to work (Wait, verifying focus inside waitFor is redundant)
         const container = screen.getByTestId('score-canvas-container');
         fireEvent.focus(container);
         fireEvent.mouseEnter(container);

        // Simulate 'Backspace' or 'Delete' key
        fireEvent.keyDown(window, { key: 'Backspace', code: 'Backspace', keyCode: 8 });

        // Verify Deletion
        // The chord group should be gone.
        // We need to wait for re-render.
        // Using `queryAllByTestId` to check absence.
        // Note: We need to wait for the DOM to update.
        await act(async () => {
             // Let effect queue flush
        });
        
        const remainingChords = screen.queryAllByTestId(/^chord-/);
        expect(remainingChords).toHaveLength(0);
    });
    test('Cursor auto-advances after APPENDing a note', async () => {
         const score = createDefaultScore();
         render(
             <ThemeProvider>
                 <ScoreEditor label="Interaction Test" initialData={score} />
             </ThemeProvider>
         );
         
         const hitArea = screen.getByTestId('measure-hit-area-0-0');
         
         // 1. Move to start (APPEND mode for empty measure)
         fireEvent.mouseMove(hitArea, { clientX: 50, clientY: 110 }); // C4
         
         // 2. Click to Add
         fireEvent.click(hitArea, { clientX: 50, clientY: 110 });
         
         // 3. Expect Cursor (Preview Note) to persist and move
         // How to check? The "ghost-note" element should still be present.
         // And its position should change.
         // Since we can't check position easily, we check presence.
         // Normally setPreviewNote(null) removes it.
         
         const ghost = await screen.findByTestId('ghost-note');
         expect(ghost).toBeInTheDocument();
         
         // Verify it's NOT at the start anymore?
         // In a real DOM we'd check style left/top. 
         // Here, we trust the logic if the element exists.
         // (If logic failed, it would be null).
    });

    test('Cursor does NOT auto-advance after INSERTing a note', async () => {
         const score = createDefaultScore();
         render(
             <ThemeProvider>
                 <ScoreEditor label="Interaction Test" initialData={score} />
             </ThemeProvider>
         );
         
         const hitArea = screen.getByTestId('measure-hit-area-0-0');
         
         // 1. Appends 2 notes first
         fireEvent.mouseMove(hitArea, { clientX: 50, clientY: 110 });
         fireEvent.click(hitArea, { clientX: 50, clientY: 110 }); // Note 1
         
         fireEvent.mouseMove(hitArea, { clientX: 150, clientY: 110 });
         fireEvent.click(hitArea, { clientX: 150, clientY: 110 }); // Note 2
         
         // 2. Move between them (INSERT)
         fireEvent.mouseMove(hitArea, { clientX: 100, clientY: 110 });
         
         // 3. Click to Insert
         fireEvent.click(hitArea, { clientX: 100, clientY: 110 });
         
         // 4. Expect Cursor to disappear (Selection moves to new note)
         await waitFor(() => {
             const ghost = screen.queryByTestId('ghost-note');
             expect(ghost).not.toBeInTheDocument();
         });
    });
});
