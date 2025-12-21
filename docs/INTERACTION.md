[← Back to README](../README.md)

# RiffScore Interaction Design Guide

> An intuitive, embeddable sheet music editor for common notation tasks—without the complexity of professional engraving software.

> **See also**: [Keyboard Navigation](./KEYBOARD_NAVIGATION.md) • [Selection Model](./SELECTION.md) • [API Reference](./API.md)

---

## 1. Core Design Philosophy

Our interaction model minimizes cognitive load through four key principles.

### 🏛️ 1. Context-Aware Intent
The editor infers whether the user intends to **Create** or **Modify** based on context.

-   **The "Ghost" Indicator**: Moving through empty space displays a semi-transparent preview (Ghost Note or Rest), indicating readiness to place a new event.
-   **The "Selection" Highlight**: Interacting with existing music removes the Ghost and highlights objects, indicating readiness to edit.

> **Design Rationale**: By making these states visually distinct but automatically switched, we remove the need for explicit "Mode Switching" tools (e.g., separate Pencil vs. Selection tools).

### 🌊 2. Iterative Flow
Composition is an iterative process. The system supports this by being forgiving and maintaining momentum.

-   **Non-Blocking Actions**: If a requested duration change is invalid for a specific note context, the system fails silently for that instance while continuing to process valid changes in the selection.
-   **Smart Snap**: Input is quantized to valid rhythmic lines and spaces, ensuring the score remains syntactically valid.

### 🎹 3. Input Modalities
The system treats both mouse and keyboard as primary input methods.

-   **Mouse**: Efficient for discovery, non-linear editing, and selection.
-   **Keyboard**: Optimized for speed and linear, rhythmic entry.
-   **Hybrid**: Allows clicking to set position, then typing to continue entry.

### 😶 4. Rest Handling
Rests are treated as rhythmic events with interactions parallel to notes.

-   **Parity**: Actions available for notes (select, delete, change duration, copy) are available for rests.
-   **Toggle-Based**: Switching between Note and Rest modes is a simple toggle (`R`), preserving rhythmic values while changing the event type.

---

## 2. Visual Language

| Element | Visual Style | Meaning |
| :--- | :--- | :--- |
| **Ghost Event** | Semi-transparent (50% opacity) | **Prediction**. Indicates what will be added upon commit. Adapts to Note or Rest mode. |
| **Selection** | **Highlighted** (Theme Accent) | **Target**. Indicates items affected by commands (transpose, delete, etc.). |
| **Lasso** | Blue rectangle overlay | **Multi-select**. Drag to select multiple notes at once. |
| **Input Mode** | Cursor Icon / Toolbar State | **Context**. Determines if the Ghost Event creates a Note or a Rest. |
| **Hit Zone** | (Invisible) Vertical measure slices | **Fuzziness**. Allows clicking near a beat to select it, improving usability. |

---

## 3. Editor States

The editor transitions between the following states:

### 1. IDLE (Navigation)
-   **Trigger**: Click background or press `Esc`.
-   **Behavior**: No active focus. Safe for viewing layout.
-   **Visuals**: Standard cursor.

### 2. ENTRY READY (Creation)
-   **Trigger**: Hover over measures or press Enter in input mode.
-   **Behavior**: The **Ghost Event** tracks the cursor position.
-   **Input Modes**:
    -   **NOTE Mode**: Ghost is a pitched note (Y-position dependent).
    -   **REST Mode**: Ghost is a rest (Y-position independent).
-   **Action**: Clicking or pressing Enter **commits** the ghost to the score and **auto-advances** to the next rhythmic slot.

### 3. SELECTION READY (Modification)
-   **Trigger**: Click an existing note/rest or navigate via keyboard.
-   **Behavior**: One or more elements are highlighted.
-   **Action**: Commands (Delete, Transpose, Duration) affect the current selection.

---

## 4. Interaction Specifications

### A. Mouse Workflow
*Designed for discoverability and random access.*

1.  **Hover**: Calculates the nearest **Hit Zone** (Event, Insert, or Append).
    -   *Feedback*: Ghost Event appears at the calculated pitch/time.
2.  **Click (Empty Space)**:
    -   **Commits** the Ghost Event.
    -   **Audio**: Plays the note (rests are silent).
    -   **Post-Action**: Remains in **Entry State** without selecting the new note.
    -   *Rationale*: Facilitates rapid, sequential note entry.
3.  **Click (Existing Event)**:
    -   **Selects** the event.
    -   **Audio**: Plays the note(s).
    -   **Modifier**: `Cmd/Ctrl+Click` toggles multi-selection.
    -   **Modifier**: `Shift+Click` selects a range.

### B. Drag-to-Select (Lasso)
*Designed for efficient multi-selection.*

1.  **Initiate**: Click and drag on empty space within the score canvas.
2.  **Drag**: A blue rectangle appears, tracking the selection area.
3.  **Release**: All notes within the rectangle are selected.
4.  **Modifier**: `Cmd/Ctrl+Drag` adds to existing selection.

> **Design Rationale**: Lasso selection provides a fast way to select groups of notes for transposition, deletion, or duration changes without tedious Shift+clicking.

### C. Keyboard Workflow
*Designed for efficiency.*

