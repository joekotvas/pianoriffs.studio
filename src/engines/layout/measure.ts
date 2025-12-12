/**
 * Measure Layout Engine
 * 
 * Calculates the horizontal layout of events within a single measure.
 * Handles event positioning, hit zone generation for interaction,
 * and special cases like tuplets and empty measures.
 */

import { CONFIG } from '../../config';
import { getNoteDuration } from '../../utils/core';
import { MIDDLE_LINE_Y, NOTE_SPACING_BASE_UNIT, WHOLE_REST_WIDTH, LAYOUT } from '../../constants';
import { ScoreEvent, MeasureLayout, HitZone, Note, ChordLayout } from './types';
import { getNoteWidth, calculateChordLayout, getOffsetForPitch } from './positioning';
import { getTupletGroup } from './tuplets';

// --- CONSTANTS (from centralized LAYOUT) ---

/** Hit zone radius around each note for click detection (pixels) */
const HIT_RADIUS = LAYOUT.HIT_ZONE_RADIUS;

/** Padding added before noteheads when accidentals are present */
const ACCIDENTAL_PADDING = NOTE_SPACING_BASE_UNIT * 0.8;

/** Minimum width factors for short-duration notes relative to NOTE_SPACING_BASE_UNIT */
const MIN_WIDTH_FACTORS = LAYOUT.MIN_WIDTH_FACTORS;

// --- TYPES ---

/** Result from processing an event (regular or tuplet) */
interface EventProcessResult {
    processedEvents: ScoreEvent[];
    hitZones: HitZone[];
    eventPositions: Record<string, number>;
    widthConsumed: number;
    quantsConsumed: number;
}

/** Context passed to event processors */
interface ProcessingContext {
    currentX: number;
    currentQuant: number;
    clef: string;
    forcedEventPositions?: Record<number, number>;
}

// --- HELPER: Hit Zone Management ---

/**
 * Adds a hit zone to the collection while maintaining continuity.
 * Automatically adjusts the previous zone's endX to prevent overlaps/gaps.
 * 
 * @param zones - The array of existing hit zones (mutated)
 * @param newZone - The new hit zone to add
 */
const addHitZone = (zones: HitZone[], newZone: HitZone): void => {
    if (zones.length > 0) {
        const prevZone = zones[zones.length - 1];
        prevZone.endX = Math.min(prevZone.endX, newZone.startX);
    }
    zones.push(newZone);
};

/**
 * Creates hit zones for an event at a given position.
 * Generates both an EVENT zone (for clicking on the note) and optionally
 * an INSERT zone (for adding notes after this event).
 * 
 * @param noteheadX - X position of the notehead
 * @param eventIndex - Index of this event in the measure's event array
 * @param eventId - Unique identifier for the event
 * @param minOffset - Leftmost offset from notehead (negative for down-stem seconds)
 * @param maxOffset - Rightmost offset from notehead (positive for up-stem seconds)
 * @param totalWidth - Total visual width consumed by this event
 * @returns Array of HitZone objects for this event
 */
const createEventHitZones = (
    noteheadX: number,
    eventIndex: number,
    eventId: string | number,
    minOffset: number,
    maxOffset: number,
    totalWidth: number
): HitZone[] => {
    const zones: HitZone[] = [];
    
    // Zone 1: Event hit area
    const adjustedStartX = Math.max(0, noteheadX - HIT_RADIUS + minOffset);
    const adjustedEndX = noteheadX + HIT_RADIUS + maxOffset;
    
    zones.push({
        startX: adjustedStartX,
        endX: adjustedEndX,
        index: eventIndex,
        type: 'EVENT',
        eventId
    });

    // Zone 2: Insert hit area (space after note)
    if (totalWidth > adjustedEndX - noteheadX + HIT_RADIUS) {
        zones.push({
            startX: adjustedEndX,
            endX: noteheadX + totalWidth,
            index: eventIndex + 1,
            type: 'INSERT'
        });
    }

    return zones;
};

// --- HELPER: Event Metrics ---

/**
 * Calculates visual metrics for a single event.
 * Consolidates width calculation, accidental spacing, and chord note offsets
 * into a single analysis pass.
 * 
 * @param event - The score event to analyze
 * @param clef - Current clef ('treble' or 'bass')
 * @returns Object containing chordLayout, totalWidth, accidentalSpace, offsets, and baseWidth
 */
