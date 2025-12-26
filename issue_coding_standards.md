# Issue: Establish Explicit Pattern Governance and Coding Standards

**Type**: Feature / Documentation
**Status**: Completed

## Context

As the RiffScore codebase matures, we face a challenge common to hybrid (human + AI) development environments: **Implicit Knowledge Decay**.

1.  **Pattern Drift**: Without explicit documentation, different areas of the codebase adopt slightly different solutions for the same problem (e.g., three ways to generate IDs, two ways to manage state).
2.  **AI Hallucination triggers**: Large Language Models (LLMs) rely on "few-shot" examples found in the context. If the codebase contains mixed patterns (legacy vs. modern), the AI randomly selects one to emulate, often propagating deprecated patterns.
3.  **Onboarding Friction**: New developers (and agents) must read the entire source to intuit "the right way" to do things, rather than having a clear reference.

(Rationale sourced from [ADR-009](./docs/adr/009-explicit-pattern-governance.md))

## Objective

Formalize RiffScore's adhering to an **Explicit Pattern Governance** model by creating a central source of truth for all architectural decisions and ensuring all documentation aligns with it.

## Work Completed

### 1. Created Central Authority
*   Created **`docs/CODING_PATTERNS.md`**: The authoritative source of truth for architectural decisions.
*   Included concrete code examples for:
    *   Command Pattern
    *   Selection Dispatch
    *   Feature Hooks
    *   Services
    *   Core Utilities (IDs, Time)
    *   Testing (Fixtures vs Manual)
*   Refined the document to remove redundant labels and include direct file cross-links.

### 2. Established Governance Policy
*   Drafted **`docs/adr/009-explicit-pattern-governance.md`**: Formalizes the policy that `CODING_PATTERNS.md` supersedes implicit knowledge.
*   Identified initial governed patterns (Identity, Logic, State, UI, Testing).

### 3. Aligned Testing Documentation
*   Updated **`docs/TESTING_ANTIPATTERNS.md`** to explicitly flag violations of the new standards:
    *   Added "Manual Score Construction" (anti-pattern) vs "Shared Fixtures".
    *   Added "Testing Internal State" (anti-pattern) vs "Cookbook Tests".
*   Updated **`docs/CODING_PATTERNS.md`** to promote positive testing standards ("User Interaction" and "Accessible Queries").

### 4. Cross-Referencing
*   Conducted a full consistency review of `docs/`.
*   Added "See also" links to `CODING_PATTERNS.md` connecting it to `ARCHITECTURE.md`, `COMMANDS.md`, `TESTING.md`, etc.
*   Updated `docs/README.md` to index the new ADR and Patterns guide.

## Acceptance Criteria
*   [x] `docs/CODING_PATTERNS.md` exists and is comprehensive.
*   [x] `docs/adr/009-explicit-pattern-governance.md` is approved.
*   [x] Testing documentation references the new patterns.
*   [x] All major documentation files cross-link correctly.
