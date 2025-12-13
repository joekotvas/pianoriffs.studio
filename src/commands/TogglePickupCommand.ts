import { Command } from './types';
import { Score } from '@/types';

export class TogglePickupCommand implements Command {
  type = 'TOGGLE_PICKUP';
  private previousIsPickup: boolean | undefined;

  execute(score: Score): Score {
    // Check first staff to determine current state
    const firstStaff = score.staves[0];
    if (!firstStaff || firstStaff.measures.length === 0) return score;

    const firstMeasure = firstStaff.measures[0];
    this.previousIsPickup = !!firstMeasure.isPickup;
    const newIsPickup = !firstMeasure.isPickup;

    // Update ALL staves
    const newStaves = score.staves.map(staff => {
        if (staff.measures.length === 0) return staff;
        const newMeasures = [...staff.measures];
        newMeasures[0] = {
            ...newMeasures[0],
            isPickup: newIsPickup
        };
        return { ...staff, measures: newMeasures };
    });

    return {
      ...score,
      staves: newStaves
    };
  }

  undo(score: Score): Score {
    if (this.previousIsPickup === undefined) return score;

    // Restore ALL staves to previous state
    const newStaves = score.staves.map(staff => {
        if (staff.measures.length === 0) return staff;
        const newMeasures = [...staff.measures];
        newMeasures[0] = {
            ...newMeasures[0],
            isPickup: this.previousIsPickup
        };
        return { ...staff, measures: newMeasures };
    });

    return {
      ...score,
      staves: newStaves
    };
  }
}
