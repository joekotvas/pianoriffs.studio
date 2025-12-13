import { Command } from './types';
import { Score, getActiveStaff, Selection, Staff } from '@/types';
import { movePitchVisual } from '@/services/MusicService';

export class TransposeSelectionCommand implements Command {
  public readonly type = 'TRANSPOSE_SELECTION';

  constructor(
    private selection: Selection,
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
    
    // Helper for robust ID comparison
    const idsMatch = (a: string | number | null, b: string | number | null) => String(a) === String(b);

    const transposeFn = (pitch: string) => movePitchVisual(pitch, steps, keySig);
    
    // CASE 0: Multi-Note Selection (using selection.selectedNotes)
    if (this.selection.selectedNotes && this.selection.selectedNotes.length > 0) {
        // We need to apply changes to potentially multiple measures/events/notes
        // We'll iterate through all selected notes and build a map of changes
        
        // Group by staff -> measure -> event
        // But since we return a new score, we have to copy structures.
        // Easiest way in this immutable pattern:
        // Deep copy the staves we need? Or just iterate and update?
        // Since performance matters less than correctness here (few selected notes usually):
        
        const newStaves = [...score.staves];
        const staffMap = new Map<number, Staff>(); // Cache modified staves
        
        this.selection.selectedNotes.forEach(sn => {
            const sIndex = sn.staffIndex;
            let currentStaff = staffMap.get(sIndex);
            if (!currentStaff) {
                // First time touching this staff, copy it from newStaves (which starts as shallow copy of score.staves)
                currentStaff = { ...newStaves[sIndex], measures: [...newStaves[sIndex].measures] };
                staffMap.set(sIndex, currentStaff);
                newStaves[sIndex] = currentStaff; // Update result array reference
            }

            // Now find measure
            if (!currentStaff.measures[sn.measureIndex]) return;
            
            // We need to modify the measure. But we might have already modified it in this loop?
            // currentStaff.measures is a NEW array (copied above).
            // But the objects inside are shared until modified.
            
            // We need a way to ensure we edit the same object instance if we hit it twice.
            // Right now currentStaff.measures[i] might be original or already cloned.
            // We can clone it on demand.
            
            // BUT, if we clone it, we need to replace it in the array.
            // Since we are iterating effectively random access, we should probably check if we've cloned it?
            // A Set of cloned measure indices?
            
            // Actually, let's just do it directly on the structure we are building.
            // We need to be careful not to clone twice (losing previous edits) or edit original.
            
            // Let's assume we clone the measure object the first time we touch it?
            // Hard to track "dirty" state without a map.
            
            // SIMPLIFICATION:
            // Since `selectedNotes` is usually small, we can just process them.
            // But to avoid overwriting edits to the same measure:
            // We need a `measuresToUpdate` map per staff?
            // Map<measureIndex, Measure>
        });
        
        // Let's restart the approach:
        // 1. Identify all unique (staffIndex, measureIndex) pairs that need updates.
        // 2. For each such measure, find all selected notes within it.
        // 3. Apply changes.
        // 4. Update the score staves.
        
        // Step 1: Group notes by staff -> measure
        const notesByMeasure = new Map<string, typeof this.selection.selectedNotes>();
        
        this.selection.selectedNotes.forEach(sn => {
            const key = `${sn.staffIndex}-${sn.measureIndex}`;
            if (!notesByMeasure.has(key)) notesByMeasure.set(key, []);
            notesByMeasure.get(key)!.push(sn);
        });
        
        // Step 2 & 3: Apply updates
        notesByMeasure.forEach((notesInMeasure, key) => {
            const [sIdxStr, mIdxStr] = key.split('-');
            const sIdx = parseInt(sIdxStr, 10);
            const mIdx = parseInt(mIdxStr, 10);
            
            // Ensure we have a working copy of the staff
            if (!staffMap.has(sIdx)) {
                staffMap.set(sIdx, { 
                    ...newStaves[sIdx], 
                    measures: [...newStaves[sIdx].measures] 
                });
                newStaves[sIdx] = staffMap.get(sIdx)!;
            }
            const workingStaff = staffMap.get(sIdx)!;
            
            // Ensure working copy of measure
            const originalMeasure = workingStaff.measures[mIdx];
            if (!originalMeasure) return;
            
            const newMeasure = { ...originalMeasure, events: [...originalMeasure.events] };
            workingStaff.measures[mIdx] = newMeasure;
            
            // Process events in this measure
            // Group notes by event to avoid cloning event multiple times
            const notesByEvent = new Map<string, typeof notesInMeasure>();
            notesInMeasure.forEach(n => {
                const eKey = String(n.eventId);
                if (!notesByEvent.has(eKey)) notesByEvent.set(eKey, []);
                notesByEvent.get(eKey)!.push(n);
            });
            
            notesByEvent.forEach((notesInEvent, eIdStr) => {
                 const eventIndex = newMeasure.events.findIndex((e: any) => String(e.id) === eIdStr);
                 if (eventIndex === -1) return;
                 
                 const newEvent = { ...newMeasure.events[eventIndex], notes: [...newMeasure.events[eventIndex].notes] };
                 newMeasure.events[eventIndex] = newEvent;
                 
                 notesInEvent.forEach(nTarget => {
                     const noteIndex = newEvent.notes.findIndex((note: any) => idsMatch(note.id, nTarget.noteId));
                     if (noteIndex !== -1) {
                         const currentPitch = newEvent.notes[noteIndex].pitch;
                         // Skip rest notes (null pitch)
                         if (currentPitch !== null) {
                             newEvent.notes[noteIndex] = {
                                 ...newEvent.notes[noteIndex],
                                 pitch: transposeFn(currentPitch)
                             };
                         }
                     }
                 });
            });
        });
        
        return { ...score, staves: newStaves };
    }
    
    // Case 1: Transpose specific note (Fallback for single selection or if selectedNotes is empty but noteId is set)
    if (this.selection.eventId && this.selection.noteId) {
        const eventIndex = measure.events.findIndex(e => idsMatch(e.id, this.selection.eventId));
        if (eventIndex === -1) return score;

        const event = { ...measure.events[eventIndex] };
        const noteIndex = event.notes.findIndex(n => idsMatch(n.id, this.selection.noteId));
        
        if (noteIndex === -1) return score;

        const note = { ...event.notes[noteIndex] };
        // Skip rest notes (null pitch)
        if (note.pitch !== null) {
            note.pitch = transposeFn(note.pitch);
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
        const eventIndex = measure.events.findIndex(e => idsMatch(e.id, this.selection.eventId));
        if (eventIndex === -1) return score;

        const event = { ...measure.events[eventIndex] };
        const newNotes = event.notes.map(n => ({
            ...n,
            // Skip rest notes (null pitch)
            pitch: n.pitch !== null ? transposeFn(n.pitch) : null
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
                // Skip rest notes (null pitch)
                pitch: n.pitch !== null ? transposeFn(n.pitch) : null
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
