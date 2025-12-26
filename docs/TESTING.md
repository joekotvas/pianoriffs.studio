[← Back to README](../README.md)

# RiffScore Testing Guide

> Patterns and practices for testing RiffScore components.

> **See also**: [Contributing](./CONTRIBUTING.md) • [Coding Patterns](./CODING_PATTERNS.md) • [Commands](./COMMANDS.md) • [Data Model](./DATA_MODEL.md)

---

## 1. Test Organization

All tests live in `src/__tests__/`:

```
src/__tests__/
├── commands/                 # Command unit tests
├── fixtures/                 # Shared test data
│   └── selectionTestScores.ts
├── MusicService.test.ts      # Service tests
├── ScoreEngine.test.ts       # Engine tests
├── SelectionEngine.test.ts
├── ExtendSelectionVertically.test.ts
├── verticalStack.test.ts     # Utility tests
├── ScoreAPI.registry.test.tsx   # API registry tests
├── ScoreAPI.transactions.test.tsx # API history tests
├── ScoreAPI.events.test.tsx     # API subscription tests
├── ScoreAPI.navigation.test.tsx # API navigation tests (20 tests)
├── ScoreAPI.entry.test.tsx      # API entry tests (15 tests)
└── ...
```

> **See also**: [API Test Coverage Analysis](./migration/api_test_coverage.md) for detailed coverage by method.

---

## 2. Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ExtendSelectionVertically

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 3. Test Fixtures

### Shared Score Fixtures

Create reusable score data in `fixtures/`:

```typescript
// src/__tests__/fixtures/selectionTestScores.ts
export const simpleScore: Score = {
  title: 'Test Score',
  timeSignature: '4/4',
  keySignature: 'C',
  bpm: 120,
  staves: [
    {
      id: 'treble',
      clef: 'treble',
      keySignature: 'C',
      measures: [
        {
          id: 'm0',
          events: [
            { id: 'e0', duration: 'quarter', dotted: false, notes: [...] }
          ]
        }
      ]
    }
  ]
};

export const grandStaffScore: Score = { ... };
export const chordScore: Score = { ... };
```

### Using Fixtures

```typescript
import { simpleScore, grandStaffScore } from './fixtures/selectionTestScores';

describe('MyCommand', () => {
  it('works with simple score', () => {
    const result = command.execute(initialSelection, simpleScore);
    // ...
  });
});
```

---

## 4. Testing Commands

### Pattern: State-In, State-Out

```typescript
import { ExtendSelectionVerticallyCommand } from '../commands/selection';

describe('ExtendSelectionVerticallyCommand', () => {
  it('should expand selection downward', () => {
    const command = new ExtendSelectionVerticallyCommand({ direction: 'down' });
    
    const initialSelection: Selection = {
      staffIndex: 0,
      measureIndex: 0,
      eventId: 'e0',
      noteId: 'n0',
      selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }]
    };
    
    const result = command.execute(initialSelection, testScore);
    
    expect(result.selectedNotes).toHaveLength(2);
    expect(result.noteId).toBe('n1');  // Moved to next note
  });
});
```

### Pattern: Edge Cases

```typescript
it('should return unchanged state when at boundary', () => {
  // Select bottom note
  const initialSelection = { ..., noteId: 'bottom-note' };
  
  const command = new ExtendSelectionVerticallyCommand({ direction: 'down' });
  const result = command.execute(initialSelection, testScore);
  
  // Should not change
  expect(result).toEqual(initialSelection);
});
```

---

## 5. Testing Engines

### ScoreEngine

```typescript
import { ScoreEngine } from '../engines/ScoreEngine';
import { AddEventCommand } from '../commands';

describe('ScoreEngine', () => {
  let engine: ScoreEngine;
  
  beforeEach(() => {
    engine = new ScoreEngine(initialScore);
  });
  
  it('should dispatch commands', () => {
    engine.dispatch(new AddEventCommand({ ... }));
    
    const newScore = engine.getState();
    expect(newScore.staves[0].measures[0].events).toHaveLength(2);
  });
  
  it('should support undo', () => {
    engine.dispatch(new AddEventCommand({ ... }));
    engine.undo();
    
    const score = engine.getState();
    expect(score.staves[0].measures[0].events).toHaveLength(1);
  });
});
```

### SelectionEngine

```typescript
import { SelectionEngine } from '../engines/SelectionEngine';
import { SelectEventCommand } from '../commands/selection';

describe('SelectionEngine', () => {
  it('should update selection', () => {
    const engine = new SelectionEngine(initialSelection);
    
    engine.dispatch(new SelectEventCommand({
      staffIndex: 0,
      measureIndex: 1,
      eventId: 'e5',
      noteId: 'n10'
    }));
    
    expect(engine.getState().eventId).toBe('e5');
  });
});
```