const getEventMetrics = (event: ScoreEvent, clef: string) => {
    const chordLayout = calculateChordLayout(event.notes, clef);
    const hasAccidental = event.notes.some((n: Note) => n.accidental);
    const accidentalSpace = hasAccidental ? ACCIDENTAL_PADDING : 0;
    
    const baseWidth = getNoteWidth(event.duration, event.dotted);
    
    const offsets = Object.values(chordLayout.noteOffsets);
    const hasSecond = offsets.some(v => v !== 0);
    const secondSpace = hasSecond ? LAYOUT.SECOND_INTERVAL_SPACE : 0;
    const secondAccidentalSpace = (hasSecond && hasAccidental) ? ACCIDENTAL_PADDING * 0.5 : 0;
    
    const totalWidth = accidentalSpace + baseWidth + secondSpace + secondAccidentalSpace;

    const minOffset = offsets.length > 0 ? Math.min(0, ...offsets) : 0;
    const maxOffset = offsets.length > 0 ? Math.max(0, ...offsets) : 0;

    return { chordLayout, totalWidth, accidentalSpace, minOffset, maxOffset, baseWidth };
};


/**
 * Post-processes the events to apply special centering rules.
 */
export const applyMeasureCentering = (events: ScoreEvent[], measureWidth: number): ScoreEvent[] => {
    if (events.length === 1 && events[0].id === 'rest-placeholder') {
        const rest = events[0];
        const targetVisualCenter = measureWidth / 2;
        const x = targetVisualCenter - (WHOLE_REST_WIDTH / 2);

        return [{ ...rest, x }];
    }
    
    return events;
};

// --- EXTRACTED: Empty Measure Handler ---

/**
 * Creates the layout for an empty measure.
 * Generates a centered whole rest placeholder with appropriate hit zones.
 * 
 * @returns Complete MeasureLayout for an empty measure
 */
const createEmptyMeasureLayout = (): MeasureLayout => {
    const width = getNoteWidth('whole', false);
    const x = CONFIG.measurePaddingLeft;
    
    const emptyChordLayout: ChordLayout = {
        sortedNotes: [],
        direction: 'up',
        noteOffsets: {},
        maxNoteShift: 0,
        minY: 0,
        maxY: 0
    };
    
    const totalWidth = Math.max(x + width, width + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight);

    const processedEvents: ScoreEvent[] = [{
        id: 'rest-placeholder',
        duration: 'whole',
        dotted: false,
        notes: [],
        isRest: true,
        x,
        quant: 0,
        chordLayout: emptyChordLayout
    }];
    
    return {
        hitZones: [{ startX: CONFIG.measurePaddingLeft, endX: x + width, index: 0, type: 'APPEND' }],
        eventPositions: {},
        totalWidth,
        processedEvents: applyMeasureCentering(processedEvents, totalWidth)
    };
};

// --- EXTRACTED: Regular Event Processor ---

/**
 * Processes a single regular (non-tuplet) event.
 * Calculates position, generates hit zones, and returns processing result.
 * 
 * @param event - The event to process
 * @param eventIndex - Index in the measure's event array
 * @param ctx - Processing context with current position and clef
 * @returns EventProcessResult with processed event, hit zones, and consumed dimensions
 */
const processRegularEvent = (
    event: ScoreEvent,
    eventIndex: number,
    ctx: ProcessingContext
): EventProcessResult => {
    const metrics = getEventMetrics(event, ctx.clef);
    
    // Apply sync override if provided
    let baseX = ctx.currentX;
    if (ctx.forcedEventPositions?.[ctx.currentQuant] !== undefined) {
        baseX = ctx.forcedEventPositions[ctx.currentQuant];
    }
    
    // Compensate for negative offsets (down-stem seconds)
    const negativeCompensation = Math.abs(metrics.minOffset);
    const noteheadX = baseX + metrics.accidentalSpace + negativeCompensation;
    
    const processedEvent: ScoreEvent = {
        ...event,
        x: noteheadX,
        quant: ctx.currentQuant,
        chordLayout: metrics.chordLayout
    };
    
    const hitZones = createEventHitZones(
        noteheadX,
        eventIndex,
        event.id,
        metrics.minOffset,
        metrics.maxOffset,
        metrics.totalWidth
    );
    
    return {
        processedEvents: [processedEvent],
        hitZones,
        eventPositions: { [event.id]: noteheadX },
        widthConsumed: metrics.totalWidth + negativeCompensation,
        quantsConsumed: getNoteDuration(event.duration, event.dotted, event.tuplet)
    };
};

