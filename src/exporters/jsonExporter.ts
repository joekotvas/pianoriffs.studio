import { Score } from '@/types';

export const generateJSON = (score: Score) => {
  return JSON.stringify(score, null, 2);
};
