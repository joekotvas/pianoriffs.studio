# Phase 5C: Entry Hook Analysis

**Status:** ✅ Complete  
**Date:** 2025-12-21 (Completed 2025-12-22)  
**Focus:** DRY, organization, maintainability, command pattern compliance

---

## Assessment Summary

| Metric | Status | Score | Notes |
|--------|--------|-------|-------|
| **Command Pattern Compliance** | ✅ Good | 9/10 | All mutations use dispatch |
| **DRY (Don't Repeat Yourself)** | ⚠️ Needs Work | 6/10 | Duplication in note creation |
| **File Organization** | ⚠️ Needs Work | 5/10 | 500-line monolith |
| **Maintainability** | ⚠️ Moderate | 6/10 | Complex callbacks, mixed concerns |

**Overall Refactor Utility: Medium-High** — Worth doing but not urgent.

---

## Detailed Analysis

### 1. Command Pattern Compliance ✅ 9/10

**All mutations go through dispatch:**

```typescript
// useNoteActions.ts - Every mutation uses commands:
dispatch(new AddEventCommand(...));
dispatch(new AddNoteToEventCommand(...));
dispatch(new DeleteNoteCommand(...));
dispatch(new DeleteEventCommand(...));
dispatch(new ChangePitchCommand(...));
dispatch(new AddMeasureCommand());
```

**No direct state mutations found.** ✅

Minor gap: `setSelection` is passed as a prop but only used indirectly through `select()`.

---

### 2. DRY Violations ⚠️ 6/10

#### A. Note Creation Logic Duplicated

**In `useNoteActions.ts` (lines 279-305, 445-450):**
```typescript
const noteToAdd = {
  id: Date.now() + 1,
  pitch: newNote.pitch,
  accidental: activeAccidental,
  tied: activeTie,
};
```

**In `api/entry.ts` (lines 64-69, 155-160):**
```typescript
const note: Note = {
  id: noteId,
  pitch,
  accidental: null,
  tied: false,
};
```

**Fix:** Extract `createNotePayload(pitch, accidental, tied)` utility.

---

#### B. Measure Capacity Check Duplicated

**In `useNoteActions.ts` (lines 139, 156, 243-250):**
```typescript
if (!canAddEventToMeasure(measure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
```

**In `api/entry.ts` (lines 57-60, 113-116):**
```typescript
if (!canAddEventToMeasure(measure.events, duration, dotted)) {
```

**Status:** Already using shared utility ✅ — No action needed.

---

#### C. Preview Note Construction Duplicated

**In `useNoteActions.ts` (lines 164-177, 360-371):**
```typescript
const newPreview = {
  measureIndex: targetMeasureIndex,
  staffIndex,
  pitch: finalPitch,
  duration: activeDuration,
  // ... 10+ fields
};
```

**Fix:** Extract `createPreviewNote(params)` utility.

---

#### D. Pitch Calculation Logic

**In `useNoteActions.ts` (lines 108-127):**
```typescript
if (activeAccidental) {
  const note = Note.get(rawPitch);
  if (activeAccidental === 'sharp') finalPitch = `${note.letter}#${note.oct}`;
  // ...
} else {
  finalPitch = applyKeySignature(rawPitch, keySig);
}
```

**In vertical navigation (`interaction/vertical.ts`):** Similar logic exists.

**Fix:** Extract `resolvePitch(rawPitch, accidental, keySig)` utility.

---

### 3. File Organization ⚠️ 5/10

| File | Lines | Concern |
|------|-------|---------|
| `useNoteActions.ts` | **500** | ⚠️ Monolithic |
| `useMeasureActions.ts` | 74 | ✅ Focused |
| `useTupletActions.ts` | 167 | ✅ Focused |
| `api/entry.ts` | 201 | ✅ Focused |

**`useNoteActions.ts` does too much:**
1. Mouse hover preview (lines 85-208)
2. Note/rest insertion (lines 210-393)
3. Chord creation (lines 438-481)
4. Delete operations (lines 395-436)
5. Pitch updates (lines 483-490)

---

### 4. Refactor Recommendations

#### Priority 1: Extract Utilities (Low Effort, High Value)

Create `src/utils/entry/`:

```
src/utils/entry/
├── notePayload.ts      # createNotePayload()
├── previewNote.ts      # createPreviewNote()
└── pitchResolver.ts    # resolvePitch()
```

**Effort:** 2-3 hours  
**Impact:** Eliminates duplication, improves testability

---

#### Priority 2: Split `useNoteActions.ts` (Medium Effort, Medium Value)

```
src/hooks/note/
├── useHoverPreview.ts    # handleMeasureHover (~120 lines)
├── useNoteEntry.ts       # addNoteToMeasure, addChordToMeasure (~180 lines)
├── useNoteDelete.ts      # deleteSelected (~40 lines)
├── useNotePitch.ts       # updateNotePitch (~10 lines)
└── index.ts              # Re-export combined hook
```

**Effort:** 4-6 hours  
**Impact:** Improved maintainability, smaller files

---

#### Priority 3: Implement API Stubs (Medium Effort, High Value for API completeness)

Complete stubs in `api/entry.ts`:
- `makeTuplet()` — Use `ApplyTupletCommand`
- `unmakeTuplet()` — Use `RemoveTupletCommand`  
- `toggleTie()` — Create `ToggleTieCommand`
- `setInputMode()` — Wire to context

**Effort:** 3-4 hours  
**Impact:** Completes programmatic API

---

## Revised Phase 5C Scope

### Option A: Utilities Only (Recommended First Step)

1. Extract `createNotePayload()` utility
2. Extract `createPreviewNote()` utility
3. Update both `useNoteActions.ts` and `api/entry.ts` to use them

**Effort:** 2-3 hours  
**DRY Improvement:** 6/10 → 8/10

---

### Option B: Full Refactor

1. All of Option A
2. Split `useNoteActions.ts` into 4 smaller hooks
3. Implement API stubs

**Effort:** 8-10 hours  
**Organization Improvement:** 5/10 → 8/10

---

### Option C: Defer

Mark as low priority, address organically as files are touched.

---

## Command Pattern Compliance Checklist

| Hook | Uses dispatch? | Direct mutations? | Status |
|------|---------------|-------------------|--------|
| `useNoteActions` | ✅ All 6 commands | ❌ None | ✅ Compliant |
| `useMeasureActions` | ✅ All 6 commands | ❌ None | ✅ Compliant |
| `useTupletActions` | ✅ Both commands | ❌ None | ✅ Compliant |
| `api/entry.ts` | ✅ All commands | ❌ None | ✅ Compliant |

**All entry-related code uses the dispatch/command model.** ✅

---

## Files Analyzed

- `src/hooks/useNoteActions.ts` — 500 lines, needs splitting
- `src/hooks/useMeasureActions.ts` — 74 lines, clean
- `src/hooks/useTupletActions.ts` — 167 lines, clean
- `src/hooks/api/entry.ts` — 201 lines, has stubs

---

## Decision: Full Refactor (Option B) ✅

**Date:** 2025-12-21  
**Decision:** Proceed with full refactor

### Rationale

1. **Optimal Codebase Condition**  
   With the API migration substantially complete, now is the ideal time to ensure the codebase is in optimal condition before adding new features. Technical debt addressed now prevents compounding costs later.

2. **Test Coverage Opportunity**  
   Splitting `useNoteActions.ts` into focused modules enables comprehensive unit testing per [TESTING.md](../TESTING.md):
   - Smaller functions are easier to test in isolation
   - Extracted utilities can have dedicated test files
   - 75% coverage threshold easier to achieve with focused modules

3. **Documentation Standards**  
   Refactored code will conform to inline documentation standards from [CONTRIBUTING.md](../CONTRIBUTING.md):
   - JSDoc on all public functions
   - `@tested` annotations linking to test files
   - Clear separation of concerns aids documentation

4. **Eliminates Technical Debt**  
   - DRY violations fixed: 6/10 → 8/10
   - Organization improved: 5/10 → 8/10
   - 500-line monolith → 4 focused modules

### Scope

| Task | Effort | Priority |
|------|--------|----------|
| Extract `src/utils/entry/` utilities | 2-3 hrs | P1 |
| Split `useNoteActions.ts` → `hooks/note/` | 4-6 hrs | P1 |
| Add unit tests for new modules | 2-3 hrs | P1 |
| Implement API stubs in `api/entry.ts` | 3-4 hrs | P2 |
| Add JSDoc and `@tested` annotations | 1-2 hrs | P2 |

**Total Effort:** 12-18 hours

### Deliverables

1. **New Utilities:**
   ```
   src/utils/entry/
   ├── notePayload.ts      # createNotePayload()
   ├── previewNote.ts      # createPreviewNote()
   └── pitchResolver.ts    # resolvePitch()
   ```

2. **Refactored Hooks:**
   ```
   src/hooks/note/
   ├── useHoverPreview.ts
   ├── useNoteEntry.ts
   ├── useNoteDelete.ts
   ├── useNotePitch.ts
   └── index.ts
   ```

3. **Tests:**
   ```
   src/__tests__/
   ├── utils/entry/notePayload.test.ts
   ├── utils/entry/previewNote.test.ts
   ├── utils/entry/pitchResolver.test.ts
   └── hooks/note/*.test.tsx
   ```

4. **Updated API:**
   - `makeTuplet()` / `unmakeTuplet()` implemented
   - `toggleTie()` / `setTie()` implemented
   - `setInputMode()` implemented

### Success Criteria

- [x] All new files have JSDoc with `@tested` annotations
- [x] Unit tests achieve 80%+ coverage on new modules (100% on entry utils)
- [x] `useNoteActions.ts` replaced with facade re-exporting from `hooks/note/`
- [x] No DRY violations in note creation logic
- [x] API stubs implemented and tested
- [x] All existing tests pass