1.  **Navigation**: `Left/Right` arrows move the selection (or cursor) through the timeline.
2.  **Entry (`Enter`)**:
    -   Inserts event at cursor position.
    -   **Auto-Advance**: Cursor moves to the next rhythmic slot.
    -   **Pitch Memory**: Cursor retains the previous pitch (Note Mode) or stays neutral (Rest Mode).
3.  **Pitch Adjustment**: `Up/Down` arrows move the ghost (in Entry) or transpose selection (during Selection).
4.  **Duration**: Number keys `1-7` set duration for *next* entry (Entry) or *transform* current selection (Selection).

### D. Rest Entry System
*Treating silence as a core structural element.*

-   **Toggle**: Press `R` to switch Input Mode (Note ↔ Rest).
-   **The Ghost Rest**: In Rest Mode, the ghost ignores vertical mouse position, representing purely rhythmic duration.
-   **Silent Feedback**: Rests do not trigger audio feedback on entry or selection.
-   **Conversion**: Selecting notes and pressing `R` converts them to rests of the same duration (and vice versa).

> **Design Rationale**: Reusing interaction patterns for rests reduces the learning curve; users modify the material (sound vs. silence) rather than the interaction method.

---

## 5. Keyboard Shortcuts Reference

### 🛠 Tools, Modes & Playback
| Key | Action | Context |
| :--- | :--- | :--- |
| `R` | **Toggle Note/Rest Mode** | Entry |
| `R` | **Convert Selection** | Selection |
| `Esc` | Clear Selection / Pause / Close Menu | Global |
| `Space` | Play / Pause | Global |
| `Shift + Space` | Play from Last Start | Global |
| `Cmd + Z` | Undo | Global |
| `Cmd + Shift + Z` | Redo | Global |
| `Cmd + Y` | Redo (alternative) | Global |

### 🎵 Pitch & Duration
| Key | Action | Notes |
| :--- | :--- | :--- |
| `1` | 64th note | |
| `2` | 32nd note | |
| `3` | 16th note | |
| `4` | 8th note | |
| `5` | Quarter note | |
| `6` | Half note | |
| `7` | Whole note | |
| `.` | Toggle Dotted | Adds 50% duration |
| `T` | Toggle Tie | Connects note to next |
| `↑` / `↓` | Transpose (Step) | Diatonic step |
| `Shift + ↑` / `↓` | Transpose (Octave) | Octave shift |
| `-` / `_` | Flat (♭) | |
| `=` / `+` | Sharp (♯) | |
| `0` | Natural (♮) | |

### 🧭 Navigation & Editing
| Key | Action | Behavior |
| :--- | :--- | :--- |
| `Enter` | **Insert (Commit)** | Adds Note/Rest at cursor & auto-advances |
| `←` / `→` | Previous/Next | Navigates through timeline |
| `Shift + ←` / `→` | Extend Selection | Multi-select range |
| `Cmd + Shift + ↑` / `↓` | **Extend Vertical** | Expand/contract selection through chords and staves. First press sets anchor; subsequent presses move cursor. See [deep dive](./KEYBOARD_NAVIGATION.md#vertical-selection-cmd--shift--updown). |
| `Cmd + ↑` / `↓` | Intra-chord | Navigates notes within a single chord |
| `Alt + ↑` / `↓` | **Switch Staff** | Grand Staff only: move between staves |
| `Delete` / `Backspace` | Remove | Deletes selection |

---

## 6. Toolbar Focus Management

The toolbar implements a **focus trap** to support keyboard-only navigation without losing context.

### Behavior

1. **Entering the Toolbar**: Clicking or tabbing to any toolbar button activates the focus trap.
2. **Tab Cycling**: Pressing `Tab` cycles forward through all focusable toolbar buttons. `Shift+Tab` cycles backward.
3. **Escape to Exit**: Pressing `Esc` exits the toolbar and returns focus to the score canvas.
4. **Focus Restoration**: If a note was previously selected, it remains selected. If no selection exists, the cursor moves to the end of the score.

### Dropdown Menus

When a dropdown menu opens (File Menu, Melody Library, etc.):
- The dropdown captures focus with its own trap
- `Tab` cycles within the dropdown
- `Esc` closes the dropdown and returns focus to its trigger button
- Arrow keys navigate menu items

> **Design Rationale**: Focus traps ensure keyboard users can fully navigate the UI without accidentally tabbing out of context, while `Esc` provides a consistent escape hatch back to the primary editing surface.

---

## 7. Glossary of Key Terms

| Term | Definition |
| :--- | :--- |
| **Ghost Event** | Semi-transparent preview tracking the mouse/cursor. Represents a *prediction* of the item to be added. |
| **Focus Memory** | System behavior that retains the last editing position, allowing focus restoration via arrow keys after UI interaction. |
| **Cursor** | In keyboard navigation, the specific *position* on the staff where the Ghost Event is located. |
| **Hit Zone** | Invisible vertical slices of a measure used to calculate quantized rhythmic placement from mouse coordinates. |
| **Smart Snap** | Logic enforcing alignment with valid rhythmic intervals and staff positions. |
| **Commit** | Action (Click or Enter) that converts a Ghost Event into a permanent Score Event. |
| **Input Mode** | Global switch (toggled by `R`) determining creation of Notes or Rests. |
| **Lasso Selection** | Drag-based multi-selection using a rectangular area. |
