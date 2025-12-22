import { renderHook, act } from '@testing-library/react';
import { useNoteDelete } from '@/hooks/note/useNoteDelete';
import { Selection, createDefaultSelection } from '@/types';
import { DeleteNoteCommand } from '@/commands/DeleteNoteCommand';
import { DeleteEventCommand } from '@/commands/DeleteEventCommand';

// Mock the command classes
jest.mock('@/commands/DeleteNoteCommand');
jest.mock('@/commands/DeleteEventCommand');

describe('useNoteDelete', () => {
  let mockDispatch: jest.Mock;
  let mockSelect: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockSelect = jest.fn();
    jest.clearAllMocks();
  });

  describe('multi-selection deletion', () => {
    it('deletes all notes in selectedNotes array', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        selectedNotes: [
          { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n1' },
          { staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: 'n2' },
          { staffIndex: 0, measureIndex: 1, eventId: 'e2', noteId: 'n3' },
        ],
      };

      const { result } = renderHook(() =>
        useNoteDelete({ selection, select: mockSelect, dispatch: mockDispatch })
      );

      act(() => {
        result.current.deleteSelected();
      });

      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(DeleteNoteCommand).toHaveBeenCalledTimes(3);
      expect(mockSelect).toHaveBeenCalledWith(null, null, null, 0);
    });

    it('deletes events when noteId is missing in selectedNotes', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        selectedNotes: [{ staffIndex: 0, measureIndex: 0, eventId: 'e1', noteId: null }],
      };

      const { result } = renderHook(() =>
        useNoteDelete({ selection, select: mockSelect, dispatch: mockDispatch })
      );

      act(() => {
        result.current.deleteSelected();
      });

      expect(DeleteEventCommand).toHaveBeenCalledTimes(1);
      expect(DeleteNoteCommand).not.toHaveBeenCalled();
    });
  });

  describe('single selection deletion', () => {
    it('deletes single selected note', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        measureIndex: 0,
        eventId: 'e1',
        noteId: 'n1',
        staffIndex: 0,
        selectedNotes: [], // Empty - not multi-select
      };

      const { result } = renderHook(() =>
        useNoteDelete({ selection, select: mockSelect, dispatch: mockDispatch })
      );

      act(() => {
        result.current.deleteSelected();
      });

      expect(DeleteNoteCommand).toHaveBeenCalledWith(0, 'e1', 'n1', 0);
      expect(mockSelect).toHaveBeenCalledWith(null, null, null, 0);
    });

    it('deletes event when noteId is null', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        measureIndex: 0,
        eventId: 'e1',
        noteId: null,
        staffIndex: 0,
        selectedNotes: [],
      };

      const { result } = renderHook(() =>
        useNoteDelete({ selection, select: mockSelect, dispatch: mockDispatch })
      );

      act(() => {
        result.current.deleteSelected();
      });

      expect(DeleteEventCommand).toHaveBeenCalledWith(0, 'e1', 0);
      expect(DeleteNoteCommand).not.toHaveBeenCalled();
    });
  });

  describe('early returns', () => {
    it('does nothing when measureIndex is null', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        measureIndex: null,
        eventId: null,
        selectedNotes: [],
      };

      const { result } = renderHook(() =>
        useNoteDelete({ selection, select: mockSelect, dispatch: mockDispatch })
      );

      act(() => {
        result.current.deleteSelected();
      });

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('does nothing when eventId is null', () => {
      const selection: Selection = {
        ...createDefaultSelection(),
        measureIndex: 0,
        eventId: null,
        selectedNotes: [],
      };

      const { result } = renderHook(() =>
        useNoteDelete({ selection, select: mockSelect, dispatch: mockDispatch })
      );

      act(() => {
        result.current.deleteSelected();
      });

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockSelect).not.toHaveBeenCalled();
    });
  });
});
