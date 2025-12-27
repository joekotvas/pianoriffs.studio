import { getActiveStaff, Score, Selection, ScoreEvent } from '@/types';
import { UsePlaybackReturn } from '../audio';

/**
 * Handles playback keyboard shortcuts (Space, P).
 */
export const handlePlayback = (
  e: KeyboardEvent,
  playback: UsePlaybackReturn,
  selection: Selection,
  score: Score
) => {
  const { playScore, isPlaying, lastPlayStart } = playback;
  const measures = getActiveStaff(score).measures;

  // PLAYBACK 'P'
  if (e.key.toLowerCase() === 'p') {
    e.preventDefault();
    if (selection.measureIndex !== null && selection.eventId) {
      const m = measures[selection.measureIndex];
      const eIdx = m.events.findIndex((evt: ScoreEvent) => evt.id === selection.eventId);
      playScore(selection.measureIndex, eIdx !== -1 ? eIdx : 0);
    } else {
      playScore(0, 0);
    }
    return true;
  }

  // SPACEBAR
  if (e.code === 'Space') {
    e.preventDefault();
    if (e.shiftKey && (e.altKey || e.metaKey)) {
      playScore(0, 0);
    } else if (e.shiftKey) {
      playScore(lastPlayStart.measureIndex, lastPlayStart.quant);
    } else {
      if (isPlaying) {
        playback.pausePlayback();
      } else {
        // RESUME from NEXT event if paused (position exists)
        if (playback.playbackPosition && playback.playbackPosition.measureIndex !== null) {
          const resumeQuant = (playback.playbackPosition.quant ?? -1) + 1;
          playScore(playback.playbackPosition.measureIndex, resumeQuant);
        }
        // START from selection if stopped
        else if (selection.measureIndex !== null && selection.eventId) {
          const m = measures[selection.measureIndex];
          const eIdx = m.events.findIndex((evt: ScoreEvent) => evt.id === selection.eventId);
          playScore(selection.measureIndex, eIdx !== -1 ? eIdx : 0);
        }
        // START from beginning
        else {
          playScore(0, 0);
        }
      }
    }
    return true;
  }

  return false;
};
