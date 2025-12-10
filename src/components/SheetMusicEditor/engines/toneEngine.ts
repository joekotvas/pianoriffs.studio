/**
 * Tone.js Audio Engine
 * 
 * Replaces audioEngine.ts with Tone.js for superior timing, sound quality,
 * and simpler code. Features progressive loading: synth plays immediately,
 * piano samples load in background and take over when ready.
 */

import * as Tone from 'tone';
import { TimelineEvent } from '../services/TimelineService';

// --- TYPES ---

export type InstrumentState = 'initializing' | 'synth' | 'loading-samples' | 'sampler';

interface ToneEngineState {
    instrumentState: InstrumentState;
    isPlaying: boolean;
    samplerLoadProgress: number; // 0-100
}

// --- STATE ---

let synth: Tone.PolySynth | null = null;
let sampler: Tone.Sampler | null = null;
let currentPart: Tone.Part | null = null;
let state: ToneEngineState = {
    instrumentState: 'initializing',
    isPlaying: false,
    samplerLoadProgress: 0
};

// Callbacks for state changes
let onStateChange: ((state: ToneEngineState) => void) | null = null;

// --- HELPERS ---

/**
 * Converts frequency to note name (e.g., 440 -> "A4").
 * Used when TimelineEvent has frequency but we need pitch for Tone.js.
 */
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
 * 
 * @param onState - Optional callback for state changes (loading progress, etc.)
 */
export const initTone = async (onState?: (state: ToneEngineState) => void): Promise<void> => {
    if (onState) onStateChange = onState;
    
    // Start audio context (requires user gesture)
    await Tone.start();
    
    // Initialize synth immediately (no loading) - clean piano-like tone
    if (!synth) {
        synth = new Tone.PolySynth(Tone.Synth, {
            envelope: {
                attack: 0.005,
                decay: 0.5,
                sustain: 0.1,
                release: 1.2
            },
            oscillator: {
                type: 'sine' // Clean, simple sine wave
            }
        }).toDestination();
        
        // Reduce volume to prevent clipping
        synth.volume.value = -6;
        
        // Limit polyphony to prevent audio glitches
        synth.maxPolyphony = 24;
        
        updateState({ instrumentState: 'synth' });
    }
    
    // Begin loading piano samples in background
    loadPianoSampler();
};

/**
 * Loads piano samples in background. When complete, playback will use sampler.
 */
const loadPianoSampler = () => {
    if (sampler) {
        console.log('🎹 Sampler already exists, skipping load');
        return; // Already loaded or loading
    }
    
    console.log('🎹 Starting piano sample load...');
    updateState({ instrumentState: 'loading-samples', samplerLoadProgress: 0 });
    
    // Using self-hosted Salamander Grand Piano samples
    // Downloaded from tonejs.github.io/audio/salamander/
    const baseUrl = '/audio/piano/';
    
    sampler = new Tone.Sampler({
        urls: {
            A0: 'A0.mp3',
            C1: 'C1.mp3',
            'D#1': 'Ds1.mp3',
            'F#1': 'Fs1.mp3',
            A1: 'A1.mp3',
            C2: 'C2.mp3',
            'D#2': 'Ds2.mp3',
            'F#2': 'Fs2.mp3',
            A2: 'A2.mp3',
            C3: 'C3.mp3',
            'D#3': 'Ds3.mp3',
            'F#3': 'Fs3.mp3',
            A3: 'A3.mp3',
            C4: 'C4.mp3',
            'D#4': 'Ds4.mp3',
            'F#4': 'Fs4.mp3',
            A4: 'A4.mp3',
            C5: 'C5.mp3',
            'D#5': 'Ds5.mp3',
            'F#5': 'Fs5.mp3',
            A5: 'A5.mp3',
            C6: 'C6.mp3',
            'D#6': 'Ds6.mp3',
            'F#6': 'Fs6.mp3',
            A6: 'A6.mp3',
            C7: 'C7.mp3',
            'D#7': 'Ds7.mp3',
            'F#7': 'Fs7.mp3',
            A7: 'A7.mp3',
            C8: 'C8.mp3'
        },
        baseUrl,
        onload: () => {
            updateState({ instrumentState: 'sampler', samplerLoadProgress: 100 });
            console.log('🎹 Piano samples loaded');
        },
        onerror: (error) => {
            console.warn('Failed to load piano samples, continuing with synth:', error);
            // Stay on synth, don't break playback
            updateState({ instrumentState: 'synth', samplerLoadProgress: 0 });
        }
    }).toDestination();
};

