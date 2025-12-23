# The Machine-Addressable API: A Migration Story

> **Status:** Phase 8 Complete (v1.0.0-alpha.4 Candidate)
> **Timeframe:** December 15-23, 2025 (~8 days)
> **Scope:** 36 PRs merged, 33 issues closed, 8 ADRs documented

---

## The Vision

RiffScore began as a React-first sheet music editor. It worked well for interactive use, but external scripts and plugins couldn't control the editor without diving into React internals.

The goal was straightforward: expose a JavaScript API that external code could call:

```javascript
const api = window.riffScore.get('my-editor');
api.select(1).addNote('C4').addNote('E4').addNote('G4').play();
```

This document chronicles what we built, what worked, and where the rough edges remain.

---

## Phase 0-1: Laying the Foundation

**December 15-19, 2025**

### What We Did

We started by defining the complete API interface before writing implementation code.

- **[PR #94](https://github.com/joekotvas/RiffScore/pull/94)** introduced `api.types.ts` with ~50 method signatures ([Issue #86](https://github.com/joekotvas/RiffScore/issues/86)).
- **[PR #95](https://github.com/joekotvas/RiffScore/pull/95)** built the Registry pattern and `useScoreAPI` hook ([Issue #87](https://github.com/joekotvas/RiffScore/issues/87)).

### Where It's Rough

The upfront type definitions looked comprehensive, but many assumptions were wrong. As we implemented methods, we discovered:
- Some method signatures needed to change (e.g., `select()` gained a fourth parameter)
- The original grouping didn't match how the code naturally organized
- **3 methods remain true stubs** (`copy`, `cut`, `paste`)—they compile but do nothing
- **16 `@status` annotations were stale**—methods were implemented but never updated (fixed in this audit)

The Registry pattern works, but there's no cleanup when components unmount unexpectedly. Orphaned registrations could accumulate.

---

## Phase 2: The Selection Engine

**December 19-21, 2025**

### What We Did

Selection logic was scattered across UI components. We centralized it into `SelectionEngine`—a synchronous state machine with command dispatch.

- **[PR #97](https://github.com/joekotvas/RiffScore/pull/97)**: Core engine with `SelectEventCommand`, `NavigateCommand` ([Issue #89](https://github.com/joekotvas/RiffScore/issues/89))
- **[PR #98](https://github.com/joekotvas/RiffScore/pull/98)**: Six additional commands (lasso, range, toggle, etc.)
- **[PR #105](https://github.com/joekotvas/RiffScore/pull/105)**: `SelectAllCommand` with progressive expansion, Shift+Arrow gap fix ([Issue #100](https://github.com/joekotvas/RiffScore/issues/100))
- **[PR #111](https://github.com/joekotvas/RiffScore/pull/111)**: Slice-based vertical selection algorithm ([ADR-001](../adr/001-vertical-selection.md))

### Where It's Rough

The `SelectionEngine` works, but its design has limitations:

1. **No undo for selection**: Unlike `ScoreEngine`, selection changes aren't tracked in history. This is intentional (selection is ephemeral), but it means Cmd+Z won't restore your previous selection.

2. **Vertical selection edge cases**: The slice-based algorithm handles most scenarios, but [Issue #124](https://github.com/joekotvas/RiffScore/issues/124) documents cases where extending horizontally after a vertical extension behaves unexpectedly.

3. **The engine still depends on callbacks**: Despite being a "pure" state machine, `SelectionEngine` takes a `scoreGetter` callback that couples it to external state. This was pragmatic but isn't as clean as we'd like.

4. **41 tests, but gaps remain**: Selection interactions with playback, MIDI input, and undo aren't well-tested.

---

## Phase 3-4: Events & Transactions

**December 21, 2025**

### What We Did

- **[PR #114](https://github.com/joekotvas/RiffScore/pull/114)**: Event subscriptions with `api.on('score', callback)` ([Issue #90](https://github.com/joekotvas/RiffScore/issues/90))
- **[PR #115](https://github.com/joekotvas/RiffScore/pull/115)**: Transaction batching with `beginTransaction`/`commitTransaction` ([Issue #91](https://github.com/joekotvas/RiffScore/issues/91))

### Where It's Rough

1. **Callbacks are async**: Subscription callbacks fire via `useEffect`, not synchronously. This is documented behavior, but it surprised us during development and will likely surprise users. The callback might fire after subsequent code has already run.

2. **No `playback` event yet**: We defined the type but never wired it. Scripts can't be notified when playback starts/stops.

3. **Transaction nesting**: If you call `beginTransaction()` twice without committing, behavior is undefined. We should either support nesting or throw an error—currently we do neither.

4. **Memory leaks possible**: If you call `on()` but lose the unsubscribe function, listeners accumulate. There's no automatic cleanup or limit.

---

## Phase 5: The Great Refactor

**December 21-22, 2025**

### What We Did

`useScoreAPI` had grown to 800+ lines. We split it into domain-specific factories:

- **[PR #118](https://github.com/joekotvas/RiffScore/pull/118)**: Modularized `interaction.ts` ([Issue #79](https://github.com/joekotvas/RiffScore/issues/79))
- **[PR #120](https://github.com/joekotvas/RiffScore/pull/120)**: Factory pattern for API ([ADR-004](../adr/004-api-factory-pattern.md))
- **[PR #128](https://github.com/joekotvas/RiffScore/pull/128)-[#130](https://github.com/joekotvas/RiffScore/pull/130)**: Entry utilities extraction ([Issues #125](https://github.com/joekotvas/RiffScore/issues/125)-[#127](https://github.com/joekotvas/RiffScore/issues/127))

### Where It's Rough

1. **60 TypeScript errors in test files**: The refactors changed interfaces, but we didn't update all test mocks. The tests still run (Jest ignores type errors), but `tsc --noEmit` fails. This is technical debt we're carrying.

2. **Unused imports**: `parseDuration` is imported but unused in `entry.ts`. Small, but indicative of rushed changes.

3. **Factory pattern adds indirection**: The API is now split across 10 files. This is good for maintainability but harder to trace when debugging.

4. **`interaction.ts` still complex**: The facade pattern helped, but the core file is still ~400 lines of navigation logic that could be further simplified.

---

## Phase 6: Reliability & Features

**December 22, 2025**

### What We Did

- **[PR #141](https://github.com/joekotvas/RiffScore/pull/141)**: Synchronous `getScore()` via direct engine access ([Issue #140](https://github.com/joekotvas/RiffScore/issues/140), [ADR-006](../adr/006-synchronous-api-engine-access.md))
- **[PR #142](https://github.com/joekotvas/RiffScore/pull/142)**: Alto and tenor clef support ([ADR-007](../adr/007-open-closed-clef-reference.md))

### Where It's Rough

1. **`getScore()` is synchronous, but mutations trigger async renders**: This works for reading, but the mental model is confusing. You mutate synchronously, the engine updates synchronously, but React re-renders asynchronously. Users need to understand this.

2. **Clef support is incomplete**: We added alto/tenor, but percussion clef, tab clef, and octave-transposing clefs (8va treble) aren't supported. The `CLEF_REFERENCE` pattern makes adding them easy, but they're not there yet.

3. **No import support**: We can export to MusicXML, but we can't import it. Users can only load scores via JSON.

---

## Phase 7: Wiring the Full API

**December 22, 2025**

### What We Did

A systematic sweep to implement remaining stubs:

| Phase | PR | What We Wired |
|:------|:---|:--------------|
| 7A | [#144](https://github.com/joekotvas/RiffScore/pull/144) | `loadScore`, `export`, `deleteMeasure`, `setClef`, etc. |
| 7B | [#145](https://github.com/joekotvas/RiffScore/pull/145) | `setBpm`, `setTheme`, `setScale`, `setInputMode`, etc. |
| 7C | [#147](https://github.com/joekotvas/RiffScore/pull/147) | `selectAtQuant`, `addToSelection`, `selectRangeTo` |
| 7D | [#149](https://github.com/joekotvas/RiffScore/pull/149) | `play`, `pause`, `stop`, `rewind`, `setInstrument` |
| 7E | [#151](https://github.com/joekotvas/RiffScore/pull/151) | `setDuration`, `transpose`, `addMeasure(atIndex)` |

### Where It's Rough

1. **3 methods still stubbed**: The clipboard operations (`copy`/`cut`/`paste`) would require a serialization format for score fragments—deferred to v1.1.

2. **Playback is fire-and-forget**: `play()` returns `this` immediately, but playback is async. There's no way to `await` it or get a promise. If the sampler isn't loaded, playback silently fails.

3. **`export('musicxml')` has gaps**: The MusicXML exporter doesn't handle all tuplet configurations.

4. **Limited error feedback**: Methods silently succeed or warn to console. There's no structured way to know if an operation actually did anything.

---

## Phase 8: Robustness & Observability

**December 22-23, 2025**

### What We Did

- **[PR #152](https://github.com/joekotvas/RiffScore/pull/152)** & **[#153](https://github.com/joekotvas/RiffScore/pull/153)**: Input validation, batch events, labeled transactions ([ADR-008](../adr/008-observability-patterns.md))

### Where It's Rough

1. **Validation is partial**: We validate `addNote`, `setBpm`, `setDuration`, and `setInstrument`. But `setKeySignature`, `setTimeSignature`, and others accept invalid input without warning.

2. **Batch events require discipline**: You only get `batch` events if you use `beginTransaction`/`commitTransaction`. Individual method calls don't emit anything—the user has to opt in.

3. **`affectedMeasures` isn't populated**: The `BatchEventPayload` has an `affectedMeasures` field, but it's always an empty array. We defined the interface but didn't implement the tracking.

4. **Console warnings aren't enough**: Developers who ignore their console will wonder why scripts silently fail. A proper logging/callback system would be better.

---

## By The Numbers

| Metric | Value | Notes |
|:-------|------:|:------|
| PRs Merged | 36 | |
| Issues Closed | 33 | 2 remain open (edge cases) |
| ADRs Written | 8 | |
| Methods Implemented | ~47 | Of ~50 defined |
| Methods Stubbed | 3 | Clipboard only (`copy`, `cut`, `paste`) |
| TypeScript Errors | 60 | In test files only |
| Test Suites | 43+ | Coverage varies widely |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    External Access                          │
│         window.riffScore.get(id) → MusicEditorAPI          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    useScoreAPI Hook                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │             hooks/api/* Factories                    │   │
│  │  entry.ts │ navigation.ts │ selection.ts │ history.ts  │
│  │  modification.ts │ playback.ts │ io.ts │ events.ts    │
│  └─────────────────────────────────────────────────────┘   │
└──────────┬─────────────────────────────────────┬───────────┘
           │                                     │
           ▼                                     ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│    ScoreEngine          │       │   SelectionEngine       │
│   dispatch(Command)     │       │   dispatch(Command)     │
│   transactions          │       │   (no history)          │
│   undo/redo history     │       │   multi-note selection  │
└─────────────────────────┘       └─────────────────────────┘
```

---

## What's Next

### Before v1.0 Stable
- [ ] Fix the 60 TypeScript errors in test files
- [ ] Implement `playback` event subscription
- [ ] Add validation to `setKeySignature`, `setTimeSignature`
- [ ] Document which methods are stubs

### For v1.1
- [ ] **Clipboard API**: `copy()`, `cut()`, `paste()`
- [ ] **MusicXML Import**: Currently export-only
- [ ] **Promise-based playback**: `await api.play()`
- [ ] **Transaction nesting or error handling**

### Known Issues (Deferred)
- [#124](https://github.com/joekotvas/RiffScore/issues/124): Horizontal selection extension edge case
- [#131](https://github.com/joekotvas/RiffScore/issues/131): Tuplet bracket visual alignment

---

## Lessons Learned

1. **Types first helped, but annotations got stale**: The upfront interface looked complete, but as we implemented, we forgot to update `@status` tags. This audit revealed 16 methods marked as stubs that were actually working.

2. **Synchronous engines, async React**: The engine pattern works, but the React integration creates timing confusion that we've documented but not solved.

3. **Refactoring under pressure creates debt**: The Phase 5 refactor improved structure but left test files broken. We prioritized shipping over correctness.

4. **Fail-soft is a tradeoff**: Silent failures with console warnings are stable, but they're also easy to ignore. A more opinionated error system might serve users better.

5. **ADRs are worth it**: Writing down *why* we made decisions has already saved time when revisiting code.

---

## Conclusion

The machine-addressable API exists and is usable. Scripts can navigate, add notes, modify scores, and trigger playback. The architecture is sound, and the patterns are documented.

~47 of ~50 defined methods are implemented. Only clipboard operations remain stubbed. However, test coverage has gaps, TypeScript errors linger in test files, and the API will surprise users at the edges.

This is an alpha. It's ready for experimentation, not production.
