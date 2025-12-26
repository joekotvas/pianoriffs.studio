# Exploratory Analysis: Object-Based API Parameters

## Overview

This document explores moving the RiffScore API from positional parameters to object-based parameters, evaluating tradeoffs, migration paths, and impact on existing code.

---

## Current API Style (Positional)

```javascript
// Selection
riffScore.select(1, 0, 2)                     // measure, staff, event
riffScore.selectAtQuant(1, 32, 0)             // measure, quant, staff
riffScore.addToSelection(1, 0, 2, 1)          // measure, staff, event, note

// Entry
riffScore.addNote('C4', 'quarter', true)      // pitch, duration, dotted
riffScore.makeTuplet(3, 2)                    // numNotes, inSpaceOf

// Transpose
riffScore.transpose(12)                        // semitones
riffScore.transposeDiatonic(7)                 // steps
```

---

## Proposed API Style (Object-Based)

```javascript
// Selection
riffScore.select({ measure: 1, staff: 0, event: 2 })
riffScore.selectAtQuant({ measure: 1, quant: 32, staff: 0 })
riffScore.addToSelection({ measure: 1, staff: 0, event: 2, note: 1 })

// Entry
riffScore.addNote({ pitch: 'C4', duration: 'quarter', dotted: true })
riffScore.makeTuplet({ count: 3, inSpaceOf: 2 })

// Transpose
riffScore.transpose({ semitones: 12 })
riffScore.transposeDiatonic({ steps: 7 })
// OR unified:
riffScore.transpose({ type: 'chromatic', amount: 12 })
riffScore.transpose({ type: 'diatonic', amount: 7 })
```

---

## Comparison

| Aspect | Positional | Object-Based |
|--------|-----------|--------------|
| **Brevity** | ✅ Compact | ❌ Verbose |
| **Readability** | ⚠️ Requires docs | ✅ Self-documenting |
| **Optional params** | ⚠️ Trailing only | ✅ Any position |
| **Extensibility** | ❌ Breaking change | ✅ Additive-only |
| **TypeScript DX** | ⚠️ Overloads | ✅ IntelliSense autocomplete |
| **Defaults** | ⚠️ Implicit | ✅ Explicit via destructuring |
| **Migration cost** | N/A | ⚠️ Breaking change |

---

## Pros of Object-Based

### 1. Self-Documenting Code
```javascript
// Positional: What do 1, 0, 2 mean?
riffScore.select(1, 0, 2)

// Object: Intent is clear
riffScore.select({ measure: 1, staff: 0, event: 2 })
```

### 2. Optional Parameters Anywhere
```javascript
// Positional: Can't skip staff to specify event
riffScore.select(1, undefined, 2)  // Awkward

// Object: Skip what you want
riffScore.select({ measure: 1, event: 2 })  // Clean
```

### 3. Future Extensibility
```javascript
// Adding new options doesn't break existing code
riffScore.addNote({
  pitch: 'C4',
  duration: 'quarter',
  // New features added later:
  articulation: 'staccato',
  dynamic: 'ff',
  voice: 2
})
```

### 4. Better TypeScript IntelliSense
Object parameters show all available options via autocomplete, reducing need to reference documentation.

### 5. Unified Method Signatures
```javascript
// Before: Two separate methods
riffScore.transpose(12)
riffScore.transposeDiatonic(7)

// After: One method, different options
riffScore.transpose({ type: 'chromatic', amount: 12 })
riffScore.transpose({ type: 'diatonic', amount: 7 })
```

---

## Cons of Object-Based

### 1. Verbosity for Simple Cases
```javascript
// Positional: Quick for common case
riffScore.addNote('C4')

// Object: More typing
riffScore.addNote({ pitch: 'C4' })
```

### 2. Breaking Change
All existing scripts and documentation would need updates.

### 3. Runtime Overhead
Object creation has minimal but non-zero cost (negligible for this use case).

### 4. Learning Curve
Users familiar with positional style need to learn new patterns.

---

## Method Categories by Impact

### Low Impact (0-1 params → object for consistency only)
| Method | Current | Proposed |
|--------|---------|----------|
| `move` | `'right'` | `{ direction: 'right' }` |
| `jump` | `'start-score'` | `{ target: 'start-score' }` |
| `selectAll` | `'measure'` | `{ scope: 'measure' }` |
| `transpose` | `12` | `{ semitones: 12 }` |
| `transposeDiatonic` | `7` | `{ steps: 7 }` |
| `setClef` | `'treble'` | `{ clef: 'treble' }` |

> **Recommendation**: Keep single-param methods as-is, or merge related methods.

### Medium Impact (2-3 params → clear benefit)
| Method | Current | Proposed |
|--------|---------|----------|
| `addNote` | `'C4', 'quarter', true` | `{ pitch, duration, dotted }` |
| `addRest` | `'quarter', true` | `{ duration, dotted }` |
| `makeTuplet` | `3, 2` | `{ count, inSpaceOf }` |
| `setDuration` | `'eighth', true` | `{ duration, dotted }` |
| `selectAtQuant` | `1, 32, 0` | `{ measure, quant, staff }` |

> **Recommendation**: Good candidates for object-based.

