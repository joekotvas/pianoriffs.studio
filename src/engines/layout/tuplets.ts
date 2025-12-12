import { ScoreEvent, TupletBracketGroup } from './types';
import { getNoteDuration } from '../../utils/core';
import { getOffsetForPitch } from './positioning';
import { CONFIG } from '../../config';
import { MIDDLE_LINE_Y, TUPLET, STEM } from '../../constants';

/**
 * Helper to determine the events belonging to a tuplet group starting at a given index.
 * Uses ID-based grouping (priority) or falls back to legacy logic.
 */
export const getTupletGroup = (events: ScoreEvent[], startIndex: number): ScoreEvent[] => {
    const startEvent = events[startIndex];
    if (!startEvent.tuplet) return [];

    const groupEvents: ScoreEvent[] = [];
    const { groupSize, ratio } = startEvent.tuplet;

    // Priority 1: ID-based grouping (Robust)
    if (startEvent.tuplet.id) {
        const targetId = startEvent.tuplet.id;
        for (let j = 0; (startIndex + j) < events.length; j++) {
            const e = events[startIndex + j];
            if (e.tuplet && e.tuplet.id === targetId) {
                groupEvents.push(e);
            } else {
                break; // Stop if ID mismatch or no tuplet
            }
        }
    } 
    // Priority 2: BaseDuration-based grouping (Dynamic)
    else if (startEvent.tuplet.baseDuration) {
        const { ratio, baseDuration } = startEvent.tuplet;
        const baseQuants = getNoteDuration(baseDuration, false);
        const targetQuants = ratio[0] * baseQuants;
        
        let currentQuants = 0;
        
        for (let j = 0; (startIndex + j) < events.length; j++) {
            const e = events[startIndex + j];
            const eventQuants = getNoteDuration(e.duration, e.dotted, undefined);
            currentQuants += eventQuants;
            groupEvents.push(e);
            
            if (currentQuants >= targetQuants) {
                break;
            }
        }
    } 
    // Priority 3: GroupSize-based grouping (Legacy)
    else {
        for (let j = 0; j < groupSize && (startIndex + j) < events.length; j++) {
            groupEvents.push(events[startIndex + j]);
        }
    }
    
    return groupEvents;
};

