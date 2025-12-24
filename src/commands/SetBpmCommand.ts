import { Command } from './types';
import { Score } from '@/types';
import { clampBpm } from '@/utils/validation';

/**
 * Command to update the score's BPM (Beats Per Minute).
 * BPM is clamped to a valid range using the shared validation utility.
 */
export class SetBpmCommand implements Command {
  public readonly type = 'SET_BPM';
  private previousBpm!: number;

  constructor(private bpm: number) {}

  execute(score: Score): Score {
    this.previousBpm = score.bpm || 120;

    // Use shared validation utility for consistent BPM range
    score.bpm = clampBpm(this.bpm);
    return score;
  }

  undo(score: Score): Score {
    score.bpm = this.previousBpm;
    return score;
  }
}
