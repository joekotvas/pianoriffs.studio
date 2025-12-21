# RiffScore

![npm version](https://img.shields.io/npm/v/riffscore)
![license](https://img.shields.io/npm/l/riffscore)

**RiffScore** is a self-hostable, embeddable sheet music editor for React.

Unlike commercial platforms that require users to leave your site or pay subscription fees, RiffScore allows you to embed interactive, editable scores directly into your application.

![RiffScore Editor](./docs/images/2025-12-15-ui-for-readme.png)

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

---

## Features

*   **Self-Hostable**: No external dependencies or platform lock-in.
*   **Embeddable**: Drop it into any React application.
*   **Configurable**: Full control over UI, interactions, and score content.
*   **Imperative API**: Programmatically control the score via `window.riffScore` ([API Reference](./docs/API.md))
*   **SMuFL Compliance**: Beautiful engraving using the [Bravura](https://github.com/steinbergmedia/bravura) font.
*   **Music Engine**: Powered by [Tonal.js](https://github.com/tonaljs/tonal) for music theory and [Tone.js](https://tonejs.github.io/) for playback.
*   **Export Options**: JSON, MusicXML, and ABC notation export.
*   **Theming**: Built-in dark, light, cool, and warm themes.
*   **MIDI Input**: Connect a MIDI keyboard for note entry.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1`-`7` | Set note duration (64th to whole) |
| `.` | Toggle dotted |
| `R` | Toggle note/rest mode |
| `T` | Toggle tie |
| `Space` | Play / Pause |
| `↑` / `↓` | Transpose selection |
| `←` / `→` | Navigate through timeline |
| `Shift+←/→` | Extend selection horizontally |
| `Esc` | Clear selection / Cancel |

| Mac | Windows | Action |
|-----|---------|--------|
| `Cmd+Z` | `Ctrl+Z` | Undo |
| `Cmd+Shift+Z` | `Ctrl+Y` | Redo |
| `Cmd+A` | `Ctrl+A` | Select all (progressive scope) |
| `Cmd+Shift+↑/↓` | `Ctrl+Shift+↑/↓` | Extend selection vertically |

See the [Interaction Guide](./docs/INTERACTION.md) for the complete keyboard reference.

---

## Documentation

### Getting Started

| Guide | Description |
|-------|-------------|
| 📖 [Configuration](./docs/CONFIGURATION.md) | All config options for `<RiffScore />` |
| 🎹 [API Reference](./docs/API.md) | Imperative API for script control |
| 📗 [Cookbook](./docs/COOKBOOK.md) | Task-oriented recipes and examples |

### Deep Dives

| Guide | Description |
|-------|-------------|
| 🎨 [Interaction Design](./docs/INTERACTION.md) | UX philosophy and editor states |
| ⌨️ [Keyboard Navigation](./docs/KEYBOARD_NAVIGATION.md) | Navigation state machine details |
| 🎯 [Selection Model](./docs/SELECTION.md) | Multi-selection and vertical extension |

### Architecture

| Guide | Description |
|-------|-------------|
| 📘 [Architecture](./docs/ARCHITECTURE.md) | Technical overview and layer design |
| 🧱 [Data Model](./docs/DATA_MODEL.md) | Score schema and quant system |
| 🔧 [Commands](./docs/COMMANDS.md) | Command pattern reference |
| 🎼 [Layout Engine](./docs/LAYOUT_ENGINE.md) | Engraving and positioning |

### Contributing

| Guide | Description |
|-------|-------------|
| 🤝 [Contributing](./docs/CONTRIBUTING.md) | Dev setup and guidelines |
| 🧪 [Testing](./docs/TESTING.md) | Test patterns and fixtures |
| 📋 [Changelog](./CHANGELOG.md) | Release history |

---

## Imperative API

Control the editor programmatically:

```javascript
const api = window.riffScore.active;

api.select(1)              // Measure 1
   .addNote('C4', 'quarter')
   .addNote('E4')
   .addNote('G4')
   .addTone('C5');          // Stack into chord
```

See the [API Reference](./docs/API.md) for all available methods.

---

## Repository Structure

```
riffscore/
├── src/        ← Library source
├── demo/       ← Next.js demo app
├── docs/       ← Documentation
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

*   **Event Subscriptions**: `api.on('score', callback)` for reactive integrations
*   **Transaction Batching**: Group operations into single undo steps
*   **Chord Symbols**: Input and playback for lead sheets
*   **Import**: ABC and MusicXML import
