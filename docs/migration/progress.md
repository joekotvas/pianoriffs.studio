# API Migration Progress

**Last Updated:** 2025-12-21

---

## Summary

| Status | Phases |
| :--- | :--- |
| ✅ Complete | 0, 1, 2, 2b, 2c, 2d, 2e, 2f, 2g, 3, 4 |
| 🔲 Next | 5 (Code Refactor) |
| 🔲 Remaining | 5, 6, 7, 8 |

---

## Phase Details

### ✅ Phase 0: Type Definitions
- [x] Define `MusicEditorAPI` interface in [`api.types.ts`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/api.types.ts#47-196)
- [x] Define `RiffScoreRegistry` interface
- [x] Verify TypeScript compilation

### ✅ Phase 1: The Glue Layer
- [x] Create [`useScoreAPI`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useScoreAPI.ts#67-690) hook
- [x] Modify `RiffScore.tsx` for Registry pattern
- [x] Write [`ScoreAPI.registry.test.tsx`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/__tests__/ScoreAPI.registry.test.tsx) (15 tests)
- [x] Entry methods functional
- [x] Basic navigation

### ✅ Phase 2: Selection Engine
- [x] Create [`SelectionEngine.ts`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/engines/SelectionEngine.ts) (101 lines)
- [x] Create selection command types
- [x] Refactor [`useSelection.ts`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useSelection.ts) to use engine
- [x] Write tests (53 total: 17 engine + 14 command + 10 navigate + 12 hook)
- [x] Code review + cleanup
- [x] Add JSDoc to `select()` function

### ✅ Phase 2b: Selection Command Migration
- [x] Create `RangeSelectCommand` (Shift+click)
- [x] Create `ToggleNoteCommand` (Cmd+click)
- [x] Create `SelectAllInEventCommand`
- [x] Create `ClearSelectionCommand`
- [x] Refactor to dispatch-only pattern
- [x] Remove direct `engine.setState()` calls

> **Decision:** `engine.dispatch()` is the canonical pattern. Direct `setState()` deprecated.

### ✅ Phase 2c: External setSelection Migration
- [x] `useKeyboardShortcuts.ts` (3 → 0 calls)
- [x] `useMeasureActions.ts` (1 → 0 calls)
- [x] `useScoreAPI.ts` (7 → 0 calls)
- [x] `useScoreLogic.ts` (1 → 0 calls)
- [x] `ScoreCanvas.tsx` (3 → 0 calls)
- [x] `ScoreEditor.tsx` (1 → 0 calls)

> All production `setSelection` calls now use dispatch.

### ✅ Phase 2d: Selection Feature Expansion
- [x] Create [`SelectAllCommand.ts`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/commands/selection/SelectAllCommand.ts) with progressive expansion
- [x] Create [`SelectMeasureCommand.ts`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/commands/selection/SelectMeasureCommand.ts)
- [x] Add Cmd/Ctrl+A keyboard shortcut with scope escalation
- [x] Fix Shift+Arrow gap resilience (#100)
- [x] Implement `selectAll(scope)`, `selectEvent()`, `selectById()` in useScoreAPI
- [x] Add unit tests (17 tests)

### ✅ Phase 2e: Vertical Selection Refactor (Note-Based)
- [x] Rewrite [`ExtendSelectionVerticallyCommand`](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/commands/selection/ExtendSelectionVerticallyCommand.ts)
- [x] Update unit tests for note-based behavior
- [x] Verify pure note-based vertical selection

### ✅ Phase 2f: Slice-Based Vertical Selection
- [x] Implement slice-based anchor inference
- [x] Update command for per-slice behavior
- [x] Restore multi-event independence tests
- [x] Implement global cursor and cross-staff support (#101)

---

### ✅ Phase 2g: Testing Enhancement

**Goal:** Improve test reliability, coverage, and developer experience.

**Evaluation:** [testing_enhancement_evaluation.md](./testing_enhancement_evaluation.md)

#### Phase A: Infrastructure ✅
- [x] Install `@testing-library/user-event`
- [x] Install `eslint-plugin-testing-library` + configure
- [x] Create `setupTests.ts` with global jest-dom
- [x] Add coverage config (75% threshold) + `test:coverage` script

#### Phase B: Command Tests (14 files) ✅
- [x] Migrate pure command tests to new patterns

#### Phase C: Engine/API Tests (10 files) ✅
- [x] Migrate engine and API tests, add userEvent where applicable

#### Phase D: Hook/Component Tests (14 files) ✅
- [x] Migrate RTL tests to userEvent pattern

#### Phase E: Utility Tests (10 files) ✅
- [x] Migrate utility and integration tests

#### Phase F: Documentation ✅
- [x] Create `docs/TESTING_ANTIPATTERNS.md`
- [x] Update `docs/TESTING.md`
- [x] Update progress tracker

#### Deferred
- Property-based testing (fast-check)
- Visual regression (Playwright)
- E2E testing (Playwright)

---

### ✅ Phase 3: Event Subscriptions
- [x] Implement `on(event, callback)` in useScoreAPI
- [x] Write `ScoreAPI.events.test.tsx`
- [x] Document ADR 002

### ✅ Phase 4: Transaction Batching
- [x] Add batching to `ScoreEngine.ts`
- [x] Write `ScoreAPI.transactions.test.tsx`
- [x] Implement `useTransactionBatching` hook
- [x] Document ADR 003

### 🔄 Phase 5: Code Refactor (In Progress)

#### ✅ Component E: `useScoreLogic.ts` Slimming
- [x] Extract `useDerivedSelection.ts` (4 useMemo hooks)
- [x] Extract `useToolsSync.ts` (toolbar sync)
- [x] Extract `useFocusScore.ts` (focus logic)
- [x] Create grouped API types in `types.ts`
- [x] Remove 52 lines of flat exports
- [x] Update all consumers to grouped API
- [x] Fix error handling (throw vs console.error)
- [x] Memoize migration logic
- **Net reduction:** 154 lines

#### ✅ Component A: `interaction.ts` Modularization
- [x] Extract `previewNote.ts` (3 functions)
- [x] Extract `crossStaff.ts` (2 functions)
- [x] Extract `transposition.ts` (3 functions)
- [x] Extract `horizontal.ts` (3 functions, ~400 lines)
- [x] Extract `vertical.ts` (2 functions, ~450 lines)
- [x] Convert `interaction.ts` to facade
- [x] All tests passing

#### 🔲 Deferred (Future PRs)
- Component B: `hooks/api/`
- Component C: `hooks/entry/`
- Component D: Selection Handlers

### 🔲 Phase 6: Initial Documentation
- [ ] Finalize `docs/API.md`
- [ ] Finalize `docs/COOKBOOK.md`

### 🔲 Phase 7: Navigation Wiring
- [ ] Wire `move()` to `calculateNextSelection`
- [ ] Pass context from RiffScoreAPIBridge
- [ ] Test ghost cursor creation

### 🔲 Phase 8: Final Documentation
- [ ] Update `README.md`
- [ ] Update `ARCHITECTURE.md`
- [ ] Update all "See Also" sections


---

## Related Documents

- [Implementation Plan](./implementation_plan.md) – Technical specifications
- [API Reference Draft](./api_reference_draft.md) – API signatures
- [Documentation Strategy](./documentation_strategy.md) – Doc approach
- [Selection Model Brainstorm](./selection_model_brainstorm.md) – Design decisions
- [Interaction Model Analysis](./interaction_model_analysis.md) – Architecture analysis

---

## Notes

- Test files still use `setSelection` for setup (expected)
- `docs/API.md` and `docs/COOKBOOK.md` already exist (Phase 6 partially complete)
- Phase 5 (Interaction Refactor) marked as deferred in original plan
