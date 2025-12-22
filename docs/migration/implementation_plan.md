# Implementation Plan: Machine-Addressable Interaction Model

**Date:** 2025-12-19 (Updated: Round 2 Spiral)
**Scope:** Implement the imperative interaction model ("Glue Layer"), dual dispatcher architecture, multi-instance registry, and event subscriptions.
**References:** `selection_model_brainstorm.md`, `interaction_model_analysis.md`, `api_reference_draft.md`

---

## Goal Description

Expose RiffScore's editing capabilities to external scripts via a stable, intent-based API (`window.riffScore`). The system must support:
-   **Chainable, Synchronous** method calls.
-   **Multi-Instance** environments (Registry pattern).
-   **11 API Categories**: Nav, Selection, Entry, Modify, Structure, Config, Lifecycle, Playback, Data, History, Events.
-   **Transaction Batching** for performance.

---

## User Review Required
> [!IMPORTANT]
> This refactor introduces `SelectionEngine` and `RiffScoreRegistry`, replacing existing patterns. **The app must remain fully functional at the end of each phase**, but we will aggressively eliminate deprecated or inelegant solutions in favor of the new paradigm. Legacy data structures and stale state will not be preserved.

---

## Strategy Rationale: "Outside-In" Development

1.  **Contract First**: Define public API before refactoring internals.
2.  **Test Harness**: Write E2E tests against API signature.
3.  **Safe Refactoring**: Swap internals while API tests ensure no regressions.
4.  **Immediate Value**: External scripts integrate against stable contract.

---

## Proposed Changes

### Phase 0: Type Definitions ([#86](https://github.com/joekotvas/RiffScore/issues/86))

#### [MODIFY] `src/types.ts`
-   Export `MusicEditorAPI` interface (all method signatures).
-   Export `RiffScoreRegistry` interface.
-   Export `APIEventType = 'score' | 'selection' | 'playback'`.
-   Export `Unsubscribe = () => void`.

#### Tests
-   **No runtime tests** (types are compile-time checked).
-   Verify TypeScript compilation passes with `npm run build`.

---

### Phase 1: The Glue Layer ([#87](https://github.com/joekotvas/RiffScore/issues/87))

#### [NEW] `src/hooks/useScoreAPI.ts`
Implement core API hook.

**Internal Helpers:**
-   `generateId()`: Mints UUIDs.
-   `syncCursor`: Ref holding current selection position (authoritative).
-   `batchDepth`: Counter for nested transactions.

**All Methods by Category:**
| Category | Methods |
| :--- | :--- |
| Nav | `move`, `jump`, `select`, `selectAtQuant`, `selectById` |
| Selection | `addToSelection`, `selectRangeTo`, `selectAll`, `deselectAll` |
| Entry | `addNote`, `addRest`, `addTone`, `makeTuplet`, `toggleTie`, `setTie`, `setInputMode` |
| Modify | `setPitch`, `setDuration`, `setAccidental`, `toggleAccidental`, `transpose`, `transposeDiatonic`, `updateEvent` |
| Structure | `addMeasure`, `deleteMeasure`, `deleteSelected`, `setKeySignature`, `setTimeSignature`, `setMeasurePickup` |
| Config | `setClef`, `setScoreTitle`, `setBpm`, `setTheme`, `setScale`, `setStaffLayout` |
| Lifecycle | `loadScore`, `reset`, `export` |
| Playback | `play`, `pause`, `stop`, `rewind`, `setInstrument` |
| Data | `getScore`, `getConfig`, `getSelection` |
| History | `undo`, `redo`, `beginTransaction`, `commitTransaction`, `copy`, `cut`, `paste` |
| Events | `on` |

**Chainability:**
All mutation/navigation methods return `this`.

#### [MODIFY] `src/RiffScore.tsx`
-   **Add `id?: string` prop.**
-   **Initialize Registry:**
    ```typescript
    if (!window.riffScore) {
      window.riffScore = {
        instances: new Map(),
        active: null,
        get: (id) => window.riffScore.instances.get(id),
      };
    }
    ```
-   **Register on Mount:** `instances.set(id, apiRef); active = apiRef;`
-   **Cleanup on Unmount:** `instances.delete(id);`
-   **Use `useImperativeHandle`** for ref exposure.

#### Tests: `src/__tests__/ScoreAPI.registry.test.tsx`
```typescript
describe('Registry', () => {
  test('registers instance on mount');
  test('unregisters on unmount');
  test('get() returns undefined for unknown id');
  test('active points to most recent mount');
});

describe('Entry Methods', () => {
  test('addNote appends to score and advances cursor');
  test('addRest appends rest');
  test('addTone adds pitch to existing chord');
});

describe('Navigation Methods', () => {
  test('select() moves cursor to absolute position');
  test('move("right") advances cursor');
  test('move() wraps at measure boundaries');
});

describe('Chainability', () => {
  test('methods return this for chaining');
});
```

---

### Phase 2: Selection Engine ([#89](https://github.com/joekotvas/RiffScore/issues/89))

