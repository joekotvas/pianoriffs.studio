import { Command } from './types';
import { Score } from '@/types';

/**
 * Command to update the score's BPM (Beats Per Minute).
 * BPM is clamped to a valid range of 10-500.
 */
export class SetBpmCommand implements Command {
  public readonly type = 'SET_BPM';
  private previousBpm!: number;

  constructor(private bpm: number) {}

  execute(score: Score): Score {
    this.previousBpm = score.bpm || 120;

    // Clamp BPM to valid range (10-500)
    const safeBpm = Math.max(10, Math.min(500, this.bpm));

    score.bpm = safeBpm;
    return score;
  }

  undo(score: Score): Score {
    score.bpm = this.previousBpm;
    return score;
  }
}
