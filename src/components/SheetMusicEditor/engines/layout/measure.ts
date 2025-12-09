import { CONFIG } from '../../config';
import { getNoteDuration } from '../../utils/core';
import { MIDDLE_LINE_Y, NOTE_SPACING_BASE_UNIT } from '../../constants';
import { ScoreEvent, MeasureLayout, HitZone, Note } from './types';
import { getNoteWidth, calculateChordLayout, getOffsetForPitch } from './positioning';
import { getTupletGroup } from './tuplets';

// --- LAYOUT CALCULATOR ---
/**
 * Calculates the layout for a single measure, determining x-positions for events
 * and creating hit zones for user interaction.
 * All calculations use CONFIG.baseY - staff positioning is handled by SVG transforms.
 * @param events - List of events in the measure
 * @param totalQuants - Total quants in the measure (default: CONFIG.quantsPerMeasure)
 * @param clef - The current clef ('treble' or 'bass')
 * @param isPickup - Whether this is a pickup measure
 * @param forcedEventPositions - Optional map of Quant -> X Position for synchronization
 * @returns Object containing hitZones, eventPositions map, totalWidth, and processedEvents
 */
export const calculateMeasureLayout = (events: ScoreEvent[], totalQuants: number = CONFIG.quantsPerMeasure, clef: string = 'treble', isPickup: boolean = false, forcedEventPositions?: Record<number, number>): MeasureLayout => {
    const hitZones: HitZone[] = []; // { startX, endX, index, type, eventId }
    const eventPositions: Record<string, number> = {}; // Map<eventId, x>
    const processedEvents: ScoreEvent[] = [];
    
    let currentX = CONFIG.measurePaddingLeft;
    let currentQuant = 0;

    if (events.length === 0) {
        // Inject Default Whole Rest
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
        
        // Hit Zone covers the rest but acts as APPEND (click anywhere to add note)
        hitZones.push({
            startX: CONFIG.measurePaddingLeft,
            endX: currentX + width,
            index: 0,
            type: 'APPEND'
        });
        
        currentX += width;
    } else {
        // Add Initial Insert Zone (Before first note)
        hitZones.push({
            startX: 0,
            endX: CONFIG.measurePaddingLeft,
            index: 0,
            type: 'INSERT'
        });

        const processedIndices = new Set<number>();

        events.forEach((event, index) => {
            if (processedIndices.has(index)) return;

            // SYNC OVERRIDE: If we have forced positions, jump to the correct X for this quant
            if (forcedEventPositions && forcedEventPositions[currentQuant] !== undefined) {
                currentX = forcedEventPositions[currentQuant];
            }

            // Check if this is the start of a tuplet group
            const isTupletStart = event.tuplet && event.tuplet.position === 0;
            
            if (isTupletStart) {
                // Use robust grouping helper
                const tupletGroup = getTupletGroup(events, index);
                const { ratio } = event.tuplet!;
                
                // Calculate individual widths for each note in tuplet
                const tupletEventWidths: number[] = [];
                
                tupletGroup.forEach(tupletEvent => {
                    const noteWidth = getNoteWidth(tupletEvent.duration, tupletEvent.dotted);
                    const tupletAdjustedWidth = noteWidth * Math.sqrt(ratio[1] / ratio[0]);
                    tupletEventWidths.push(tupletAdjustedWidth);
                });
                
                // Calculate unified direction for the tuplet group
                let maxDist = -1;
                let unifiedDirection: 'up' | 'down' = 'down'; // Default

                tupletGroup.forEach(tupletEvent => {
                    tupletEvent.notes.forEach(n => {
                        const y = CONFIG.baseY + getOffsetForPitch(n.pitch, clef);
                        const dist = Math.abs(y - MIDDLE_LINE_Y);
                        if (dist > maxDist) {
                            maxDist = dist;
                            unifiedDirection = y <= MIDDLE_LINE_Y ? 'down' : 'up';
                        }
                    });
                });

                // Process all events in tuplet group
                tupletGroup.forEach((tupletEvent, i) => {
                    const evtIndex = events.indexOf(tupletEvent);
                    if (evtIndex !== -1) processedIndices.add(evtIndex);

                    const durationQuants = getNoteDuration(tupletEvent.duration, tupletEvent.dotted, tupletEvent.tuplet);
                    const noteWidth = tupletEventWidths[i];
                    
                    eventPositions[tupletEvent.id] = currentX;
                    
                    // Pass unified direction
                    const chordLayout = calculateChordLayout(tupletEvent.notes, clef, unifiedDirection);
                    
                    processedEvents.push({
                        ...tupletEvent,
                        x: currentX,
                        quant: currentQuant,
                        chordLayout
                    });
                    
                    // Create hit zones for tuplet events
                    const minOffset = Math.min(0, ...Object.values(chordLayout.noteOffsets));
                    const HIT_RADIUS = 24;
                    const adjustedStartX = Math.max(0, currentX - HIT_RADIUS + minOffset);
                    
                    if (hitZones.length > 0) {
                        const prevZone = hitZones[hitZones.length - 1];
                        prevZone.endX = Math.min(prevZone.endX, adjustedStartX);
                    }

                    const maxOffset = Math.max(0, ...Object.values(chordLayout.noteOffsets));
                    const adjustedEndX = currentX + HIT_RADIUS + maxOffset;

                    hitZones.push({
                        startX: adjustedStartX,
                        endX: adjustedEndX,
                        index: evtIndex, // Use original index
                        type: 'EVENT',
                        eventId: tupletEvent.id
                    });

                    if (noteWidth > (HIT_RADIUS * 2 + maxOffset)) {
                        hitZones.push({
                            startX: adjustedEndX,
                            endX: currentX + noteWidth,
                            index: evtIndex + 1,
                            type: 'INSERT'
                        });
                    }
                    
                    currentX += noteWidth;
                    currentQuant += durationQuants;
                });
                
            } else if (event.tuplet && event.tuplet.position > 0) {
                // Fallback: Process as regular event
                const width = getNoteWidth(event.duration, event.dotted);
                const durationQuants = getNoteDuration(event.duration, event.dotted, event.tuplet);

                eventPositions[event.id] = currentX;
                const chordLayout = calculateChordLayout(event.notes, clef);
                
                processedEvents.push({
                    ...event,
                    x: currentX,
                    quant: currentQuant,
                    chordLayout
                });
                
                const HIT_RADIUS = 24;
                hitZones.push({
                    startX: currentX,
                    endX: currentX + width,
                    index: index,
                    type: 'EVENT',
                    eventId: event.id
                });
                
                currentX += width;
                currentQuant += durationQuants;
                
            } else {
                // Regular event (not part of tuplet)
                const baseWidth = getNoteWidth(event.duration, event.dotted);
                const durationQuants = getNoteDuration(event.duration, event.dotted, event.tuplet);
                
                // Calculate Chord Layout first to determine offsets
                const chordLayout = calculateChordLayout(event.notes, clef);
                
                // Calculate accidental padding (space before notehead)
                const hasAccidental = event.notes.some((n: Note) => n.accidental);
                const accidentalPadding = hasAccidental ? (NOTE_SPACING_BASE_UNIT * 0.8) : 0;
                
                // Calculate total event width including accidentals and chord offsets
                const chordExtraWidth = Math.abs(chordLayout.maxNoteShift);
                const totalEventWidth = accidentalPadding + baseWidth + chordExtraWidth;
                
                // The visual event position (where the notehead starts, after accidental space)
                const noteheadX = currentX + accidentalPadding;
                eventPositions[event.id] = noteheadX;
                
                processedEvents.push({
                    ...event,
                    x: noteheadX,
                    quant: currentQuant,
                    chordLayout
                });
                
                // Zone 1: Chord Hit (On the note)
                const minOffset = Math.min(0, ...Object.values(chordLayout.noteOffsets));
                const HIT_RADIUS = 24; 
                const adjustedStartX = Math.max(0, noteheadX - HIT_RADIUS + minOffset);
                
                if (hitZones.length > 0) {
                    const prevZone = hitZones[hitZones.length - 1];
                    prevZone.endX = Math.min(prevZone.endX, adjustedStartX);
                }

                const maxOffset = Math.max(0, ...Object.values(chordLayout.noteOffsets));
                const adjustedEndX = noteheadX + HIT_RADIUS + maxOffset;

                hitZones.push({
                    startX: adjustedStartX,
                    endX: adjustedEndX,
                    index: index,
                    type: 'EVENT',
                    eventId: event.id
                });

                // Zone 2: Insert Hit (Space after note)
                const eventEndX = currentX + totalEventWidth;
                if (eventEndX > adjustedEndX) {
                    hitZones.push({
                        startX: adjustedEndX,
                        endX: eventEndX,
                        index: index + 1, 
                        type: 'INSERT'
                    });
                }
                
                // Advance cursor by total event width
                currentX += totalEventWidth;
                currentQuant += durationQuants;

                // Add extra padding if NEXT event has accidentals (lookahead for dense passages)
                const nextEvent = events[index + 1];
                if (nextEvent && nextEvent.notes.some((n: Note) => n.accidental)) {
                    // Extra breathing room for accidentals on following note
                    currentX += NOTE_SPACING_BASE_UNIT * 0.3;
                }
            }
        });
    }
    
    // Append Zone (Remaining space)
    hitZones.push({
        startX: currentX,
        endX: currentX + 2000, 
        index: events.length,
        type: 'APPEND'
    });
    
    // Ensure minimum width
    const minDuration = isPickup ? 'quarter' : 'whole';
    const minWidth = getNoteWidth(minDuration, false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
    const finalWidth = Math.max(currentX + CONFIG.measurePaddingRight, minWidth);

    return {
        hitZones,
        eventPositions,
        totalWidth: finalWidth,
        processedEvents
    };
};

/**
 * Calculates the total visual width of a measure based on its events.
 * @param events - List of events in the measure
 * @returns Total width in pixels
 */
export const calculateMeasureWidth = (events: ScoreEvent[], isPickup: boolean = false): number => {
    const layout = calculateMeasureLayout(events, undefined, 'treble', isPickup);
    return layout.totalWidth;
};

// --- SYSTEM LAYOUT SYNCHRONIZATION ---

/**
 * Calculates a unified layout for a system (group of measures vertically aligned).
 * Ensures that vertical alignment is maintained across staves by considering the rhythm of all staves.
 * @param measures - Array of measures at the same index across all staves
 * @returns Map of Quant -> X Position
 */
export const calculateSystemLayout = (measures: any[]): Record<number, number> => {
  // 1. Collect all unique time points (quants) where events start or end across all staves
  const timePoints = new Set<number>();
  timePoints.add(0);
  
  measures.forEach(measure => {
    let currentQuant = 0;
    measure.events.forEach((event: ScoreEvent) => {
      timePoints.add(currentQuant);
      const dur = getNoteDuration(event.duration, event.dotted, event.tuplet);
      currentQuant += dur;
      timePoints.add(currentQuant);
    });
  });
  
  const sortedPoints = Array.from(timePoints).sort((a, b) => a - b);
  
  // 2. Calculate X position for each time point
  const quantToX: Record<number, number> = {};
  let currentX = CONFIG.measurePaddingLeft;
  
  if (sortedPoints.length === 0) {
      quantToX[0] = currentX;
      return quantToX;
  }
  
  quantToX[sortedPoints[0]] = currentX;
  
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const startQuant = sortedPoints[i];
    const endQuant = sortedPoints[i+1];
    
    measures.forEach(measure => {
        let q = 0;
        let eventFound: ScoreEvent | null = null;
        for(const e of measure.events) {
            if (q === startQuant) {
                eventFound = e;
                break;
            }
            const dur = getNoteDuration(e.duration, e.dotted, e.tuplet);
            q += dur;
            if (q > startQuant) break; // Passed it
        }
        
    });

    // We calculate a base rhythmic width for this segment
    const segmentDuration = endQuant - startQuant;
    
    // Use minimum width factors for short durations
    const MIN_WIDTH_FACTORS: Record<string, number> = {
      'sixtyfourth': 1.2,
      'thirtysecond': 1.5,
      'sixteenth': 1.8,
      'eighth': 2.2,
    };
    
    let segmentWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(segmentDuration);

    // Now adding "Layout Padding" (accidentals, short notes, seconds)
    // We check if ANY event starting at startQuant needs extra space.
    let maxExtraPadding = 0;
    
    measures.forEach(measure => {
        let q = 0;
        for(const e of measure.events) {
            if (q === startQuant) {
                // Check minimum width for short durations
                const minFactor = MIN_WIDTH_FACTORS[e.duration] || 0;
                if (minFactor > 0) {
                    const minWidth = minFactor * NOTE_SPACING_BASE_UNIT;
                    if (minWidth > segmentWidth) {
                        segmentWidth = minWidth;
                    }
                }
                
                // Add accidental padding for ALL durations (not just 32nds)
                const hasAccidental = e.notes.some((n: Note) => n.accidental);
                if (hasAccidental) {
                    maxExtraPadding = Math.max(maxExtraPadding, NOTE_SPACING_BASE_UNIT * 0.8);
                }
                
                // Add padding for chord note displacement (seconds)
                const chordLayout = calculateChordLayout(e.notes, 'treble');
                if (chordLayout.maxNoteShift > 0) {
                    maxExtraPadding = Math.max(maxExtraPadding, chordLayout.maxNoteShift + (NOTE_SPACING_BASE_UNIT * 0.3));
                }
                
                // Add dot width if dotted
                if (e.dotted) {
                    maxExtraPadding = Math.max(maxExtraPadding, NOTE_SPACING_BASE_UNIT * 0.5);
                }
                
                break;
            }
            const dur = getNoteDuration(e.duration, e.dotted, e.tuplet);
            q += dur;
            if (q > startQuant) break;
        }
    });
    
    currentX += (segmentWidth + maxExtraPadding);
    quantToX[endQuant] = currentX;
  }
  
  return quantToX;
};

