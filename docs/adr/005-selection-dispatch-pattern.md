# ADR-005: Selection Dispatch Pattern

> **Principle**: Command Pattern / Single Source of Truth  
> **Status**: Accepted  
> **Date**: 2025-12-22  
> **Issue**: #136  
> **PR**: #136

## Context

Originally, the RiffScore application managed selection state using React's `useState` hook directly within components and custom hooks. As the application grew, we encountered several significant issues:

1.  **Stale Closures**: Hooks often closed over stale selection state, leading to "jumping" cursors.
2.  **Logic Duplication**: Selection mutation logic was scattered across multiple files.
3.  **Untestability**: Testing selection logic required mounting React components.
4.  **Race Conditions**: Multiple effects trying to `setSelection` simultaneously often conflicted.

The **Command Pattern** (Gang of Four) encapsulates all mutations as command objects. **Single Source of Truth** ensures one authoritative state location.

## Decision

We have consolidated all selection state management into a **Command-Dispatch Pattern** driven by a `SelectionEngine`.

### Key Design Choices

1.  **Single Source of Truth**: The `SelectionEngine` class holds the definitive selection state. React state is merely a subscriber that reflects this truth for rendering.
2.  **Dispatch Only**: Components and hooks must **never** set selection state directly. They must dispatch a `Command` (e.g., `SetSelectionCommand`, `RangeSelectCommand`) to the engine.
3.  **Command Pattern**: All mutations are encapsulated in `Command` classes that implement an `execute(state, score)` method, returning the new state.
4.  **Synchronous Access**: The engine provides a `getState()` method for synchronous access, solving the stale closure problem for event handlers.

## Consequences

### Positive

-   **Reliability**: Elimination of "stale state" bugs in complex interactions.
-   **Testability**: `SelectionEngine` and Commands are pure TypeScript classes that can be tested in isolation (fast unit tests) without React.
-   **Maintainability**: Centralized logic makes adding new selection behaviors (like Phase 2's Vertical Selection) much safer.
-   **API Readiness**: External scripts can drive selection via the exact same commands as the UI.

### Negative

-   **Boilerplate**: Requires defining a Command class for every mutation type.
-   **Indirection**: Tracing a click to a state change involves following the dispatch -> command -> execute -> notify flow.

## Implementation Details

-   **Engine**: `src/engines/SelectionEngine.ts`
-   **Commands**: `src/commands/selection/*.ts`
-   **Hook**: `src/hooks/useSelection.ts` (now just a facade for the engine)

## Related

-   [ADR-001 Vertical Selection](./001-vertical-selection.md)
-   [docs/migration/progress.md](../migration/progress.md)
