import { Score } from '../types';

export interface Command {
  type: string;
  execute(score: Score): Score;
  undo(score: Score): Score;
}
