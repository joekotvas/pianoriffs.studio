/**
 * Tone.js Audio Engine
 * 
 * Provides multiple instrument options with progressive loading.
 * Users can choose between synth types and piano samples.
 */

import * as Tone from 'tone';
import { TimelineEvent } from '@/services/TimelineService';

// --- TYPES ---

export type InstrumentType = 'bright' | 'mellow' | 'organ' | 'piano';

export type InstrumentState = 'initializing' | 'ready' | 'loading-samples';

interface ToneEngineState {
    instrumentState: InstrumentState;
    selectedInstrument: InstrumentType;
    samplerLoaded: boolean;
    isPlaying: boolean;
}

// --- SYNTH PRESETS ---

const SYNTH_PRESETS = {
    bright: {
        name: 'Bright Synth',
        create: () => new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 10,
            oscillator: { type: 'sine' as const },
            envelope: {
                attack: 0.01,
                decay: 0.4,
                sustain: 0.2,
                release: 1.5
            },
            modulation: { type: 'triangle' as const },
            modulationEnvelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0.1,
                release: 0.5
            }
        }),
        volume: -10
    },
    mellow: {
        name: 'Mellow Synth',
        create: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' as const },
            envelope: {
                attack: 0.05,    // Slower attack for warmth
                decay: 0.6,
                sustain: 0.3,
                release: 2.0     // Long, smooth release
            }
        }),
        volume: -8
    },
    organ: {
        name: 'Organ Synth',
        create: () => new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' as const },  // Original audioEngine sound
            envelope: {
                attack: 0.02,
                decay: 0.3,
                sustain: 0.4,
                release: 0.8
            }
        }),
        volume: -6
    }
};

// --- STATE ---

const synths: Record<string, Tone.PolySynth> = {};
let sampler: Tone.Sampler | null = null;
let currentPart: Tone.Part | null = null;
let state: ToneEngineState = {
    instrumentState: 'initializing',
    selectedInstrument: 'bright',
    samplerLoaded: false,
    isPlaying: false
};

// Callbacks for state changes
let onStateChange: ((state: ToneEngineState) => void) | null = null;

// --- HELPERS ---

const freqToNote = (frequency: number): string => {
    return Tone.Frequency(frequency).toNote();
};

const updateState = (partial: Partial<ToneEngineState>) => {
    state = { ...state, ...partial };
    onStateChange?.(state);
};

// --- INITIALIZATION ---

/**
 * Initializes Tone.js audio context and instruments.
 * Must be called from a user gesture (click/tap) due to browser autoplay policy.
 */
export const initTone = async (onState?: (state: ToneEngineState) => void): Promise<void> => {
    if (onState) onStateChange = onState;
    
    // Start audio context (requires user gesture)
    await Tone.start();
    
    // Initialize all synth presets
    for (const [key, preset] of Object.entries(SYNTH_PRESETS)) {
        if (!synths[key]) {
            const synth = preset.create().toDestination();
            synth.volume.value = preset.volume;
            synth.maxPolyphony = 24;
            synths[key] = synth;
        }
    }
    
    updateState({ instrumentState: 'ready' });
    
    // Begin loading piano samples in background
    loadPianoSampler();
};

/**
 * Loads piano samples in background.
 */
const loadPianoSampler = () => {
    if (sampler) return;
    
    console.log('🎹 Starting piano sample load...');
    updateState({ instrumentState: 'loading-samples' });
    
    const baseUrl = '/audio/piano/';
    
    sampler = new Tone.Sampler({
        urls: {
            A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
            A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
            A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
            A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
            A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
            A5: 'A5.mp3', C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
            A6: 'A6.mp3', C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3',
            A7: 'A7.mp3', C8: 'C8.mp3'
        },
        baseUrl,
        onload: () => {
            console.log('🎹 Piano samples loaded');
            updateState({ samplerLoaded: true, instrumentState: 'ready' });
        },
        onerror: (error) => {
            console.warn('Failed to load piano samples:', error);
            updateState({ instrumentState: 'ready' });
        }
    }).toDestination();
};

// --- INSTRUMENT SELECTION ---

