/**
 * SelectAllCommand
 *
 * Selects all notes in a specified scope with optional progressive expansion.
 *
 * Progressive expansion (Cmd+A behavior):
 * - If everything in current scope is already selected, expand to next level
 * - Single note → Event → Measure → Staff → Score
 *
 * @see Issue #99
 */

import type { Selection, Score, SelectedNote } from '../../types';
import type { SelectionCommand } from './types';

export type SelectAllScope = 'event' | 'measure' | 'staff' | 'score';

export interface SelectAllOptions {
  /** Explicit scope to select (bypasses progressive expansion) */
  scope?: SelectAllScope;
  /** If true, auto-expand if current scope already fully selected (default: true for keyboard) */
  expandIfSelected?: boolean;
  /** Staff index (required for 'staff' or 'measure' scope, uses current if not provided) */
  staffIndex?: number;
  /** Measure index (required for 'measure' scope, uses current if not provided) */
  measureIndex?: number;
}

/**
 * Command to select all notes in a scope
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

    // Determine target scope
    let targetScope: SelectAllScope;
    
    if (scope) {
      // Explicit scope provided
      targetScope = scope;
    } else if (expandIfSelected) {
      // Progressive expansion: detect current scope and expand
      const currentScope = this.detectCurrentScope(state, score);
      targetScope = this.expandScope(currentScope);
    } else {
      // Default to score
      targetScope = 'score';
    }

    // Collect all notes in the target scope
    const selectedNotes = this.collectNotesInScope(
      score,
      targetScope,
      staffIndex,
      measureIndex ?? 0
    );

    if (selectedNotes.length === 0) {
      return state;
    }

    // Set cursor to first selected note
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

  /**
   * Detect what scope the current selection represents
   */
  private detectCurrentScope(state: Selection, score: Score): SelectAllScope {
    const { selectedNotes, staffIndex, measureIndex } = state;

    if (selectedNotes.length === 0) {
      return 'event'; // Start from smallest scope
    }

    // Check if all notes in score are selected
    const allScoreNotes = this.collectNotesInScope(score, 'score', 0, 0);
    if (this.selectionsMatch(selectedNotes, allScoreNotes)) {
      return 'score';
    }

    // Check if all notes on current staff are selected
    const allStaffNotes = this.collectNotesInScope(score, 'staff', staffIndex, 0);
    if (this.selectionsMatch(selectedNotes, allStaffNotes)) {
      return 'staff';
    }

    // Check if all notes in current measure are selected
    if (measureIndex !== null) {
      const allMeasureNotes = this.collectNotesInScope(score, 'measure', staffIndex, measureIndex);
      if (this.selectionsMatch(selectedNotes, allMeasureNotes)) {
        return 'measure';
      }
    }

    // Check if all notes in current event are selected
    if (state.eventId !== null && measureIndex !== null) {
      const allEventNotes = this.collectNotesInEvent(score, staffIndex, measureIndex, state.eventId);
      if (this.selectionsMatch(selectedNotes, allEventNotes)) {
        return 'event';
      }
    }

    // Default: partial selection, treat as event level
    return 'event';
  }

  /**
   * Expand to the next scope level
   */
  private expandScope(currentScope: SelectAllScope): SelectAllScope {
    switch (currentScope) {
      case 'event':
        return 'measure';
      case 'measure':
        return 'staff';
      case 'staff':
        return 'score';
      case 'score':
        return 'score'; // Already at max
    }
  }

  /**
   * Check if two selection arrays contain the same notes
   */
  private selectionsMatch(a: SelectedNote[], b: SelectedNote[]): boolean {
    if (a.length !== b.length) return false;
    
    const aIds = new Set(a.map(n => `${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`));
    return b.every(n => aIds.has(`${n.staffIndex}-${n.measureIndex}-${n.eventId}-${n.noteId}`));
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
    const notes: SelectedNote[] = [];

    const staffStart = scope === 'score' ? 0 : staffIndex;
    const staffEnd = scope === 'score' ? score.staves.length : staffIndex + 1;

    for (let sIdx = staffStart; sIdx < staffEnd; sIdx++) {
      const staff = score.staves[sIdx];
      if (!staff) continue;

      const measureStart = (scope === 'score' || scope === 'staff') ? 0 : measureIndex;
      const measureEnd = (scope === 'score' || scope === 'staff') ? staff.measures.length : measureIndex + 1;

      for (let mIdx = measureStart; mIdx < measureEnd; mIdx++) {
        const measure = staff.measures[mIdx];
        if (!measure) continue;

        for (const event of measure.events) {
          // For 'event' scope, we'd need an eventId filter - but this method handles broader scopes
          for (const note of event.notes) {
            notes.push({
              staffIndex: sIdx,
              measureIndex: mIdx,
              eventId: event.id,
              noteId: note.id,
            });
          }
          // Also include rests
          if (event.isRest && event.notes.length === 0) {
            notes.push({
              staffIndex: sIdx,
              measureIndex: mIdx,
              eventId: event.id,
              noteId: null,
            });
          }
        }
      }
    }

    return notes;
  }

  /**
   * Collect all notes in a specific event
   */
  private collectNotesInEvent(
    score: Score,
    staffIndex: number,
    measureIndex: number,
    eventId: string | number
  ): SelectedNote[] {
    const notes: SelectedNote[] = [];
    const staff = score.staves[staffIndex];
    if (!staff) return notes;

    const measure = staff.measures[measureIndex];
    if (!measure) return notes;

    const event = measure.events.find(e => e.id === eventId);
    if (!event) return notes;

    for (const note of event.notes) {
      notes.push({
        staffIndex,
        measureIndex,
        eventId,
        noteId: note.id,
      });
    }

    // Include rest if applicable
    if (event.isRest && event.notes.length === 0) {
      notes.push({
        staffIndex,
        measureIndex,
        eventId,
        noteId: null,
      });
    }

    return notes;
  }
}
