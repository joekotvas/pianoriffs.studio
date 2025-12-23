# 8. Observability Patterns

Date: 2025-12-23

## Status

Accepted

## Context

As RiffScore evolves into a platform for building music applications (rather than just a standalone editor), external systems need visibility into its operation. These systems include:
- **Analytics engines** (tracking user behavior)
- **External UIs** (undo/redo buttons, save status indicators)
- **Debugging tools** (monitoring API health)

Specifically, consumers need two distinct types of signals:
1. **"What happened?"** (Success/Intent) — Knowing that a meaningful user action (like "Paste Measures" or "Add Chord") completed.
2. **"What went wrong?"** (Failure/Health) — Knowing when the editor rejected an input or clamped a value.

Historically, the API only exposed raw state changes (`score`, `selection`). This led to:
- **Noise**: Reacting to every micro-mutation (e.g., adding 16 notes in a loop triggered 16 analytics events).
- **Ambiguity**: Inferring user intent (e.g., distinguishing a "paste" from manual entry) required diffing state snapshots.
- **Fragility**: Invalid inputs either threw errors (crashing consumers) or failed silently (confusing developers).

## Decision

We will implement a split observability model: **Transactional Observability** for success/intent, and **Failure Observability** for errors.

### 1. Transactional Observability (The `batch` Event)

We will introduce a specific event channel for atomic units of work.

- **Mechanism**: The `ScoreEngine` will emit a `batch` event whenever a transaction is committed.
- **Payload**: `BatchEventPayload` includes:
  - `label`: Human-readable intent (e.g., "Transpose Selection").
  - `timestamp`: Precise execution time.
  - `commands`: A digest of operations performed.
- **Contract**: External systems should rely on *this* event for actionable history and analytics, rather than inferring intent from raw state diffs.

### 2. Failure Observability (Fail-Soft Logging)

We will move from a "fail-fast" (exception) model to a "fail-soft" (logging) model for API inputs.

- **Mechanism**: API methods will validate inputs (e.g., pitch format, value ranges) before dispatching commands.
- **Outcome**:
  - **Invalid Input**: Log a structured warning (`LogLevel.WARN`) to the console and return `this` (no-op).
  - **Valid Input**: Proceed normally.
- **Rationale**: Chained API calls (e.g., `api.select(1).addNote(...).play()`) should not crash the entire chain if one parameter is slightly off. The developer should be notified via logs, but the application should remain stable.

## Consequences

### Positive
- **De-noised Integration**: Analytics and save hooks can listen to `batch` events to capture only meaningful, atomic changes.
- **Runtime Stability**: Poorly formed API calls (e.g., from a buggy script) won't crash the host application.
- **Developer Experience**: API chaining is preserved, and warnings provide clear feedback without interrupting the flow.

### Negative
- **Discipline Required**: Developers must use `beginTransaction`/`commitTransaction` to wrap their scripts, otherwise no `batch` event is fired for individual operations.
- **Ignored Errors**: If a developer ignores console warnings, they might wonder why their script is silently doing nothing.

## Alternatives Considered

### A. Granular Event Spam
*Idea*: Emit an event for every single command (`ADD_NOTE`, `SET_PITCH`).
*Rejection*: Too noisy. A "Cut and Paste" operation might generate 50+ events. Consumers would need to implement their own debouncing or batching logic.

### B. Throwing Exceptions
*Idea*: Throw `Error` immediately on invalid input.
*Rejection*: Breaks the fluent API pattern (`api.doTag().doThat()`). If `doThat()` throws, the subsequent logic crashes. In a live music app, preventing a crash is more important than strict correctness of a single operation.

### C. Return Values for Validity
*Idea*: Have `addNote()` return `boolean` (success/fail).
*Rejection*: Breaks chainability. Users would have to write tedious `if (api.addNote())` checks.