// --- PLACEMENT CALCULATOR (INDEX BASED) ---
export const analyzePlacement = (events: ScoreEvent[], intendedQuant: number, durationType: string, isDotted: boolean) => {
  const MAGNET_THRESHOLD = 3; 
  
  // Reconstruct timeline for analysis
  let currentQuant = 0;
  
  // Loop through events to find where intendedQuant lands
  for (let i = 0; i < events.length; i++) {
      const eventDur = getNoteDuration(events[i].duration, events[i].dotted, events[i].tuplet);
      const eventStart = currentQuant;
      const eventEnd = currentQuant + eventDur;

      // Case 1: Cursor is near the start of an event -> CHORD
      if (Math.abs(intendedQuant - eventStart) <= MAGNET_THRESHOLD) {
          return {
              mode: 'CHORD',
              index: i,
              visualQuant: eventStart
          };
      }

      // Case 2: Cursor is inside or before this event -> INSERT
      if (intendedQuant < eventEnd) {
          return {
              mode: 'INSERT',
              index: i, // Insert before this event
              quant: eventStart, 
              visualQuant: intendedQuant 
          };
      }
      
      currentQuant += eventDur;
  }

  // Case 3: Cursor is after all events -> APPEND
  return {
      mode: 'APPEND',
      index: events.length,
      visualQuant: currentQuant
  };
};
