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
  
  // Use ref for depth to rely on imperative API logic without render dependency issues
  const depthRef = useRef(0);

  // Force update if needed? No, logic is mostly imperative.

  /**
   * Dispatches a command, respecting the current transaction state.
   */
  const dispatch = useCallback((command: Command) => {
    if (depthRef.current > 0) {
      // In a transaction: Execute immediately to update state, 
      // but DO NOT add to history yet. Buffer it instead.
      try {
        engine.dispatch(command, { addToHistory: false });
        bufferRef.current.push(command);
      } catch (error) {
        // If execution fails, we should probably auto-rollback or just let it throw?
        // Let's let it throw, but the consumer handles the transaction state.
        // Safety: ensure consumer calls rollbackTransaction in catch block if needed.
        throw error;
      }
    } else {
      // Normal operation
      engine.dispatch(command);
    }
  }, [engine]);

  /**
   * Starts a new transaction. Supports nesting (no-op if already open).
   */
  const beginTransaction = useCallback(() => {
    depthRef.current++;
  }, []);

  /**
   * Commits the current transaction.
   * If this closes the outermost transaction, flushes the buffer to history.
   * 
   * @param label Optional label for the batch command (e.g. "Import MIDI")
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
    }
  }, [engine]);

  /**
   * Rolls back the current transaction.
   * Reverses all buffered commands on the engine (Undo) and clears buffer.
   * Resets depth to 0.
   */
  const rollbackTransaction = useCallback(() => {
    if (depthRef.current === 0 && bufferRef.current.length === 0) return;

    // Undo all buffered commands in reverse order
    // to restore application state to pre-transaction
    const buffer = bufferRef.current;
    
    // We can't use engine.undo() because these weren't in history.
    // We must manually undo them against the engine state.
    // However, engine.undo() pops from history.
    // So we need to execute the undo logic manually.
    
    // Create a temporary batch to reuse the undo logic
    const tempBatch = new BatchCommand(buffer);
    const currentState = engine.getState();
    const restoredState = tempBatch.undo(currentState);
    
    // Force state update without history
    engine.setState(restoredState);

    // Reset
    bufferRef.current = [];
    depthRef.current = 0;
    
    console.log('[RiffScore] Transaction rolled back');
  }, [engine]);

  return {
    dispatch,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    isBatching: depthRef.current > 0 // Note: This ref access isn't reactive for UI rendering
  };
}
