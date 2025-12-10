/**
 * Jest mock for Tone.js
 * 
 * Provides mock implementations of the Tone.js modules used in the app.
 */

const mockSynth = {
    triggerAttackRelease: jest.fn(),
    toDestination: jest.fn().mockReturnThis(),
    dispose: jest.fn(),
    maxPolyphony: 16,
};

const mockSampler = {
    triggerAttackRelease: jest.fn(),
    toDestination: jest.fn().mockReturnThis(),
    dispose: jest.fn(),
};

const mockPart = {
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    dispose: jest.fn(),
};

const mockTransport = {
    bpm: { value: 120 },
    start: jest.fn(),
    stop: jest.fn(),
    cancel: jest.fn(),
    scheduleOnce: jest.fn(),
    position: '0:0:0',
};

const mockDraw = {
    schedule: jest.fn((callback, time) => callback()),
};

const mockFrequency = jest.fn((freq) => ({
    toNote: () => 'C4',
}));

module.exports = {
    start: jest.fn().mockResolvedValue(undefined),
    PolySynth: jest.fn(() => mockSynth),
    Synth: jest.fn(),
    Sampler: jest.fn(() => mockSampler),
    Part: jest.fn(() => mockPart),
    Transport: mockTransport,
    Draw: mockDraw,
    Frequency: mockFrequency,
};
