# Documentation Strategy: Integrating the Machine-Addressable API

**Date:** 2025-12-19
**Context:** Proposal for restructuring RiffScore documentation to incorporate the new imperative API while maintaining LLM-friendliness and human accessibility.

---

## 1. Current State Analysis

### Existing Documentation
| File | Purpose | Audience | Quality |
| :--- | :--- | :--- | :--- |
| `README.md` | Quick start, features, installation | All users | ✅ Good |
| `CONFIGURATION.md` | Declarative config (`config` prop) | React developers | ✅ Good |
| `ARCHITECTURE.md` | Technical internals (engines, commands, hooks) | Contributors | ✅ Comprehensive |
| `INTERACTION.md` | UX design philosophy, mouse/keyboard workflows | Designers, Users | ✅ Good |
| `KEYBOARD_NAVIGATION.md` | Deep dive on navigation state machine | Contributors | ✅ Detailed |
| `CONTRIBUTING.md` | Dev setup, ESLint, Jest | Contributors | ✅ Good |

### Gaps Identified
1.  **No Imperative API docs**: The new `window.riffScore` API has no home.
2.  **Mixed audiences**: `ARCHITECTURE.md` serves both contributors AND consumers needing API internals.
3.  **No "Cookbook"**: Missing practical examples for common tasks.
4.  **LLM Accessibility**: Docs are human-readable but not optimized for LLM context parsing.

---

## 2. Proposed Documentation Structure

### 2.1. Audience Segmentation

| Audience | Needs | Primary Docs |
| :--- | :--- | :--- |
| **Quick Start User** | Install, render, configure | `README.md`, `CONFIGURATION.md` |
| **Power User / Scripter** | Automate, extend, integrate | `API.md`, `COOKBOOK.md` |
| **Contributor** | Understand internals, add features | `ARCHITECTURE.md`, `CONTRIBUTING.md` |
| **Designer / PM** | Understand UX principles | `INTERACTION.md` |

### 2.2. Proposed File Structure

```
riffscore/
├── README.md                    # Entry point (unchanged, but add API teaser)
├── docs/
│   ├── CONFIGURATION.md         # Declarative config (existing, unchanged)
│   ├── API.md                   # [NEW] Machine-Addressable API Reference
│   ├── COOKBOOK.md              # [NEW] Practical examples and recipes
│   ├── ARCHITECTURE.md          # Internal architecture (refocused for contributors)
│   ├── INTERACTION.md           # UX/Keyboard design (existing, unchanged)
│   ├── KEYBOARD_NAVIGATION.md   # Deep dive (existing, unchanged)
│   └── CONTRIBUTING.md          # Dev setup (existing, unchanged)
```

---

## 3. New Document Specifications

### 3.1. `docs/API.md` – Machine-Addressable API Reference

**Source:** `api_reference_draft.md` (our planning artifact)

**Purpose:** Canonical reference for the imperative API.

**Structure:**
1.  **Overview**: Philosophy, Access Methods, Design Principles
2.  **Global Registry**: Multi-instance support
3.  **Methods by Category**: Tables with Signature, Returns, Description
4.  **Events & Subscriptions**: Payloads, mechanisms
5.  **Error Handling**: Behavior for invalid inputs
6.  **Examples**: Inline code snippets

**LLM-Friendliness:**
-   Use **consistent table format** for all methods (easy to parse).
-   Include **TypeScript signatures** (unambiguous for code generation).
-   Add **semantic headers** (H2 per category, H3 per method group).
-   Include **cross-links** to `CONFIGURATION.md` (declarative) vs `API.md` (imperative).

---

### 3.2. `docs/COOKBOOK.md` – Practical Examples

**Purpose:** Task-oriented guide for common use cases.

**Structure:**
```markdown
# RiffScore Cookbook

## Entry
### Write a Scale
### Build a Chord Progression
### Enter a Melody from MIDI Data

## Editing
### Transpose a Selection
### Batch Edit with Transactions

## Integration
### Auto-Save to Backend
### Sync Two Editors
### React to Playback Position

## Export
### Save as MusicXML
### Generate ABC Notation
```

