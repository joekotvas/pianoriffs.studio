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
  editorState: 'IDLE' | 'ENTRY_READY' | 'SELECTION_READY';
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
  activeAccidental: 'flat' | 'natural' | 'sharp' | null;
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
import { NoteInput, ChordNoteInput, PlacementOverride } from '../note/useNoteEntry';
import { HitZone } from '@/engines/layout/types';

/**
 * Entry domain - note/chord creation
 */
export interface ScoreEntryGroup {
  addNote: (
    measureIndex: number,
    newNote: NoteInput,
    shouldAutoAdvance?: boolean,
    placementOverride?: PlacementOverride | null
  ) => void;
  addChord: (
    measureIndex: number,
    notes: ChordNoteInput[],
    duration: string,
    dotted: boolean
  ) => void;
  delete: () => void;
  handleMeasureHover: (
    measureIndex: number | null,
    hit: HitZone | null,
    pitch: string,
    staffIndex?: number
  ) => void;
  updatePitch: (
    measureIndex: number,
    eventId: string | number,
    noteId: string | number,
    newPitch: string
  ) => void;
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
  setGrandStaff: () => void;
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
  commit: (label?: string) => void;
  rollback: () => void;
}

/**
 * Engines domain - low-level engine access
 */
export interface ScoreEnginesGroup {
  dispatch: (command: Command) => void;
  selectionEngine: SelectionEngine;
  /**
   * Direct access to the ScoreEngine instance.
   * @internal Used for synchronous internal API access.
   */
  engine: import('@/engines/ScoreEngine').ScoreEngine;
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
  historyAPI: ScoreHistoryGroup;
  engines: ScoreEnginesGroup;
  derived: ScoreDerivedGroup;

  // Additional top-level exports
  setPreviewNote: (note: PreviewNote | null) => void;
  clearSelection: () => void;
  currentQuantsPerMeasure: number;
}
