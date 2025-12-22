/**
 * Machine-Addressable API Type Definitions
 *
 * This file defines the public contract for external script control.
 * Kept separate from data model types for clarity and maintainability.
 *
 * @see docs/migration/api_reference_draft.md
 */

import type { Score, ScoreEvent, Selection, RiffScoreConfig } from './types';

// ========== UTILITY TYPES ==========

/** Unsubscribe function returned by event subscriptions */
export type Unsubscribe = () => void;

/** Supported API event types */
export type APIEventType = 'score' | 'selection' | 'playback';

// ========== REGISTRY ==========

/**
 * Global registry for multiple RiffScore instances.
 * Access via `window.riffScore`.
 */
export interface RiffScoreRegistry {
  instances: Map<string, MusicEditorAPI>;
  get(id: string): MusicEditorAPI | undefined;
  active: MusicEditorAPI | null;
}

// ========== MUSIC EDITOR API ==========

/**
 * Machine-Addressable API for external script control.
 * All mutation/navigation methods return `this` for chaining.
 *
 * @example
 * ```typescript
 * window.riffScore.active
 *   .select(1)
 *   .addNote('C4', 'quarter')
 *   .move('right')
 *   .addNote('D4');
 * ```
 */
export interface MusicEditorAPI {
  // --- Navigation ---
  /**
   * Move cursor in the specified direction.
   * @status implemented
   */
  move(direction: 'left' | 'right' | 'up' | 'down'): this;
  /**
   * Jump to a specific position in the score.
   * @status implemented
   */
  jump(target: 'start-score' | 'end-score' | 'start-measure' | 'end-measure'): this;
  /**
   * Select an event by measure number (1-based) and optional indices.
   * @status implemented
   */
  select(measureNum: number, staffIndex?: number, eventIndex?: number, noteIndex?: number): this;
  /**
   * Select by rhythmic position within a measure.
   * @status stub
   */
  selectAtQuant(measureNum: number, quant: number, staffIndex?: number): this;
  /**
   * Select by internal event/note IDs.
   * @status implemented
   */
  selectById(eventId: string | number, noteId?: string | number): this;

  // --- Selection (Multi-Select) ---
  /**
   * Add an event to the current selection (Cmd+Click behavior).
   * @status stub
   */
  addToSelection(measureNum: number, staffIndex: number, eventIndex: number): this;
  /**
   * Extend selection from anchor to target (Shift+Click behavior).
   * @status stub
   */
  selectRangeTo(measureNum: number, staffIndex: number, eventIndex: number): this;
  /**
   * Select all events in the specified scope.
   * @status implemented
   */
  selectAll(scope?: 'score' | 'measure' | 'staff' | 'event'): this;
  /**
   * Select all notes in an event (chord).
   * @status implemented
   */
  selectEvent(measureNum?: number, staffIndex?: number, eventIndex?: number): this;
  /**
   * Clear all selections.
   * @status implemented
   */
  deselectAll(): this;
  /**
   * Select all notes in all touched events (fill partial chords).
   * @status implemented
   */
  selectFullEvents(): this;
  /**
   * Extend selection vertically to staff above (anchor-based).
   * @status implemented
   */
  extendSelectionUp(): this;
  /**
   * Extend selection vertically to staff below (anchor-based).
   * @status implemented
   */
  extendSelectionDown(): this;
  /**
   * Extend selection vertically to all staves.
   * @status implemented
   */
  extendSelectionAllStaves(): this;

  // --- Entry (Create) ---
  /**
   * Add a note at the cursor position.
   * @status implemented
   */
  addNote(pitch: string, duration?: string, dotted?: boolean): this;
  /**
   * Add a rest at the cursor position.
   * @status implemented
   */
  addRest(duration?: string, dotted?: boolean): this;
  /**
   * Add a pitch to the current chord.
   * @status implemented
   */
  addTone(pitch: string): this;
  /**
   * Convert selected notes to a tuplet.
   * @status stub
   */
  makeTuplet(numNotes: number, inSpaceOf: number): this;
  /**
   * Remove tuplet grouping from selected notes.
   * @status stub
   */
  unmakeTuplet(): this;
  /**
   * Toggle tie on the selected note.
   * @status stub
   */
  toggleTie(): this;
  /**
   * Set tie state explicitly.
   * @status stub
   */
  setTie(tied: boolean): this;
  /**
   * Set input mode for next entry.
   * @status stub
   */
  setInputMode(mode: 'note' | 'rest'): this;

