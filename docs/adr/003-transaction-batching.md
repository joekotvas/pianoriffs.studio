# ADR-003: Transaction Batching Strategy

> **Principle**: Atomicity (Unit of Work)  
> **Status:** Accepted  
> **Date:** 2025-12-21  
> **Deciders:** Core Team

## Context

The RiffScore API requires a "Transaction" mechanism (e.g., `beginTransaction`, `commitTransaction`) to group multiple operations into a single atomic Undo/Redo step.

The **Atomicity** principle (from ACID) ensures that a group of operations either all succeed or all fail together, maintaining data integrity. The **Unit of Work** pattern tracks changes and commits them as a single transaction.

## Decision

We chose **History-Only Batching** (Immediate UI Updates).

In this model:
1.  **Execution:** Commands within a transaction are executed *immediately* against the `ScoreEngine` state.
2.  **Notification:** Listeners (and thus the UI) are notified immediately of every step.
3.  **History:** Commands are *not* pushed to the history stack individually. They are buffered in a local queue.
4.  **Commit:** On commit, the buffered commands are wrapped in a single `BatchCommand` composite and pushed to the history stack *without re-execution*.

## Rationale

### Why History-Only vs. State Batching (Deferred UI)?

**State Batching** (suppressing UI updates until commit) was rejected because:
1.  **UX Risk:** It creates an "invisible update" phase. Interactive multi-step operations (e.g., a script that pauses for input or runs slowly) would make the app appear frozen.
2.  **Complexity:** It requires `ScoreEngine` to support a "shadow state" or complex buffering that might drift from the rendered UI.

**History-Only** provides the best balance:
-   **Pros:** The user sees actions happening (better feedback). The Undo stack remains clean (atomic). Safest for implementation updates.
-   **Cons:** Higher render cost than State Batching (since every step renders), but RiffScore is currently optimized enough for typical macro usage.

## Implementation Details

-   **`BatchCommand`**: A Composite pattern implementation of `Command` that holds a list of sub-commands.
-   **`useTransactionBatching`**: A React hook that manages the `batchDepth` and `buffer`. It intercepts `dispatch` calls.
-   **`ScoreEngine` Modifications**: Minimal updates to allow dispatching with `addToHistory: false` and a method to `commitBatch` (push to history without executing).

## Consequences

-   **Positive:** Atomic Undo/Redo logic. Clean history. Live visual feedback during macros.
-   **Negative:** No performance gain from reducing renders during batches (requires future "Render throttling" if this becomes a bottleneck).
-   **Safety:** We must implement `rollbackTransaction()` to handle errors during a batch, otherwise, the user could be left with partial state and no history record.
