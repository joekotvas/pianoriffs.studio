# RiffScore Architecture Guide

> A configurable, embeddable sheet music editor for React. Focuses on common notation needs and platform independence.

> **See also**: [Configuration Guide](./CONFIGURATION.md) • [Interaction Design](./INTERACTION.md)

---

## 1. Core Principles

These choices shape how the editor works.

<details>
<summary><strong>View principles</strong></summary>

### 🏛️ Single Source of Truth
The `Score` object is the canonical state. Layout details (beam angles, accidental visibility) are calculated at render time, not stored.
*   `Score` is plain JSON—easy to serialize and debug.
*   What you save is what you load.

### ⚡ Command Pattern
All mutations go through `ScoreEngine.dispatch()`.
*   Undo/redo comes for free.
*   Each command is self-contained and logged.

### 🎼 Theory-First Data Model
Pitches are stored as absolute values (e.g., `"F#4"`), not relative to key.
*   `MusicService` handles context—whether an `F#` needs an accidental depends on the key signature, computed at render time.

### 🎨 Standards-Based Notation
Glyphs come from the SMuFL specification, using the Bravura font.
*   No custom SVG paths—just standardized Unicode code points.
*   Swap in any SMuFL-compliant font if you prefer.

### 🔧 Flexibility
One `config` prop controls everything.
*   Override only what you need; sensible defaults handle the rest.
*   Generate blank scores from templates, or pass in existing compositions.

### ✨ Simplicity
`<RiffScore />` works out of the box.
*   No providers to wrap, no context to set up.
*   Playback, MIDI, keyboard shortcuts, and undo/redo are included.

### 🔄 Compatibility
Export to JSON, MusicXML, or ABC notation.
*   MusicXML works with Finale, Sibelius, MuseScore, and others.
*   Import is on the roadmap.

</details>

---

## 2. Entry Point

`<RiffScore />` is the public API. Pass a config to customize, or use defaults.

<details>
<summary><strong>View examples</strong></summary>

```tsx
import { RiffScore } from '@/components/SheetMusicEditor';

// Defaults: grand staff, 4 measures
<RiffScore />

// Custom config
<RiffScore config={{
  ui: { showToolbar: false, scale: 0.75 },
  interaction: { isEnabled: false },
  score: { staff: 'treble', measureCount: 8, keySignature: 'G' }
}} />
```

### How config is resolved

```
RiffScoreConfig (partial)
    ↓
useRiffScore()
    ├── mergeConfig() → fill in defaults
    ├── staves provided? → use them
    └── else → generateStaves() from template
    ↓
ScoreProvider
    ↓
ScoreEditorContent
```

See [Configuration Guide](./CONFIGURATION.md) for details.

</details>

---

## 3. Directory Structure

Organized in layers: services → engines → hooks → components.

<details>
<summary><strong>View tree</strong></summary>

```
SheetMusicEditor/
├── index.tsx                 # Exports RiffScore & ScoreEditor
├── RiffScore.tsx             # Config wrapper
├── ScoreEditor.tsx           # Main editor
├── types.ts                  # Score, RiffScoreConfig, DeepPartial
├── config.ts                 # Layout constants
├── themes.ts                 # Theme definitions
├── constants.ts              # Music constants
│
├── services/                 # Business logic
│   ├── MusicService.ts       # TonalJS wrapper
│   └── TimelineService.ts    # Playback timing
│
├── engines/
│   ├── ScoreEngine.ts        # Command dispatch
│   ├── toneEngine.ts         # Audio
│   ├── midiEngine.ts         # MIDI input
│   └── layout/               # Layout calculation
│       ├── positioning.ts    # Pitch → Y
│       ├── measure.ts        # Event positions, hit zones
│       ├── beaming.ts        # Beam groups
│       ├── tuplets.ts        # Tuplet brackets
│       └── stems.ts          # Stem lengths
│
├── commands/                 # Undo/redo commands
│   ├── AddEventCommand.ts
│   ├── ChangePitchCommand.ts
│   ├── MeasureCommands.ts
│   └── ...
│
├── hooks/
│   ├── useRiffScore.ts       # Config → initial score
│   ├── useScoreLogic.ts      # Main state
│   ├── useSelection.ts       # Selection
│   ├── useNavigation.ts      # Arrow keys
│   ├── usePlayback.ts        # Play/pause
│   └── ...
│
├── components/
│   ├── Canvas/               # SVG rendering
│   │   ├── ScoreCanvas.tsx
│   │   ├── Staff.tsx
│   │   ├── Measure.tsx
│   │   ├── ChordGroup.tsx
│   │   ├── Note.tsx
│   │   ├── Stem.tsx
│   │   ├── Flags.tsx
│   │   ├── Beam.tsx
│   │   ├── Rest.tsx
│   │   ├── Tie.tsx
│   │   ├── TupletBracket.tsx
│   │   └── GhostPreview.tsx
│   ├── Assets/
│   ├── Toolbar/
│   ├── Panels/
│   └── Overlays/
│
├── exporters/
│   ├── musicXmlExporter.ts
│   ├── abcExporter.ts
│   └── jsonExporter.ts
│
├── context/
│   ├── ScoreContext.tsx
│   └── ThemeContext.tsx
│
├── utils/
│   ├── core.ts               # Duration math
│   ├── generateScore.ts      # Template → staves
│   ├── mergeConfig.ts        # Deep merge
│   └── ...
│
├── docs/
└── __tests__/                # 34 test suites
```

