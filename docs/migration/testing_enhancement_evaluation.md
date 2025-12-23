# Phase 2g: Testing Enhancement Evaluation

**Date:** 2025-12-21  
**Status:** ✅ Approved

---

## Current Infrastructure

### Dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `jest` | 30.2.0 | Test runner |
| `ts-jest` | 29.4.6 | TypeScript transform |
| `jest-environment-jsdom` | 30.2.0 | DOM simulation |
| `@testing-library/react` | 16.3.0 | React Testing Library |
| `@testing-library/dom` | 10.4.1 | DOM queries |
| `@testing-library/jest-dom` | 6.9.1 | Custom DOM matchers |

### Test Inventory
- **48 test files** in `src/__tests__/`
- **2 helper modules** in `src/__tests__/helpers/`
- **1 fixture file** in `src/__tests__/fixtures/`

### Configuration
- `jest.config.js` with ts-jest preset, jsdom environment
- Path aliases mapped (`@context`, `@hooks`, etc.)
- Helpers and fixtures excluded from test discovery

---

## Evaluation Matrix

| Tool/Approach | Value | Effort | Recommendation |
| :--- | :---: | :---: | :--- |
| **jest-dom matchers** | ✅ Already installed | — | Already using |
| **RTL best practices** | High | Low | Audit + improve |
| **eslint-plugin-testing-library** | High | Low | **Adopt** |
| **@testing-library/user-event** | High | Medium | **Adopt** |
| **react-component-logger** | Low | Low | Skip (niche use) |
| **Property-based testing (fast-check)** | Medium | Medium | Defer |
| **Visual regression (Playwright)** | High | High | Defer |
| **E2E testing (Playwright)** | High | High | Defer |
| **Coverage reporting** | Medium | Low | **Adopt** |

---

## Recommendations

### 1. Adopt: `eslint-plugin-testing-library`

**What:** ESLint rules that enforce RTL best practices automatically.

**Why:**
- Prevents anti-patterns like `getByTestId` overuse
- Encourages accessible queries (`getByRole`, `getByLabelText`)
- Catches sync/async testing mistakes

**Install:**
```bash
npm install -D eslint-plugin-testing-library
```

**ESLint Config Addition:**
```javascript
import testingLibrary from 'eslint-plugin-testing-library';

// In eslint.config.mjs
{
  files: ['**/__tests__/**/*.{ts,tsx}'],
  plugins: { 'testing-library': testingLibrary },
  rules: {
    ...testingLibrary.configs.react.rules,
  },
}
```

---

### 2. Adopt: `@testing-library/user-event`

**What:** Simulates real user interactions (typing, clicking with pointer events, tab navigation).

**Why:**
- More realistic than `fireEvent` (fires all events a real user would trigger)
- Better for testing keyboard navigation—crucial for RiffScore

**Install:**
```bash
npm install -D @testing-library/user-event
```

**Usage Pattern:**
```typescript
import userEvent from '@testing-library/user-event';

test('user can navigate with arrow keys', async () => {
  const user = userEvent.setup();
  render(<RiffScore />);
  
  await user.click(screen.getByTestId('score-canvas'));
  await user.keyboard('{ArrowRight}');
  
  // Assert selection moved
});
```

---

### 3. Adopt: Coverage Reporting

**What:** Built-in Jest coverage with thresholds.

**Why:**
- Current `TESTING.md` lists targets but no enforcement
- Catch regressions in coverage

**Config Update (jest.config.js):**
```javascript
module.exports = {
  // ... existing config
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
```

**NPM Script:**
```json
"test:coverage": "jest --coverage"
```

---

### 4. RTL Best Practices Audit

**Current Issues Found:**

1. **`fireEvent` usage** – Tests use `fireEvent.click()` instead of `userEvent.click()`
2. **testId reliance** – Some tests query by `data-testid` when `getByRole` is available
3. **Missing jest-dom setup** – Not auto-imported; each test imports manually

**Improvements:**

#### a) Global jest-dom setup

Create `src/__tests__/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';
```

Update `jest.config.js`:
```javascript
setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.ts'],
```

#### b) Prefer accessible queries

```typescript
// ❌ Avoid
screen.getByTestId('submit-button')

// ✅ Prefer
screen.getByRole('button', { name: /submit/i })
```

---

### 5. Defer: Property-Based Testing (fast-check)

**What:** Generate random inputs to find edge cases automatically.

**Why Defer:**
- Medium effort to retrofit onto existing command tests
- Selection commands already have good edge case coverage
- Consider for future `ScoreBuilder` utilities

---

### 6. Defer: Visual Regression / E2E (Playwright)

**What:** Screenshot comparison and browser-level testing.

**Why Defer:**
- High setup overhead (CI integration, baseline management)
- Current unit/integration tests cover logic well
- Useful when UI stabilizes post-API migration

---

### 7. Skip: react-component-logger

**What:** Logging for React component renders.

**Why Skip:**
- Primarily for debugging, not testing
- RiffScore already has `DebugLogger` utility
- Low value for test enhancement goals

---

## Approved Implementation Plan

