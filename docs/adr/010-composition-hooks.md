# ADR-010: Composition Hooks for Prop Drilling Reduction

**Status**: Accepted  
**Date**: 2025-12-26  
**Context**: "How do we reduce prop drilling in React hooks without introducing implicit dependencies?"

## Context

The `useScoreLogic` hook is the root orchestrator for the RiffScore editor. It composes multiple specialized hooks, each requiring a subset of shared props (score state, selection, tools, dispatch).

As the number of composed hooks grew, we observed:

1. **Prop Drilling Accumulation**: Some hooks require 10-13 props, creating verbose call sites
2. **Semantic Fragmentation**: Related hooks (e.g., all note operations) were passed props independently
3. **Facade Deprecation Ambiguity**: A `useNoteActions` facade was marked `@deprecated` but never removed

During Issue #116 analysis, adversarial review revealed:
- The facade was *reducing* complexity, not adding it
- Removing the facade would increase `useScoreLogic` by ~37 lines
- The `@deprecated` tag was aspirational, not technical

## Decision

We adopt **Composition Hooks** as a recognized pattern for grouping related sub-hooks.

### Pattern Definition

A **Composition Hook** is a hook that:

1. **Composes** multiple focused sub-hooks
2. **Bundles** shared props into a single interface
3. **Returns** a unified API for related operations
4. **Is NOT deprecated** - it is an intentional abstraction

### When to Create a Composition Hook

| Criteria | Threshold |
|----------|-----------|
| Shared props between hooks | ≥ 5 props |
| Semantic relationship | Same domain (CRUD, Interaction, etc.) |
| Consumer usage | Typically needs all operations together |

### When to Use Individual Hooks

- Surgical access to single operation
- Testing in isolation
- Custom prop requirements

## Implementation

### Example: useNoteActions

```typescript
/**
 * Composition Hook for note-level CRUD operations.
 */
export const useNoteActions = (props: UseNoteActionsProps): UseNoteActionsReturn => {
  // CREATE
  const { addNoteToMeasure, addChordToMeasure } = useNoteEntry(props);
  // READ  
  const { handleMeasureHover } = useHoverPreview(props);
  // UPDATE
  const { updateNotePitch } = useNotePitch(props);
  // DELETE
  const { deleteSelected } = useNoteDelete(props);
  
  return { addNoteToMeasure, addChordToMeasure, handleMeasureHover, updateNotePitch, deleteSelected };
};
```

### Documentation Requirements

Composition Hooks MUST include:

1. **File-level JSDoc** with semantic grouping (e.g., CRUD table)
2. **`@see` references** to individual sub-hooks
3. **Guidance** on when to use composition vs. individual hooks

## Consequences

### Positive

- **Reduced verbosity**: ~11 fewer prop assignments per composition hook
- **Clear semantics**: Named abstractions like `useNoteActions` communicate intent
- **Stable API**: Consumers depend on the composition hook, not internal structure
- **Testable sub-hooks**: Individual hooks remain unit-testable

### Negative

- **Indirection**: One additional layer to navigate during debugging
- **Naming discipline**: Poor names create confusion (mitigated by semantic naming)

## Future Applications

Analysis of the current hook architecture identified one additional candidate for the Composition Hook pattern.

### Candidate: useInteraction

| Sub-hook | Props | Responsibility |
|----------|-------|----------------|
| `useNavigation` | 10 | Keyboard/mouse navigation, transposition |
| `useFocusScore` | 13 | Focus restoration, duration input routing |

**Criteria assessment:**

- **Prop overlap:** 7 shared props (scoreRef, selection, setPreviewNote, activeDuration, isDotted, inputMode, previewNote)
- **Semantic cohesion:** Both hooks route user input events to appropriate handlers
- **Prop drilling severity:** `useFocusScore` has the highest prop count (13) across the codebase

**Proposed abstraction:** Bundle these hooks into `useInteraction`, framing the composition around **event routing** (keyboard → navigation, focus → restoration, duration keys → modifier/toolbar).

## Related Documents


- [CODING_PATTERNS.md § Composition Hooks](../CODING_PATTERNS.md)
- [Issue #116](https://github.com/joekotvas/RiffScore/issues/116) - Analysis that led to this decision
- [ADR-009: Explicit Pattern Governance](./009-explicit-pattern-governance.md)
