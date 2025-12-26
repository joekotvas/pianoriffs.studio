# Score Wave Effect Exploration

> Feature exploration for rendering the score with flowing, curved staff lines – like a musical river where the notation undulates along a wave path.

![Inspiration](https://media.istockphoto.com/id/1560239812/vector/waving-music-notes-musical-swirl-vector-illustration.jpg?s=612x612&w=0&k=20&c=cvbmXeXaOvIWmLNvtoDzcB51QR47WOMo9Lk7548TV-M=)

## Vision

Render the score with **curved/flowing staff lines** where the entire staff undulates in a wave pattern. Notes, clefs, and other symbols follow the curvature of the staff. This creates an organic, artistic presentation rather than traditional rigid horizontal lines.

---

## Technical Challenge

This is fundamentally different from applying a distortion filter. The staff lines and note positions must be **mathematically transformed** along a wave path:

- Staff lines become bezier curves or sine wave paths
- Each note's Y position is calculated based on its X position on the wave
- Note heads, stems, and beams must rotate to stay perpendicular to the wave tangent

---

## Technical Approaches

### Option 1: SVG Path Rendering (Recommended)

**Approach:** Replace straight staff line rendering with curved SVG paths, and calculate note positions along the wave.

**How it works:**
1. Define a wave function: `y = baseY + amplitude * sin(x * frequency + phase)`
2. Render staff lines as SVG `<path>` elements following the wave
3. For each note, calculate its Y offset based on its X position in the wave
4. Rotate note elements to match the wave's tangent angle at that point

```typescript
// Wave function
function getWaveY(x: number, baseY: number, amplitude: number, frequency: number): number {
  return baseY + amplitude * Math.sin(x * frequency);
}

// Tangent angle for rotation
function getWaveAngle(x: number, amplitude: number, frequency: number): number {
  // Derivative of sin is cos
  const slope = amplitude * frequency * Math.cos(x * frequency);
  return Math.atan(slope) * (180 / Math.PI); // Convert to degrees
}
```

**Staff line path generation:**
```typescript
function generateWaveStaffPath(
  startX: number, 
  endX: number, 
  baseY: number,
  amplitude: number,
  frequency: number
): string {
  const points: string[] = [];
  const step = 5; // Pixels between path points
  
  for (let x = startX; x <= endX; x += step) {
    const y = getWaveY(x, baseY, amplitude, frequency);
    points.push(x === startX ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  
  return points.join(' ');
}
```

**Pros:**
- No external dependencies
- Full control over wave parameters
- Works with existing SVG rendering
- Crisp at any zoom level

**Cons:**
- Significant refactor of staff/note positioning logic
- Beams and ties need special handling
- More complex hit detection for click interactions

---

### Option 2: CSS/SVG Transform Along Path

**Approach:** Use SVG `<textPath>` or CSS `offset-path` to position elements along a curved path.

```html
<path id="staffWave" d="M 0,100 Q 200,50 400,100 T 800,100" />
<text>
  <textPath href="#staffWave">♩ ♪ ♫ ♬</textPath>
</text>
```

**Pros:**
- Browser handles positioning math
- Simple implementation for basic effects

**Cons:**
- Limited to text/simple shapes
- Complex notation (beams, slurs) won't follow path naturally
- Poor control over individual element rotation

---

### Option 3: Canvas 2D with Wave Transform

**Approach:** Render score to canvas, applying wave transformation during drawing.

**How it works:**
1. For each horizontal slice of the score, calculate wave offset
2. Draw slice at transformed Y position
3. Apply rotation based on wave tangent

**Pros:**
- Works with any rendering approach
- Can be applied as post-processing

**Cons:**
- Rasterized output (not crisp at all zoom levels)
- Complex to maintain interactivity
- Performance overhead

---

### Option 4: WebGL Vertex Displacement

**Approach:** Render score to texture, apply to subdivided plane, displace vertices along wave in shader.

**Pros:**
- GPU accelerated
- Smooth animation potential

**Cons:**
- Overkill for static wave
- Rasterized texture (resolution issues)
- Large dependency (Three.js)
- Complex integration

---

## Recommended Approach: SVG Path Rendering

For RiffScore, **Option 1 (SVG Path Rendering)** is recommended because:

1. **Native to existing architecture** – RiffScore already uses SVG
2. **Resolution independent** – Crisp at any scale
3. **No dependencies** – Pure math + SVG paths
4. **Maintainable** – Wave parameters can be config-driven

---

## Implementation Considerations

### Layout Engine Changes

The wave affects vertical positioning throughout:

| Component | Change Required |
|-----------|-----------------|
| Staff lines | Render as wave `<path>` instead of straight `<line>` |
| Notes | Calculate Y from wave function at note's X |
| Stems | Rotate to perpendicular of wave tangent |
| Beams | Curve to follow wave or render as sloped lines |
| Barlines | Optional: curve with staff or stay vertical |
| Clefs/Signatures | Position on wave, rotate to tangent |

### Config Extension

```typescript
ui: {
  waveStaff?: {
    enabled: boolean;       // Default: false
    amplitude: number;      // Pixels of wave height (default: 20)
    frequency: number;      // Wave cycles per score width (default: 2)
    phase?: number;         // Starting phase offset (default: 0)
  }
}
```

### When to Apply

- **Static display mode only** – Wave layout is for artistic/decorative rendering
- **Not for editing** – Click positions would be confusing during note entry
- **Export/embed use case** – Perfect for generating pretty score images

---

## Complexity Estimate

| Task | Effort |
|------|--------|
| Wave math utilities | Low |
| Staff line path rendering | Medium |
| Note Y positioning | Medium |
| Stem/beam rotation | High |
| Slur/tie curve adjustment | High |
| Clef/signature positioning | Medium |
| Click detection updates | High |

**Total:** Significant refactor (~2-3 days focused work)

---

## Open Questions

1. Should barlines follow the wave or stay vertical?
2. Should the wave be static or animate (phase shifts over time)?
3. Should wave parameters be per-staff (different waves for treble/bass)?
4. How to handle grand staff brace with curved staves?

---

## Next Steps

1. Create proof-of-concept with wave staff lines only
2. Add note positioning along wave
3. Handle stem/beam rotation
4. Evaluate visual appeal and decide on full implementation