// --- PLAYBACK ---

/**
 * Gets the currently active instrument (sampler if loaded, else synth).
 */
const getActiveInstrument = (): Tone.PolySynth | Tone.Sampler | null => {
    // Check if sampler is fully loaded (not just created)
    if (sampler && (sampler as any).loaded) {
        console.log('🎹 Using sampler (loaded:', (sampler as any).loaded, ')');
        return sampler;
    }
    console.log('🎵 Using synth (sampler loaded:', sampler ? (sampler as any).loaded : 'n/a', ')');
    return synth;
};

/**
 * Schedules the score for playback using Tone.js Transport and Part.
 * 
 * @param timeline - Array of TimelineEvents from TimelineService
 * @param bpm - Beats per minute
 * @param startTimeOffset - Time offset to start from (for resume)
 * @param onPositionUpdate - Callback for cursor sync (measureIndex, quant, duration)
 * @param onComplete - Callback when playback finishes
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
    
    // Stop any existing playback
    stopTonePlayback();
    
    // Set tempo
    Tone.Transport.bpm.value = bpm;
    
    // Filter timeline for start offset
    const filteredTimeline = timeline.filter(e => e.time >= startTimeOffset);
    if (filteredTimeline.length === 0) {
        onComplete?.();
        return;
    }
    
    // Adjust times relative to start offset
    const adjustedTimeline = filteredTimeline.map(e => ({
        ...e,
        time: e.time - startTimeOffset
    }));
    
    // Convert to Tone.Part format
    const events = adjustedTimeline.map(e => ({
        time: e.time,
        note: e.pitch || freqToNote(e.frequency), // Use pitch if available, else convert
        duration: e.duration,
        measureIndex: e.measureIndex,
        quant: e.quant
    }));
    
    // Create Part for scheduling
    currentPart = new Tone.Part((time, event) => {
        // Play the note
        instrument.triggerAttackRelease(event.note, event.duration, time);
        
        // Schedule UI update using Tone.Draw for sample-accurate sync
        Tone.Draw.schedule(() => {
            onPositionUpdate?.(event.measureIndex, event.quant, event.duration);
        }, time);
    }, events);
    
    currentPart.start(0);
    
    // Schedule completion callback
    const lastEvent = events[events.length - 1];
    const endTime = lastEvent.time + lastEvent.duration + 0.1; // Small buffer
    
    Tone.Transport.scheduleOnce(() => {
        updateState({ isPlaying: false });
        onComplete?.();
    }, endTime);
    
    // Start transport
    Tone.Transport.start();
    updateState({ isPlaying: true });
};

/**
 * Stops playback and cleans up resources.
 */
export const stopTonePlayback = (): void => {
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear all scheduled events
    
    if (currentPart) {
        currentPart.dispose();
        currentPart = null;
    }
    
    updateState({ isPlaying: false });
};

/**
 * Sets the tempo (BPM) - can be called during playback for live adjustment.
 */
export const setTempo = (bpm: number): void => {
    Tone.Transport.bpm.value = bpm;
};

/**
 * Plays a single note (for preview/click feedback).
 * Will initialize Tone.js if not already initialized.
 */
export const playNote = async (pitch: string, duration: string = '8n'): Promise<void> => {
    // Ensure Tone.js is started (safe to call multiple times)
    if (state.instrumentState === 'initializing') {
        await initTone();
    }
    
    const instrument = getActiveInstrument();
    console.log('🎵 playNote:', pitch, 'using:', state.instrumentState, 'instrument:', instrument ? 'yes' : 'no');
    if (instrument) {
        instrument.triggerAttackRelease(pitch, duration);
    }
};

// --- STATE GETTERS ---

export const getInstrumentState = (): InstrumentState => state.instrumentState;
export const isPlaying = (): boolean => state.isPlaying;
export const getState = (): ToneEngineState => ({ ...state });