#### [NEW] `src/engines/SelectionEngine.ts`
-   State: `Selection` object (synchronous ref).
-   Methods: `dispatch(command)`, `subscribe(listener)`, `getState()`.
-   Pattern: Mirrors `ScoreEngine`.

#### [NEW] `src/commands/selection/types.ts`
-   `interface SelectionCommand { type: string; execute(state: Selection, score: Score): Selection; }`

#### [NEW] `src/commands/selection/SelectEventCommand.ts`
-   Targets specific event/note by indices or ID.

#### [NEW] `src/commands/selection/NavigateCommand.ts`
-   Encapsulates `calculateNextSelection` and `calculateVerticalNavigation`.

#### [MODIFY] `src/hooks/useSelection.ts`
-   Refactor to wrap `SelectionEngine`.
-   Subscribe to engine for React state sync.

#### Tests: `src/__tests__/SelectionEngine.test.ts`
```typescript
describe('SelectionEngine', () => {
  test('dispatch updates state synchronously');
  test('subscribe notifies on state change');
  test('getState returns current selection');
});

describe('SelectEventCommand', () => {
  test('selects event by indices');
  test('selects note within chord');
  test('clamps out-of-bounds indices');
});

describe('NavigateCommand', () => {
  test('moves right within measure');
  test('wraps to next measure');
  test('cycles staff on vertical navigation');
});
```

---

### Phase 3: Event Subscriptions ([#90](https://github.com/joekotvas/RiffScore/issues/90))

#### [MODIFY] `src/hooks/useScoreAPI.ts`
Implement `on(event, callback)`:
-   `'score'`: Subscribe to `ScoreEngine`.
-   `'selection'`: Subscribe to `SelectionEngine`.
-   `'playback'`: Subscribe to playback state hook.

Returns unsubscribe function.

#### Tests: `src/__tests__/ScoreAPI.events.test.tsx`
```typescript
describe('Event Subscriptions', () => {
  test('on("score") fires on mutation');
  test('on("score") receives new Score object');
  test('on("selection") fires on cursor move');
  test('unsubscribe prevents further callbacks');
  test('multiple subscribers all receive events');
});
```

---

### Phase 4: Transaction Batching ([#91](https://github.com/joekotvas/RiffScore/issues/91))

#### [NEW] `src/commands/BatchCommand.ts`
-   Implements `Command` interface.
-   `constructor(commands: Command[])`.
-   `execute(score)`: Sequentially executes all sub-commands.
-   `undo(score)`: Reversely undoes all sub-commands.

#### [MODIFY] `src/engines/ScoreEngine.ts`
-   Add `batchDepth: number` (init 0).
-   Add `batchBuffer: Command[]` (init []).
-   **dispatch(command)**:
    -   Execute command `newState = command.execute(this.state)`.
    -   Update `this.state = newState`.
    -   If `batchDepth > 0`: Push to `batchBuffer`. DO NOT notify listeners.
    -   If `batchDepth === 0`: Push to `history`, notify listeners.
-   **beginBatch()**: `this.batchDepth++`.
-   **endBatch()**:
    -   `this.batchDepth--`.
    -   If `this.batchDepth === 0` AND buffer not empty:
        -   Create `batch = new BatchCommand(this.batchBuffer)`.
        -   Push `batch` to `history`.
        -   `this.batchBuffer = []`.
        -   Notify listeners.

#### [MODIFY] `src/hooks/useScoreAPI.ts`
-   `beginTransaction()`: Calls `engine.beginBatch()`.
-   `commitTransaction()`: Calls `engine.endBatch()`.

#### Tests: `src/__tests__/ScoreAPI.transactions.test.tsx`
```typescript
describe('Transaction Batching', () => {
  test('listeners suppressed during transaction');
  test('listener fires once on commit');
  test('undo reverts entire transaction as single step');
  test('nested transactions work correctly (flatten to single batch)');
  test('atomicity: partial failure aborts batch (optional improvement)');
});
```

---

### Phase 1b: Initial Documentation ([#88](https://github.com/joekotvas/RiffScore/issues/88))

Create the core API documentation while the API is fresh.

#### [NEW] `docs/API.md`
-   Copy and polish content from `api_reference_draft.md`.
-   Add breadcrumb header, "See Also" navigation.
-   Include Table of Contents.

#### [NEW] `docs/COOKBOOK.md`
-   Create 3-5 initial recipes (Scale entry, Batch editing, Integration).
-   Add breadcrumb and cross-links to API.md.

---

### Phase 5: Interaction Refactor ([#92](https://github.com/joekotvas/RiffScore/issues/92)) – Deferred
-   Split `interaction.ts` into semantic modules as guided by API seams.

---

### Phase 5b: Final Documentation ([#93](https://github.com/joekotvas/RiffScore/issues/93))

Update all existing docs and announce the feature.

#### [MODIFY] `README.md`
-   Move "Imperative API" from "Coming Soon" to "Features".
-   Add link to `docs/API.md`.