---

## 6. Testing the ScoreAPI

The fluent API is tested by rendering `<RiffScore />` and accessing it via the global registry.

### Pattern: Registry Access

```typescript
import { render } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';

const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

describe('API Navigation', () => {
  afterEach(() => {
    window.riffScore.instances.clear();
    window.riffScore.active = null;
  });

  test('move("right") advances cursor', () => {
    render(<RiffScore id="nav-test" />);
    const api = getAPI('nav-test');

    api.select(1, 0, 0);
    const before = api.getSelection().eventId;
    
    api.move('right');
    const after = api.getSelection().eventId;
    
    expect(after).not.toBe(before);
  });
});
```

### Pattern: Verify Selection (Not Event Count)

When testing entry methods, verify via **selection state** rather than event count. The `getScore()` method may return stale data in test environments.

```typescript
// ✅ Good - selection is authoritative
test('addNote succeeds', () => {
  api.select(1).addNote('C4');
  expect(api.getSelection().eventId).toBeDefined();
});

// ⚠️ Fragile - may return stale data
test('addNote adds event', () => {
  api.select(1).addNote('C4');
  expect(api.getScore().staves[0].measures[0].events).toHaveLength(1);
});
```

### Pattern: Custom Staves via Config

Navigation tests can use custom scores via `config.score.staves`:

```typescript
const customStaves = [{ id: 'treble', clef: 'treble', measures: [...] }];

render(<RiffScore id="custom" config={{ score: { staves: customStaves } }} />);
```

### Pattern: Testing Event Subscriptions

Event callbacks fire via `useEffect`, so use `waitFor()` for assertions:

```typescript
import { render, waitFor } from '@testing-library/react';

test('score callback fires on mutation', async () => {
  // jsdom doesn't have scrollTo
  Element.prototype.scrollTo = jest.fn();
  
  render(<RiffScore id="sub-test" />);
  const api = getAPI('sub-test');

  const callback = jest.fn();
  api.on('score', callback);

  api.select(1).addNote('C4');

  // Callback fires after React processes state update
  await waitFor(() => {
    expect(callback).toHaveBeenCalled();
  });
});
```

---

## 7. Testing Utilities

### Pure Function Tests

```typescript
import { calculateVerticalMetric, collectVerticalStack } from '../utils/verticalStack';

describe('calculateVerticalMetric', () => {
  it('should order treble above bass', () => {
    const trebleC4 = calculateVerticalMetric(0, 60);
    const bassC4 = calculateVerticalMetric(1, 60);
    
    expect(trebleC4).toBeGreaterThan(bassC4);
  });
});

describe('collectVerticalStack', () => {
  it('should collect all notes at time point', () => {
    const stack = collectVerticalStack(testScore, 0);
    
    expect(stack).toHaveLength(4);  // 3 chord notes + 1 bass note
    expect(stack[0].staffIndex).toBe(0);  // Sorted top to bottom
  });
});
```

---

## 8. Mocking Context

### Mock Score Context

```typescript
import { ScoreContext } from '../context/ScoreContext';
import { render } from '@testing-library/react';

const mockContextValue = {
  score: testScore,
  selection: initialSelection,
  dispatch: jest.fn(),
  // ... other context values
};

render(
  <ScoreContext.Provider value={mockContextValue}>
    <ComponentUnderTest />
  </ScoreContext.Provider>
);
```

---

## 9. Coverage Targets

| Area | Target | Current |
|------|--------|---------|
| Services | 95%+ | 98% |
| Utils | 85%+ | 87% |
| Commands | 80%+ | 79% |
| Hooks | 60%+ | 62% |
| Components | 50%+ | ~45% |

Focus testing effort on:
1. **Commands**: Business logic
2. **Utils**: Pure functions
3. **Engines**: State management

Components can rely more on integration/E2E tests.

---

## 10. Common Patterns

### `@tested` Annotation

Mark tested functions in source:

```typescript
/**
 * Calculate vertical metric for sorting.
 * @tested verticalStack.test.ts
 */
export function calculateVerticalMetric(...) { }
```

### Descriptive Test Names

```typescript
// ✅ Good
it('should contract selection when moving cursor toward anchor');

// ❌ Bad
it('works');
```

### One Assertion Per Logical Outcome

```typescript
it('should update both selectedNotes and noteId', () => {
  const result = command.execute(state, score);
  
  expect(result.selectedNotes).toHaveLength(2);
  expect(result.noteId).toBe('n1');
  // Multiple related assertions are fine
});
```

---

[← Back to README](../README.md)
