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

  /** Synchronous getter for latest score state */
  getScore: () => Score;

  /** Synchronous getter for latest selection state */
  getSelection: () => Selection;

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

  /** UI / Editor State Setters (always provided by useScoreAPI) */
  setTheme: (name: string) => void;
  setZoom: (zoom: number) => void;
  setInputMode: (mode: 'note' | 'rest') => void;

  /** Playback controls (from usePlayback hook) */
  playback?: {
    playScore: (measureIndex?: number, quant?: number) => Promise<void>;
    stopPlayback: () => void;
    pausePlayback: () => void;
    isPlaying: boolean;
  };
}
