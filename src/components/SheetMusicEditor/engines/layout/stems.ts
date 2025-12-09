/**
 * Constants and helpers for calculating stem geometry.
 */

import { STEM } from '../../constants';

// Re-export for backwards compatibility
export const STEM_LENGTHS = STEM.LENGTHS;

/**
 * Calculates stem geometry based on beam specifications or default layout.
 * @param {Object} params - Calculation parameters
 * @param {Object} params.beamSpec - Beaming specification (if part of a beam)
 * @param {number} params.stemX - X coordinate of the stem
 * @param {string} params.direction - Stem direction ('up' | 'down')
 * @param {number} params.minY - Highest pitch Y-coordinate (visually lowest)
 * @param {number} params.maxY - Lowest pitch Y-coordinate (visually highest)
 * @param {string} params.duration - Note duration type
 * @returns {{startY: number, endY: number}} Start and end Y coordinates for the stem
 */
export const calculateStemGeometry = ({ beamSpec, stemX, direction, minY, maxY, duration }: {
    beamSpec?: { startY: number, endY: number, startX: number, endX: number },
    stemX: number,
    direction: 'up' | 'down',
    minY: number,
    maxY: number,
    duration: string
}) => {
  if (beamSpec) {
    // y = m*x + b derivation
    const m = (beamSpec.endY - beamSpec.startY) / (beamSpec.endX - beamSpec.startX);
    const stemEndY = beamSpec.startY + m * (stemX - beamSpec.startX);
    const stemStartY = direction === 'up' ? maxY : minY;
    return { startY: stemStartY, endY: stemEndY };
  }

  // Standard Stem Logic
  const length = STEM_LENGTHS[duration] || STEM_LENGTHS.default;
  if (direction === 'up') {
    return { startY: maxY, endY: minY - length };
  }
  return { startY: minY, endY: maxY + length };
};
