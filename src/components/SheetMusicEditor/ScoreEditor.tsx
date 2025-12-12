// @ts-nocheck
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CONFIG } from './config';
import { ScoreProvider, useScoreContext } from './context/ScoreContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePlayback } from './hooks/usePlayback';
import { useMIDI } from './hooks/useMIDI';
import { useScoreInteraction } from './hooks/useScoreInteraction';
import { ThemeProvider } from './context/ThemeContext';

// Components - Canvas
import ScoreCanvas from './components/Canvas/ScoreCanvas';

// Components - Panels
import ScoreHeader from './components/Panels/ScoreHeader';
import ConfigMenu from './components/Panels/ConfigMenu';
import OutputPanel from './components/Panels/OutputPanel';

// Components - Overlays
import ShortcutsOverlay from './components/Overlays/ShortcutsOverlay';
import ClefOverlay from './components/Overlays/ClefOverlay';
import KeySignatureOverlay from './components/Overlays/KeySignatureOverlay';
import TimeSignatureOverlay from './components/Overlays/TimeSignatureOverlay';
import DropdownOverlay from './components/Overlays/DropdownOverlay';
import ConfirmDialog from './components/Overlays/ConfirmDialog';
import { SetSingleStaffCommand } from './commands/SetSingleStaffCommand';
import { UpdateTitleCommand } from './commands/UpdateTitleCommand';
import { LoadScoreCommand } from './commands/LoadScoreCommand';

// Components - Toolbar
import Toolbar from './components/Toolbar/Toolbar';

// Engines & Utils
import { playNote, InstrumentType, setInstrument, isSamplerLoaded } from './engines/toneEngine';
import { exportToXML } from './exporters/xmlExporter';
import { exportToMIDI } from './exporters/midiExporter';
import { exportToJSON } from './exporters/jsonExporter';
import { getNoteDuration } from './utils/core';
import { useTheme } from './context/ThemeContext'; // This was missed in the provided snippet, but is used later. Re-adding it.
import Portal from './components/Portal'; // This was missed in the provided snippet, but is used later. Re-adding it.
import { getActiveStaff } from './types';
import { MELODIES } from './data/melodies'; // This was missed in the provided snippet, but is used later. Re-adding it.

interface ScoreEditorContentProps {
  scale?: number;
  label?: string;
  showToolbar?: boolean;
  enableKeyboard?: boolean;
  enablePlayback?: boolean;
}

/**
 * Main Sheet Music Editor Component.
 * Manages the state of the musical score, user interactions, playback, and history.
 * @param scale - Zoom scale factor for the editor
 * @param label - Optional label for the editor instance
 * @param showToolbar - Whether to show the toolbar (default: true)
 * @param enableKeyboard - Whether keyboard shortcuts are enabled (default: true)
 * @param enablePlayback - Whether playback controls are available (default: true)
 */
