import React, { useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import MainControls from './MainControls';
import StaffControls, { StaffControlsHandle } from './StaffControls';

import DurationControls from './DurationControls';
import ModifierControls from './ModifierControls';
import AccidentalControls from './AccidentalControls';
import MeasureControls from './MeasureControls';
import TupletControls from './TupletControls';
import MelodyLibrary from './MelodyLibrary';
import ToolbarButton from './ToolbarButton';
import InputModeToggle from './InputModeToggle';
import { Melody, getActiveStaff } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen } from 'lucide-react';
import { useScoreContext } from '@/context/ScoreContext';
import { UpdateTitleCommand } from '@/commands/UpdateTitleCommand';
import { ToggleRestCommand } from '@/commands/ToggleRestCommand';
import { useFocusTrap } from '@/hooks/useFocusTrap';

import { LoadScoreCommand } from '@/commands/LoadScoreCommand';
import { InstrumentType } from '@/engines/toneEngine';

interface ToolbarProps {
  scoreTitle: string; // Keep for now as it might be passed from outside or local buffer
  label?: string;
  isEditingTitle: boolean;
  onEditingChange: (isEditing: boolean) => void;
  onTitleChange: (title: string) => void; // Keep for now
  
  // Playback props - these are local to ScoreEditor (usePlayback), so pass them in
  isPlaying: boolean;
  onPlayToggle?: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  
  errorMsg: string | null;
  onToggleHelp: () => void;
  
  midiStatus: { connected: boolean; deviceName: string | null; error: string | null };
  melodies: Melody[];
  
  // Instrument selection
  selectedInstrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;
  samplerLoaded: boolean;
  
  // Focus return
  onEscape?: () => void;
}

export interface ToolbarHandle {
  openKeySigMenu: () => void;
  openTimeSigMenu: () => void;
  openClefMenu: () => void;
  isMenuOpen: () => boolean;
}

/**
 * Toolbar component for the Sheet Music Editor.
 * Contains controls for playback, duration selection, BPM, title editing, and history (undo/redo).
 */
const TOP_ROW_HEIGHT = "h-9";

