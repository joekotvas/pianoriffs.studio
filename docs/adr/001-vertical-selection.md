# ADR-001: Slice-Based Vertical Selection

> **Status**: Accepted  
> **Date**: 2025-12-21  
> **Issue**: #101

## Context

RiffScore needed vertical selection expansion (`Cmd+Shift+Up/Down`) to complement horizontal range selection. The challenge was supporting:

1. **Single chords**: Expand within a chord, then cross-staff
2. **Multiple disjoint selections**: Independent expansion of non-contiguous chords
3. **Anchor-based model**: Enable both expansion and contraction

## Decision

We implemented a **Slice-Based** vertical selection model where each time-point (vertical slice) is processed independently.

### Key Design Choices

| Aspect | Decision |
|--------|----------|
| **Selection Model** | Per-slice independence (not 2D rectangle) |
| **Anchor Inference** | Direction-based: Top for down, Bottom for up |
| **Vertical Ordering** | Unified metric: `((10 - staffIndex) * 1000) + midi` |
| **Cursor State** | Implicit (derived from selection extremes) |

### Algorithm Summary

1. Determine **Global Orientation** from anchor/focus relationship
2. Group selected notes by **time slice**
3. For each slice:
   - Identify slice anchor (fixed edge) and cursor (moving edge)
   - Move cursor in the vertical stack
   - Collect range between anchor and new cursor
4. Return combined selection

## Consequences

### Positive

- **Intuitive multi-chord editing**: Disjoint chords expand simultaneously
- **Natural contraction**: Reversing direction contracts from moving edge
- **Cross-staff support**: Seamless via vertical metric abstraction

### Negative

- **Complexity**: Orientation logic requires careful anchor/focus tracking
- **No explicit cursor**: Harder to debug selection behavior

### Neutral

- Selection changes don't affect undo/redo (by design)
- No audio feedback on expansion (intentional)

## Alternatives Considered

1. **2D Rectangle Model**: Simpler but loses disjoint selection independence
2. **Event-Filling Model**: Fills entire events before cross-staff; felt clunky
3. **Explicit Cursor State**: More predictable but adds state complexity

## Related

- [SELECTION.md](./SELECTION.md) - Selection system documentation
- [KEYBOARD_NAVIGATION.md](./KEYBOARD_NAVIGATION.md) - Shortcut reference
- [ExtendSelectionVerticallyCommand.ts](../src/commands/selection/ExtendSelectionVerticallyCommand.ts) - Implementation
