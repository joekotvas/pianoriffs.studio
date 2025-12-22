# API Migration Narrative & Progress

> **Last Updated:** 2025-12-22
> **Status:** Phase 7 mostly complete (95% of API surface implemented)

## Overview

The goal of this migration is to transition RiffScore from a React-state-driven application to a **machine-addressable, engine-driven platform**. This enables headless operation, programmatic control, and cleaner architecture.

---

## 📖 The Journey So Far

### 1. The Foundation (Phases 0-1)
We started by defining the `MusicEditorAPI` interface and the Registry pattern (`window.riffScore.get(id)`). This broke the dependency on React component trees for accessing the score state.

<details>
<summary><strong>✅ Phase 0: Type Definitions</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/86">Issue #86</a> · <a href="https://github.com/joekotvas/RiffScore/pull/94">PR #94</a></summary>

- [x] Define `MusicEditorAPI` interface in [`api.types.ts`](../../src/api.types.ts)
- [x] Define `RiffScoreRegistry` interface
- [x] Verify TypeScript compilation
</details>

<details>
<summary><strong>✅ Phase 1: The Glue Layer</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/87">Issue #87</a> · <a href="https://github.com/joekotvas/RiffScore/pull/95">PR #95</a></summary>

- [x] Create [`useScoreAPI`](../../src/hooks/useScoreAPI.ts) hook
- [x] Modify `RiffScore.tsx` for Registry pattern
- [x] Write [`ScoreAPI.registry.test.tsx`](../../src/__tests__/ScoreAPI.registry.test.tsx) (15 tests)
- [x] Entry methods functional
- [x] Basic navigation
</details>

### 2. The Engine Room (Phases 2-4)
We moved logic out of UI components and into pure TypeScript engines.
- **Selection Engine:** Migrated complex selection logic (multi-select, range, vertical) to a Redux-like dispatch system.
- **Command Pattern:** Standardized all mutations into reversible Commands (`AddNoteCommand`, etc.).
- **Event System:** Implemented a robust `on('score', cb)` subscription model so external listeners stay in sync without React render cycles.
- **Transactions:** Added `beginTransaction()` / `commitTransaction()` to batch operations into single undo steps.

<details>
<summary><strong>✅ Phase 2: Selection Engine</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/89">Issue #89</a></summary>