const Toolbar = forwardRef<ToolbarHandle, ToolbarProps>(({
  scoreTitle,
  label,
  isEditingTitle,
  onEditingChange,
  onTitleChange,
  isPlaying,
  onPlayToggle,
  bpm,
  onBpmChange,
  errorMsg,
  onToggleHelp,
  midiStatus = { connected: false, deviceName: null, error: null },
  melodies,
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  onEscape
}, ref) => {
  const staffControlsRef = useRef<StaffControlsHandle>(null);
  const melodyLibBtnRef = useRef<HTMLButtonElement>(null);
  const toolbarContainerRef = useRef<HTMLDivElement>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isToolbarFocused, setIsToolbarFocused] = useState(false);
  const { theme } = useTheme();

  // Consume Score Context
  const {
      score, selection, // Added selection
      activeDuration, handleDurationChange, checkDurationValidity,
      isDotted, handleDotToggle, checkDotValidity,
      activeAccidental, handleAccidentalToggle,
      activeTie, handleTieToggle,
      history, undo, redoStack, redo,
      addMeasure, removeMeasure, togglePickup,
      handleTimeSignatureChange, handleKeySignatureChange,
      handleClefChange,
      dispatch, applyTuplet, removeTuplet, canApplyTuplet, activeTupletRatio,
      selectedDurations, editorState, selectedDots, selectedTies, selectedAccidentals,
      inputMode, setInputMode, toggleInputMode // Added toggleInputMode
  } = useScoreContext();

  // Handler for Input Mode Toggle (Matches 'R' key behavior)
  const handleInputModeClick = () => {
      // Logic mirrors handleMutation.ts 'R' key handler
      const hasSelection = selection?.selectedNotes && selection.selectedNotes.length > 0;
      
      if (hasSelection) {
          dispatch(new ToggleRestCommand(selection));
      } else {
          toggleInputMode();
      }
  };

  useImperativeHandle(ref, () => ({
    openTimeSigMenu: () => staffControlsRef.current?.openTimeSigMenu(),
    openKeySigMenu: () => staffControlsRef.current?.openKeySigMenu(),
    openClefMenu: () => staffControlsRef.current?.openClefMenu(),
    isMenuOpen: () => showLibrary || (staffControlsRef.current?.isMenuOpen() ?? false)
  }), [showLibrary]);

  const handleMelodySelect = (melody: Melody) => {
      dispatch(new LoadScoreCommand(melody.score));
      setShowLibrary(false);
  };

  // Track if any menu is open (dropdown menus handle their own focus trap)
  const isAnyMenuOpen = showLibrary || (staffControlsRef.current?.isMenuOpen() ?? false);
  
  // Focus trap for toolbar navigation - only active when toolbar has focus and no menus are open
  useFocusTrap({
    containerRef: toolbarContainerRef,
    isActive: isToolbarFocused && !isAnyMenuOpen,
    onEscape: () => {
      setIsToolbarFocused(false);
      onEscape?.();
    },
    autoFocus: false, // Don't auto-focus first element
    enableArrowKeys: false // Use Tab only for toolbar navigation
  });

  const activeStaff = getActiveStaff(score);

  return (
    <div 
      ref={toolbarContainerRef}
      className="flex flex-col gap-2 mb-4 border-b pb-2"
      style={{ borderColor: theme.border }}
      onFocus={() => setIsToolbarFocused(true)}
      onBlur={(e) => {
        // Only deactivate if focus leaves the toolbar entirely
        if (!toolbarContainerRef.current?.contains(e.relatedTarget as Node)) {
          setIsToolbarFocused(false);
        }
      }}
    >
      {/* Row 1: Play, Undo/Redo, BPM, MIDI, Melody Library, Help */}
      <MainControls 
        scoreTitle={scoreTitle}
        isEditingTitle={isEditingTitle}
        onEditingChange={onEditingChange}
        onTitleChange={onTitleChange}
        isPlaying={isPlaying}
        onPlayToggle={onPlayToggle}
        bpm={bpm}
        onBpmChange={onBpmChange}
        midiStatus={midiStatus}
        onToggleHelp={onToggleHelp}
        canUndo={history.length > 0}
        onUndo={undo}
        canRedo={redoStack.length > 0}
        onRedo={redo}
        selectedInstrument={selectedInstrument}
        onInstrumentChange={onInstrumentChange}
        samplerLoaded={samplerLoaded}
        score={score}
        rowHeight={TOP_ROW_HEIGHT}
        buttonVariant="ghost"
      >
        <div className="flex gap-1 relative">
          <ToolbarButton 
            ref={melodyLibBtnRef}
            onClick={() => setShowLibrary(!showLibrary)}
            label="Melody Library"
            icon={<BookOpen size={18} />}
            isActive={showLibrary}
            preventFocus={true}
            showLabel={true}
            isEmphasized={!showLibrary}
            height={TOP_ROW_HEIGHT}
            variant="ghost"
          />
          {showLibrary && (
            <MelodyLibrary 
              melodies={melodies}
              onSelectMelody={handleMelodySelect}
              onClose={() => setShowLibrary(false)}
              position={{ 
                  x: (melodyLibBtnRef.current?.getBoundingClientRect().right || 0) - 256, // Align right edge
                  y: (melodyLibBtnRef.current?.getBoundingClientRect().bottom || 0) + 5
              }}
              triggerRef={melodyLibBtnRef as React.RefObject<HTMLElement>}
            />
          )}
        </div>
      </MainControls>

      <div className="w-full h-px" style={{ backgroundColor: theme.border }}></div>

      {/* Row 2: Note Durations, Modifiers, Accidentals, Undo/Redo, Measure Tools */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Staff Selection & Signatures */}
        <StaffControls
          ref={staffControlsRef}
          clef={score.staves.length >= 2 ? 'grand' : (activeStaff.clef || 'treble')}
          onClefChange={handleClefChange}
          keySignature={score.keySignature || activeStaff.keySignature}
          onKeySignatureChange={handleKeySignatureChange}
          timeSignature={score.timeSignature}
          onTimeSignatureChange={handleTimeSignatureChange}
          variant="ghost"
        />

        <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

        {/* Input Mode Toggle (Note/Rest) */}
        <InputModeToggle 
          mode={inputMode} 
          onToggle={handleInputModeClick} 
          variant="ghost"
        />

        {/* Duration Buttons */}
        <DurationControls 
          activeDuration={activeDuration}
          onDurationChange={handleDurationChange}
          isDurationValid={checkDurationValidity}
          selectedDurations={selectedDurations}
          editorState={editorState}
          inputMode={inputMode}
          variant="ghost"
        />

        <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

        {/* Modifiers: Dot, Tie */}
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

        <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

        {/* Accidentals */}
        <AccidentalControls 
          activeAccidental={activeAccidental}
          onToggleAccidental={handleAccidentalToggle}
          selectedAccidentals={selectedAccidentals}
          editorState={editorState}
          variant="ghost"
        />

        <div className="w-px h-6" style={{ backgroundColor: theme.border }}></div>

        {/* Tuplets */}
        <TupletControls 
          onApplyTuplet={applyTuplet}
          onRemoveTuplet={removeTuplet}
          canApplyTriplet={canApplyTuplet(3)}
          canApplyQuintuplet={canApplyTuplet(5)}
          activeTupletRatio={activeTupletRatio}
          variant="ghost"
        />

        <div className="flex-1"></div>
        {/* Measure Tools */}
        <MeasureControls 
          onAddMeasure={addMeasure}
          onRemoveMeasure={removeMeasure}
          onTogglePickup={togglePickup}
          isPickup={activeStaff.measures[0]?.isPickup}
          variant="ghost"
        />
      </div>
      
      {errorMsg && (
        <div className="w-full text-red-600 text-xs mt-2 font-bold animate-pulse">⚠️ {errorMsg}</div>
      )}
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
