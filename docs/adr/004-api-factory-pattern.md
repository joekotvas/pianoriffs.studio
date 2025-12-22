# ADR 004: API Factory Pattern

**Status:** Accepted  
**Date:** 2025-12-21  
**Deciders:** Core Team  
**Related:** [PR #120](https://github.com/joekotvas/RiffScore/pull/120)

## Context

The `MusicEditorAPI` interface defines 40+ methods across navigation, selection, entry, modification, history, playback, and I/O. The initial implementation placed all methods directly in `useScoreAPI`, resulting in a 700+ line hook that was difficult to maintain, test, and extend.

## Decision

We adopted a **factory pattern** where API methods are organized into domain-specific modules:

```
src/hooks/api/
├── entry.ts        # addNote(), addRest(), addTone()
├── navigation.ts   # move(), jump()
├── selection.ts    # select(), selectAll(), deselectAll()
├── modification.ts # changePitch(), delete(), transpose()
├── history.ts      # undo(), redo(), beginTransaction()
├── playback.ts     # play(), pause() (stub)
├── io.ts           # export(), import() (stub)
├── events.ts       # on() subscription
├── types.ts        # APIContext interface
└── index.ts        # barrel export
```

Each factory is a pure function that receives a shared `APIContext` and returns method implementations:

```typescript
export interface APIContext {
  scoreRef: React.MutableRefObject<Score>;
  selectionRef: React.MutableRefObject<Selection>;
  syncSelection: (sel: Selection) => void;
  dispatch: React.Dispatch<Command>;
  selectionEngine: SelectionEngine;
  history: ScoreHistoryGroup;
  config: RiffScoreConfig;
}

export const createEntryMethods = (ctx: APIContext) => ({
  addNote(pitch) { /* uses ctx.scoreRef, ctx.dispatch */ },
  addRest() { /* ... */ },
  // ...
});
```

## Rationale

### 1. Separation of Concerns
Each factory handles a single domain. Changes to selection logic don't risk breaking entry methods.

### 2. Testability
Factories are pure functions—they can be unit tested by providing a mock `APIContext` without rendering React components.

### 3. Ref-Based State Access
API methods access state via refs (`scoreRef.current`, `selectionRef.current`) rather than closure over React state values. This ensures:
- Methods always read **current** state, not stale closure values
- The API object can be memoized once and remain stable across renders
- Event handlers attached outside React lifecycle receive fresh data

### 4. Composability
The main hook composes all factories with spread syntax:
```typescript
const api = useMemo(() => ({
  ...createNavigationMethods(ctx),
  ...createSelectionMethods(ctx),
  ...createEntryMethods(ctx),
  // ...
}), [/* stable deps */]);
```

## Consequences

### Positive
- **Maintainability:** 700-line hook → 10 focused modules of 50-150 lines each
- **Extensibility:** Adding new methods = add to appropriate factory
- **Type Safety:** Each factory has explicit return type via `Pick<MusicEditorAPI, ...>`
- **Stable API Reference:** Memoized once, no unnecessary re-creation

### Negative
- **React Compiler Warnings:** Passing refs to factory functions triggers "Cannot access refs during render" warnings. These are false positives—refs are only read when methods are *called* (in event handlers), not during factory execution. Suppressed with `// eslint-disable-next-line`.
- **Indirection:** Debugging requires tracing through factory composition.

## Alternatives Considered

### Monolithic Hook
- *Approach:* Keep all methods inline in `useScoreAPI`.
- *Pros:* Simpler mental model, no factory indirection.
- *Cons:* 700+ lines, difficult to navigate, high merge conflict risk.

### Class-Based API
- *Approach:* `new MusicEditorAPI(context)` with methods as class members.
- *Pros:* Familiar OOP pattern, natural `this` binding.
- *Cons:* Doesn't integrate well with React hooks; class instances don't auto-update when React state changes without extra subscription logic.

### Direct Reducer Dispatch
- *Approach:* Consumers call `dispatch(AddNoteCommand)` directly.
- *Pros:* No API wrapper needed.
- *Cons:* Exposes internal command structure; no fluent chaining; consumers must understand command pattern.

## Files

- `src/hooks/api/*.ts` — Factory modules
- `src/hooks/api/types.ts` — `APIContext` interface
- `src/hooks/useScoreAPI.ts` — Composition point
