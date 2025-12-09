import { CONFIG } from '../../config';
import { getNoteDuration } from '../../utils/core';
import { MIDDLE_LINE_Y, NOTE_SPACING_BASE_UNIT, WHOLE_REST_WIDTH, LAYOUT } from '../../constants';
import { ScoreEvent, MeasureLayout, HitZone, Note } from './types';
import { getNoteWidth, calculateChordLayout, getOffsetForPitch } from './positioning';
import { getTupletGroup } from './tuplets';

// --- CONSTANTS (from centralized LAYOUT) ---

/** Hit zone radius around each note for click detection (pixels) */
const HIT_RADIUS = LAYOUT.HIT_ZONE_RADIUS;

/** Padding added before noteheads when accidentals are present */
const ACCIDENTAL_PADDING = NOTE_SPACING_BASE_UNIT * 0.8;

/** Minimum width factors for short-duration notes relative to NOTE_SPACING_BASE_UNIT */
const MIN_WIDTH_FACTORS = LAYOUT.MIN_WIDTH_FACTORS;

// --- HELPERS ---

/**
 * Adds a hit zone to the collection while maintaining continuity.
 * Automatically adjusts the previous zone's endX to prevent overlaps/gaps.
 * @param zones - The array of existing hit zones
 * @param newZone - The new hit zone to add
 */
const addHitZone = (zones: HitZone[], newZone: HitZone): void => {
    if (zones.length > 0) {
        const prevZone = zones[zones.length - 1];
        // Ensure the previous zone connects to this one, but respect min sizes
        prevZone.endX = Math.min(prevZone.endX, newZone.startX);
    }
    zones.push(newZone);
};
/**
 * Calculates visual metrics for a single event context.
 * Consolidates width calculation, accidental spacing, and chord offsets.
 * @param event - The score event to analyze
 * @param clef - The current clef ('treble' or 'bass')
 * @returns Object containing chordLayout, totalWidth, accidentalSpace, and hit zone offsets
 */
const getEventMetrics = (event: ScoreEvent, clef: string) => {
    const chordLayout = calculateChordLayout(event.notes, clef);
    const hasAccidental = event.notes.some((n: Note) => n.accidental);
    const accidentalSpace = hasAccidental ? ACCIDENTAL_PADDING : 0;
    
    // Width calculation
    const baseWidth = getNoteWidth(event.duration, event.dotted);
    
    // Add some space for seconds (not the full offset, just a bit for visual clarity)
    const offsets = Object.values(chordLayout.noteOffsets);
    const hasSecond = offsets.some(v => v !== 0);
    const secondSpace = hasSecond ? 6 : 0;
    
    // If there's a second AND accidentals, add extra space (both notes might have accidentals)
    const secondAccidentalSpace = (hasSecond && hasAccidental) ? ACCIDENTAL_PADDING * 0.5 : 0;
    
    const totalWidth = accidentalSpace + baseWidth + secondSpace + secondAccidentalSpace;

    // Hit zone offsets based on chord note offsets
    const minOffset = offsets.length > 0 ? Math.min(0, ...offsets) : 0;
    const maxOffset = offsets.length > 0 ? Math.max(0, ...offsets) : 0;

    return { chordLayout, totalWidth, accidentalSpace, minOffset, maxOffset, baseWidth };
};

// --- LAYOUT CALCULATOR ---

/**
 * Calculates the layout for a single measure, determining x-positions for events
 * and creating hit zones for user interaction.
 * All calculations use CONFIG.baseY - staff positioning is handled by SVG transforms.
 * @param events - List of events in the measure
 * @param totalQuants - Total quants in the measure (default: CONFIG.quantsPerMeasure)
 * @param clef - The current clef ('treble' or 'bass')
 * @param isPickup - Whether this is a pickup measure
 * @param forcedEventPositions - Optional map of {Quant -> X Position} for multi-staff synchronization
 * @returns MeasureLayout containing hitZones, eventPositions, totalWidth, and processedEvents
 */
