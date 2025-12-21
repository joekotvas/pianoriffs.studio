import React from 'react';
import { Score, Selection, RiffScoreConfig } from '@/types';
import { Command } from '@/commands/types';
import { SelectionEngine } from '@/engines/SelectionEngine';
import { ScoreHistoryGroup } from '@/hooks/score/types';

/**
 * Shared context available to all API method factories.
 * Allows modular API methods to interact with the core engine.
 */
export interface APIContext {
  /** Mutable ref to the latest score state (authoritative) */
  scoreRef: React.MutableRefObject<Score>;
  
  /** Mutable ref to the latest selection state (authoritative) */
  selectionRef: React.MutableRefObject<Selection>;
  
  /** Helper to synchronize selection state between Ref and Engine */
  syncSelection: (sel: Selection) => void;
  
  /** Command dispatcher */
  dispatch: React.Dispatch<Command>;
  
  /** Selection engine instance */
  selectionEngine: SelectionEngine;
  
  /** History API (undo/redo/transactions) */
  history: ScoreHistoryGroup;
  
  /** Current configuration */
  config: RiffScoreConfig;
}
