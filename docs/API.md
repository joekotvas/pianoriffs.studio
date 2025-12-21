[← Back to README](../README.md)

# RiffScore Machine-Addressable API Reference

> Programmatic control of the score editor via JavaScript.

> **See also**: [Cookbook](./COOKBOOK.md) • [Configuration](./CONFIGURATION.md) • [Architecture](./ARCHITECTURE.md)

**Version:** 1.0.0-alpha.3  
**Access:**
-   **React**: `const ref = useRef<MusicEditorAPI>(null)`
-   **Global**: `window.riffScore.get('my-score-id')` or `window.riffScore.active`

---

## Implementation Status

> [!NOTE]
> Methods marked ✅ are **ready to use**. Methods marked ⏳ are **pending implementation** and will return `this` (no-op) or throw for queries.

---

## Design Philosophy

| Principle | Description |
| :--- | :--- |
| **Intent-Based** | Methods describe *what* to do, not *how*. |
| **Fluent/Chainable** | All mutation/navigation methods return `this`. |
| **Synchronous** | State updates are immediate; React render is decoupled. |
| **Multi-Instance** | Registry supports multiple editors on one page. |
| **Fail-Safe** | Invalid inputs are no-ops or clamped to valid ranges. |

---

## 1. Global Registry ✅

### `window.riffScore.get(id)` ✅
| Argument | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Must match `<RiffScore id="..." />` prop. |

**Returns:** `MusicEditorAPI | undefined`

### `window.riffScore.active` ✅
The most recently focused or mounted instance.

**Returns:** `MusicEditorAPI | null`

---

## 2. Navigation

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `move` | `move(direction)` | ⚠️ Partial | Left/Right work; Up/Down pending. |
| `jump` | `jump(target)` | ✅ | `'start-score'`, `'end-score'`, `'start-measure'`, `'end-measure'`. |
| `select` | `select(measureNum, staffIndex?, eventIndex?, noteIndex?)` | ✅ | Absolute targeting (1-based measure). |
| `selectAtQuant` | `selectAtQuant(measureNum, quant, staffIndex?)` | ⏳ | Target by rhythmic position. |
| `selectById` | `selectById(eventId, noteId?)` | ✅ | Target by internal IDs. |

---

## 3. Selection (Multi-Select)

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `addToSelection` | `addToSelection(measureNum, staffIndex, eventIndex)` | ⏳ | Cmd+Click behavior. |
| `selectRangeTo` | `selectRangeTo(measureNum, staffIndex, eventIndex)` | ⏳ | Shift+Click from anchor. |
| `selectAll` | `selectAll(scope)` | ✅ | `'score'`, `'measure'`, `'staff'`, `'event'`. |
| `selectEvent` | `selectEvent(measureNum?, staffIndex?, eventIndex?)` | ✅ | Select all notes in chord. |
| `deselectAll` | `deselectAll()` | ✅ | Clear selection. |
| `selectFullEvents` | `selectFullEvents()` | ✅ | Fill partial chord selections. |
| `extendSelectionUp` | `extendSelectionUp()` | ✅ | Vertical extend toward treble. |
| `extendSelectionDown` | `extendSelectionDown()` | ✅ | Vertical extend toward bass. |
| `extendSelectionAllStaves` | `extendSelectionAllStaves()` | ✅ | Vertical extend to all staves. |

---

## 4. Entry (Create)

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `addNote` | `addNote(pitch, duration?, dotted?)` | ✅ | Append note at cursor; auto-advances. |
| `addRest` | `addRest(duration?, dotted?)` | ✅ | Append rest at cursor. |
| `addTone` | `addTone(pitch)` | ✅ | Stack pitch onto existing chord. |
| `makeTuplet` | `makeTuplet(numNotes, inSpaceOf)` | ⏳ | Convert selection to tuplet. |
| `unmakeTuplet` | `unmakeTuplet()` | ⏳ | Remove tuplet grouping. |
| `toggleTie` | `toggleTie()` | ⏳ | Toggle tie to next note. |
| `setTie` | `setTie(boolean)` | ⏳ | Explicit tie setting. |
| `setInputMode` | `setInputMode('note' \| 'rest')` | ⏳ | Set entry mode. |

---

## 5. Modification (Update)

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `setPitch` | `setPitch(pitch)` | ⏳ | Update selected note(s). |
| `setDuration` | `setDuration(duration, dotted?)` | ⏳ | Update selected event(s). |
| `setAccidental` | `setAccidental(type)` | ⏳ | `'sharp'`, `'flat'`, `'natural'`, `null`. |
| `toggleAccidental` | `toggleAccidental()` | ⏳ | Cycle accidental. |
| `transpose` | `transpose(semitones)` | ⏳ | Chromatic transposition. |
| `transposeDiatonic` | `transposeDiatonic(steps)` | ⏳ | Visual/diatonic transposition. |
| `updateEvent` | `updateEvent(props)` | ⏳ | Generic escape hatch. |