// --- EXTRACTED: Tuplet Group Processor ---

/**
 * Determines the unified stem direction for a tuplet group.
 * Finds the note farthest from the middle line and uses that to decide
 * whether all stems should point up or down.
 * 
 * @param tupletGroup - Array of events in the tuplet
 * @param clef - Current clef for pitch-to-Y conversion
 * @returns 'up' or 'down' direction for all stems in the group
 */
const getTupletUnifiedDirection = (
    tupletGroup: ScoreEvent[],
    clef: string
): 'up' | 'down' => {
    let maxDist = -1;
    let direction: 'up' | 'down' = 'down';

    tupletGroup.forEach(te => {
        te.notes.forEach((n: Note) => {
            // Skip rest notes (null pitch)
            if (n.pitch === null) return;
            const y = CONFIG.baseY + getOffsetForPitch(n.pitch, clef);
            const dist = Math.abs(y - MIDDLE_LINE_Y);
            if (dist > maxDist) {
                maxDist = dist;
                direction = y <= MIDDLE_LINE_Y ? 'down' : 'up';
            }
        });
    });

    return direction;
};

/**
 * Processes a tuplet group starting at the given index.
 * Handles compressed widths, unified stem direction, and generates
 * hit zones for all events in the group.
 * 
 * @param events - All events in the measure
 * @param startIndex - Index of the first event in the tuplet group
 * @param ctx - Processing context with current position and clef
 * @returns EventProcessResult with all tuplet events processed
 */
const processTupletGroup = (
    events: ScoreEvent[],
    startIndex: number,
    ctx: ProcessingContext
): EventProcessResult => {
    const tupletGroup = getTupletGroup(events, startIndex);
    const startEvent = events[startIndex];
    const { ratio } = startEvent.tuplet!;
    
    const unifiedDirection = getTupletUnifiedDirection(tupletGroup, ctx.clef);
    
    const processedEvents: ScoreEvent[] = [];
    const hitZones: HitZone[] = [];
    const eventPositions: Record<string, number> = {};
    
    let x = ctx.currentX;
    let quant = ctx.currentQuant;
    
    // Apply sync override if provided
    if (ctx.forcedEventPositions?.[quant] !== undefined) {
        x = ctx.forcedEventPositions[quant];
    }
    
    tupletGroup.forEach((tupletEvent) => {
        const evtIndex = events.indexOf(tupletEvent);
        
        // Calculate compressed width for tuplet
        const originalWidth = getNoteWidth(tupletEvent.duration, tupletEvent.dotted);
        const tupletWidth = originalWidth * Math.sqrt(ratio[1] / ratio[0]);
        
        // Recalculate chord layout with unified direction
        const chordLayout = calculateChordLayout(tupletEvent.notes, ctx.clef, unifiedDirection);
        const minOffset = Math.min(0, ...Object.values(chordLayout.noteOffsets), 0);
        const maxOffset = Math.max(0, ...Object.values(chordLayout.noteOffsets), 0);

        eventPositions[tupletEvent.id] = x;
        
        processedEvents.push({
            ...tupletEvent,
            x,
            quant,
            chordLayout
        });

        // Create hit zones
        const adjustedStartX = Math.max(0, x - HIT_RADIUS + minOffset);
        const adjustedEndX = x + HIT_RADIUS + maxOffset;

        hitZones.push({
            startX: adjustedStartX,
            endX: adjustedEndX,
            index: evtIndex,
            type: 'EVENT',
            eventId: tupletEvent.id
        });

        // Insert zone (if enough space)
        if (tupletWidth > (HIT_RADIUS * 2 + maxOffset)) {
            hitZones.push({
                startX: adjustedEndX,
                endX: x + tupletWidth,
                index: evtIndex + 1,
                type: 'INSERT'
            });
        }

        x += tupletWidth;
        quant += getNoteDuration(tupletEvent.duration, tupletEvent.dotted, tupletEvent.tuplet);
    });

    return {
        processedEvents,
        hitZones,
        eventPositions,
        widthConsumed: x - ctx.currentX,
        quantsConsumed: quant - ctx.currentQuant
    };
};

// --- MAIN LAYOUT CALCULATOR (Orchestration) ---

