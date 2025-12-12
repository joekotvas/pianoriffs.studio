# RiffScore

**RiffScore** is a self-hostable, embeddable sheet music editor for React.

Unlike commercial platforms that require users to leave your site or pay subscription fees, RiffScore allows you to embed interactive, editable scores directly into your application.

## Installation

```bash
npm install riffscore
```

## Quick Start

```tsx
import { RiffScore } from 'riffscore';

function App() {
  return <RiffScore />;
}
```

That's it! RiffScore renders a fully interactive grand staff editor with sensible defaults.

### With Configuration

```tsx
<RiffScore config={{
  score: { 
    staff: 'treble',      // 'grand' | 'treble' | 'bass'
    measureCount: 4,
    keySignature: 'G'
  }
}} />
```

### Read-Only Mode

```tsx
<RiffScore config={{
  ui: { showToolbar: false },
  interaction: { isEnabled: false }
}} />
```

See the [Configuration Guide](./docs/CONFIGURATION.md) for all available options.

---

## Documentation

| Guide | Description |
|-------|-------------|
| 📖 [Configuration Guide](./docs/CONFIGURATION.md) | Complete API reference for config options |
| 📘 [Architecture Guide](./docs/ARCHITECTURE.md) | Technical reference for developers |
| 🎨 [Interaction Design Guide](./docs/INTERACTION.md) | Guide to the intuitive editing behavior |

---

## Features

*   **Self-Hostable**: No external dependencies or platform lock-in.
*   **Embeddable**: Drop it into any React application.
*   **Configurable**: Full control over UI, interactions, and score content.
*   **SMuFL Compliance**: Beautiful engraving using the [Bravura](https://github.com/steinbergmedia/bravura) font.
*   **Interactive**: Full editing capabilities right in the browser.
*   **Audio Engine**: Playback via [Tone.js](https://tonejs.github.io/).

---

## Repository Structure

```
riffscore/
├── src/        ← Library source
├── demo/       ← Next.js demo app
├── dist/       ← Built library (ESM/CJS/DTS)
└── tsup.config.ts
```

### Development

```bash
# Install dependencies
npm install
cd demo && npm install

# Build library
npm run build

# Run demo
npm run demo:dev
```

---

## Coming Soon

*   **Imperative API**: Programmatically control the score (e.g., `score.addNote(...)`)
*   **Chord Symbols**: Input and playback for lead sheets
*   **Import**: MusicXML import
