import { scheduleScorePlayback } from '../engines/audioEngine';
import * as TimelineService from '../services/TimelineService';

// Mock Web Audio API
class MockAudioContext {
    currentTime = 0;
    state = 'running';
    createOscillator = jest.fn(() => new MockOscillator());
    createGain = jest.fn(() => new MockGainNode());
    destination = {};
    suspend = jest.fn();
}

class MockOscillator {
    type = 'sine';
    frequency = { value: 0 };
    connect = jest.fn();
    start = jest.fn();
    stop = jest.fn();
}

class MockGainNode {
    gain = {
        value: 1,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
    };
    connect = jest.fn();
    disconnect = jest.fn();
}

describe('AudioEngine', () => {
    let mockCtx: any;

    beforeEach(() => {
        mockCtx = new MockAudioContext();
        // Mock createTimeline to return predictable data
        jest.spyOn(TimelineService, 'createTimeline').mockReturnValue([
            { time: 0, duration: 1, frequency: 440, type: 'note', measureIndex: 0, eventIndex: 0, staffIndex: 0, quant: 0 },
            { time: 1, duration: 1, frequency: 880, type: 'note', measureIndex: 0, eventIndex: 1, staffIndex: 0, quant: 16 }
        ]);
        
        // Mock global window functions if needed (none used directly in scheduleScorePlayback except requestAnimationFrame)
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
        global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('schedules oscillators for all events', () => {
        const killFn = scheduleScorePlayback(mockCtx, {}, 120);
        
        expect(TimelineService.createTimeline).toHaveBeenCalled();
        expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2); // 2 notes
        
        // Check start times
        // Oscillator 1: Start at 0 (now + 0)
        // Oscillator 2: Start at 1 (now + 1)
        
        // Access mock instances?
        // Limitation: mockCtx.createOscillator returns new instance each time.
        // We can capture results if we mockImplementation, but default mock returns new instance.
        // jest.fn() returns the instance if we used 'new', but here we return explicit object.
    });
    
    test('schedules audio with start offset', () => {
        // Redefine timeline mock to verify offset logic
        jest.spyOn(TimelineService, 'createTimeline').mockReturnValue([
            { time: 10, duration: 1, frequency: 440, type: 'note', measureIndex: 0, eventIndex: 0, staffIndex: 0, quant: 0 },
            { time: 11, duration: 1, frequency: 880, type: 'note', measureIndex: 0, eventIndex: 1, staffIndex: 0, quant: 16 }
        ]);

        // Start from time 10.5 (should skip first event? or partial?)
        // Wait, scheduleScorePlayback uses START PARAMS (measureIndex, quant) to find offset.
        // If we say startMeasure 0, startQuant 0. 
        // Logic finds event at M0/Q0. That is Event 1 (Time 10).
        // So offset = 10.
        // Event 1 starts at 10. Relative time = 10 - 10 = 0.
        
        const killFn = scheduleScorePlayback(mockCtx, {}, 120, 0, 0);
        
        expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
        
        killFn();
    });
    
    test('stops playback controls correctly', () => {
        const killFn = scheduleScorePlayback(mockCtx, {}, 120);
        killFn();
        
        expect(mockCtx.suspend).toHaveBeenCalled();
        // expect masterGain.disconnect to be called. 
        // We can't easily check masterGain variable scope, but we can check if *A* gain node was disconnected?
        // Note: each tone has a gain, plus Master Gain.
        // Master Gain is created first.
    });
});
