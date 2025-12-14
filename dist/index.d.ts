import * as react from 'react';
import react__default, { ReactNode } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

declare const THEMES: {
    readonly DARK: {
        accent: "#20B2AA";
        background: "#1e293b";
        panelBackground: "rgba(30, 41, 59, 0.8)";
        text: "#e2e8f0";
        secondaryText: "hsla(215, 20%, 65%, 1.00)";
        border: "rgba(255, 255, 255, 0.1)";
        buttonBackground: "rgba(30, 41, 59, 0.8)";
        buttonHoverBackground: "hsla(218, 33%, 28%, 1.00)";
        score: {
            line: "hsla(215, 16%, 47%, 1.00)";
            note: "#e2e8f0";
            fill: "#e2e8f0";
        };
    };
    readonly COOL: {
        accent: "#22d3ee";
        background: "#0f172a";
        panelBackground: "rgba(15, 23, 42, 0.8)";
        text: "#bfdbfe";
        secondaryText: "#60a5fa";
        border: "rgba(255, 255, 255, 0.1)";
        buttonBackground: "rgba(15, 23, 42, 0.8)";
        buttonHoverBackground: "#1e3a8a";
        score: {
            line: "#60a5fa";
            note: "#bfdbfe";
            fill: "#bfdbfe";
        };
    };
    readonly WARM: {
        accent: "#fb923c";
        background: "#1c1917";
        panelBackground: "rgba(28, 25, 23, 0.8)";
        text: "#e7e5e4";
        secondaryText: "#a8a29e";
        border: "rgba(255, 255, 255, 0.1)";
        buttonBackground: "rgba(28, 25, 23, 0.8)";
        buttonHoverBackground: "#292524";
        score: {
            line: "#78716c";
            note: "#e7e5e4";
            fill: "#e7e5e4";
        };
    };
    readonly LIGHT: {
        accent: "#20B2AA";
        background: string;
        panelBackground: string;
        text: "#1e293b";
        secondaryText: "hsla(215, 16%, 47%, 1.00)";
        border: string;
        buttonBackground: string;
        buttonHoverBackground: string;
        score: {
            line: "hsla(215, 20%, 65%, 1.00)";
            note: string;
            fill: string;
        };
    };
};
type ThemeName = keyof typeof THEMES;
interface Theme {
    accent: string;
    background: string;
    panelBackground: string;
    text: string;
    secondaryText: string;
    border: string;
    buttonBackground: string;
    buttonHoverBackground: string;
    score: {
        line: string;
        note: string;
        fill: string;
    };
}

/**
 * Type definitions for the Sheet Music Editor
 *
 * This file defines the data model for scores, staves, measures, events, and notes.
 * The model supports multiple staves for Grand Staff rendering.
 */
interface Note {
    id: string | number;
    pitch: string | null;
    accidental?: 'sharp' | 'flat' | 'natural' | null;
    tied?: boolean;
    isRest?: boolean;
}
interface ScoreEvent {
    id: string | number;
    duration: string;
    dotted: boolean;
    notes: Note[];
    isRest?: boolean;
    tuplet?: {
        ratio: [number, number];
        groupSize: number;
        position: number;
        baseDuration?: string;
        id?: string;
    };
}
interface Measure {
    id: string | number;
    events: ScoreEvent[];
    isPickup?: boolean;
}
interface Staff {
    id: string | number;
    clef: 'treble' | 'bass' | 'grand';
    keySignature: string;
    measures: Measure[];
}
interface Score {
    title: string;
    timeSignature: string;
    keySignature: string;
    bpm: number;
    staves: Staff[];
}
/**
 * Represents the current selection state in the editor.
 * Supports Grand Staff by tracking which staff is selected.
 */
interface Selection {
    staffIndex: number;
    measureIndex: number | null;
    eventId: string | number | null;
    noteId: string | number | null;
    selectedNotes: Array<{
        staffIndex: number;
        measureIndex: number;
        eventId: string | number;
        noteId: string | number | null;
    }>;
    anchor?: {
        staffIndex: number;
        measureIndex: number;
        eventId: string | number;
        noteId: string | number | null;
    } | null;
}
/**
 * Utility type for allowing partial nested objects
 */
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * Staff template options for score generation
 */
type StaffTemplate = 'grand' | 'treble' | 'bass';
/**
 * Configuration interface for RiffScore component.
 * Supports two modes:
 * - Generator Mode: Pass `staff` + `measureCount` to create blank scores
 * - Render Mode: Pass `staves` array to load existing compositions
 */
/**
 * Configuration interface for RiffScore component.
 * Supports two modes:
 * - Generator Mode: Pass `staff` + `measureCount` to create blank scores
 * - Render Mode: Pass `staves` array to load existing compositions
 */
interface RiffScoreConfig {
    ui: {
        showToolbar: boolean;
        scale: number;
        theme?: ThemeName;
    };
    interaction: {
        isEnabled: boolean;
        enableKeyboard: boolean;
        enablePlayback: boolean;
    };
    score: {
        title: string;
        bpm: number;
        timeSignature: string;
        keySignature: string;
        staff?: StaffTemplate;
        measureCount?: number;
        staves?: Staff[];
    };
}

/**
 * RiffScore Component
 *
 * Configurable React component for rendering and interacting with musical scores.
 * Supports two modes:
 * - Generator Mode: Create blank scores from templates (staff + measureCount)
 * - Render Mode: Load compositions from staves array
 */

