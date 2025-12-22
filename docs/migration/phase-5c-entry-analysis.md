# Phase 5C: Entry Hook Analysis

**Status:** Proposed  
**Date:** 2025-12-21  
**Related Issue:** Create tracking issue if proceeding

---

## Executive Summary

**Recommendation:** Phase 5C scope should be **reduced or deferred**. The entry-related hooks serve distinct purposes and consolidating them would increase coupling without significant benefit.

---

## Current State Analysis

### Entry-Related Files

| File | Lines | Purpose | Calls dispatch? |
|------|-------|---------|-----------------|
| `hooks/api/entry.ts` | 201 | **Programmatic API** (`addNote`, `addRest`, `addTone`) | ✅ Yes |
| `hooks/useNoteActions.ts` | 500 | **UI interaction handlers** (mouse hover, click, preview) | ✅ Yes |
| `hooks/useMeasureActions.ts` | 74 | **Measure-level UI** (time sig, key sig, add/remove) | ✅ Yes |
| `hooks/useTupletActions.ts` | 167 | **Tuplet operations** (apply, remove, query) | ✅ Yes |
| `hooks/entry/` | 0 | **Empty directory** | — |

### Key Observations

#### 1. Different Domains

```
api/entry.ts              → External programmatic access (fluent API)
useNoteActions.ts         → Internal UI event handling (mouse, preview)
useMeasureActions.ts      → Measure config UI (toolbar actions)
useTupletActions.ts       → Tuplet-specific operations
```

#### 2. `useNoteActions` Has UI-Specific Logic

```typescript
// Example: Preview note handling (not applicable to API)
const handleMeasureHover = useCallback((
  measureIndex,
  hit,           // ← UI hit detection
  pitch,
  staffIndex
) => {
  const appendPosition = getAppendPreviewNote(...);  // ← Preview rendering
  setPreviewNote({ ... });  // ← Visual feedback
}, [...]);
```

#### 3. `api/entry.ts` Is Already Clean

The API factory already uses the command pattern correctly:
- Validates input
- Dispatches `AddEventCommand` / `AddNoteToEventCommand`
- Updates selection via `syncSelection`
- No UI concerns

#### 4. No Duplication

The hooks don't duplicate logic—they operate at different abstraction levels:
- **API:** "Add note C4 at cursor" → dispatch command
- **UI hooks:** "Mouse at Y=150 → calculate pitch → show preview → on click → dispatch command"

---

## Stubs in `api/entry.ts`

The following methods are unimplemented stubs:

| Method | Status | Implementation Path |
|--------|--------|---------------------|
| `makeTuplet()` | ⏳ Stub | Use `ApplyTupletCommand` from `useTupletActions` |
| `unmakeTuplet()` | ⏳ Stub | Use `RemoveTupletCommand` from `useTupletActions` |
| `toggleTie()` | ⏳ Stub | Create `ToggleTieCommand` |
| `setTie()` | ⏳ Stub | Create `SetTieCommand` |
| `setInputMode()` | ⏳ Stub | Expose through API context |

---

## Revised Scope Options

### Option A: Defer Phase 5C Entirely ✅ Recommended

**Rationale:** The hooks are already well-organized. No architectural debt requires immediate attention.

**Actions:**
1. Mark Phase 5C as "Not Needed" in progress.md
2. Track stub implementations in Phase 7 (API Completion) with [Issue #119](https://github.com/joekotvas/RiffScore/issues/119)

---

### Option B: Minimal Scope — Implement Stubs Only

**Rationale:** Complete the API surface without restructuring existing hooks.

**Actions:**
1. Implement `makeTuplet()` / `unmakeTuplet()` in `api/entry.ts`
2. Implement `toggleTie()` / `setTie()` in `api/entry.ts`
3. Implement `setInputMode()` if API-accessible mode switching is needed

**Effort:** ~2 hours

---

### Option C: Extract Shared Utilities (Optional Future Work)

If later analysis reveals duplicated validation or calculation logic, extract to:

```
src/utils/entry/
├── pitchValidation.ts    # isValidPitch, parsePitch
├── measureCapacity.ts    # canAddEventToMeasure
└── noteCreation.ts       # createNotePayload
```

**Current Status:** These utilities already exist in `utils/validation.ts` and `utils/core.ts`. No action needed.

---

## Recommendation

**Proceed with Option A (Defer)** and update progress.md:

```diff
- ### 🔄 Phase 5C: Entry Hook Consolidation
+ ### ✅ Phase 5C: Entry Hook Analysis — Deferred
+ 
+ **Result:** Analysis showed hooks serve distinct purposes (API vs UI).
+ No consolidation needed. Stub implementations tracked in Phase 7.
```

---

## Files Reviewed

- `src/hooks/api/entry.ts` — API factory (clean, uses commands)
- `src/hooks/useNoteActions.ts` — UI handlers (mouse, preview, click)
- `src/hooks/useMeasureActions.ts` — Toolbar actions (clean, uses commands)
- `src/hooks/useTupletActions.ts` — Tuplet operations (clean, uses commands)