/**
 * Changes the active instrument.
 */
export const setInstrument = (type: InstrumentType): void => {
    updateState({ selectedInstrument: type });
};

/**
 * Gets the currently active instrument for playback.
 */
const getActiveInstrument = (): Tone.PolySynth | Tone.Sampler | null => {
    const selected = state.selectedInstrument;
    
    // Piano samples - use if loaded, else fallback to bright synth
    if (selected === 'piano') {
        if (sampler && state.samplerLoaded) {
            return sampler;
        }
        // Fallback while loading
        return synths['bright'] || null;
    }
    
    // Synth presets
    return synths[selected] || synths['bright'] || null;
};

/**
 * Gets available instruments for UI dropdown.
 */
export const getInstrumentOptions = (): { id: InstrumentType; name: string; loading?: boolean }[] => {
    return [
        { id: 'bright', name: 'Bright Synth' },
        { id: 'mellow', name: 'Mellow Synth' },
        { id: 'organ', name: 'Organ Synth' },
        { 
            id: 'piano', 
            name: state.samplerLoaded ? 'Piano Samples' : 'Piano (Loading...)',
            loading: !state.samplerLoaded
        }
    ];
};

// --- PLAYBACK ---

/**
 * Schedules the score for playback using Tone.js Transport and Part.
 */
export const scheduleTonePlayback = (
    timeline: TimelineEvent[],
    bpm: number,
    startTimeOffset: number = 0,
    onPositionUpdate?: (measureIndex: number, quant: number, duration: number) => void,
    onComplete?: () => void
): void => {
    const instrument = getActiveInstrument();
    if (!instrument) {
        console.error('Tone engine not initialized');
        return;
    }
    
    stopTonePlayback();
    Tone.Transport.bpm.value = bpm;
    
    const filteredTimeline = timeline.filter(e => e.time >= startTimeOffset);
    if (filteredTimeline.length === 0) {
        onComplete?.();
        return;
    }
    
    const adjustedTimeline = filteredTimeline.map(e => ({
        ...e,
        time: e.time - startTimeOffset
    }));
    
    const events = adjustedTimeline.map(e => ({
        time: e.time,
        note: e.pitch || freqToNote(e.frequency),
        duration: e.duration,
        measureIndex: e.measureIndex,
        quant: e.quant
    }));
    
    currentPart = new Tone.Part((time, event) => {
        instrument.triggerAttackRelease(event.note, event.duration, time);
        Tone.Draw.schedule(() => {
            onPositionUpdate?.(event.measureIndex, event.quant, event.duration);
        }, time);
    }, events);
    
    currentPart.start(0);
    
    const lastEvent = events[events.length - 1];
    const endTime = lastEvent.time + lastEvent.duration + 0.1;
    
    Tone.Transport.scheduleOnce(() => {
        updateState({ isPlaying: false });
        onComplete?.();
    }, endTime);
    
    Tone.Transport.start();
    updateState({ isPlaying: true });
};

/**
 * Stops playback and cleans up resources.
 */
export const stopTonePlayback = (): void => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    if (currentPart) {
        currentPart.dispose();
        currentPart = null;
    }
    
    updateState({ isPlaying: false });
};

/**
 * Sets the tempo (BPM) - can be called during playback.
 */
export const setTempo = (bpm: number): void => {
    Tone.Transport.bpm.value = bpm;
};

/**
 * Plays a single note (for preview/click feedback).
 */
export const playNote = async (pitch: string, duration: string = '8n'): Promise<void> => {
    if (state.instrumentState === 'initializing') {
        await initTone();
    }
    
    const instrument = getActiveInstrument();
    if (instrument) {
        instrument.triggerAttackRelease(pitch, duration);
    }
};

// --- STATE GETTERS ---

export const getInstrumentState = (): InstrumentState => state.instrumentState;
export const getSelectedInstrument = (): InstrumentType => state.selectedInstrument;
export const isSamplerLoaded = (): boolean => state.samplerLoaded;
export const isPlaying = (): boolean => state.isPlaying;
export const getState = (): ToneEngineState => ({ ...state });
