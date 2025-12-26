# RiffScore Documentation

Welcome to the RiffScore documentation hub. This directory contains comprehensive guides for using, configuring, and contributing to RiffScore.

## 📚 User Guides

Everything you need to get started and build with RiffScore.

- **[Configuration](./CONFIGURATION.md)**: Detailed reference for all `<RiffScore />` props and settings.
- **[API Reference](./API.md)**: Complete guide to the machine-addressable imperative API.
- **[Cookbook](./COOKBOOK.md)**: Recipe collection for common tasks (creating notes, building chords, simple interactions).
- **[Interaction Design](./INTERACTION.md)**: Philosophy and behavior of the editor's mouse and keyboard interactions.
- **[Keyboard Navigation](./KEYBOARD_NAVIGATION.md)**: Deep dive into the arrow-key navigation logic and state machine.
- **[Selection Model](./SELECTION.md)**: Explanation of the 2D selection system, multi-selection, and range operations.

## 🏗️ Architecture & Internals

Technical deep dives for understanding how the system works.

- **[Architecture](./ARCHITECTURE.md)**: High-level system design, layers, and core principles.
- **[Coding Patterns](./CODING_PATTERNS.md)**: **(New)** Standard architectural patterns, folder structure conventions, and utility usage.
- **[Data Model](./DATA_MODEL.md)**: The schema of `Score`, `Staff`, `Measure`, and `Event`.
- **[Commands](./COMMANDS.md)**: The Command pattern implementation for state mutations.
- **[Layout Engine](./LAYOUT_ENGINE.md)**: How the renderer calculates positioning, beaming, and engraving.

## 🤝 Contributing & Quality

Guides for developers working on the RiffScore codebase itself.

- **[Contributing](./CONTRIBUTING.md)**: Setup, workflow, and guidelines for contributors.
- **[Testing](./TESTING.md)**: Testing strategy, patterns, and fixture usage.
- **[Testing Antipatterns](./TESTING_ANTIPATTERNS.md)**: Common testing pitfalls to avoid.
- **[Quality Check](./QUALITY_CHECK.md)**: Manual verification checklist.

## 📜 Design Records

Historical context and architectural decisions.

### Architecture Decision Records (ADR)
[Browse all ADRs](./adr/)

- [001: Vertical Selection](./adr/001-vertical-selection.md)
- [002: Event Subscriptions](./adr/002-event-subscriptions.md)
- [003: Transaction Batching](./adr/003-transaction-batching.md)
- [004: API Factory Pattern](./adr/004-api-factory-pattern.md)
- [005: Selection Dispatch Pattern](./adr/005-selection-dispatch-pattern.md)
- [006: Synchronous API Engine Access](./adr/006-synchronous-api-engine-access.md)
- [007: Open-Closed Clef Reference](./adr/007-open-closed-clef-reference.md)
- [008: Observability Patterns](./adr/008-observability-patterns.md)
- [009: Explicit Pattern Governance](./adr/009-explicit-pattern-governance.md)

### Migration & Planning
[Browse Migration Archive](./migration/)

- [Progress & Roadmap](./migration/progress.md)
- [Documentation Strategy](./migration/documentation_strategy.md)
- [Implementation Plan](./migration/implementation_plan.md)
- [API Test Coverage](./migration/api_test_coverage.md)

## 🔄 Changelog

- **[Changelog](../CHANGELOG.md)**: Version history and release notes.
