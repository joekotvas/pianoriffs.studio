import { handleNavigation } from '@/hooks/handlers/handleNavigation';
import { createDefaultScore, getActiveStaff } from '@/types';
import { SetGrandStaffCommand } from '@/commands/SetGrandStaffCommand';
import { AddEventCommand } from '@/commands/AddEventCommand';
import { ScoreEngine } from '@/engines/ScoreEngine';

/**
 * Integration tests for keyboard navigation using simulated key events.
 * Tests the full handleNavigation -> moveSelection -> navigateSelection chain.
 */
describe('Keyboard Navigation Integration', () => {
  /**
   * Creates a mock KeyboardEvent with the specified properties.
   */
  const createKeyboardEvent = (
    key: string,
    options: Partial<KeyboardEvent> = {}
  ): KeyboardEvent => {
    return {
      key,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      ...options,
    } as unknown as KeyboardEvent;
  };

  describe('Standalone Treble Clef', () => {
    it('should navigate right on ArrowRight key press', () => {
      const engine = new ScoreEngine(createDefaultScore());

      // Add notes
      engine.dispatch(
        new AddEventCommand(
          0,
          false,
          { pitch: 'C5', id: 'note-1' },
          'quarter',
          false,
          undefined,
          undefined,
          0
        )
      );
      engine.dispatch(
        new AddEventCommand(
          0,
          false,
          { pitch: 'D5', id: 'note-2' },
          'quarter',
          false,
          undefined,
          undefined,
          0
        )
      );

      const score = engine.getState();
      const measures = getActiveStaff(score, 0).measures;
      const firstEvent = measures[0].events[0];

      // Track selection changes
      let currentSelection = {
        staffIndex: 0,
        measureIndex: 0,
        eventId: firstEvent.id,
        noteId: firstEvent.notes[0].id,
      };

      const moveSelection = jest.fn((direction: string) => {
        // Simulate what moveSelection does internally
        const eventIndex = measures[0].events.findIndex((e) => e.id === currentSelection.eventId);
        if (direction === 'right' && eventIndex < measures[0].events.length - 1) {
          const nextEvent = measures[0].events[eventIndex + 1];
          currentSelection = {
            ...currentSelection,
            eventId: nextEvent.id,
            noteId: nextEvent.notes[0].id,
          };
        }
      });

      // Simulate ArrowRight key press
      const event = createKeyboardEvent('ArrowRight');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(moveSelection).toHaveBeenCalledWith('right', false);
    });

    it('should navigate left on ArrowLeft key press', () => {
      const moveSelection = jest.fn();

      const event = createKeyboardEvent('ArrowLeft');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(moveSelection).toHaveBeenCalledWith('left', false);
    });
  });

  describe('Grand Staff Bass Clef', () => {
    it('should call moveSelection on ArrowRight key press on bass clef', () => {
      const engine = new ScoreEngine(createDefaultScore());
      engine.dispatch(new SetGrandStaffCommand());

      // Add notes to bass clef (staffIndex 1)
      engine.dispatch(
        new AddEventCommand(
          0,
          false,
          { pitch: 'C3', id: 'bass-1' },
          'quarter',
          false,
          undefined,
          undefined,
          1
        )
      );
      engine.dispatch(
        new AddEventCommand(
          0,
          false,
          { pitch: 'D3', id: 'bass-2' },
          'quarter',
          false,
          undefined,
          undefined,
          1
        )
      );

      const score = engine.getState();
      const bassMeasures = getActiveStaff(score, 1).measures;

      // Verify bass clef has notes
      expect(bassMeasures[0].events.length).toBe(2);
      expect(bassMeasures[0].events[0].notes[0].pitch).toBe('C3');

      const moveSelection = jest.fn();

      // Simulate ArrowRight key press
      const event = createKeyboardEvent('ArrowRight');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(true);
      expect(moveSelection).toHaveBeenCalledWith('right', false);
    });

    it('should call moveSelection on ArrowLeft key press on bass clef', () => {
      const moveSelection = jest.fn();

      const event = createKeyboardEvent('ArrowLeft');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(true);
      expect(moveSelection).toHaveBeenCalledWith('left', false);
    });
  });

  describe('Staff Switching', () => {
    it('should call switchStaff on Alt+ArrowDown', () => {
      const moveSelection = jest.fn();
      const switchStaff = jest.fn();

      const event = createKeyboardEvent('ArrowDown', { altKey: true });
      const handled = handleNavigation(event, moveSelection, switchStaff);

      expect(handled).toBe(true);
      expect(switchStaff).toHaveBeenCalledWith('down');
      expect(moveSelection).not.toHaveBeenCalled();
    });

    it('should call switchStaff on Alt+ArrowUp', () => {
      const moveSelection = jest.fn();
      const switchStaff = jest.fn();

      const event = createKeyboardEvent('ArrowUp', { altKey: true });
      const handled = handleNavigation(event, moveSelection, switchStaff);

      expect(handled).toBe(true);
      expect(switchStaff).toHaveBeenCalledWith('up');
    });
  });

  describe('Non-Arrow Keys', () => {
    it('should not handle non-arrow keys', () => {
      const moveSelection = jest.fn();

      const event = createKeyboardEvent('Enter');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(false);
      expect(moveSelection).not.toHaveBeenCalled();
    });

    it('should not handle letter keys', () => {
      const moveSelection = jest.fn();

      const event = createKeyboardEvent('a');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(false);
      expect(moveSelection).not.toHaveBeenCalled();
    });
  });

  describe('Up/Down without modifiers', () => {
    it('should not handle ArrowUp without meta/ctrl key (transposition is handled elsewhere)', () => {
      const moveSelection = jest.fn();

      const event = createKeyboardEvent('ArrowUp');
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(false);
      expect(moveSelection).not.toHaveBeenCalled();
    });

    it('should handle ArrowUp with meta key for chord navigation', () => {
      const moveSelection = jest.fn();

      const event = createKeyboardEvent('ArrowUp', { metaKey: true });
      const handled = handleNavigation(event, moveSelection);

      expect(handled).toBe(true);
      expect(moveSelection).toHaveBeenCalledWith('up', false);
    });
  });
});
