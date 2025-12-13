import { handlePlayback } from '@/hooks/handlers/handlePlayback';

describe('handlePlayback', () => {
    let mockPlayback: any;
    let mockScore: any;
    let mockEvent: any;

    beforeEach(() => {
        mockPlayback = {
            playScore: jest.fn(),
            stopPlayback: jest.fn(),
            isPlaying: false,
            lastPlayStart: { measureIndex: 0, eventIndex: 0 }
        };
        mockScore = {
            staves: [
                {
                    measures: [
                        { events: [{ id: 'e1' }, { id: 'e2' }] }
                    ]
                }
            ]
        };
        mockEvent = { preventDefault: jest.fn() };
    });

    test('should play from selection when P is pressed', () => {
        const selection = { measureIndex: 0, eventId: 'e2' };
        mockEvent.key = 'p';
        
        const result = handlePlayback(mockEvent, mockPlayback, selection, mockScore);
        
        expect(result).toBe(true);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockPlayback.playScore).toHaveBeenCalledWith(0, 1);
    });

    test('should play from start when P is pressed with no selection', () => {
        const selection = { measureIndex: null, eventId: null };
        mockEvent.key = 'p';
        
        const result = handlePlayback(mockEvent, mockPlayback, selection, mockScore);
        
        expect(result).toBe(true);
        expect(mockPlayback.playScore).toHaveBeenCalledWith(0, 0);
    });

    test('should toggle playback with Space', () => {
        const selection = { measureIndex: null, eventId: null };
        mockEvent.code = 'Space';
        mockEvent.key = ' ';
        
        // Start playback
        handlePlayback(mockEvent, mockPlayback, selection, mockScore);
        expect(mockPlayback.playScore).toHaveBeenCalled();

        // Stop playback
        mockPlayback.isPlaying = true;
        handlePlayback(mockEvent, mockPlayback, selection, mockScore);
        expect(mockPlayback.stopPlayback).toHaveBeenCalled();
    });

    test('should ignore other keys', () => {
        mockEvent.key = 'a';
        const result = handlePlayback(mockEvent, mockPlayback, {}, mockScore);
        expect(result).toBe(false);
    });
});
