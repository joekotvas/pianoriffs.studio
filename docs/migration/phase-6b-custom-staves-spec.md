# Phase 6B: Custom Staves & C-Clef Support

## Goal
Establish general readiness for custom staves and non-standard clefs.
1.  **Entry Logic Reliability**: Ensure entry methods work on any valid staff index (1, 3+, etc.).
2.  **Alto/Tenor Clef Support**: Implement moveable C-clefs as first-class options in the UI and rendering engine.
3.  **Engine Robustness**: Ensure pitch calculations use dynamic reference-based calculation, not hardcoded lookup tables.

## Verification Checklist

- [x] **Data**: `alto` and `tenor` types and constants defined.
- [x] **UI**: Alto/Tenor clefs selectable and render correctly (distinct positions).
- [x] **Logic**: `addNote('C4')` on Alto staff places note on Line 3, Tenor on Line 4.
- [x] **Exporters**: MusicXML and ABC export correct clef signs/lines.
- [x] **Commands**: ToggleRestCommand uses clef-aware center pitch.
- [x] **Quality**: Lint passes, 28 new tests with exception paths.
- [x] **Regression**: Standard Grand Staff behavior unchanged.

## Implementation Summary

### Data Model
- `types.ts`: Added `'tenor'` to `Staff.clef` union
- `constants.ts`: Added `tenor` to `CLEF_TYPES`, `KEY_SIGNATURE_OFFSETS`
- `positioning.ts`: Added `CLEF_REFERENCE` (alto: offset 24, tenor: offset 18)

### UI
- `ClefIcon.tsx`: Distinct Y positions for alto/tenor
- `ClefOverlay.tsx`: Added tenor option
- `ScoreHeader.tsx`: `getClefGlyph()`, `getClefY()` helpers

### Core Logic Fixes
- `musicXmlExporter.ts`: C-clef sign/line export
- `abcExporter.ts`: `clef=alto`, `clef=tenor` export
- `ToggleRestCommand.ts`: `getCenterPitch()` for all clefs
- `useFocusScore.ts`: `getDefaultPitchForClef()` import
- `verticalStack.ts`: `getRestMidi()` helper

### Tests
- `musicXmlExporter.test.ts` (8 tests)
- `abcExporter.test.ts` (9 tests)
- `ToggleRestCommand.test.ts` (11 tests)

