# Read/Write API Exploration

> Feature exploration for implementing `read()` and `write()` API methods with ABC/MusicXML/JS object format support.

## Current State

RiffScore already has:
- `export(format)` → Returns `'json' | 'abc' | 'musicxml'` strings (whole score only)
- `loadScore(score)` → Replaces entire score with JS object
- `addNote(pitch, duration, dotted)` → Adds single note at cursor
- `reset(template, measures)` → Clears score to template

**Gap:** No range-based read/write. Can't read or write partial regions.

---

## Proposed API

### `write(input, options?)`

Write music content at the current cursor position.

```typescript
write(
  input: string | WritePayload,
  options?: WriteOptions
): this

// Input can be ABC string or structured JS object
type WritePayload = {
  events: Array<{
    duration: string;
    dotted?: boolean;
    notes: Array<{ pitch: string; accidental?: 'sharp' | 'flat' | 'natural' }>;
  }>;
};

interface WriteOptions {
  // How to handle existing content at cursor position
  mode?: 'insert' | 'overwrite';  // default: 'overwrite'
  
  // Which staff to write to (defaults to current selection)
  staffIndex?: number;
}
```

### `read(options?)`

Read music content from the score.

```typescript
read(options?: ReadOptions): string | Score | PartialScore

interface ReadOptions {
  // Start position (defaults to cursor if undefined)
  start?: {
    staff?: number;     // defaults to current staff
    measure: number;    // 1-based
    quant?: number;     // defaults to 0 (start of measure)
  };
  
  // End position (defaults to end of score)
  end?: {
    measure: number;    // 1-based
    quant?: number;     // defaults to end of measure
  };
  
  // Output format
  format?: 'abc' | 'musicxml' | 'json';  // default: 'json'
}
```

---

## Evaluation & Pushback

### 1. Naming: `read`/`write` vs Alternatives

**Your proposal:** `read()` / `write()`

**Alternatives considered:**
- `import()` / `export()` — Conflicts with ES6 `import` keyword; `export()` already exists
- `get()` / `set()` — Too generic, conflicts with getters
- `load()` / `store()` — `loadScore()` already exists
- `parse()` / `serialize()` — More about format conversion than data access
- `readRange()` / `writeRange()` — More explicit about range operation

**Recommendation:** Use **`read()` / `write()`**. Clean, intuitive, and standard I/O semantics. They're verbs that imply cursor-based streaming, which matches your vision.

### 2. Position Object: Flatten or Nest?

**Your proposal:**
```typescript
start: { staff, measure, quant }
end: { measure, quant }
```

**Alternative:** Flatten for simpler common cases:
```typescript
read({ measure: 1 })                      // Read measure 1
read({ measure: 1, endMeasure: 2 })       // Read measures 1-2
read({ measure: 1, quant: 0, endQuant: 960 })  // Read specific range
```

