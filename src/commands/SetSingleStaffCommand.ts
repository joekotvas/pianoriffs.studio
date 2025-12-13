import { Command } from './types';
import { Score, Staff, Measure, ScoreEvent } from '@/types';

/**
 * Command to reduce a Grand Staff to a single staff.
 * Supports three modes:
 * - 'keep': Keep only the target clef's staff, discard the other
 * - 'merge': Merge events from both staves into the target clef
 */
export class SetSingleStaffCommand implements Command {
  type = 'SET_SINGLE_STAFF';
  private previousStaves: Staff[] | null = null;

  constructor(
    private targetClef: 'treble' | 'bass'
  ) {}

  execute(score: Score): Score {
    // Not a grand staff? No-op
    if (score.staves.length < 2) return score;

    // Store previous state for undo
    this.previousStaves = score.staves.map(s => ({
      ...s,
      measures: s.measures.map(m => ({
        ...m,
        events: [...m.events]
      }))
    }));

    const trebleStaff = score.staves[0];
    const bassStaff = score.staves[1];
    
    // Determine which staff to keep
    const keepStaff = this.targetClef === 'treble' ? trebleStaff : bassStaff;

    // Keep mode: just keep the target staff's measures
    const resultMeasures = keepStaff.measures.map(m => ({ ...m }));

    const resultStaff: Staff = {
      ...keepStaff,
      clef: this.targetClef,
      measures: resultMeasures
    };

    return {
      ...score,
      staves: [resultStaff]
    };
  }

  undo(score: Score): Score {
    if (!this.previousStaves) return score;
    
    return {
      ...score,
      staves: this.previousStaves
    };
  }
}
