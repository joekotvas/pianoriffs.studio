import { createTimeline } from '../services/TimelineService';

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
});
