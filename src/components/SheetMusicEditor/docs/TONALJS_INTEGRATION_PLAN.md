# Implementation Plan - TonalJS Integration

Comprehensive refactor to integrate `tonal` across the codebase, fixing Key Signature handling and modernizing all music logic.

## Overview

> **Major Refactor:** Notes will store absolute pitch (e.g., `F#4` in G Major, not `F4` + accidental flag).
> **Accidentals:** Rendering will auto-calculate if accidentals are needed based on Key.

---

## Phase 1: Core Music Logic Service

Create a centralized `MusicService.ts` using Tonal modules to replace scattered logic.

### [NEW] services/MusicService.ts

**Replaces/Consolidates:**
- `PitchService.ts` (calculateNewPitch, getPitchByOffset)
- `audioEngine.ts` → `PITCH_FREQUENCIES`, `getEffectiveAccidental`, `getFrequency`
- `midiEngine.ts` → `MIDI_NOTE_NAMES`, `midiNoteToPitch`, `isMidiNoteSharp`
- `constants.ts` → `KEY_SIGNATURES`, `ORDERED_PITCHES`, `BASS_ORDERED_PITCHES`
- `positioning.ts` → Pitch normalizer helpers

**Uses Tonal Modules:**
| Tonal Module | Replaces |
|---|---|
| `@tonaljs/note` | Pitch parsing, transposition, simplify |
| `@tonaljs/midi` | MIDI ↔ Pitch conversion |
| `@tonaljs/key` | Key signatures, scale degrees |
| `@tonaljs/interval` | Semitone/step calculations |

**Key Functions:**

```typescript
import { Note, Midi, Key, Interval } from 'tonal';

/** Get frequency for any pitch (handles sharps/flats natively) */
export const getFrequency = (pitch: string): number => Note.freq(pitch) || 0;

/** Get MIDI note number */
export const getMidi = (pitch: string): number => Note.midi(pitch) || 60;

/** Convert MIDI to pitch */
export const midiToPitch = (midi: number): string => Note.fromMidi(midi);

/** Get scale notes for a key */
export const getScaleNotes = (key: string): string[] => Key.majorKey(key).scale;

/** Transpose pitch by interval */
export const transpose = (pitch: string, interval: string): string => 
    Note.transpose(pitch, interval) || pitch;

/** Get next scale degree (Key-aware movement) */
export const getNextScaleDegree = (pitch: string, key: string, direction: 'up' | 'down'): string => {
    const scale = Key.majorKey(key).scale;
    // ... implementation
};

/** Check if pitch needs accidental in key */
export const needsAccidental = (pitch: string, key: string): { show: boolean; type: string | null } => {
    const keyAccidentals = Key.majorKey(key).alteration;
    // ... compare pitch's accidental to key's expectation
};

/** Normalize pitch for staff positioning (F#4 → F4 for Y lookup) */
export const getStaffPitch = (pitch: string): string => Note.pitchClass(pitch) + Note.octave(pitch);
```

---

## Phase 2: Fix Key Signature Input Bug

### [MODIFY] engines/layout/positioning.ts

- Import `MusicService`.
- Update `getOffsetForPitch(pitch)` to normalize pitch before lookup.

### [MODIFY] components/Canvas/Measure.tsx

- Accept `keySignature` prop.
- In `calculateClickData`: Use `MusicService` to resolve Y → absolute pitch (apply Key).

### [MODIFY] components/Canvas/Staff.tsx

- Pass `keySignature` to `Measure`.

---

## Phase 3: Key-Aware Rendering

### [MODIFY] components/Canvas/ChordGroup.tsx

- Accept `keySignature` prop.
- Use `MusicService.needsAccidental(pitch, key)` to determine if visual accidental is required.

---

## Phase 4: Delete Redundant Code

### [DELETE] Static Maps in:
- `audioEngine.ts` → `PITCH_FREQUENCIES`
- `midiEngine.ts` → `MIDI_NOTE_NAMES`
- `constants.ts` → `KEY_SIGNATURES`, `ORDERED_PITCHES`, `BASS_ORDERED_PITCHES`
- `abcExporter.ts` → `ABC_PITCH_MAP_TREBLE`, `ABC_PITCH_MAP_BASS`

### [MODIFY] exporters/abcExporter.ts

- Use `@tonaljs/abc-notation` for pitch conversion.

```typescript
import { AbcNotation } from '@tonaljs/abc-notation';
const abcPitch = AbcNotation.scientificToAbcNotation(note.pitch);
```

### [MODIFY] engines/audioEngine.ts

- Replace `getFrequency` with `MusicService.getFrequency`.
- Delete `getEffectiveAccidental` (handled at store time now).

### [MODIFY] engines/midiEngine.ts

- Replace `midiNoteToPitch` with `Note.fromMidi`.
- Replace `isMidiNoteSharp` with `Note.accidentals(pitch).includes('#')`.

---

## Phase 5: Additional Opportunities

| Area | Current | TonalJS Replacement |
|---|---|---|
| **Duration Values** | `NOTE_TYPES.duration` | `@tonaljs/duration-value` (optional) |
| **Time Signature Parsing** | Manual split `'4/4'.split('/')` | `@tonaljs/time-signature` |
| **Note Ranges** | `ORDERED_PITCHES` arrays | `@tonaljs/range` (e.g., `Range.chromatic(['C3', 'G6'])`) |
| **Chord Detection** | N/A | `@tonaljs/chord-detect` (future feature) |

---

## Verification Plan

### Test Suite: `__tests__/MusicService.test.ts`

```typescript
describe('MusicService', () => {
  it('getFrequency returns correct Hz', () => {
    expect(getFrequency('A4')).toBe(440);
    expect(getFrequency('F#4')).toBeCloseTo(369.99);
  });

  it('midiToPitch converts correctly', () => {
    expect(midiToPitch(60)).toBe('C4');
    expect(midiToPitch(61)).toBe('C#4');
  });

  it('getNextScaleDegree respects key', () => {
    expect(getNextScaleDegree('F4', 'G', 'up')).toBe('G4');
    expect(getNextScaleDegree('F#4', 'C', 'up')).toBe('G4');
  });

  it('needsAccidental detects correctly', () => {
    expect(needsAccidental('F#4', 'G').show).toBe(false);
    expect(needsAccidental('F4', 'G').show).toBe(true);
  });
});
```

### Interactive Test
1. Key = G Major. Click F-line. Verify stored = `F#4`. Verify no sharp renders.
2. Toggle accidental to natural. Verify stored = `F4`. Verify ♮ renders.
3. Move `F#4` up. Verify result = `G4`.
