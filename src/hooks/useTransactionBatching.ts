/**
 * useTransactionBatching
 *
 * Provides transaction batching capabilities for the ScoreEngine.
 * Implements "History-Only Batching" where UI updates immediately,
 * but Undo/Redo history is grouped atomically.
 *
 * @see docs/adr/003-transaction-batching.md
 * @tested src/__tests__/ScoreAPI.transactions.test.tsx
 */

import { useRef, useCallback, useState } from 'react';
import type { ScoreEngine } from '../engines/ScoreEngine';
import type { Command } from '../commands/types';
import { BatchCommand } from '../commands/BatchCommand';

export function useTransactionBatching(engine: ScoreEngine) {
  // Use ref for buffer to allow synchronous updates without re-renders
  const bufferRef = useRef<Command[]>([]);
  
  // Use ref for depth to rely on imperative API logic
  const depthRef = useRef(0);

  // Reactive state for UI (e.g. showing "Recording..." badge)
  const [isBatching, setIsBatching] = useState(false);

  /**
   * Dispatches a command, respecting the current transaction state.
   */
  const dispatch = useCallback((command: Command) => {
    if (depthRef.current > 0) {
      // In a transaction: Execute immediately to update state, 
      // but DO NOT add to history yet. Buffer it instead.
      try {
        const success = engine.dispatch(command, { addToHistory: false });
        // Only buffer if execution succeeded
        if (success) {
          bufferRef.current.push(command);
        }
      } catch (error) {
        // If execution fails, we throw.
        // Consumer must handle rollback.
        throw error;
      }
    } else {
      // Normal operation
      engine.dispatch(command);
    }
  }, [engine]);

  /**
   * Starts a new transaction. Supports nesting.
   */
  const beginTransaction = useCallback(() => {
    depthRef.current++;
    if (depthRef.current === 1) {
      setIsBatching(true);
    }
  }, []);

  /**
   * Commits the current transaction.
   */
  const commitTransaction = useCallback((label?: string) => {
    if (depthRef.current === 0) {
      console.warn('[RiffScore] commitTransaction called with no active transaction');
      return;
    }

    depthRef.current--;

    if (depthRef.current === 0) {
      // Outermost transaction closed. Flush buffer.
      if (bufferRef.current.length > 0) {
        const batchCommand = new BatchCommand([...bufferRef.current], label);
        engine.commitBatch(batchCommand);
        bufferRef.current = [];
      }
      setIsBatching(false);
    }
  }, [engine]);

  /**
   * Rolls back the current transaction.
   */
  const rollbackTransaction = useCallback(() => {
    if (depthRef.current === 0 && bufferRef.current.length === 0) return;

    const buffer = bufferRef.current;
    
    // Create a temporary batch to reuse the undo logic
    const tempBatch = new BatchCommand(buffer);
    const currentState = engine.getState();
    const restoredState = tempBatch.undo(currentState);
    
    // Force state update without history.
    // NOTE: This intentionally triggers listeners so the UI reverts 
    // from the optimistic state back to the pre-transaction state.
    engine.setState(restoredState);

    // Reset
    bufferRef.current = [];
    depthRef.current = 0;
    setIsBatching(false);
    
    console.log('[RiffScore] Transaction rolled back');
  }, [engine]);

  return {
    dispatch,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    isBatching
  };
}
