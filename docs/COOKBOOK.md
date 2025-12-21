[← Back to README](../README.md)

# RiffScore Cookbook

> Task-oriented recipes for common use cases.

> **See also**: [API Reference](./API.md) • [Configuration](./CONFIGURATION.md)

---

## 1. Entry Recipes

### Write a C Major Scale

```javascript
const api = window.riffScore.active;

api.select(1)  // Start at measure 1
   .addNote('C4', 'quarter')
   .addNote('D4', 'quarter')
   .addNote('E4', 'quarter')
   .addNote('F4', 'quarter')
   .addNote('G4', 'quarter')
   .addNote('A4', 'quarter')
   .addNote('B4', 'quarter')
   .addNote('C5', 'quarter');
```

### Build a Chord Progression (I-IV-V-I)

```javascript
const api = window.riffScore.active;

// Measure 1: C major chord
api.select(1)
   .addNote('C4', 'half')
   .addTone('E4')
   .addTone('G4');

// Move to next beat and add F major
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

### Enter Rests

```javascript
api.select(1)
   .addNote('C4', 'quarter')
   .addRest('quarter')
   .addNote('E4', 'quarter')
   .addRest('quarter');
```

---

## 2. Editing Recipes

### Transpose Selection Up an Octave

```javascript
api.selectAll('measure')
   .transpose(12);  // +12 semitones = up one octave
```

### Change Duration of Selected Notes

```javascript
api.setDuration('eighth', true);  // true = dotted
```

### Convert Notes to Rests

```javascript
// Select notes first, then toggle to rest
api.selectAll('measure')
   .setInputMode('rest');
```

---

## 3. Batch Operations

### Batch with Transaction (Single Undo Step)

```javascript
api.beginTransaction();

for (let i = 0; i < 16; i++) {
  api.addNote(`C${(i % 3) + 4}`, 'sixteenth');
}

api.commitTransaction();  // All 16 notes = 1 undo step
```

### Fill Measure with Rests

```javascript
api.select(3)  // Measure 3
   .beginTransaction()
   .addRest('whole')
   .commitTransaction();
```

---

## 4. Integration Recipes

### Auto-Save to Backend

```javascript
const api = window.riffScore.active;

const unsub = api.on('score', (newScore) => {
  fetch('/api/scores', {
    method: 'POST',
    body: JSON.stringify(newScore)
  });
});

// Later, when component unmounts:
unsub();
```

### Sync Selection with External UI

```javascript
api.on('selection', (selection) => {
  if (selection.eventId) {
    highlightInExternalPiano(selection.noteId);
  }
});
```

### React to Playback Position

```javascript
api.on('playback', ({ isPlaying, currentMeasure }) => {
  if (isPlaying) {
    scrollToMeasure(currentMeasure);
  }
});
```

---

## 5. Export Recipes

### Save as MusicXML

```javascript
const xml = api.export('musicxml');
downloadFile('score.musicxml', xml, 'application/xml');
```

### Save as JSON

```javascript
const json = api.export('json');
localStorage.setItem('savedScore', json);
```

### Load Saved Score

```javascript
const saved = localStorage.getItem('savedScore');
if (saved) {
  api.loadScore(JSON.parse(saved));
}
```

---

## 6. Multiple Instances

### Target Specific Editor

```javascript
// If you have <RiffScore id="left-hand" /> and <RiffScore id="right-hand" />
const leftApi = window.riffScore.get('left-hand');
const rightApi = window.riffScore.get('right-hand');

leftApi.addNote('C3', 'quarter');
rightApi.addNote('G4', 'quarter');
```

### Get Currently Active Editor

```javascript
const api = window.riffScore.active;  // Most recently focused
```

---

[← Back to README](../README.md)
