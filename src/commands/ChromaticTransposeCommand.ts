/**
 * ChromaticTransposeCommand
 *
 * Transposes selected notes by a specified number of semitones.
 * Unlike TransposeSelectionCommand (diatonic/visual), this moves by
 * exact chromatic intervals regardless of key signature.
 *
 * @see TransposeSelectionCommand for diatonic transposition
 */

import { Command } from './types';
import { Score, getActiveStaff, Selection, Staff, ScoreEvent, Note as NoteType } from '@/types';
import { Note, Interval } from 'tonal';
import { PIANO_RANGE } from '@/constants';
import { getMidi } from '@/services/MusicService';

export class ChromaticTransposeCommand implements Command {
  public readonly type = 'CHROMATIC_TRANSPOSE';

  constructor(
    private selection: Selection,
    private semitones: number
  ) {}

  /**
   * Transpose a pitch by semitones, clamped to piano range.
   */
  private transposePitch(pitch: string): string | null {
    if (!pitch) return null;

    // Get the interval from semitones (e.g., 3 -> "3m" or "3M" depending on context)
    // Using Interval.fromSemitones will give us the simplest interval
    const interval = Interval.fromSemitones(this.semitones);
    if (!interval) return pitch;

    const transposed = Note.transpose(pitch, interval);
    if (!transposed) return pitch;

    // Clamp to piano range
    const midi = getMidi(transposed);
    const minMidi = getMidi(PIANO_RANGE.min);
    const maxMidi = getMidi(PIANO_RANGE.max);

    if (midi < minMidi || midi > maxMidi) {
      return pitch; // Don't transpose out of range
    }

    return transposed;
  }

  execute(score: Score): Score {
    if (this.selection.measureIndex === null) return score;

    const staffIndex = this.selection.staffIndex ?? 0;

    // Helper for robust ID comparison
    const idsMatch = (a: string | number | null, b: string | number | null) =>
      String(a) === String(b);

    // CASE 0: Multi-Note Selection (using selection.selectedNotes)
    if (this.selection.selectedNotes && this.selection.selectedNotes.length > 0) {
      // Group by staff -> measure
      const notesByMeasure = new Map<string, typeof this.selection.selectedNotes>();

      this.selection.selectedNotes.forEach((sn) => {
        const key = `${sn.staffIndex}-${sn.measureIndex}`;
        if (!notesByMeasure.has(key)) notesByMeasure.set(key, []);
        notesByMeasure.get(key)!.push(sn);
      });

      const newStaves = [...score.staves];
      const staffMap = new Map<number, Staff>();

      notesByMeasure.forEach((notesInMeasure, key) => {
        const [sIdxStr, mIdxStr] = key.split('-');
        const sIdx = parseInt(sIdxStr, 10);
        const mIdx = parseInt(mIdxStr, 10);

        if (!staffMap.has(sIdx)) {
          staffMap.set(sIdx, {
            ...newStaves[sIdx],
            measures: [...newStaves[sIdx].measures],
          });
          newStaves[sIdx] = staffMap.get(sIdx)!;
        }
        const workingStaff = staffMap.get(sIdx)!;

        const originalMeasure = workingStaff.measures[mIdx];
        if (!originalMeasure) return;

        const newMeasure = { ...originalMeasure, events: [...originalMeasure.events] };
        workingStaff.measures[mIdx] = newMeasure;

        // Group notes by event
        const notesByEvent = new Map<string, typeof notesInMeasure>();
        notesInMeasure.forEach((n) => {
          const eKey = String(n.eventId);
          if (!notesByEvent.has(eKey)) notesByEvent.set(eKey, []);
          notesByEvent.get(eKey)!.push(n);
        });

        notesByEvent.forEach((notesInEvent, eIdStr) => {
          const eventIndex = newMeasure.events.findIndex(
            (e: ScoreEvent) => String(e.id) === eIdStr
          );
          if (eventIndex === -1) return;

          const newEvent = {
            ...newMeasure.events[eventIndex],
            notes: [...newMeasure.events[eventIndex].notes],
          };
          newMeasure.events[eventIndex] = newEvent;

          notesInEvent.forEach((nTarget) => {
            const noteIndex = newEvent.notes.findIndex((note: NoteType) =>
              idsMatch(note.id, nTarget.noteId)
            );
            if (noteIndex !== -1) {
              const currentPitch = newEvent.notes[noteIndex].pitch;
              if (currentPitch !== null) {
                const newPitch = this.transposePitch(currentPitch);
                if (newPitch) {
                  newEvent.notes[noteIndex] = {
                    ...newEvent.notes[noteIndex],
                    pitch: newPitch,
                  };
                }
              }
            }
          });
        });
      });

      return { ...score, staves: newStaves };
    }

    // Case 1: Transpose specific note
    const activeStaff = getActiveStaff(score, staffIndex);
    const newMeasures = [...activeStaff.measures];

    if (!newMeasures[this.selection.measureIndex]) return score;

    const measure = { ...newMeasures[this.selection.measureIndex] };

    if (this.selection.eventId && this.selection.noteId) {
      const eventIndex = measure.events.findIndex((e) => idsMatch(e.id, this.selection.eventId));
      if (eventIndex === -1) return score;

      const event = { ...measure.events[eventIndex] };
      const noteIndex = event.notes.findIndex((n) => idsMatch(n.id, this.selection.noteId));

      if (noteIndex === -1) return score;

      const note = { ...event.notes[noteIndex] };
      if (note.pitch !== null) {
        note.pitch = this.transposePitch(note.pitch) ?? note.pitch;
      }

      const newNotes = [...event.notes];
      newNotes[noteIndex] = note;
      event.notes = newNotes;

      const newEvents = [...measure.events];
      newEvents[eventIndex] = event;
      measure.events = newEvents;
    }
    // Case 2: Transpose entire event (all notes)
    else if (this.selection.eventId) {
      const eventIndex = measure.events.findIndex((e) => idsMatch(e.id, this.selection.eventId));
      if (eventIndex === -1) return score;

      const event = { ...measure.events[eventIndex] };
      const newNotes = event.notes.map((n) => ({
        ...n,
        pitch: n.pitch !== null ? (this.transposePitch(n.pitch) ?? n.pitch) : null,
      }));

      event.notes = newNotes;

      const newEvents = [...measure.events];
      newEvents[eventIndex] = event;
      measure.events = newEvents;
    }

    newMeasures[this.selection.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[staffIndex] = { ...activeStaff, measures: newMeasures };

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    // Undo is just transposing in the opposite direction
    const undoCommand = new ChromaticTransposeCommand(this.selection, -this.semitones);
    return undoCommand.execute(score);
  }
}
