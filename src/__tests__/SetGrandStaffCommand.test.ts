import { SetGrandStaffCommand } from '../commands/SetGrandStaffCommand';
import { Score, Staff, Measure } from '../types';

describe('SetGrandStaffCommand', () => {
  const createMockScore = (clef: string = 'treble'): Score => {
    const measure: Measure = {
      id: 1,
      events: [],
      isPickup: false
    };
    
    const staff: Staff = {
      id: 100,
      clef: clef as 'treble' | 'bass' | 'grand',
      keySignature: 'C',
      measures: [measure]
    };

    return {
      staves: [staff],
      timeSignature: '4/4',
      title: 'Test Score',
      keySignature: 'C',
      bpm: 120
    };
  };

  const createMockScoreWithNotes = (clef: string = 'treble'): Score => {
    const measure: Measure = {
      id: 1,
      events: [{
        id: 'event-1',
        duration: 'quarter',
        dotted: false,
        notes: [{ id: 'note-1', pitch: clef === 'bass' ? 'C3' : 'C5' }],
        isRest: false
      }],
      isPickup: false
    };
    
    const staff: Staff = {
      id: 100,
      clef: clef as 'treble' | 'bass' | 'grand',
      keySignature: 'C',
      measures: [measure]
    };

    return {
      staves: [staff],
      timeSignature: '4/4',
      title: 'Test Score',
      keySignature: 'C',
      bpm: 120
    };
  };

  describe('Treble clef to Grand Staff', () => {
    it('should convert single staff to grand staff', () => {
      const score = createMockScore();
      const command = new SetGrandStaffCommand();
      
      const newScore = command.execute(score);
      
      expect(newScore.staves.length).toBe(2);
      expect(newScore.staves[0].clef).toBe('treble');
      expect(newScore.staves[1].clef).toBe('bass');
      
      // Check bass staff structure matches
      expect(newScore.staves[1].measures.length).toBe(1);
      expect(newScore.staves[1].measures[0].events).toEqual([]);
    });

    it('should keep treble notes on treble staff (index 0)', () => {
      const score = createMockScoreWithNotes('treble');
      const command = new SetGrandStaffCommand();
      
      const newScore = command.execute(score);
      
      // Notes should be on treble (index 0)
      expect(newScore.staves[0].measures[0].events.length).toBe(1);
      expect(newScore.staves[0].measures[0].events[0].notes[0].pitch).toBe('C5');
      
      // Bass should be empty
      expect(newScore.staves[1].measures[0].events.length).toBe(0);
    });
  });

  describe('Bass clef to Grand Staff', () => {
    it('should keep bass notes on bass staff (index 1)', () => {
      const score = createMockScoreWithNotes('bass');
      const command = new SetGrandStaffCommand();
      
      const newScore = command.execute(score);
      
      expect(newScore.staves.length).toBe(2);
      expect(newScore.staves[0].clef).toBe('treble');
      expect(newScore.staves[1].clef).toBe('bass');
      
      // Notes should be on bass (index 1)
      expect(newScore.staves[1].measures[0].events.length).toBe(1);
      expect(newScore.staves[1].measures[0].events[0].notes[0].pitch).toBe('C3');
      
      // Treble should be empty
      expect(newScore.staves[0].measures[0].events.length).toBe(0);
    });

    it('should create empty treble staff at index 0', () => {
      const score = createMockScoreWithNotes('bass');
      const command = new SetGrandStaffCommand();
      
      const newScore = command.execute(score);
      
      expect(newScore.staves[0].clef).toBe('treble');
      expect(newScore.staves[0].measures[0].events).toEqual([]);
    });
  });

  it('should be idempotent (not add more staves if already grand staff)', () => {
    const score = createMockScore();
    const command = new SetGrandStaffCommand();
    
    const grandScore = command.execute(score);
    const doubleGrandScore = command.execute(grandScore);
    
    expect(doubleGrandScore.staves.length).toBe(2);
    expect(doubleGrandScore).toBe(grandScore); // Should return same object ref if no change
  });

  it('should support undo', () => {
    const score = createMockScore();
    const command = new SetGrandStaffCommand();
    
    const newScore = command.execute(score);
    expect(newScore.staves.length).toBe(2);
    
    const undoneScore = command.undo(newScore);
    expect(undoneScore.staves.length).toBe(1);
    expect(undoneScore.staves[0].clef).toBe('treble');
  });

  it('should preserve key signature on new bass staff', () => {
    const score = createMockScore();
    score.staves[0].keySignature = 'G'; // 1 sharp
    
    const command = new SetGrandStaffCommand();
    const newScore = command.execute(score);
    
    expect(newScore.staves[1].keySignature).toBe('G');
  });
});
