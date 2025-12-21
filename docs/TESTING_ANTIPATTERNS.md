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

## Anti-Pattern Tracking

| Pattern | Files Affected | Status |
| :--- | :---: | :--- |
| Manual cleanup | 1 (ScoreAPI.registry) | ✅ Fixed |
| Unnecessary act | 1 (Interaction) | 🔲 Pre-existing |
| fireEvent → userEvent | ~10 | 🔲 Deferred |
| Manual jest-dom import | 6 | ✅ Removed |

---

## Deferred Issues (Phase 2g)

The following issues were identified but intentionally deferred during Phase 2g migration.

### fireEvent → userEvent Migration

**Files affected:** `Interaction.test.tsx`, `BassSelection.test.tsx`, `MultiSelect.test.tsx`, `Smoke.test.tsx`

**Reason for deferral:** These files use `fireEvent` for complex mouse coordinate tests (`fireEvent.mouseMove`, `fireEvent.click` with `clientX/clientY`). `userEvent` doesn't support coordinate-based events directly. Migration requires rethinking test strategy.

**Future approach:** Consider testing at a different level (unit test the coordinate calculation logic separately, integration test the result).

---

### Type Issues with `any`

**Files affected:**
- `ScoreAPI.registry.test.tsx` — Global `window.riffScore` type mismatch
- `BassSelection.test.tsx`, `ScoreCanvas.test.tsx` — Mock context `any` types
- `handleMutation.test.ts`, `handleNavigation.test.ts`, `handlePlayback.test.ts` — Mock object `any` types
- `CrossStaffNavigation.test.tsx` — Mock score factory `any` types

**Reason for deferral:** These `any` types exist in mock objects and test factories. Typing them strictly requires:
1. Exporting test-specific types from source
2. Or creating comprehensive mock type definitions

**Recommendation:** Create a `src/__tests__/types/` directory with mock types for common patterns (MockScore, MockSelection, MockContext).

---

### Pre-existing Lint Warnings

**Files affected:**
- `CrossStaffNavigation.test.tsx` — 4 unused `syncToolbarState` variables
- `Interaction.test.tsx` — unused `useState`, `CONFIG`, `unmount`; empty `act` wrapper
- `MultiSelect.test.tsx` — unused `props` parameter
- `RenderingDetailed.test.tsx` — unused `CONFIG`

**Reason for deferral:** These are code quality issues unrelated to testing patterns. They should be addressed in a separate cleanup PR.

---

### TypeScript Errors

**ScoreAPI.registry.test.tsx:**
```
Subsequent property declarations must have the same type.
Property 'riffScore' must be of type 'RiffScoreRegistry'...
```

**Reason:** The test file redeclares `window.riffScore` with a simpler type than the actual `RiffScoreRegistry` type. This is a type conflict, not a test issue.

**Fix:** Import `RiffScoreRegistry` type and use it, or remove the local declaration.

---

[← Back to TESTING](./TESTING.md)
