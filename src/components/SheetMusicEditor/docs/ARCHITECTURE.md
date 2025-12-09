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
│   └── TimelineService.ts    # Timeline and playback calculations
│
├── engines/                  # Core processing engines
│   ├── ScoreEngine.ts        # Command dispatch and state management
│   ├── audioEngine.ts        # Web Audio playback (to be replaced by Tone.js)
│   ├── midiEngine.ts         # MIDI input handling
│   └── layout/               # Layout calculation
│       ├── index.ts          # Module exports
│       ├── types.ts          # Layout type definitions
│       ├── positioning.ts    # Pitch-to-Y mapping
│       ├── measure.ts        # Measure layout
│       ├── beaming.ts        # Beam grouping and angle calculation
│       └── tuplets.ts        # Tuplet brackets
│
├── commands/                 # Command pattern for undo/redo
│   ├── types.ts              # Command interface
│   ├── AddNoteToEventCommand.ts
│   ├── ChangePitchCommand.ts
│   ├── DeleteNoteCommand.ts
│   ├── MeasureCommands.ts
│   ├── NoteCommands.ts
│   ├── TransposeSelectionCommand.ts
│   ├── TupletCommands.ts
│   ├── SetKeySignatureCommand.ts
│   ├── SetTimeSignatureCommand.ts
│   ├── SetGrandStaffCommand.ts
│   ├── SetSingleStaffCommand.ts
│   ├── TogglePickupCommand.ts
│   └── ...
│
├── hooks/                    # React hooks
│   ├── useScoreLogic.ts      # Main score state management  
│   ├── useNavigation.ts      # Keyboard navigation
│   ├── usePlayback.ts        # Audio playback control
│   ├── useModifiers.ts       # Duration/accidental toggles
│   ├── useNoteActions.ts     # Note manipulation
│   ├── useMeasureActions.ts  # Measure manipulation
│   ├── useTupletActions.ts   # Tuplet creation/management
│   ├── useAutoScroll.ts      # Canvas auto-scrolling
│   ├── useGrandStaffLayout.ts # Grand staff layout calculation
│   ├── useKeyboardShortcuts.ts # Keyboard shortcut handling
│   ├── useScoreInteraction.ts # Mouse/click interaction
│   ├── useMIDI.ts            # MIDI input handling
│   └── handlers/             # Event handlers
│       └── ...
│
├── components/               # UI components
│   ├── Canvas/               # SVG score rendering
│   │   ├── ScoreCanvas.tsx   # Main canvas container
│   │   ├── Staff.tsx         # Staff lines and clef
│   │   ├── Measure.tsx       # Measure container
│   │   ├── ChordGroup.tsx    # Note grouping with stems
│   │   ├── Note.tsx          # Individual note rendering
│   │   ├── Beam.tsx          # Beam rendering (angled)
│   │   ├── Tie.tsx           # Tie arc rendering
│   │   └── TupletBracket.tsx # Tuplet bracket rendering
│   ├── Assets/               # Visual assets (SVG icons, clefs)
│   │   ├── ClefIcon.tsx
│   │   └── GrandStaffBracket.tsx
│   ├── Toolbar/              # Toolbar controls
│   ├── Panels/               # Side panels
│   ├── Overlays/             # Modal overlays
│   └── Portal.tsx            # React portal wrapper
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
├── data/                     # Static data
│   └── melodies/             # Sample melodies
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # This file
│   └── ...
│
└── __tests__/                # Consolidated test files
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
        ├── keySignature: string (inherited from score)
        └── measures: Measure[]
              ├── isPickup?: boolean
              └── events: ScoreEvent[]
                    ├── id: string | number
                    ├── quant: number
                    ├── duration: string ("quarter")
                    ├── dotted: boolean
                    ├── isRest?: boolean
                    ├── tuplet?: TupletInfo
                    └── notes: Note[]
                          ├── id: string | number
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
   - **Services**: Pure business logic (MusicService, TimelineService)
   - **Engines**: Stateful processing (ScoreEngine, audioEngine)
   - **Hooks**: React state management
   - **Components**: Pure rendering

4. **Grand Staff Support**
   - Multiple staves in `score.staves[]`
   - Synchronized key/time signatures across staves
   - Synchronized pickup measures across staves
   - Per-staff clef support

5. **Consolidated Testing**
   - All tests in `__tests__/` directory at component root
   - No scattered test subdirectories

---

## Layout Engine

### Beaming System (`engines/layout/beaming.ts`)