**LLM-Friendliness:**
-   Each recipe is **self-contained** (can be extracted as a single context).
-   Use **complete, runnable code** (not fragments).
-   Include **expected outcome** comments.

---

### 3.3. Updates to Existing Docs

#### `README.md`
Add a teaser for the Imperative API in the "Coming Soon" section → "Features" section:
```markdown
## Features
...
*   **Imperative API**: Programmatically control the score via `window.riffScore` ([API Reference](./docs/API.md))
```

#### `ARCHITECTURE.md`
Refocus on **internal contributor documentation**:
-   Add a section on **Dual Dispatchers** (Mutation vs Selection).
-   Add a section on **Glue Layer** (`useScoreAPI`).
-   Cross-link to `API.md` for the public contract.

---

## 4. Preserving Architectural Insights

The planning documents (`selection_model_brainstorm.md`, `interaction_model_analysis.md`) contain valuable **design rationale** that should be preserved for:
-   Future contributors understanding *why* choices were made.
-   LLMs needing context on design constraints.
-   Product decisions requiring historical context.

### 4.1. Integration Strategy: ADR Section in ARCHITECTURE.md

Add a new section **"Design Decisions & Rationale"** to `ARCHITECTURE.md` that captures:

| Decision | Rationale |
| :--- | :--- |
| **Glue Layer Pattern** | Decouples script API from internal Command schema; handles ID generation, validation, and cursor context. |
| **Dual Dispatchers** | Separates Score (mutation, full history) from Selection (navigation, ephemeral). Prevents undo from moving cursor. |
| **Synchronous State** | Enables reliable chaining (`api.select().addNote()`). React render is decoupled from authoritative engine refs. |
| **Shared Cursor** | API drives visible selection, not a hidden cursor. Ideal for tutorials and user-visible automation. |
| **Multi-Instance Registry** | `window.riffScore` is a registry, not a singleton. Supports multiple editors on one page. |
| **Outside-In Development** | Build the public API first to establish contract and test harness before refactoring internals. |

### 4.2. Proposed Structure for ARCHITECTURE.md

```markdown
# RiffScore Architecture Guide

## 1. Core Principles (Existing)
...

## 2. Design Decisions & Rationale (NEW)
### 2.1. Imperative API Architecture
Why we chose the Glue Layer, Dual Dispatchers, and Synchronous State.
(Distilled from interaction_model_analysis.md)

### 2.2. Selection Model
Why navigation uses a SelectionEngine with ephemeral history.
(Distilled from selection_model_brainstorm.md)

### 2.3. Multi-Instance Support
Why the Registry pattern was necessary.

## 3. Entry Point (Existing)
...

## 4. Directory Structure (Existing)
...
```

### 4.3. Optional: Standalone ADR Folder

For projects that accumulate many decisions, a dedicated `docs/adr/` folder is common:

```
docs/
├── adr/
│   ├── 001-glue-layer-pattern.md
│   ├── 002-dual-dispatchers.md
│   ├── 003-synchronous-state.md
│   └── ...
```

**Recommendation:** For now, integrate into `ARCHITECTURE.md`. If the project grows significantly, migrate to a dedicated ADR folder later.

---

## 5. LLM-Friendliness Guidelines

These principles ensure documentation is useful for both humans and AI coding assistants:

### 4.1. Structural Consistency
-   **Every method** documented with: Signature, Arguments Table, Returns, Example.
-   **Every document** has: Title, Purpose statement, Table of Contents (for long docs).

### 4.2. Machine-Parseable Formats
-   Use **Markdown tables** for structured data (not prose lists).
-   Use **fenced code blocks** with language hints (`typescript`, `javascript`).
-   Use **anchor links** (`[method](#method)`) for internal navigation.

### 4.3. Context Windows
-   Keep individual sections **under 500 lines** (LLMs can load a single section).
-   Use **collapsible `<details>` blocks** for deep dives that clutter main flow.

### 4.4. Semantic Clarity
-   Avoid ambiguous terms; prefer explicit language:
    -   ❌ "Call the API" → ✅ "Call `window.riffScore.active.addNote('C4')`"
-   Include **type annotations** in all code examples.

### 4.5. Cross-References
-   Link between docs explicitly:
    -   "For declarative configuration, see [CONFIGURATION.md](./CONFIGURATION.md)."
    -   "For internal architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)."

