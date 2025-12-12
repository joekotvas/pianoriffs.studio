import { Selection, Measure } from './types';

/**
 * Encapsulates all layout configuration required for a measure to render.
 * These are visual settings that do not change the musical content.
 */
export interface LayoutConfig {
  scale: number;
  baseY: number;      // Base Y for the system (e.g. CONFIG.baseY)
  clef: string;       // Current Clef ('treble', 'bass')
  keySignature: string; // Current Key Sig
  staffIndex: number; // Which staff this measure belongs to
  verticalOffset: number; // Vertical offset for hit detection mapping
}

/**
 * Encapsulates all user interaction state and callbacks.
 * This object can be passed down the tree to avoid prop drilling.
 */
export interface InteractionState {
  // State
  selection: Selection;
  previewNote: any | null; // Note preview data
  activeDuration: string;
  isDotted: boolean;
  modifierHeld: boolean;
  isDragging: boolean;
  
  // Actions
  onAddNote: (measureIndex: number, note: any, shouldAutoAdvance?: boolean, placementOverride?: any) => void;
  onSelectNote: (measureIndex: number | null, eventId: number | string | null, noteId: number | string | null, staffIndex?: number, isMulti?: boolean, selectAllInEvent?: boolean, isShift?: boolean) => void;
  onDragStart: (params: any) => void;
  onHover: (measureIndex: number | null, hit: any, pitch: string, staffIndex?: number) => void;
}

/**
 * Standardized props for the Measure component.
 */
export interface MeasureProps {
  // 1. Identity & Data
  measureIndex: number;
  measureData: Measure; // { events, isPickup, id }
  
  // 2. Formatting (Positioning)
  startX: number;
  isLast: boolean;
  forcedWidth?: number; // For Grand Staff sync
  forcedEventPositions?: Record<number, number>;
  
  // 3. Contexts (Grouped)
  layout: LayoutConfig;
  interaction: InteractionState;
}
