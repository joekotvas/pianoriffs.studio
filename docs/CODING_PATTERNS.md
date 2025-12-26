# RiffScore Coding Patterns & Standards

This document serves as a high-level guide for both human and agentic developers working on the RiffScore codebase. It outlines established patterns/utilities to prevent "reinventing the wheel" and ensure consistency.

## 1. Architectural Patterns

### Command / Dispatch Pattern


All state mutations should be encapsulated in Command classes that implement the `Command` interface (`execute` and `undo`).
Do NOT mutate the Global Score state directly in React components.
Dispatch commands via the `useScoreLogic` hook or `useTransactionBatching`.

```typescript
// See src/commands/SetClefCommand.ts
export class MyMutationCommand implements Command {
  execute(score: Score): Score { ... }
  undo(score: Score): Score { ... }
}

// Dispatch it
const { dispatch } = useScoreLogic();
dispatch(new MyMutationCommand(args));
```

See also: [docs/COMMANDS.md](./COMMANDS.md)

### Selection Dispatch Pattern


Selection changes are also Commands, but they mutate the `Selection` state rather than the `Score`.
They implement `SelectionCommand` and are dispatched to the `SelectionEngine`.
This ensures selection history (undo/redo) works alongside score mutations.

```typescript
// See src/commands/selection/SetSelectionCommand.ts
export class SetSelectionCommand implements SelectionCommand {
  type = 'SET_SELECTION';
  execute(state: Selection, score: Score): Selection { ... }
}

// Dispatch it
const { selectionEngine } = useScoreLogic();
selectionEngine.dispatch(new SetSelectionCommand(args));
```

See also: [docs/SELECTION.md](./SELECTION.md), [ADR-005](./adr/005-selection-dispatch-pattern.md)

### Feature Hooks (Composition)


`useScoreLogic` is the "Root Orchestrator". It typically does not contain logic itself but composes smaller, specialized hooks:
- `useNoteActions`: Note entry logic
- `useNavigation`: Movement logic
- `useModifiers`: Duration/Dot logic

When adding new features, create a dedicated hook (e.g., `useMyFeature.ts`) and compose it into `useScoreLogic` rather than bloating the main hook.

```typescript
// src/hooks/useScoreLogic.ts acts as a centralized orchestrator
export const useScoreLogic = (initialScore?: Partial<Score>) => {
  // 1. Core State
  const { score, dispatch } = useScoreEngine(initialScore);
  
  // 2. Specialized Feature Hooks
  const selection = useSelection(score);
  const navigation = useNavigation(score, selection);
  const entry = useNoteActions(score, selection, dispatch);
  
  // 3. compose return object
  return { score, dispatch, selection, navigation, entry };
};
```

See also: [docs/ARCHITECTURE.md](./ARCHITECTURE.md)

### Service Layer


Pure business logic that DOES NOT depend on React or the Score State should live in `src/services`.
Example: `MusicService` handles theory (frequencies, scales) and is stateless.
Services should be importable by both React components and plain TypeScript classes (like Commands).

```typescript
// src/services/MusicService.ts
import { Note } from 'tonal';

// Pure function, no state
export const getFrequency = (pitch: string): number => Note.freq(pitch) ?? 0;

export const getMidi = (pitch: string): number => Note.midi(pitch) ?? 60;
```