- [x] Create `SelectionEngine.ts` with command dispatch pattern
- [x] Create all selection commands (Range, Toggle, SelectAll, Clear, etc.)
- [x] Migrate all `setSelection` calls to dispatch pattern ([Issue #100](https://github.com/joekotvas/RiffScore/issues/100))
- [x] Implement vertical selection — slice-based ([ADR-001](../adr/001-vertical-selection.md))
- [x] Testing enhancement ([Issue #112](https://github.com/joekotvas/RiffScore/issues/112))
</details>

<details>
<summary><strong>✅ Phase 3: Event Subscriptions</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/90">Issue #90</a></summary>

- [x] Implement `on(event, callback)` in useScoreAPI
- [x] Write `ScoreAPI.events.test.tsx`
- [x] Document [ADR-002](../adr/002-event-subscriptions.md)
- [x] **Fix:** Callbacks fire reliably ([Issue #122](https://github.com/joekotvas/RiffScore/issues/122))
</details>

<details>
<summary><strong>✅ Phase 4: Transaction Batching</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/91">Issue #91</a></summary>

- [x] Add batching to `ScoreEngine.ts`
- [x] Write `ScoreAPI.transactions.test.tsx`
- [x] Implement `useTransactionBatching` hook
- [x] Document [ADR-003](../adr/003-transaction-batching.md)
</details>

### 3. Refinement & Robustness (Phases 5-6)
With the engines in place, we hardened the implementation.
- **Factory Pattern:** Split the massive API hook into focused factories (`entry.ts`, `navigation.ts`, etc.) for maintainability.
- **Synchronous Access:** Fixed "stale closure" bugs by allowing the API to read directly from the engine state (`getScore()` reads `scoreRef.current` instantly).
- **Custom Staves:** Added full support for Alto/Tenor clefs and custom staff layouts, ensuring the engine handled non-standard score structures correctly.

<details>
<summary><strong>✅ Phase 5: Code Refactor</strong></summary>

- [x] **Component A:** `interaction.ts` modularization (facade pattern)
- [x] **Component B:** `hooks/api/` factory pattern ([ADR-004](../adr/004-api-factory-pattern.md))
- [x] **Component C:** Entry hook refactor & utils extraction
- [x] **Component D:** Selection handler consolidation ([ADR-005](../adr/005-selection-dispatch-pattern.md))
- [x] **Component E:** Maintenance & Stability (TS cleanup, tests)
</details>

<details>
<summary><strong>✅ Phase 6: Reliability & Features</strong></summary>

- [x] **Phase 6A:** Fix Stale `getScore()` ([ADR-006](../adr/006-synchronous-api-engine-access.md))
- [x] **Phase 6B:** Custom Staves & C-Clef Support ([ADR-007](../adr/007-open-closed-clef-reference.md))
</details>

---

## 🚀 Current Achievement: The API Surface (Phase 7)

We have now exposed almost the entire capabilities of the engines through the public API.

| Domain | Status | Highlights |
| :--- | :--- | :--- |
| **Navigation** | ✅ Complete | `selectAtQuant`, `jump`, `move` fully wired. |
| **Selection** | ✅ Complete | `selectRangeTo` (Shift+Click logic), `selectFullEvents` (chord fill). |
| **Entry** | ✅ Complete | Tuplet creation (`makeTuplet`) and ties (`toggleTie`) fully verified. |
| **Modification** | ✅ Mostly Done | `setPitch`, `setAccidental`, `setKeySignature` fully functional. |
| **Playback** | ✅ Integrated | `play`/`pause`/`setInstrument` wired to Tone.js engine (Phase 7D). |

<details>
<summary><strong>✅ Phase 7 Details (A-D)</strong></summary>

**7A: Wire Commands & Robustness**
- [x] Wired: `loadScore`, `export`, `deleteMeasure`, `deleteSelected`, `setClef`, `setKeySignature`, `setTimeSignature`, `transposeDiatonic`, `setStaffLayout`

**7B: Simple State Updates**
- [x] Wired: `setBpm`, `setTheme`, `setScale`, `setInputMode`, `setAccidental`, `reset`

**7C: Selection Enhancements**
- [x] Wired: `selectAtQuant`, `addToSelection`, `selectRangeTo`

**7D: Playback Integration**
- [x] Wired: `play`, `pause`, `stop`, `rewind`, `setInstrument`
</details>

**Recent Verification (Dec 22 2025):**
A deep code audit confirmed that complex methods like `makeTuplet` and `setPitch` are correctly dispatching their respective commands, moving them from "Pending" to "Implemented".

---

## 🏁 The Final Mile

We are in the final stretch. Only robustness hardening remains for v1.0.

### 1. Missing Command Wrappers (Phase 7E) ✅
All previously stubbed API methods are now fully implemented and tested.

<details>
<summary><strong>✅ Phase 7E: Remaining Stubs</strong></summary>

- [x] **`setDuration(duration)`**: Wired to `UpdateEventCommand` with multi-select support.
- [x] **`transpose(semitones)`**: Implemented `ChromaticTransposeCommand` using Tonal.js.
- [x] **`addMeasure(atIndex)`**: Updated `AddMeasureCommand` to support insertion at index.
- [x] **`rollbackTransaction()`**: Verified implementation in `history.ts`.
</details>

## 🛡️ Robustness & Stability (Phase 8 - v1.0 Candidate)

With the API surface complete, the focus shifts to hardening the implementation for a public v1.0 release.

### Goals for 1.0
- **Input Validation**: Methods should not fail silently on invalid input.
- **Unified Events**: Emit `on('batch')` for plugins to track compound operations.
- **Documentation**: Finalize Cookbook and API Reference.

> [!NOTE]
> Detailed error handling (breaking changes like `APIResult` return types) is deferred to v1.1 to preserve the fluent chaining API for the initial release.

- [ ] **Data Validation**: Add validation to critical methods (e.g., `setBpm` range, `addNote` pitch format).
- [ ] **Event Emission**: Implement `batch` event type in `ScoreEngine`.
- [ ] **Documentation**: Update [COOKBOOK.md](../COOKBOOK.md) with new 7E/D features.

---

## 🔮 Roadmap (Post-1.0 / Deferred)

### Phase 9: Advanced Features (v1.1+)
- [ ] **Clipboard API**: `copy`/`paste` (High complexity, requires serialization format design).
- [ ] **MIDI Integration**: `onMidi` input hook.
- [ ] **Keyboard Shortcuts**: Public API for triggering internal shortcuts.
- [ ] **Strict Error Handling**: Consider `APIResult<T>` return types (Breaking Change).

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    External Access                          │
│         window.riffScore.get(id) → MusicEditorAPI          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    useScoreAPI Hook                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             hooks/api/* Factories                    │   │
│  │  entry.ts │ navigation.ts │ selection.ts │ history.ts  │
│  │  modification.ts │ playback.ts │ io.ts │ events.ts    │
│  └─────────────────────────────────────────────────────┘   │
└──────────┬─────────────────────────────────────┬───────────┘
           │                                     │
           ▼                                     ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│    ScoreEngine          │       │   SelectionEngine       │
│   dispatch(Command)     │       │   dispatch(Command)     │
│   transactions          │       │   anchor tracking       │
│   undo/redo history     │       │   multi-note selection  │
└─────────────────────────┘       └─────────────────────────┘
           │                                     │
           └──────────────┬──────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Command Pattern                            │
│    AddNoteCommand │ RangeSelectCommand │ MoveNoteCommand   │
│    DeleteEventCommand │ ChangePitchCommand │ etc.          │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps

1. **Phase 8: Robustness Audit** (Validation & Events).
2. **Documentation Scrub** (Update for 7E features).
3. **v1.0 Release Candidate**.
