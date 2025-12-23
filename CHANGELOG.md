# Changelog

All notable changes to RiffScore will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0-alpha.4] - 2025-12-23

### New Features & Enhancements

#### Machine-Addressable API
- **API Type Definitions**: Introduced `MusicEditorAPI` interface with ~50 method signatures, `RiffScoreRegistry`, and `APIEventType` types ([#94](https://github.com/joekotvas/RiffScore/pull/94), [#86](https://github.com/joekotvas/RiffScore/issues/86))
- **Registry Pattern**: Added `window.riffScore.get(id)` for external script access to editor instances via `useScoreAPI` hook ([#95](https://github.com/joekotvas/RiffScore/pull/95), [#87](https://github.com/joekotvas/RiffScore/issues/87))
- **Event Subscriptions**: `api.on('score'|'selection'|'batch', callback)` for reactive state observation ([#114](https://github.com/joekotvas/RiffScore/pull/114), [#90](https://github.com/joekotvas/RiffScore/issues/90))
- **Transaction Batching**: `beginTransaction`/`commitTransaction`/`rollbackTransaction` for atomic operations with single undo steps ([#115](https://github.com/joekotvas/RiffScore/pull/115), [#91](https://github.com/joekotvas/RiffScore/issues/91))

#### Selection Engine
- **SelectionEngine**: New synchronous state machine replacing scattered selection logic ([#97](https://github.com/joekotvas/RiffScore/pull/97), [#89](https://github.com/joekotvas/RiffScore/issues/89))
- **Selection Commands**: `ClearSelection`, `SelectAllInEvent`, `ToggleNote`, `RangeSelect`, `LassoSelect`, `SetSelection` ([#98](https://github.com/joekotvas/RiffScore/pull/98))
- **SelectAll with Progressive Expansion**: Cmd+A cycles through Event→Measure→Staff→Score scopes ([#105](https://github.com/joekotvas/RiffScore/pull/105), [#99](https://github.com/joekotvas/RiffScore/issues/99))
- **Vertical Selection**: Slice-based algorithm for Cmd+Shift+Up/Down cross-staff selection ([#105](https://github.com/joekotvas/RiffScore/pull/105), [#111](https://github.com/joekotvas/RiffScore/pull/111), [#101](https://github.com/joekotvas/RiffScore/issues/101))

#### API Methods Wired
- **Phase 7A**: `loadScore`, `export`, `deleteMeasure`, `deleteSelected`, `setClef`, `setKeySignature`, `setTimeSignature`, `transposeDiatonic`, `setStaffLayout` ([#144](https://github.com/joekotvas/RiffScore/pull/144), [#143](https://github.com/joekotvas/RiffScore/issues/143))
- **Phase 7B**: `setBpm`, `setTheme`, `setScale`, `setInputMode`, `setAccidental`, `reset` ([#145](https://github.com/joekotvas/RiffScore/pull/145))
- **Phase 7C**: `selectAtQuant`, `addToSelection`, `selectRangeTo`, `selectFullEvents` ([#147](https://github.com/joekotvas/RiffScore/pull/147), [#146](https://github.com/joekotvas/RiffScore/issues/146))
- **Phase 7D**: `play`, `pause`, `stop`, `rewind`, `setInstrument` with Tone.js integration ([#149](https://github.com/joekotvas/RiffScore/pull/149), [#148](https://github.com/joekotvas/RiffScore/issues/148))
- **Phase 7E**: `setDuration`, `transpose` (ChromaticTransposeCommand), `addMeasure(atIndex)` ([#151](https://github.com/joekotvas/RiffScore/pull/151), [#150](https://github.com/joekotvas/RiffScore/issues/150))

#### Clef Support
- **Alto & Tenor Clefs**: Full C-clef support with extensible `CLEF_REFERENCE` pattern, updated MusicXML/ABC exporters ([#142](https://github.com/joekotvas/RiffScore/pull/142))

#### Robustness & Observability
- **Input Validation**: Fail-soft validation for `addNote` (pitch), `setBpm` (range), `setDuration` (format), `setInstrument` (registry) ([#152](https://github.com/joekotvas/RiffScore/pull/152), [#153](https://github.com/joekotvas/RiffScore/pull/153))
- **Batch Events**: `on('batch')` event with `BatchEventPayload` for transaction observability ([#152](https://github.com/joekotvas/RiffScore/pull/152))

### Fixed
- **Stale `getScore()` Returns**: API queries now read directly from `ScoreEngine.getState()`, bypassing React's async render cycle ([#141](https://github.com/joekotvas/RiffScore/pull/141), [#140](https://github.com/joekotvas/RiffScore/issues/140))
- **Shift+Arrow Gap Resilience**: Selection no longer clears when navigating through ghost cursor gaps ([#105](https://github.com/joekotvas/RiffScore/pull/105), [#100](https://github.com/joekotvas/RiffScore/issues/100))
- **Subscription Callback Reliability**: Event callbacks now fire reliably with correct data ([#123](https://github.com/joekotvas/RiffScore/pull/123), [#122](https://github.com/joekotvas/RiffScore/issues/122))
- **Lasso Selection Offset**: Fixed offset on pickup measures ([#107](https://github.com/joekotvas/RiffScore/issues/107))
- **TypeScript Errors**: Resolved type errors and ESLint compliance issues ([#138](https://github.com/joekotvas/RiffScore/pull/138), [#139](https://github.com/joekotvas/RiffScore/pull/139), [#137](https://github.com/joekotvas/RiffScore/issues/137))
- **HitZone Type Safety**: Removed `any` types from HitZone parameter ([#132](https://github.com/joekotvas/RiffScore/issues/132))

### Refactoring
- **API Factory Pattern**: Split `useScoreAPI` into domain-specific factories (`entry.ts`, `navigation.ts`, `selection.ts`, `playback.ts`, etc.) ([#120](https://github.com/joekotvas/RiffScore/pull/120))
- **Interaction Modularization**: Extracted `interaction.ts` into navigation modules with facade pattern ([#118](https://github.com/joekotvas/RiffScore/pull/118), [#79](https://github.com/joekotvas/RiffScore/issues/79))
- **Entry Utilities Extraction**: Split entry hooks and extracted reusable utilities ([#128](https://github.com/joekotvas/RiffScore/pull/128)-[#130](https://github.com/joekotvas/RiffScore/pull/130), [#125](https://github.com/joekotvas/RiffScore/issues/125)-[#127](https://github.com/joekotvas/RiffScore/issues/127))
- **Selection Handler Consolidation**: Unified selection dispatch paths, deprecated direct `setSelection` calls ([#136](https://github.com/joekotvas/RiffScore/pull/136), [#135](https://github.com/joekotvas/RiffScore/issues/135))

### Documentation
- **7 New Documentation Pages**: [SELECTION.md](docs/SELECTION.md), [API.md](docs/API.md), [COOKBOOK.md](docs/COOKBOOK.md), [LAYOUT_ENGINE.md](docs/LAYOUT_ENGINE.md), [COMMANDS.md](docs/COMMANDS.md), [DATA_MODEL.md](docs/DATA_MODEL.md), [TESTING.md](docs/TESTING.md) ([#110](https://github.com/joekotvas/RiffScore/pull/110), [#88](https://github.com/joekotvas/RiffScore/issues/88))
- **8 Architecture Decision Records**:
    - ADR-001: Slice-based vertical selection ([#111](https://github.com/joekotvas/RiffScore/pull/111))
    - ADR-002: Event subscriptions observer pattern
    - ADR-003: Transaction batching unit of work
    - ADR-004: API factory pattern
    - ADR-005: Selection dispatch command pattern
    - ADR-006: Synchronous API engine access ([#141](https://github.com/joekotvas/RiffScore/pull/141))
    - ADR-007: Open-closed clef reference pattern ([#142](https://github.com/joekotvas/RiffScore/pull/142))
    - ADR-008: Observability patterns ([#152](https://github.com/joekotvas/RiffScore/pull/152))
- **Copilot Instructions**: Added `.github/copilot-instructions.md` and [QUALITY_CHECK.md](docs/QUALITY_CHECK.md) for LLM coding agents ([#104](https://github.com/joekotvas/RiffScore/pull/104), [#134](https://github.com/joekotvas/RiffScore/pull/134), [#103](https://github.com/joekotvas/RiffScore/issues/103))

### Testing
- **200+ New Tests**: Comprehensive coverage for SelectionEngine, API methods, validation utilities, and batch events
- **Selection Test Helpers**: Enhanced fixtures and test utilities for selection scenarios ([#113](https://github.com/joekotvas/RiffScore/pull/113), [#112](https://github.com/joekotvas/RiffScore/issues/112))
- **API Integration Tests**: Full test coverage for wired API methods ([#121](https://github.com/joekotvas/RiffScore/pull/121))

## [1.0.0-alpha.3] - 2025-12-19

### New Features & Enhancements
- **Unified Navigation**: Added seamless vertical navigation (CMD+Up/Down) with chord traversal, boundary cycling, and cross-staff switching ([#78](https://github.com/joekotvas/RiffScore/pull/78))
- **Ghost Cursor**: Enhanced ghost cursor behavior with cross-measure navigation and smart duration adjustments ([#78](https://github.com/joekotvas/RiffScore/pull/78))
- **Clef Handling**: Implemented `SetClefCommand` for robust single-staff clef changes and refactored staff control menu positioning ([#82](https://github.com/joekotvas/RiffScore/pull/82))
- **Visual improvements**: Improved `ClefIcon` rendering (especially for grand staff) and sizing ([#82](https://github.com/joekotvas/RiffScore/pull/82))

### Fixed
- **Staff Switching**: Ghost cursor now properly tracks staff context and switches correctly with keyboard commands ([#78](https://github.com/joekotvas/RiffScore/pull/78))
- **Clef Switching**: Fixed issue where switching single-staff clefs did not work ([#83](https://github.com/joekotvas/RiffScore/issues/83))
- **UI**: Score title now scales correctly with zoom level ([#77](https://github.com/joekotvas/RiffScore/pull/77))
- **Build**: Resolved various build warnings and cleaned up stale test mocks ([#73](https://github.com/joekotvas/RiffScore/issues/73), [#71](https://github.com/joekotvas/RiffScore/issues/71))

### Refactoring
- **Interaction Engine**: Major refactor of `interaction.ts` ([#79](https://github.com/joekotvas/RiffScore/issues/79), [#80](https://github.com/joekotvas/RiffScore/pull/80)):
    - Standardized default pitch logic with `getDefaultPitchForClef`
    - DRY extraction of ghost cursor and audio feedback helpers
    - Comprehensive JSDoc and `@tested` annotations
- **Type Safety**: Removed remaining `any` types in `types.ts` and `interaction.ts` for strict type checking ([#81](https://github.com/joekotvas/RiffScore/pull/81))

### Documentation
- **README**: Enhanced with status badges, new screenshots, and detailed feature list ([#76](https://github.com/joekotvas/RiffScore/pull/76))

## [1.0.0-alpha.2] - 2025-12-15

### Fixed

#### Playback
- **Pause/resume now works correctly** - Pressing pause and then play resumes from the current position instead of restarting from the beginning ([#64](https://github.com/joekotvas/RiffScore/issues/64))

#### Note Entry & Editing
- **Rest entry no longer crashes the app** - Fixed a regression where attempting to enter a rest would cause the application to crash ([#57](https://github.com/joekotvas/RiffScore/issues/57))
- **Browser refresh shortcut no longer triggers rest toggle** - CMD/CTRL+R now correctly refreshes the page without toggling rest mode ([#60](https://github.com/joekotvas/RiffScore/issues/60))
- **Arrow navigation after note entry works correctly** - Left arrow key no longer skips the newly entered note after committing with Enter ([#8](https://github.com/joekotvas/RiffScore/issues/8))

#### Mouse Interaction
- **Vertical note dragging restored** - Dragging notes up/down with the mouse to change pitch now works correctly again ([#9](https://github.com/joekotvas/RiffScore/issues/9))
- **Multi-note drag selection moves all selected notes** - Dragging a selection of notes now moves the entire selection, not just the targeted event ([#49](https://github.com/joekotvas/RiffScore/issues/49))
- **Note pitch clamping during drag** - Dragging notes past the visible staff range no longer allows invalid pitches ([#51](https://github.com/joekotvas/RiffScore/issues/51))

#### Selection
- **Individual note head selection visible again** - Fixed a regression where clicking on a single note head would not display the selection highlight ([#34](https://github.com/joekotvas/RiffScore/issues/34))
- **Shift+Arrow and Shift+Click now work for rests** - Extended range selection now correctly includes rest events ([#33](https://github.com/joekotvas/RiffScore/issues/33))
- **Lasso selection highlights notes during drag** - Notes now visually highlight as the lasso rectangle passes over them ([#32](https://github.com/joekotvas/RiffScore/issues/32))

#### UI & Theming
- **Auto-scroll behavior improved** - Scrolling is now less aggressive, allowing users to review other parts of the score without the viewport jumping back ([#14](https://github.com/joekotvas/RiffScore/issues/14))
- **Dark theme button contrast fixed** - Improved color contrast for accent buttons in dark mode for better accessibility ([#13](https://github.com/joekotvas/RiffScore/issues/13))
- **Footer theme syncs correctly** - Footer no longer stays in light theme when switching back to dark theme ([#3](https://github.com/joekotvas/RiffScore/issues/3))
- **Key signature menu reorganized** - Menu now includes all key signatures in a logical order (circle of fifths) ([#12](https://github.com/joekotvas/RiffScore/issues/12))
- **Help panel shortcuts updated** - Keyboard shortcuts in the help panel now reflect the current keybindings ([#59](https://github.com/joekotvas/RiffScore/issues/59))

### Changed
- **Build artifacts removed from version control** - The `dist/` directory is no longer tracked in Git; it is generated during the build process ([#53](https://github.com/joekotvas/RiffScore/issues/53))

### Documentation
- **Added CHANGELOG.md** - Introduced a changelog following the [Keep a Changelog](https://keepachangelog.com/) format to document all notable changes ([#69](https://github.com/joekotvas/RiffScore/issues/69))
- **Architecture documentation audited and updated** - Comprehensive review and updates to `ARCHITECTURE.md` and `INTERACTION.md` to reflect current codebase structure ([#67](https://github.com/joekotvas/RiffScore/issues/67))
- **File structure documentation corrected** - Updated `ARCHITECTURE.md` to match the current directory layout after repository restructuring ([#4](https://github.com/joekotvas/RiffScore/issues/4))

## [1.0.0-alpha.1]

Initial alpha release with core sheet music editing functionality:

- Grand staff, treble clef, and bass clef configurations
- Note entry via mouse click and keyboard
- Key signature and time signature selection
- Playback with Tone.js
- Undo/redo support
- Theme selection (dark, light, cool, warm)
- SMuFL-compliant engraving with Bravura font
