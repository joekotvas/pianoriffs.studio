[← Back to README](../README.md)

# Contributing to RiffScore

Thank you for your interest in contributing to RiffScore!

> **See also**: [Architecture](./ARCHITECTURE.md) • [Configuration](./CONFIGURATION.md) • [Interaction Design](./INTERACTION.md)

---

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/riffscore.git
cd riffscore
```

### 2. Install Dependencies

```bash
npm install
cd demo && npm install
cd ..
```

### 3. Run Development Environment

```bash
npm run demo:dev
```

This starts the Next.js demo app at `http://localhost:3000` which consumes the library code directly from `src/`.

---

## Development Workflow

### Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/` | Core component library |
| `demo/` | Next.js demo app for testing |
| `docs/` | Documentation |
| `dist/` | Built library output (generated) |

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run demo:dev` | Start demo app in development mode |
| `npm run build` | Build library with tsup |
| `npm run dev` | Watch mode for library development |
| `npm run test` | Run Jest test suite |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without changes |

---

## Code Quality

### ESLint

We use ESLint 9 with the flat config format (`eslint.config.mjs`).

**Run linting:**
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Key rules:**
- React Hooks rules enforced
- TypeScript strict mode
- `no-console` warns (except `console.warn` and `console.error`)
- Unused variables must be prefixed with `_` (e.g., `_unusedParam`)

### Prettier

Code formatting is handled by Prettier. ESLint is configured to not conflict with Prettier rules.

**Run formatting:**
```bash
npm run format       # Format all files
npm run format:check # Check without modifying
```

**Configuration (`.prettierrc`):**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### Pre-commit Checklist

Before committing, ensure:
```bash
npm run lint        # No errors
npm run format:check # Formatting passes
npm run test        # Tests pass
```

---

## Documentation Standards

### JSDoc for Public APIs

Use comprehensive JSDoc for exported functions, commands, and hooks:

```typescript
/**
 * Brief description of what the function does.
 *
 * Longer description if needed, explaining behavior,
 * edge cases, or important context.
 *
 * @param paramName - Description of parameter
 * @param options - Object with configuration options
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * const result = myFunction(arg1, { option: true });
 * ```
 *
 * @see RelatedFunction
 * @see Issue #123
 * @tested
 */
```

### Helper Functions

For small utilities, use concise single-line JSDoc:

```typescript
/** Generate a unique key for a note selection */
private getNoteKey(note: SelectedNote): string { ... }
```

### File-Level Documentation

Each significant file should have a top-level JSDoc:

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

Use prefixed comments for important implementation details:

```typescript
// OPTIMIZATION: Build the Set once for O(N+M) complexity
// BUG FIX #100: Preserve anchor when navigating through gaps
// TODO: Refactor to use command pattern
// NOTE: This relies on async initialization
```

---

## Testing

### Jest Configuration

Tests use Jest with `jsdom` environment and `ts-jest` for TypeScript support.

**Run tests:**
```bash
npm run test                    # Run all tests
npm run test -- --watch         # Watch mode
npm run test -- path/to/file    # Run specific test
npm run test -- --coverage      # With coverage report
```

**Test file locations:**
- All tests are in `src/__tests__/`
- Test files use `.test.ts` or `.test.tsx` extensions

**Path aliases in tests:**
Tests can use the same `@/` aliases as source code (e.g., `@/types`, `@/utils/core`).

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';
import { ScoreProvider } from '@/context/ScoreContext';

// Wrap components that use context
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <ScoreProvider>{component}</ScoreProvider>
    </ThemeProvider>
  );
};
```

---

## TypeScript

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@context/*` | `src/context/*` |
| `@hooks/*` | `src/hooks/*` |
| `@components/*` | `src/components/*` |
| `@utils/*` | `src/utils/*` |
| `@commands/*` | `src/commands/*` |
| `@engines/*` | `src/engines/*` |
| `@assets/*` | `src/components/Assets/*` |

**Example:**
```typescript
import { Score } from '@/types';
import { useScoreContext } from '@context/ScoreContext';
import { calculateMeasureLayout } from '@engines/layout';
```

### Strict Mode

TypeScript strict mode is enabled. Key implications:
- All variables must have types (explicit or inferred)
- No implicit `any` (currently warnings, not errors)
- Strict null checks

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable releases |
| `develop` | Integration branch (if applicable) |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `docs/*` | Documentation updates |
| `chore/*` | Maintenance tasks |

### Commit Messages

Use conventional commit format:
```
type(scope): description

feat(toolbar): add tuplet controls
fix(layout): correct beam angle calculation
docs(architecture): update hooks section
chore(eslint): add prettier integration
```

---

## Release Process

We follow [Semantic Versioning](https://semver.org/).

| Version | Meaning |
|---------|---------|
| `1.0.0-alpha.x` | Alpha release (current) |
| `1.0.0-beta.x` | Beta release |
| `1.0.0` | Stable release |

### Publishing

```bash
npm run build           # Build the library
npm publish             # Publish to npm (maintainers only)
```

---

## Troubleshooting

### Common Issues

**ESLint: "Unexpected any"**
- Add explicit types from `src/types.ts`
- Or prefix unused params with `_`

**Jest: Module not found**
- Check path aliases in `jest.config.js`
- Ensure the file actually exists

**TypeScript: Cannot find module**
- Run `npm install` to ensure dependencies are installed
- Check `tsconfig.json` paths configuration

---

## Getting Help

- Check existing [GitHub Issues](https://github.com/joekotvas/RiffScore/issues)
- Review the [Architecture Guide](./ARCHITECTURE.md) for technical context
- Open a new issue with reproduction steps
