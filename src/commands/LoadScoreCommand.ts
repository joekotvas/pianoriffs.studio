import { Command } from './types';
import { Score } from '../types';

export class LoadScoreCommand implements Command {
  type = 'LOAD_SCORE';
  private previousScore: Score | null = null;

  constructor(private newScore: Score) {}

  execute(score: Score): Score {
    this.previousScore = score;
    return this.newScore;
  }

  undo(score: Score): Score {
    return this.previousScore || score;
  }
}
