import { ScoreEvent, BeamGroup } from './types';
import { getNoteDuration } from '../../utils/core';
import { getOffsetForPitch, getNoteWidth, getPitchForOffset, calculateChordLayout, getStemOffset } from './positioning';
import { CONFIG } from '../../config';
import { MIDDLE_LINE_Y, BEAMING } from '../../constants';

// Removed temporary interfaces


/**
 * Groups events into beaming groups based on musical rules (beats, syncopation).
 * All calculations use CONFIG.baseY - staff positioning is handled by SVG transforms.
 * @param events - List of events in the measure
 * @param eventPositions - Map of event IDs to their x-positions
 * @param clef - The clef for pitch offset lookup
 * @returns Array of beam group specifications
 */
export const calculateBeamingGroups = (events: any[], eventPositions: Record<string, number>, clef: string = 'treble'): any[] => {
    const groups: any[] = [];
    let currentGroup: any[] = [];
    let currentType: string | null = null;
    
    // Helper to finalize a group
    const finalizeGroup = () => {
        if (currentGroup.length > 1) {
            groups.push(processBeamGroup(currentGroup, eventPositions, clef));
        }
        currentGroup = [];
        currentType = null;
    };

    let currentQuant = 0;

    events.forEach((event: any, index: number) => {
        const type = event.duration;
        const isFlagged = ['eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth'].includes(type);
        const durationQuants = getNoteDuration(type, event.dotted, event.tuplet);
        
        // Break beam if:
        // 1. Not a flagged note
        // 2. Dotted note (simplify for now - standard beaming breaks on dots usually unless configured)
        // 3. Type changes (e.g. 8th to 16th - simple engines often break here, complex ones don't)
        // 4. Rest
        
        if (!isFlagged || event.isRest) {
            finalizeGroup();
            currentQuant += durationQuants;
            return;
        }

        if (currentType && currentType !== type) {
            finalizeGroup();
        }

        // Check beat boundaries (simple 4/4 assumption: beat every 1024 quants)
        // If currentQuant is a multiple of beat size, we might break?
        // Actually, we break if we CROSS a beat boundary.
        // But for Quarter beats (1024), we usually beam 8ths together within the beat.
        // We shouldn't beam across beat 2-3 in 4/4 usually.
        // Let's implement a simple rule: Break beam if on a beat boundary?
        // No, we start a new beam at the boundary.
        const BEAT_QUANTS = CONFIG.quantsPerMeasure / 4; // Assuming 4/4
        if (currentQuant % BEAT_QUANTS === 0 && currentGroup.length > 0) {
            finalizeGroup();
        }

        currentGroup.push(event);
        currentType = type;
        currentQuant += durationQuants;
    });

    finalizeGroup();
    return groups;
};

import { STEM_LENGTHS, STEM_BEAMED_LENGTHS } from './stems';

/**
 * Calculates the geometry for a single beam group.
 * Implements proper beam sloping based on pitch contour.
 */
