[← Back to Contributing](./CONTRIBUTING.md)

# Pre-PR Quality Checklist

> Perform a careful **two-pass check** for each section before requesting PR review.

---

## 1. High-Level Code Quality

- [ ] **DRY**: No duplicated logic across files
- [ ] **SOLID**: Single responsibility, proper abstractions
- [ ] **Existing patterns**: Using established utilities and commands

```bash
# Useful: Search for similar implementations
grep -r "similar pattern" src/
```

---

## 2. Low-Level Code Quality

### Lint Errors & Warnings
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix where possible
```
- [ ] Zero errors
- [ ] Zero warnings (or justified suppressions)

### TypeScript Errors
```bash
npx tsc --noEmit
```
- [ ] Zero type errors in changed files

---

## 3. Testing Quality

```bash
npm test                          # All tests
npm test -- --testPathPatterns="MyFile"  # Specific
npm test -- --coverage            # With coverage
```

- [ ] All tests pass (100%)
- [ ] New code has tests covering:
  - [ ] Happy paths
  - [ ] Edge cases
  - [ ] Error/exception paths
  - [ ] Integration tests (where appropriate)

---

## 4. Formatting Quality

```bash
npm run format        # Auto-format all files
npm run format:check  # Verify formatting
```

- [ ] All files formatted

---

## 5. Documentation Quality

### File-Level JSDoc

Every significant file should have a header:

```typescript
/**
 * SelectAllCommand
 *
 * Selects all notes following a hierarchical expansion pattern.
 * Hierarchy: Note → Measure → Staff → Score
 *
 * @see Issue #99
 */
```

### Annotations

| Annotation | Purpose |
|------------|---------|
| `@tested` | Function has test coverage |
| `@see` | Reference related function or issue |
| `@example` | Show usage example |
| `@deprecated` | Mark for removal |
| `@internal` | Not part of public API |

### Implementation Notes

Use prefixed comments for important details:

```typescript
// OPTIMIZATION: Build the Set once for O(N+M) complexity
// BUG FIX #100: Preserve anchor when navigating through gaps
// TODO: Refactor to use command pattern
// NOTE: This relies on async initialization
```

- [ ] New/modified files have appropriate JSDoc
- [ ] Complex logic has inline comments
- [ ] Public API methods are documented

### Global Documentation Updates

When adding new features or API methods, update relevant docs:

- [ ] **ARCHITECTURE.md**: Update if architecture changes
- [ ] **DATA_MODEL.md**: Update if data model changes
- [ ] **COMMANDS.md**: Update if commands change
- [ ] **LAYOUT_ENGINE.md**: Update if layout engine changes
- [ ] **SELECTION_ENGINE.md**: Update if selection engine changes

- [ ] **API.md**: Mark methods as implemented (✅)
- [ ] **COOKBOOK.md**: Update if cookbook examples change

- [ ] **INTERACTION.md**: Update if interaction patterns change
- [ ] **KEYBOARD_NAVIGATION.md**: Update if keyboard navigation changes

- [ ] **CONTRIBUTING.md**: Update if contributing process changes

- [ ] **README.md**: Update if user-facing features change

- [ ] **progress.md**: Update phase status and details

---

## Quick Summary Checklist

```
□ High-Level: DRY & SOLID
□ Lint: 0 errors, 0 warnings
□ TypeScript: 0 errors
□ Tests: 100% passing, full coverage for new code
□ Format: All files formatted
□ Docs: JSDoc headers, annotations, inline comments, global docs
```

---

[← Back to Contributing](./CONTRIBUTING.md)
