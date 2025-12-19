/**
 * SelectionEngine
 *
 * Synchronous state machine for selection management.
 * Mirrors the ScoreEngine pattern but without undo/redo.
 *
 * DESIGN NOTE:
 * Selection changes are frequent and transient - we don't maintain
 * history for them. The engine provides synchronous state access
 * for imperative API calls and notifies React via subscribers.
 *
 * @see src/engines/ScoreEngine.ts for pattern reference
 */

import type { Selection, Score } from '../types';
import { createDefaultSelection } from '../types';
import type { SelectionCommand } from '../commands/selection/types';

type SelectionListener = (selection: Selection) => void;

export class SelectionEngine {
  private state: Selection;
  private listeners: Set<SelectionListener> = new Set();
  private scoreRef: () => Score;

  /**
   * Create a SelectionEngine
   * @param initialSelection - Starting selection state
   * @param scoreGetter - Function to get current score (for command execution)
   */
  constructor(
    initialSelection?: Selection,
    scoreGetter?: () => Score
  ) {
    this.state = initialSelection || createDefaultSelection();
    // Default score getter returns empty score (for testing)
    this.scoreRef = scoreGetter || (() => ({ staves: [], metadata: { title: '' } } as Score));
  }

  /**
   * Get current selection state synchronously
   */
  public getState(): Selection {
    return this.state;
  }

  /**
   * Set selection state directly
   * Used for external sync (e.g., from legacy hooks during migration)
   */
  public setState(newState: Selection): void {
    this.state = newState;
    this.notifyListeners();
  }

  /**
   * Dispatch a selection command
   * Command receives current state + score, returns new state
   */
  public dispatch(command: SelectionCommand): void {
    const score = this.scoreRef();
    const newState = command.execute(this.state, score);
    this.state = newState;
    this.notifyListeners();
  }

  /**
   * Subscribe to selection changes
   * @returns Unsubscribe function
   */
  public subscribe(listener: SelectionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update the score reference
   * Called when score changes to keep commands in sync
   */
  public setScoreGetter(scoreGetter: () => Score): void {
    this.scoreRef = scoreGetter;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
