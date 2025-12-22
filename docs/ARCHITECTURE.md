[← Back to README](../README.md)

# RiffScore Architecture Guide

> A configurable, embeddable sheet music editor for React. Focuses on common notation needs and platform independence.

> **See also**: [Configuration](./CONFIGURATION.md) • [Commands](./COMMANDS.md) • [Data Model](./DATA_MODEL.md) • [Layout Engine](./LAYOUT_ENGINE.md)

---

## 1. Core Principles

These choices shape how the editor works.

<details>
<summary><strong>View principles</strong></summary>

### 🏛️ Single Source of Truth
The `Score` object is the canonical state. Layout details (beam angles, accidental visibility) are calculated at render time, not stored.
*   `Score` is plain JSON—easy to serialize and debug.
*   What you save is what you load.

See [Data Model](./DATA_MODEL.md) for the full schema.

### ⚡ Command Abstraction Layer
All state mutations flow through dedicated engines:
*   **ScoreEngine**: Handles score mutations with built-in undo/redo history.
*   **SelectionEngine**: Manages cursor and multi-selection state (no undo for ephemeral navigation).

Commands are self-contained, logged, and testable in isolation. See [Commands](./COMMANDS.md) for the pattern reference.

### 🎼 Theory-First Data Model
Pitches are stored as absolute values (e.g., `"F#4"`), not relative to key. Music theory operations are powered by [Tonal.js](https://github.com/tonaljs/tonal).
*   `MusicService` handles context—whether an `F#` needs an accidental depends on the key signature, computed at render time.
*   Intervals, transposition, and chord detection use Tonal's battle-tested algorithms.

### 🎨 Standards-Based Notation
Glyphs come from the [SMuFL specification](https://www.smufl.org/), using the Bravura font.
*   No custom SVG paths—just standardized Unicode code points.
*   Swap in any SMuFL-compliant font if you prefer.

See [Layout Engine](./LAYOUT_ENGINE.md) for engraving details.

### 🔧 Flexibility
One `config` prop controls everything. Override only what you need; sensible defaults handle the rest.
*   Generate blank scores from templates, or pass in existing compositions.
*   Script control via the imperative API ([API Reference](./API.md)).

### ✨ Simplicity
`<RiffScore />` works out of the box.
*   No providers to wrap, no context to set up.
*   Playback ([Tone.js](https://tonejs.github.io/)), MIDI, keyboard shortcuts, and undo/redo are included.

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
import { RiffScore } from 'riffscore';

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

```mermaid
flowchart TD
    A["RiffScoreConfig (partial)"] --> B[useRiffScore]
    B --> C[mergeConfig - fill in defaults]
    B --> D{staves provided?}
    D -->|Yes| E[use them]
    D -->|No| F[generateStaves from template]
    E --> G[ScoreProvider]
    F --> G
    G --> H[ScoreEditorContent]
```

See [Configuration Guide](./CONFIGURATION.md) for details.

</details>

---

## 3. Directory Structure

Organized in layers: services → engines → hooks → components.

<details>
<summary><strong>View tree</strong></summary>

```
riffscore/
├── src/                      # Library source
│   ├── index.tsx             # Exports RiffScore
│   ├── RiffScore.tsx         # Config wrapper
│   ├── types.ts              # Score, Selection, RiffScoreConfig
│   ├── componentTypes.ts     # Component prop types
│   ├── config.ts             # Layout constants
│   ├── themes.ts             # Theme definitions
│   ├── constants.ts          # Music constants
│
│   ├── components/
│   │   ├── Assets/           # Visual assets (7 files)
│   │   │   ├── BravuraTest.tsx
│   │   │   ├── ClefIcon.tsx
│   │   │   ├── GrandStaffBracket.tsx
│   │   │   ├── NoteIcon.tsx
│   │   │   ├── RestIcon.tsx
│   │   │   ├── TieIcon.tsx
│   │   │   └── semiBreve.svg
│   │   │
│   │   ├── Canvas/           # SVG rendering (13 files)
│   │   │   ├── ScoreCanvas.tsx
│   │   │   ├── ScoreHeader.tsx
│   │   │   ├── Staff.tsx
│   │   │   ├── Measure.tsx
│   │   │   ├── ChordGroup.tsx
│   │   │   ├── Note.tsx
│   │   │   ├── Rest.tsx
│   │   │   ├── Stem.tsx
│   │   │   ├── Flags.tsx
│   │   │   ├── Beam.tsx
│   │   │   ├── Tie.tsx
│   │   │   ├── TupletBracket.tsx
│   │   │   └── GhostPreview.tsx
│   │   │
│   │   ├── Layout/           # Editor layout
│   │   │   ├── ScoreEditor.tsx
│   │   │   ├── ScoreTitleField.tsx
│   │   │   ├── Portal.tsx
│   │   │   └── Overlays/
│   │   │       ├── ConfirmDialog.tsx
│   │   │       └── ShortcutsOverlay.tsx
│   │   │
│   │   └── Toolbar/          # Toolbar controls (17 files)
│   │       ├── Toolbar.tsx
│   │       ├── ToolbarButton.tsx
│   │       ├── Divider.tsx
│   │       ├── PlaybackControls.tsx
│   │       ├── HistoryControls.tsx
│   │       ├── MidiControls.tsx
│   │       ├── FileMenu.tsx
│   │       ├── InstrumentSelector.tsx
│   │       ├── InputModeToggle.tsx
│   │       ├── StaffControls.tsx
│   │       ├── DurationControls.tsx
│   │       ├── ModifierControls.tsx
│   │       ├── AccidentalControls.tsx
│   │       ├── TupletControls.tsx
│   │       ├── MeasureControls.tsx
│   │       ├── MelodyLibrary.tsx
│   │       └── Menus/
│   │           ├── DropdownOverlay.tsx
│   │           ├── ClefOverlay.tsx
│   │           ├── KeySignatureOverlay.tsx
│   │           └── TimeSignatureOverlay.tsx
│
│   ├── services/             # Business logic
│   │   ├── MusicService.ts   # TonalJS wrapper
│   │   └── TimelineService.ts# Playback timing
│
│   ├── engines/
│   │   ├── ScoreEngine.ts    # Score command dispatch
│   │   ├── SelectionEngine.ts# Selection command dispatch
│   │   ├── toneEngine.ts     # Audio (Tone.js)
│   │   ├── midiEngine.ts     # MIDI input
│   │   └── layout/           # Layout calculation (8 files)
│   │       ├── index.ts      # Re-exports
│   │       ├── types.ts      # Layout types
│   │       ├── positioning.ts# Pitch → Y
│   │       ├── measure.ts    # Event positions, hit zones
│   │       ├── beaming.ts    # Beam groups
│   │       ├── tuplets.ts    # Tuplet brackets
│   │       ├── stems.ts      # Stem lengths
│   │       └── system.ts     # Multi-staff sync
│
│   ├── commands/             # Undo/redo commands
│   │   ├── types.ts
│   │   ├── AddEventCommand.ts
│   │   ├── AddNoteToEventCommand.ts
│   │   ├── ChangePitchCommand.ts
│   │   ├── DeleteEventCommand.ts
│   │   ├── DeleteNoteCommand.ts
│   │   ├── LoadScoreCommand.ts
│   │   ├── MeasureCommands.ts
│   │   ├── RemoveTupletCommand.ts
│   │   ├── SetClefCommand.ts
│   │   ├── SetGrandStaffCommand.ts
│   │   ├── SetKeySignatureCommand.ts
│   │   ├── SetSingleStaffCommand.ts
│   │   ├── SetTimeSignatureCommand.ts
│   │   ├── TogglePickupCommand.ts
│   │   ├── ToggleRestCommand.ts
│   │   ├── TransposeSelectionCommand.ts
│   │   ├── TupletCommands.ts
│   │   ├── UpdateEventCommand.ts
│   │   ├── UpdateNoteCommand.ts
│   │   ├── UpdateTitleCommand.ts
│   │   └── selection/        # Selection commands
│   │       ├── index.ts      # Exports
│   │       ├── types.ts
│   │       ├── ClearSelectionCommand.ts
│   │       ├── LassoSelectCommand.ts
│   │       ├── NavigateCommand.ts
│   │       ├── RangeSelectCommand.ts
│   │       ├── ExtendSelectionVerticallyCommand.ts
│   │       ├── SelectAllCommand.ts
│   │       ├── SelectAllInEventCommand.ts
│   │       ├── SelectEventCommand.ts
│   │       ├── SelectMeasureCommand.ts
│   │       ├── SetSelectionCommand.ts
│   │       └── ToggleNoteCommand.ts
│
│   ├── hooks/                # React hooks (29 files)
│   │   ├── api/              # API factory modules
│   │   │   ├── index.ts      # Barrel exports
│   │   │   ├── types.ts      # APIContext interface
│   │   │   ├── navigation.ts # move, jump, select, selectById
│   │   │   ├── selection.ts  # selectAll, extend*, selectFullEvents
│   │   │   ├── entry.ts      # addNote, addRest, addTone, tuplets
│   │   │   ├── modification.ts # setPitch, transpose, structure
│   │   │   ├── history.ts    # undo, redo, transactions
│   │   │   ├── playback.ts   # play, pause, stop
│   │   │   ├── io.ts         # loadScore, reset, export
│   │   │   └── events.ts     # on() subscription wrapper
│   │   │
│   │   ├── handlers/         # Event handler modules
│   │   │   ├── handleMutation.ts
│   │   │   ├── handleNavigation.ts
│   │   │   └── handlePlayback.ts
│   │   │
│   │   ├── useRiffScore.ts
│   │   ├── useScoreLogic.ts
│   │   ├── useScoreEngine.ts
│   │   ├── useScoreInteraction.ts
│   │   ├── useSelection.ts
│   │   ├── useScoreAPI.ts    # Composes all api/ factories
│   │   ├── useAPISubscriptions.ts # Event subscription hook
│   │   ├── useHistory.ts
│   │   ├── useNavigation.ts
│   │   ├── useNoteActions.ts
│   │   ├── useMeasureActions.ts
│   │   ├── useModifiers.ts
│   │   ├── usePlayback.ts
│   │   ├── useMIDI.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useAutoScroll.ts
│   │   ├── useDragToSelect.ts
│   │   ├── useEditorMode.ts
│   │   ├── useEditorTools.ts
│   │   ├── useExport.ts
│   │   ├── useFocusTrap.ts
│   │   ├── useGrandStaffLayout.ts
│   │   ├── useMeasureInteraction.ts
│   │   ├── useMeasureLayout.ts
│   │   ├── useModifierKeys.ts
│   │   ├── usePreviewRender.ts
│   │   ├── useSamplerStatus.ts
│   │   ├── useTitleEditor.ts
│   │   ├── useTupletActions.ts
│   │   └── useAccidentalContext.ts
│
│   ├── exporters/
│   │   ├── musicXmlExporter.ts
│   │   ├── abcExporter.ts
│   │   └── jsonExporter.ts
│
│   ├── context/
│   │   ├── ScoreContext.tsx
│   │   └── ThemeContext.tsx
│
│   ├── utils/                # Utility functions (11 files)
│   │   ├── core.ts           # Duration math
│   │   ├── generateScore.ts  # Template → staves
│   │   ├── mergeConfig.ts    # Deep merge
│   │   ├── selection.ts      # Selection utilities
│   │   ├── interaction.ts    # Interaction utilities
│   │   ├── verticalStack.ts  # Vertical selection (metrics, stacks)
│   │   ├── validation.ts     # Score validation
│   │   ├── accidentalContext.ts
│   │   ├── commandHelpers.ts
│   │   ├── debug.ts          # Debug logging
│   │   └── focusScore.ts     # Focus management
│
│   ├── data/                 # Static data
│   │   └── melodies.ts       # Sample melodies
│
│   └── __tests__/            # All tests (43 files)
│
├── demo/                     # Demo Next.js app
│   ├── app/
│   │   ├── page.tsx
│   │   └── ConfigMenu.tsx
│   └── ...
│
└── docs/
```

</details>

---

## 4. Layer Architecture

The codebase is organized in distinct layers with clear responsibilities and boundaries.

<details>
<summary><strong>View layer hierarchy</strong></summary>

### Abstraction Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                                  │
│   Components (ScoreCanvas, Measure, Note, Toolbar)                  │
│   • Render SVG from layout data                                     │
│   • Fire events (onClick, onDrag)                                   │
│   • Consume context for state                                       │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│ ORCHESTRATION LAYER                                                 │
│   useScoreLogic, useKeyboardShortcuts                               │
│   • Coordinates engines, hooks, and state                           │
│   • Owns engine instances                                           │
│   • Provides callbacks to utility hooks                             │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│ UTILITY HOOKS                                                       │
│   useNavigation, useNoteActions, useMeasureActions                  │
│   • Receive callbacks as props (no engine access)                   │
│   • Contain interaction logic                                       │
│   • Remain testable and composable                                  │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│ ENGINE LAYER                                                        │
│   ScoreEngine, SelectionEngine, toneEngine, midiEngine              │
│   • Pure state machines (minimal React)                             │
│   • Process commands                                                │
│   • Emit state changes                                              │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│ SERVICES LAYER                                                      │
│   MusicService, TimelineService, Layout modules                     │
│   • Stateless pure functions                                        │
│   • Music theory (tonal), timing, positioning                       │
│   • No React dependencies                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Engine Separation

RiffScore uses separate engines for distinct concerns:

| Engine | Purpose | State |
|--------|---------|-------|
| **ScoreEngine** | Score mutations (add/delete notes, transpose) | `Score` |
| **SelectionEngine** | Selection state (cursor, multi-select, range) | `Selection` |
| **toneEngine** | Audio playback | Sampler state |
| **midiEngine** | MIDI input handling | Connection state |

> **Design Principle**: Engines remain separate for single responsibility. Coordination happens in the orchestration layer (`useScoreLogic`), not through engine coupling.

### Callback Abstraction Pattern

Utility hooks receive behavior through callbacks, not engine access:

```typescript
// ✅ CORRECT: Utility hook uses callbacks
useNavigation({
  select,              // Callback to modify selection
  setPreviewNote,      // Callback to update ghost cursor
  dispatch,            // Callback to dispatch score commands
  // NO engine props!
});

// ❌ AVOID: Passing engines directly to utility hooks
useNavigation({
  selectionEngine,     // Leaky abstraction!
});
```

This ensures:
- **Testability**: Mock callbacks easily in tests
- **Composability**: Hooks work with any callback implementation
- **Encapsulation**: Hooks don't know about engines or state management

### Data Flow

```mermaid
flowchart TD
    USER[User Action] --> HANDLER[Handler/Hook]
    HANDLER --> COMMAND[Create Command]
    COMMAND --> ENGINE[ScoreEngine.dispatch]
    ENGINE --> STATE[New Score State]
    STATE --> CONTEXT[ScoreContext]
    CONTEXT --> RENDER[Re-render Components]
    
    HANDLER --> SEL_CMD[Selection Command]
    SEL_CMD --> SEL_ENGINE[SelectionEngine.dispatch]
    SEL_ENGINE --> SEL_STATE[New Selection State]
    SEL_STATE --> CONTEXT
```

### Reactive Coordination

When changes in one domain affect another (e.g., deleting a staff invalidates selection), use React's reactive model:

```typescript
// In useScoreLogic or useSelection
useEffect(() => {
  // If selected staff no longer exists, reset selection
  if (selection.staffIndex >= score.staves.length) {
    clearSelection();
  }
}, [score.staves.length]);
```

This keeps engines decoupled while ensuring consistency.

### Selection Command Pattern

Selection operations use the Command pattern just like score mutations:

| Command | Purpose |
|---------|---------|
| `SelectEventCommand` | Select a note/event |
| `SetSelectionCommand` | Raw state replacement |
| `ClearSelectionCommand` | Clear all selection |
| `RangeSelectCommand` | Select range between anchor and focus |
| `ExtendSelectionVerticallyCommand` | Extend vertical selection (Slice-Based) |
| `SelectAllInEventCommand` | Select all notes in a chord |
| `SelectAllCommand` | Progressive scope expansion |
| `SelectMeasureCommand` | Select all events in a measure |
| `LassoSelectCommand` | Multi-select by bounding box |
| `ToggleNoteCommand` | Toggle note in multi-selection |
| `NavigateCommand` | Move cursor (arrow keys) |

</details>

---

## 5. Data Model

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
        ├── id: string | number
        ├── clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'grand'
        ├── keySignature: string
        └── measures: Measure[]
              ├── id: string | number
              ├── isPickup?: boolean
              └── events: ScoreEvent[]
                    ├── id: string | number
                    ├── duration: "quarter"
                    ├── dotted: boolean
                    ├── isRest?: boolean
                    ├── tuplet?: TupletInfo
                    └── notes: Note[]
                          ├── id: string | number
                          ├── pitch: "F#4" | null
                          ├── accidental?: 'sharp' | 'flat' | 'natural'
                          ├── tied?: boolean
                          └── isRest?: boolean
```

### Selection Model

```typescript
Selection
  ├── staffIndex: number          // 0 for single, 0-1 for Grand Staff
  ├── measureIndex: number | null
  ├── eventId: string | number | null
  ├── noteId: string | number | null
  ├── selectedNotes: Array<{      // Multi-selection support
  │     staffIndex, measureIndex, eventId, noteId
  │   }>
  ├── anchor?: { ... } | null     // Range selection anchor
  └── verticalAnchors?: {         // Vertical extension state
        direction: 'up' | 'down'
        sliceAnchors: Record<time, SelectedNote>
        originSelection: SelectedNote[]
      }
```

### Configuration

```typescript
RiffScoreConfig
  ├── ui: { showToolbar, scale, theme? }
  ├── interaction: { isEnabled, enableKeyboard, enablePlayback }
  └── score: { title, bpm, timeSignature, keySignature, staff?, measureCount?, staves? }
```

</details>

---

## 6. Design Decisions

<details>
<summary><strong>View decisions</strong></summary>

### Notes and Rests are the same type
Both are `ScoreEvent`. Notes have `notes[]`, rests have `isRest: true`. This keeps commands and selection logic unified.

### Grand staff stays in sync
Key signature, time signature, and pickup measures apply to all staves. `Alt + Up/Down` moves between staves.

### Tests are consolidated
All tests live in `__tests__/`. Current coverage: Services 98%, Utils 87%, Commands 79%, Hooks 62%.

### 2D Selection Model
Vertical selection treats the score as a **2D grid** where:
- **Time** is the horizontal axis (`measureIndex × 100000 + quant`)
- **Vertical Metric** combines staff and pitch into a single ordering (`(100 - staffIndex) × 1000 + midi`)

This unified model allows natural rectangular selection and predictable expand/contract behavior regardless of whether notes are in the same chord, different chords, or different staves. By computing a single numeric metric, we avoid special-case logic for "within chord" vs "cross-staff"—both are just steps in the vertical stack.

See [verticalStack.ts](../src/utils/verticalStack.ts) for the `calculateVerticalMetric()` formula and [KEYBOARD_NAVIGATION.md](./KEYBOARD_NAVIGATION.md#vertical-selection-cmd--shift--updown) for the full algorithm.

</details>

---

## 6a. Design Principles

<details>
<summary><strong>View principles with ADRs</strong></summary>

Key architectural decisions are documented as ADRs with explicit design principles:

| ADR | Principle | Summary |
|-----|-----------|--------|
| [ADR-001](./adr/001-vertical-selection.md) | Divide and Conquer | Per-slice vertical selection decomposition |
| [ADR-002](./adr/002-event-subscriptions.md) | Inversion of Control | Observer-based event subscriptions |
| [ADR-003](./adr/003-transaction-batching.md) | Atomicity | Unit of Work for batch operations |
| [ADR-004](./adr/004-api-factory-pattern.md) | Single Responsibility (SRP) | Domain-specific API factories |
| [ADR-005](./adr/005-selection-dispatch-pattern.md) | Command Pattern | Selection via dispatch, single source of truth |
| [ADR-006](./adr/006-synchronous-api-engine-access.md) | Least Astonishment (POLA) | API queries reflect immediate mutations |
| [ADR-007](./adr/007-open-closed-clef-reference.md) | Open-Closed (OCP) | Extensible clef support via reference pattern |

</details>

---

## 7. Layout Engine

Eight modules handle positioning and engraving.

<details>
<summary><strong>View modules</strong></summary>

| Module | Purpose |
|--------|---------|
| `index.ts` | Re-exports all layout functions |
| `types.ts` | Layout type definitions |
| `measure.ts` | Event positions, hit zones |
| `system.ts` | Multi-staff sync |
| `positioning.ts` | Pitch → Y coordinate |
| `beaming.ts` | Beam groups and angles |
| `tuplets.ts` | Bracket positions |
| `stems.ts` | Stem lengths |

### Pipeline

```mermaid
flowchart TD
    A[State update] --> B[Measure.tsx]
    B --> C[calculateMeasureLayout]
    B --> D[calculateBeamingGroups]
    B --> E[calculateChordLayout]
    C --> F[Render]
    D --> F
    E --> F
    F --> G[ChordGroup]
    F --> H[Beam]
    F --> I[Rest]
    F --> J[TupletBracket]
```

</details>

---

## 8. Hooks Reference

<details>
<summary><strong>View hook list</strong></summary>

### State Management

| Hook | Purpose |
|------|---------|
| `useRiffScore` | Config → initial score |
| `useScoreLogic` | Main state orchestration |
| `useScoreEngine` | Command dispatch |
| `useSelection` | Selection state |
| `useHistory` | Undo/redo stack |
| `useTransactionBatching` | Transaction batching & atomicity |

### Interaction

| Hook | Purpose |
|------|---------|
| `useNavigation` | Arrow key handling |
| `useNoteActions` | Add/delete notes |
| `useMeasureActions` | Add/delete measures |
| `useModifiers` | Duration, accidentals, ties |
| `useTupletActions` | Tuplet creation/removal |
| `useKeyboardShortcuts` | Global keyboard handler |
| `useScoreInteraction` | Drag/pitch operations |
| `useMeasureInteraction` | Hit zone detection |
| `useDragToSelect` | Lasso selection |

### Playback & Input

| Hook | Purpose |
|------|---------|
| `usePlayback` | Play/pause control |
| `useMIDI` | MIDI input handling |
| `useSamplerStatus` | Piano sample loading |

### Layout & Rendering

| Hook | Purpose |
|------|---------|
| `useAutoScroll` | Auto-scroll during playback |
| `useGrandStaffLayout` | Grand staff sync |
| `useMeasureLayout` | Measure layout calculation |
| `usePreviewRender` | Ghost note rendering |
| `useAccidentalContext` | Accidental visibility |

### UI Support

| Hook | Purpose |
|------|---------|
| `useEditorMode` | Note/rest mode toggle |
| `useEditorTools` | Tool orchestration |
| `useExport` | Export functionality |
| `useFocusTrap` | Toolbar focus management |
| `useModifierKeys` | Cmd/Ctrl key tracking |
| `useTitleEditor` | Title editing |
| `useAPISubscriptions` | Event listener management |

### Handler Modules (`hooks/handlers/`)

| Handler | Purpose |
|---------|---------|
| `handleMutation` | Accidentals, ties, transposition, delete |
| `handleNavigation` | Arrow key navigation |
| `handlePlayback` | Space bar playback toggle |

</details>

---

## 9. Command Reference

<details>
<summary><strong>View commands</strong></summary>

| Command | Purpose |
|---------|---------|
| `BatchCommand` | Composite command for atomic operations |
| `AddEventCommand` | Insert note/rest at position |
| `AddNoteToEventCommand` | Add note to chord |
| `ChangePitchCommand` | Change single note pitch |
| `DeleteEventCommand` | Remove entire event |
| `DeleteNoteCommand` | Remove note from chord |
| `LoadScoreCommand` | Load complete score |
| `MeasureCommands` | Add/delete measures |
| `RemoveTupletCommand` | Remove tuplet grouping |
| `SetGrandStaffCommand` | Switch to grand staff |
| `SetSingleStaffCommand` | Switch to single staff |
| `SetKeySignatureCommand` | Change key signature |
| `SetTimeSignatureCommand` | Change time signature |
| `TogglePickupCommand` | Toggle pickup measure |
| `ToggleRestCommand` | Convert note↔rest |
| `TransposeSelectionCommand` | Transpose selected notes |
| `TupletCommands` | Create tuplet groups |
| `UpdateEventCommand` | Update event properties |
| `UpdateNoteCommand` | Update note properties |
| `UpdateTitleCommand` | Change score title |

</details>

---

## 10. Dependencies

<details>
<summary><strong>View packages</strong></summary>

| Package | Purpose |
|---------|---------|
| [tonal](https://github.com/tonaljs/tonal) | Music theory |
| [tone](https://tonejs.github.io/) | Audio synthesis |
| react | UI framework |
| lucide-react | Icons |
| Bravura | SMuFL font |

</details>