</details>

---

## 4. Data Model

`Score` → `Staff[]` → `Measure[]` → `ScoreEvent[]` → `Note[]`

<details>
<summary><strong>View schema</strong></summary>

```typescript
Score
  ├── title: string
  ├── timeSignature: "4/4"
  ├── keySignature: "G"
  ├── bpm: number
  └── staves: Staff[]
        ├── clef: 'treble' | 'bass'
        └── measures: Measure[]
              ├── isPickup?: boolean
              └── events: ScoreEvent[]
                    ├── duration: "quarter"
                    ├── dotted: boolean
                    ├── isRest?: boolean
                    ├── tuplet?: TupletInfo
                    └── notes: Note[]
                          ├── pitch: "F#4"
                          ├── accidental?: 'sharp' | 'flat' | 'natural'
                          └── tied?: boolean
```

</details>

---

## 5. Design Decisions

<details>
<summary><strong>View decisions</strong></summary>

### Notes and Rests are the same type
Both are `ScoreEvent`. Notes have `notes[]`, rests have `isRest: true`. This keeps commands and selection logic unified.

### Grand staff stays in sync
Key signature, time signature, and pickup measures apply to all staves. `Alt + Up/Down` moves between staves.

### Tests are consolidated
All tests live in `__tests__/`. Current coverage: Services 98%, Utils 87%, Commands 79%, Hooks 62%.

</details>

---

## 6. Layout Engine

Six modules handle positioning and engraving.

<details>
<summary><strong>View modules</strong></summary>

| Module | Does |
|--------|------|
| `measure.ts` | Event positions, hit zones |
| `system.ts` | Multi-staff sync |
| `positioning.ts` | Pitch → Y coordinate |
| `beaming.ts` | Beam groups and angles |
| `tuplets.ts` | Bracket positions |
| `stems.ts` | Stem lengths |

### Pipeline

```
State update
    ↓
Measure.tsx
    ├── calculateMeasureLayout()
    ├── calculateBeamingGroups()
    ├── calculateChordLayout()
    └── Render: ChordGroup, Beam, Rest, TupletBracket
```

</details>

---

## 7. Hooks

<details>
<summary><strong>View hook list</strong></summary>

### State

| Hook | Purpose |
|------|---------|
| `useRiffScore` | Config → initial score |
| `useScoreLogic` | Main state orchestration |
| `useScoreEngine` | Command dispatch |
| `useSelection` | Selection state |
| `useHistory` | Undo/redo |

### Interaction

| Hook | Purpose |
|------|---------|
| `useNavigation` | Arrow key handling |
| `useNoteActions` | Add/delete notes |
| `useMeasureActions` | Add/delete measures |
| `useModifiers` | Duration, accidentals |
| `usePlayback` | Play/pause |
| `useMIDI` | MIDI input |

</details>

---

## 8. Dependencies

<details>
<summary><strong>View packages</strong></summary>

| Package | Purpose |
|---------|---------|
| [tonal](https://github.com/tonaljs/tonal) | Music theory |
| [tone](https://tonejs.github.io/) | Audio |
| react | UI |
| lucide-react | Icons |
| Bravura | SMuFL font |

</details>