### Phase A: Infrastructure Setup (~45 min)
| Item | Files |
| :--- | :--- |
| Install `@testing-library/user-event` | `package.json` |
| Install `eslint-plugin-testing-library` | `package.json`, `eslint.config.mjs` |
| Global jest-dom setup | `setupTests.ts`, `jest.config.js` |
| Coverage config (75% threshold) | `jest.config.js`, `package.json` |

### Phase B: Command Test Migration (~1 hr)
| File | Notes |
| :--- | :--- |
| `ExtendSelectionVertically.test.ts` | Pure command, no DOM |
| `NavigateCommand.test.ts` | Pure command |
| `SelectEventCommand.test.ts` | Pure command |
| `SelectAllCommand.edge.test.ts` | Pure command |
| `SelectAllCommand.expansion.test.ts` | Pure command |
| `SelectAllCommand.scope.test.ts` | Pure command |
| `SelectFullEventsCommand.test.ts` | Pure command |
| `SelectMeasureCommand.test.ts` | Pure command |
| `SetClefCommand.test.ts` | Pure command |
| `SetGrandStaffCommand.test.ts` | Pure command |
| `SetSingleStaffCommand.test.ts` | Pure command |
| `TogglePickupCommand.test.ts` | Pure command |
| `TupletCommands.test.ts` | Pure command |
| `ChangePitchTuplet.test.ts` | Pure command |

### Phase C: Engine/API Test Migration (~1 hr)
| File | Notes |
| :--- | :--- |
| `ScoreEngine.test.ts` | State management |
| `SelectionEngine.test.ts` | State management |
| `ScoreAPI.registry.test.tsx` | RTL + userEvent candidate |
| `MusicService.test.ts` | Service layer |
| `TimelineService.test.ts` | Service layer |
| `core.test.ts` | Core utilities |
| `generateScore.test.ts` | Score generation |
| `handleMutation.test.ts` | Handler |
| `handleNavigation.test.ts` | Handler |
| `handlePlayback.test.ts` | Handler |

### Phase D: Hook/Component Test Migration (~1.5 hr)
| File | Notes |
| :--- | :--- |
| `useSelection.test.tsx` | RTL + userEvent candidate |
| `useEditorMode.test.tsx` | RTL + userEvent candidate |
| `usePlayback.test.ts` | Hook test |
| `useScoreLogic.test.tsx` | RTL + userEvent candidate |
| `useTupletActions.test.ts` | Hook test |
| `Smoke.test.tsx` | RTL + userEvent candidate |
| `ScoreCanvas.test.tsx` | RTL + userEvent candidate |
| `RenderingDetailed.test.tsx` | Component test |
| `SelectionLogic.test.tsx` | RTL + userEvent candidate |
| `CrossStaffNavigation.test.tsx` | RTL + userEvent candidate |
| `AnchorSelection.test.tsx` | RTL + userEvent candidate |
| `BassSelection.test.tsx` | RTL + userEvent candidate |
| `MultiSelect.test.tsx` | RTL + userEvent candidate |
| `Interaction.test.tsx` | RTL + userEvent candidate |

### Phase E: Utility/Integration Test Migration (~1 hr)
| File | Notes |
| :--- | :--- |
| `verticalStack.test.ts` | Pure utility |
| `interactionUtils.test.ts` | Pure utility |
| `navigationHelpers.test.ts` | Pure utility |
| `keyboardNavigation.test.ts` | Keyboard testing |
| `SelectionNavigation.test.ts` | Navigation logic |
| `layoutEngine.test.ts` | Layout utilities |
| `measure.test.ts` | Measure utilities |
| `mergeConfig.test.ts` | Config utilities |
| `grandStaffAlignment.test.ts` | Alignment logic |
| `grandStaffBassTransposition.test.ts` | Transposition |

### Phase F: Documentation & Cleanup (~30 min)
| Item | Files |
| :--- | :--- |
| Create anti-pattern guide | `docs/TESTING_ANTIPATTERNS.md` |
| Update testing guide | `docs/TESTING.md` |
| Update progress tracker | `docs/migration/progress.md` |

**Total estimated effort:** ~5-6 hours

### Verification

1. **Lint passes:** `npm run lint`
2. **Tests pass:** `npm test`
3. **Coverage report generates:** `npm run test:coverage`
4. **No regressions:** All 48 existing test files pass

---

## Resolved Questions

| Question | Decision |
| :--- | :--- |
| Coverage thresholds in CI? | ✅ Yes, enforce 75% across all metrics |
| Which files to migrate? | All 48 test files, batched in phases B-E |
| Anti-pattern handling? | Create `TESTING_ANTIPATTERNS.md`, document issues as found, correct in-place |

---

## Deferred Items

These items are not part of Phase 2g but should be revisited:

| Item | Rationale |
| :--- | :--- |
| **Property-based testing (fast-check)** | Medium effort, current edge case coverage good |
| **Visual regression (Playwright)** | High setup, wait for UI stabilization |
| **E2E testing (Playwright)** | High setup, unit/integration sufficient for now |
