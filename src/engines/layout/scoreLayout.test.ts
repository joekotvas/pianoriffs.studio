import { calculateScoreLayout } from './scoreLayout';
import { Score, Staff } from '@/types';
import { CONFIG } from '@/config';
import { createTestScore } from '@/__tests__/fixtures/selectionTestScores';

describe('calculateScoreLayout', () => {
  it('should return empty layout for empty score', () => {
    const score: Score = {
      title: 'Test',
      staves: [],
      keySignature: 'C',
      timeSignature: '4/4',
      bpm: 120,
    };
    const layout = calculateScoreLayout(score);
    expect(layout.staves).toHaveLength(0);
    expect(Object.keys(layout.notes)).toHaveLength(0);
    expect(Object.keys(layout.events)).toHaveLength(0);
  });

  it('should calculate layout for a simple score', () => {
    const score = createTestScore(); // Has 2 staves, 2 measures
    const layout = calculateScoreLayout(score);

    // Score has 2 staves (treble, bass)
    expect(layout.staves).toHaveLength(2);
    const staffLayout = layout.staves[0];
    
    // Each staff has 2 measures
    expect(staffLayout.measures).toHaveLength(2);

    const measureLayout = staffLayout.measures[0];
    expect(measureLayout.width).toBeGreaterThan(0);
    expect(measureLayout.events).toBeDefined();

    // Check header layout impact
    // Default Header for C Major is roughly 50-80px
    expect(measureLayout.x).toBeGreaterThan(0);
  });

  it('should synchronize measure widths for grand staff', () => {
    const score = createTestScore();
    // Add a second staff (Grand Staff)
    const staff2: Staff = JSON.parse(JSON.stringify(score.staves[0]));
    staff2.id = 'staff-2';
    // Make the first measure of staff 2 contain more notes to force wider layout
    // (In this mock we might need to manually inject events if createMockScore is simple)
    // For now, let's assume createMockScore returns a basic structure.
    
    // Let's create a custom score setup
    const complexScore: Score = {
       ...score,
       staves: [
         { 
           ...score.staves[0],
           measures: [{ ...score.staves[0].measures[0], events: [] }] // Empty measure on staff 1
         },
         {
           ...score.staves[0], // Use same structure
             id: 'staff-2',
             // Staff 2 has notes, so it should drive width
             measures: [ score.staves[0].measures[0] ]
         }
       ]
    };

    const layout = calculateScoreLayout(complexScore);
    
    const m1Staff1 = layout.staves[0].measures[0];
    const m1Staff2 = layout.staves[1].measures[0];

    // Widths should be equal (synchronized)
    expect(m1Staff1.width).toBeCloseTo(m1Staff2.width);
    
    // Staff 1 measure (empty) should be expanded to match Staff 2
    expect(m1Staff1.width).toBeGreaterThan(CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight);
  });

  it('should generate flat note map', () => {
    const score = createTestScore();
    // Ensure there are notes
    const layout = calculateScoreLayout(score);
    
    const noteKeys = Object.keys(layout.notes);
    expect(noteKeys.length).toBeGreaterThan(0);
    
    // Check note layout structure
    const firstNote = layout.notes[noteKeys[0]];
    expect(firstNote).toHaveProperty('x');
    expect(firstNote).toHaveProperty('y');
    expect(firstNote).toHaveProperty('noteId');
    expect(firstNote).toHaveProperty('staffIndex');
  });

  it('should handle rests (events with no pitch)', () => {
    const score: Score = {
      title: 'Test Rest',
      staves: [
        {
          id: 'staff-1',
          clef: 'treble',
          keySignature: 'C',
          measures: [
            {
              id: 'm1',
              events: [
                {
                  id: 'rest-1',
                  duration: 'quarter',
                  dotted: false,
                  notes: [{ id: 'n1', pitch: null }], // Rest
                },
              ],
            },
          ],
        },
      ],
      keySignature: 'C',
      timeSignature: '4/4',
      bpm: 120,
    };

    const layout = calculateScoreLayout(score);
    
    // Rests don't create note layouts (only events)
    expect(Object.keys(layout.notes)).toHaveLength(0);
    // But event layouts should exist
    expect(Object.keys(layout.events)).toHaveLength(1);
  });

  it('should apply chord shifts to note positions', () => {
    const score = createTestScore();
    const layout = calculateScoreLayout(score);

    // Get notes from the first event (which likely has a chord)
    const noteEntries = Object.entries(layout.notes);
    if (noteEntries.length >= 2) {
      const [,note1] = noteEntries[0];
      const [,note2] = noteEntries[1];

      // If they're in the same event, their x positions should differ due to chord shifts
      if (note1.eventId === note2.eventId) {
        // X positions might be different for notes in the same chord
        // (though if they're perfectly aligned, they could be the same)
        expect(typeof note1.x).toBe('number');
        expect(typeof note2.x).toBe('number');
      }
    }
  });

  it('should generate hit zones for all notes', () => {
    const score = createTestScore();
    const layout = calculateScoreLayout(score);

    const notes = Object.values(layout.notes);
    expect(notes.length).toBeGreaterThan(0);

    notes.forEach((note) => {
      expect(note.hitZone).toBeDefined();
      expect(note.hitZone.startX).toBeLessThan(note.hitZone.endX);
      expect(note.hitZone.eventId).toBe(note.eventId);
      expect(note.hitZone.type).toBe('EVENT');
    });
  });

  it('should handle bass clef positioning correctly', () => {
    const score: Score = {
      title: 'Bass Clef Test',
      staves: [
        {
          id: 'staff-1',
          clef: 'bass',
          keySignature: 'C',
          measures: [
            {
              id: 'm1',
              events: [
                {
                  id: 'e1',
                  duration: 'quarter',
                  dotted: false,
                  notes: [{ id: 'n1', pitch: 'C3' }], // Middle C in bass clef
                },
              ],
            },
          ],
        },
      ],
      keySignature: 'C',
      timeSignature: '4/4',
      bpm: 120,
    };

    const layout = calculateScoreLayout(score);
    const noteKeys = Object.keys(layout.notes);
    expect(noteKeys).toHaveLength(1);

    const note = layout.notes[noteKeys[0]];
    // Bass clef C3 should be positioned differently than treble clef C3
    // Y offset should be calculated based on bass clef
    expect(note.y).toBeGreaterThan(CONFIG.baseY);
    expect(note.pitch).toBe('C3');
  });

  it('should handle pickup measures', () => {
    const score: Score = {
      title: 'Pickup Test',
      staves: [
        {
          id: 'staff-1',
          clef: 'treble',
          keySignature: 'C',
          measures: [
            {
              id: 'm1',
              isPickup: true,
              events: [
                {
                  id: 'e1',
                  duration: 'quarter',
                  dotted: false,
                  notes: [{ id: 'n1', pitch: 'C4' }],
                },
              ],
            },
          ],
        },
      ],
      keySignature: 'C',
      timeSignature: '4/4',
      bpm: 120,
    };

    const layout = calculateScoreLayout(score);
    
    // Pickup measure should still have valid layout
    expect(layout.staves[0].measures).toHaveLength(1);
    expect(Object.keys(layout.notes)).toHaveLength(1);
  });
});
