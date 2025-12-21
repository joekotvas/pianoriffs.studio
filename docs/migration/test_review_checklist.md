# Test File Review Checklist

Use this checklist when reviewing each test file during Phase 2g migration.

---

## Per-File Checklist

### 1. Imports Cleanup
- [ ] Remove `import '@testing-library/jest-dom'` (now in `setupTests.ts`)
- [ ] Remove `cleanup` import from `@testing-library/react`
- [ ] Add `import userEvent from '@testing-library/user-event'` if using DOM events

### 2. Type Safety
- [ ] Replace `any` types with proper types (`Score`, `Selection`, `Event`, etc.)
- [ ] Add type annotations to mock return values
- [ ] Type test fixtures appropriately

### 3. User Interactions
- [ ] Replace `fireEvent.click()` → `await user.click()`
- [ ] Replace `fireEvent.change()` → `await user.type()`
- [ ] Replace `fireEvent.keyDown()` → `await user.keyboard()`
- [ ] Add `const user = userEvent.setup()` at test setup
- [ ] Ensure test is `async` if using userEvent

### 4. Query Improvements
- [ ] Replace `getByTestId` with accessible queries where possible:
  - `getByRole('button', { name: /.../ })`
  - `getByLabelText('...')`
  - `getByText('...')`
- [ ] Keep `getByTestId` only for elements with no accessible role

### 5. Anti-Pattern Fixes
- [ ] Remove manual `afterEach(cleanup)` calls
- [ ] Remove unnecessary `act()` wrappers
- [ ] Remove redundant `await waitFor()` around sync assertions

### 6. Documentation
- [ ] Add/update JSDoc if test purpose is unclear
- [ ] Document any discovered anti-patterns in `TESTING_ANTIPATTERNS.md`

---

## Quick Reference

### userEvent Setup Pattern
```typescript
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByLabelText('Input'), 'hello');
    await user.keyboard('{Enter}');
  });
});
```

### Common Type Replacements
| From | To |
| :--- | :--- |
| `any` | `Score`, `Selection`, `Event`, `Note`, etc. |
| `(props: any)` | `(props: { onSelect: () => void })` |
| `jest.fn() as any` | `jest.fn<ReturnType, Args>()` |
| `{} as any` | `createTestScore()` or proper fixture |

### Query Priority
1. `getByRole` — buttons, links, headings
2. `getByLabelText` — form inputs
3. `getByPlaceholderText` — inputs without labels
4. `getByText` — static text content
5. `getByDisplayValue` — input current values
6. `getByTestId` — last resort

---

## Phase Tracking

| Phase | Files | Status |
| :--- | :---: | :--- |
| B | 14 command tests | ⬜ |
| C | 10 engine/API tests | ⬜ |
| D | 14 hook/component tests | ⬜ |
| E | 10 utility tests | ⬜ |