export const calculateMeasureLayout = (
    events: ScoreEvent[], 
    totalQuants: number = CONFIG.quantsPerMeasure, 
    clef: string = 'treble', 
    isPickup: boolean = false, 
    forcedEventPositions?: Record<number, number>
): MeasureLayout => {
    const hitZones: HitZone[] = [];
    const eventPositions: Record<string, number> = {};
    const processedEvents: ScoreEvent[] = [];
    
    let currentX = CONFIG.measurePaddingLeft;
    let currentQuant = 0;

    // 1. Handle Empty Measure
    if (events.length === 0) {
        const width = getNoteWidth('whole', false);
        processedEvents.push({
            id: 'rest-placeholder',
            duration: 'whole',
            dotted: false,
            notes: [],
            isRest: true,
            x: currentX,
            quant: 0,
            chordLayout: { sortedNotes: [], direction: 'up', noteOffsets: {}, maxNoteShift: 0, minY: 0, maxY: 0 }
        });
        
        hitZones.push({ startX: CONFIG.measurePaddingLeft, endX: currentX + width, index: 0, type: 'APPEND' });
        
        // Ensure minimum width for empty measure
        const minWidth = width + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
        return { hitZones, eventPositions, totalWidth: Math.max(currentX + width, minWidth), processedEvents };
    }

    // 2. Initial Insert Zone
    hitZones.push({ startX: 0, endX: CONFIG.measurePaddingLeft, index: 0, type: 'INSERT' });

    const processedIndices = new Set<number>();

    // 3. Process Events
    events.forEach((event, index) => {
        if (processedIndices.has(index)) return;

        // Sync Override
        if (forcedEventPositions?.[currentQuant] !== undefined) {
            currentX = forcedEventPositions[currentQuant];
        }

        const isTupletStart = event.tuplet && event.tuplet.position === 0;

        if (isTupletStart) {
            // --- TUPLET GROUP LOGIC ---
            const tupletGroup = getTupletGroup(events, index);
            const { ratio } = event.tuplet!;
            
            // Determine Unified Direction
            let maxDist = -1;
            let unifiedDirection: 'up' | 'down' = 'down';

            tupletGroup.forEach(te => {
                te.notes.forEach((n: Note) => {
                    const y = CONFIG.baseY + getOffsetForPitch(n.pitch, clef);
                    const dist = Math.abs(y - MIDDLE_LINE_Y);
                    if (dist > maxDist) {
                        maxDist = dist;
                        unifiedDirection = y <= MIDDLE_LINE_Y ? 'down' : 'up';
                    }
                });
            });

            tupletGroup.forEach((tupletEvent, i) => {
                const evtIndex = events.indexOf(tupletEvent);
                if (evtIndex !== -1) processedIndices.add(evtIndex);

                // Calculate compressed width for tuplet
                const originalWidth = getNoteWidth(tupletEvent.duration, tupletEvent.dotted);
                const tupletWidth = originalWidth * Math.sqrt(ratio[1] / ratio[0]);
                
                // Recalculate chord layout with unified direction
                const chordLayout = calculateChordLayout(tupletEvent.notes, clef, unifiedDirection);
                const minOffset = Math.min(0, ...Object.values(chordLayout.noteOffsets));
                const maxOffset = Math.max(0, ...Object.values(chordLayout.noteOffsets));

                eventPositions[tupletEvent.id] = currentX;

                processedEvents.push({ ...tupletEvent, x: currentX, quant: currentQuant, chordLayout });

                // Hit Zone: Event
                const adjustedStartX = Math.max(0, currentX - HIT_RADIUS + minOffset);
                const adjustedEndX = currentX + HIT_RADIUS + maxOffset;

                addHitZone(hitZones, {
                    startX: adjustedStartX,
                    endX: adjustedEndX,
                    index: evtIndex,
                    type: 'EVENT',
                    eventId: tupletEvent.id
                });

                // Hit Zone: Insert (if enough space)
                if (tupletWidth > (HIT_RADIUS * 2 + maxOffset)) {
                    addHitZone(hitZones, {
                        startX: adjustedEndX,
                        endX: currentX + tupletWidth,
                        index: evtIndex + 1,
                        type: 'INSERT'
                    });
                }

                currentX += tupletWidth;
                currentQuant += getNoteDuration(tupletEvent.duration, tupletEvent.dotted, tupletEvent.tuplet);
            });

        } else if (!event.tuplet || event.tuplet.position === 0) { 
            // --- REGULAR EVENT LOGIC (Non-tuplet or fallback) ---
            // Note: The `!event.tuplet` check handles normal notes. 
            // The `position === 0` check is technically redundant due to the `if` above, 
            // but ensures safety if a stray tuplet part exists without a start.
            
            const metrics = getEventMetrics(event, clef);
            
            // Compensate for negative offsets (down-stem seconds) so the chord's left edge 
            // stays at the same position regardless of stem direction
            const negativeCompensation = Math.abs(metrics.minOffset);
            const noteheadX = currentX + metrics.accidentalSpace + negativeCompensation;
            
            eventPositions[event.id] = noteheadX;
            
            processedEvents.push({
                ...event,
                x: noteheadX,
                quant: currentQuant,
                chordLayout: metrics.chordLayout
            });

            // Zone 1: Chord/Event Hit
            const adjustedStartX = Math.max(0, noteheadX - HIT_RADIUS + metrics.minOffset);
            const adjustedEndX = noteheadX + HIT_RADIUS + metrics.maxOffset;

            addHitZone(hitZones, {
                startX: adjustedStartX,
                endX: adjustedEndX,
                index: index,
                type: 'EVENT',
                eventId: event.id
            });

            // Zone 2: Insert Hit (Space after note)
            const eventTotalEndX = currentX + metrics.totalWidth;
            if (eventTotalEndX > adjustedEndX) {
                addHitZone(hitZones, {
                    startX: adjustedEndX,
                    endX: eventTotalEndX,
                    index: index + 1,
                    type: 'INSERT'
                });
            }

            currentX += metrics.totalWidth + negativeCompensation;
            currentQuant += getNoteDuration(event.duration, event.dotted, event.tuplet);

            // Lookahead Padding for Next Accidentals
            const nextEvent = events[index + 1];
            if (nextEvent && nextEvent.notes.some((n: Note) => n.accidental)) {
                currentX += NOTE_SPACING_BASE_UNIT * LAYOUT.LOOKAHEAD_PADDING_FACTOR;
            }
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
 * @param events - List of events in the measure
 * @param isPickup - Whether this is a pickup measure
 * @returns Total width in pixels
 */
export const calculateMeasureWidth = (events: ScoreEvent[], isPickup: boolean = false): number => {
    return calculateMeasureLayout(events, undefined, 'treble', isPickup).totalWidth;
};

// --- SYSTEM LAYOUT SYNCHRONIZATION ---

/**
 * Calculates a unified layout for a system (group of measures vertically aligned).
 * Ensures that vertical alignment is maintained across staves by considering
 * the rhythm and visual requirements of all staves.
 * @param measures - Array of measures at the same index across all staves
 * @returns Map of Quant -> X Position for synchronized positioning
 */
export const calculateSystemLayout = (measures: { events: ScoreEvent[] }[]): Record<number, number> => {
    // 1. Collect unique time points (Set -> Sort)
    const timePoints = new Set<number>([0]);
    
    measures.forEach(measure => {
        let q = 0;
        for (const event of measure.events) {
            // Add start of event
            timePoints.add(q);
            q += getNoteDuration(event.duration, event.dotted, event.tuplet);
            // Add end of event
            timePoints.add(q);
        }
    });
    
    const sortedPoints = Array.from(timePoints).sort((a, b) => a - b);
    const quantToX: Record<number, number> = { [sortedPoints[0]]: CONFIG.measurePaddingLeft };
    let currentX = CONFIG.measurePaddingLeft;
    
    // 2. Iterate Segments
    for (let i = 0; i < sortedPoints.length - 1; i++) {
        const startQuant = sortedPoints[i];
        const endQuant = sortedPoints[i + 1];
        const segmentDuration = endQuant - startQuant;
        
        // Base width based on duration
        let segmentWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(segmentDuration);
        let maxExtraPadding = 0;

        // Check all measures for events starting at this quant
        for (const measure of measures) {
            // Fast find: we track q manually to avoid .find() complexity
            let q = 0;
            for (const e of measure.events) {
                if (q === startQuant) {
                    // A. Minimum Width Check
                    const minFactor = MIN_WIDTH_FACTORS[e.duration] || 0;
                    if (minFactor > 0) {
                        segmentWidth = Math.max(segmentWidth, minFactor * NOTE_SPACING_BASE_UNIT);
                    }
                    
                    // B. Accidental Padding
                    const hasAccidental = e.notes.some((n: Note) => n.accidental);
                    if (hasAccidental) {
                        maxExtraPadding = Math.max(maxExtraPadding, ACCIDENTAL_PADDING);
                    }
                    
                    // C. Second interval spacing
                    const chordLayout = calculateChordLayout(e.notes, 'treble');
                    const hasSecond = Object.values(chordLayout.noteOffsets).some(v => v !== 0);
                    if (hasSecond) {
                        maxExtraPadding = Math.max(maxExtraPadding, 6);
                        // Extra space if seconds have accidentals
                        if (hasAccidental) {
                            maxExtraPadding = Math.max(maxExtraPadding, 6 + ACCIDENTAL_PADDING * 0.5);
                        }
                    }
                    
                    // D. Dots
                    if (e.dotted) {
                        maxExtraPadding = Math.max(maxExtraPadding, NOTE_SPACING_BASE_UNIT * 0.5);
                    }
                    break; // Found the event for this measure at this quant
                }
                
                q += getNoteDuration(e.duration, e.dotted, e.tuplet);
                if (q > startQuant) break; // Optimization: Stop if we passed the quant
            }
        }
        
        currentX += (segmentWidth + maxExtraPadding);
        quantToX[endQuant] = currentX;
    }
    
    return quantToX;
};

// --- PLACEMENT CALCULATOR ---

/**
 * Analyzes where a new note should be placed based on intended quant position.
 * Determines whether to chord with existing note, insert before, or append after.
 * Uses a "magnet" threshold for snapping to existing event positions.
 * @param events - List of events in the measure
 * @param intendedQuant - The intended placement position in quants
 * @returns Object with mode ('CHORD', 'INSERT', or 'APPEND'), index, and visualQuant
 */
export const analyzePlacement = (events: ScoreEvent[], intendedQuant: number) => {
    const MAGNET_THRESHOLD = 3; 
    let currentQuant = 0;
    
    for (const [i, event] of events.entries()) {
        const eventDur = getNoteDuration(event.duration, event.dotted, event.tuplet);
        
        // Case 1: Chord Magnet (Start of event)
        if (Math.abs(intendedQuant - currentQuant) <= MAGNET_THRESHOLD) {
            return { mode: 'CHORD', index: i, visualQuant: currentQuant };
        }

        // Case 2: Insert (Within current event duration)
        if (intendedQuant < currentQuant + eventDur) {
            return { mode: 'INSERT', index: i, quant: currentQuant, visualQuant: intendedQuant };
        }
        
        currentQuant += eventDur;
    }

    // Case 3: Append
    return { mode: 'APPEND', index: events.length, visualQuant: currentQuant };
};

/**
 * Post-processes the events to apply special centering rules.
 * Currently handles: Centering a single whole rest (placeholder) in the exact middle of the measure.
 * 
 * @param events - The list of processed events
 * @param measureWidth - The total width of the measure (between barlines)
 * @returns The updated list of events
 */
export const applyMeasureCentering = (events: ScoreEvent[], measureWidth: number): ScoreEvent[] => {
    // Check if we need to center a whole rest (placeholder)
    if (events.length === 1 && events[0].id === 'rest-placeholder') {
        const rest = events[0];
        
        // Target: Geometric center of the measure box (equidistant from barlines)
        const targetVisualCenter = measureWidth / 2;
        
        // Calculate the X-coordinate for the LEFT edge of the rest glyph
        // This bypasses standard note positioning offsets in ChordGroup (logic: if x > 0, use x as left edge)
        const x = targetVisualCenter - (WHOLE_REST_WIDTH / 2);

        return [{
            ...rest,
            x: x
        }];
    }
    
    return events;
};