**Recommendation:** Keep **nested objects**. More verbose but:
- Cleaner separation of start vs end
- Extensible for future properties (e.g., `start: { voice, layer }`)
- Consistent with your quant-based selection model (Issue #162)

### 3. Default Staff Behavior

**Your proposal:** `start.staff` defaults to current selection

**Question:** Should `end` also support a different staff?

**Recommendation:** 
- `start.staff` defaults to current selection
- `end` inherits `start.staff` — cross-staff reads are a future enhancement
- For grand staff, reading both staves at once requires `staff: 'all'` or omitting staff

### 4. ABC Parsing: Input Format Detection

**Your proposal:** Accept either ABC string OR JS object

**Implementation consideration:** How to detect ABC vs JS?
```typescript
function isABC(input: unknown): input is string {
  // ABC strings start with metadata or notes
  return typeof input === 'string' && /^[XLTKMC]:|^[a-gA-GzZ]/.test(input.trim());
}
```

**Recommendation:** Use **simple type check** — if it's a string, parse as ABC. If it's an object, use directly. Don't over-engineer detection.

### 5. Chainability

Current API is fully chainable (`addNote('C4').addNote('D4').move('right')`).

**Question:** Should `read()` return `this` or the data?

**Recommendation:** `read()` **breaks the chain** and returns data. This is expected — read operations extract information, they don't mutate. Document clearly:
```typescript
// ✓ Correct
const abc = api.select(1).read({ format: 'abc' });

// ✗ Cannot chain after read()
api.select(1).read().addNote('C4'); // Type error
```

### 6. Relationship to Existing `export()`

Current `export(format)` returns whole-score output.

**Options:**
1. **Keep both** — `export()` for whole score (simple), `read()` for ranges
2. **Deprecate `export()`** — `read({ format })` is strictly more powerful
3. **Alias** — Make `export(format)` a shorthand for `read({ format })`

**Recommendation:** **Keep both** but document relationship:
```typescript
// Equivalent:
api.export('abc')
api.read({ format: 'abc' })  // reads entire score when no range specified
```

### 7. Write Behavior at Measure Boundaries

**Your Issue #161** describes auto-extending measures when writing past the end.

**Recommendation:** Align `write()` with that behavior:
- If content overflows current measure, auto-extend or tie across barlines
- If score ends, append measures as needed
- `mode: 'overwrite'` replaces existing content at cursor
- `mode: 'insert'` pushes existing content forward (complex for cross-measure)

### 8. Error Handling

**Question:** What happens when ABC parsing fails?

**Recommendation:** Return `this` for chainability but log warning:
```typescript
write(input) {
  try {
    const parsed = typeof input === 'string' ? parseABC(input) : input;
    // ... write logic
  } catch (e) {
    logger.warn(`[RiffScore API] write failed: ${e.message}`);
  }
  return this;
}
```

---

## Proposed Final API

```typescript
interface MusicEditorAPI {
  // ... existing methods ...
  
  /**
   * Write music content at cursor position.
   * 
   * @param input - ABC notation string or event array
   * @param options - Write behavior options
   * @returns this for chaining
   * 
   * @example
   * api.write('C D E F | G A B c')
   * api.write({ events: [{ duration: 'quarter', notes: [{ pitch: 'C4' }] }] })
   */
  write(input: string | WritePayload, options?: WriteOptions): this;
  
  /**
   * Read music content from the score.
   * 
   * @param options - Range and format options
   * @returns Score data in requested format
   * 
   * @example
   * const abc = api.read({ format: 'abc' })
   * const range = api.read({ start: { measure: 2 }, end: { measure: 4 } })
   */
  read(options?: ReadOptions): string | Score | PartialScore;
}
```

---

## Implementation Complexity

| Task | Effort | Dependency |
|------|--------|------------|
| ABC parser | High | External lib or custom |
| Range extractor | Medium | Quant math |
| Write at cursor | Medium | Issue #161 |
| Cross-measure ties | High | Issue #161 |
| MusicXML partial export | High | Existing exporter |

**Estimated total:** 3-5 days depending on ABC parser approach

---

## Open Questions for User

1. **ABC Parser:** Should we use an existing library (e.g., `abc2svg`, `abcjs`) or build minimal custom parser?
2. **MusicXML Import:** Is `write()` with MusicXML input in scope, or just ABC/JSON?
3. **Partial MusicXML Export:** Is range-based MusicXML export needed, or just ABC/JSON?

---

## Related Issues

- **Issue #161** — Improve addNote API (overwrite mode, cross-measure, auto-extend)
- **Issue #162** — Quant-based range selection and content inspection
- **Issue #166** — Simple ABC Notation Importing (MVP ABC parser)

---

## Next Steps

1. Implement ABC parser (Issue #166)
2. Create GitHub issue for `read()` / `write()` implementation
3. Implement in `src/hooks/api/io.ts` extending existing `createIOMethods`