export const calculateTupletBrackets = (events: ScoreEvent[], eventPositions: Record<string, number>, clef: string = 'treble'): TupletBracketGroup[] => {
    const brackets: TupletBracketGroup[] = [];
    
    // Helper to get Y bounds of an event (top and bottom of everything: notes, stems)
    const getEventYBounds = (event: ScoreEvent, dir: 'up' | 'down') => {
        // 1. Noteheads - filter out rest notes (null pitch)
        const realNotes = event.notes.filter(n => n.pitch !== null);
        if (realNotes.length === 0) {
            // Rest event - use staff middle line as default
            const middleY = CONFIG.baseY + CONFIG.lineHeight * 2;
            return { topY: middleY, bottomY: middleY };
        }
        const noteYs = realNotes.map(n => CONFIG.baseY + getOffsetForPitch(n.pitch!, clef));
        const minNoteY = Math.min(...noteYs);
        const maxNoteY = Math.max(...noteYs);
        
        // 2. Stems
        // We need to know stem direction and length to know where the stem tip is.
        // We can approximate or re-calculate.
        // If we have chordLayout, use it.
        const chordDir = event.chordLayout?.direction || 'down'; // Default down?
        
        // Standard stem length from centralized config
        const stemLen = STEM.LENGTHS.default; 
        
        let topY = minNoteY;
        let bottomY = maxNoteY;
        
        if (chordDir === 'up') {
            // Stem goes up from highest note (minY)
            // Actually stem goes up from the note on the right?
            // For single stem, it goes up from the notehead.
            // Stem tip Y = minNoteY - stemLen
            topY = Math.min(topY, minNoteY - stemLen);
        } else {
            // Stem goes down from lowest note (maxY)
            // Stem tip Y = maxNoteY + stemLen
            bottomY = Math.max(bottomY, maxNoteY + stemLen);
        }
        
        return { topY, bottomY };
    };

    const processedIndices = new Set<number>();

    for (let i = 0; i < events.length; i++) {
        if (processedIndices.has(i)) continue;

        const event = events[i];
        if (event.tuplet && event.tuplet.position === 0) {
            const groupEvents = getTupletGroup(events, i);
            
            // Mark indices as processed to avoid duplicates if we iterate differently later
            // (Though here we just iterate linearly, but good practice)
            // Actually, calculateTupletBrackets iterates all events. 
            // We only care about position === 0.
            
            if (groupEvents.length === 0) continue;
            
            // 1. Determine Direction
            // Rule: Place on stem side.
            // If majority stems up -> Bracket Up (above).
            // If majority stems down -> Bracket Down (below).
            let upCount = 0;
            let downCount = 0;
            groupEvents.forEach(e => {
                if (e.chordLayout?.direction === 'up') upCount++;
                else downCount++;
            });
            
            const direction = upCount >= downCount ? 'up' : 'down';
            
            // 2. Calculate Slope and Position
            // We want to draw a line from start to end that clears all "obstacles" on that side.
            // Calculate slope based on first and last note
            // Note: startX/endX are centers of note heads.
            // We want the bracket to extend to the outer edges of the note heads.
            
            // Calculate bounds based on ALL events in the group to ensure we cover everything
            // (handles potential unsorted events or layout anomalies)
            const xValues = groupEvents.map(e => eventPositions[e.id] || 0);
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            
            // Increase radius slightly to ensure it visually covers the note head fully
            const startX = minX - TUPLET.VISUAL_NOTE_RADIUS;
            const endX = maxX + TUPLET.VISUAL_NOTE_RADIUS;
            
            // Calculate Y bounds (top and bottom of the group)
            const yBounds = groupEvents.map(e => getEventYBounds(e, direction));
            const topY = Math.min(...yBounds.map(b => b.topY));
            const bottomY = Math.max(...yBounds.map(b => b.bottomY));
            
            // Calculate "Limit Y" for each event on the bracket side
            // If Up: Limit is topY (lowest value). We want bracket Y < topY.
            // If Down: Limit is bottomY (highest value). We want bracket Y > bottomY.
            
            const limits = groupEvents.map(e => {
                const bounds = getEventYBounds(e, direction);
                return {
                    x: eventPositions[e.id],
                    y: direction === 'up' ? bounds.topY : bounds.bottomY
                };
            });
            
            // Initial guess: Line between first and last limit
            // Add some padding
            let y1 = limits[0].y + (direction === 'up' ? -TUPLET.PADDING : TUPLET.PADDING);
            let y2 = limits[limits.length - 1].y + (direction === 'up' ? -TUPLET.PADDING : TUPLET.PADDING);
            
            // Calculate slope m
            let m = (y2 - y1) / (endX - startX);
            
            // Limit slope (max angle from constant)
            if (Math.abs(m) > TUPLET.MAX_SLOPE) {
            m = m > 0 ? TUPLET.MAX_SLOPE : -TUPLET.MAX_SLOPE;
            // Recenter
            const midX = (startX + endX) / 2;
            const midY = (y1 + y2) / 2;
            y1 = midY - m * (midX - startX);
            y2 = midY + m * (endX - midX);
        }
        
        // 3. Collision Detection & Shift
        let maxShift = 0;
        
        limits.forEach(limit => {
            const targetY = y1 + m * (limit.x - startX);
            
            if (direction === 'up') {
                // We want targetY < limit.y (visually above)
                // If targetY > limit.y - PADDING, we are too low.
                // Shift needed: (limit.y - PADDING) - targetY
                // We want to subtract from Y (move up).
                // Let's define shift as positive = move AWAY (Up for up, Down for down)
                
                // Distance from limit to line (positive if line is below limit)
                const dist = targetY - (limit.y - TUPLET.PADDING);
                if (dist > 0) {
                    maxShift = Math.max(maxShift, dist);
                }
            } else {
                // We want targetY > limit.y (visually below)
                // If targetY < limit.y + PADDING, we are too high.
                // Shift needed: (limit.y + PADDING) - targetY
                
                const dist = (limit.y + TUPLET.PADDING) - targetY;
                if (dist > 0) {
                    maxShift = Math.max(maxShift, dist);
                }
            }
        });
        
        // Apply shift
        if (direction === 'up') {
            y1 -= maxShift;
            y2 -= maxShift;
        } else {
            y1 += maxShift;
            y2 += maxShift;
        }
        
        brackets.push({
            startX,
            endX,
            startY: y1,
            endY: y2,
            direction,
            number: event.tuplet.ratio[0]
        });
        }
    }
    
    return brackets;
};
