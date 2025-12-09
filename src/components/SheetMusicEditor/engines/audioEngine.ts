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
export const scheduleScorePlayback = (ctx: AudioContext, score: any, bpm: number, startMeasureIndex = 0, startEventIndex = 0, onComplete?: () => void, onPositionUpdate?: (m: number, e: number, d: number) => void) => {
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.5;

    const now = ctx.currentTime;
    
    // 1. Generate Timeline
    const timeline = createTimeline(score, bpm);
    
    // 2. Find start offset time
    // We look for the first event that matches (or exceeds) the start params
    let startTimeOffset = 0;
    
    // Filter out events before start point
    // Logic: Find the time of the event at startMeasureIndex/startEventIndex
    const startEvent = timeline.find(e => e.measureIndex >= startMeasureIndex && (e.measureIndex > startMeasureIndex || e.eventIndex >= startEventIndex));
    
    if (startEvent) {
        startTimeOffset = startEvent.time;
    } else if (startMeasureIndex > 0) {
        // If we are starting beyond existing events (empty score?), try to estimate?
        // Or just play nothing.
        if (timeline.length > 0) startTimeOffset = timeline[timeline.length - 1].time + 10; // Logic gap: if empty space
    }

    const filteredTimeline = timeline.filter(e => e.time >= startTimeOffset);
    let maxTime = 0;
    
    // 3. Schedule Events
    filteredTimeline.forEach(event => {
        const relativeTime = event.time - startTimeOffset;
        const noteStartTime = now + relativeTime;
        
        // Schedule Audio
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = event.frequency;
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.start(noteStartTime);
        
        // Envelope (Piano-like Decay)
        gainNode.gain.setValueAtTime(0, noteStartTime);
        gainNode.gain.linearRampToValueAtTime(0.3, noteStartTime + 0.05);
        // Linear fade to lower sustain throughout the note (natural decay)
        gainNode.gain.linearRampToValueAtTime(0.1, noteStartTime + event.duration - 0.05);
        // Quick release at end
        gainNode.gain.linearRampToValueAtTime(0.001, noteStartTime + event.duration);
        
        oscillator.stop(noteStartTime + event.duration + 0.1);
        
        if (noteStartTime + event.duration > maxTime) maxTime = noteStartTime + event.duration;
    });

    // 4. Schedule UI Updates (Cursor) using RequestAnimationFrame for Sync
    
    // Filter sorting (same as before)
    const uniqueTimePoints = new Map<number, TimelineEvent>();
    if (filteredTimeline.length > 0) {
        filteredTimeline.forEach(e => {
             if (e.staffIndex === 0 && !uniqueTimePoints.has(e.time)) {
                 uniqueTimePoints.set(e.time, e);
             }
        });
    }
    const sortedPoints = Array.from(uniqueTimePoints.values()).sort((a, b) => a.time - b.time);
    
    let animationFrameId: number;
    let lastEventIndex = -1;
    
    // Start Animation Loop
    const loop = () => {
        const currentTime = ctx.currentTime;
        const elapsed = currentTime - now; // 'now' is start time of playback
        
        if (elapsed > totalDurationSeconds + 0.5) return; // Stop loop if done
        
        // Find the current active event
        // We want the event where event.time <= startOffset + elapsed
        const currentPlaybackTime = startTimeOffset + elapsed;
        
        // Find the latest event that has started
        let currentEventIndex = -1;
        for (let i = 0; i < sortedPoints.length; i++) {
            if (sortedPoints[i].time <= currentPlaybackTime) {
                currentEventIndex = i;
            } else {
                break; // Future event
            }
        }
        
        if (currentEventIndex !== -1 && currentEventIndex !== lastEventIndex) {
            const curr = sortedPoints[currentEventIndex];
            const next = currentEventIndex < sortedPoints.length - 1 ? sortedPoints[currentEventIndex+1] : null;
            
            // Calculate duration to slide to next event
            // Logic: Snap to Start (handled by CSS reset in component), then Slide to Next over duration.
            const transitionDuration = curr.duration;
            
            if (onPositionUpdate) {
                onPositionUpdate(curr.measureIndex, curr.eventIndex, transitionDuration);
            }
            lastEventIndex = currentEventIndex;
        }
        
        animationFrameId = requestAnimationFrame(loop);
    };
    
    const totalDurationSeconds = maxTime - now;

    if (onPositionUpdate && sortedPoints.length > 0) {
        loop();
    }
    
    // 5. Cleanup
    const timeoutId = setTimeout(() => {
        if (onPositionUpdate) onPositionUpdate(null, null, 0);
        if (onComplete) onComplete();
        cancelAnimationFrame(animationFrameId);
    }, totalDurationSeconds * 1000 + 200);

    return () => {
        clearTimeout(timeoutId);
        cancelAnimationFrame(animationFrameId);
        if (onPositionUpdate) onPositionUpdate(null, null, 0);
        masterGain.disconnect();
    };
};

