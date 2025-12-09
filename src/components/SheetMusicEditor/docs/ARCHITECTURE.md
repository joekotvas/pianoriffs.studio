# SheetMusicEditor Architecture

This document describes the overall architecture and key design decisions for the Sheet Music Editor component.

---

## Directory Structure

```
SheetMusicEditor/
├── index.tsx                 # Main entry point
├── ScoreEditor.tsx           # Core editor component
├── types.ts                  # Type definitions (Score, Staff, Measure, Event, Note)
├── config.ts                 # Configuration constants
├── constants.ts              # Music constants (NOTE_TYPES, etc.)
│
├── services/                 # Business logic services
│   ├── MusicService.ts       # TonalJS wrapper - pitch, key, transposition
│   └── PitchService.ts       # Legacy (to be replaced by MusicService)
│
├── engines/                  # Core processing engines
│   ├── ScoreEngine.ts        # Command dispatch and state management
│   ├── audioEngine.ts        # Web Audio playback (to be replaced by Tone.js)
│   ├── midiEngine.ts         # MIDI input handling
│   └── layout/               # Layout calculation
│       ├── positioning.ts    # Pitch-to-Y mapping
│       ├── measure.ts        # Measure layout
│       ├── beaming.ts        # Beam grouping
│       └── tuplets.ts        # Tuplet brackets
│
├── commands/                 # Command pattern for undo/redo
│   ├── types.ts              # Command interface
│   ├── AddNoteCommand.ts
│   ├── TransposeSelectionCommand.ts
│   └── ...
│
├── hooks/                    # React hooks
│   ├── useScoreLogic.ts      # Main score state management
│   ├── useNavigation.ts      # Keyboard navigation
│   ├── usePlayback.ts        # Audio playback control
│   ├── useModifiers.ts       # Duration/accidental toggles
│   └── ...
│
├── components/               # UI components
│   ├── Canvas/               # SVG score rendering
│   │   ├── ScoreCanvas.tsx
│   │   ├── Staff.tsx
│   │   ├── Measure.tsx
│   │   ├── ChordGroup.tsx
│   │   └── Note.tsx
│   ├── Toolbar/              # Toolbar controls
│   ├── Panels/               # Side panels
│   └── Overlays/             # Modal overlays
│
├── exporters/                # Export functionality
│   ├── abcExporter.ts        # ABC notation export
│   ├── musicXmlExporter.ts   # MusicXML export
│   └── jsonExporter.ts       # JSON export
│
├── context/                  # React context
│   ├── ScoreContext.tsx      # Score state provider
│   └── ThemeContext.tsx      # Theme provider
│
├── utils/                    # Utility functions
│   ├── core.ts               # Duration calculations, reflow
│   ├── validation.ts         # Input validation
│   └── interaction.ts        # Selection/navigation helpers
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # This file
│   ├── TONALJS_INTEGRATION_PLAN.md
│   └── TONEJS_INTEGRATION_PLAN.md
│
└── __tests__/                # Test files
```

---

## Core Concepts

### Data Model

```
Score
  ├── title: string
  ├── timeSignature: string ("4/4")
  ├── keySignature: string ("G")
  ├── bpm: number
  └── staves: Staff[]
        ├── clef: 'treble' | 'bass'
        └── measures: Measure[]
              └── events: ScoreEvent[]
                    ├── duration: string ("quarter")
                    ├── dotted: boolean
                    ├── tuplet?: TupletInfo
                    └── notes: Note[]
                          ├── pitch: string ("F#4")
                          ├── accidental?: 'sharp' | 'flat' | 'natural'
                          └── tied?: boolean
```

### Key Design Decisions

1. **Absolute Pitch Storage** (TonalJS Integration)
   - Pitches stored as absolute values: `"F#4"`, not `"F4"` + accidental flag
   - Accidentals calculated for rendering based on Key Signature
   - `MusicService.needsAccidental()` determines if symbol is shown

2. **Command Pattern**
   - All mutations go through `ScoreEngine.dispatch(Command)`
   - Enables undo/redo via command history
   - Commands are serializable for persistence

3. **Separation of Concerns**
   - **Services**: Pure business logic (MusicService, PitchService)
   - **Engines**: Stateful processing (ScoreEngine, audioEngine)
   - **Hooks**: React state management
   - **Components**: Pure rendering

4. **Grand Staff Support**
   - Multiple staves in `score.staves[]`
   - Synchronized measure layouts
   - Per-staff clef support

---

## Service Layer

### MusicService (TonalJS)

Centralized music theory operations:

```typescript
import { getFrequency, needsAccidental, applyKeySignature } from './services/MusicService';

// Get frequency for playback
const freq = getFrequency("F#4"); // 369.99 Hz

// Check if accidental needs rendering
const { show, type } = needsAccidental("F#4", "G"); // { show: false, type: null }

// Apply key signature to visual pitch
const pitch = applyKeySignature("F4", "G"); // "F#4"
```

### AudioService (Tone.js - Future)

Audio playback using Tone.js:

```typescript
import { playNote, initAudio } from './services/AudioService';

await initAudio();
playNote("C4", 0.5); // Play C4 for 0.5 seconds
```

---

## State Flow

```
User Action (click, keypress)
       ↓
Hook (useNavigation, useModifiers)
       ↓
Command (AddNoteCommand, etc.)
       ↓
ScoreEngine.dispatch()
       ↓
State Update (scoreRef)
       ↓
React Re-render
       ↓
Layout Engine (positioning, measure)
       ↓
Canvas Render (Staff → Measure → Note)
```

---

## Integration Plan

### Phase 1: TonalJS (Current)
- [x] Create MusicService.ts
- [ ] Fix Key Signature input bug
- [ ] Key-aware rendering
- [ ] Cleanup legacy code

### Phase 2: Tone.js (Future)
- [ ] Create AudioService.ts
- [ ] Score-to-Tone adapter
- [ ] Replace audioEngine.ts
- [ ] Sample-based playback

---

## Testing Strategy

- **Unit Tests**: Services and utilities (`MusicService.test.ts`)
- **Integration Tests**: Command execution
- **Browser Tests**: User interactions (Playwright)

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `tonal` | Music theory (pitch, key, intervals) |
| `tone` | Audio playback (future) |
| `react` | UI framework |
| `lucide-react` | Icons |
