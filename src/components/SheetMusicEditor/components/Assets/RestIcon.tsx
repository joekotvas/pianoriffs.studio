// @ts-nocheck
import React from 'react';
import { REST_GLYPHS } from './RestGlyphs';
import { REST_TYPES } from '../../constants';

interface RestIconProps {
  type: string;
  color?: string;
}

/**
 * Renders a rest icon for the toolbar.
 * Uses the same SVG paths as the score Rest component.
 */
const RestIcon: React.FC<RestIconProps> = ({ type, color = 'currentColor' }) => {
  const config = REST_TYPES[type];
  const pathData = REST_GLYPHS[type];

  if (!config || !pathData) {
    // Fallback for unsupported types
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="8" y="10" width="8" height="4" fill={color} />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox={config.viewBox} fill="none">
      <path d={pathData} fill={color} />
    </svg>
  );
};

export default RestIcon;
