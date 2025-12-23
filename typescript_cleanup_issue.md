# TypeScript Cleanup Tracking

**Status**: In Progress / Review
**Branch**: `refactor/137-typescript-cleanup`

## Objectives
- [x] Fix type mismatch in `src/utils/entry/previewNote.ts` vs `src/types.ts` (`PreviewNote.source`).
- [x] Fix `HitZone` type mismatch in `ScoreCanvas.tsx` interaction handlers.
- [x] Update `ScoreEvent` mocks in `__tests__/core.test.ts` to remove invalid `quant` property.
- [x] Update `Selection` mocks in `__tests__/core.test.ts` to include `staffIndex` and `selectedNotes`.
- [x] Fix syntax errors in `core.test.ts` (`reflowScore` tests).
- [x] Ensure `npx tsc --noEmit` passes cleanly.
- [x] Verify `core.test.ts` passes.

## Details
- **`HitZone` Logic Update**: We clarified the usage of `HitZone` in `useMeasureInteraction` and `ScoreCanvas`. "Gap hits" (hovering in empty space) now pass `null` instead of an ad-hoc object, ensuring strict type compliance.
- **Test Integrity**: Test mocks were significantly updated to reflect the current `ScoreEvent` and `Selection` interfaces. Expectations in `navigateSelection` were updated to match the implicit ID generation logic (`note-e1` vs `n1`).

## Remaining
- [ ] Merge to `develop` / `main` after review.
