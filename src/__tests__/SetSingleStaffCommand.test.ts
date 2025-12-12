import { SetSingleStaffCommand } from '../commands/SetSingleStaffCommand';
import { Score, Staff, Measure } from '../types';

describe('SetSingleStaffCommand', () => {
  const createGrandStaffScore = (): Score => {
    const trebleStaff: Staff = {
      id: 100,
      clef: 'treble',
      keySignature: 'C',
      measures: [{
        id: 1,
        events: [{
          id: 'treble-event-1',
          duration: 'quarter',
          dotted: false,
          notes: [{ id: 'treble-note-1', pitch: 'C5' }],
          isRest: false
        }],
        isPickup: false
      }]
    };
    
    const bassStaff: Staff = {
      id: 200,
      clef: 'bass',
      keySignature: 'C',
      measures: [{
        id: 2,
        events: [{
          id: 'bass-event-1',
          duration: 'half',
          dotted: false,
          notes: [{ id: 'bass-note-1', pitch: 'C3' }],
          isRest: false
        }],
        isPickup: false
      }]
    };

    return {
      staves: [trebleStaff, bassStaff],
      timeSignature: '4/4',
      title: 'Test Score',
      keySignature: 'C',
      bpm: 120
    };
  };

  describe('Keep Mode', () => {
    it('should keep treble staff and discard bass when selecting treble', () => {
      const score = createGrandStaffScore();
      const command = new SetSingleStaffCommand('treble');
      
      const newScore = command.execute(score);
      
      expect(newScore.staves.length).toBe(1);
      expect(newScore.staves[0].clef).toBe('treble');
      expect(newScore.staves[0].measures[0].events.length).toBe(1);
      expect(newScore.staves[0].measures[0].events[0].notes[0].pitch).toBe('C5');
    });

    it('should keep bass staff and discard treble when selecting bass', () => {
      const score = createGrandStaffScore();
      const command = new SetSingleStaffCommand('bass');
      
      const newScore = command.execute(score);
      
      expect(newScore.staves.length).toBe(1);
      expect(newScore.staves[0].clef).toBe('bass');
      expect(newScore.staves[0].measures[0].events.length).toBe(1);
      expect(newScore.staves[0].measures[0].events[0].notes[0].pitch).toBe('C3');
    });
  });

  describe('Undo', () => {
    it('should restore grand staff on undo', () => {
      const score = createGrandStaffScore();
      const command = new SetSingleStaffCommand('treble');
      
      const newScore = command.execute(score);
      expect(newScore.staves.length).toBe(1);
      
      const undoneScore = command.undo(newScore);
      expect(undoneScore.staves.length).toBe(2);
      expect(undoneScore.staves[0].clef).toBe('treble');
      expect(undoneScore.staves[1].clef).toBe('bass');
    });
  });

  describe('Edge Cases', () => {
    it('should be a no-op if not a grand staff', () => {
      const singleStaffScore: Score = {
        staves: [{
          id: 100,
          clef: 'treble',
          keySignature: 'C',
          measures: [{ id: 1, events: [], isPickup: false }]
        }],
        timeSignature: '4/4',
        title: 'Test',
        keySignature: 'C',
        bpm: 120
      };
      
      const command = new SetSingleStaffCommand('treble');
      const result = command.execute(singleStaffScore);
      
      expect(result).toBe(singleStaffScore);
    });
  });
});
