# API Migration Progress

**Last Updated:** 2025-12-21

---

## Summary

| Status | Phases |
| :--- | :--- |
| ✅ Complete | 0, 1, 2 (a-g), 3, 4, 5 (A, B, E) |
| � In Progress | 5 (remaining), 6, 7 |
| 🔲 Remaining | 8 |

**Goal:** Complete transition to a dispatch-based, engine-driven, fully exposed and machine-addressable API.

---

## Completed Phases

<details>
<summary><strong>✅ Phase 0: Type Definitions</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/86">Issue #86</a> · <a href="https://github.com/joekotvas/RiffScore/pull/94">PR #94</a></summary>

- [x] Define `MusicEditorAPI` interface in [`api.types.ts`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/api.types.ts)
- [x] Define `RiffScoreRegistry` interface
- [x] Verify TypeScript compilation
</details>

<details>
<summary><strong>✅ Phase 1: The Glue Layer</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/87">Issue #87</a> · <a href="https://github.com/joekotvas/RiffScore/pull/95">PR #95</a></summary>

- [x] Create [`useScoreAPI`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useScoreAPI.ts) hook
- [x] Modify `RiffScore.tsx` for Registry pattern
- [x] Write [`ScoreAPI.registry.test.tsx`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/__tests__/ScoreAPI.registry.test.tsx) (15 tests)
- [x] Entry methods functional
- [x] Basic navigation
</details>

<details>
<summary><strong>✅ Phase 2: Selection Engine (a-g)</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/89">Issue #89</a> · PRs <a href="https://github.com/joekotvas/RiffScore/pull/97">#97</a>, <a href="https://github.com/joekotvas/RiffScore/pull/98">#98</a>, <a href="https://github.com/joekotvas/RiffScore/pull/105">#105</a>, <a href="https://github.com/joekotvas/RiffScore/pull/113">#113</a></summary>

