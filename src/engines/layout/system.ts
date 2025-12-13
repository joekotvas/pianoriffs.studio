/**
 * System Layout Engine
 * 
 * Handles multi-staff synchronization for vertically aligned measures.
 * Ensures that events at the same rhythmic position align across staves.
 */

import { CONFIG } from '@/config';
import { getNoteDuration } from '@/utils/core';
import { NOTE_SPACING_BASE_UNIT, LAYOUT } from '@/constants';
import { ScoreEvent, Note } from './types';
import { calculateChordLayout } from './positioning';

// --- CONSTANTS ---

/** Padding added before noteheads when accidentals are present */
const ACCIDENTAL_PADDING = NOTE_SPACING_BASE_UNIT * 0.8;

/** Minimum width factors for short-duration notes */
const MIN_WIDTH_FACTORS = LAYOUT.MIN_WIDTH_FACTORS;

// --- HELPERS ---

/**
 * Collects all unique time boundaries (quants) across all measures.
 * Used to create a grid of synchronized positions for multi-staff alignment.
 * 
 * @param measures - Array of measure objects, each containing events
 * @returns Sorted array of quant positions where events start or end
 */
const getSystemTimePoints = (measures: { events: ScoreEvent[] }[]): number[] => {
    const points = new Set<number>([0]);
    
    measures.forEach(measure => {
        let q = 0;
        measure.events.forEach(event => {
            points.add(q); // Start of event
            q += getNoteDuration(event.duration, event.dotted, event.tuplet);
            points.add(q); // End of event
        });
    });
    
    return Array.from(points).sort((a, b) => a - b);
};

/**
 * Finds the event that starts at a specific quant position.
 * Uses linear search with early termination for efficiency.
 * 
 * @param events - List of events in the measure
 * @param targetQuant - The quant position to search for
 * @returns The event starting at that quant, or null if none found
 */
const findEventAtQuant = (events: ScoreEvent[], targetQuant: number): ScoreEvent | null => {
    let q = 0;
    for (const event of events) {
        if (q === targetQuant) return event;
        q += getNoteDuration(event.duration, event.dotted, event.tuplet);
        if (q > targetQuant) return null; // Passed target, no match
    }
    return null;
};

/**
 * Calculates extra padding required for an event based on its visual properties.
 * Considers accidentals, second intervals (close note pairs), and dots.
 * 
 * @param event - The score event to analyze
 * @returns Additional padding in pixels needed before the next event
 */
const calculateEventPadding = (event: ScoreEvent): number => {
    let padding = 0;
    
    const hasAccidental = event.notes.some((n: Note) => n.accidental);
    if (hasAccidental) {
        padding = Math.max(padding, ACCIDENTAL_PADDING);
    }
    
    const chordLayout = calculateChordLayout(event.notes, 'treble');
    const hasSecond = Object.values(chordLayout.noteOffsets).some(v => v !== 0);
    if (hasSecond) {
        padding = Math.max(padding, LAYOUT.SECOND_INTERVAL_SPACE);
        if (hasAccidental) {
            padding = Math.max(padding, LAYOUT.SECOND_INTERVAL_SPACE + ACCIDENTAL_PADDING * 0.5);
        }
    }
    
    if (event.dotted) {
        padding = Math.max(padding, NOTE_SPACING_BASE_UNIT * 0.5);
    }
    
    return padding;
};

/**
 * Calculates the width required for a specific time segment.
 * Checks all measures at this quant to find the maximum width needed
 * for proper vertical alignment across staves.
 * 
 * @param startQuant - Start of the time segment
 * @param endQuant - End of the time segment  
 * @param measures - All measures being synchronized
 * @returns Required width in pixels for this segment
 */
const getSegmentWidthRequirement = (
    startQuant: number,
    endQuant: number,
    measures: { events: ScoreEvent[] }[]
): number => {
    const segmentDuration = endQuant - startQuant;
    let maxSegmentWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(segmentDuration);
    let maxExtraPadding = 0;

    measures.forEach(measure => {
        const event = findEventAtQuant(measure.events, startQuant);
        if (!event) return;

        // Check minimum width for short notes
        const minFactor = MIN_WIDTH_FACTORS[event.duration] || 0;
        if (minFactor > 0) {
            maxSegmentWidth = Math.max(maxSegmentWidth, minFactor * NOTE_SPACING_BASE_UNIT);
        }

        // Calculate padding requirements
        const padding = calculateEventPadding(event);
        maxExtraPadding = Math.max(maxExtraPadding, padding);
    });

    return maxSegmentWidth + maxExtraPadding;
};

// --- MAIN EXPORT ---

/**
 * Calculates a unified layout for a system (group of measures vertically aligned).
 * 
 * Process:
 * 1. Collect all unique time points across all measures
 * 2. For each time segment, calculate the maximum required width
 * 3. Build a mapping from quant position to X coordinate
 * 
 * @param measures - Array of measures at the same index across all staves
 * @returns Map of Quant -> X Position for synchronized positioning
 */
export const calculateSystemLayout = (measures: { events: ScoreEvent[] }[]): Record<number, number> => {
    const timePoints = getSystemTimePoints(measures);
    const quantToX: Record<number, number> = { [timePoints[0]]: CONFIG.measurePaddingLeft };
    
    let currentX = CONFIG.measurePaddingLeft;

    for (let i = 0; i < timePoints.length - 1; i++) {
        const startQuant = timePoints[i];
        const endQuant = timePoints[i + 1];
        
        const segmentWidth = getSegmentWidthRequirement(startQuant, endQuant, measures);
        
        currentX += segmentWidth;
        quantToX[endQuant] = currentX;
    }

    return quantToX;
};
