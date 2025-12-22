import { Command } from './types';
import { Score } from '@/types';

/**
 * Command to change the clef of a single staff.
 * Unlike SetSingleStaffCommand (which converts grand→single),
 * this command only changes the clef property on an existing single staff.
 */
export class SetClefCommand implements Command {
  type = 'SET_CLEF';
  private previousClef: 'treble' | 'bass' | 'alto' | 'tenor' | 'grand' | null = null;

  constructor(
    private targetClef: 'treble' | 'bass' | 'alto' | 'tenor',
    private staffIndex: number = 0
  ) {}

  execute(score: Score): Score {
    // Store previous clef for undo
    this.previousClef = score.staves[this.staffIndex]?.clef || 'treble';

    // Don't change if already the same
    if (this.previousClef === this.targetClef) {
      return score;
    }

    const updatedStaves = score.staves.map((staff, idx) =>
      idx === this.staffIndex ? { ...staff, clef: this.targetClef } : staff
    );

    return {
      ...score,
      staves: updatedStaves,
    };
  }

  undo(score: Score): Score {
    if (this.previousClef === null) return score;

    // Store in const for TypeScript type narrowing in callback
    const clefToRestore = this.previousClef;

    const updatedStaves = score.staves.map((staff, idx) =>
      idx === this.staffIndex ? { ...staff, clef: clefToRestore } : staff
    );

    return {
      ...score,
      staves: updatedStaves,
    };
  }
}
