import { handleMutation } from '../hooks/handlers/handleMutation';

describe('handleMutation', () => {
    let mockLogic: any;
    let mockEvent: any;

    beforeEach(() => {
        mockLogic = {
            undo: jest.fn(),
            redo: jest.fn(),
            handleAccidentalToggle: jest.fn(),
            handleTieToggle: jest.fn(),
            deleteSelected: jest.fn(),
            transposeSelection: jest.fn(),
            addNoteToMeasure: jest.fn(),
            previewNote: null
        };
        mockEvent = {
            key: '',
            preventDefault: jest.fn(),
            metaKey: false,
            ctrlKey: false,
            shiftKey: false
        };
    });

    test('should handle Undo (Cmd+Z)', () => {
        mockEvent.key = 'z';
        mockEvent.metaKey = true;
        const result = handleMutation(mockEvent, mockLogic);
        expect(result).toBe(true);
        expect(mockLogic.undo).toHaveBeenCalled();
    });

    test('should handle Redo (Cmd+Shift+Z)', () => {
        mockEvent.key = 'z';
        mockEvent.metaKey = true;
        mockEvent.shiftKey = true;
        const result = handleMutation(mockEvent, mockLogic);
        expect(result).toBe(true);
        expect(mockLogic.redo).toHaveBeenCalled();
    });

    test('should handle Accidentals', () => {
        mockEvent.key = '-';
        handleMutation(mockEvent, mockLogic);
        expect(mockLogic.handleAccidentalToggle).toHaveBeenCalledWith('flat');

        mockEvent.key = '=';
        handleMutation(mockEvent, mockLogic);
        expect(mockLogic.handleAccidentalToggle).toHaveBeenCalledWith('sharp');
    });

    test('should handle Transposition (ArrowUp)', () => {
        mockEvent.key = 'ArrowUp';
        const result = handleMutation(mockEvent, mockLogic);
        expect(result).toBe(true);
        expect(mockLogic.transposeSelection).toHaveBeenCalledWith('up', false);
    });

    test('should handle Delete', () => {
        mockEvent.key = 'Delete';
        const result = handleMutation(mockEvent, mockLogic);
        expect(result).toBe(true);
        expect(mockLogic.deleteSelected).toHaveBeenCalled();
    });

    test('should ignore unknown keys', () => {
        mockEvent.key = 'a';
        const result = handleMutation(mockEvent, mockLogic);
        expect(result).toBe(false);
    });
});
