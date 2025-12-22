[← Back to README](../README.md)

# RiffScore Cookbook

> Task-oriented recipes for common use cases.

> **See also**: [API Reference](./API.md) • [Configuration](./CONFIGURATION.md)

> [!NOTE]
> Recipes marked ✅ **work now**. Recipes marked ⏳ require **pending API methods**.

---

## 1. Entry Recipes ✅

### Write a C Major Scale ✅

```javascript
const api = window.riffScore.active;

api.select(1)  // Start at measure 1 (1-based)
   .addNote('C4', 'quarter')
   .addNote('D4', 'quarter')
   .addNote('E4', 'quarter')
   .addNote('F4', 'quarter')
   .addNote('G4', 'quarter')
   .addNote('A4', 'quarter')
   .addNote('B4', 'quarter')
   .addNote('C5', 'quarter');
```

### Build a Chord Progression (I-IV-V-I) ✅

```javascript
const api = window.riffScore.active;

// Measure 1: C major chord
api.select(1)
   .addNote('C4', 'half')
   .addTone('E4')
   .addTone('G4');

// Cursor auto-advances; add F major
api.addNote('F4', 'half')
   .addTone('A4')
   .addTone('C5');

// Measure 2: G major then C major
api.addNote('G4', 'half')
   .addTone('B4')
   .addTone('D5')
   .addNote('C4', 'half')
   .addTone('E4')
   .addTone('G4');
```

### Enter Rests ✅

```javascript
api.select(1)
   .addNote('C4', 'quarter')
   .addRest('quarter')
   .addNote('E4', 'quarter')
   .addRest('quarter');
```

---

## 2. Editing Recipes

### Transpose Selection Up an Octave ✅

```javascript
api.selectAll('measure')
   .transposeDiatonic(7);  // +7 steps = up one octave (diatonic)
```

### Change Duration of Selected Notes ⏳

```javascript
// PENDING: setDuration() not yet implemented
api.setDuration('eighth', true);  // true = dotted
```

### Convert Notes to Rests ✅

```javascript
api.selectAll('measure')
   .setInputMode('rest');  // Switch to rest entry mode
```

---

## 3. Batch Operations ⏳

### Batch with Transaction (Single Undo Step) ✅

```javascript
api.beginTransaction();

for (let i = 0; i < 16; i++) {
  api.addNote(`C${(i % 3) + 4}`, 'sixteenth');
}

api.commitTransaction('Add Scale Run');  // All 16 notes = 1 undo step
```

> **Note**: Without transactions, each `addNote` is a separate undo step. Transactions ensure atomicity for complex scripts.

### Fill Measure with Rest ✅

```javascript
api.select(3)  // Measure 3
   .addRest('whole');
```

---

## 4. Integration Recipes

> [!NOTE]
> **Callback Timing:** Event callbacks fire after React processes state updates (via `useEffect`), not synchronously.
> This ensures callbacks receive guaranteed-fresh data. See [API.md > Events](./API.md#12-events--subscriptions) for details.

### Auto-Save to Backend ✅

```javascript
const unsub = api.on('score', (newScore) => {
  fetch('/api/scores', {
    method: 'POST',
    body: JSON.stringify(newScore)
  });
});
```

### Sync Selection with External UI ✅

```javascript
api.on('selection', (selection) => {
  if (selection.eventId) {
    highlightInExternalPiano(selection.noteId);
  }
});
```

### React to Playback Position ✅

```javascript
// Playback API is now fully integrated with Tone.js
api.play();  // Start playback
api.pause(); // Pause (retains position)
api.stop();  // Stop and reset to beginning
api.rewind(2); // Jump to measure 2
```

---

## 5. Export Recipes

### Save as JSON ✅

```javascript
const json = api.export('json');
localStorage.setItem('savedScore', json);
```

### Save as MusicXML ✅

```javascript
const xml = api.export('musicxml');
downloadFile('score.musicxml', xml, 'application/xml');
```

### Load Saved Score ✅

```javascript
const saved = localStorage.getItem('savedScore');
if (saved) {
  api.loadScore(JSON.parse(saved));
}
```

> **Note**: `loadScore` replaces the entire current composition.

---

## 6. Query Recipes ✅

### Get Current Score State ✅

```javascript
const score = api.getScore();
console.log('Title:', score.title);
console.log('Measures:', score.staves[0].measures.length);
```

### Get Current Selection ✅

```javascript
const sel = api.getSelection();
console.log('Staff:', sel.staffIndex);
console.log('Event ID:', sel.eventId);
console.log('Selected notes:', sel.selectedNotes.length);
```

### Get Configuration ✅

```javascript
const config = api.getConfig();
console.log('BPM:', config.score?.bpm);
```

---

## 7. Multiple Instances ✅

### Target Specific Editor ✅

```javascript
// If you have <RiffScore id="left-hand" /> and <RiffScore id="right-hand" />
const leftApi = window.riffScore.get('left-hand');
const rightApi = window.riffScore.get('right-hand');

leftApi?.addNote('C3', 'quarter');
rightApi?.addNote('G4', 'quarter');
```

### Get Currently Active Editor ✅

```javascript
const api = window.riffScore.active;  // Most recently focused/mounted
if (api) {
  api.addNote('C4', 'quarter');
}
```

---

[← Back to README](../README.md)
