## Summary
Add an optional decorative rendering mode where the score displays with curved, flowing staff lines - like a musical ribbon.

## Technical Approach

### Simplified Vertical-Only Displacement
- Staff lines: Render as curved SVG path elements
- Everything else: Apply simple Y offset based on X position (no rotation)

### Wave Formula with Decay Envelope
y_final = y_original + (A * E(x)) * sin(Bx + phase)

Where E(x) is a decay envelope (linear, ease-out, or exponential).

### Modular Architecture
Create encapsulated module at src/engines/wave/

### Config Extension
```typescript
ui: {
  waveStaff?: {
    enabled: boolean;
    amplitude: number;
    cycles: number;
    phase: number;
    envelope: 'linear' | 'easeOut' | 'exponential';
    decayRate?: number;
  }
}
```

## Affected Components
- Staff.tsx - Replace line with path
- Note.tsx - Add wave.getOffset(x) to Y
- Beam.tsx - Offset each endpoint Y
- Tie.tsx - Offset control point Ys
- Barlines - Offset top/bottom Y

## Documentation
Technical exploration: docs/temp/static-vector-ribbon-implementation.md
