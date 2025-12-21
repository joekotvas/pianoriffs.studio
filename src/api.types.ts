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
  /** Move cursor in the specified direction */
  move(direction: 'left' | 'right' | 'up' | 'down'): this;
  /** Jump to a specific position in the score */
  jump(target: 'start-score' | 'end-score' | 'start-measure' | 'end-measure'): this;
  /** Select an event by measure number (1-based) and optional indices */
  select(measureNum: number, staffIndex?: number, eventIndex?: number, noteIndex?: number): this;
  /** Select by rhythmic position within a measure */
  selectAtQuant(measureNum: number, quant: number, staffIndex?: number): this;
  /** Select by internal event/note IDs */
  selectById(eventId: string | number, noteId?: string | number): this;

  // --- Selection (Multi-Select) ---
  /** Add an event to the current selection (Cmd+Click behavior) */
  addToSelection(measureNum: number, staffIndex: number, eventIndex: number): this;
  /** Extend selection from anchor to target (Shift+Click behavior) */
  selectRangeTo(measureNum: number, staffIndex: number, eventIndex: number): this;
  /** Select all events in the specified scope */
  selectAll(scope?: 'score' | 'measure' | 'staff' | 'event'): this;
  /** Select all notes in an event (chord) */
  selectEvent(measureNum?: number, staffIndex?: number, eventIndex?: number): this;
  /** Clear all selections */
  deselectAll(): this;
  /** Select all notes in all touched events (fill partial chords) */
  selectFullEvents(): this;
  /** Extend selection vertically to staff above (anchor-based) */
  extendSelectionUp(): this;
  /** Extend selection vertically to staff below (anchor-based) */
  extendSelectionDown(): this;
  /** Extend selection vertically to all staves */
  extendSelectionAllStaves(): this;

  // --- Entry (Create) ---
  /** Add a note at the cursor position */
  addNote(pitch: string, duration?: string, dotted?: boolean): this;
  /** Add a rest at the cursor position */
  addRest(duration?: string, dotted?: boolean): this;
  /** Add a pitch to the current chord */
  addTone(pitch: string): this;
  /** Convert selected notes to a tuplet */
  makeTuplet(numNotes: number, inSpaceOf: number): this;
  /** Remove tuplet grouping from selected notes */
  unmakeTuplet(): this;
  /** Toggle tie on the selected note */
  toggleTie(): this;
  /** Set tie state explicitly */
  setTie(tied: boolean): this;
  /** Set input mode for next entry */
  setInputMode(mode: 'note' | 'rest'): this;

  // --- Modification (Update) ---
  /** Update pitch of selected note(s) */
  setPitch(pitch: string): this;
  /** Update duration of selected event(s) */
  setDuration(duration: string, dotted?: boolean): this;
  /** Set accidental on selected note(s) */
  setAccidental(type: 'sharp' | 'flat' | 'natural' | null): this;
  /** Cycle through accidental states */
  toggleAccidental(): this;
  /** Transpose selected notes by semitones (chromatic) */
  transpose(semitones: number): this;
  /** Transpose selected notes by scale degrees (diatonic) */
  transposeDiatonic(steps: number): this;
  /** Generic event update (escape hatch) */
  updateEvent(props: Partial<ScoreEvent>): this;

  // --- Structure ---
  /** Add a measure at the specified index (default: end) */
  addMeasure(atIndex?: number): this;
  /** Delete a measure by index (default: selected) */
  deleteMeasure(measureIndex?: number): this;
  /** Delete selected events intelligently */
  deleteSelected(): this;
  /** Change the key signature */
  setKeySignature(key: string): this;
  /** Change the time signature */
  setTimeSignature(sig: string): this;
  /** Mark/unmark a measure as pickup */
  setMeasurePickup(isPickup: boolean): this;

  // --- Configuration ---
  /** Change the clef */
  setClef(clef: 'treble' | 'bass' | 'grand'): this;
  /** Update the score title */
  setScoreTitle(title: string): this;
  /** Set the tempo in BPM */
  setBpm(bpm: number): this;
  /** Change the visual theme */
  setTheme(theme: string): this;
  /** Set the zoom scale */
  setScale(scale: number): this;
  /** Switch between grand and single staff layouts */
  setStaffLayout(type: 'grand' | 'single'): this;

  // --- Lifecycle & IO ---
  /** Load or replace the current score */
  loadScore(score: Score): this;
  /** Reset to a blank score */
  reset(template?: 'grand' | 'treble' | 'bass', measures?: number): this;
  /** Export the score in the specified format */
  export(format: 'json' | 'abc' | 'musicxml'): string;

  // --- Playback ---
  /** Start playback */
  play(): this;
  /** Pause playback */
  pause(): this;
  /** Stop playback and rewind */
  stop(): this;
  /** Jump playback to a specific measure */
  rewind(measureNum?: number): this;
  /** Change the playback instrument */
  setInstrument(instrumentId: string): this;

  // --- Data (Queries) ---
  /** Get the current score state (read-only) */
  getScore(): Score;
  /** Get the current configuration */
  getConfig(): RiffScoreConfig;
  /** Get the current selection state */
  getSelection(): Selection;

  // --- History & Clipboard ---
  /** Undo the last mutation */
  undo(): this;
  /** Redo the last undone mutation */
  redo(): this;
  /** Begin a transaction (batch mutations) */
  beginTransaction(): this;
  /** Commit the transaction */
  commitTransaction(): this;
  /** Copy selected events to clipboard */
  copy(): this;
  /** Cut selected events to clipboard */
  cut(): this;
  /** Paste from clipboard at cursor */
  paste(): this;

  // --- Events ---
  /**
   * Subscribe to state changes.
   * @returns Unsubscribe function
   */
  on(event: 'score', callback: (state: Score) => void): Unsubscribe;
  on(event: 'selection', callback: (state: Selection) => void): Unsubscribe;
  on(event: 'playback', callback: (state: unknown) => void): Unsubscribe;
  on(event: APIEventType, callback: (state: unknown) => void): Unsubscribe;
}
