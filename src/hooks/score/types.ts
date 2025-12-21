/**
 * Score Hook Types
 *
 * Type definitions for the useScoreLogic return structure.
 */

import { Score, Selection, PreviewNote } from '@/types';
import { Command } from '@/commands/types';
import { SelectionEngine } from '@/engines/SelectionEngine';
import { RefObject } from 'react';

/**
 * State domain - core score state
 */
export interface ScoreStateGroup {
  score: Score;
  selection: Selection;
  editorState: string;
  previewNote: PreviewNote | null;
  history: Command[];
  redoStack: Command[];
}

/**
 * Tools domain - editor tool state
 */
export interface ScoreToolsGroup {
  activeDuration: string;
  setActiveDuration: (duration: string) => void;
  isDotted: boolean;
  setIsDotted: (dotted: boolean) => void;
  activeAccidental: string | null;
  activeTie: boolean;
  inputMode: 'NOTE' | 'REST';
  setInputMode: (mode: 'NOTE' | 'REST') => void;
  toggleInputMode: () => void;
}

/**
 * Navigation domain - movement and transposition
 */
export interface ScoreNavigationGroup {
  move: (direction: string, isShift: boolean) => void;
  select: (
    measureIndex: number,
    eventId: string | number,
    noteId: string | number | null,
    staffIndex?: number,
    isMulti?: boolean,
    selectAllInEvent?: boolean,
    isShift?: boolean
  ) => void;
  transpose: (direction: string, isShift: boolean) => void;
  switchStaff: (direction: 'up' | 'down') => void;
  focus: () => void;
}

/**
 * Entry domain - note/chord creation
 */
export interface ScoreEntryGroup {
  addNote: (measureIndex: number, newNote: unknown, shouldAutoAdvance?: boolean, placementOverride?: unknown) => void;
  addChord: (measureIndex: number, notes: unknown[], duration: string, dotted: boolean) => void;
  delete: () => void;
  handleMeasureHover: (measureIndex: number | null, hit: unknown, pitch: string, staffIndex?: number) => void;
  updatePitch: (measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => void;
}

/**
 * Modifiers domain - duration, dots, accidentals, ties
 */
export interface ScoreModifiersGroup {
  duration: (duration: string, apply?: boolean) => void;
  dot: () => void;
  accidental: (type: 'flat' | 'natural' | 'sharp' | null) => void;
  tie: () => void;
  checkDurationValidity: (duration: string) => boolean;
  checkDotValidity: () => boolean;
}

/**
 * Measures domain - measure-level operations
 */
export interface ScoreMeasuresGroup {
  add: () => void;
  remove: () => void;
  setTimeSignature: (sig: string) => void;
  setKeySignature: (key: string) => void;
  togglePickup: () => void;
  setGrandStaff: (enabled: boolean) => void;
}

/**
 * Tuplets domain - tuplet operations
 */
export interface ScoreTupletsGroup {
  apply: (ratio: [number, number], groupSize: number) => boolean;
  remove: () => void;
  canApply: (groupSize: number) => boolean;
  activeRatio: [number, number] | null;
}

/**
 * History domain - undo/redo and transactions
 */
export interface ScoreHistoryGroup {
  undo: () => void;
  redo: () => void;
  begin: () => void;
  commit: () => void;
  rollback: () => void;
}

/**
 * Engines domain - low-level engine access
 */
export interface ScoreEnginesGroup {
  dispatch: (command: Command) => void;
  selectionEngine: SelectionEngine;
  scoreRef: RefObject<Score>;
}

/**
 * Derived selection metadata
 */
export interface ScoreDerivedGroup {
  selectedDurations: string[];
  selectedDots: boolean[];
  selectedTies: boolean[];
  selectedAccidentals: string[];
}

/**
 * Complete grouped API return type
 */
export interface UseScoreLogicGroupedReturn {
  // Grouped domains
  state: ScoreStateGroup;
  tools: ScoreToolsGroup;
  navigation: ScoreNavigationGroup;
  entry: ScoreEntryGroup;
  modifiers: ScoreModifiersGroup;
  measures: ScoreMeasuresGroup;
  tuplets: ScoreTupletsGroup;
  history: ScoreHistoryGroup;
  engines: ScoreEnginesGroup;
  derived: ScoreDerivedGroup;
}