See also: [docs/ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 2. Directory Structure

- **`src/engines`**: "Systems" that run independently of React rendering (e.g., Audio Engine, Selection Engine).
- **`src/commands`**: State mutation logic (Reversible).
- **`src/services`**: Stateless business logic / utilities.
- **`src/utils`**: Low-level helpers (ID generation, array math).
- **`src/hooks`**: React connection layer.
- **`src/components`**: Visual presentation.

---

## 3. Core Utilities

### ID Generation


Do NOT use `Date.now()` or `Math.random()` directly.
Use the typed factory functions in `src/utils/id.ts` for all entity IDs. These ensure consistent formatting and prefixes for debugging.

```typescript
// See src/utils/id.ts
import { measureId, noteId, eventId } from '@/utils/id';

const newMeasure = {
  id: measureId(), // "measure_a1b2c3d4"
  // ...
};
```

See also: [docs/DATA_MODEL.md](./DATA_MODEL.md)

### Note Object Creation


Do NOT manually construct Note objects literal by literal if possible.
Use `createNotePayload` to ensure all fields (like `id`) are correctly populated.

```typescript
// See src/utils/entry/notePayload.ts
import { createNotePayload } from '@/utils/entry/notePayload';

const note = createNotePayload({
  pitch: 'C4',
  accidental: 'sharp',
  tied: false
});
```

### Time & Duration Logic


Use `getNoteDuration` to calculate quants from duration strings.
Use `calculateTotalQuants` for summing events.
Use `reflowScore` when changing time signatures or redistributing events.

```typescript
// See src/utils/core.ts
import { getNoteDuration, calculateTotalQuants } from '@/utils/core';

// Calculate duration in "quants" (96 per whole note)
const dur = getNoteDuration('quarter', true); // dotted quarter = 36 quants

// Sum total time of events
const totalTime = calculateTotalQuants(myEvents);
```

See also: [docs/DATA_MODEL.md](./DATA_MODEL.md)

---

## 4. Music Theory & Audio

### Pitch & Scale Logic (TonalJS)


Prefer `tonal` for parsing notes, transposition, and scale logic.
Example usages can be found in `src/utils/entry/pitchResolver.ts` or `ChromaticTransposeCommand.ts`.

```typescript
// See src/utils/entry/pitchResolver.ts
import { Note } from 'tonal';

// Example: Get note properties
const note = Note.get('F#4');
console.log(note.acc /* '#' */, note.midi /* 66 */);
```

### Audio Playback (Tone.js)


Score playback is handled via the singleton `ToneEngine`.
Do NOT instantiate Tone.js synths manually in components; use the engine's `scheduleTonePlayback` or `playNote` methods.
Interaction with the engine should generally happen via `usePlayback` hook or direct calls for one-off sounds.

```typescript
// See src/engines/toneEngine.ts
import { ToneEngine } from '@/engines/toneEngine';

// Play a single note immediately (e.g. on click)
ToneEngine.playNote('C4', '8n', 'piano');

// Initialize audio context (requires user gesture)
await ToneEngine.init();
```

See also: [docs/API.md](./API.md)

---

## 5. UI Components

### Buttons & Toolbar Items


Use `ToolbarButton` for all tool/action buttons. It handles:
- Theming (Active, Ghost, Default states)
- Accessibiltiy (`aria-label`, `title`)
- consistent sizing and hover states.

```tsx
// See src/components/Toolbar/ToolbarButton.tsx
<ToolbarButton
  label="Select Tool"
  icon={<SelectIcon />}
  isActive={selectedTool === 'select'}
  onClick={activateSelectTool}
/>
```

See also: [docs/INTERACTION.md](./INTERACTION.md), [docs/CONFIGURATION.md](./CONFIGURATION.md)

---

## 6. Testing Patterns

### Shared Fixtures


Do NOT manually build complex Score JSON objects in every test file.
Use factory functions like `createTestScore()` or `createSelectionWithNote()` from the fixtures directory.

```typescript
// See src/__tests__/fixtures/selectionTestScores.ts
import { createTestScore } from './fixtures/selectionTestScores';

const score = createTestScore();
// score.staves[0]...
```

See also: [docs/TESTING.md](./TESTING.md), [docs/TESTING_ANTIPATTERNS.md](./TESTING_ANTIPATTERNS.md)

### "Cookbook" Integration Tests


When adding a major feature or "Recipe", create a test that follows the exact steps a user would take via the public API (`score.select(...)`, `score.addNote(...)`). This ensures the documentation (`COOKBOOK.md`) remains truthful.

```typescript
// src/__tests__/ScoreAPI.cookbook.test.tsx
import { render } from '@testing-library/react';
import { RiffScore } from '@/RiffScore';

test('Recipe: Create a C Major Scale', () => {
  // 1. Setup
  render(<RiffScore id="test-recipe" />);
  const api = window.riffScore.get('test-recipe');
  
  // 2. Execute Recipe Steps (Public API only)
  api.modifiers.setTimeSignature('4/4');
  api.select(1).addNote('C4', 'quarter');
  
  // 3. Verify Result
  expect(api.getScore().staves[0].measures[0].events).toHaveLength(1);
});
```

See also: [docs/COOKBOOK.md](./COOKBOOK.md)

### User Interaction Testing

Use `userEvent` over `fireEvent` to simulate real user behavior (triggering focus, blur, etc.).

```typescript
// See src/__tests__/ScoreAPI.cookbook.test.tsx
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button); // Correct
// vs
// fireEvent.click(button); // Avoid
```

### Accessible Queries (RTL)

Prefer queries that mimic how a user finds elements (Role, Label, Text) over `data-testid`.

```typescript
// See src/__tests__/components/Toolbar.test.tsx
screen.getByRole('button', { name: /play/i }); // Best
screen.getByLabelText('Tempo'); // Good
screen.getByTestId('play-btn'); // Last Resort
```

### Inline Documentation
**Inline Documentation**
Use JSDoc for all public utilities and components.
Include an `@tested` tag pointing to the test file that covers this function.
Include `@example` for complex logic.

```typescript
/**
 * Calculates something important.
 * 
 * @param x - Input value
 * @returns Calculated result
 * 
 * @tested src/__tests__/utils/myUtils.test.ts
 */
export const calculateSomething = (x: number) => { ... }
```

See also: [docs/CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 7. Other Utilities

- **Validation:** `src/utils/validation.ts` for checking score integrity.
- **Selection:** `src/utils/selection.ts` for selection helpers (though often better to use `SelectionEngine` or `SelectionService`).