---

## 6. Structure

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `addMeasure` | `addMeasure(atIndex?)` | ⏳ | Add measure (default: end). |
| `deleteMeasure` | `deleteMeasure(measureIndex?)` | ⏳ | Delete measure (default: selected). |
| `deleteSelected` | `deleteSelected()` | ⏳ | Smart delete. |
| `setKeySignature` | `setKeySignature(key)` | ⏳ | Change key signature. |
| `setTimeSignature` | `setTimeSignature(sig)` | ⏳ | Change time signature. |
| `setMeasurePickup` | `setMeasurePickup(isPickup)` | ⏳ | Toggle pickup measure. |

---

## 7. Configuration

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `setClef` | `setClef(clef)` | ⏳ | `'treble'`, `'bass'`, `'grand'`. |
| `setScoreTitle` | `setScoreTitle(title)` | ⏳ | Update title. |
| `setBpm` | `setBpm(number)` | ⏳ | Set tempo. |
| `setTheme` | `setTheme(theme)` | ⏳ | `'LIGHT'`, `'DARK'`, `'WARM'`, `'COOL'`. |
| `setScale` | `setScale(number)` | ⏳ | Zoom factor. |
| `setStaffLayout` | `setStaffLayout(type)` | ⏳ | `'grand'`, `'single'`. |

---

## 8. Lifecycle & IO

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `loadScore` | `loadScore(score)` | ⏳ | Load/replace score. |
| `reset` | `reset(template?, measures?)` | ⏳ | Reset to blank score. |
| `export` | `export(format)` | ⚠️ Partial | `'json'` works; `'abc'`, `'musicxml'` throw. |

---

## 9. Playback

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `play` | `play()` | ⏳ | Start playback. |
| `pause` | `pause()` | ⏳ | Pause playback. |
| `stop` | `stop()` | ⏳ | Stop and rewind. |
| `rewind` | `rewind(measureNum?)` | ⏳ | Jump playback position. |
| `setInstrument` | `setInstrument(instrumentId)` | ⏳ | Change instrument. |

---

## 10. Data (Queries)

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `getScore` | `getScore()` | ✅ | Read-only score state. |
| `getConfig` | `getConfig()` | ✅ | Current config. |
| `getSelection` | `getSelection()` | ✅ | Current selection state. |

---

## 11. History & Clipboard

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `undo` | `undo()` | ⏳ | Undo last mutation. |
| `redo` | `redo()` | ⏳ | Redo last undone. |
| `beginTransaction` | `beginTransaction()` | ⏳ | Start batch (single undo step). |
| `commitTransaction` | `commitTransaction()` | ⏳ | End batch. |
| `copy` | `copy()` | ⏳ | Copy selection. |
| `cut` | `cut()` | ⏳ | Cut selection. |
| `paste` | `paste()` | ⏳ | Paste at cursor. |

---

## 12. Events & Subscriptions

| Method | Signature | Status | Description |
| :--- | :--- | :--- | :--- |
| `on` | `on(event, callback)` | ✅ | Subscribe to state changes. |

### Event Types
- `'score'` — Score mutations
- `'selection'` — Selection changes  
- `'playback'` — Play/pause state (Pending)

**Returns:** `() => void` — Unsubscribe function.

---

## 13. Error Handling

| Scenario | Behavior |
| :--- | :--- |
| Invalid `measureNum` | Clamped to valid range or no-op. |
| Invalid `pitch` format | No-op; console warning. |
| `addTone` on Rest/Empty | No-op (requires selected chord). |
| `addNote`/`addRest` on full measure | No-op; console warning. |
| `export` unknown format | Throws `Error`. |

---

## 14. Usage Examples

### Linear Entry ✅
```javascript
api.select(1).addNote('C4').addNote('D4').addNote('E4');
```

### Build Chord ✅
```javascript
api.select(1).addNote('C4').addTone('E4').addTone('G4');
```

### Query State ✅
```javascript
const score = api.getScore();
const selection = api.getSelection();
console.log(score.title);
```

### Export JSON ✅
```javascript
const json = api.export('json');
localStorage.setItem('score', json);
```

### Batch with Transaction ⏳
```javascript
// PENDING: Transaction support not yet implemented
api.beginTransaction();
for (let i = 0; i < 16; i++) {
  api.addNote(`C${(i % 3) + 4}`, 'sixteenth');
}
api.commitTransaction();
```

### Reactive Integration ✅
```javascript
const unsub = api.on('score', (newScore) => {
  backend.save(newScore);
});
```

---

[← Back to README](../README.md)
