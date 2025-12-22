import React, { useRef, useState, useCallback } from 'react';

// Contexts
import { ScoreProvider, useScoreContext } from '@context/ScoreContext';
import { useTheme } from '@context/ThemeContext';

// Hooks
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';
import { usePlayback } from '@hooks/usePlayback';
import { useMIDI } from '@hooks/useMIDI';
import { useScoreInteraction } from '@hooks/useScoreInteraction';
import { useSamplerStatus } from '@hooks/useSamplerStatus';
// import { useModifierKeys } from '@hooks/useModifierKeys';
import { useTitleEditor } from '@hooks/useTitleEditor';

// Components
import ScoreCanvas from '@components/Canvas/ScoreCanvas';
import Toolbar, { ToolbarHandle } from '@components/Toolbar/Toolbar';
import { ScoreTitleField } from '@components/Layout/ScoreTitleField';
import ShortcutsOverlay from '@components/Layout/Overlays/ShortcutsOverlay';
import ConfirmDialog from '@components/Layout/Overlays/ConfirmDialog';
import Portal from '@components/Layout/Portal';

// Commands
import { SetSingleStaffCommand } from '@commands/SetSingleStaffCommand';
import { UpdateTitleCommand } from '@commands/UpdateTitleCommand';

// Engines & Data
import { setInstrument, InstrumentType } from '@engines/toneEngine';
import { MELODIES } from '@/data/melodies';

// ------------------------------------------------------------------
// Props Interface
// ------------------------------------------------------------------

