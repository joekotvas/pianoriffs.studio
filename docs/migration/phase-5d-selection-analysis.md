# Phase 5D: Selection Handler Consolidation

**Issue:** [#135](https://github.com/joekotvas/RiffScore/issues/135)  
**Status:** 🔄 In Progress  
**Date:** 2025-12-22

---

## Assessment Summary

| Location | Usage | Status | Action |
|----------|-------|--------|--------|
| `useSelection.ts` | `setSelection` wrapper (lines 294-301) | ⚠️ Deprecated, still exposed | Keep for backward compat |
| `useSelection.ts` | `updateSelection` (lines 246-249) | ⚠️ Deprecated | Keep for backward compat |
| `useSelection.ts` | `selectAllInMeasure` (lines 254-287) | ⚠️ Uses `engine.setState()` | Create command |
| `useNavigation.ts` | Props interface (line 17) | ✅ Not used | Remove from interface |
| `useNoteActions.ts` | Props interface (line 16) | ✅ Marked unused | Remove from interface |
| `useScoreLogic.ts` | Passes through (lines 129, 180, 205, 345) | ⚠️ Threading | Clean up unused refs |
| Test files | Setup/mocking | ✅ Acceptable | No action needed |

**Conclusion:** The codebase has already largely migrated to dispatch pattern. Remaining work is cleanup.

---

## Documentation Standards

Per [CONTRIBUTING.md](../CONTRIBUTING.md):

- **JSDoc** for all public functions, commands, and hooks
- **`@tested`** annotation linking to test file
- **`@example`** showing usage
- File-level documentation block

Per [TESTING.md](../TESTING.md):

- **100% test coverage** on new code
- Tests in `src/__tests__/` following naming conventions
- Use shared fixtures from `src/__tests__/fixtures/`

---

## Proposed Changes

### Priority 1: Remove Unused Props

#### [MODIFY] [useNavigation.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useNavigation.ts)
- Remove `setSelection` from `UseNavigationProps` interface (line 17)
- It's defined but never destructured or used

#### [MODIFY] [useNoteActions.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useNoteActions.ts)
- Remove `setSelection` from `UseNoteActionsProps` interface (line 16)
- Already marked as unused with `_setSelection`

#### [MODIFY] [useScoreLogic.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useScoreLogic.ts)
- Stop passing `setSelection` to hooks that don't use it
- Update calls to `useNavigation` and `useNoteActions`

---

### Priority 2: Create SelectAllInMeasureCommand

The `selectAllInMeasure` function in `useSelection.ts` uses `engine.setState()` directly.
Create a proper command for consistency.

#### [NEW] [SelectAllInMeasureCommand.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/commands/selection/SelectAllInMeasureCommand.ts)

```typescript
/**
 * SelectAllInMeasureCommand
 *
 * Selects all notes in a specified measure.
 *
 * @see Issue #135
 * @tested src/__tests__/commands/SelectAllInMeasureCommand.test.ts
 */
```

#### [NEW] [SelectAllInMeasureCommand.test.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/__tests__/commands/SelectAllInMeasureCommand.test.ts)
- 100% coverage required
- Test empty measure, single event, multiple events, rests

#### [MODIFY] [useSelection.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/hooks/useSelection.ts)
- Replace `engine.setState()` with `engine.dispatch(new SelectAllInMeasureCommand(...))`
- Add `@tested` annotation to `selectAllInMeasure`

#### [MODIFY] [src/commands/selection/index.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/commands/selection/index.ts)
- Export `SelectAllInMeasureCommand`

---

## Verification Plan

### Automated Tests

```bash
npm test -- --coverage --collectCoverageFrom='src/commands/selection/SelectAllInMeasureCommand.ts'
```

Expect 100% coverage on new command.

### Full Test Suite

```bash
npm test -- --no-coverage
```

All 627+ tests should pass.

### Type Check

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint
```

---

## Effort Estimate

| Task | Effort |
|------|--------|
| Remove unused props from interfaces | 30 min |
| Update useScoreLogic threading | 15 min |
| Create SelectAllInMeasureCommand with tests | 1 hr |
| Update useSelection to use command | 15 min |
| Add JSDoc and @tested annotations | 15 min |
| Verification | 15 min |
| **Total** | **~2.5 hours** |

---

## Success Criteria

- [ ] All new files have JSDoc with `@tested` annotations
- [ ] 100% test coverage on `SelectAllInMeasureCommand`
- [ ] No `setSelection` props in `useNavigation` or `useNoteActions` interfaces
- [ ] `selectAllInMeasure` uses dispatch pattern
- [ ] All existing tests pass
- [ ] No lint or TypeScript errors
