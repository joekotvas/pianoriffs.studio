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

export interface SelectAllOptions {
  /** Explicit scope to select (bypasses progressive expansion) */
  scope?: SelectAllScope;
  /** If true, use progressive expansion logic (default: true for keyboard) */
  expandIfSelected?: boolean;
  /** Staff index (required for 'staff' or 'measure' scope, uses current if not provided) */
  staffIndex?: number;
  /** Measure index (required for 'measure' scope, uses current if not provided) */
  measureIndex?: number;
}

/**
 * Command to select all notes following hierarchical expansion
 */
export class SelectAllCommand implements SelectionCommand {
  readonly type = 'SELECT_ALL';
  private options: SelectAllOptions;

  constructor(options: SelectAllOptions = {}) {
    this.options = options;
  }

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
   */
  private progressiveExpansion(state: Selection, score: Score): Selection {
    const { selectedNotes } = state;

    // Case 1: No selection → Select entire Score
    if (selectedNotes.length === 0) {
      return this.selectScope(state, score, 'score', 0, 0);
    }

    // Get unique touched measures and staves
    const touchedMeasures = this.getUniqueTouchedMeasures(selectedNotes);
    const touchedStaves = this.getUniqueTouchedStaves(selectedNotes);

    // Case 2: Check if any touched measure is partially selected
    const hasPartialMeasures = touchedMeasures.some(({ staffIndex, measureIndex }) => {
      const allNotesInMeasure = this.collectNotesInMeasure(score, staffIndex, measureIndex);
      return !this.isFullySelected(selectedNotes, allNotesInMeasure);
    });

    if (hasPartialMeasures) {
      // Fill all touched measures
      const notesToSelect = this.collectNotesInTouchedMeasures(score, touchedMeasures);
      return this.createSelectionFromNotes(notesToSelect);
    }

    // Case 3: All touched measures are full, check if any touched staff is partial
    const hasPartialStaves = touchedStaves.some(staffIndex => {
      const allNotesInStaff = this.collectNotesInStaff(score, staffIndex);
      return !this.isFullySelected(selectedNotes, allNotesInStaff);
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
   * Select a specific scope
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
   * Check if a container is fully selected
   */
  private isFullySelected(currentSelection: SelectedNote[], allNotes: SelectedNote[]): boolean {
    if (allNotes.length === 0) return true;
    
    const selectedIds = new Set(
      currentSelection.map(n => `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`)
    );

    return allNotes.every(n => 
      selectedIds.has(`${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`)
    );
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
   * Create selection state from collected notes
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
