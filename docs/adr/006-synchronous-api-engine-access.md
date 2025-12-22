# ADR-006: Synchronous API Engine Access

> **Principle**: Principle of Least Astonishment (POLA)  
> **Status**: Accepted  
> **Date**: 2025-12-22

## Context

The `MusicEditorAPI` (exposed via `window.riffScore`) allows external scripts and developer tools to interact with the score programmatically. A common pattern in such scripts is:

```javascript
api.addMeasure(); // Mutation
const score = api.getScore(); // Query
// Expectation: score includes the new measure
```

Previously, `useScoreAPI` relied on a `scoreRef` that was updated via `useEffect`. Because `useEffect` runs asynchronously after the React render cycle, the `getScore()` call in the example above would return *stale data*.

The **Principle of Least Astonishment** states that a system should behave in a way that users expect. API consumers expect `getScore()` to reflect immediately preceding mutations.

## Decision

We have decided to **expose the `ScoreEngine` instance directly to the API layer** and implement `api.getScore()` to read directly from `engine.getState()`.

This involves:
1.  Returning the `engine` instance from `useScoreLogic` (via `useScoreEngine`).
2.  Passing this engine to the `createAPI` factory or `useScoreAPI` hook.
3.  Bypassing the local React `ref` for `getScore()` calls in favor of the engine's synchronous state.

## Consequences

### Positive
*   **Synchronicity**: API queries immediately reflect the result of API mutations. `api.addNote(); api.getScore()` works as intuitively expected.
*   **Authority**: The Engine is treated as the single source of truth for the domain model.
*   **Consistency**: Aligns with how `SelectionEngine` is accessed (already synchronous).
*   **Testability**: Integration tests can assert state changes immediately without flaky `waitFor` or `setTimeout` mechanisms.

### Negative
*   **Coupling**: The API layer is now tightly coupled to the `ScoreEngine` class interface.
*   **Dual State Sources**: Components reading from React Context and scripts reading from API might momentarily diverge if React hasn't re-rendered yet (though they will eventually converge). This is acceptable as the API user explicitly requested the *current* state.

## Alternatives Considered

*   **`flushSync`**: Forcing React to flush updates synchronously. Rejected due to performance implications and potential conflicts with React 18+ concurrent features.
*   **Manual Ref Updates**: Manually updating `scoreRef.current` inside every command or dispatch wrapper. Rejected as error-prone and redundant (essentially recreating the Engine's state management).
*   **Event Listeners**: Requiring API users to listen for 'change' events instead of imperative query. Rejected as it complicates simple scripting tasks and breaks the "Controller" mental model.
