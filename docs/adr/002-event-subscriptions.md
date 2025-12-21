# ADR 002: Event Subscription Pattern

**Status:** Accepted
**Date:** 2025-12-21
**Deciders:** Core Team

## Context

RiffScore requires an external API (`window.riffScore`) to allow wrapping applications or scripts to react to state changes (e.g., selection updates, score modifications) without polling. The system currently uses React's Context API and standard hooks for state management.

## Decision

We chose to implement the Event Subscription pattern using a custom hook (`useAPISubscriptions`) that leverages:
1.  **`useRef`** to store mutable sets of listeners (preserving identity across renders).
2.  **`useEffect`** to detect state changes in the `ScoreContext` and trigger notifications.
3.  **`try-catch` wrappers** around listener execution to isolate the main application loop from errors in external subscriber code.

## Rationale

1.  **Architectural Alignment:** The current application uses React hooks exclusively. Using `useEffect` allows the API to "piggyback" on the existing render cycle without requiring a fundamental rewrite of the state management layer (e.g., moving to Redux middleware).
2.  **Stability:** By lifting listener validation and storage into a dedicated hook, we ensure the main API object reference remains stable (memoized) even when subscribers change.
3.  **Safety:** External code is untrusted. Wrapping callbacks prevents a single buggy script from crashing the entire editor.

## Consequences

### Positive
-   Simple implementation (isolated hook).
-   Zero impact on core `ScoreContext` or reducers.
-   Stable API reference for consumers.

### Negative
-   **Render Cycle Dependency:** Events fire *after* the React commit phase (asynchronously w.r.t the state update). This means listeners receive the "new" state slightly after it has settled.
-   **Jitter Potential:** This pattern is NOT suitable for high-frequency events like audio playback ticks (e.g., "every 16th note"). Those must be handled outside the React render loop.

## Alternatives Considered

### Redux-style Middleware
-   *Approach:* Wrap the `dispatch` function to emit events synchronously before/after state updates.
-   *Pros:* Completely decoupled from UI rendering. Synchronous.
-   *Cons:* Would require significant refactoring of `ScoreContext` to support a middleware chain. High effort for Phase 3.

### Observable/Subject Pattern (RxJS)
-   *Approach:* Replace internal state with Observables.
-   *Pros:* Powerful stream processing.
-   *Cons:* Overkill complexity for current requirements; introduces new paradigm/dependencies.
