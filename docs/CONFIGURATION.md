[← Back to README](../README.md)

# RiffScore Configuration Guide

Complete reference for configuring the `<RiffScore />` component.

> **See also**: [API Reference](./API.md) • [Cookbook](./COOKBOOK.md) • [Architecture](./ARCHITECTURE.md) • [Interaction Design](./INTERACTION.md)

## Basic Usage

```tsx
import { RiffScore } from 'riffscore';

// Default configuration
<RiffScore />

// With custom config
<RiffScore config={{
  ui: { showToolbar: true, scale: 1 },
  interaction: { isEnabled: true },
  score: { staff: 'grand', measureCount: 4 }
}} />
```

## Configuration Interface

```typescript
interface RiffScoreConfig {
  ui: {
    showToolbar: boolean;  // Show/hide the toolbar
    scale: number;         // Zoom scale factor
    theme?: ThemeName;     // 'dark' | 'cool' | 'warm' | 'light'
  };
  interaction: {
    isEnabled: boolean;      // Master switch for all interactions
    enableKeyboard: boolean; // Keyboard shortcuts
    enablePlayback: boolean; // Playback controls
  };
  score: {
    title: string;           // Score title
    bpm: number;             // Beats per minute
    timeSignature: string;   // e.g., '4/4', '3/4', '6/8'
    keySignature: string;    // e.g., 'C', 'G', 'Bb'
    staff?: StaffTemplate;   // 'grand' | 'treble' | 'bass'
    measureCount?: number;   // Number of measures to generate
    staves?: Staff[];        // Explicit content (overrides generator)
  };
}
```

## Default Values

| Property | Default |
|----------|---------|
| `ui.showToolbar` | `true` |
| `ui.scale` | `1` |
| `ui.theme` | `'dark'` |
| `interaction.isEnabled` | `true` |
| `interaction.enableKeyboard` | `true` |
| `interaction.enablePlayback` | `true` |
| `score.title` | `'Untitled'` |
| `score.bpm` | `120` |
| `score.timeSignature` | `'4/4'` |
| `score.keySignature` | `'C'` |
| `score.staff` | `'grand'` |
| `score.measureCount` | `4` |

---

## Modes

### Generator Mode

Create blank scores from templates by specifying `staff` and `measureCount`:

```tsx
// Grand staff (treble + bass) with 8 measures
<RiffScore config={{
  score: { staff: 'grand', measureCount: 8 }
}} />

// Single treble staff in G major
<RiffScore config={{
  score: { 
    staff: 'treble', 
    measureCount: 4,
    keySignature: 'G'
  }
}} />
```

### Render Mode

Load existing compositions by providing a `staves` array. When `staves` is provided, it overrides the Generator Mode options:

```tsx
const myComposition = {
  staves: [
    {
      id: 'staff-1',
      clef: 'treble',
      keySignature: 'D',
      measures: [/* your measures */]
    }
  ]
};

<RiffScore config={{
  score: { staves: myComposition.staves }
}} />
```

---

## UI Configuration

### Hide Toolbar

```tsx
<RiffScore config={{
  ui: { showToolbar: false }
}} />
```

### Scaled Display

```tsx
// 75% scale for compact views
<RiffScore config={{
  ui: { scale: 0.75 }
}} />

// 150% scale for detailed editing
<RiffScore config={{
  ui: { scale: 1.5 }
}} />
```

### Theme Selection

```tsx
// Available themes: 'dark', 'cool', 'warm', 'light'
<RiffScore config={{
  ui: { theme: 'cool' }
}} />
```

---

## Interaction Configuration

### Read-Only Mode

Disable all interactions for static score display:

```tsx
<RiffScore config={{
  interaction: { isEnabled: false }
}} />
```

### Disable Keyboard Shortcuts

```tsx
<RiffScore config={{
  interaction: { enableKeyboard: false }
}} />
```

### Disable Playback

```tsx
<RiffScore config={{
  interaction: { enablePlayback: false }
}} />
```

---

## Score Content

### Key Signatures

Supported keys: `C`, `G`, `D`, `A`, `E`, `B`, `F#`, `C#`, `F`, `Bb`, `Eb`, `Ab`, `Db`, `Gb`, `Cb`

Minor keys: `Am`, `Em`, `Bm`, `F#m`, `C#m`, `G#m`, `D#m`, `A#m`, `Dm`, `Gm`, `Cm`, `Fm`, `Bbm`, `Ebm`, `Abm`

```tsx
<RiffScore config={{
  score: { keySignature: 'Bb' }
}} />
```

### Time Signatures

Supported: `4/4`, `3/4`, `2/4`, `6/8`

```tsx
<RiffScore config={{
  score: { timeSignature: '3/4' }
}} />
```

### Tempo

```tsx
<RiffScore config={{
  score: { bpm: 140 }
}} />
```

---

## Partial Configuration

You only need to specify the values you want to override. Everything else uses defaults:

```tsx
// Only change the key signature
<RiffScore config={{
  score: { keySignature: 'G' }
}} />

// Only hide the toolbar
<RiffScore config={{
  ui: { showToolbar: false }
}} />
```