- [x] Create `SelectionEngine.ts` with command dispatch pattern
- [x] Create all selection commands (Range, Toggle, SelectAll, Clear, etc.)
- [x] Migrate all `setSelection` calls to dispatch pattern ([Issue #100](https://github.com/joekotvas/RiffScore/issues/100))
- [x] Implement vertical selection — slice-based ([ADR-001](../adr/001-vertical-selection.md))
- [x] Testing enhancement ([Issue #112](https://github.com/joekotvas/RiffScore/issues/112))

> **Decision:** `engine.dispatch()` is the canonical pattern. Direct `setState()` deprecated.
</details>

<details>
<summary><strong>✅ Phase 3: Event Subscriptions</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/90">Issue #90</a> · <a href="https://github.com/joekotvas/RiffScore/pull/114">PR #114</a></summary>

- [x] Implement `on(event, callback)` in useScoreAPI
- [x] Write `ScoreAPI.events.test.tsx`
- [x] Document [ADR-002](../adr/002-event-subscriptions.md)
- [x] **Fix:** Callbacks fire reliably ([Issue #122](https://github.com/joekotvas/RiffScore/issues/122) · [PR #123](https://github.com/joekotvas/RiffScore/pull/123))
</details>

<details>
<summary><strong>✅ Phase 4: Transaction Batching</strong> — <a href="https://github.com/joekotvas/RiffScore/issues/91">Issue #91</a> · <a href="https://github.com/joekotvas/RiffScore/pull/115">PR #115</a></summary>

- [x] Add batching to `ScoreEngine.ts`
- [x] Write `ScoreAPI.transactions.test.tsx`
- [x] Implement `useTransactionBatching` hook
- [x] Document [ADR-003](../adr/003-transaction-batching.md)
</details>

<details>
<summary><strong>✅ Phase 5: Code Refactor (A, B, E)</strong> — PRs <a href="https://github.com/joekotvas/RiffScore/pull/117">#117</a>, <a href="https://github.com/joekotvas/RiffScore/pull/118">#118</a>, <a href="https://github.com/joekotvas/RiffScore/pull/120">#120</a></summary>

- [x] **Component E:** `useScoreLogic.ts` slimming (−154 lines)
- [x] **Component A:** `interaction.ts` modularization (facade pattern)
- [x] **Component B:** `hooks/api/` factory pattern ([ADR-004](../adr/004-api-factory-pattern.md))
</details>

---

## Remaining Roadmap

### 🔄 Phase 5C: Entry Hook Consolidation

**Goal:** Consolidate entry-related hooks into a cohesive pattern.

| Task | Files | Priority |
|------|-------|----------|
| Audit entry-related hooks | `useNoteActions.ts`, `useMeasureActions.ts`, `useTupletActions.ts` | Medium |
| Identify duplication with `hooks/api/entry.ts` | — | Medium |
| Extract shared utilities or merge | — | Medium |
| Ensure all entry paths use dispatch | — | High |

### 🔄 Phase 5D: Selection Handler Consolidation

**Goal:** Ensure all selection mutations go through dispatch.

| Task | Files | Priority |
|------|-------|----------|
| Audit remaining `setSelection` calls | `useSelection.ts`, `useNavigation.ts` | High |
| Verify all production paths use dispatch | — | High |
| Test file usage is acceptable | Tests can use `setSelection` for setup | Info |

---

### 🔄 Phase 6: API Reliability

**Goal:** Fix known issues that prevent reliable programmatic usage.

| Issue | Severity | Status |
|-------|----------|--------|
| **[Issue #124](https://github.com/joekotvas/RiffScore/issues/124): Horizontal selection drops other staves** | High | 🔲 |
| **#1: `getScore()` returns stale data** | Medium | 🔲 |
| **#2: Entry methods don't work with custom staves** | Medium | 🔲 |
| **#3: Measure capacity validation untestable** | Low | Deferred |
| **#4: `addRest()` orphaned noteId** | Info | Deferred |

**Related:** [Issue #101](https://github.com/joekotvas/RiffScore/issues/101) (Cross-staff selection extension)

#### 6A: Fix Stale `getScore()` 
- [ ] Investigate `scoreRef.current` sync in `useScoreAPI`
- [ ] Ensure `getScore()` returns fresh data after mutations
- [ ] Add test: `addNote() → getScore() → verify event exists`

#### 6B: Fix Entry with Custom Staves
- [ ] Debug why `addNote()` fails with custom staves
- [ ] Add test: `config={{ score: { staves: [...] } }} → addNote() → verify`

---

### 🔄 Phase 7: API Completion — [Issue #119](https://github.com/joekotvas/RiffScore/issues/119)

**Goal:** Implement remaining API methods for full machine-addressability.

| Method | Factory | Status | Priority |
|--------|---------|--------|----------|
| `selectFullEvents()` | selection.ts | ✅ Impl, ❌ Not tested | Medium |
| `extendSelectionUp()` | selection.ts | ✅ Impl, ❌ Not tested | Medium |
| `extendSelectionDown()` | selection.ts | ✅ Impl, ❌ Not tested | Medium |
| `extendSelectionAll()` | selection.ts | ✅ Impl, ❌ Not tested | Medium |
| `copy()` / `cut()` / `paste()` | — | ⏳ Pending | Low |
| `play()` / `pause()` | playback.ts | ⏳ Stub | Low |
| `on('playback')` | events.ts | ⏳ Stub | Low |

#### 7A: Selection Expansion Tests
- [ ] Test `selectFullEvents()` 
- [ ] Test `extendSelectionUp/Down/All`
- [ ] Test `selectAll()` with different scopes

#### 7B: Clipboard API (Deferred)
- [ ] Implement `copy()`, `cut()`, `paste()`
- [ ] Wire to browser clipboard API

#### 7C: Playback API (Deferred)
- [ ] Complete `play()`, `pause()`, `stop()`
- [ ] Implement `on('playback')` event

---

### 🔲 Phase 8: Documentation & Polish — [Issue #93](https://github.com/joekotvas/RiffScore/issues/93)

**Goal:** Finalize all documentation for external consumption.

| Document | Status | Tasks |
|----------|--------|-------|
| `docs/API.md` | ✅ Mostly complete | Verify all methods documented |
| `docs/COOKBOOK.md` | ✅ Mostly complete | Add more recipes as needed |
| `docs/ARCHITECTURE.md` | 🔲 Needs update | Document engine architecture |
| `docs/TESTING.md` | ✅ Updated | — |
| `README.md` | 🔲 Needs update | Update for npm publish |

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
└──────────┬─────────────────────────────────────┬────────────┘
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

---

## Related Documents

- [API Test Coverage](./api_test_coverage.md) — Test status for each method
- [Implementation Plan](./implementation_plan.md) – Original technical specifications
- [API Reference Draft](./api_reference_draft.md) – API signatures
- [Testing Enhancement Evaluation](./testing_enhancement_evaluation.md) – Testing improvements

---

## Notes

- Test files still use `setSelection` for setup (expected and acceptable)
- `docs/API.md` and `docs/COOKBOOK.md` already exist and are mostly complete
- Playback and clipboard APIs are low priority (can be added post-1.0)

