/**
 * Jest mock for VexFlow
 * 
 * Provides mock implementations to avoid DOM-dependent errors in tests.
 */

const mockRenderer = {
    resize: jest.fn(),
    getContext: jest.fn(() => ({
        scale: jest.fn(),
        setFont: jest.fn(),
    })),
};

const mockStave = {
    addClef: jest.fn(() => mockStave),
    addTimeSignature: jest.fn(() => mockStave),
    addKeySignature: jest.fn(() => mockStave),
    setContext: jest.fn(() => mockStave),
    draw: jest.fn(() => mockStave),
};

const mockStaveNote = {
    addModifier: jest.fn(() => mockStaveNote),
    addDotToAll: jest.fn(() => mockStaveNote),
    getAbsoluteX: jest.fn(() => 100),
    getYs: jest.fn(() => [50]),
    getWidth: jest.fn(() => 30),
    getKeys: jest.fn(() => ['c/4']),
};

const mockVoice = {
    addTickables: jest.fn(() => mockVoice),
    draw: jest.fn(() => mockVoice),
    setStrict: jest.fn(() => mockVoice),
};

const mockFormatter = {
    joinVoices: jest.fn(() => mockFormatter),
    format: jest.fn(() => mockFormatter),
};

const mockBeam = {
    setContext: jest.fn(() => mockBeam),
    draw: jest.fn(() => mockBeam),
};

const mockTuplet = {
    setContext: jest.fn(() => mockTuplet),
    draw: jest.fn(() => mockTuplet),
};

const mockAccidental = {};

module.exports = {
    Renderer: jest.fn(() => mockRenderer),
    Stave: jest.fn(() => mockStave),
    StaveNote: jest.fn(() => mockStaveNote),
    Voice: jest.fn(() => mockVoice),
    Formatter: jest.fn(() => mockFormatter),
    Beam: jest.fn(() => mockBeam),
    Tuplet: jest.fn(() => mockTuplet),
    Accidental: jest.fn(() => mockAccidental),
    Flow: {
        Renderer: jest.fn(() => mockRenderer),
        Stave: jest.fn(() => mockStave),
        StaveNote: jest.fn(() => mockStaveNote),
        Voice: jest.fn(() => mockVoice),
        Formatter: jest.fn(() => mockFormatter),
        Beam: jest.fn(() => mockBeam),
        Tuplet: jest.fn(() => mockTuplet),
        Accidental: jest.fn(() => mockAccidental),
    }
};
