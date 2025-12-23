/**
 * ScoreEngine Tests
 *
 * Tests for the central score state management engine.
 * Covers: initialization, command dispatch, undo/redo.
 *
 * @see ScoreEngine
 */

import { ScoreEngine } from '@/engines/ScoreEngine';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { DeleteNoteCommand } from '@/commands/DeleteNoteCommand';
import { ChangePitchCommand } from '@/commands/ChangePitchCommand';
import { AddMeasureCommand, DeleteMeasureCommand } from '@/commands/MeasureCommands';
import { Note } from '@/types';

describe('ScoreEngine', () => {
  it('should initialize with default score', () => {
    const engine = new ScoreEngine();
    const state = engine.getState();
    expect(state.staves[0].measures.length).toBeGreaterThan(0);
  });

  it('should dispatch AddEventCommand and update state', () => {
    const engine = new ScoreEngine();
    const note: Note = { id: 'test-note', pitch: 'C4' };
    const command = new AddEventCommand(0, false, note, 'quarter', false);

    engine.dispatch(command);

    const state = engine.getState();
    const measure = state.staves[0].measures[0];
    expect(measure.events.length).toBe(1);
    expect(measure.events[0].notes[0].pitch).toBe('C4');
  });

  it('should undo AddEventCommand', () => {
    const engine = new ScoreEngine();
    const note: Note = { id: 'test-note', pitch: 'C4' };
    const command = new AddEventCommand(0, false, note, 'quarter', false);

    engine.dispatch(command);
    expect(engine.getState().staves[0].measures[0].events.length).toBe(1);

    engine.undo();
    expect(engine.getState().staves[0].measures[0].events.length).toBe(0);
  });

  it('should dispatch DeleteNoteCommand and update state', () => {
    const engine = new ScoreEngine();
    const note: Note = { id: 'test-note', pitch: 'C4' };
    // First add a note
    const addCommand = new AddEventCommand(0, false, note, 'quarter', false);
    engine.dispatch(addCommand);

    // Get the event ID created (in a real app we'd get this from the state or command result)
    const stateAfterAdd = engine.getState();
    const eventId = stateAfterAdd.staves[0].measures[0].events[0].id;

    // Then delete it
    const deleteCommand = new DeleteNoteCommand(0, eventId, 'test-note');
    engine.dispatch(deleteCommand);

    const stateAfterDelete = engine.getState();
    expect(stateAfterDelete.staves[0].measures[0].events.length).toBe(0);
  });

  it('should dispatch ChangePitchCommand and update state', () => {
    const engine = new ScoreEngine();
    const note: Note = { id: 'test-note', pitch: 'C4' };
    const addCommand = new AddEventCommand(0, false, note, 'quarter', false);
    engine.dispatch(addCommand);

    const stateAfterAdd = engine.getState();
    const eventId = stateAfterAdd.staves[0].measures[0].events[0].id;

    const changePitchCommand = new ChangePitchCommand(0, eventId, 'test-note', 'D4');
    engine.dispatch(changePitchCommand);

    const stateAfterChange = engine.getState();
    expect(stateAfterChange.staves[0].measures[0].events[0].notes[0].pitch).toBe('D4');
  });

  it('should dispatch AddMeasureCommand and DeleteMeasureCommand', () => {
    const engine = new ScoreEngine();
    const initialMeasureCount = engine.getState().staves[0].measures.length;

    const addMeasureCommand = new AddMeasureCommand();
    engine.dispatch(addMeasureCommand);

    expect(engine.getState().staves[0].measures.length).toBe(initialMeasureCount + 1);

    const deleteMeasureCommand = new DeleteMeasureCommand(); // Deletes last
    engine.dispatch(deleteMeasureCommand);

    expect(engine.getState().staves[0].measures.length).toBe(initialMeasureCount);
  });
});
