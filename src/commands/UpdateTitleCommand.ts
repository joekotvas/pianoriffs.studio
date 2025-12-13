import { Command } from './types';
import { Score } from '@/types';

export class UpdateTitleCommand implements Command {
  type = 'UPDATE_TITLE';
  private previousTitle: string = '';

  constructor(private newTitle: string) {}

  execute(score: Score): Score {
    this.previousTitle = score.title;
    return {
      ...score,
      title: this.newTitle
    };
  }

  undo(score: Score): Score {
    return {
      ...score,
      title: this.previousTitle
    };
  }
}