/**
 * Calculates the layout for a single measure.
 * 
 * This function orchestrates the layout process:
 * 1. Handles empty measures
 * 2. Processes events (delegating to specialized handlers)
 * 3. Generates hit zones for interaction
 * 4. Calculates final measure width
 */
export const calculateMeasureLayout = (
    events: ScoreEvent[], 
    totalQuants: number = CONFIG.quantsPerMeasure, 
    clef: string = 'treble', 
    isPickup: boolean = false, 
    forcedEventPositions?: Record<number, number>
): MeasureLayout => {
    // 1. Handle Empty Measure
    if (events.length === 0) {
        return createEmptyMeasureLayout();
    }

    // 2. Initialize State
    const hitZones: HitZone[] = [];
    const eventPositions: Record<string, number> = {};
    const processedEvents: ScoreEvent[] = [];
    const processedIndices = new Set<number>();
    
    let currentX = CONFIG.measurePaddingLeft;
    let currentQuant = 0;

    // Initial Insert Zone
    hitZones.push({ startX: 0, endX: CONFIG.measurePaddingLeft, index: 0, type: 'INSERT' });

    // 3. Process Events
    events.forEach((event, index) => {
        if (processedIndices.has(index)) return;

        const ctx: ProcessingContext = {
            currentX,
            currentQuant,
            clef,
            forcedEventPositions
        };

        const isTupletStart = event.tuplet && event.tuplet.position === 0;
        let result: EventProcessResult;

        if (isTupletStart) {
            // Process entire tuplet group
            result = processTupletGroup(events, index, ctx);
            
            // Mark all tuplet events as processed
            const tupletGroup = getTupletGroup(events, index);
            tupletGroup.forEach(te => {
                const idx = events.indexOf(te);
                if (idx !== -1) processedIndices.add(idx);
            });
        } else if (!event.tuplet || event.tuplet.position === 0) {
            // Process regular event
            result = processRegularEvent(event, index, ctx);
        } else {
            // Skip orphaned tuplet parts
            return;
        }

        // Merge results
        result.processedEvents.forEach(pe => processedEvents.push(pe));
        result.hitZones.forEach(hz => addHitZone(hitZones, hz));
        Object.assign(eventPositions, result.eventPositions);
        
        currentX += result.widthConsumed;
        currentQuant += result.quantsConsumed;

        // Lookahead Padding for Next Accidentals
        const nextEvent = events[index + 1];
        if (nextEvent && nextEvent.notes.some((n: Note) => n.accidental)) {
            currentX += NOTE_SPACING_BASE_UNIT * LAYOUT.LOOKAHEAD_PADDING_FACTOR;
        }
    });
    
    // 4. Final Append Zone
    addHitZone(hitZones, { startX: currentX, endX: currentX + LAYOUT.APPEND_ZONE_WIDTH, index: events.length, type: 'APPEND' });
    
    // 5. Calculate Final Width
    const minDuration = isPickup ? 'quarter' : 'whole';
    const minWidth = getNoteWidth(minDuration, false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
    const finalWidth = Math.max(currentX + CONFIG.measurePaddingRight, minWidth);

    return { hitZones, eventPositions, totalWidth: finalWidth, processedEvents };
};

/**
 * Calculates the total visual width of a measure based on its events.
 */
export const calculateMeasureWidth = (events: ScoreEvent[], isPickup: boolean = false): number => {
    return calculateMeasureLayout(events, undefined, 'treble', isPickup).totalWidth;
};

// --- PLACEMENT CALCULATOR ---

/**
 * Analyzes where a new note should be placed based on intended quant position.
 */
export const analyzePlacement = (events: ScoreEvent[], intendedQuant: number) => {
    const MAGNET_THRESHOLD = 3; 
    let currentQuant = 0;
    
    for (const [i, event] of events.entries()) {
        const eventDur = getNoteDuration(event.duration, event.dotted, event.tuplet);
        
        if (Math.abs(intendedQuant - currentQuant) <= MAGNET_THRESHOLD) {
            return { mode: 'CHORD', index: i, visualQuant: currentQuant };
        }

        if (intendedQuant < currentQuant + eventDur) {
            return { mode: 'INSERT', index: i, quant: currentQuant, visualQuant: intendedQuant };
        }
        
        currentQuant += eventDur;
    }

    return { mode: 'APPEND', index: events.length, visualQuant: currentQuant };
};