const processBeamGroup = (groupEvents: any[], eventPositions: Record<string, number>, clef: string): any => {
    const startEvent = groupEvents[0];
    const endEvent = groupEvents[groupEvents.length - 1];
    
    // Determine minimum stem length based on the note type with the most beams in the group
    // 32nd notes need longer stems to accommodate 3 beams, 64th for 4 beams
    let minStemLength = STEM_BEAMED_LENGTHS.default;
    
    // Check if group contains shorter durations that require more beam space
    const uniqueDurations = new Set(groupEvents.map(e => e.duration));
    if (uniqueDurations.has('sixtyfourth')) {
        minStemLength = STEM_BEAMED_LENGTHS.sixtyfourth;
    } else if (uniqueDurations.has('thirtysecond')) {
        minStemLength = STEM_BEAMED_LENGTHS.thirtysecond;
    }
    
    // First pass: collect note data to determine direction
    const noteData = groupEvents.map(e => {
        const noteX = eventPositions[e.id];
        const noteYs = e.notes.map((n: any) => CONFIG.baseY + getOffsetForPitch(n.pitch, clef));
        
        // Check if this chord has a second interval
        const chordLayout = calculateChordLayout(e.notes, clef);
        const hasSecond = Object.values(chordLayout.noteOffsets).some(v => v !== 0);
        
        return {
            noteX,
            minY: Math.min(...noteYs),
            maxY: Math.max(...noteYs),
            avgY: noteYs.reduce((sum: number, y: number) => sum + y, 0) / noteYs.length,
            hasSecond
        };
    });
    
    // Determine stem direction based on average position relative to middle line
    const avgY = noteData.reduce((sum: number, d) => sum + d.avgY, 0) / noteData.length;
    const direction = avgY <= MIDDLE_LINE_Y ? 'down' : 'up';
    
    // Get chord layouts for first and last events
    const startChordLayout = calculateChordLayout(groupEvents[0].notes, clef);
    const endChordLayout = calculateChordLayout(groupEvents[groupEvents.length - 1].notes, clef);
    
    // Use shared getStemOffset function for consistent stem positioning
    const startStemOffset = getStemOffset(startChordLayout, direction);
    const endStemOffset = getStemOffset(endChordLayout, direction);
    
    // Apply stem offset to get actual stem X positions
    // Extend beam by BEAMING.EXTENSION_PX on each side for better visual appearance
    const startX = noteData[0].noteX + startStemOffset - BEAMING.EXTENSION_PX;
    const endX = noteData[noteData.length - 1].noteX + endStemOffset + BEAMING.EXTENSION_PX;
    
    // Update noteData with stem X positions for clearance calculations
    noteData.forEach((d, i) => {
        const layout = calculateChordLayout(groupEvents[i].notes, clef);
        (d as any).eventX = d.noteX + getStemOffset(layout, direction);
    });
    
    // Find the extreme notes (the ones that determine beam position)
    let highestNoteY = Infinity;  // Lowest Y value (highest on staff)
    let lowestNoteY = -Infinity;  // Highest Y value (lowest on staff)
    
    noteData.forEach(d => {
        highestNoteY = Math.min(highestNoteY, d.minY);
        lowestNoteY = Math.max(lowestNoteY, d.maxY);
    });
    
    // Calculate beam endpoints based on direction
    // For upward stems: beam connects above the highest (topmost) notes
    // For downward stems: beam connects below the lowest (bottommost) notes
    let startBeamY: number, endBeamY: number;
    
    if (direction === 'up') {
        // Beams above notes - use the highest note positions at start and end
        const startNoteY = noteData[0].minY;
        const endNoteY = noteData[noteData.length - 1].minY;
        
        startBeamY = startNoteY - minStemLength;
        endBeamY = endNoteY - minStemLength;
    } else {
        // Beams below notes - use the lowest note positions at start and end
        const startNoteY = noteData[0].maxY;
        const endNoteY = noteData[noteData.length - 1].maxY;
        
        startBeamY = startNoteY + minStemLength;
        endBeamY = endNoteY + minStemLength;
    }
    
    // Limit beam slope to maximum angle for readability
    const rawSlope = (endBeamY - startBeamY) / (endX - startX);
    
    if (Math.abs(rawSlope) > BEAMING.MAX_SLOPE) {
        // Clamp the slope and recalculate beam endpoints
        const clampedSlope = Math.sign(rawSlope) * BEAMING.MAX_SLOPE;
        const deltaX = endX - startX;
        const deltaY = clampedSlope * deltaX;
        
        // Adjust endBeamY to match the clamped slope
        endBeamY = startBeamY + deltaY;
    }
    
    // Now verify that ALL notes in the group have adequate stem length
    // Calculate beam line: y = mx + b
    const slope = (endBeamY - startBeamY) / (endX - startX);
    const intercept = startBeamY - slope * startX;
    
    // Find the maximum additional clearance needed
    let maxAdditionalClearance = 0;
    
    noteData.forEach(d => {
        const beamYAtPoint = slope * (d as any).eventX + intercept;
        const anchorNoteY = direction === 'up' ? d.minY : d.maxY;
        const currentStemLength = Math.abs(beamYAtPoint - anchorNoteY);
        
        if (currentStemLength < minStemLength) {
            const needed = minStemLength - currentStemLength;
            maxAdditionalClearance = Math.max(maxAdditionalClearance, needed);
        }
    });
    
    // Apply additional clearance if needed (shift beam away from notes)
    if (maxAdditionalClearance > 0) {
        if (direction === 'up') {
            startBeamY -= maxAdditionalClearance;
            endBeamY -= maxAdditionalClearance;
        } else {
            startBeamY += maxAdditionalClearance;
            endBeamY += maxAdditionalClearance;
        }
    }

    return {
        ids: groupEvents.map(e => e.id),
        startX,
        endX,
        startY: startBeamY,
        endY: endBeamY,
        direction,
        type: startEvent.duration
    };
};
