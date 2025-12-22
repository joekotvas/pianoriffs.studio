import { Command } from './types';
import { Score, Measure } from '@/types';

export class AddMeasureCommand implements Command {
  public readonly type = 'ADD_MEASURE';
  private addedMeasureIds: string[] = [];
  private insertedIndex: number = -1;

  constructor(private atIndex?: number) {}

  execute(score: Score): Score {
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      const newId = Date.now().toString() + '-' + index;
      this.addedMeasureIds[index] = newId;

      const newMeasure: Measure = {
        id: newId,
        events: [],
      };

      // Insert at specific index if valid, otherwise append
      if (
        this.atIndex !== undefined &&
        this.atIndex >= 0 &&
        this.atIndex <= newMeasures.length
      ) {
        this.insertedIndex = this.atIndex;
        newMeasures.splice(this.atIndex, 0, newMeasure);
      } else {
        this.insertedIndex = newMeasures.length;
        newMeasures.push(newMeasure);
      }

      return { ...staff, measures: newMeasures };
    });

    return { ...score, staves: newStaves };
  }

  undo(score: Score): Score {
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      if (newMeasures.length === 0) {
        return { ...staff, measures: newMeasures };
      }

      // Check if execute() was called (addedMeasureIds would be populated)
      const wasExecuted = this.addedMeasureIds.length > 0;

      if (wasExecuted) {
        // Normal case: remove at recorded index if IDs match
        if (
          this.insertedIndex >= 0 &&
          this.insertedIndex < newMeasures.length &&
          this.addedMeasureIds[index] &&
          newMeasures[this.insertedIndex].id === this.addedMeasureIds[index]
        ) {
          newMeasures.splice(this.insertedIndex, 1);
        }
      } else {
        // Defensive fallback: if execute() was never called, pop last measure
        newMeasures.pop();
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
