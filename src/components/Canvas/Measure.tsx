// @ts-nocheck
import React, { useMemo } from 'react';
import { CONFIG } from '@/config';
import { useTheme } from '@/context/ThemeContext';
import { getFirstNoteId } from '@/utils/core';
import { isRestSelected, isBeamGroupSelected } from '@/utils/selection';
import { useAccidentalContext } from '@/hooks/useAccidentalContext';
import { useMeasureLayout } from '@/hooks/useMeasureLayout';
import { useMeasureInteraction } from '@/hooks/useMeasureInteraction';
import { usePreviewRender } from '@/hooks/usePreviewRender';
import { MeasureProps } from '../../componentTypes';

// Components
import ChordGroup from './ChordGroup';
import GhostPreview from './GhostPreview';
import { Rest } from './Rest';
import Beam from './Beam';
import TupletBracket from './TupletBracket';

// --- Sub-Components (Visual Helpers) ---

const StaffLines = ({ width, theme, baseY }) => (
  <g className="staff-lines" style={{ pointerEvents: 'none' }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={`staff-${i}`}
        x1={0}
        y1={baseY + i * CONFIG.lineHeight}
        x2={width}
        y2={baseY + i * CONFIG.lineHeight}
        stroke={theme.score.line}
        strokeWidth={1}
      />
    ))}
  </g>
);

const MeasureBarLine = ({ x, baseY, isLast, theme }) => (
  <line
    x1={x}
    y1={baseY}
    x2={x}
    y2={baseY + CONFIG.lineHeight * 4}
    stroke={theme.score.line}
    strokeWidth={isLast ? 3 : 1}
  />
);

// --- Main Component ---

const Measure: React.FC<MeasureProps> = ({
  measureData,
  measureIndex,
  startX,
  isLast,
  forcedWidth,
  forcedEventPositions,
  layout,
  interaction,
}) => {
  const { theme } = useTheme();
  const { events } = measureData;
  const { scale, baseY, clef, keySignature } = layout;
  const { selection, previewNote, activeDuration, onAddNote, onHover } = interaction;

  // 1. Layout & Physics
  const {
    hitZones,
    eventPositions,
    totalWidth,
    effectiveWidth,
    centeredEvents,
    beamGroups,
    tupletGroups,
  } = useMeasureLayout(events, clef, measureData.isPickup, forcedEventPositions, forcedWidth);

  // 2. Accidental Logic
  const accidentalOverrides = useAccidentalContext(events, keySignature);

  // 3. Interaction Handlers
  const {
    handleMeasureMouseMove,
    handleMeasureMouseLeave,
    handleMeasureClick,
    cursorStyle,
    isNoteHovered,
    setIsNoteHovered,
  } = useMeasureInteraction({
    hitZones,
    clef,
    scale,
    measureIndex,
    isLast,
    activeDuration,
    previewNote,
    selection,
    pitchRange: layout.pitchRange,
    onHover,
    onAddNote,
  });

  // 4. Ghost Note Logic
  const previewRender = usePreviewRender({
    previewNote,
    events,
    measureIndex,
    isLast,
    clef,
    hitZones,
    eventPositions,
    totalWidth,
    selectedNotes: selection.selectedNotes,
  });

  // 5. Data Preparation
  const beamMap = useMemo(() => {
    const map = {};
    beamGroups.forEach((group) => {
      group.ids.forEach((id) => {
        map[id] = group;
      });
    });
    return map;
  }, [beamGroups]);

  return (
    <g className="Measure" transform={`translate(${startX}, 0)`}>
      {/* LAYER 1: Background & Hit Area */}
      <rect
        data-testid={`measure-hit-area-${layout.staffIndex}-${measureIndex}`}
        x={0}
        y={baseY - 50}
        width={effectiveWidth}
        height={CONFIG.lineHeight * 12}
        fill="transparent"
        style={{ cursor: cursorStyle }}
        onClick={handleMeasureClick}
        onMouseMove={handleMeasureMouseMove}
        onMouseLeave={handleMeasureMouseLeave}
      />
      <StaffLines width={effectiveWidth} theme={theme} baseY={baseY} />

      {/* LAYER 2: Musical Content */}
      {centeredEvents.map((event) => {
        if (event.isRest) {
          const isPlaceholder = event.id === 'rest-placeholder';
          const isSelected = isRestSelected(selection, event, measureIndex, layout.staffIndex);

          return (
            <Rest
              key={event.id}
              {...event}
              baseY={baseY}
              isSelected={isSelected}
              eventId={event.id}
              onClick={
                isPlaceholder
                  ? undefined
                  : (e) => {
                      e.stopPropagation();
                      interaction.onSelectNote(
                        measureIndex,
                        event.id,
                        getFirstNoteId(event),
                        layout.staffIndex,
                        e.metaKey || e.ctrlKey
                      );
                    }
              }
            />
          );
        }

        return (
          <ChordGroup
            key={event.id}
            {...event}
            eventId={event.id}
            beamSpec={beamMap[event.id]}
            layout={layout}
            interaction={interaction}
            measureIndex={measureIndex}
            onNoteHover={setIsNoteHovered}
            accidentalOverrides={accidentalOverrides}
            isGhost={false}
          />
        );
      })}

      {/* LAYER 3: Beams & Tuplets */}
      {beamGroups.map((beam, idx) => (
        <Beam
          key={`beam-${idx}`}
          beam={beam}
          color={isBeamGroupSelected(selection, beam, events, measureIndex) ? theme.accent : theme.score.note}
        />
      ))}

      {tupletGroups.map((tuplet, idx) => (
        <TupletBracket
          key={`tuplet-${idx}`}
          group={tuplet}
          baseY={baseY}
          staffHeight={CONFIG.lineHeight * 4}
          theme={theme}
        />
      ))}

      <MeasureBarLine 
        x={effectiveWidth} 
        baseY={baseY} 
        isLast={isLast} 
        theme={theme} 
      />

      {/* LAYER 4: Interface Overlay (Ghosts) */}
      {previewRender && !isNoteHovered && previewNote && (
        <g style={{ pointerEvents: 'none' }}>
          <GhostPreview
            previewRender={previewRender}
            previewNote={previewNote}
            baseY={baseY}
            layout={layout}
            interaction={interaction}
            measureIndex={measureIndex}
          />
        </g>
      )}
    </g>
  );
};

export default Measure;
