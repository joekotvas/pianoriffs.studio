# The Machine-Addressable API: A Migration Story

> **Status:** ✅ Phase 8 Complete (v1.0.0-alpha.4 Candidate)
> **Timeframe:** December 15-23, 2025 (~8 days intensive development)
> **Scope:** 36 PRs merged, 33 issues closed, 8 ADRs documented

---

## The Vision

RiffScore began as a React-first sheet music editor—powerful for interactive use, but tightly coupled to the React render cycle. As adoption grew, a clear need emerged: **external scripts, plugins, and automation tools needed to control the editor without touching React internals**.

The goal was ambitious: Transform RiffScore from a standalone application into a **machine-addressable platform** where any JavaScript environment could:

```javascript
const api = window.riffScore.get('my-editor');
api.select(1).addNote('C4').addNote('E4').addNote('G4').play();
```

This document tells the story of that transformation.

---

## Phase 0-1: Laying the Foundation

**December 15-19, 2025**

### The Challenge

Before we could expose any functionality, we needed to define *what* the API should look like. Music notation is complex—50+ methods spanning navigation, selection, entry, modification, playback, and configuration. Getting the interface wrong early would haunt us forever.

### The Approach

We started with pure abstraction: define the types first, implement later.

- **[PR #94](https://github.com/joekotvas/RiffScore/pull/94)** introduced `api.types.ts` with the complete `MusicEditorAPI` interface—50 method signatures covering every planned capability ([Issue #86](https://github.com/joekotvas/RiffScore/issues/86)).

- **[PR #95](https://github.com/joekotvas/RiffScore/pull/95)** built the "glue layer": `useScoreAPI` hook and the Registry pattern ([Issue #87](https://github.com/joekotvas/RiffScore/issues/87)). Now any script could call `window.riffScore.get('my-id')` and receive a typed API handle.

### The Result

A fully typed, chainable API skeleton. Methods returned `this` for fluent chaining, but most were stubs. The foundation was solid; now we needed to fill it in.

> **Room for growth**: The Registry pattern doesn't automatically clean up when components unmount unexpectedly. Orphaned registrations could theoretically accumulate in long-running sessions.

---

## Phase 2: The Selection Engine Revolution

**December 19-21, 2025**

### The Challenge

Selection in a music editor is deceptively complex. Users can:
- Click a single note
- Shift+click to extend a range
- Cmd+click to toggle multi-selection
- Drag to lasso-select
- Press Cmd+A repeatedly to expand scope (note → chord → measure → staff → score)
- Press Cmd+Shift+Up/Down to extend vertically across staves

All of this was scattered across UI components, tightly coupled to React state. Exposing it through an API meant **centralizing selection logic into a testable, synchronous engine**.

### The Approach

We introduced `SelectionEngine`—a Redux-like state machine that processes selection commands:

- **[PR #97](https://github.com/joekotvas/RiffScore/pull/97)**: Core engine with `SelectEventCommand` and `NavigateCommand` ([Issue #89](https://github.com/joekotvas/RiffScore/issues/89))
- **[PR #98](https://github.com/joekotvas/RiffScore/pull/98)**: Six additional commands for every selection pattern
- **[PR #105](https://github.com/joekotvas/RiffScore/pull/105)**: `SelectAllCommand` with progressive expansion and the critical **Shift+Arrow gap resilience** bug fix ([Issue #100](https://github.com/joekotvas/RiffScore/issues/100))

The hardest problem was **vertical selection**. When you press Cmd+Shift+Down on a chord, which notes should be selected? We developed a "slice-based" algorithm that treats the score as a 2D grid (time × pitch), documented in **[ADR-001](../adr/001-vertical-selection.md)** ([PR #111](https://github.com/joekotvas/RiffScore/pull/111)).

### The Result

41 new tests. A unified command-dispatch architecture. Selection logic that could be tested in isolation and called from scripts.

> **Room for growth**: The slice-based vertical selection handles most cases well, but edge cases remain ([#124](https://github.com/joekotvas/RiffScore/issues/124), [#109](https://github.com/joekotvas/RiffScore/issues/109)).

---

## Phase 3-4: Events & Transactions

**December 21, 2025**

### The Challenge

External scripts need to know when things change. React's `useEffect` works inside components, but what about a plugin running in a `<script>` tag? 

Additionally, when a script adds 16 notes in a loop, that shouldn't create 16 undo steps. We needed **atomic transactions**.

### The Approach

- **[PR #114](https://github.com/joekotvas/RiffScore/pull/114)**: Event subscriptions with `api.on('score', callback)` ([Issue #90](https://github.com/joekotvas/RiffScore/issues/90), [ADR-002](../adr/002-event-subscriptions.md))
- **[PR #115](https://github.com/joekotvas/RiffScore/pull/115)**: Transaction batching with `beginTransaction`/`commitTransaction` ([Issue #91](https://github.com/joekotvas/RiffScore/issues/91), [ADR-003](../adr/003-transaction-batching.md))

### The Result

Scripts could now react to state changes and batch operations atomically:

```javascript
api.beginTransaction();
for (let i = 0; i < 16; i++) api.addNote(`C${i % 3 + 4}`, 'sixteenth');
api.commitTransaction('Scale Run'); // Single undo step
```

> **Room for growth**: `batch` events fire synchronously, but `score` and `selection` events still fire via React's `useEffect` (by design). Transaction nesting also isn't supported yet.

---

## Phase 5: The Great Refactor

**December 21-22, 2025**

### The Challenge

`useScoreAPI` had grown to 800+ lines. `interaction.ts` was 600+ lines of tangled navigation logic. The codebase worked, but it was becoming unmaintainable.

### The Approach

A multi-stage refactoring effort:

- **[PR #118](https://github.com/joekotvas/RiffScore/pull/118)**: Extracted `interaction.ts` into navigation modules ([Issue #79](https://github.com/joekotvas/RiffScore/issues/79))
- **[PR #120](https://github.com/joekotvas/RiffScore/pull/120)**: Split `useScoreAPI` into domain-specific factories (`entry.ts`, `navigation.ts`, `selection.ts`, etc.) ([ADR-004](../adr/004-api-factory-pattern.md))
- **[PR #128](https://github.com/joekotvas/RiffScore/pull/128)-[#130](https://github.com/joekotvas/RiffScore/pull/130)**: Extracted entry utilities and updated all consumers ([Issues #125](https://github.com/joekotvas/RiffScore/issues/125), [#126](https://github.com/joekotvas/RiffScore/issues/126), [#127](https://github.com/joekotvas/RiffScore/issues/127))
- **[PR #136](https://github.com/joekotvas/RiffScore/pull/136)**: Consolidated selection handlers ([Issue #135](https://github.com/joekotvas/RiffScore/issues/135))

### The Result

Clean, single-responsibility modules. Each API domain in its own file. Navigation logic tested independently. The codebase was ready to scale.

> **Room for growth**: The factory pattern adds indirection—tracing a bug now spans multiple files. Some test mocks also fell out of sync during refactoring and could use attention.

---

## Phase 6: Reliability & Features

**December 22, 2025**

### The Challenge

Two critical issues surfaced:

1. **Stale State Bug**: `api.getScore()` sometimes returned outdated data because it read from React state, which updates asynchronously ([Issue #140](https://github.com/joekotvas/RiffScore/issues/140)).
2. **Missing Clefs**: Alto and tenor clefs (essential for viola, cello, trombone) weren't supported.

### The Approach

- **[PR #141](https://github.com/joekotvas/RiffScore/pull/141)**: Made `getScore()` read directly from `ScoreEngine.getState()`, bypassing React's render cycle ([ADR-006](../adr/006-synchronous-api-engine-access.md))
- **[PR #142](https://github.com/joekotvas/RiffScore/pull/142)**: Full C-clef support with an extensible `CLEF_REFERENCE` pattern ([ADR-007](../adr/007-open-closed-clef-reference.md))

### The Result

Queries became synchronous and reliable. Adding new clefs now requires a single line of configuration. 28 new tests covered edge cases.

> **Room for growth**: Percussion clef, tab clef, and octave-transposing clefs aren't yet supported. MusicXML import is also on the wishlist—currently we can export but not import.

---

## Phase 7: Wiring the Full API

**December 22, 2025**

### The Challenge

We had the infrastructure, but most API methods were still stubs. Time to wire everything up.

### The Approach

A systematic sweep through every stub:

| Phase | PR | Methods Wired |
|:------|:---|:--------------|
| 7A | [#144](https://github.com/joekotvas/RiffScore/pull/144) | `loadScore`, `export`, `deleteMeasure`, `setClef`, `setKeySignature`, `setTimeSignature` |
| 7B | [#145](https://github.com/joekotvas/RiffScore/pull/145) | `setBpm`, `setTheme`, `setScale`, `setInputMode`, `setAccidental`, `reset` |
| 7C | [#147](https://github.com/joekotvas/RiffScore/pull/147) | `selectAtQuant`, `addToSelection`, `selectRangeTo`, `selectFullEvents` |
| 7D | [#149](https://github.com/joekotvas/RiffScore/pull/149) | `play`, `pause`, `stop`, `rewind`, `setInstrument` |
| 7E | [#151](https://github.com/joekotvas/RiffScore/pull/151) | `setDuration`, `transpose`, `addMeasure(atIndex)` |

### The Result

95%+ of the API surface implemented. Only clipboard operations (`copy`/`cut`/`paste`) remain deferred to v1.1—they require designing a serialization format for score fragments.

> **Room for growth**: Playback is fire-and-forget; there's no way to `await` it or know when it finishes. Some methods also accept invalid input silently—Phase 8 addressed key cases, but not all.

---

## Phase 8: Robustness & Observability

**December 22-23, 2025**

### The Challenge

The API worked, but it wasn't safe. Invalid inputs could cause silent failures or cryptic errors. External tools had no visibility into what was happening inside transactions.

### The Approach

We implemented a "fail-soft" philosophy ([ADR-008](../adr/008-observability-patterns.md)):

- **[PR #152](https://github.com/joekotvas/RiffScore/pull/152)** & **[#153](https://github.com/joekotvas/RiffScore/pull/153)**: 
  - Input validation for `addNote`, `setBpm`, `setDuration`, `setInstrument`
  - Batch events (`on('batch')`) with labeled transactions
  - Structured warnings instead of exceptions

### The Result

```javascript
api.setBpm(500); // Logs warning, clamps to 300, continues
api.on('batch', (e) => console.log(`Completed: ${e.label}`));
```

The API is now stable and observable—a solid foundation for production use.

> **Room for growth**: Validation currently covers `addNote`, `setBpm`, `setDuration`, and `setInstrument`. Other methods like `setKeySignature` could benefit from similar treatment. The `affectedMeasures` field in batch events is also defined but not yet populated.

---

## By The Numbers

| Metric | Value |
|:-------|------:|
| PRs Merged | 36 |
| Issues Closed | 33 |
| ADRs Written | 8 |
| New Tests | 200+ |
| API Methods Implemented | ~50 |
| Days of Development | 8 |

---

## Architecture Summary

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
│   transactions          │       │   anchor tracking       │
│   undo/redo history     │       │   multi-note selection  │
└─────────────────────────┘       └─────────────────────────┘
```

---

## What's Next

### For v1.0 Stable
- [ ] Final documentation review
- [ ] Version bump to `1.0.0`
- [ ] npm publish

### For v1.1 (Phase 9)
- [ ] **Clipboard API**: `copy()`, `cut()`, `paste()` with serialization format
- [ ] **MIDI Input Hook**: `onMidi` for real-time note entry
- [ ] **Keyboard Shortcut API**: Programmatic triggering

### Known Deferred Issues
- [#124](https://github.com/joekotvas/RiffScore/issues/124): Horizontal selection extension edge case
- [#131](https://github.com/joekotvas/RiffScore/issues/131): Tuplet bracket visual alignment

---

## Lessons Learned

1. **Types First, Implementation Later**: Defining `MusicEditorAPI` upfront forced us to think holistically before coding.

2. **Commands Are Worth It**: The overhead of creating command classes paid dividends in testability and undo/redo.

3. **Synchronous Queries, Async Events**: Users expect `getScore()` to be instant; event callbacks can wait for React.

4. **Fail Soft, Log Loud**: Chained APIs can't throw exceptions, but they can warn developers.

5. **ADRs Preserve Context**: Eight design documents now explain *why* we made each architectural choice.

---

> *"The best APIs are invisible. You don't notice them—you just get things done."*

The Machine-Addressable API is substantially complete. RiffScore is now a platform—ready for real-world use, with clear paths for continued refinement.
