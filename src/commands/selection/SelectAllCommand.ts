/**
 * SelectAllCommand
 *
 * Selects all notes following a hierarchical expansion pattern.
 *
 * Hierarchy: Note → Measure → Staff → Score
 *
 * Core Principle: The function always attempts to fill the lowest possible
 * incomplete container level across all currently selected items. It only
 * moves up the hierarchy if the current level is already fully selected
 * for all touched items.
 *
 * Logic:
 * 1. No selection → Select entire Score
 * 2. Any touched measure partially selected → Fill those measures
 * 3. All touched measures full, any touched staff partial → Fill those staves
 * 4. All touched staves full → Select entire Score
 *
 * @see Issue #99
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export type SelectAllScope = 'event' | 'measure' | 'staff' | 'score';

/**
 * Options for configuring select-all behavior
 */
export interface SelectAllOptions {
  /**
   * Explicit scope to select (bypasses progressive expansion)
   * - 'event': Select all notes in current event/chord
   * - 'measure': Select all notes in current measure
   * - 'staff': Select all notes on current staff
   * - 'score': Select all notes in entire score
   */
  scope?: SelectAllScope;

  /**
   * If true, use progressive expansion logic.
   * When the current scope is already fully selected, expand to the next level.
   * @default false (true when triggered via keyboard)
   */
  expandIfSelected?: boolean;

  /** Staff index for 'staff' or 'measure' scope (defaults to current) */
  staffIndex?: number;

  /** Measure index for 'measure' scope (defaults to current) */
  measureIndex?: number;
}

/**
 * Command to select all notes with hierarchical expansion support.
 *
 * Supports both explicit scope selection and progressive Cmd+A expansion.
 *
 * @example
 * ```typescript
 * // Select all notes in a measure
 * engine.dispatch(new SelectAllCommand({ scope: 'measure', measureIndex: 0 }));
 *
 * // Progressive expansion (Cmd+A behavior)
 * engine.dispatch(new SelectAllCommand({ expandIfSelected: true }));
 * ```
 *
 * @see Issue #99
 * @tested SelectAllCommand.test.ts
 */
export class SelectAllCommand implements SelectionCommand {
  readonly type = 'SELECT_ALL';
  private options: SelectAllOptions;

  constructor(options: SelectAllOptions = {}) {
    this.options = options;
  }

  /**
   * Execute the select-all command.
   *
   * @param state - Current selection state
   * @param score - The score model to select from
   * @returns New selection state with selected notes
   */
  execute(state: Selection, score: Score): Selection {
    const {
      scope,
      expandIfSelected = false,
      staffIndex = state.staffIndex,
      measureIndex = state.measureIndex,
    } = this.options;

    // If explicit scope provided, use that directly
    if (scope) {
      return this.selectScope(state, score, scope, staffIndex, measureIndex ?? 0);
    }

    // Progressive expansion mode
    if (expandIfSelected) {
      return this.progressiveExpansion(state, score);
    }

    // Default: select entire score
    return this.selectScope(state, score, 'score', 0, 0);
  }