#### [MODIFY] `docs/ARCHITECTURE.md`
-   Add "Design Decisions & Rationale" section (from planning artifacts).
-   Update "See Also" to include API.md.

#### [MODIFY] `docs/CONFIGURATION.md`
-   Add "See Also" block with API.md link.
-   Add inline cross-link: "For programmatic control, see [API Reference](./API.md)."

#### [MODIFY] `docs/INTERACTION.md`
-   Update "See Also" to include API.md, COOKBOOK.md.

#### [MODIFY] `docs/KEYBOARD_NAVIGATION.md`
-   Update "See Also" to include API.md.

#### [MODIFY] `docs/CONTRIBUTING.md`
-   Update "See Also" to include ARCHITECTURE.md.

---

## Risk Mitigation

| Risk | Mitigation |
| :--- | :--- |
| **App Broken Mid-Phase** | Complete each phase fully before moving on; run tests after each phase. |
| API Contract Breakage | Versioned API; stability tests. |
| Stale Cursor State | Synchronous engine refs; eliminate legacy `useState` for selection. |
| Multi-Instance Collision | Unique IDs; unmount cleanup. |
| Performance Degradation | Transaction batching. |
| **Legacy Pattern Drift** | Aggressively delete deprecated code; no proxying to old logic. |

---

## Verification Plan

### Automated Tests
**File:** `src/__tests__/ScoreAPI.test.tsx`

```typescript
describe('Registry', () => {
  test('registers instance on mount', () => {
    render(<RiffScore id="test-1" />);
    expect(window.riffScore.get('test-1')).toBeDefined();
  });

  test('unregisters on unmount', () => {
    const { unmount } = render(<RiffScore id="test-2" />);
    unmount();
    expect(window.riffScore.get('test-2')).toBeUndefined();
  });
});

describe('Entry', () => {
  test('addNote appends to score', () => {
    render(<RiffScore id="test-3" />);
    window.riffScore.get('test-3')!.select(1, 0, 0).addNote('C4', 'quarter');
    // Assert score contains C4
  });
});

describe('Events', () => {
  test('on(score) fires on mutation', () => {
    const listener = jest.fn();
    render(<RiffScore id="test-4" />);
    const unsub = window.riffScore.get('test-4')!.on('score', listener);
    window.riffScore.get('test-4')!.addNote('C4');
    expect(listener).toHaveBeenCalled();
    unsub();
  });
});

describe('Transactions', () => {
  test('batches mutations into single undo', () => {
    render(<RiffScore id="test-5" />);
    const api = window.riffScore.get('test-5')!;
    api.beginTransaction();
    api.addNote('C4').addNote('D4').addNote('E4');
    api.commitTransaction();
    api.undo();
    // Assert all 3 notes are gone
  });
});
```

### Manual Verification
1.  Open RiffScore Demo.
2.  Console: `window.riffScore.active.select(1).addNote('C4').addNote('D4').addNote('E4');`
3.  **Expected**: Three notes appear sequentially.
4.  Console: `window.riffScore.active.undo();`
5.  **Expected**: Last note removed (or all 3 if in transaction).

---

## File Summary

| Phase | File | Action |
| :--- | :--- | :--- |
| 0 | `src/types.ts` | MODIFY |
| 1 | `src/hooks/useScoreAPI.ts` | NEW |
| 1 | `src/RiffScore.tsx` | MODIFY |
| 1 | `src/__tests__/ScoreAPI.registry.test.tsx` | NEW (Tests) |
| **1b** | `docs/API.md` | NEW |
| **1b** | `docs/COOKBOOK.md` | NEW |
| 2 | `src/engines/SelectionEngine.ts` | NEW |
| 2 | `src/commands/selection/types.ts` | NEW |
| 2 | `src/commands/selection/SelectEventCommand.ts` | NEW |
| 2 | `src/commands/selection/NavigateCommand.ts` | NEW |
| 2 | `src/hooks/useSelection.ts` | MODIFY |
| 2 | `src/__tests__/SelectionEngine.test.ts` | NEW (Tests) |
| 3 | `src/hooks/useScoreAPI.ts` | MODIFY (Events) |
| 3 | `src/__tests__/ScoreAPI.events.test.tsx` | NEW (Tests) |
| 4 | `src/engines/ScoreEngine.ts` | MODIFY (Batching) |
| 4 | `src/__tests__/ScoreAPI.transactions.test.tsx` | NEW (Tests) |
| 5 | `src/utils/interaction.ts` | REFACTOR (Deferred) |
| **5b** | `README.md` | MODIFY |
| **5b** | `docs/ARCHITECTURE.md` | MODIFY |
| **5b** | `docs/CONFIGURATION.md` | MODIFY |
| **5b** | `docs/INTERACTION.md` | MODIFY |
| **5b** | `docs/KEYBOARD_NAVIGATION.md` | MODIFY |
| **5b** | `docs/CONTRIBUTING.md` | MODIFY |
