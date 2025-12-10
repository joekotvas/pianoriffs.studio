/**
 * VexFlow Rendering Engine (Prototype)
 * 
 * Experimental integration of VexFlow for music notation rendering.
 * This engine translates our Score data model to VexFlow objects
 * and extracts computed positions for hit detection overlay.
 */

import { 
    Renderer, 
    Stave, 
    StaveNote, 
    Voice, 
    Formatter, 
    Beam, 
    Tuplet, 
    Accidental 
} from 'vexflow';
import type { Score, Staff, Measure as MeasureData, ScoreEvent, Note } from '../types';
import { CONFIG } from '../config';

// --- TYPES ---

export interface VexFlowRenderResult {
    /** Total width of rendered content */
    width: number;
    /** Total height of rendered content */
    height: number;
    /** Extracted positions for hit detection */
    notePositions: NotePosition[];
    /** Measure boundaries for layout */
    measureBoundaries: MeasureBoundary[];
}

export interface NotePosition {
    eventId: string;
    noteId: string;
    x: number;
    y: number;
    width: number;
    measureIndex: number;
    pitch: string;
}

export interface MeasureBoundary {
    measureIndex: number;
    startX: number;
    endX: number;
    width: number;
}

// --- PITCH CONVERSION ---

/**
 * Converts our pitch format (e.g., "C4", "F#5", "Bb3") to VexFlow format (e.g., "c/4", "f#/5", "bb/3")
 */
