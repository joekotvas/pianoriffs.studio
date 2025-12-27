# Hooks Directory Structure

The `src/hooks/` directory is organized into 8 semantic modules plus 5 entry-point orchestrators at the root.

## Directory Overview

```
src/hooks/
├── api/          # External script API (window.riffScore)
├── audio/        # Playback, MIDI, sampler status
├── editor/       # Editor state, tools, and input modes
├── handlers/     # Keyboard event delegation
├── interaction/  # User input routing (navigation, selection, clicks)
├── layout/       # Visual rendering, scrolling, font loading
├── note/         # Note CRUD operations (Composition Hook pattern)
├── score/        # Score state engine and derived state
└── [root files]  # Main orchestrators
```

---

## Module Details

### `api/` — External Script API
Machine-addressable API for `window.riffScore` integration.

| File | Purpose |
|------|---------|
| `useScoreAPI.ts` | Registry and API object creation |
| `useAPISubscriptions.ts` | Event listener management |
| `useExport.ts` | JSON/ABC/MusicXML export |
| `navigation.ts` | API: `goto`, `select` |
| `selection.ts` | API: `selectAll`, `clearSelection` |
| `entry.ts` | API: `addNote`, `addRest` |
| `modification.ts` | API: `transpose`, `setDuration` |
| `history.ts` | API: `undo`, `redo`, transactions |
| `playback.ts` | API: `play`, `stop`, `setBpm` |
| `io.ts` | API: `getScore`, `setScore` |
| `events.ts` | API: event subscription |
| `types.ts` | API type definitions |

---

### `audio/` — Playback & MIDI
Sound generation and MIDI input handling.

| File | Purpose |
|------|---------|
| `usePlayback.ts` | Play/stop score, BPM control, position tracking |
| `useMIDI.ts` | MIDI device connection and note input |
| `useSamplerStatus.ts` | Sampler loading state |

---

### `editor/` — Editor State
Tool states, input modes, and keyboard modifiers.

| File | Purpose |
|------|---------|
| `useEditorTools.ts` | Duration, dot, accidental, rest toggle state |
| `useEditorMode.ts` | Derives mode ("SELECT", "INSERT") from context |
| `useModifiers.ts` | Handlers for duration/dot/accidental/tie toggles |
| `useModifierKeys.ts` | Tracks Shift/Cmd/Alt key states |
| `useAccidentalContext.ts` | Per-measure accidental context for rendering |

---

### `handlers/` — Keyboard Delegation
Pure functions that handle specific keyboard shortcut categories.

| File | Purpose |
|------|---------|
| `handlePlayback.ts` | Space/P → play/stop |
| `handleNavigation.ts` | Arrow keys → cursor movement |
| `handleMutation.ts` | Delete, duration, dot, accidental keys |

---

### `interaction/` — User Input Routing
Bundles navigation, focus, and mouse interaction hooks.

| File | Purpose |
|------|---------|
| `useInteraction.ts` | **Composition Hook**: bundles navigation + focus |
| `useNavigation.ts` | Arrow key movement, staff switching, transpose |
| `useKeyboardShortcuts.ts` | Global keyboard listener, routes to handlers |
| `useDragToSelect.ts` | Lasso/box selection on drag |
| `useMeasureInteraction.ts` | Mouse move/click within a measure |
| `useScoreInteraction.ts` | Wheel zoom, pitch drag across score |

---

### `layout/` — Visual Rendering
Layout calculations, scrolling, and font loading.

| File | Purpose |
|------|---------|
| `useMeasureLayout.ts` | Computes measure width, beaming, hit zones |
| `useGrandStaffLayout.ts` | Grand staff positioning (treble + bass) |
| `usePreviewRender.ts` | Ghost note rendering during hover |
| `useAutoScroll.ts` | Scroll canvas to keep selection visible |
| `useFontLoaded.ts` | Font loading state for FOUC prevention |
| `useFocusTrap.ts` | Traps focus within modals/dropdowns |

---

### `note/` — Note CRUD
Note entry, deletion, and editing operations.

| File | Purpose |
|------|---------|
| `useNoteActions.ts` | **Composition Hook**: bundles all note operations |
| `useNoteEntry.ts` | Add note/chord to measure |
| `useNoteEditing.ts` | Update pitch, delete notes |
| `useNoteDeletion.ts` | Remove notes and events |
| `useHoverPreview.ts` | Compute preview note from mouse position |

---

### `score/` — Score State Engine
Core state management and derived state utilities.

| File | Purpose |
|------|---------|
| `useScoreEngine.ts` | ScoreEngine instantiation |
| `useTransactionBatching.ts` | Begin/commit/rollback transactions |
| `useHistory.ts` | Undo/redo stack access |
| `useSelection.ts` | Selection state and SelectionEngine |
| `useDerivedSelection.ts` | Computed selection properties |
| `useToolsSync.ts` | Sync tools state with selection |
| `useFocusScore.ts` | Focus canvas and maintain preview |
| `types.ts` | Return types for useScoreLogic groups |

---

### Root Files — Entry Points

| File | Purpose |
|------|---------|
| `useScoreLogic.ts` | **Main orchestrator** — composes all hooks, provides grouped API |
| `useRiffScore.ts` | Config normalization, initial score setup |
| `useMeasureActions.ts` | Add/delete measure commands |
| `useTupletActions.ts` | Tuplet creation and modification |
| `useTitleEditor.ts` | Title input field state |

---

## Design Patterns

### Composition Hooks (ADR-010)
When multiple hooks share inputs and are used together, they are bundled:
- `useNoteActions` → bundles entry, editing, deletion, preview
- `useInteraction` → bundles navigation + focus

### Barrel Exports
Each subfolder has an `index.ts` that re-exports its public API:
```typescript
import { useInteraction } from '@/hooks/interaction';
import { usePlayback } from '@/hooks/audio';
```
