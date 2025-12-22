import React from 'react';
import { Note, ChordLayout } from '@/types';
import { Rest } from './Rest';
import ChordGroup from './ChordGroup';
import { NOTE_TYPES } from '@/constants';

interface GhostPreviewProps {
  previewRender: {
    chordNotes: Note[];
    quant: number;
    x: number;
    chordLayout: ChordLayout;
  };
  previewNote: {
    duration: string;
    dotted: boolean;
    mode: string;
    isRest?: boolean;
  };
  baseY: number;
  layout: unknown;
  interaction: unknown;
  measureIndex: number;
}

/**
 * Renders the ghost preview for note/rest entry.
 * Shows a semi-transparent preview of what will be created on click.
 */
const GhostPreview: React.FC<GhostPreviewProps> = ({
  previewRender,
  previewNote,
  baseY,
  layout,
  interaction,
  measureIndex,
}) => {
  const { chordNotes, x, chordLayout } = previewRender;

  // Render rest preview when in REST mode
  if (previewNote?.isRest) {
    return (
      <Rest
        duration={previewNote.duration}
        dotted={previewNote.dotted}
        x={x}
        baseY={baseY}
        isGhost={true}
      />
    );
  }

  // Normal note preview
  const shouldDrawStem = NOTE_TYPES[previewNote.duration]?.stem && previewNote.mode !== 'CHORD';

  return (
    <ChordGroup
      notes={chordNotes}
      duration={previewNote.duration}
      dotted={previewNote.dotted}
      eventId="preview"
      x={x}
      chordLayout={chordLayout}
      isGhost={true}
      layout={layout}
      interaction={interaction}
      measureIndex={measureIndex}
      opacity={0.5}
      renderStem={shouldDrawStem}
    />
  );
};

export default GhostPreview;