  /**
   * Implements the hierarchical expansion logic from the specification
   * 
   * OPTIMIZATION: We build the selected notes Set once upfront (O(N)),
   * then pass it to completeness checks (O(M)) for O(N+M) total.
   */
  private progressiveExpansion(state: Selection, score: Score): Selection {
    const { selectedNotes } = state;

    // Case 1: No selection → Select entire Score
    if (selectedNotes.length === 0) {
      return this.selectScope(state, score, 'score', 0, 0);
    }

    // OPTIMIZATION: Build the Set of selected note IDs once
    const selectedIds = new Set(selectedNotes.map(n => this.getNoteKey(n)));

    // Get unique touched measures and staves
    const touchedMeasures = this.getUniqueTouchedMeasures(selectedNotes);
    const touchedStaves = this.getUniqueTouchedStaves(selectedNotes);

    // Case 2: Check if any touched measure is partially selected
    const hasPartialMeasures = touchedMeasures.some(({ staffIndex, measureIndex }) => {
      const allNotesInMeasure = this.collectNotesInMeasure(score, staffIndex, measureIndex);
      return !this.isContainerFullySelected(selectedIds, allNotesInMeasure);
    });

    if (hasPartialMeasures) {
      // Fill all touched measures
      const notesToSelect = this.collectNotesInTouchedMeasures(score, touchedMeasures);
      return this.createSelectionFromNotes(notesToSelect);
    }

    // Case 3: All touched measures are full, check if any touched staff is partial
    const hasPartialStaves = touchedStaves.some(staffIndex => {
      const allNotesInStaff = this.collectNotesInStaff(score, staffIndex);
      return !this.isContainerFullySelected(selectedIds, allNotesInStaff);
    });

    if (hasPartialStaves) {
      // Fill all touched staves
      const notesToSelect = this.collectNotesInTouchedStaves(score, touchedStaves);
      return this.createSelectionFromNotes(notesToSelect);
    }

    // Case 4: Everything relevant is full → Select entire Score
    return this.selectScope(state, score, 'score', 0, 0);
  }

  /**
   * Select notes in a specific scope.
   *
   * @param state - Current selection state (returned if scope is empty)
   * @param scope - Target scope to select
   * @returns New selection with all notes in the scope
   */
  private selectScope(
    state: Selection,
    score: Score,
    scope: SelectAllScope,
    staffIndex: number,
    measureIndex: number
  ): Selection {
    const selectedNotes = this.collectNotesInScope(score, scope, staffIndex, measureIndex);
    
    if (selectedNotes.length === 0) {
      return state;
    }

    return this.createSelectionFromNotes(selectedNotes);
  }

