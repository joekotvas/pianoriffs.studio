// @ts-nocheck
import { NOTE_TYPES } from '../constants';
import { getNoteDuration } from '../utils/core';
import { getFrequency } from '../services/MusicService';
import { createTimeline, TimelineEvent } from '../services/TimelineService';

// --- AUDIO CONTEXT MANAGEMENT ---

export const initAudio = (audioCtxRef?: any) => {
    if (typeof window === 'undefined') return null;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if (audioCtxRef) {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    } else {
        return new AudioContext(); // Temporary context
    }
};

// --- LOW LEVEL PLAYBACK (Legacy compat or simple tone) ---

export const scheduleNote = (ctx, destination, pitch, durationType, dotted, startTime, bpm = 120, accidental = null) => {
    // Note: This is legacy but still used by playTone.
    // It duplicates getNoteDuration calc, but for simple tone it's fine.
    const freq = getFrequency(pitch);
    if (!freq) return 0;

    const secondsPerBeat = 60 / bpm;
    const quants = getNoteDuration(durationType, dotted, undefined);
    const durationSeconds = (quants / 16) * secondsPerBeat;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = freq;

    oscillator.connect(gainNode);
    gainNode.connect(destination);

    oscillator.start(startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationSeconds);

    oscillator.stop(startTime + durationSeconds + 0.1);
    
    return durationSeconds;
};

export const playTone = (pitch: string, durationType = 'quarter', dotted = false, accidental: any = null, keySignature: string = 'C') => {
    if (typeof window === 'undefined') return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        scheduleNote(ctx, ctx.destination, pitch, durationType, dotted, ctx.currentTime, 120, null);
    } catch (e) {
        console.error("Failed to play tone:", e);
    }
};

// --- SCORE PLAYBACK ENGINE (Refactored Phase 5) ---

/**
 * Schedules the entire score for playback using TimelineService.
 */
const scheduleTone = (ctx: AudioContext, destination: AudioNode, frequency: number, startTime: number, duration: number) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    
    oscillator.connect(gainNode);
    gainNode.connect(destination);
    
    oscillator.start(startTime);
    
    // Envelope (Piano-like Decay)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + duration - 0.05); // Decay
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration); // Release
    
    oscillator.stop(startTime + duration + 0.1);
    
    return startTime + duration;
};

/**
 * Schedules the entire score for playback using TimelineService.
 */
export const scheduleScorePlayback = (ctx: AudioContext, score: any, bpm: number, startMeasureIndex = 0, startQuant = 0, onComplete?: () => void, onPositionUpdate?: (m: number, q: number, d: number) => void) => {
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.5;

    const now = ctx.currentTime;
    
    // 1. Generate Timeline
    const timeline = createTimeline(score, bpm);
    
    // 2. Find start offset time
    let startTimeOffset = 0;
    
    // Filter out events before start point
    const startEvent = timeline.find(e => e.measureIndex >= startMeasureIndex && (e.measureIndex > startMeasureIndex || e.quant >= startQuant));
    
    if (startEvent) {
        startTimeOffset = startEvent.time;
    } else if (startMeasureIndex > 0 && timeline.length > 0) {
        startTimeOffset = timeline[timeline.length - 1].time + 10; 
    }

    const filteredTimeline = timeline.filter(e => e.time >= startTimeOffset);
    let maxTime = now;

    // 3. Schedule Tones
    filteredTimeline.forEach(event => {
        const noteStartTime = now + (event.time - startTimeOffset);
        const endTime = scheduleTone(ctx, masterGain, event.frequency, noteStartTime, event.duration);
        if (endTime > maxTime) maxTime = endTime;
    });

    // 4. Schedule UI Updates (Cursor) using RequestAnimationFrame for Sync
    
    // Group events by time to avoid firing multiple updates for chords
    const uniqueTimePoints = new Map<number, TimelineEvent>();
    if (filteredTimeline.length > 0) {
        filteredTimeline.forEach(e => {
             if (!uniqueTimePoints.has(e.time)) {
                 uniqueTimePoints.set(e.time, e);
             }
        });
    }
    const sortedPoints = Array.from(uniqueTimePoints.values()).sort((a, b) => a.time - b.time);
    
    let animationFrameId: number;
    let lastEventIndex = -1;
    let isCancelled = false;
    
    // Start Animation Loop
    const loop = () => {
        if (isCancelled) return;
        const currentTime = ctx.currentTime;
        const elapsed = currentTime - now; 
        
        // Find the current active event
        const currentPlaybackTime = startTimeOffset + elapsed;
        
        let currentEventIndex = -1;
        // Optimize: search could be binary, but linear is fine for <1000 items usually
        for (let i = 0; i < sortedPoints.length; i++) {
            if (sortedPoints[i].time <= currentPlaybackTime) {
                currentEventIndex = i;
            } else {
                break;
            }
        }
        
        if (currentEventIndex !== -1 && currentEventIndex !== lastEventIndex) {
            const curr = sortedPoints[currentEventIndex];
            const next = currentEventIndex < sortedPoints.length - 1 ? sortedPoints[currentEventIndex+1] : null;
            
            // Calculate duration to slide to next event
            const transitionDuration = next ? (next.time - curr.time) : curr.duration;
            
            if (onPositionUpdate) {
                // Ensure we pass duration, but minimum useful for animation
                onPositionUpdate(curr.measureIndex, curr.quant, Math.max(transitionDuration, 0.05));
            }
            lastEventIndex = currentEventIndex;
        }
        if (currentTime < maxTime + 0.5) {
            animationFrameId = requestAnimationFrame(loop);
        } else {
            if (onComplete) onComplete();
        }
    };
    
    animationFrameId = requestAnimationFrame(loop);
    
    // Return Cleanup Function
    return () => {
        isCancelled = true;
        cancelAnimationFrame(animationFrameId);
        masterGain.disconnect();
        ctx.suspend(); 
    };
};