interface ScoreEditorContentProps {
  scale?: number;
  label?: string;
  showToolbar?: boolean;
  enableKeyboard?: boolean;
  enablePlayback?: boolean;
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

const ScoreEditorContent = ({
  scale = 1,
  label,
  showToolbar = true,
  enableKeyboard = true,
  enablePlayback = true,
}: ScoreEditorContentProps) => {
  // --- Context & Theme ---
  const { theme } = useTheme();
  const scoreLogic = useScoreContext();
  
  // Grouped API destructuring
  const { score, selection } = scoreLogic.state;
  const { dispatch, scoreRef } = scoreLogic.engines;
  const { activeDuration, isDotted, activeAccidental } = scoreLogic.tools;
  const { select: handleNoteSelection, focus: focusScore } = scoreLogic.navigation;
  const { addChord: addChordToMeasure, updatePitch: updateNotePitch } = scoreLogic.entry;
  const { clearSelection, setPreviewNote } = scoreLogic;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { pendingClefChange, setPendingClefChange } = scoreLogic as any; // UI state from context

  // --- Local UI State ---
  const [bpm, setBpm] = useState(120);
  const [showHelp, setShowHelp] = useState(false);
  const [isHoveringScore, setIsHoveringScore] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('bright');
  // Error state temporarily disabled/unused
  // const [errorMsg, setErrorMsg] = useState(null);
  const errorMsg = null;

  // --- Refs ---
  const toolbarRef = useRef<ToolbarHandle>(null);
  const scoreContainerRef = useRef<HTMLDivElement>(null);

  // --- Extracted Hooks ---
  const samplerLoaded = useSamplerStatus();
  // const modifierHeld = useModifierKeys(); // Unused
  const titleEditor = useTitleEditor(score.title, dispatch);

  // --- Complex Hooks ---
  const playback = usePlayback(score, bpm);
  const { midiStatus } = useMIDI(
    addChordToMeasure,
    activeDuration,
    isDotted,
    activeAccidental,
    scoreRef
  );

  useScoreInteraction({
    scoreRef,
    selection,
    onUpdatePitch: updateNotePitch,
    onSelectNote: (
      measureIndex,
      eventId,
      noteId,
      staffIndex,
      isMulti,
      selectAllInEvent,
      isShift
    ) => {
      if (measureIndex !== null && eventId !== null) {
        handleNoteSelection(
          measureIndex,
          eventId,
          noteId,
          staffIndex,
          isMulti,
          selectAllInEvent,
          isShift
        );
      }
    },
  });

  useKeyboardShortcuts(
    scoreLogic,
    playback,
    {
      isEditingTitle: titleEditor.isEditing,
      isHoveringScore,
      scoreContainerRef,
      isAnyMenuOpen: () => (toolbarRef.current?.isMenuOpen() ?? false) || showHelp,
      isDisabled: !enableKeyboard,
    },
    { handleTitleCommit: titleEditor.commit }
  );

  // --- Event Handlers ---
  const handleInstrumentChange = useCallback((instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
    setInstrument(instrument);
  }, []);

  const handleEscape = useCallback(() => {
    setTimeout(() => scoreContainerRef.current?.focus(), 0);
    focusScore();
  }, [focusScore]);

  const handleClefConfirm = useCallback(() => {
    if (!pendingClefChange) return;
    dispatch(new SetSingleStaffCommand(pendingClefChange.targetClef));
    setPendingClefChange(null);
  }, [pendingClefChange, dispatch, setPendingClefChange]);

  const handleBackgroundClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleHoverChange = useCallback(
    (isHovering: boolean) => {
      setIsHoveringScore(isHovering);
      if (!isHovering) {
        const isFocused =
          document.activeElement === scoreContainerRef.current ||
          scoreContainerRef.current?.contains(document.activeElement);
        if (!isFocused) setPreviewNote(null);
      }
    },
    [setPreviewNote]
  );

  // --- Render ---
  return (
    <div
      className="ScoreEditor backdrop-blur-md rounded-lg shadow-xl mb-8"
      style={{
        padding: '.5rem',
        backgroundColor: theme.panelBackground,
        borderColor: theme.border,
        borderWidth: '1px',
        color: theme.text,
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.border} transparent`,
      }}
    >
      {showToolbar && (
        <Toolbar
          ref={toolbarRef}
          label={label}
          scoreTitle={score.title}
          isEditingTitle={titleEditor.isEditing}
          onEditingChange={titleEditor.setIsEditing}
          onTitleChange={(t) => dispatch(new UpdateTitleCommand(t))}
          isPlaying={playback.isPlaying}
          onPlayToggle={enablePlayback ? playback.handlePlayToggle : undefined}
          bpm={bpm}
          onBpmChange={setBpm}
          midiStatus={midiStatus}
          melodies={MELODIES}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={handleInstrumentChange}
          samplerLoaded={samplerLoaded}
          errorMsg={errorMsg}
          onToggleHelp={() => setShowHelp(true)}
          onEscape={handleEscape}
        />
      )}

      {showHelp && (
        <Portal>
          <ShortcutsOverlay onClose={() => setShowHelp(false)} />
        </Portal>
      )}

      <div
        className="score-editor-content"
        style={{
          backgroundColor: theme.background,
          borderRadius: '1rem',
          paddingTop: '1rem',
        }}
      >
        <div className="relative z-20">
          <ScoreTitleField
            title={score.title}
            isEditing={titleEditor.isEditing}
            setIsEditing={titleEditor.setIsEditing}
            buffer={titleEditor.buffer}
            setBuffer={titleEditor.setBuffer}
            commit={titleEditor.commit}
            inputRef={titleEditor.inputRef}
            theme={theme}
            scale={scale}
          />
        </div>

        <ScoreCanvas
          scale={scale}
          playbackPosition={playback.playbackPosition}
          containerRef={scoreContainerRef}
          onHoverChange={handleHoverChange}
          onBackgroundClick={handleBackgroundClick}
          onKeySigClick={() => toolbarRef.current?.openKeySigMenu()}
          onTimeSigClick={() => toolbarRef.current?.openTimeSigMenu()}
          onClefClick={() => toolbarRef.current?.openClefMenu()}
        />
      </div>

      {pendingClefChange && (
        <Portal>
          <ConfirmDialog
            title="Change to Single Staff?"
            message={`This will remove the ${pendingClefChange.targetClef === 'treble' ? 'bass' : 'treble'} clef and all its contents.`}
            actions={[
              { label: 'Cancel', onClick: () => setPendingClefChange(null), variant: 'secondary' },
              {
                label: `Drop ${pendingClefChange.targetClef === 'treble' ? 'Bass' : 'Treble'} Clef`,
                onClick: handleClefConfirm,
                variant: 'danger',
              },
            ]}
            onClose={() => setPendingClefChange(null)}
          />
        </Portal>
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// Wrapper with Provider
// ------------------------------------------------------------------

const ScoreEditor = ({
  scale = 1,
  label,
  initialData,
}: {
  scale?: number;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}) => {
  return (
    <ScoreProvider initialScore={initialData}>
      <ScoreEditorContent scale={scale} label={label} />
    </ScoreProvider>
  );
};

export { ScoreEditorContent };
export default ScoreEditor;
