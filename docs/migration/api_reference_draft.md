# RiffScore Machine-Addressable API Reference

**Version:** 1.0.0-rc1 (Round 2 Spiral)
**Access:**
-   **React**: `const ref = useRef<MusicEditorAPI>(null)`
-   **Global**: `window.riffScore.get('my-score-id')` or `window.riffScore.active`

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

## 1. Global Registry

### `window.riffScore.get(id)`
| Argument | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Must match `<RiffScore id="..." />` prop. |

**Returns:** `MusicEditorAPI | undefined`

### `window.riffScore.active`
The most recently focused or mounted instance.

**Returns:** `MusicEditorAPI | null`

---

## 2. Navigation

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `move` | `move(direction)` | `this` | Relative move; wraps measures, cycles staves. |
| `jump` | `jump(target)` | `this` | `'start-score'`, `'end-score'`, `'start-measure'`, `'end-measure'`. |
| `select` | `select(measureNum, staffIndex?, eventIndex?)` | `this` | Absolute targeting (1-based measure). |
| `selectAtQuant` | `selectAtQuant(measureNum, quant, staffIndex?)` | `this` | Target by rhythmic position. |
| `selectById` | `selectById(eventId, noteId?)` | `this` | Target by internal IDs. |

---

## 3. Selection (Multi-Select)

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `addToSelection` | `addToSelection(measureNum, staffIndex, eventIndex)` | `this` | Cmd+Click behavior. |
| `selectRangeTo` | `selectRangeTo(measureNum, staffIndex, eventIndex)` | `this` | Shift+Click from anchor. |
| `selectAll` | `selectAll(scope)` | `this` | `'score'`, `'measure'`, `'staff'`. |
| `deselectAll` | `deselectAll()` | `this` | Clear selection. |

---

## 4. Entry (Create)

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `addNote` | `addNote(pitch, duration?, dotted?)` | `this` | Append note at cursor; auto-advances. |
| `addRest` | `addRest(duration?, dotted?)` | `this` | Append rest at cursor. |
| `addTone` | `addTone(pitch)` | `this` | Stack pitch onto existing chord. |
| `makeTuplet` | `makeTuplet(numNotes, inSpaceOf)` | `this` | Convert selection to tuplet. |
| `unmakeTuplet` | `unmakeTuplet()` | `this` | Remove tuplet grouping. |
| `toggleTie` | `toggleTie()` | `this` | Toggle tie to next note. |
| `setTie` | `setTie(boolean)` | `this` | Explicit tie setting. |
| `setInputMode` | `setInputMode('note' | 'rest')` | `this` | Set entry mode. |

---

## 5. Modification (Update)

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `setPitch` | `setPitch(pitch)` | `this` | Update selected note(s). |
| `setDuration` | `setDuration(duration, dotted?)` | `this` | Update selected event(s). |
| `setAccidental` | `setAccidental(type)` | `this` | `'sharp'`, `'flat'`, `'natural'`, `null`. |
| `toggleAccidental` | `toggleAccidental()` | `this` | Cycle accidental. |
| `transpose` | `transpose(semitones)` | `this` | Chromatic transposition. |
| `transposeDiatonic` | `transposeDiatonic(steps)` | `this` | Visual/diatonic transposition. |
| `updateEvent` | `updateEvent(props)` | `this` | Generic escape hatch. |

---

## 6. Structure

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `addMeasure` | `addMeasure(atIndex?)` | `this` | Add measure (default: end). |
| `deleteMeasure` | `deleteMeasure(measureIndex?)` | `this` | Delete measure (default: selected). |
| `deleteSelected` | `deleteSelected()` | `this` | Smart delete. |
| `setKeySignature` | `setKeySignature(key)` | `this` | Change key signature. |
| `setTimeSignature` | `setTimeSignature(sig)` | `this` | Change time signature. |
| `setMeasurePickup` | `setMeasurePickup(isPickup)` | `this` | Toggle pickup measure. |

---

## 7. Configuration

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `setClef` | `setClef(clef)` | `this` | `'treble'`, `'bass'`, `'alto'`. |
| `setScoreTitle` | `setScoreTitle(title)` | `this` | Update title. |
| `setBpm` | `setBpm(number)` | `this` | Set tempo. |
| `setTheme` | `setTheme(theme)` | `this` | `'LIGHT'`, `'DARK'`, `'WARM'`, `'COOL'`. |
| `setScale` | `setScale(number)` | `this` | Zoom factor. |
| `setStaffLayout` | `setStaffLayout(type)` | `this` | `'grand'`, `'single'`. |

---

## 8. Lifecycle & IO

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `loadScore` | `loadScore(score)` | `this` | Load/replace score. |
| `reset` | `reset(template?, measures?)` | `this` | Reset to blank score. |
| `export` | `export(format)` | `string` | `'json'`, `'abc'`, `'musicxml'`. |

---

## 9. Playback

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `play` | `play()` | `this` | Start playback. |
| `pause` | `pause()` | `this` | Pause playback. |
| `stop` | `stop()` | `this` | Stop and rewind. |
| `rewind` | `rewind(measureNum?)` | `this` | Jump playback position. |
| `setInstrument` | `setInstrument(voiceId)` | `this` | Change instrument. |

---

## 10. Data (Queries)

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `getScore` | `getScore()` | `Score` | Read-only score state. |
| `getConfig` | `getConfig()` | `RiffScoreConfig` | Current config. |
| `getSelection` | `getSelection()` | `Selection` | Current selection state. |

---

## 11. History & Clipboard

| Method | Signature | Returns | Description |
| :--- | :--- | :--- | :--- |
| `undo` | `undo()` | `this` | Undo last mutation. |
| `redo` | `redo()` | `this` | Redo last undone. |
| `beginTransaction` | `beginTransaction()` | `this` | Start batch (single undo step). |
| `commitTransaction` | `commitTransaction()` | `this` | End batch. |
| `copy` | `copy()` | `this` | Copy selection. |
| `cut` | `cut()` | `this` | Cut selection. |
| `paste` | `paste()` | `this` | Paste at cursor. |

---

## 12. Events & Subscriptions

### `on(event, callback)`
| Argument | Type | Notes |
| :--- | :--- | :--- |
| `event` | `string` | `'score'`, `'selection'`, `'playback'`. |
| `callback` | `Function` | Receives new state. |

**Returns:** `() => void` – Unsubscribe function.

#### Event Payloads
| Event | Payload |
| :--- | :--- |
| `'score'` | `Score` object |
| `'selection'` | `Selection` object |
| `'playback'` | `{ isPlaying: boolean, currentMeasure: number }` |

---

## 13. Error Handling

| Scenario | Behavior |
| :--- | :--- |
| Invalid `measureNum` | Clamped to valid range. |
| Invalid `pitch` format | No-op; console warning. |
| `addTone` on Rest/Empty | No-op; console warning. |
| `export` unknown format | Throws `Error`. |

---

## 14. Usage Examples

### Linear Entry
```javascript
api.select(1).addNote('C4').addNote('D4').addNote('E4');
```

### Batch with Transaction
```javascript
api.beginTransaction();
for (let i = 0; i < 16; i++) {
  api.addNote(`C${(i % 3) + 4}`, 'sixteenth');
}
api.commitTransaction(); // Single undo step, single render
```

### Reactive Integration
```javascript
const unsub = api.on('score', (newScore) => {
  backend.save(newScore);
});
// Later: unsub();
```
