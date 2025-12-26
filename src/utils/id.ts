/**
 * Centralized ID Generation Utilities
 *
 * All entity IDs in RiffScore are strings with optional type prefixes
 * for improved debugging and developer experience.
 *
 * @example
 * ```typescript
 * noteId()    → "note_a1b2c3d4"
 * eventId()   → "event_f5e6d7c8"
 * measureId() → "measure_9a8b7c6d"
 * ```
 */

/**
 * Generates a unique ID with optional entity prefix.
 * Uses crypto.randomUUID() when available, with timestamp fallback.
 *
 * @param prefix - Optional entity type prefix (e.g., 'note', 'event')
 * @returns A unique string ID
 *
 * @example
 * createId()          → "a1b2c3d4-e5f6-..."
 * createId('note')    → "note_a1b2c3d4"
 */
export function createId(prefix?: string): string {
  const uuid =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return prefix ? `${prefix}_${uuid.slice(0, 8)}` : uuid;
}

// ========== Typed Factory Functions ==========

/** Generate a unique note ID: "note_xxxxxxxx" */
export const noteId = (): string => createId('note');

/** Generate a unique event ID: "event_xxxxxxxx" */
export const eventId = (): string => createId('event');

/** Generate a unique measure ID: "measure_xxxxxxxx" */
export const measureId = (): string => createId('measure');

/** Generate a unique staff ID: "staff_xxxxxxxx" */
export const staffId = (): string => createId('staff');

/** Generate a unique tuplet ID: "tuplet_xxxxxxxx" */
export const tupletId = (): string => createId('tuplet');
