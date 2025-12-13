import { Command } from './types';
import { Score, Staff } from '@/types';

export class SetKeySignatureCommand implements Command {
  type = 'SET_KEY_SIGNATURE';
  private previousKeySignature: string | null = null;
  private previousStaves: Staff[] | null = null;

  constructor(private newSignature: string) {}

  execute(score: Score): Score {
    this.previousKeySignature = score.keySignature;
    this.previousStaves = score.staves;

    if (this.newSignature === score.keySignature) {
      return score;
    }

    const newStaves = score.staves.map(staff => ({
      ...staff,
      keySignature: this.newSignature
    }));

    return {
      ...score,
      keySignature: this.newSignature,
      staves: newStaves
    };
  }

  undo(score: Score): Score {
    if (!this.previousKeySignature || !this.previousStaves) return score;

    return {
      ...score,
      keySignature: this.previousKeySignature,
      staves: this.previousStaves
    };
  }
}
