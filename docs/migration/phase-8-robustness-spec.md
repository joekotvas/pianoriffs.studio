# Phase 8: Robustness & Stability Specification

> **Status**: ✅ Complete (Merged to dev 2025-12-23)
> **Version**: 1.0.0-alpha.4

## Overview
Phase 8 focuses on hardening the API for public release. The goal is to prevent the engine from reaching invalid states due to bad input and to provide better observability for plugins.

## 1. Input Validation & Logging

We will implement a lightweight, DX-friendly validation layer in the API factory methods.

### 1.1 DX Strategy: "Forgiving Input, Strict Output"
- **Permissive Parsing**: Accept loose inputs where unambiguous (e.g., case-insensitive notes, string numbers).
- **Standardized Warnings**: If input is invalid/unrecoverable, log a structured warning: `[RiffScore API] <Context>: <Reason>`.
- **Chaining Continuity**: Invalid calls return `this` to prevent crashing the plugin chain, but do *not* mutate state.

### 1.2 Methods to Validate

#### `src/hooks/api/modification.ts`
| Method | Parameter | Rules / Parsing | Failure Action |
| :--- | :--- | :--- | :--- |
| `setBpm` | `bpm` | Range 30-300. Parses string "120" -> 120. | Warn & Ignore |
| `addNote` | `pitch` | Valid Scientific (C4, cb3). Case-insensitive. | Warn & Ignore |
| `setInstrument` | `instrumentId` | Must exist in registry. | Warn & Fallback to valid? (No, safe to Ignore) |
| `setDuration` | `duration` | 'quarter', 'q', '4n'. Normalizes input. | Warn & Ignore |

#### Helper: `src/utils/validation.ts`
- `isValidPitch(p): boolean`
- `parseDuration(d): string | null` (normalizes 'q' -> 'quarter')
- `clampBpm(b): number`

## 2. Event System Enhancements

### 2.1 New Event: `batch`
Plugins need to know *what* happened in the batch without parsing command objects.

- **Trigger**: `commitTransaction()`
- **Payload**: `BatchEventPayload`
    ```typescript
    interface BatchEventPayload {
      type: 'batch';
      label?: string; // Optional user/plugin label for the transaction
      timestamp: number;
      commands: { type: string; summary: string }[]; // Simplified digest
      affectedMeasures: number[];
    }
    ```

### 2.2 Implementation Steps
1.  **Definitions**: Update `api.types.ts` with `BatchEventPayload`.
2.  **Engine**: Update `ScoreEngine` to aggregate affected measures/command types during a transaction.
3.  **API**: Expose `on('batch', (payload) => void)`.

## 3. Documentation

### 3.1 Cookbook
- Add recipes for new Phase 7E features (`setDuration`, `transpose`, etc.).
- Add "Batch Operations" section demonstrating `beginTransaction` and `commitTransaction`.

### 3.2 Release Notes
- Prepare draft release notes for v1.0.0-alpha.4.

## 4. Execution Plan

### Step 1: Validation Logic
- [ ] Create `src/utils/validation.ts`
- [ ] Implement `validatePitch`, `validateBpm`, `validateDuration`.

### Step 2: Apply Validation
- [ ] Update `modification.ts` methods to use validators.
- [ ] Update `playback.ts` (`setInstrument`) validation.

### Step 3: Event System
- [ ] Update `ScoreEngine.ts` to support typed events.
- [ ] Wire `on('batch')` in `events.ts`.

### Step 4: Documentation
- [ ] Update `COOKBOOK.md`.
