import { TransposeSelectionCommand } from '@/commands/TransposeSelectionCommand';
import { createDefaultScore, getActiveStaff } from '@/types';
import { SetGrandStaffCommand } from '@/commands/SetGrandStaffCommand';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { ScoreEngine } from '@/engines/ScoreEngine';

describe('Grand Staff Bass Clef Transposition', () => {
  let engine: ScoreEngine;

  beforeEach(() => {
    // Create a default score and convert to grand staff
    const defaultScore = createDefaultScore();
    engine = new ScoreEngine(defaultScore);
    engine.dispatch(new SetGrandStaffCommand());
  });

  it('should transpose notes on bass clef (staffIndex=1) when using TransposeSelectionCommand', () => {
    // Add a note to bass clef (staff index 1)
    // AddEventCommand signature: (measureIndex, isRest, note, duration, isDotted, index?, eventId?, staffIndex?)
    engine.dispatch(
      new AddEventCommand(
        0, // measureIndex
        false, // isRest
        { pitch: 'E3', id: 'test-note-bass' }, // note
        'quarter', // duration
        false, // isDotted
        undefined, // index
        undefined, // eventId
        1 // staffIndex = 1 (bass clef)
      )
    );

    let score = engine.getState();
    const bassStaff = getActiveStaff(score, 1);
    expect(bassStaff.measures[0].events.length).toBe(1);

    const originalNote = bassStaff.measures[0].events[0].notes[0];
    expect(originalNote.pitch).toBe('E3');

    // Create selection for bass clef note
    const selection = {
      staffIndex: 1,
      measureIndex: 0,
      eventId: bassStaff.measures[0].events[0].id,
      noteId: originalNote.id,
      selectedNotes: [],
    };

    // Transpose up by 1 diatonic step (E3 -> F3)
    engine.dispatch(new TransposeSelectionCommand(selection, 1, 'C'));

    score = engine.getState();
    const updatedBassStaff = getActiveStaff(score, 1);
    const transposedNote = updatedBassStaff.measures[0].events[0].notes[0];

    // E3 + 1 diatonic step = F3
    expect(transposedNote.pitch).toBe('F3');
  });

  it('should not affect treble clef when transposing bass clef notes', () => {
    // Add note to treble (staffIndex 0)
    engine.dispatch(
      new AddEventCommand(
        0,
        false,
        { pitch: 'C5', id: 'treble-note' },
        'quarter',
        false,
        undefined,
        undefined,
        0
      )
    );

    // Add note to bass (staffIndex 1)
    engine.dispatch(
      new AddEventCommand(
        0,
        false,
        { pitch: 'C3', id: 'bass-note' },
        'quarter',
        false,
        undefined,
        undefined,
        1
      )
    );

    let score = engine.getState();

    // Get bass note's selection
    const bassStaff = getActiveStaff(score, 1);
    const bassEvent = bassStaff.measures[0].events[0];

    const selection = {
      staffIndex: 1,
      measureIndex: 0,
      eventId: bassEvent.id,
      noteId: bassEvent.notes[0].id,
      selectedNotes: [],
    };

    // Transpose bass note up by 1 diatonic step (C3 -> D3)
    engine.dispatch(new TransposeSelectionCommand(selection, 1, 'C'));

    score = engine.getState();

    // Verify bass note changed (C3 + 1 step = D3)
    const updatedBassStaff = getActiveStaff(score, 1);
    expect(updatedBassStaff.measures[0].events[0].notes[0].pitch).toBe('D3');

    // Verify treble note unchanged
    const trebleStaff = getActiveStaff(score, 0);
    expect(trebleStaff.measures[0].events[0].notes[0].pitch).toBe('C5');
  });

  it('should correctly undo transposition on bass clef', () => {
    // Add note to bass
    engine.dispatch(
      new AddEventCommand(
        0,
        false,
        { pitch: 'G3', id: 'bass-undo-note' },
        'quarter',
        false,
        undefined,
        undefined,
        1
      )
    );

    let score = engine.getState();
    const bassStaff = getActiveStaff(score, 1);
    const bassEvent = bassStaff.measures[0].events[0];

    const selection = {
      staffIndex: 1,
      measureIndex: 0,
      eventId: bassEvent.id,
      noteId: bassEvent.notes[0].id,
      selectedNotes: [],
    };

    // Transpose down by 7 diatonic steps (approximately one octave: G3 -> G2)
    engine.dispatch(new TransposeSelectionCommand(selection, -7, 'C'));

    score = engine.getState();
    expect(getActiveStaff(score, 1).measures[0].events[0].notes[0].pitch).toBe('G2');

    // Undo
    engine.undo();

    score = engine.getState();
    expect(getActiveStaff(score, 1).measures[0].events[0].notes[0].pitch).toBe('G3');
  });
});
