# API Migration Progress

**Last Updated:** 2025-12-21

---

## Summary

| Status | Phases |
| :--- | :--- |
| ✅ Complete | 0, 1, 2, 2b, 2c, 2d, 2e, 2f |
| 🔲 Next | 2g (Testing Enhancement) |
| 🔲 Remaining | 3, 4, 5, 6, 7, 8 |

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

### 🔲 Phase 2g: Testing Enhancement (NEW)

**Goal:** Evaluate and implement enhanced testing capabilities to improve test reliability, coverage, and developer experience.

#### Evaluation Areas
- [ ] Assess current test infrastructure (`jest`, `@testing-library/react`)
- [ ] Evaluate snapshot testing for score state verification
- [ ] Consider visual regression testing for rendered output
- [ ] Explore property-based testing for selection logic
- [ ] Review test helper patterns and fixtures

#### Potential Improvements
- [ ] Create reusable test score builders
- [ ] Add test coverage reporting
- [ ] Implement E2E testing with Playwright/Cypress
- [ ] Create visual diff tooling for score rendering
- [ ] Add performance benchmarks for critical paths

#### Deliverables
- [ ] Testing enhancement proposal document
- [ ] Implementation of approved improvements
- [ ] Documentation updates to `TESTING.md`

---

### 🔲 Phase 3: Event Subscriptions
- [ ] Implement `on(event, callback)` in useScoreAPI
- [ ] Write `ScoreAPI.events.test.tsx`

### 🔲 Phase 4: Transaction Batching
- [ ] Add batching to `ScoreEngine.ts`
- [ ] Write `ScoreAPI.transactions.test.tsx`

### 🔲 Phase 5: Code Refactor
- [ ] Split `interaction.ts` (~1134 lines → 4 files)
- [ ] Split `useSelection.ts` (~349 lines → 3 files)

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
