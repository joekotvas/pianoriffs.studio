# Phase 7A: Wire Existing Commands to API

## Goal
Connect 12+ existing Command classes to their corresponding API stubs, enabling full machine-addressability for score modification operations.

---

## Methods to Implement

### 1. `loadScore(score: Score)` — **Priority: High**
**Factory:** `io.ts`  
**Command:** `LoadScoreCommand`

```typescript
loadScore(newScore) {
  dispatch(new LoadScoreCommand(newScore));
  return this;
}
```

### 2. `deleteMeasure(measureIndex?: number)` — **Priority: High**
**Factory:** `modification.ts`  
**Command:** `DeleteMeasureCommand`

```typescript
deleteMeasure(measureIndex) {
  const idx = measureIndex ?? selectionRef.current.measureIndex ?? -1;
  if (idx >= 0) {
    dispatch(new DeleteMeasureCommand(idx));
  }
  return this;
}
```

### 3. `deleteSelected()` — **Priority: High**
**Factory:** `modification.ts`  
**Commands:** `DeleteEventCommand`, `DeleteNoteCommand`

Logic:
- If single note in chord → DeleteNoteCommand
- If full event or rest → DeleteEventCommand
- Multi-select → iterate selection

### 4. `setClef(clef)` — **Priority: High**
**Factory:** `modification.ts`  
**Command:** `SetClefCommand`

> [!IMPORTANT]
> Update signature to include `'alto' | 'tenor'` types

```typescript
setClef(clef: 'treble' | 'bass' | 'alto' | 'tenor' | 'grand') {
  dispatch(new SetClefCommand(clef, selectionRef.current.staffIndex));
  return this;
}
```

### 5. `setKeySignature(key: string)` — **Priority: High**
**Factory:** `modification.ts`  
**Command:** `SetKeySignatureCommand`

```typescript
setKeySignature(key) {
  dispatch(new SetKeySignatureCommand(key));
  return this;
}
```

### 6. `setTimeSignature(sig: string)` — **Priority: High**
**Factory:** `modification.ts`  
**Command:** `SetTimeSignatureCommand`

```typescript
setTimeSignature(sig) {
  dispatch(new SetTimeSignatureCommand(sig));
  return this;
}
```

### 7. `setMeasurePickup(isPickup: boolean)` — **Priority: Medium**
**Factory:** `modification.ts`  
**Command:** `TogglePickupCommand`

```typescript
setMeasurePickup(isPickup) {
  const measureIndex = selectionRef.current.measureIndex ?? 0;
  dispatch(new TogglePickupCommand(measureIndex, isPickup));
  return this;
}
```

### 8. `setStaffLayout(type)` — **Priority: Medium**
**Factory:** `modification.ts`  
**Commands:** `SetGrandStaffCommand`, `SetSingleStaffCommand`

```typescript
setStaffLayout(type) {
  if (type === 'grand') {
    dispatch(new SetGrandStaffCommand());
  } else {
    dispatch(new SetSingleStaffCommand('treble'));
  }
  return this;
}
```

### 9. `setScoreTitle(title: string)` — **Priority: Low**
**Factory:** `modification.ts`  
**Command:** `UpdateTitleCommand`

```typescript
setScoreTitle(title) {
  dispatch(new UpdateTitleCommand(title));
  return this;
}
```

### 10. `transpose(semitones: number)` — **Priority: Medium**
**Factory:** `modification.ts`  
**Command:** `TransposeSelectionCommand`

```typescript
transpose(semitones) {
  const sel = selectionRef.current;
  dispatch(new TransposeSelectionCommand(sel, semitones));
  return this;
}
```

### 11. `updateEvent(props)` — **Priority: Low**
**Factory:** `modification.ts`  
**Command:** `UpdateEventCommand`

```typescript
updateEvent(props) {
  const sel = selectionRef.current;
  if (sel.eventId && sel.measureIndex !== null) {
    dispatch(new UpdateEventCommand(
      sel.staffIndex,
      sel.measureIndex,
      sel.eventId,
      props
    ));
  }
  return this;
}
```

### 12. `export('abc' | 'musicxml')` — **Priority: Medium**
**Factory:** `io.ts`  
**Functions:** `generateABC()`, `generateMusicXML()`

```typescript
export(format) {
  const score = scoreRef.current;
  switch (format) {
    case 'json': return JSON.stringify(score, null, 2);
    case 'abc': return generateABC(score, score.bpm);
    case 'musicxml': return generateMusicXML(score);
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/api/modification.ts` | Wire 10 methods |
| `src/hooks/api/io.ts` | Wire export formats |
| `src/api.types.ts` | Add alto/tenor to setClef |
| `src/__tests__/ScoreAPI.modification.test.tsx` | New test file |

---

## Test Plan

```typescript
describe('ScoreAPI Modification Methods', () => {
  // Setup
  beforeEach(() => { /* render RiffScore */ });

  test('loadScore() replaces entire score', () => { ... });
  test('deleteMeasure() removes by index', () => { ... });
  test('deleteSelected() removes selected event', () => { ... });
  test('setClef() changes clef including alto/tenor', () => { ... });
  test('setKeySignature() changes key', () => { ... });
  test('setTimeSignature() changes time', () => { ... });
  test('transpose() shifts pitches by semitones', () => { ... });
  test('export("abc") returns valid ABC', () => { ... });
  test('export("musicxml") returns valid XML', () => { ... });
});
```

---

## Verification

- [ ] All 12 methods no longer return `// TODO`
- [ ] Each method dispatches correct command
- [ ] Tests cover happy path + edge cases
- [ ] api.types.ts status comments updated
- [ ] Lint passes
- [ ] All existing tests pass

## Code Standards (Boilerplate)

> **Goal**: Ensure maintainability and consistent quality across all new files.

### 1. JSDoc & Documentation
- **All public functions** must have JSDoc comments.
- **`@tested` annotation** must be used to link functions to their test file.
  ```typescript
  /**
   * Loads a new score into the engine.
   * @tested src/__tests__/ScoreAPI.modification.test.tsx
   */
  loadScore(newScore: Score): this
  ```

### 2. Type Safety
- **No `any` types.** Use specific types or generic constraints.
- **Strict Checks:** Ensure no implicit `any` in callback parameters.

### 3. Testing
- **New Modules:** 80%+ coverage required.
- **Factory Tests:** Test each method's connection to the command dispatch.

