# Phase 7E: Remaining Stubs Implementation Specification

> Implements the final 3 incomplete API methods to reach full API surface coverage.

## Methods Overview

| Method | Current Status | Required Work |
|--------|---------------|---------------|
| `setDuration(duration, dotted?)` | ✅ Complete | Wired to `UpdateEventCommand` |
| `transpose(semitones)` | ✅ Complete | Created `ChromaticTransposeCommand` |
| `addMeasure(atIndex?)` | ✅ Complete | Updated `AddMeasureCommand` |

---

## 1. `setDuration(duration, dotted?)`

### Current State
```typescript
// src/hooks/api/modification.ts
setDuration(_duration, _dotted) {
  // TODO: Dispatch ChangeRhythmCommand
  return this;
},
```

### Implementation Strategy

**Use `UpdateEventCommand`** - already handles `duration` and `dotted` properties on events.

```typescript
setDuration(duration, dotted = false) {
  const sel = selectionRef.current;
  if (sel.measureIndex === null || sel.eventId === null) {
    console.warn('[RiffScore API] setDuration failed: No event selected');
    return this;
  }
  
  dispatch(new UpdateEventCommand(
    sel.measureIndex,
    sel.eventId,
    { duration, dotted },
    sel.staffIndex
  ));
  
  return this;
},
```

### Multi-Selection Support

For multi-selection, iterate through `selectedNotes` and update each unique event:

```typescript
if (sel.selectedNotes && sel.selectedNotes.length > 1) {
  ctx.history.begin();
  
  const processedEvents = new Set<string>();
  sel.selectedNotes.forEach(note => {
    const eventKey = `${note.staffIndex}-${note.measureIndex}-${note.eventId}`;
    if (processedEvents.has(eventKey)) return;
    processedEvents.add(eventKey);
    
    dispatch(new UpdateEventCommand(
      note.measureIndex,
      note.eventId,
      { duration, dotted },
      note.staffIndex
    ));
  });
  
  ctx.history.commit();
  return this;
}
```

### Files to Modify
- `src/hooks/api/modification.ts` - Implement method

---

## 2. `transpose(semitones)`

### Current State
```typescript
transpose(_semitones) {
  // TODO: Implement chromatic transposition
  return this;
},
```

### Analysis

**Existing:** `transposeDiatonic(steps)` uses `TransposeSelectionCommand` which calls `movePitchVisual()` for diatonic (visual) transposition.

**Required:** Chromatic transposition that moves by literal semitones regardless of key signature.

### Implementation Strategy

**Option A: Extend `TransposeSelectionCommand`** (Preferred)

Add a `mode` parameter to distinguish chromatic vs diatonic:

```typescript
// Keep existing command, add new ChromaticTransposeCommand
export class ChromaticTransposeCommand implements Command {
  constructor(
    private selection: Selection,
    private semitones: number
  ) {}
  
  execute(score: Score): Score {
    // Use Tonal.transpose() for chromatic
    const transposeFn = (pitch: string) => {
      const interval = Interval.fromSemitones(semitones);
      return Note.transpose(pitch, interval);
    };
    // ... same multi-selection logic as TransposeSelectionCommand
  }
}
```

**Option B: Use `movePitchChromatic()`** if it exists in MusicService.

### Check for Existing Chromatic Logic
```typescript
// Services/MusicService may have this
import { transpose } from '@tonaljs/note';
import { fromSemitones } from '@tonaljs/interval';
```

### Implementation in modification.ts

```typescript
transpose(semitones) {
  const sel = selectionRef.current;
  if (sel.measureIndex === null) return this;
  
  dispatch(new ChromaticTransposeCommand(sel, semitones));
  return this;
},
```

### Files to Create/Modify
- `src/commands/ChromaticTransposeCommand.ts` - **[NEW]** Create command
- `src/commands/index.ts` - Export new command
- `src/hooks/api/modification.ts` - Wire API method

---

## 3. `addMeasure(atIndex?)`

### Current State

```typescript
// AddMeasureCommand constructor - no index parameter
export class AddMeasureCommand implements Command {
  execute(score: Score): Score {
    // Always appends to end
    newMeasures.push(newMeasure);
  }
}
```

### Implementation Strategy

Modify `AddMeasureCommand` to accept optional insertion index:

```typescript
export class AddMeasureCommand implements Command {
  private insertedIndex: number = -1;
  
  constructor(private atIndex?: number) {}
  
  execute(score: Score): Score {
    const newStaves = score.staves.map((staff, staffIndex) => {
      const newMeasures = [...staff.measures];
      const newId = Date.now().toString() + '-' + staffIndex;
      this.addedMeasureIds[staffIndex] = newId;
      
      const newMeasure: Measure = { id: newId, events: [] };
      
      if (this.atIndex !== undefined && this.atIndex >= 0 && this.atIndex <= newMeasures.length) {
        // Insert at specific index
        this.insertedIndex = this.atIndex;
        newMeasures.splice(this.atIndex, 0, newMeasure);
      } else {
        // Append to end (default)
        this.insertedIndex = newMeasures.length;
        newMeasures.push(newMeasure);
      }
      
      return { ...staff, measures: newMeasures };
    });
    
    return { ...score, staves: newStaves };
  }
  
  undo(score: Score): Score {
    // Remove measure at insertedIndex
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      if (this.insertedIndex >= 0 && this.insertedIndex < newMeasures.length) {
        if (newMeasures[this.insertedIndex].id === this.addedMeasureIds[index]) {
          newMeasures.splice(this.insertedIndex, 1);
        }
      }
      return { ...staff, measures: newMeasures };
    });
    
    return { ...score, staves: newStaves };
  }
}
```

### Wire in modification.ts

```typescript
addMeasure(atIndex?) {
  dispatch(new AddMeasureCommand(atIndex));
  return this;
},
```

### Files to Modify
- `src/commands/MeasureCommands.ts` - Add constructor and index logic
- `src/hooks/api/modification.ts` - Pass atIndex to constructor

---

## Testing Plan

### setDuration Tests
```typescript
describe('setDuration', () => {
  test('changes duration of selected event');
  test('changes dotted state');
  test('handles multi-selection');
  test('returns this for chaining');
  test('warns on no selection');
});
```

### transpose Tests
```typescript
describe('transpose (chromatic)', () => {
  test('transposes up by semitones');
  test('transposes down by semitones');
  test('handles octave (+12)');
  test('respects selection');
  test('handles multi-selection');
});
```

### addMeasure Tests
```typescript
describe('addMeasure(atIndex)', () => {
  test('adds at end when no index');
  test('inserts at index 0');
  test('inserts in middle');
  test('inserts at end with explicit index');
  test('syncs across all staves');
  test('undo removes correct measure');
});
```

---

## Estimated Effort

| Method | Effort | Notes |
|--------|--------|-------|
| `setDuration` | 1 hour | Simple - existing command |
| `transpose` | 2 hours | New command, use Tonal |
| `addMeasure` | 1 hour | Modify existing command |
| **Tests** | 2 hours | ~15 new tests |
| **Total** | ~6 hours | |

---

## Implementation Order

1. **`setDuration`** - Quickest win, existing infrastructure
2. **`addMeasure`** - Command modification only
3. **`transpose`** - Requires new command creation
