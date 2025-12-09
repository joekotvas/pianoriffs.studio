import { 
    calculateMeasureLayout, 
    calculateMeasureWidth, 
    analyzePlacement 
} from '../engines/layout/measure';
import { calculateSystemLayout } from '../engines/layout/system';
import { calculateChordLayout, calculateBeamingGroups } from '../engines/layout';
import { Note, ScoreEvent } from '../engines/layout/types';
import { CONFIG } from '../config';
import { NOTE_SPACING_BASE_UNIT } from '../constants';

// --- TEST HELPERS ---

const createNote = (id: string, pitch: string, accidental?: 'sharp' | 'flat' | 'natural'): Note => ({
    id,
    pitch,
    ...(accidental && { accidental })
});

const createEvent = (
    id: string, 
    duration: string, 
    notes: Note[], 
    options: { dotted?: boolean; isRest?: boolean; tuplet?: any } = {}
): ScoreEvent => ({
    id,
    duration,
    notes,
    dotted: options.dotted ?? false,
    isRest: options.isRest ?? false,
    ...(options.tuplet && { tuplet: options.tuplet })
});

// --- TEST SUITES ---

describe('measure.ts', () => {
    
    // ========================================
    // calculateMeasureLayout
    // ========================================
    
    describe('calculateMeasureLayout', () => {
        
        describe('Empty Measure', () => {
            test('should create placeholder rest for empty measure', () => {
                const layout = calculateMeasureLayout([]);
                
                expect(layout.processedEvents).toHaveLength(1);
                expect(layout.processedEvents[0].isRest).toBe(true);
                expect(layout.processedEvents[0].id).toBe('rest-placeholder');
                expect(layout.processedEvents[0].duration).toBe('whole');
            });

            test('should set minimum width for empty measure', () => {
                const layout = calculateMeasureLayout([]);
                
                expect(layout.totalWidth).toBeGreaterThan(0);
                expect(layout.totalWidth).toBeGreaterThanOrEqual(CONFIG.measurePaddingLeft);
            });

            test('should create APPEND hit zone for empty measure', () => {
                const layout = calculateMeasureLayout([]);
                
                expect(layout.hitZones).toHaveLength(1);
                expect(layout.hitZones[0].type).toBe('APPEND');
            });
        });

        describe('Single Event', () => {
            test('should position single event correctly', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const layout = calculateMeasureLayout(events);

                expect(layout.eventPositions['e1']).toBeDefined();
                expect(layout.eventPositions['e1']).toBeGreaterThanOrEqual(CONFIG.measurePaddingLeft);
            });

            test('should generate correct hit zones for single event', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const layout = calculateMeasureLayout(events);

                const types = layout.hitZones.map(z => z.type);
                expect(types).toContain('INSERT');
                expect(types).toContain('EVENT');
                expect(types).toContain('APPEND');
            });

            test('should include chordLayout in processed events', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const layout = calculateMeasureLayout(events);

                expect(layout.processedEvents[0].chordLayout).toBeDefined();
                expect(layout.processedEvents[0].chordLayout!.direction).toBeDefined();
            });
        });

        describe('Multiple Events', () => {
            test('should position events sequentially', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')]),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')])
                ];
                const layout = calculateMeasureLayout(events);

                expect(layout.eventPositions['e2']).toBeGreaterThan(layout.eventPositions['e1']);
                expect(layout.eventPositions['e3']).toBeGreaterThan(layout.eventPositions['e2']);
            });

            test('should increase width with more events', () => {
                // Use many events to exceed minimum width
                const twoEvents = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')])
                ];
                const fourEvents = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')]),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')]),
                    createEvent('e4', 'quarter', [createNote('n4', 'F4')])
                ];

                const layout1 = calculateMeasureLayout(twoEvents);
                const layout2 = calculateMeasureLayout(fourEvents);

                // More events = wider measure
                expect(layout2.totalWidth).toBeGreaterThan(layout1.totalWidth);
            });
        });

        describe('Accidental Spacing', () => {
            test('should add padding for events with accidentals', () => {
                const withoutAccidental = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const withAccidental = [createEvent('e1', 'quarter', [createNote('n1', 'F#4', 'sharp')])];

                const layout1 = calculateMeasureLayout(withoutAccidental);
                const layout2 = calculateMeasureLayout(withAccidental);

                // Event with accidental should start further right (space for accidental)
                expect(layout2.eventPositions['e1']).toBeGreaterThan(layout1.eventPositions['e1']);
            });

            test('should add lookahead padding before accidentals', () => {
                // Use many events to ensure we exceed minimum width
                const withoutFollowingAccidental = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')]),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')]),
                    createEvent('e4', 'quarter', [createNote('n4', 'F4')])
                ];
                const withFollowingAccidental = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')]),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')]),
                    createEvent('e4', 'quarter', [createNote('n4', 'F#4', 'sharp')])
                ];

                const layout1 = calculateMeasureLayout(withoutFollowingAccidental);
                const layout2 = calculateMeasureLayout(withFollowingAccidental);

                // When an event has accidental, measure should be wider
                expect(layout2.totalWidth).toBeGreaterThan(layout1.totalWidth);
            });
        });

        describe('Chord Offset Spacing', () => {
            test('should add space for seconds (chord displacement)', () => {
                const singleNote = [createEvent('e1', 'quarter', [createNote('n1', 'F4')])];
                const second = [createEvent('e1', 'quarter', [
                    createNote('n1', 'F4'),
                    createNote('n2', 'G4')
                ])];

                const layout1 = calculateMeasureLayout(singleNote);
                const layout2 = calculateMeasureLayout(second);

                // Second interval needs more horizontal space
                expect(layout2.totalWidth).toBeGreaterThanOrEqual(layout1.totalWidth);
            });
        });

        describe('Dotted Notes', () => {
            test('should add space for dotted notes', () => {
                // Use multiple events to exceed minimum width
                const regular = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')]),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')])
                ];
                const dotted = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')], { dotted: true }),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')], { dotted: true }),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')], { dotted: true })
                ];

                const layout1 = calculateMeasureLayout(regular);
                const layout2 = calculateMeasureLayout(dotted);

                expect(layout2.totalWidth).toBeGreaterThan(layout1.totalWidth);
            });
        });

        describe('Short Duration Notes', () => {
            test('sixteenth notes should have minimum width', () => {
                const sixteenth = [createEvent('e1', 'sixteenth', [createNote('n1', 'C4')])];
                const layout = calculateMeasureLayout(sixteenth);

                const minExpectedWidth = NOTE_SPACING_BASE_UNIT * 1.8;
                expect(layout.totalWidth).toBeGreaterThanOrEqual(minExpectedWidth);
            });

            test('thirtysecond notes should have minimum width', () => {
                const thirtysecond = [createEvent('e1', 'thirtysecond', [createNote('n1', 'C4')])];
                const layout = calculateMeasureLayout(thirtysecond);

                const minExpectedWidth = NOTE_SPACING_BASE_UNIT * 1.5;
                expect(layout.totalWidth).toBeGreaterThanOrEqual(minExpectedWidth);
            });
        });

        describe('Pickup Measures', () => {
            test('should use quarter note as minimum width for pickup', () => {
                const layout1 = calculateMeasureLayout([], undefined, 'treble', false);
                const layout2 = calculateMeasureLayout([], undefined, 'treble', true);

                // Pickup measure should be narrower (quarter vs whole minimum)
                expect(layout2.totalWidth).toBeLessThanOrEqual(layout1.totalWidth);
            });
        });

        describe('Forced Event Positions (Sync)', () => {
            test('should use forced positions when provided', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const forcedPositions = { 0: 100 };

                const layout = calculateMeasureLayout(events, undefined, 'treble', false, forcedPositions);

                // Event should be at or near forced position
                expect(layout.eventPositions['e1']).toBeGreaterThanOrEqual(100);
            });
        });

        describe('Tuplets', () => {
            test('should process full tuplet group together', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 0 } }),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 1 } }),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 2 } })
                ];

                const layout = calculateMeasureLayout(events);

                expect(layout.processedEvents).toHaveLength(3);
                expect(layout.eventPositions['e1']).toBeDefined();
                expect(layout.eventPositions['e2']).toBeDefined();
                expect(layout.eventPositions['e3']).toBeDefined();
            });

            test('should space tuplet notes evenly', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 0 } }),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 1 } }),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 2 } })
                ];

                const layout = calculateMeasureLayout(events);

                const spacing1 = layout.eventPositions['e2'] - layout.eventPositions['e1'];
                const spacing2 = layout.eventPositions['e3'] - layout.eventPositions['e2'];

                expect(spacing1).toBeCloseTo(spacing2, 1);
            });

            test('should mix tuplet and regular events', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 0 } }),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 1 } }),
                    createEvent('e3', 'quarter', [createNote('n3', 'E4')], { tuplet: { ratio: [3, 2], groupSize: 3, position: 2 } }),
                    createEvent('e4', 'quarter', [createNote('n4', 'F4')])
                ];

                const layout = calculateMeasureLayout(events);

                expect(layout.processedEvents).toHaveLength(4);
                expect(layout.eventPositions['e4']).toBeGreaterThan(layout.eventPositions['e3']);
            });
        });

        describe('Hit Zone Continuity', () => {
            test('should not have overlapping hit zones', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')])
                ];

                const layout = calculateMeasureLayout(events);

                for (let i = 0; i < layout.hitZones.length - 1; i++) {
                    expect(layout.hitZones[i].endX).toBeLessThanOrEqual(layout.hitZones[i + 1].startX + 1);
                }
            });

            test('should have APPEND zone as last zone', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const layout = calculateMeasureLayout(events);

                const lastZone = layout.hitZones[layout.hitZones.length - 1];
                expect(lastZone.type).toBe('APPEND');
            });
        });
    });

    // ========================================
    // calculateMeasureWidth
    // ========================================

    describe('calculateMeasureWidth', () => {
        test('should return totalWidth from layout', () => {
            const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
            
            const layout = calculateMeasureLayout(events);
            const width = calculateMeasureWidth(events);

            expect(width).toBe(layout.totalWidth);
        });

        test('should handle pickup measures', () => {
            const width1 = calculateMeasureWidth([], false);
            const width2 = calculateMeasureWidth([], true);

            expect(width2).toBeLessThanOrEqual(width1);
        });
    });

    // ========================================
    // calculateSystemLayout
    // ========================================

    describe('calculateSystemLayout', () => {
        test('should return position at quant 0', () => {
            const measures = [{ events: [] }];
            const quantToX = calculateSystemLayout(measures);

            expect(quantToX[0]).toBe(CONFIG.measurePaddingLeft);
        });

        test('should align quants across multiple measures', () => {
            const measures = [
                { events: [createEvent('e1', 'quarter', [createNote('n1', 'C4')])] },
                { events: [createEvent('e2', 'quarter', [createNote('n2', 'D4')])] }
            ];

            const quantToX = calculateSystemLayout(measures);

            // Both quarter notes start at quant 0 and end at quant 16
            expect(quantToX[0]).toBeDefined();
            expect(quantToX[16]).toBeDefined();
            expect(quantToX[16]).toBeGreaterThan(quantToX[0]);
        });

        test('should handle different rhythms in same position', () => {
            const measures = [
                { events: [
                    createEvent('e1', 'eighth', [createNote('n1', 'C4')]),
                    createEvent('e2', 'eighth', [createNote('n2', 'D4')])
                ] },
                { events: [createEvent('e3', 'quarter', [createNote('n3', 'E4')])] }
            ];

            const quantToX = calculateSystemLayout(measures);

            // Should have positions for 0, 8, 16
            expect(quantToX[0]).toBeDefined();
            expect(quantToX[8]).toBeDefined();
            expect(quantToX[16]).toBeDefined();
        });

        test('should add extra padding for accidentals', () => {
            const withoutAccidentals = [
                { events: [createEvent('e1', 'quarter', [createNote('n1', 'C4')])] }
            ];
            const withAccidentals = [
                { events: [createEvent('e1', 'quarter', [createNote('n1', 'F#4', 'sharp')])] }
            ];

            const quantToX1 = calculateSystemLayout(withoutAccidentals);
            const quantToX2 = calculateSystemLayout(withAccidentals);

            // Accidental version should have more space
            expect(quantToX2[16]).toBeGreaterThan(quantToX1[16]);
        });

        test('should add extra padding for dotted notes', () => {
            const regular = [
                { events: [createEvent('e1', 'quarter', [createNote('n1', 'C4')])] }
            ];
            const dotted = [
                { events: [createEvent('e1', 'quarter', [createNote('n1', 'C4')], { dotted: true })] }
            ];

            const quantToX1 = calculateSystemLayout(regular);
            const quantToX2 = calculateSystemLayout(dotted);

            expect(quantToX2[24]).toBeGreaterThan(quantToX1[16]); // Dotted quarter = 24 quants
        });

        test('should enforce minimum width for short durations', () => {
            const measures = [
                { events: [createEvent('e1', 'sixteenth', [createNote('n1', 'C4')])] }
            ];

            const quantToX = calculateSystemLayout(measures);

            // Sixteenth = 4 quants
            const segmentWidth = quantToX[4] - quantToX[0];
            const minExpected = NOTE_SPACING_BASE_UNIT * 1.8;

            expect(segmentWidth).toBeGreaterThanOrEqual(minExpected);
        });
    });

    // ========================================
    // analyzePlacement
    // ========================================

    describe('analyzePlacement', () => {
        describe('CHORD Mode', () => {
            test('should return CHORD when quant matches event start', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const result = analyzePlacement(events, 0);

                expect(result.mode).toBe('CHORD');
                expect(result.index).toBe(0);
                expect(result.visualQuant).toBe(0);
            });

            test('should use magnet threshold for near matches', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const result = analyzePlacement(events, 2); // Within threshold of 3

                expect(result.mode).toBe('CHORD');
                expect(result.visualQuant).toBe(0);
            });

            test('should chord with second event', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]), // Ends at 16
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')])  // Starts at 16
                ];
                const result = analyzePlacement(events, 17); // Near 16

                expect(result.mode).toBe('CHORD');
                expect(result.index).toBe(1);
                expect(result.visualQuant).toBe(16);
            });
        });

        describe('INSERT Mode', () => {
            test('should return INSERT when quant is within event', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const result = analyzePlacement(events, 8); // Middle of quarter note

                expect(result.mode).toBe('INSERT');
                expect(result.index).toBe(0);
            });

            test('should insert before correct event', () => {
                const events = [
                    createEvent('e1', 'quarter', [createNote('n1', 'C4')]),
                    createEvent('e2', 'quarter', [createNote('n2', 'D4')])
                ];
                const result = analyzePlacement(events, 24); // Within second event

                expect(result.mode).toBe('INSERT');
                expect(result.index).toBe(1);
            });
        });

        describe('APPEND Mode', () => {
            test('should return APPEND for empty measure', () => {
                const result = analyzePlacement([], 0);

                expect(result.mode).toBe('APPEND');
                expect(result.index).toBe(0);
            });

            test('should return APPEND when quant is after all events', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                const result = analyzePlacement(events, 32); // After quarter note ends

                expect(result.mode).toBe('APPEND');
                expect(result.index).toBe(1);
                expect(result.visualQuant).toBe(16);
            });
        });

        describe('Edge Cases', () => {
            test('should handle single event at boundary', () => {
                const events = [createEvent('e1', 'quarter', [createNote('n1', 'C4')])];
                
                // Exactly at start
                expect(analyzePlacement(events, 0).mode).toBe('CHORD');
                
                // Exactly at end (becomes APPEND)
                expect(analyzePlacement(events, 16).mode).toBe('APPEND');
            });

            test('should handle many events', () => {
                const events = Array.from({ length: 16 }, (_, i) => 
                    createEvent(`e${i}`, 'sixteenth', [createNote(`n${i}`, 'C4')])
                );

                // Middle event
                const result = analyzePlacement(events, 32);
                expect(result.mode).toBe('CHORD');
                expect(result.index).toBe(8);
            });
        });
    });

    // ========================================
    // calculateChordLayout (from positioning.ts)
    // ========================================

    describe('calculateChordLayout', () => {
        test('should determine stem direction based on furthest note', () => {
            const highNote = [createNote('n1', 'C6')];
            const lowNote = [createNote('n2', 'C4')];

            expect(calculateChordLayout(highNote, 'treble').direction).toBe('down');
            expect(calculateChordLayout(lowNote, 'treble').direction).toBe('up');
        });

        test('should sort notes by Y position', () => {
            const notes = [createNote('n1', 'C4'), createNote('n2', 'C5')];
            const layout = calculateChordLayout(notes, 'treble');

            // C5 has lower Y offset (higher on staff)
            expect(layout.sortedNotes[0].pitch).toBe('C5');
            expect(layout.sortedNotes[1].pitch).toBe('C4');
        });

        test('should calculate offsets for seconds', () => {
            const notes = [createNote('n1', 'F4'), createNote('n2', 'G4')];
            const layout = calculateChordLayout(notes, 'treble');

            const hasOffset = Object.values(layout.noteOffsets).some(o => o !== 0);
            expect(hasOffset).toBe(true);
        });

        test('should respect forced direction', () => {
            const notes = [createNote('n1', 'C6')]; // Normally would be down

            const layoutUp = calculateChordLayout(notes, 'treble', 'up');
            const layoutDown = calculateChordLayout(notes, 'treble', 'down');

            expect(layoutUp.direction).toBe('up');
            expect(layoutDown.direction).toBe('down');
        });
    });
});
