# Phase 7D: Playback Integration Specification

> Implements 5 playback control methods for the RiffScore API.

## Methods Overview

| Method | Description | Implementation |
|--------|-------------|----------------|
| `play(measureIndex?, eventIndex?)` | Start playback | `usePlayback.playScore()` |
| `pause()` | Pause playback | `usePlayback.pausePlayback()` |
| `stop()` | Stop and reset position | `usePlayback.stopPlayback()` |
| `rewind()` | Seek to start | `stop()` + state reset |
| `setInstrument(id)` | Change instrument | `toneEngine.setInstrument()` |

---

## Implementation Strategy

### 1. Extend APIContext (`src/hooks/api/types.ts`)

```typescript
export interface APIContext {
  // ... existing properties ...
  
  // Playback controls (from usePlayback)
  playback?: {
    playScore: (measureIndex?: number, quant?: number) => Promise<void>;
    stopPlayback: () => void;
    pausePlayback: () => void;
    isPlaying: boolean;
  };
}
```

### 2. Wire in `useScoreAPI.ts`

The `usePlayback` hook is already used in `ScoreEditorContent`. For the API, we need to either:
- **Option A**: Pass playback functions through ScoreContext (preferred)
- **Option B**: Create playback hook inside useScoreAPI

Since `usePlayback` requires `score` and `bpm`, the cleanest approach is to:
1. Move playback state management into ScoreContext
2. Expose playback controls via `ctx.playback`

### 3. Implement in `playback.ts`

```typescript
play(measureIndex = 0, eventIndex = 0) {
  if (ctx.playback) {
    ctx.playback.playScore(measureIndex, eventIndex);
  }
  return this;
},

pause() {
  if (ctx.playback) {
    ctx.playback.pausePlayback();
  }
  return this;
},

stop() {
  if (ctx.playback) {
    ctx.playback.stopPlayback();
  }
  return this;
},

rewind() {
  if (ctx.playback) {
    ctx.playback.stopPlayback();
    // Position is reset by stopPlayback
  }
  return this;
},

setInstrument(instrumentId) {
  setInstrument(instrumentId as InstrumentType);
  return this;
},
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/api/types.ts` | Add `playback` to APIContext |
| `src/hooks/useScoreAPI.ts` | Wire `usePlayback` into context |
| `src/hooks/api/playback.ts` | Implement all 5 methods |
| `docs/API.md` | Mark 5 methods ✅ |
| `docs/migration/progress.md` | Mark Phase 7D complete |

---

## Testing Notes

Tests must mock `toneEngine` since Tone.js requires browser audio context:
```typescript
jest.mock('../engines/toneEngine', () => ({
  setInstrument: jest.fn(),
  stopTonePlayback: jest.fn(),
  scheduleTonePlayback: jest.fn(),
  initTone: jest.fn().mockResolvedValue(undefined),
}));
```