  // --- Modification (Update) ---
  /**
   * Update pitch of selected note(s).
   * @status stub
   */
  setPitch(pitch: string): this;
  /**
   * Update duration of selected event(s).
   * @status stub
   */
  setDuration(duration: string, dotted?: boolean): this;
  /**
   * Set accidental on selected note(s).
   * @status stub
   */
  setAccidental(type: 'sharp' | 'flat' | 'natural' | null): this;
  /**
   * Cycle through accidental states.
   * @status stub
   */
  toggleAccidental(): this;
  /**
   * Transpose selected notes by semitones (chromatic).
   * @status stub
   */
  transpose(semitones: number): this;
  /**
   * Transpose selected notes by scale degrees (diatonic).
   * @status stub
   */
  transposeDiatonic(steps: number): this;
  /**
   * Generic event update (escape hatch).
   * @status stub
   */
  updateEvent(props: Partial<ScoreEvent>): this;

  // --- Structure ---
  /**
   * Add a measure at the specified index (default: end).
   * @status stub
   */
  addMeasure(atIndex?: number): this;
  /**
   * Delete a measure by index (default: selected).
   * @status stub
   */
  deleteMeasure(measureIndex?: number): this;
  /**
   * Delete selected events intelligently.
   * @status stub
   */
  deleteSelected(): this;
  /**
   * Change the key signature.
   * @status stub
   */
  setKeySignature(key: string): this;
  /**
   * Change the time signature.
   * @status stub
   */
  setTimeSignature(sig: string): this;
  /**
   * Mark/unmark a measure as pickup.
   * @status stub
   */
  setMeasurePickup(isPickup: boolean): this;

  // --- Configuration ---
  /**
   * Change the clef.
   * @status stub
   */
  setClef(clef: 'treble' | 'bass' | 'grand'): this;
  /**
   * Update the score title.
   * @status stub
   */
  setScoreTitle(title: string): this;
  /**
   * Set the tempo in BPM.
   * @status stub
   */
  setBpm(bpm: number): this;
  /**
   * Change the visual theme.
   * @status stub
   */
  setTheme(theme: string): this;
  /**
   * Set the zoom scale.
   * @status stub
   */
  setScale(scale: number): this;
  /**
   * Switch between grand and single staff layouts.
   * @status stub
   */
  setStaffLayout(type: 'grand' | 'single'): this;

  // --- Lifecycle & IO ---
  /**
   * Load or replace the current score.
   * @status stub
   */
  loadScore(score: Score): this;
  /**
   * Reset to a blank score.
   * @status stub
   */
  reset(template?: 'grand' | 'treble' | 'bass', measures?: number): this;
  /**
   * Export the score in the specified format.
   * @status partial - json works, abc/musicxml throw
   */
  export(format: 'json' | 'abc' | 'musicxml'): string;

  // --- Playback ---
  /**
   * Start playback.
   * @status stub
   */
  play(): this;
  /**
   * Pause playback.
   * @status stub
   */
  pause(): this;
  /**
   * Stop playback and rewind.
   * @status stub
   */
  stop(): this;
  /**
   * Jump playback to a specific measure.
   * @status stub
   */
  rewind(measureNum?: number): this;
  /**
   * Change the playback instrument.
   * @status stub
   */
  setInstrument(instrumentId: string): this;

  // --- Data (Queries) ---
  /**
   * Get the current score state (read-only).
   * @status implemented
   */
  getScore(): Score;
  /**
   * Get the current configuration.
   * @status implemented
   */
  getConfig(): RiffScoreConfig;
  /**
   * Get the current selection state.
   * @status implemented
   */
  getSelection(): Selection;

  // --- History & Clipboard ---
  /**
   * Undo the last mutation.
   * @status implemented
   */
  undo(): this;
  /**
   * Redo the last undone mutation.
   * @status implemented
   */
  redo(): this;
  /**
   * Begin a transaction (batch mutations).
   * @status implemented
   */
  beginTransaction(): this;
  /**
   * Commit the transaction with optional label.
   * Note: label parameter is not yet used by the history system.
   * @status implemented
   */
  commitTransaction(label?: string): this;
  /**
   * Rollback the current transaction.
   * @status implemented
   */
  rollbackTransaction(): this;
  /**
   * Copy selected events to clipboard.
   * @status stub
   */
  copy(): this;
  /**
   * Cut selected events to clipboard.
   * @status stub
   */
  cut(): this;
  /**
   * Paste from clipboard at cursor.
   * @status stub
   */
  paste(): this;

  // --- Events ---
  /**
   * Subscribe to state changes.
   * @status implemented
   * @returns Unsubscribe function
   */
  on(event: 'score', callback: (state: Score) => void): Unsubscribe;
  on(event: 'selection', callback: (state: Selection) => void): Unsubscribe;
  on(event: 'playback', callback: (state: unknown) => void): Unsubscribe;
  on(event: APIEventType, callback: (state: unknown) => void): Unsubscribe;
}

