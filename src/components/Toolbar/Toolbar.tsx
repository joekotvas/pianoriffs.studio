import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';

// Contexts & Types
import { useTheme } from '@/context/ThemeContext';
import { useScoreContext } from '@/context/ScoreContext';
import { Melody, getActiveStaff } from '@/types';
import { InstrumentType } from '@/engines/toneEngine';

// Hooks & Commands
import { useFocusTrap } from '@/hooks/layout';
import { ToggleRestCommand } from '@/commands/ToggleRestCommand';
import { LoadScoreCommand } from '@/commands/LoadScoreCommand';

// UI Components
import StaffControls, { StaffControlsHandle } from './StaffControls';
import DurationControls from './DurationControls';
import ModifierControls from './ModifierControls';
import AccidentalControls from './AccidentalControls';
import MeasureControls from './MeasureControls';
import TupletControls from './TupletControls';
import MelodyLibrary from './MelodyLibrary';
import ToolbarButton from './ToolbarButton';
import InputModeToggle from './InputModeToggle';
import FileMenu from './FileMenu';
import HistoryControls from './HistoryControls';
import PlaybackControls from './PlaybackControls';
// import MidiControls from './MidiControls';
import Divider from './Divider';
import { DropdownTrigger } from './Menus/DropdownOverlay';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToolbarProps {
  // Metadata
  scoreTitle: string;
  label?: string;
  isEditingTitle: boolean;
  onEditingChange: (isEditing: boolean) => void;
  onTitleChange: (title: string) => void;

  // Playback & System
  isPlaying: boolean;
  onPlayToggle?: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  errorMsg: string | null;
  onToggleHelp: () => void;
  onEscape?: () => void;

  // MIDI / Audio
  midiStatus: { connected: boolean; deviceName: string | null; error: string | null };
  samplerLoaded: boolean;
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;

  // Data
  melodies: Melody[];
}

export interface ToolbarHandle {
  openKeySigMenu: () => void;
  openTimeSigMenu: () => void;
  openClefMenu: () => void;
  isMenuOpen: () => boolean;
}

