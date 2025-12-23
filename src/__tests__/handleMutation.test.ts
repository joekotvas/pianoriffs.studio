/**
 * handleMutation Tests
 *
 * Tests for keyboard mutation handler (undo, redo, accidentals, transpose, delete).
 *
 * @see handleMutation
 */

import { handleMutation } from '@/hooks/handlers/handleMutation';

describe('handleMutation', () => {
  let mockLogic: any;
  let mockEvent: any;

  beforeEach(() => {
    mockLogic = {
      state: {
        selection: null,
        previewNote: null,
        editorState: 'IDLE',
      },
      historyAPI: {
        undo: jest.fn(),
        redo: jest.fn(),
      },
      modifiers: {
        accidental: jest.fn(),
        tie: jest.fn(),
        dot: jest.fn(),
        duration: jest.fn(),
      },
      navigation: {
        transpose: jest.fn(),
      },
      entry: {
        addNote: jest.fn(),
        delete: jest.fn(),
      },
      tools: {
        toggleInputMode: jest.fn(),
      },
      engines: {
        dispatch: jest.fn(),
      },
    };
    mockEvent = {
      key: '',
      preventDefault: jest.fn(),
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
    };
  });

  test('should handle Undo (Cmd+Z)', () => {
    mockEvent.key = 'z';
    mockEvent.metaKey = true;
    const result = handleMutation(mockEvent, mockLogic);
    expect(result).toBe(true);
    expect(mockLogic.historyAPI.undo).toHaveBeenCalled();
  });

  test('should handle Redo (Cmd+Shift+Z)', () => {
    mockEvent.key = 'z';
    mockEvent.metaKey = true;
    mockEvent.shiftKey = true;
    const result = handleMutation(mockEvent, mockLogic);
    expect(result).toBe(true);
    expect(mockLogic.historyAPI.redo).toHaveBeenCalled();
  });

  test('should handle Accidentals', () => {
    mockEvent.key = '-';
    handleMutation(mockEvent, mockLogic);
    expect(mockLogic.modifiers.accidental).toHaveBeenCalledWith('flat');

    mockEvent.key = '=';
    handleMutation(mockEvent, mockLogic);
    expect(mockLogic.modifiers.accidental).toHaveBeenCalledWith('sharp');
  });

  test('should handle Transposition (ArrowUp)', () => {
    mockEvent.key = 'ArrowUp';
    const result = handleMutation(mockEvent, mockLogic);
    expect(result).toBe(true);
    expect(mockLogic.navigation.transpose).toHaveBeenCalledWith('up', false);
  });

  test('should handle Delete', () => {
    mockEvent.key = 'Delete';
    const result = handleMutation(mockEvent, mockLogic);
    expect(result).toBe(true);
    expect(mockLogic.entry.delete).toHaveBeenCalled();
  });

  test('should ignore unknown keys', () => {
    mockEvent.key = 'a';
    const result = handleMutation(mockEvent, mockLogic);
    expect(result).toBe(false);
  });
});
