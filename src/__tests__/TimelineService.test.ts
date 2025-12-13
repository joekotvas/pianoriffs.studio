import { createTimeline } from '@/services/TimelineService';

describe('TimelineService', () => {
    const mockScore = {
        title: 'Test Score',
        timeSignature: '4/4',
        keySignature: 'C',
        staves: [{
            measures: [
                {
                    id: 1,
                    events: [
                        { duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4', tied: false }] },
                        { duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4', tied: false }] },
                        { duration: 'quarter', dotted: false, notes: [{ id: 'n3', pitch: 'E4', tied: false }] },
                        { duration: 'quarter', dotted: false, notes: [{ id: 'n4', pitch: 'F4', tied: false }] }
                    ]
                }
            ]
        }]
    };

    test('calculates correct timings for quarter notes', () => {
        const bpm = 60; // 1 beat per second
        const timeline = createTimeline(mockScore, bpm);
        
        expect(timeline).toHaveLength(4);
        expect(timeline[0].time).toBeCloseTo(0);
        expect(timeline[0].duration).toBeCloseTo(1.0);
        
        expect(timeline[1].time).toBeCloseTo(1.0);
        expect(timeline[2].time).toBeCloseTo(2.0);
        expect(timeline[3].time).toBeCloseTo(3.0);
    });

    test('handles tied notes across events', () => {
        const tiedScore = {
            ...mockScore,
            staves: [{
                measures: [
                    {
                        id: 1,
                        events: [
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4', tied: true }] },
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'C4', tied: false }] }
                        ]
                    }
                ]
            }]
        };
        
        const bpm = 60;
        const timeline = createTimeline(tiedScore, bpm);
        
        // Should merge into 1 event of 2 seconds
        expect(timeline).toHaveLength(1);
        expect(timeline[0].duration).toBeCloseTo(2.0);
        expect(timeline[0].time).toBeCloseTo(0);
    });

    test('handles pickup measures', () => {
        const pickupScore = {
            ...mockScore,
            staves: [{
                measures: [
                    {
                        id: 1,
                        isPickup: true,
                        events: [
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4' }] }
                        ]
                    },
                    {
                        id: 2,
                        events: [
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'D4' }] }
                        ]
                    }
                ]
            }]
        };
        
        const bpm = 60;
        const timeline = createTimeline(pickupScore, bpm);
        
        expect(timeline).toHaveLength(2);
        // Signup measure: event at 0, dur 1.0 (assuming currentGlobalTime starts at 0 for playback)
        // Measure 2 starts at 1.0
        
        expect(timeline[0].time).toBeCloseTo(0);
        expect(timeline[1].time).toBeCloseTo(1.0);
    });
    
    test('handles Grand Staff synchronization', () => {
        const grandScore = {
            ...mockScore,
            staves: [
                {
                    measures: [{
                        id: 'm1',
                        events: [{ duration: 'half', notes: [{ id: 's1n1', pitch: 'C4' }] }]
                    }]
                },
                {
                    measures: [{
                        id: 'm1_bass',
                        events: [
                            { duration: 'quarter', notes: [{ id: 's2n1', pitch: 'C3' }] },
                            { duration: 'quarter', notes: [{ id: 's2n2', pitch: 'G3' }] }
                        ]
                    }]
                }
            ]
        };
        
        const bpm = 60;
        const timeline = createTimeline(grandScore, bpm);
        
        expect(timeline).toHaveLength(3);
        
        // Sorted by time:
        // 0.0: C4 (half, 2s) from staff 1
        // 0.0: C3 (quarter, 1s) from staff 2
        // 1.0: G3 (quarter, 1s) from staff 2
        
        const t0 = timeline.filter(t => t.time === 0);
        expect(t0).toHaveLength(2);
        
        const t1 = timeline.filter(t => t.time === 1.0);
        expect(t1).toHaveLength(1);
        expect(t1[0].frequency).toBeGreaterThan(0); // G3
    });


    test('handles cross-measure ties properly (adjacent)', () => {
        const adjacentScore = {
            ...mockScore,
            timeSignature: '2/4', // Measures are 2 beats long (32 quants)
            staves: [{
                measures: [
                    {
                        id: 1,
                        events: [
                            // Event 1: Quarter Note (0-1s)
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n_pad', pitch: 'G4', tied: false }] },
                            // Event 2: Quarter Note (1-2s). Ends at 2.0s. Tied.
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n1', pitch: 'C4', tied: true }] }
                        ]
                    },
                    {
                        id: 2,
                        events: [
                            // Event 3: Quarter Note (starts at 2.0s). Tied target.
                            { duration: 'quarter', dotted: false, notes: [{ id: 'n2', pitch: 'C4', tied: false }] }
                        ]
                    }
                ]
            }]
        };

        const bpm = 60;
        const timeline = createTimeline(adjacentScore, bpm);
        
        // Expected Timeline:
        // 1. G4 (0-1s)
        // 2. C4 (1-3s) [Merged Event 2 + Event 3]
        
        expect(timeline).toHaveLength(2);
        
        const g4 = timeline.find(e => e.frequency > 300 && e.frequency < 400); // G4 ~392
        expect(g4).toBeDefined();
        
        const c4 = timeline.find(e => e.frequency > 260 && e.frequency < 262); // C4 ~261.6
        expect(c4).toBeDefined();
        if (c4) {
            expect(c4.time).toBeCloseTo(1.0);
            expect(c4.duration).toBeCloseTo(2.0); // 1s (Meas 1) + 1s (Meas 2)
            expect(c4.quant).toBe(16); // Starts at 2nd beat of Measure 1
        }
    });

    test('populates quant correctly', () => {
        const bpm = 60;
        const timeline = createTimeline(mockScore, bpm);
        
        // mockScore is 4 quarters.
        // Q0: 0
        // Q1: 16 (1 beat = 16 quants)
        // Q2: 32
        // Q3: 48
         
        expect(timeline[0].quant).toBe(0);
        expect(timeline[1].quant).toBe(16);
        expect(timeline[2].quant).toBe(32);
        expect(timeline[3].quant).toBe(48);
    });
});
