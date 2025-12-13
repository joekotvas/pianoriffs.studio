import { Command } from './types';
import { Score, Staff } from '@/types';
import { reflowScore } from '@/utils/core';

export class SetTimeSignatureCommand implements Command {
  type = 'SET_TIME_SIGNATURE';
  private previousTimeSignature: string | null = null;
  private previousStaves: Staff[] | null = null;

  constructor(private newSignature: string) {}

  execute(score: Score): Score {
    this.previousTimeSignature = score.timeSignature;
    this.previousStaves = score.staves;

    if (this.newSignature === score.timeSignature) {
      return score;
    }

    const newStaves = score.staves.map(staff => ({
      ...staff,
      measures: reflowScore(staff.measures, this.newSignature)
    }));

    return {
      ...score,
      timeSignature: this.newSignature,
      staves: newStaves
    };
  }

  undo(score: Score): Score {
    if (!this.previousTimeSignature || !this.previousStaves) return score;

    return {
      ...score,
      timeSignature: this.previousTimeSignature,
      staves: this.previousStaves
    };
  }
}
