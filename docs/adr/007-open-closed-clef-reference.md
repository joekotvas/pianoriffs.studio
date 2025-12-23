# ADR-007: Open-Closed Clef Reference Pattern

## Status
Accepted

## Context

RiffScore supports multiple clef types (treble, bass, alto, tenor, grand). Each clef positions notes differently on the staff—the same pitch (e.g., C4) appears at different vertical positions depending on the clef.

The original implementation used exhaustive lookup tables (`PITCH_TO_OFFSET`, `BASS_PITCH_TO_OFFSET`) that mapped every pitch to its staff position. This approach had several problems:

1. **Closed to extension**: Adding a new clef required creating an entirely new lookup table with ~50 entries.
2. **Maintenance burden**: Changes to positioning logic required updating multiple tables.
3. **Code duplication**: Conditional logic (`clef === 'bass' ? ... : ...`) was scattered across files.
4. **Incomplete coverage**: Files like exporters, commands, and hooks often only checked for bass clef, defaulting everything else to treble.

## Decision

Implement a **reference-based calculation pattern** where each clef defines only its reference point, and all other positions are computed dynamically.

```typescript
// Single source of truth for all clefs
const CLEF_REFERENCE = {
  treble: { pitch: 'C4', offset: 60 },  // C4 at offset 60 (ledger line below)
  bass:   { pitch: 'E2', offset: 60 },  // E2 at offset 60 (ledger line below)
  alto:   { pitch: 'C4', offset: 24 },  // C4 on Line 3 (middle line)
  tenor:  { pitch: 'C4', offset: 18 },  // C4 on Line 4
};

// Generic calculation function
function getOffsetForPitch(pitch: string, clef: string): number {
  const ref = CLEF_REFERENCE[clef] || CLEF_REFERENCE.treble;
  const refMidi = getMidi(ref.pitch);
  const pitchMidi = getMidi(pitch);
  const semitoneOffset = (refMidi - pitchMidi) * STAFF_SPACING_FACTOR;
  return ref.offset + semitoneOffset;
}
```

This design follows the **Open-Closed Principle (OCP)**:
- **Open for extension**: Add a new clef with a single line in `CLEF_REFERENCE`.
- **Closed for modification**: The calculation logic never changes.

## Consequences

### Positive
- **Trivial extensibility**: Adding percussion clef, baritone clef, etc. requires one line of configuration.
- **Single Source of Truth**: All clef-specific positioning comes from `CLEF_REFERENCE`.
- **Reduced maintenance**: No 50-entry lookup tables to maintain per clef.
- **Consistent behavior**: Same calculation applies everywhere, eliminating edge cases.

### Negative
- **Runtime calculation**: Minor performance cost vs. table lookup (negligible in practice).
- **Requires understanding**: Developers must understand the reference concept, not just read a table.

## Supporting Principles

- **Data-Driven Design**: Behavior derived from declarative configuration, not scattered switch statements.
- **DRY (Don't Repeat Yourself)**: One reference point per clef instead of exhaustive tables.
- **Single Responsibility**: `CLEF_REFERENCE` defines positioning; calculation functions derive positions.

## Related Files

- `src/engines/layout/positioning.ts` - `CLEF_REFERENCE` and `getOffsetForPitch()`
- `src/utils/verticalStack.ts` - `getRestMidi()` helper
- `src/commands/ToggleRestCommand.ts` - `getCenterPitch()` helper
- `src/exporters/musicXmlExporter.ts` - `getClefSign()`, `getClefLine()`
- `src/exporters/abcExporter.ts` - `getAbcClef()`
- `src/components/Canvas/ScoreHeader.tsx` - `getClefGlyph()`, `getClefY()`

## Related ADRs

- [ADR-006](./006-synchronous-api-engine-access.md) - Synchronous API Engine Access
