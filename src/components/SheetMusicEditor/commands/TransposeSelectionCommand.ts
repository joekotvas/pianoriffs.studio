import { Command } from './types';
import { Score, getActiveStaff } from '../types';
import { movePitchVisual } from '../services/MusicService';

export class TransposeSelectionCommand implements Command {
  public readonly type = 'TRANSPOSE_SELECTION';

  constructor(
    private selection: { staffIndex?: number; measureIndex: number | null; eventId: string | number | null; noteId: string | number | null },
    private semitones: number,
    private keySignature: string = 'C'
  ) {}

  execute(score: Score): Score {
    if (this.selection.measureIndex === null) return score;

    const staffIndex = this.selection.staffIndex ?? 0;
    const activeStaff = getActiveStaff(score, staffIndex);
    // Key-aware transposition uses the key signature, not clef
    const keySig = activeStaff.keySignature || this.keySignature || 'C';
    
    const newMeasures = [...activeStaff.measures];
    
    if (!newMeasures[this.selection.measureIndex]) return score;

    const measure = { ...newMeasures[this.selection.measureIndex] };
    
    // Determine transposition logic
    // The command is called "semitones", but typically "Transpose Selection" via arrows means "Visual Steps".
    // If semitones is small (+/- 1), it usually implies Steps (User pressed Arrow).
    // If semitones is large (+12), it implies Shift+Arrow (Octave).
    
    // BUG FIX: The caller (useNavigation) was passing +12 Semitones for Shift+Up, 
    // but the old PitchService treated it as Steps (Octave+6th).
    // Here we need to decide if we are moving by Steps or Semitones.
    
    // For now, let's assume 'semitones' actually means 'steps' in the context of arrow keys.
    // If it's +/- 12, that's 7 steps (Octave).
    // Caller needs to send correct step count?
    // Or we handle it here.
    
    let steps = this.semitones;
    if (Math.abs(steps) === 12) {
        steps = (steps > 0) ? 7 : -7;
    }
    
    const transposeFn = (pitch: string) => movePitchVisual(pitch, steps, keySig);
    
    // Case 1: Transpose specific note
    if (this.selection.eventId && this.selection.noteId) {
        const eventIndex = measure.events.findIndex(e => e.id === this.selection.eventId);
        if (eventIndex === -1) return score;

        const event = { ...measure.events[eventIndex] };
        const noteIndex = event.notes.findIndex(n => n.id === this.selection.noteId);
        
        if (noteIndex === -1) return score;

        const note = { ...event.notes[noteIndex] };
        note.pitch = transposeFn(note.pitch);
        
        const newNotes = [...event.notes];
        newNotes[noteIndex] = note;
        event.notes = newNotes;
        
        const newEvents = [...measure.events];
        newEvents[eventIndex] = event;
        measure.events = newEvents;
    }
    // Case 2: Transpose entire event (all notes)
    else if (this.selection.eventId) {
        const eventIndex = measure.events.findIndex(e => e.id === this.selection.eventId);
        if (eventIndex === -1) return score;

        const event = { ...measure.events[eventIndex] };
        const newNotes = event.notes.map(n => ({
            ...n,
            pitch: transposeFn(n.pitch)
        }));
        
        event.notes = newNotes;
        
        const newEvents = [...measure.events];
        newEvents[eventIndex] = event;
        measure.events = newEvents;
    }
    // Case 3: Transpose entire measure
    else {
        const newEvents = measure.events.map(e => ({
            ...e,
            notes: e.notes.map(n => ({
                ...n,
                pitch: transposeFn(n.pitch)
            }))
        }));
        measure.events = newEvents;
    }

    newMeasures[this.selection.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[staffIndex] = { ...activeStaff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    // Undo is just transposing in the opposite direction
    const undoCommand = new TransposeSelectionCommand(this.selection, -this.semitones, this.keySignature);
    return undoCommand.execute(score);
  }
}