const ScoreEditorContent = ({ 
  scale = 1, 
  label,
  showToolbar = true,
  enableKeyboard = true,
  enablePlayback = true,
}: ScoreEditorContentProps) => {
  const [bpm, setBpm] = useState(120);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const toolbarRef = useRef<ToolbarHandle>(null);
  const [titleBuffer, setTitleBuffer] = useState(""); 
  
  const [errorMsg, setErrorMsg] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isHoveringScore, setIsHoveringScore] = useState(false);
  
  // Instrument selection state
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('bright');
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  
  // Check sampler status periodically
  React.useEffect(() => {
    const checkSampler = () => setSamplerLoaded(isSamplerLoaded());
    checkSampler();
    const interval = setInterval(checkSampler, 500);
    return () => clearInterval(interval);
  }, []);
  
  // State for clef change confirmation dialog
  // State for clef change confirmation dialog
  const scoreContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const scoreLogic = useScoreContext();
  const { 
      score, selection, setSelection, previewNote, setPreviewNote,
      history, redoStack, undo, redo, commitScore, dispatch,
      activeDuration, setActiveDuration, isDotted, setIsDotted,
      activeAccidental, activeTie, 
      handleTimeSignatureChange, handleKeySignatureChange, addMeasure, removeMeasure, setGrandStaff,
      handleMeasureHover, addNoteToMeasure, addChordToMeasure, deleteSelected,
      handleNoteSelection, handleDurationChange, handleDotToggle,
      handleAccidentalToggle, handleTieToggle,
      currentQuantsPerMeasure, scoreRef,
      checkDurationValidity, checkDotValidity, updateNotePitch,
      applyTuplet, removeTuplet, canApplyTuplet, activeTupletRatio,
      togglePickup // Added missing destructive
  } = scoreLogic;

  // Interaction (Click/Drag Handling)
  const { dragState, handleDragStart } = useScoreInteraction({
    scoreRef,
    selection,
    onUpdatePitch: updateNotePitch, // Using updateNotePitch from useNoteActions
    onSelectNote: handleNoteSelection
  });

  const playback = usePlayback(score, bpm);
  const { isPlaying, playbackPosition, playScore, stopPlayback, handlePlayToggle, lastPlayStart } = playback;

  const { midiStatus } = useMIDI(addChordToMeasure, activeDuration, isDotted, activeAccidental, scoreRef);

  // Track modifier key state for cursor changes
  const [modifierHeld, setModifierHeld] = useState(false);
  
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.metaKey || e.ctrlKey) setModifierHeld(true);
      };
      const handleKeyUp = (e: KeyboardEvent) => {
          if (!e.metaKey && !e.ctrlKey) setModifierHeld(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, []);

  // Focus input when editing starts
  useEffect(() => {
      if (isEditingTitle && titleInputRef.current) {
          setTitleBuffer(score.title);
          titleInputRef.current.focus();
          titleInputRef.current.select();
      }
  }, [isEditingTitle, score.title]);

  // State for clef change confirmation dialog (Removed - now in Context)
  // const [pendingClefChange, setPendingClefChange] = useState<{ targetClef: 'treble' | 'bass' } | null>(null);

  // Clef Handler (Removed - now in Context)
  // const handleClefChange = ...
  
  // Handle confirmation for reducing grand staff to single staff
  const handleConfirmClefChange = useCallback(() => {
      // Access from Context
      if (!scoreLogic.pendingClefChange) return;
      dispatch(new SetSingleStaffCommand(scoreLogic.pendingClefChange.targetClef));
      scoreLogic.setPendingClefChange(null);
  }, [scoreLogic.pendingClefChange, dispatch, scoreLogic.setPendingClefChange]);

  const handleCancelClefChange = useCallback(() => {
      scoreLogic.setPendingClefChange(null);
  }, [scoreLogic.setPendingClefChange]);

  // Handle Title Commit
  const handleTitleCommit = () => {
      setIsEditingTitle(false);
      if (titleBuffer !== score.title) {
          dispatch(new UpdateTitleCommand(titleBuffer));
      }
  };

  // --- DRAG LOGIC ---
  // Moved to ScoreCanvas internal logic

  // Keyboard Shortcuts Hook - only active if keyboard is enabled
  useKeyboardShortcuts(
      scoreLogic,
      playback,
      { 
          isEditingTitle, 
          isHoveringScore, 
          scoreContainerRef,
          isAnyMenuOpen: () => (toolbarRef.current?.isMenuOpen() ?? false) || showHelp,
          isDisabled: !enableKeyboard,
      },
      { handleTitleCommit }
  );

  return (
    <div 
      className="backdrop-blur-md p-4 rounded-lg shadow-xl mb-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/50"
      style={{
        backgroundColor: theme.panelBackground,
        borderColor: theme.border,
        borderWidth: '1px',
        color: theme.text
      }}
    >
      <style>{`
        /* Webkit Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: ${theme.border};
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.secondaryText};
        }
        
        /* Firefox Scrollbar Styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${theme.border} transparent;
        }
      `}</style>
      {showToolbar && (
        <Toolbar 
          ref={toolbarRef}
          scoreTitle={score.title}
          label={label}
          isEditingTitle={isEditingTitle}
          onEditingChange={setIsEditingTitle}
          onTitleChange={(newTitle) => dispatch(new UpdateTitleCommand(newTitle))}
          isPlaying={isPlaying}
          onPlayToggle={enablePlayback ? handlePlayToggle : undefined}
          bpm={bpm}
          onBpmChange={setBpm}
          errorMsg={errorMsg}
          onToggleHelp={() => setShowHelp(true)}
          midiStatus={midiStatus}
          melodies={MELODIES}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={(instrument) => {
            setSelectedInstrument(instrument);
            setInstrument(instrument);
          }}
          samplerLoaded={samplerLoaded}
          onEscape={() => {
            // Focus the score container
            scoreContainerRef.current?.focus();
            
            // If no selection, place cursor at end of score
            if (!selection.eventId) {
              const activeStaff = score.staves[selection.staffIndex || 0];
              const lastMeasureIndex = activeStaff.measures.length - 1;
              const lastMeasure = activeStaff.measures[lastMeasureIndex];
              const lastEvent = lastMeasure.events[lastMeasure.events.length - 1];
              if (lastEvent) {
                setSelection({
                  staffIndex: selection.staffIndex || 0,
                  measureIndex: lastMeasureIndex,
                  eventId: lastEvent.id,
                  noteId: lastEvent.notes?.[0]?.id || null,
                  selectedNotes: []
                });
              }
            }
          }}
        />
      )}

      {showHelp && (
        <Portal>
          <ShortcutsOverlay onClose={() => setShowHelp(false)} />
        </Portal>
      )}

      <div className="p-8">
        <div className="mb-4 relative z-20">
            {isEditingTitle ? (
                <input
                    ref={titleInputRef}
                    value={titleBuffer}
                    onChange={(e) => setTitleBuffer(e.target.value)}
                    onBlur={handleTitleCommit}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleCommit()}
                    className="font-bold font-serif text-3xl px-2 py-0 rounded outline-none bg-transparent"
                    style={{ color: theme.text, borderColor: theme.border, borderWidth: '1px' }}
                />
            ) : (
                <h1 
                    onClick={() => setIsEditingTitle(true)}
                    className="font-bold font-serif text-3xl px-2 py-0 rounded hover:bg-white/10 cursor-pointer transition-colors inline-block"
                    style={{ color: theme.text }}
                >
                    {score.title}
                </h1>
            )}
        </div>

        <ScoreCanvas 
            scale={scale}
            playbackPosition={playbackPosition}
            onKeySigClick={() => toolbarRef.current?.openKeySigMenu()}
            onTimeSigClick={() => toolbarRef.current?.openTimeSigMenu()}
            onClefClick={() => toolbarRef.current?.openClefMenu()}
            containerRef={scoreContainerRef}
            onHoverChange={(isHovering) => {
                setIsHoveringScore(isHovering);
                if (!isHovering) {
                    // Only clear if NOT focused
                    const isFocused = document.activeElement === scoreContainerRef.current || scoreContainerRef.current?.contains(document.activeElement);
                    if (!isFocused) {
                        setPreviewNote(null);
                    }
                }
            }}
            onBackgroundClick={() => {
                 setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null });
            }}
        />
      </div>

      <OutputPanel score={score} bpm={bpm} />

      {scoreLogic.pendingClefChange && (
        <Portal>
          <ConfirmDialog
            title="Change to Single Staff?"
            message={`This will remove the ${scoreLogic.pendingClefChange.targetClef === 'treble' ? 'bass' : 'treble'} clef and all its contents.`}
            actions={[
              {
                label: 'Cancel',
                onClick: handleCancelClefChange,
                variant: 'secondary'
              },
              {
                label: `Drop ${pendingClefChange.targetClef === 'treble' ? 'Bass' : 'Treble'} Clef`,
                onClick: handleConfirmClefChange,
                variant: 'danger'
              }
            ]}
            onClose={handleCancelClefChange}
          />
        </Portal>
      )}
    </div>
  );
};

const ScoreEditor = ({ scale = 1, label, initialData }: { scale?: number, label?: string, initialData?: any }) => {
    return (
        <ScoreProvider initialScore={initialData}>
            <ScoreEditorContent scale={scale} label={label} />
        </ScoreProvider>
    );
};

export { ScoreEditorContent };
export default ScoreEditor;
