import { Command } from './types';
import { Score, Staff, Measure } from '@/types';

/**
 * Command to convert a single-staff score to a Grand Staff (Treble + Bass).
 * - If source is treble: preserves as Treble, adds empty Bass
 * - If source is bass: preserves as Bass, adds empty Treble
 * - Reversible via undo
 */
export class SetGrandStaffCommand implements Command {
  type = 'SET_GRAND_STAFF';
  private previousStaves: Staff[] | null = null;

  execute(score: Score): Score {
    // Already Grand Staff? No-op
    if (score.staves.length >= 2) return score;

    // Store previous state for undo
    this.previousStaves = [...score.staves];

    const existingStaff = score.staves[0];
    const isBassClef = existingStaff.clef === 'bass';
    
    // Create empty measures matching existing staff structure
    const emptyMeasures: Measure[] = existingStaff.measures.map((m, index) => ({
      id: Date.now() + index + 1000,
      events: [],
      isPickup: m.isPickup
    }));

    if (isBassClef) {
      // Source is bass clef: keep notes on bass (index 1), add empty treble (index 0)
      const trebleStaff: Staff = {
        id: Date.now() + 2000,
        clef: 'treble',
        keySignature: existingStaff.keySignature,
        measures: emptyMeasures
      };

      // Keep existing staff as bass at index 1
      const bassStaff: Staff = {
        ...existingStaff,
        clef: 'bass' // Ensure it's marked as bass
      };

      return {
        ...score,
        staves: [trebleStaff, bassStaff]
      };
    } else {
      // Source is treble clef: keep notes on treble (index 0), add empty bass (index 1)
      const bassStaff: Staff = {
        id: Date.now() + 2000,
        clef: 'bass',
        keySignature: existingStaff.keySignature,
        measures: emptyMeasures
      };

      // Ensure existing staff has treble clef
      const trebleStaff: Staff = {
        ...existingStaff,
        clef: 'treble'
      };

      return {
        ...score,
        staves: [trebleStaff, bassStaff]
      };
    }
  }

  undo(score: Score): Score {
    if (!this.previousStaves) return score;
    
    return {
      ...score,
      staves: this.previousStaves
    };
  }
}