const TOP_ROW_HEIGHT = 'h-9';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Toolbar = forwardRef<ToolbarHandle, ToolbarProps>(
  (
    {
      isPlaying,
      onPlayToggle,
      bpm,
      onBpmChange,
      errorMsg,
      onToggleHelp,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      midiStatus = { connected: false, deviceName: null, error: null },
      melodies,
      selectedInstrument,
      onInstrumentChange,
      samplerLoaded,
      onEscape,
    },
    ref
  ) => {
    // -- Local State & Refs --
    const { theme } = useTheme();
    const staffControlsRef = useRef<StaffControlsHandle>(null);
    const melodyLibBtnRef = useRef<HTMLButtonElement>(null);
    const toolbarContainerRef = useRef<HTMLDivElement>(null);

    const [showLibrary, setShowLibrary] = useState(false);
    const [isToolbarFocused, setIsToolbarFocused] = useState(false);

    // -- Score Context (Grouped API) --
    const ctx = useScoreContext();

    // 1. Core Data
    const { score, selection, editorState } = ctx.state;
    const { dispatch } = ctx.engines;
    const { inputMode, toggleInputMode } = ctx.tools;

    // 2. History
    const { history, redoStack } = ctx.state;
    const { undo, redo } = ctx.historyAPI;

    // 3. Duration & Rhythms
    const { activeDuration, isDotted, activeTie } = ctx.tools;
    const {
      duration: handleDurationChange,
      dot: handleDotToggle,
      tie: handleTieToggle,
      checkDurationValidity,
      checkDotValidity,
    } = ctx.modifiers;
    const { selectedDurations, selectedDots, selectedTies } = ctx.derived;

    // 4. Pitch & Accidentals
    const { activeAccidental } = ctx.tools;
    const { accidental: handleAccidentalToggle } = ctx.modifiers;
    const { selectedAccidentals } = ctx.derived;

    // 5. Structure (Measures, Staff)
    const {
      add: addMeasure,
      remove: removeMeasure,
      togglePickup,
      setTimeSignature: handleTimeSignatureChange,
      setKeySignature: handleKeySignatureChange,
    } = ctx.measures;
    const { handleClefChange } = ctx; // Get from ScoreContext which has proper clef handling logic

    // 6. Advanced (Tuplets)
    const {
      apply: applyTuplet,
      remove: removeTuplet,
      canApply: canApplyTuplet,
      activeRatio: activeTupletRatio,
    } = ctx.tuplets;

    // -- Handlers --

    const handleInputModeClick = () => {
      const hasSelection = selection?.selectedNotes && selection.selectedNotes.length > 0;
      if (hasSelection) {
        dispatch(new ToggleRestCommand(selection));
      } else {
        toggleInputMode();
      }
    };

    const handleMelodySelect = (melody: Melody) => {
      dispatch(new LoadScoreCommand(melody.score));
      setShowLibrary(false);
    };

    // -- Derived Logic --

    // eslint-disable-next-line react-hooks/refs
    const isAnyMenuOpen = showLibrary || (staffControlsRef.current?.isMenuOpen() ?? false);
    const activeStaff = getActiveStaff(score);

    useImperativeHandle(
      ref,
      () => ({
        openTimeSigMenu: () => staffControlsRef.current?.openTimeSigMenu(),
        openKeySigMenu: () => staffControlsRef.current?.openKeySigMenu(),
        openClefMenu: () => staffControlsRef.current?.openClefMenu(),
        isMenuOpen: () => isAnyMenuOpen,
      }),
      [isAnyMenuOpen]
    );

    useFocusTrap({
      containerRef: toolbarContainerRef,
      isActive: isToolbarFocused && !isAnyMenuOpen,
      onEscape: () => {
        setIsToolbarFocused(false);
        onEscape?.();
      },
      autoFocus: false,
      enableArrowKeys: false,
    });

    // -- Render --

    return (
      <div
        ref={toolbarContainerRef}
        className="flex flex-col gap-2 mb-4 border-b pb-2"
        style={{ borderColor: theme.border }}
        onFocus={() => setIsToolbarFocused(true)}
        onBlur={(e) => {
          if (!toolbarContainerRef.current?.contains(e.relatedTarget as Node)) {
            setIsToolbarFocused(false);
          }
        }}
      >
        {/* -----------------------------------------------------------
          ROW 1: System / File / Playback / MIDI / Library
      ------------------------------------------------------------ */}
        <div className="row flex items-center gap-4">
          <FileMenu score={score} bpm={bpm} height={TOP_ROW_HEIGHT} variant="ghost" />

          <Divider />

          <HistoryControls
            canUndo={history.length > 0}
            onUndo={undo}
            canRedo={redoStack.length > 0}
            onRedo={redo}
            height={TOP_ROW_HEIGHT}
            variant="ghost"
          />

          <Divider />

          <PlaybackControls
            isPlaying={isPlaying}
            onPlayToggle={onPlayToggle}
            bpm={bpm}
            onBpmChange={onBpmChange}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={onInstrumentChange}
            samplerLoaded={samplerLoaded}
            height={TOP_ROW_HEIGHT}
            variant="ghost"
          />

          <Divider />

          {/* Library Menu */}
          <div className="flex gap-1 relative">
            <DropdownTrigger
              ref={melodyLibBtnRef}
              label="Library"
              icon={<BookOpen size={14} />}
              isOpen={showLibrary}
              onClick={() => setShowLibrary(!showLibrary)}
              height={TOP_ROW_HEIGHT}
            />
            {showLibrary && (
              /* eslint-disable react-hooks/refs */
              <MelodyLibrary
                melodies={melodies}
                onSelectMelody={handleMelodySelect}
                onClose={() => setShowLibrary(false)}
                position={{
                  x: (melodyLibBtnRef.current?.getBoundingClientRect().right || 0) - 256,
                  y: (melodyLibBtnRef.current?.getBoundingClientRect().bottom || 0) + 5,
                }}
                triggerRef={melodyLibBtnRef as React.RefObject<HTMLElement>}
              />
              /* eslint-enable react-hooks/refs */
            )}
          </div>
          {/* 
        <Divider />

        <MidiControls
          midiStatus={midiStatus}
          selectedInstrument={selectedInstrument}
          onInstrumentChange={onInstrumentChange}
          samplerLoaded={samplerLoaded}
          height={TOP_ROW_HEIGHT}
          variant="ghost"
        />
 */}
          {/* Spacer */}
          <div className="flex-1"></div>

          <ToolbarButton
            onClick={onToggleHelp}
            label="Keyboard Shortcuts"
            icon={<HelpCircle size={18} />}
            preventFocus={true}
            height={TOP_ROW_HEIGHT}
            variant="ghost"
          />
        </div>

        <Divider orientation="horizontal" />

        {/* -----------------------------------------------------------
          ROW 2: Notation / Editing Controls
      ------------------------------------------------------------ */}
        <div className="row flex items-center gap-4 flex-wrap">
          <StaffControls
            ref={staffControlsRef}
            clef={score.staves.length >= 2 ? 'grand' : activeStaff.clef || 'treble'}
            onClefChange={handleClefChange}
            keySignature={score.keySignature || activeStaff.keySignature}
            onKeySignatureChange={handleKeySignatureChange}
            timeSignature={score.timeSignature}
            onTimeSignatureChange={handleTimeSignatureChange}
            variant="ghost"
          />

          <Divider />

          <InputModeToggle mode={inputMode} onToggle={handleInputModeClick} variant="ghost" />

          <DurationControls
            activeDuration={activeDuration}
            onDurationChange={handleDurationChange}
            isDurationValid={checkDurationValidity}
            selectedDurations={selectedDurations}
            editorState={editorState}
            inputMode={inputMode}
            variant="ghost"
          />

          <Divider />

          <ModifierControls
            isDotted={isDotted}
            onDotToggle={handleDotToggle}
            activeTie={activeTie}
            onToggleTie={handleTieToggle}
            isDotValid={checkDotValidity()}
            selectedDots={selectedDots}
            selectedTies={selectedTies}
            editorState={editorState}
            variant="ghost"
          />

          <Divider />

          <AccidentalControls
            activeAccidental={activeAccidental}
            onToggleAccidental={handleAccidentalToggle}
            selectedAccidentals={selectedAccidentals}
            editorState={editorState}
            variant="ghost"
          />

          <Divider />

          <TupletControls
            onApplyTuplet={applyTuplet}
            onRemoveTuplet={removeTuplet}
            canApplyTriplet={canApplyTuplet(3)}
            canApplyQuintuplet={canApplyTuplet(5)}
            activeTupletRatio={activeTupletRatio}
            variant="ghost"
          />

          {/* Spacer */}
          {/* <div className="flex-1"></div> */}

          <MeasureControls
            onAddMeasure={addMeasure}
            onRemoveMeasure={removeMeasure}
            onTogglePickup={togglePickup}
            isPickup={activeStaff.measures[0]?.isPickup}
            variant="ghost"
          />
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="w-full text-red-600 text-xs mt-2 font-bold animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';

export default Toolbar;