---

## 6. Navigation & Cross-Linking

Consistent navigation helps both humans and LLMs orient themselves within the documentation.

### 6.1. Breadcrumb Header

**Every doc file** should begin with a back-link to the entry point:

```markdown
[← Back to README](../README.md)

# Document Title
```

This pattern is already used in `INTERACTION.md` and `KEYBOARD_NAVIGATION.md`.

### 6.2. Horizontal Navigation ("See Also")

**Every doc file** should include a "See Also" block near the top linking to related docs:

```markdown
> **See also**: [Configuration](./CONFIGURATION.md) • [API Reference](./API.md) • [Architecture](./ARCHITECTURE.md)
```

**Proposed Relationships:**

| Document | See Also Links |
| :--- | :--- |
| `README.md` | Configuration, API, Architecture, Changelog |
| `CONFIGURATION.md` | API (imperative alternative), Architecture |
| `API.md` | Configuration (declarative alternative), Cookbook, Architecture |
| `COOKBOOK.md` | API Reference, Configuration |
| `ARCHITECTURE.md` | API (public contract), Configuration, Contributing |
| `INTERACTION.md` | Keyboard Navigation, Architecture |
| `KEYBOARD_NAVIGATION.md` | Interaction, Architecture |
| `CONTRIBUTING.md` | Architecture |

### 6.3. Inline Cross-Document Links

**Sprinkle contextual links** within content where relevant:

-   In `API.md`, when discussing `select()`: "See [Keyboard Navigation](./KEYBOARD_NAVIGATION.md) for the underlying state model."
-   In `CONFIGURATION.md`, when discussing `interaction.isEnabled`: "For programmatic control, see [API Reference](./API.md)."
-   In `ARCHITECTURE.md`, when discussing `ScoreEngine`: "This powers the [API's mutation methods](./API.md#composition)."

### 6.4. Table of Contents

For documents over 200 lines, include a **Table of Contents** after the "See Also" block:

```markdown
## Table of Contents
1. [Overview](#1-overview)
2. [Global Registry](#2-global-registry)
3. [Navigation](#3-navigation)
...
```

This aids both human scanning and LLM section-targeted retrieval.

---

## 7. Migration Plan

### Phase 1: Create `API.md`
-   Copy content from `api_reference_draft.md`.
-   Polish formatting to match existing doc style.
-   Add cross-links.

### Phase 2: Create `COOKBOOK.md`
-   Write 3-5 initial recipes based on API examples.
-   Add as we implement and dogfood the API.

### Phase 3: Update `README.md`
-   Move "Imperative API" from "Coming Soon" to "Features".
-   Add link to `API.md`.

### Phase 4: Update `ARCHITECTURE.md`
-   Add "Internal Architecture: Dual Dispatchers" section.
-   Add "Glue Layer" section.
-   Add "API Internals" cross-link.

### Timing
-   **Phase 1-2**: During/After Phase 1 of Implementation (when API is functional).
-   **Phase 3-4**: After API is stable and tested.

---

## 8. Summary

| Document | Audience | Status | Action |
| :--- | :--- | :--- | :--- |
| `README.md` | All | Existing | Update feature list, add API link |
| `CONFIGURATION.md` | React devs | Existing | Add "See Also" with API link |
| `API.md` | Power users, Scripters | **NEW** | Create from `api_reference_draft.md` |
| `COOKBOOK.md` | Power users | **NEW** | Create with recipes |
| `ARCHITECTURE.md` | Contributors | Existing | Add "Design Decisions" section, update "See Also" |
| `INTERACTION.md` | Designers | Existing | Update "See Also" with API, Cookbook links |
| `KEYBOARD_NAVIGATION.md` | Contributors | Existing | Update "See Also" with API link |
| `CONTRIBUTING.md` | Contributors | Existing | Update "See Also" with Architecture link |

This strategy ensures:
-   **Robust**: All audiences have a clear path.
-   **Helpful for LLMs**: Structured, parseable, cross-linked.
-   **Human-Accessible**: Progressive disclosure, task-oriented recipes.
-   **Incorporates Planning Work**: `api_reference_draft.md` becomes `API.md`.
