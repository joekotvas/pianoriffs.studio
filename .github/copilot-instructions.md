# Copilot Instructions for RiffScore

## Project Overview

RiffScore is a self-hostable, embeddable sheet music editor for React. It provides an interactive, editable score component that can be embedded directly into React applications without external dependencies or platform lock-in.

**Key Technologies:**
- React 18/19 with TypeScript (strict mode)
- Music theory: Tonal.js
- Audio playback: Tone.js
- SMuFL-compliant engraving with Bravura font
- Build: tsup
- Testing: Jest with React Testing Library

## Explicit Pattern Governance

**CRITICAL**: The following patterns are strictly enforced. Deviations will be rejected.

| Category | Pattern | Rule |
| :--- | :--- | :--- |
| **Identity** | Factory Functions | Use `src/utils/id.ts` (e.g., `noteId()`). NEVER use `uuid()` or `Date.now()`. |
| **State** | Command Pattern | All mutations MUST use `ScoreEngine.dispatch(new Command)`. No direct state mutation. |
| **Selection** | Dispatch Only | Selection changes MUST flow through `SelectionEngine.dispatch()`. |
| **Testing** | Public API | **Integration Tests**: Test via public API (Cookbook Style). **Unit Tests**: Test helpers directly. |
| **Testing** | Interaction | Use `userEvent` (e.g. `user.click`) instead of `fireEvent`. |
| **Testing** | Coverage | **100% Coverage** required for all new or significantly modified files. |

For detailed examples, see `docs/CODING_PATTERNS.md`.

## Project Structure

```
riffscore/
├── src/              # Core component library source code
│   ├── components/   # React components
│   ├── context/      # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   ├── commands/     # Command pattern for editing actions
│   ├── engines/      # Layout and rendering engines
│   └── types.ts      # TypeScript type definitions
├── demo/             # Next.js demo application for testing
├── docs/             # Documentation (architecture, configuration, interaction)
├── dist/             # Built library output (generated, not in source control)
└── __mocks__/        # Jest mocks
```

## Development Workflow

### Building and Testing

```bash
# Install dependencies
npm install
cd demo && npm install

# Build the library
npm run build

# Run demo app for manual testing
npm run demo:dev

# Run tests
npm run test

# Run linting
npm run lint
npm run lint:fix

# Run formatting
npm run format
npm run format:check
```

### Pre-commit Checklist
1. `npm run lint` - Must pass with no errors
2. `npm run format:check` - Formatting must be correct
3. `npm run test` - All tests must pass

## Code Style and Conventions

### TypeScript
- **Strict mode enabled** - All type checks are enforced
- **No implicit any** - Avoid `any` type; use explicit types or `unknown`
- **Use path aliases** for imports:
  - `@/*` → `src/*`
  - `@context/*` → `src/context/*`
  - `@hooks/*` → `src/hooks/*`
  - `@components/*` → `src/components/*`
  - `@utils/*` → `src/utils/*`
  - `@commands/*` → `src/commands/*`
  - `@engines/*` → `src/engines/*`
  - `@config` → `src/config.ts`
  - `@config/*` → `src/config/*`
  - `@types` → `src/types.ts`
  - `@types/*` → `src/types/*`
  - `@constants` → `src/constants.ts`
  - `@constants/*` → `src/constants/*`
  - `@assets/*` → `src/components/Assets/*`

### React Best Practices
- Use functional components with hooks
- Follow React Hooks rules (enforced by ESLint)
- Wrap test components with necessary providers (ThemeProvider, ScoreProvider)
- Keep components small and modular
- Extract complex logic to custom hooks

### Code Formatting
- **Prettier configuration** (`.prettierrc`):
  - Single quotes
  - Semicolons required
  - 2-space indentation
  - Trailing commas (ES5)
  - Max line width: 100
  - Line endings: LF

### ESLint Rules
- React Hooks rules strictly enforced
- `no-console` warns (except `console.warn` and `console.error`)
- Unused variables must be prefixed with `_` (e.g., `_unusedParam`)
- TypeScript strict mode rules

## Music Libraries

**Always prefer existing music theory libraries:**
- **Tonal.js** (`tonal` package) - For music theory operations (notes, scales, chords, intervals)
- **Tone.js** (`tone` package) - For audio playback and timing

Don't reinvent music theory logic - these libraries are already integrated and tested.

## Testing

### Test Location
- Tests are typically located in `src/__tests__/`
- Use `.test.ts` or `.test.tsx` extensions

### Test Utilities
```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/context/ThemeContext';
import { ScoreProvider } from '@/context/ScoreContext';

// Always wrap components that use context
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <ScoreProvider>{component}</ScoreProvider>
    </ThemeProvider>
  );
};
```

### Path Aliases in Tests
Tests can use the same `@/` aliases as source code thanks to Jest configuration. Note that some newer aliases like `@config`, `@types`, and `@constants` may need to be added to `jest.config.js` if they are used in tests.

## Commit Message Format

Use conventional commit format:
```
type(scope): description

Examples:
feat(toolbar): add tuplet controls
fix(layout): correct beam angle calculation
docs(architecture): update hooks section
chore(eslint): add prettier integration
```

**Types:** `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `style`, `perf`

## Important Project-Specific Guidelines

1. **Check for existing components** - Before creating new components, verify nothing similar exists
2. **Don't auto-merge branches** - Always wait for explicit approval before merging
3. **SMuFL compliance** - Follow SMuFL standards for music notation rendering
4. **Export formats** - Support JSON, MusicXML, and ABC notation export
5. **MIDI input** - Be aware of MIDI keyboard integration for note entry
6. **Theming** - Use the existing theme system (dark, light, cool, warm)

## Key Files to Reference

- `src/types.ts` - Central type definitions
- `docs/ARCHITECTURE.md` - Technical architecture details
- `docs/CONFIGURATION.md` - Component API reference
- `docs/INTERACTION.md` - User interaction design
- `docs/CONTRIBUTING.md` - Detailed development guidelines

## Version Information

- Current version: `1.0.0-alpha.5`
- Follows semantic versioning
- Published to npm as `riffscore`

## Helpful Context

- The project is in alpha stage - expect ongoing architectural refinements
- The demo app (`demo/`) is the primary way to manually test changes
- The library is built as both ESM and CJS with TypeScript declarations
- Peer dependencies: React 18+ or React 19+