const toVexFlowPitch = (pitch: string | null | undefined): string => {
    // Guard against null/undefined pitch
    if (!pitch) return 'c/4';

    // Match note name (with optional accidental) and octave
    const match = pitch.match(/^([A-Ga-g])([#b]?)(\d)$/);
    if (!match) {
        console.warn(`Invalid pitch format: ${pitch}, defaulting to c/4`);
        return 'c/4';
    }
    const [, note, accidental, octave] = match;
    return `${note.toLowerCase()}${accidental}/${octave}`;
};

/**
 * Converts our duration format to VexFlow duration
 */
const toVexFlowDuration = (duration: string, dotted: boolean = false): string => {
    const durationMap: Record<string, string> = {
        'whole': 'w',
        'half': 'h',
        'quarter': 'q',
        'eighth': '8',
        'sixteenth': '16',
        '32nd': '32'
    };
    const vfDuration = durationMap[duration] || 'q';
    return dotted ? `${vfDuration}d` : vfDuration;
};

// --- MAIN RENDER FUNCTION ---

/**
 * Renders a Score using VexFlow and returns position data for hit detection.
 * 
 * @param container - DOM element to render into
 * @param score - Our Score data model
 * @param options - Rendering options
 */
export const renderWithVexFlow = (
    container: HTMLDivElement,
    score: Score,
    options: {
        width?: number;
        scale?: number;
    } = {}
): VexFlowRenderResult => {
    const { width = 800, scale = 1 } = options;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create renderer
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    const calculatedHeight = score.staves.length * CONFIG.staffSpacing + 100;
    renderer.resize(width * scale, calculatedHeight * scale);
    
    const context = renderer.getContext();
    context.scale(scale, scale);
    
    const notePositions: NotePosition[] = [];
    const measureBoundaries: MeasureBoundary[] = [];
    
    // Render each staff
    score.staves.forEach((staff, staffIndex) => {
        const staffY = CONFIG.baseY + staffIndex * CONFIG.staffSpacing;
        let currentX = 10; // Starting X position
        
        // Render each measure
        staff.measures.forEach((measure, measureIndex) => {
            const measureWidth = calculateMeasureWidth(measure);
            const measureStartX = currentX;
            
            // Create VexFlow Stave
            const stave = new Stave(currentX, staffY, measureWidth);
            
            // Add clef and key/time signature on first measure
            if (measureIndex === 0) {
                stave.addClef(staff.clef || 'treble');
                stave.addKeySignature(mapKeySignature(staff.keySignature || 'C'));
                stave.addTimeSignature(score.timeSignature || '4/4');
            }
            
            stave.setContext(context).draw();
            
            // Create notes for this measure
            const { staveNotes, beamGroups, tupletGroups } = createMeasureNotes(
                measure, 
                staff.clef || 'treble',
                measureIndex,
                notePositions
            );
            
            if (staveNotes.length > 0) {
                // Create voice and add notes
                const voice = new Voice({ 
                    num_beats: parseInt(score.timeSignature?.split('/')[0] || '4'),
                    beat_value: parseInt(score.timeSignature?.split('/')[1] || '4')
                }).setStrict(false);
                
                voice.addTickables(staveNotes);
                
                // Format and justify the notes
                new Formatter().joinVoices([voice]).format([voice], measureWidth - 50);
                
                // Draw voice
                voice.draw(context, stave);
                
                // Draw beams
                beamGroups.forEach(beam => beam.setContext(context).draw());
                
                // Draw tuplets
                tupletGroups.forEach(tuplet => tuplet.setContext(context).draw());
                
                // Extract positions after formatting
                extractNotePositions(staveNotes, measureIndex, notePositions);
            }
            
            // Record measure boundary
            measureBoundaries.push({
                measureIndex,
                startX: measureStartX,
                endX: currentX + measureWidth,
                width: measureWidth
            });
            
            currentX += measureWidth;
        });
    });
    
    return {
        width: width * scale,
        height: calculatedHeight * scale,
        notePositions,
        measureBoundaries
    };
};

// --- HELPER FUNCTIONS ---

/**
 * Calculate measure width based on note content
 */
const calculateMeasureWidth = (measure: MeasureData): number => {
    const baseWidth = 200;
    const noteCount = measure.events.length;
    // Wider measures for more notes
    return Math.max(baseWidth, noteCount * 50 + 80);
};

/**
 * Map our key signature format to VexFlow format
 */
const mapKeySignature = (keySig: string): string => {
    // VexFlow uses format like 'C', 'G', 'D', 'F', etc.
    // Our format might be 'C Major', 'G Major', etc.
    const keyMap: Record<string, string> = {
        'C': 'C', 'C Major': 'C',
        'G': 'G', 'G Major': 'G',
        'D': 'D', 'D Major': 'D',
        'A': 'A', 'A Major': 'A',
        'E': 'E', 'E Major': 'E',
        'B': 'B', 'B Major': 'B',
        'F#': 'F#', 'F# Major': 'F#',
        'F': 'F', 'F Major': 'F',
        'Bb': 'Bb', 'Bb Major': 'Bb',
        'Eb': 'Eb', 'Eb Major': 'Eb',
        'Ab': 'Ab', 'Ab Major': 'Ab',
        'Db': 'Db', 'Db Major': 'Db',
        'Gb': 'Gb', 'Gb Major': 'Gb'
    };
    return keyMap[keySig] || 'C';
};

/**
 * Create VexFlow StaveNotes from our measure events
 */
const createMeasureNotes = (
    measure: MeasureData,
    clef: string,
    measureIndex: number,
    notePositions: NotePosition[]
): {
    staveNotes: InstanceType<typeof StaveNote>[];
    beamGroups: InstanceType<typeof Beam>[];
    tupletGroups: InstanceType<typeof Tuplet>[];
} => {
    const staveNotes: InstanceType<typeof StaveNote>[] = [];
    const beamGroups: InstanceType<typeof Beam>[] = [];
    const tupletGroups: InstanceType<typeof Tuplet>[] = [];
    
    // Track notes for beaming
    let currentBeamNotes: InstanceType<typeof StaveNote>[] = [];
    
    measure.events.forEach((event, eventIndex) => {
        if (event.isRest) {
            // Create rest
            const rest = new StaveNote({
                keys: ['b/4'], // Rest position
                duration: `${toVexFlowDuration(event.duration, event.dotted)}r`,
                clef
            });
            staveNotes.push(rest);
            
            // End any ongoing beam
            if (currentBeamNotes.length >= 2) {
                beamGroups.push(new Beam(currentBeamNotes));
            }
            currentBeamNotes = [];
        } else {
            // Create note from event
            const keys = event.notes.map((note: Note) => toVexFlowPitch(note.pitch));
            const vfDuration = toVexFlowDuration(event.duration, event.dotted);
            
            try {
                const staveNote = new StaveNote({
                    keys,
                    duration: vfDuration,
                    clef,
                    auto_stem: true
                });
                
                // Add accidentals for notes that have them
                event.notes.forEach((note: Note, noteIndex: number) => {
                    if (note.accidental) {
                        const accMap: Record<string, string> = {
                            'sharp': '#',
                            'flat': 'b',
                            'natural': 'n'
                        };
                        const acc = accMap[note.accidental];
                        if (acc) {
                            staveNote.addModifier(new Accidental(acc), noteIndex);
                        }
                    }
                });
                
                // Add dot if dotted
                if (event.dotted) {
                    staveNote.addDotToAll();
                }
                
                staveNotes.push(staveNote);
                
                // Collect notes for beaming (eighths and smaller)
                if (['eighth', 'sixteenth', '32nd'].includes(event.duration)) {
                    currentBeamNotes.push(staveNote);
                } else {
                    // End beam on longer notes
                    if (currentBeamNotes.length >= 2) {
                        beamGroups.push(new Beam(currentBeamNotes));
                    }
                    currentBeamNotes = [];
                }
            } catch (e) {
                console.warn('Failed to create StaveNote:', e, event);
            }
        }
    });
    
    // Finish any remaining beam
    if (currentBeamNotes.length >= 2) {
        beamGroups.push(new Beam(currentBeamNotes));
    }
    
    return { staveNotes, beamGroups, tupletGroups };
};

/**
 * Extract note positions after VexFlow formatting
 */
const extractNotePositions = (
    staveNotes: InstanceType<typeof StaveNote>[],
    measureIndex: number,
    notePositions: NotePosition[]
): void => {
    staveNotes.forEach((staveNote, index) => {
        try {
            const x = staveNote.getAbsoluteX();
            const ys = staveNote.getYs(); // Y positions for each note in chord
            const width = staveNote.getWidth();
            const keys = staveNote.getKeys();
            
            keys.forEach((key, keyIndex) => {
                notePositions.push({
                    eventId: `vf-${measureIndex}-${index}`,
                    noteId: `vf-${measureIndex}-${index}-${keyIndex}`,
                    x,
                    y: ys[keyIndex] || ys[0],
                    width,
                    measureIndex,
                    pitch: key
                });
            });
        } catch (e) {
            // Position extraction may fail before draw
            console.debug('Position extraction skipped for note', index);
        }
    });
};

// --- QUICK TEST FUNCTION ---

/**
 * Quick test to verify VexFlow is working
 */
export const testVexFlow = (container: HTMLDivElement): boolean => {
    try {
        container.innerHTML = '';
        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(400, 150);
        const context = renderer.getContext();
        
        const stave = new Stave(10, 40, 380);
        stave.addClef('treble').addTimeSignature('4/4');
        stave.setContext(context).draw();
        
        const notes = [
            new StaveNote({ keys: ['c/4'], duration: 'q' }),
            new StaveNote({ keys: ['d/4'], duration: 'q' }),
            new StaveNote({ keys: ['e/4'], duration: 'q' }),
            new StaveNote({ keys: ['f/4'], duration: 'q' })
        ];
        
        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(notes);
        new Formatter().joinVoices([voice]).format([voice], 350);
        voice.draw(context, stave);
        
        console.log('✅ VexFlow test passed!');
        return true;
    } catch (e) {
        console.error('❌ VexFlow test failed:', e);
        return false;
    }
};