The beaming engine calculates beam geometry for grouped notes:

```typescript
calculateBeamingGroups(events, eventPositions, clef) → BeamGroup[]
```

**Key Features:**
- **Pitch Contour Following**: Beam angles follow melodic direction
- **Maximum Slope Constraint**: Limited to 45° for readability
- **Direction-Dependent Positioning**: Stem offsets match ChordGroup (+6 up, -6 down)
- **Minimum Stem Length**: 35px enforced for all notes in group
- **Beat Boundary Breaking**: Beams break at beat boundaries

**Algorithm Flow:**
1. Collect note Y positions and calculate average
2. Determine stem direction (up/down) based on middle line
3. Calculate stem X positions with direction-dependent offset
4. Compute initial beam slope from start/end notes
5. Clamp slope to maximum 45 degrees
6. Validate all stems meet minimum length
7. Apply uniform shift if needed for clearance

### Rendering Pipeline

```
Measure.tsx
    ├── calculateMeasureLayout() → event positions
    ├── calculateBeamingGroups() → beam specifications
    ├── calculateChordLayout() → note offsets
    │
    └── Render:
        ├── ChordGroup (notes, stems)
        ├── Beam (angled beams connecting stems)
        └── TupletBracket (if applicable)
```

---

## Service Layer

### MusicService (TonalJS)

Centralized music theory operations:

```typescript
import { getFrequency, needsAccidental, applyKeySignature, movePitchVisual } from './services/MusicService';

// Get frequency for playback
const freq = getFrequency("F#4"); // 369.99 Hz

// Check if accidental needs rendering
const { show, type } = needsAccidental("F#4", "G"); // { show: false, type: null }

// Apply key signature to visual pitch
const pitch = applyKeySignature("F4", "G"); // "F#4"

// Move pitch by visual steps in a key
const newPitch = movePitchVisual("E4", 1, "G"); // "F#4"
```

### TimelineService

Playback timeline calculations:

```typescript
import { buildTimeline, getEventAtTime } from './services/TimelineService';

const timeline = buildTimeline(score);
const event = getEventAtTime(timeline, currentTime);
```

---

## State Flow

```
User Action (click, keypress)
       ↓
Hook (useNavigation, useModifiers, useNoteActions)
       ↓
Command (AddNoteCommand, etc.)
       ↓
ScoreEngine.dispatch()
       ↓
State Update (scoreRef)
       ↓
React Re-render
       ↓
Layout Engine (positioning, measure, beaming)
       ↓
Canvas Render (Staff → Measure → ChordGroup → Note + Beam)
```

---

## Hook Architecture

### Core Hooks

| Hook | Purpose |
|------|---------|
| `useScoreLogic` | Main state orchestration, combines other hooks |
| `useScoreEngine` | ScoreEngine integration |
| `useHistory` | Undo/redo management |
| `useNavigation` | Arrow key navigation, selection |
| `useNoteActions` | Add, delete, modify notes |
| `useMeasureActions` | Add, delete measures |
| `useTupletActions` | Create, remove tuplets |
| `useModifiers` | Duration, accidental, dot toggles |
| `usePlayback` | Audio playback control |

### UI Hooks

| Hook | Purpose |
|------|---------|
| `useAutoScroll` | Canvas scrolling to follow selection |
| `useGrandStaffLayout` | Grand staff vertical layout |
| `useKeyboardShortcuts` | Keyboard event handling |
| `useScoreInteraction` | Mouse/click handling |
| `useMIDI` | MIDI input integration |

---

## Recent Improvements

### Beaming System
- Replaced horizontal beams with proper angled beams
- Added pitch contour following
- Implemented maximum 45° slope constraint
- Fixed stem-to-beam alignment with direction-dependent offsets
- Extended beam width by 1px on each side

### Test Consolidation
- Moved all tests to single `__tests__/` directory
- Removed scattered test subdirectories
- Updated import paths for new structure

### Grand Staff Synchronization
- Synchronized key signatures across staves
- Synchronized time signatures across staves
- Synchronized pickup measure status

---

## Testing Strategy

- **Unit Tests**: Services and utilities (`MusicService.test.ts`, `TimelineService.test.ts`)
- **Integration Tests**: Command execution, hook behavior
- **All tests in**: `SheetMusicEditor/__tests__/`

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `tonal` | Music theory (pitch, key, intervals) |
| `tone` | Audio playback (future) |
| `react` | UI framework |
| `lucide-react` | Icons |
