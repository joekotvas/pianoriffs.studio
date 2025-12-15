import { Command } from './types';
import { Score, Measure } from '@/types';

export class AddMeasureCommand implements Command {
  public readonly type = 'ADD_MEASURE';
  private addedMeasureIds: string[] = [];

  execute(score: Score): Score {
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      const newId = Date.now().toString() + '-' + index;
      this.addedMeasureIds[index] = newId;

      const newMeasure: Measure = {
        id: newId,
        events: [],
      };
      newMeasures.push(newMeasure);
      return { ...staff, measures: newMeasures };
    });

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      if (newMeasures.length > 0) {
        const lastMeasure = newMeasures[newMeasures.length - 1];
        // Verify ID matches if we have it recorded
        if (this.addedMeasureIds[index] && lastMeasure.id === this.addedMeasureIds[index]) {
          newMeasures.pop();
        } else if (!this.addedMeasureIds[index]) {
          // Fallback if no ID recorded (legacy?)
          newMeasures.pop();
        }
      }
      return { ...staff, measures: newMeasures };
    });

    return { ...score, staves: newStaves };
  }
}

export class DeleteMeasureCommand implements Command {
  public readonly type = 'DELETE_MEASURE';
  private deletedMeasures: Measure[] = [];
  private deletedIndex: number = -1;

  constructor(private index?: number) {}

  execute(score: Score): Score {
    // Determine target index from first staff (assuming sync)
    const firstStaff = score.staves[0];
    if (!firstStaff || firstStaff.measures.length === 0) return score;

    const targetIndex = this.index !== undefined ? this.index : firstStaff.measures.length - 1;
    if (targetIndex < 0 || targetIndex >= firstStaff.measures.length) return score;

    this.deletedIndex = targetIndex;
    this.deletedMeasures = [];

    const newStaves = score.staves.map((staff) => {
      const newMeasures = [...staff.measures];
      if (targetIndex < newMeasures.length) {
        this.deletedMeasures.push(newMeasures[targetIndex]);
        newMeasures.splice(targetIndex, 1);
      }
      return { ...staff, measures: newMeasures };
    });

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    if (this.deletedIndex === -1 || this.deletedMeasures.length === 0) return score;

    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      const deletedMeasure = this.deletedMeasures[index]; // Assuming staves order preserved
      if (deletedMeasure) {
        newMeasures.splice(this.deletedIndex, 0, deletedMeasure);
      }
      return { ...staff, measures: newMeasures };
    });

    return { ...score, staves: newStaves };
  }
}
