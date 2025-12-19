# Changelog

All notable changes to RiffScore will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
