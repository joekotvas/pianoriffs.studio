# Phase 7C: Selection Enhancements Specification

> Implements 3 selection methods for API-based multi-selection control.

## Methods Overview

| Method | Factory | Command | Complexity |
|--------|---------|---------|------------|
| `selectAtQuant(measureNum, quant, staffIndex?)` | navigation.ts | SelectEventCommand | Medium |
| `addToSelection(measureNum, staffIndex, eventIndex)` | selection.ts | ToggleNoteCommand | Low |
| `selectRangeTo(measureNum, staffIndex, eventIndex)` | selection.ts | RangeSelectCommand | Low |

---

## Implementation Details

### 1. `selectAtQuant` (navigation.ts L154-157)

**Purpose**: Select event by rhythmic position (quant) within a measure.

**Current State**: Stub returning `this`.

**Implementation**:
```typescript
selectAtQuant(measureNum, quant, staffIndex = 0) {
  const measureIndex = measureNum - 1;
  const staff = scoreRef.current.staves[staffIndex];
  if (!staff?.measures[measureIndex]) return this;
  
  const measure = staff.measures[measureIndex];
  
  // Walk events to find event at quant position
  let currentQuant = 0;
  for (let i = 0; i < measure.events.length; i++) {
    const event = measure.events[i];
    const eventDuration = getNoteDuration(event.duration, event.dotted);
    
    if (currentQuant <= quant && quant < currentQuant + eventDuration) {
      // Found the event
      selectionEngine.dispatch(new SelectEventCommand({
        staffIndex,
        measureIndex,
        eventIndex: i,
        noteIndex: 0,
      }));
      selectionRef.current = selectionEngine.getState();
      break;
    }
    currentQuant += eventDuration;
  }
  return this;
}
```

**Dependencies**: `getNoteDuration` from `@/utils/core`.

---

### 2. `addToSelection` (selection.ts L14-16)

**Purpose**: Toggle a note in/out of multi-selection (Cmd+Click behavior).

**Current State**: Stub returning `this`.

**Implementation**:
```typescript
addToSelection(measureNum, staffIndex, eventIndex, noteIndex = 0) {
  const measureIndex = measureNum - 1;
  const staff = scoreRef.current.staves[staffIndex];
  const event = staff?.measures[measureIndex]?.events[eventIndex];
  if (!event) return this;
  
  const noteId = event.notes?.[noteIndex]?.id ?? null;
  
  selectionEngine.dispatch(new ToggleNoteCommand({
    staffIndex,
    measureIndex,
    eventId: event.id,
    noteId,
  }));
  selectionRef.current = selectionEngine.getState();
  return this;
}
```

**Dependencies**: `ToggleNoteCommand` already exists.

---

### 3. `selectRangeTo` (selection.ts L18-20)

**Purpose**: Select all notes from anchor to focus (Shift+Click behavior).

**Current State**: Stub returning `this`.

**Implementation**:
```typescript
selectRangeTo(measureNum, staffIndex, eventIndex, noteIndex = 0) {
  const measureIndex = measureNum - 1;
  const staff = scoreRef.current.staves[staffIndex];
  const event = staff?.measures[measureIndex]?.events[eventIndex];
  if (!event) return this;
  
  const noteId = event.notes?.[noteIndex]?.id ?? null;
  const anchor = selectionRef.current.anchor || {
    staffIndex: selectionRef.current.staffIndex,
    measureIndex: selectionRef.current.measureIndex,
    eventId: selectionRef.current.eventId,
    noteId: selectionRef.current.noteId,
  };
  
  selectionEngine.dispatch(new RangeSelectCommand({
    anchor,
    focus: { staffIndex, measureIndex, eventId: event.id, noteId },
  }));
  selectionRef.current = selectionEngine.getState();
  return this;
}
```

**Dependencies**: `RangeSelectCommand` already exists (uses `getLinearizedNotes`, `calculateNoteRange`).

---

## API Signature Updates

Update `api.types.ts` if needed:
```typescript
// Already defined, verify noteIndex parameter
addToSelection(measureNum: number, staffIndex: number, eventIndex: number, noteIndex?: number): this;
selectRangeTo(measureNum: number, staffIndex: number, eventIndex: number, noteIndex?: number): this;
```

---

## Testing Plan

### ScoreAPI.selection.test.tsx (expand existing or create)

1. **selectAtQuant**
   - Selects first event at quant 0
   - Selects middle event at quant 16
   - No-op for invalid quant (beyond measure)

2. **addToSelection**
   - Adds note to empty selection
   - Toggles note off when already selected
   - Maintains other selections when toggling

3. **selectRangeTo**
   - Selects range from anchor to focus (forward)
   - Selects range from anchor to focus (backward)
   - Uses current selection as anchor if none set

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/api/navigation.ts` | Implement `selectAtQuant` |
| `src/hooks/api/selection.ts` | Implement `addToSelection`, `selectRangeTo` |
| `docs/API.md` | Mark 3 methods ✅ |
| `docs/migration/progress.md` | Mark Phase 7C complete |
