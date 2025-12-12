# Implementation Plan - Tone.js Audio Engine

Replace the custom Web Audio implementation with Tone.js for high-quality audio playback.

**Prerequisites:** Complete TonalJS integration first (MusicService provides pitch/frequency functions).

---

## Phase 1: Installation & Setup

### Install Tone.js
```bash
npm install tone
```

### [NEW] services/AudioService.ts

Create a centralized audio service wrapping Tone.js:

```typescript
import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let sampler: Tone.Sampler | null = null;

/** Initialize audio (call on user interaction) */
export const initAudio = async (): Promise<void> => {
  await Tone.start();
  synth = new Tone.PolySynth(Tone.Synth).toDestination();
};

/** Play a single note immediately */
export const playNote = (pitch: string, duration: number): void => {
  synth?.triggerAttackRelease(pitch, duration);
};

/** Get the Tone.js Transport */
export const getTransport = () => Tone.getTransport();
```

---

## Phase 2: Score-to-Tone Adapter

### [NEW] engines/playbackAdapter.ts

Convert your Score structure to Tone.js Part events:

```typescript
import * as Tone from 'tone';
import { Score, ScoreEvent } from '../types';
import { getNoteDuration } from '../utils/core';

interface ToneEvent {
  time: number;      // Seconds from start
  pitch: string;     // "C4", "F#4"
  duration: number;  // Seconds
}

/**
 * Converts Score to flat array of Tone.js events
 * Handles tuplets by calculating actual duration in seconds
 */
export const scoreToToneEvents = (score: Score, bpm: number): ToneEvent[] => {
  const events: ToneEvent[] = [];
  const secondsPerQuant = (60 / bpm) / 16; // 16 quants per quarter note
  
  score.staves.forEach(staff => {
    let currentTime = 0;
    
    staff.measures.forEach(measure => {
      measure.events.forEach(event => {
        const quants = getNoteDuration(event.duration, event.dotted, event.tuplet);
        const durationSec = quants * secondsPerQuant;
        
        event.notes.forEach(note => {
          events.push({
            time: currentTime,
            pitch: note.pitch, // Already absolute with TonalJS
            duration: durationSec
          });
        });
        
        currentTime += durationSec;
      });
    });
  });
  
  return events;
};
```

---

## Phase 3: Replace audioEngine.ts

### [DELETE] Most of audioEngine.ts

Remove:
- `PITCH_FREQUENCIES` (use MusicService or Tone.js)
- `getFrequency()` (Tone handles pitch notation natively)
- `scheduleNote()` (Tone.js handles scheduling)
- `scheduleScorePlayback()` (replace with Tone.Part)

Keep/Migrate:
- `getEffectiveAccidental()` → Move to MusicService (if still needed after TonalJS refactor)

### [MODIFY] hooks/usePlayback.ts

```typescript
import * as Tone from 'tone';
import { initAudio } from '../services/AudioService';
import { scoreToToneEvents } from '../engines/playbackAdapter';

export const usePlayback = (score: Score, bpm: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const partRef = useRef<Tone.Part | null>(null);

  const playScore = useCallback(async () => {
    await initAudio();
    
    const events = scoreToToneEvents(score, bpm);
    const synth = new Tone.PolySynth().toDestination();
    
    partRef.current = new Tone.Part((time, event) => {
      synth.triggerAttackRelease(event.pitch, event.duration, time);
    }, events.map(e => ({ time: e.time, ...e })));
    
    partRef.current.start(0);
    Tone.getTransport().start();
    setIsPlaying(true);
  }, [score, bpm]);

  const stopPlayback = useCallback(() => {
    Tone.getTransport().stop();
    partRef.current?.dispose();
    setIsPlaying(false);
  }, []);

  return { isPlaying, playScore, stopPlayback };
};
```

---

## Phase 4: Playback Position Tracking

Use Tone.js Transport callbacks for cursor sync:

```typescript
Tone.getTransport().scheduleRepeat((time) => {
  const position = Tone.getTransport().position; // "0:1:2"
  // Convert to measureIndex/eventIndex
  onPositionUpdate(parsedPosition);
}, "16n");
```

---

## Phase 5: Future Enhancements (Optional)

| Feature | Tone.js Solution |
|---|---|
| **Piano Samples** | `Tone.Sampler` with Salamander piano |
| **Reverb/Effects** | `Tone.Reverb`, `Tone.Chorus` chains |
| **Loop Playback** | `Tone.Transport.loop = true` |
| **Metronome** | `Tone.Loop` with click sample |
| **MIDI Export** | `Tone.Midi` (from `@tonejs/midi`) |

---

## Verification Plan

### Unit Tests: `__tests__/playbackAdapter.test.ts`

```typescript
describe('scoreToToneEvents', () => {
  it('converts simple quarter notes', () => {
    const events = scoreToToneEvents(simpleScore, 120);
    expect(events[0].time).toBe(0);
    expect(events[0].duration).toBe(0.5); // Quarter at 120bpm
  });

  it('handles mixed tuplets correctly', () => {
    const events = scoreToToneEvents(tupletScore, 120);
    // Verify tuplet durations are scaled by ratio
  });
});
```

### Interactive Test
1. Click Play. Verify audio plays through Tone.js synth.
2. Verify playback cursor tracks correctly.
3. Test with tuplets, ties, and chords.
4. Test on mobile browser.

---

## Migration Checklist

- [ ] Install `tone`
- [ ] Create `AudioService.ts`
- [ ] Create `playbackAdapter.ts`
- [ ] Refactor `usePlayback.ts`
- [ ] Delete old `audioEngine.ts` playback code
- [ ] Update `playTone()` for note preview
- [ ] Add position tracking
- [ ] Test comprehensively
