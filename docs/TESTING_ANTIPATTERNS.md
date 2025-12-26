[← Back to TESTING](./TESTING.md)

# Testing Anti-Patterns

> Common testing mistakes and their corrections. Discovered during Phase 2g testing enhancement migration.

> **See also**: [Testing Guide](./TESTING.md) • [Contributing](./CONTRIBUTING.md)

---

## 1. Manual Cleanup

**ESLint Rule:** `testing-library/no-manual-cleanup`

### ❌ Anti-Pattern

```typescript
import { render, cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### ✅ Correct

React Testing Library automatically runs cleanup after each test when used with Jest. No manual cleanup is needed.

```typescript
import { render } from '@testing-library/react';

// No afterEach cleanup needed!
```

---

## 2. Unnecessary Act Wrapping

**ESLint Rule:** `testing-library/no-unnecessary-act`

### ❌ Anti-Pattern

```typescript
import { act } from '@testing-library/react';

await act(async () => {
  // Empty or already-wrapped code
});
```

### ✅ Correct

RTL's `render`, `fireEvent`, and `userEvent` already wrap in act. Only wrap when directly calling React state updates.

```typescript
// userEvent already wraps in act
await user.click(button);

// fireEvent already wraps in act
fireEvent.click(button);
```

---

## 3. Using fireEvent Instead of userEvent

**ESLint Rule:** Not enforced (best practice)

### ❌ Anti-Pattern

```typescript
import { fireEvent } from '@testing-library/react';

fireEvent.click(button);
fireEvent.change(input, { target: { value: 'hello' } });
```

### ✅ Correct

`userEvent` simulates real user interactions more accurately (fires all related events).

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button);
await user.type(input, 'hello');
```

---

## 4. Query by TestId When Accessible Query Exists

**ESLint Rule:** `testing-library/prefer-role-queries` (future)

### ❌ Anti-Pattern

```typescript
screen.getByTestId('submit-button');
```

### ✅ Correct

Prefer accessible queries that mirror how users find elements.

```typescript
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email');
screen.getByText('Click me');
```

**Query Priority:**
1. `getByRole` — best for accessibility
2. `getByLabelText` — form elements
3. `getByText` — non-interactive elements
4. `getByTestId` — last resort

---

## 5. Manual jest-dom Import

**Corrected By:** Global `setupTests.ts`

### ❌ Anti-Pattern (Legacy)

```typescript
import '@testing-library/jest-dom';

test('example', () => { ... });
```

### ✅ Correct

After Phase 2g, jest-dom is imported globally in `setupTests.ts`.

```typescript
// No import needed - globally available
test('example', () => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
});
```

---

## 6. Manual Score Construction

### ❌ Anti-Pattern

Defining complex score JSON structures directly in test files. This makes tests brittle to schema changes.

```typescript
const score = {
  staves: [{ measures: [{ events: [] }] }], // 20 lines of JSON...
};
```

### ✅ Correct

Use **Shared Fixtures** from `src/__tests__/fixtures/`.

```typescript
// See src/__tests__/fixtures/selectionTestScores.ts
import { createTestScore } from './fixtures/selectionTestScores';

const score = createTestScore();
```

> **See also**: [Coding Patterns: Shared Fixtures](./CODING_PATTERNS.md#shared-fixtures)

---

## 7. Testing Internal State

### ❌ Anti-Pattern

Testing private functioning or internal state that isn't part of the public API.

```typescript
// Testing an internal helper directly
expect(normalizeDurationString('q')).toBe(24);
```

### ✅ Correct

Use **Cookbook Integration Tests** that test the public API surface.

```typescript
// Testing the result of a public command
score.addNote('C4', 'quarter');
expect(score.getNotes()).toHaveLength(1);
```

> **See also**: [Coding Patterns: Cookbook Integration Tests](./CODING_PATTERNS.md#cookbook-integration-tests)

---

## Anti-Pattern Tracking

| Pattern | Files Affected | Status |
| :--- | :---: | :--- |
| Manual cleanup | 1 (ScoreAPI.registry) | ✅ Fixed |
| Unnecessary act | 1 (Interaction) | 🔲 Pre-existing |
| fireEvent → userEvent | ~10 | 🔲 Deferred |
| Manual jest-dom import | 6 | ✅ Removed |

---

## Deferred Issues (Phase 2g)

The following issues were identified during Phase 2g migration, with most now resolved.

### fireEvent → userEvent Migration

**Files affected:** `Interaction.test.tsx`, `BassSelection.test.tsx`, `MultiSelect.test.tsx`, `Smoke.test.tsx`

**Reason for deferral:** These files use `fireEvent` for complex mouse coordinate tests (`fireEvent.mouseMove`, `fireEvent.click` with `clientX/clientY`). `userEvent` doesn't support coordinate-based events directly. Migration requires rethinking test strategy.

**Future approach:** Consider testing at a different level (unit test the coordinate calculation logic separately, integration test the result).

---

### Type Issues with `any` — ✅ Mostly Fixed

~~**Files affected:** Multiple files with mock objects~~

**Resolution:**
- `ScoreAPI.registry.test.tsx` — Fixed Window declaration conflict by using global type from `useScoreAPI.ts`
- `ScoreAPI.registry.test.tsx` — Fixed chaining types with proper `ChainableAPI` interface
- `MultiSelect.test.tsx` — Fixed with `_props: unknown` pattern
- Mock context `any` types — Remaining in a few files but don't cause lint errors

**Recommendation:** For remaining `any` types in mock factories, consider creating shared mock types when extracting fixtures.

---

### Pre-existing Lint Warnings — ✅ Fixed

~~**Files affected:** Multiple files~~

**Resolution:**
- `CrossStaffNavigation.test.tsx` — Removed 4 unused `syncToolbarState` declarations
- `Interaction.test.tsx` — Removed unused `useState`, `CONFIG`, `unmount`; replaced empty `act` with `waitFor`
- `MultiSelect.test.tsx` — Changed `props: any` to `_props: unknown`
- `RenderingDetailed.test.tsx` — Removed unused `CONFIG`
- `layoutEngine.test.ts` — Removed unused `CONFIG`, `MIDDLE_LINE_Y`
- `measure.test.ts` — Removed unused `calculateBeamingGroups`
- `SelectionNavigation.test.ts` — Removed unused `ScoreEngine`, `AddEventCommand`, `SetGrandStaffCommand`, `createDefaultScore`; prefixed unused fixture
- `usePlayback.test.ts` — Removed unused `waitFor`

**Result:** Test files now have **0 ESLint warnings**.

---

### TypeScript Errors — ✅ Fixed

~~**ScoreAPI.registry.test.tsx:** `Subsequent property declarations must have the same type.`~~

**Resolution:** Removed the local `declare global { interface Window { riffScore... } }` block. The type is already declared globally in `src/hooks/useScoreAPI.ts`.

---

[← Back to TESTING](./TESTING.md)