  /**
   * Get unique (staffIndex, measureIndex) pairs from selection
   */
  private getUniqueTouchedMeasures(
    selectedNotes: SelectedNote[]
  ): Array<{ staffIndex: number; measureIndex: number }> {
    const seen = new Set<string>();
    const result: Array<{ staffIndex: number; measureIndex: number }> = [];

    for (const note of selectedNotes) {
      const key = `${note.staffIndex}-${note.measureIndex}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ staffIndex: note.staffIndex, measureIndex: note.measureIndex });
      }
    }

    return result;
  }

  /**
   * Get unique staff indices from selection
   */
  private getUniqueTouchedStaves(selectedNotes: SelectedNote[]): number[] {
    const seen = new Set<number>();
    const result: number[] = [];

    for (const note of selectedNotes) {
      if (!seen.has(note.staffIndex)) {
        seen.add(note.staffIndex);
        result.push(note.staffIndex);
      }
    }

    return result;
  }

  /**
   * Generate a unique key for a note selection
   * Ensures consistent format across Set creation and lookup
   */
  private getNoteKey(note: SelectedNote): string {
    return `${note.staffIndex}-${note.measureIndex}-${note.eventId}-${note.noteId}`;
  }

  /**
   * Check if all notes in a container are present in the selection Set
   * @param selectedIds - Pre-computed Set of selected note keys
   * @param containerNotes - All notes in the container to check
   */
  private isContainerFullySelected(
    selectedIds: Set<string>,
    containerNotes: SelectedNote[]
  ): boolean {
    if (containerNotes.length === 0) return true;
    return containerNotes.every(n => selectedIds.has(this.getNoteKey(n)));
  }

  /**
   * Collect notes from multiple measures
   */
  private collectNotesInTouchedMeasures(
    score: Score,
    measures: Array<{ staffIndex: number; measureIndex: number }>
  ): SelectedNote[] {
    const notes: SelectedNote[] = [];
    
    for (const { staffIndex, measureIndex } of measures) {
      notes.push(...this.collectNotesInMeasure(score, staffIndex, measureIndex));
    }

    return notes;
  }

  /**
   * Collect notes from multiple staves
   */
  private collectNotesInTouchedStaves(score: Score, staves: number[]): SelectedNote[] {
    const notes: SelectedNote[] = [];
    
    for (const staffIndex of staves) {
      notes.push(...this.collectNotesInStaff(score, staffIndex));
    }

    return notes;
  }

  /**
   * Collect all notes in a single measure
   */
  private collectNotesInMeasure(
    score: Score,
    staffIndex: number,
    measureIndex: number
  ): SelectedNote[] {
    const notes: SelectedNote[] = [];
    const staff = score.staves[staffIndex];
    if (!staff) return notes;

    const measure = staff.measures[measureIndex];
    if (!measure) return notes;

    for (const event of measure.events) {
      for (const note of event.notes) {
        notes.push({
          staffIndex,
          measureIndex,
          eventId: event.id,
          noteId: note.id,
        });
      }
      // Include rests
      if (event.isRest && event.notes.length === 0) {
        notes.push({
          staffIndex,
          measureIndex,
          eventId: event.id,
          noteId: null,
        });
      }
    }

    return notes;
  }

  /**
   * Collect all notes in a single staff
   */
  private collectNotesInStaff(score: Score, staffIndex: number): SelectedNote[] {
    const notes: SelectedNote[] = [];
    const staff = score.staves[staffIndex];
    if (!staff) return notes;

    for (let mIdx = 0; mIdx < staff.measures.length; mIdx++) {
      notes.push(...this.collectNotesInMeasure(score, staffIndex, mIdx));
    }

    return notes;
  }

  /**
   * Collect all notes in a given scope
   */
  private collectNotesInScope(
    score: Score,
    scope: SelectAllScope,
    staffIndex: number,
    measureIndex: number
  ): SelectedNote[] {
    switch (scope) {
      case 'event':
        return this.collectNotesInEvent(score, staffIndex, measureIndex);
      case 'measure':
        return this.collectNotesInMeasure(score, staffIndex, measureIndex);
      case 'staff':
        return this.collectNotesInStaff(score, staffIndex);
      case 'score':
        return this.collectAllNotes(score);
    }
  }

  /**
   * Collect all notes in the first event at the given position
   */
  private collectNotesInEvent(
    score: Score,
    staffIndex: number,
    measureIndex: number
  ): SelectedNote[] {
    const notes: SelectedNote[] = [];
    const staff = score.staves[staffIndex];
    if (!staff) return notes;

    const measure = staff.measures[measureIndex];
    if (!measure || measure.events.length === 0) return notes;

    const event = measure.events[0];
    for (const note of event.notes) {
      notes.push({
        staffIndex,
        measureIndex,
        eventId: event.id,
        noteId: note.id,
      });
    }

    if (event.isRest && event.notes.length === 0) {
      notes.push({
        staffIndex,
        measureIndex,
        eventId: event.id,
        noteId: null,
      });
    }

    return notes;
  }

  /**
   * Collect all notes in the score
   */
  private collectAllNotes(score: Score): SelectedNote[] {
    const notes: SelectedNote[] = [];

    for (let sIdx = 0; sIdx < score.staves.length; sIdx++) {
      notes.push(...this.collectNotesInStaff(score, sIdx));
    }

    return notes;
  }

  /**
   * Create a Selection state from collected notes.
   *
   * Sets cursor to the first selected note and stores all notes in `selectedNotes`.
   *
   * @param selectedNotes - Array of notes to include in selection
   * @returns New Selection state
   */
  private createSelectionFromNotes(selectedNotes: SelectedNote[]): Selection {
    if (selectedNotes.length === 0) {
      return {
        staffIndex: 0,
        measureIndex: null,
        eventId: null,
        noteId: null,
        selectedNotes: [],
        anchor: null,
      };
    }

    const first = selectedNotes[0];

    return {
      staffIndex: first.staffIndex,
      measureIndex: first.measureIndex,
      eventId: first.eventId,
      noteId: first.noteId,
      selectedNotes,
      anchor: first,
    };
  }
}
