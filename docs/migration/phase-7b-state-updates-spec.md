# Phase 7B: Simple State Updates Specification

## Goal
Implement configuration, lifecycle, and simple modification methods to clear out low-complexity stubs in the API.

## Methods to Implement

### 1. Configuration (modification.ts)
Factory: `src/hooks/api/modification.ts`

| Method | Signature | Logic |
|--------|-----------|-------|
| `setBpm` | `setBpm(bpm: number)` | Dispatch `UpdateConfigCommand` or similar (check if exists, else direct state update via new command) |
| `setTheme` | `setTheme(theme: ThemeName)` | Update `config.ui.theme` via context/command |
| `setScale` | `setScale(scale: number)` | Update `config.ui.scale` via context/command |

**Note**: `UpdateConfigCommand` might need to be created if it doesn't exist, or we use `useRiffScoreConfig` context setters if exposed. Since we want undo/redo for some of these (BPM definitely, rendering metrics maybe?), we should route through `ScoreEngine` for score-related (BPM) and `ConfigContext` for UI-related.

*Correction*: `bpm` is on the `Score` object. `theme` and `scale` are UI state.
- `bpm`: Needs `UpdateScoreCommand` (or specific `SetBpmCommand`).
- `theme`, `scale`: These are likely outside the ScoreEngine undo stack, usually just React state in `RiffScoreConfig`. Access via `getConfig()` / `setConfig()` context if available, or expose setters in `APIContext`.

**Investigation Needed**: Check how `config` is updated.

### 2. Editor State (entry.ts)
Factory: `src/hooks/api/entry.ts`

| Method | Signature | Logic |
|--------|-----------|-------|
| `setInputMode` | `setInputMode(mode: 'note' \| 'rest')` | Call `ctx.setInputMode(mode)` (exposed from `useInputMode` or similar) |

### 3. Note Modification (modification.ts)
Factory: `src/hooks/api/modification.ts`

| Method | Signature | Logic |
|--------|-----------|-------|
| `setAccidental` | `setAccidental(type)` | `UpdateNoteCommand` (needs to handle multiple selection) |
| `toggleAccidental` | `toggleAccidental()` | Read current, cycle (sharp->flat->natural->null), dispatch `UpdateNoteCommand` |

### 4. Lifecycle (io.ts)
Factory: `src/hooks/api/io.ts`

| Method | Signature | Logic |
|--------|-----------|-------|
| `reset` | `reset(template?, measures?)` | `generateStaves(template, measures)` -> `dispatch(new LoadScoreCommand(newScore))` |

## Implementation Steps

1.  **Context & Hook Audit**:
    *   Update `APIContext` in `src/hooks/api/types.ts` to include:
        *   `setTheme(name: ThemeName): void`
        *   `setZoom(zoom: number): void`
        *   `setInputMode(mode: InputMode): void`
    *   Update `useScoreAPI.ts` to consume `useTheme()` and `ctx.tools` (from `ScoreContext`) and populate these new `APIContext` members.

2.  **Command Creation**:
    *   Create `src/commands/SetBpmCommand.ts` (Simple command to update `score.bpm`).
    *   Ensure `UpdateNoteCommand` can be used for accidentals (it can).

3.  **Implement Factories**:
    *   `src/hooks/api/modification.ts`:
        *   `setBpm` -> `dispatch(new SetBpmCommand(bpm))`
        *   `setTheme` -> `ctx.setTheme(theme)`
        *   `setScale` -> `ctx.setZoom(scale)`
        *   `setAccidental` -> Iterate selection, `dispatch(UpdateNoteCommand)` per note. Use `ctx.history.begin/commit` for atomicity.
        *   `toggleAccidental` -> Cycle logic + `UpdateNoteCommand`.
    *   `src/hooks/api/entry.ts`:
        *   `setInputMode` -> `ctx.setInputMode(mode)`
    *   `src/hooks/api/io.ts`:
        *   `reset` -> `generateStaves` -> `dispatch(LoadScoreCommand)`

4.  **Tests**:
    *   `src/__tests__/ScoreAPI.config.test.tsx` (BPM, Reset, InputMode, Theme, Scale)
    *   `src/__tests__/ScoreAPI.accidental.test.tsx` (Set, Toggle on single/multi selection)

## Code Standards
- Use `ctx.getScore()` / `ctx.getSelection()` for latest state.
- Return `this` for chaining.
- Validation: Clamp BPM (10-999), Scale (0.1-5.0).