interface RiffScoreProps {
    config?: DeepPartial<RiffScoreConfig>;
}
/**
 * RiffScore - Configurable Music Notation Editor
 *
 * @example
 * // Generator Mode - Create blank grand staff with 4 measures
 * <RiffScore config={{ score: { staff: 'grand', measureCount: 4 } }} />
 *
 * @example
 * // Render Mode - Load existing composition
 * <RiffScore config={{ score: { staves: myStaves } }} />
 *
 * @example
 * // Disable all interaction (read-only display)
 * <RiffScore config={{ interaction: { isEnabled: false } }} />
 */
declare const RiffScore: react__default.FC<RiffScoreProps>;

interface ScoreEditorContentProps {
    scale?: number;
    label?: string;
    showToolbar?: boolean;
    enableKeyboard?: boolean;
    enablePlayback?: boolean;
}
declare const ScoreEditorContent: ({ scale, label, showToolbar, enableKeyboard, enablePlayback, }: ScoreEditorContentProps) => react_jsx_runtime.JSX.Element;
declare const ScoreEditor: ({ scale, label, initialData }: {
    scale?: number;
    label?: string;
    initialData?: any;
}) => react_jsx_runtime.JSX.Element;

interface ThemeContextType {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
}
declare const ThemeProvider: react__default.FC<{
    children: react__default.ReactNode;
    initialTheme?: ThemeName;
}>;
declare const useTheme: () => ThemeContextType;

/**
 * Input mode for entry - determines whether canvas clicks create notes or rests.
 */
type InputMode = 'NOTE' | 'REST';

interface Command {
    type: string;
    execute(score: Score): Score;
    undo(score: Score): Score;
}

type EditorState = 'SELECTION_READY' | 'ENTRY_READY' | 'IDLE';

/**
 * Main score logic orchestrator hook.
 * Composes focused hooks for measure, note, modifier, and navigation actions.
 */
declare const useScoreLogic: (initialScore: any) => {
    score: Score;
    selection: Selection;
    editorState: EditorState;
    selectedDurations: string[];
    selectedDots: boolean[];
    selectedTies: boolean[];
    selectedAccidentals: string[];
    setSelection: react.Dispatch<react.SetStateAction<Selection>>;
    previewNote: any;
    setPreviewNote: react.Dispatch<any>;
    history: Command[];
    redoStack: Command[];
    undo: () => void;
    redo: () => void;
    dispatch: (command: Command) => void;
    activeDuration: string;
    setActiveDuration: react.Dispatch<react.SetStateAction<string>>;
    isDotted: boolean;
    setIsDotted: react.Dispatch<react.SetStateAction<boolean>>;
    activeAccidental: "sharp" | "flat" | "natural" | null;
    activeTie: boolean;
    inputMode: InputMode;
    setInputMode: react.Dispatch<react.SetStateAction<InputMode>>;
    toggleInputMode: () => void;
    handleTimeSignatureChange: (newSig: string) => void;
    handleKeySignatureChange: (newKey: string) => void;
    addMeasure: () => void;
    removeMeasure: () => void;
    togglePickup: () => void;
    setGrandStaff: () => void;
    handleMeasureHover: (measureIndex: number | null, hit: any, pitch: string, staffIndex?: number) => void;
    addNoteToMeasure: (measureIndex: number, newNote: any, shouldAutoAdvance?: boolean, placementOverride?: any) => void;
    addChordToMeasure: (measureIndex: number, notes: any[], duration: string, dotted: boolean) => void;
    deleteSelected: () => void;
    handleNoteSelection: (measureIndex: number, eventId: string | number, noteId: string | number | null, staffIndex?: number, isMulti?: boolean, selectAllInEvent?: boolean, isShift?: boolean) => void;
    handleDurationChange: (newDuration: string) => void;
    handleDotToggle: () => void;
    handleAccidentalToggle: (type: "flat" | "natural" | "sharp" | null) => void;
    handleTieToggle: () => void;
    currentQuantsPerMeasure: number;
    scoreRef: react.RefObject<Score>;
    checkDurationValidity: (targetDuration: string) => boolean;
    checkDotValidity: () => boolean;
    updateNotePitch: (measureIndex: number, eventId: string | number, noteId: string | number, newPitch: string) => void;
    applyTuplet: (ratio: [number, number], groupSize: number) => boolean;
    removeTuplet: () => boolean;
    canApplyTuplet: (groupSize: number) => boolean;
    activeTupletRatio: [number, number] | null;
    transposeSelection: (direction: string, isShift: boolean) => void;
    moveSelection: (direction: string, isShift: boolean) => void;
    switchStaff: (direction: "up" | "down") => void;
    focusScore: () => void;
};

type ScoreContextType = ReturnType<typeof useScoreLogic> & {
    pendingClefChange: {
        targetClef: 'treble' | 'bass';
    } | null;
    setPendingClefChange: react__default.Dispatch<react__default.SetStateAction<{
        targetClef: 'treble' | 'bass';
    } | null>>;
    handleClefChange: (val: string) => void;
};
declare const useScoreContext: () => ScoreContextType;
interface ScoreProviderProps {
    children: ReactNode;
    initialScore?: any;
}
declare const ScoreProvider: react__default.FC<ScoreProviderProps>;

declare const ConfigMenu: () => react_jsx_runtime.JSX.Element;

export { ConfigMenu, type Measure, type Note, RiffScore, type RiffScoreConfig, type Score, ScoreEditor, ScoreEditorContent, type ScoreEvent, ScoreProvider, type Selection, type Staff, ThemeProvider, useScoreContext, useTheme };