### High Impact (3-4 params → strong benefit)
| Method | Current | Proposed |
|--------|---------|----------|
| `select` | `1, 0, 2, 1` | `{ measure, staff, event, note }` |
| `addToSelection` | `1, 0, 2, 1` | `{ measure, staff, event, note }` |
| `selectRangeTo` | `1, 0, 2, 1` | `{ measure, staff, event, note }` |
| `selectEvent` | `1, 0, 2` | `{ measure, staff, event }` |
| `play` | `1, 32` | `{ measure, quant }` |

> **Recommendation**: Strong candidates for object-based.

---

## Hybrid Approach Option

Support both styles during migration:

```typescript
// Type definitions allow both
select(measureNum: number, ...): this;
select(options: SelectOptions): this;

// Implementation
select(measureOrOptions, staffIndex?, eventIndex?, noteIndex?) {
  if (typeof measureOrOptions === 'object') {
    const { measure, staff, event, note } = measureOrOptions;
    // ... handle object
  } else {
    // ... handle positional
  }
}
```

**Pros**: Non-breaking migration path
**Cons**: Dual maintenance, type complexity, documentation burden

---

## Proposed Type Definitions

```typescript
// Option objects for each category
interface SelectOptions {
  measure: number;        // 1-based
  staff?: number;         // Default: 0
  event?: number;         // Default: undefined (measure-level)
  note?: number;          // Default: undefined (event-level)
}

interface AddNoteOptions {
  pitch: string;          // Required: 'C4', 'F#5', etc.
  duration?: string;      // Default: 'quarter'
  dotted?: boolean;       // Default: false
  overwrite?: boolean;    // New: replace existing event
  voice?: number;         // Future: multi-voice support
}

interface TransposeOptions {
  type: 'chromatic' | 'diatonic';
  amount: number;         // Semitones or scale degrees
}

interface TupletOptions {
  count: number;          // Notes in group (e.g., 3)
  inSpaceOf: number;      // Normal note count (e.g., 2)
}

// Unified API
interface MusicEditorAPI {
  select(options: SelectOptions): this;
  addNote(options: AddNoteOptions): this;
  transpose(options: TransposeOptions): this;
  makeTuplet(options: TupletOptions): this;
  // ...
}
```

---

## Migration Recommendations

### Option A: Full Migration (v2.0)
1. **Create new type definitions** with object-based signatures
2. **Update all implementation files** in `hooks/api/*.ts`
3. **Rewrite COOKBOOK.md** with new syntax
4. **Update tests** to use new syntax
5. **Publish as major version** (breaking change)

**Timeline**: ~2-3 days
**Risk**: Breaking for all consumers

### Option B: Hybrid Migration
1. **Add overloaded signatures** supporting both styles
2. **Deprecate positional** with console warnings
3. **Update docs** to prefer object-based
4. **Remove positional in v3.0**

**Timeline**: ~1 day for hybrid, then gradual deprecation
**Risk**: Complexity during transition

### Option C: New Methods Only
1. Keep existing API unchanged
2. Add new object-based methods with different names:
   - `selectAt()` → `selectPosition()`
   - `addNote()` → `insertNote()`
3. Deprecate old methods over time

**Timeline**: ~1 day
**Risk**: API surface bloat during transition

---

## Recommendation

**Start with Option B (Hybrid)** for the high-impact methods:
- `select()`
- `addNote()`
- `addToSelection()`
- `selectRangeTo()`

This provides:
- Non-breaking introduction
- Validates the pattern with real usage
- Clear migration path to v2.0

**Keep simple methods positional**:
- `move('right')` is clear enough
- `transpose(12)` is intuitive
- Single-enum methods don't benefit from objects

---

## Open Questions

1. **Naming convention**: `{ measure: 1 }` or `{ measureNum: 1 }` (matching 1-based)?
2. **Method consolidation**: Merge `transpose()` + `transposeDiatonic()` into one?
3. **Shorthand support**: Allow `riffScore.addNote('C4')` as shorthand for `{ pitch: 'C4' }`?
4. **Overwrite behavior**: Should `addNote` have an explicit `mode: 'insert' | 'overwrite'`?
5. **Unified `.add()` method**: Could overload a single `add()` to accept both ABC notation strings and objects, enabling:
   ```javascript
   // ABC string input for quick entry
   riffScore.add("C4")           // single note
   riffScore.add("z")            // rest
   riffScore.add("C4.")          // dotted note
   riffScore.add("^F4")          // sharp
   riffScore.add("[CEG]")        // chord
   
   // Object input for full control
   riffScore.add({ pitch: 'C4', duration: 'quarter', dotted: true })
   riffScore.add({ rest: true, duration: 'half' })
   riffScore.add({ chord: ['C4', 'E4', 'G4'], duration: 'whole' })
   ```
   This would provide the terseness of ABC with the extensibility of objects in one versatile method.

---

## Related Files

- [api.types.ts](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/src/api.types.ts) - Current API interface
- [COOKBOOK.md](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/docs/COOKBOOK.md) - Recipe documentation
- [API.md](file:///Users/josephkotvas/Sites/Riffs/riffeasy/riffscore/docs/API.md) - API reference
