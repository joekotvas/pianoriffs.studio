export interface Note {
  pitch: string | null;  // null for rest notes
  tied?: boolean;
  id: string | number;
  accidental?: string | null;
  isRest?: boolean;      // True for rest notes
}

export interface ScoreEvent {
  id: string | number;
  duration: string;
  dotted: boolean;
  notes: Note[];
  isRest?: boolean;
  x?: number;
  quant?: number;
  chordLayout?: ChordLayout;
  tuplet?: {
    ratio: [number, number];
    groupSize: number;
    position: number;
    baseDuration?: string;
    id?: string;
  };
}

export interface ChordLayout {
  sortedNotes: Note[];
  direction: 'up' | 'down';
  noteOffsets: Record<string, number>;
  maxNoteShift: number;
  minNoteShift?: number;
  minY: number;
  maxY: number;
}

export interface MeasureLayout {
  hitZones: HitZone[];
  eventPositions: Record<string, number>;
  totalWidth: number;
  processedEvents: ScoreEvent[];
}

export interface HitZone {
  startX: number;
  endX: number;
  index: number;
  type: 'APPEND' | 'INSERT' | 'EVENT';
  eventId?: string | number;
}

export interface BeamGroup {
  ids: (string | number)[];
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  direction: 'up' | 'down';
  type: string;
}

export interface TupletBracketGroup {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
  direction: 'up' | 'down';
  number: number;
}


export interface HeaderLayout {
  keySigStartX: number;
  keySigVisualWidth: number;
  timeSigStartX: number;
  startOfMeasures: number;
}
