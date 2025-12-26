# ADR-009: Explicit Pattern Governance

**Status**: Proposed
**Date**: 2025-12-26
**Context**: "How do we ensure long-term consistency in a codebase maintained by both humans and AI agents?"

## Context

As the RiffScore codebase matures, we face a challenge common to hybrid (human + AI) development environments: **Implicit Knowledge Decay**.

1.  **Pattern Drift**: Without explicit documentation, different areas of the codebase adopt slightly different solutions for the same problem (e.g., three ways to generate IDs, two ways to manage state).
2.  **AI Hallucination triggers**: Large Language Models (LLMs) rely on "few-shot" examples found in the context. If the codebase contains mixed patterns (legacy vs. modern), the AI randomly selects one to emulate, often propagating deprecated patterns.
3.  **Onboarding Friction**: New developers (and agents) must read the entire source to intuit "the right way" to do things, rather than having a clear reference.

Recent example: The "ID Refactor" required touching 20+ files because disparate ID generation methods had proliferated.

## Decision

We will adopt a policy of **Explicit Pattern Governance**.

1.  **Central Authority**: `docs/CODING_PATTERNS.md` is the **authoritative source of truth** for architectural decisions. If code contradicts this document, the code is considered technical debt.
2.  **Pattern Registry**: We explicitly define and name our core patterns.
3.  **Enforcement**: Code reviews (human) and Context Loading (AI) must reference this document.

### Governed Patterns (Initial Set)

We formally recognize the following patterns as the standard for RiffScore:

| Category | Pattern Name | Implementation Rule |
| :--- | :--- | :--- |
| **Identity** | **Factory ID Generation** | All entities (`Note`, `Measure`, etc.) MUST use factory functions from `src/utils/id.ts`. Direct `uuid()` or `Date.now()` is forbidden in domain logic. |
| **Logic** | **Service Modules** | Stateless logic (e.g., Music Theory) MUST be implemented as **Functional Modules** (exported functions), not Classes. Example: `src/services/MusicService.ts`. |
| **Logic** | **Engine Classes** | Stateful logic (e.g., `ScoreEngine`) MUST be encapsulated in **Classes** to manage lifecycle and subscriptions distinct from React. |
| **State** | **Command Pattern** | All score mutations MUST be encapsulated in `Command` objects dispatched to `ScoreEngine`. Direct state mutation is forbidden. |
| **State** | **Selection Dispatch** | All selection changes MUST be encapsulated in `SelectionCommand` objects dispatched to `SelectionEngine`. |
| **UI** | **Compound Components** | Complex UI (like `Toolbar`) SHOULD used composition (`Toolbar` -> `StaffControls`, `PlaybackControls`) rather than a monolithic file. |
| **Testing** | **Cookbook Testing** | Integration tests SHOULD use the "Cookbook" pattern (`createTestScore` fixtures + public API calls) rather than testing internal implementation details. |

## Consequences

### Positive
*   **AI Reliability**: We can inject `docs/CODING_PATTERNS.md` into the agent's context, dramatically increasing the probability of it writing compliant code on the first try.
*   **Scalability**: New features can be built by "cloning" the architectural pattern of existing features without guessing.
*   **refactoring Roadmap**: Ambiguous code is easier to identify ("Does this match the pattern? No? Refactor it.").

### Negative
*   **Documentation Overhead**: `CODING_PATTERNS.md` must be kept in sync with code. Outdated documentation is worse than no documentation.
*   **Rigidity**: "The Pattern" might feel restrictive for simple one-off problems. (Mitigation: Patterns apply to *Core Domain* logic, not necessarily every helper script).

## Related Documents
*   [docs/CODING_PATTERNS.md](../CODING_PATTERNS.md)
*   [docs/adr/004-api-factory-pattern.md](./004-api-factory-pattern.md)
*   [docs/adr/005-selection-dispatch-pattern.md](./005-selection-dispatch-pattern.md)
