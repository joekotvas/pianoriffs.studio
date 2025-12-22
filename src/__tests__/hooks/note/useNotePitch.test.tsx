import { renderHook, act } from '@testing-library/react';
import { useNotePitch } from '@/hooks/note/useNotePitch';
import { createDefaultSelection } from '@/types';
import { ChangePitchCommand } from '@/commands/ChangePitchCommand';

jest.mock('@/commands/ChangePitchCommand');

describe('useNotePitch', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    jest.clearAllMocks();
  });

  it('dispatches ChangePitchCommand with correct parameters', () => {
    const selection = {
      ...createDefaultSelection(),
      staffIndex: 0,
    };

    const { result } = renderHook(() =>
      useNotePitch({ selection, dispatch: mockDispatch })
    );

    act(() => {
      result.current.updateNotePitch(0, 'e1', 'n1', 'D4');
    });

    expect(ChangePitchCommand).toHaveBeenCalledWith(0, 'e1', 'n1', 'D4', 0);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it('uses staffIndex from current selection', () => {
    const selection = {
      ...createDefaultSelection(),
      staffIndex: 1, // Non-default staff
    };

    const { result } = renderHook(() =>
      useNotePitch({ selection, dispatch: mockDispatch })
    );

    act(() => {
      result.current.updateNotePitch(2, 'e5', 'n8', 'G#5');
    });

    expect(ChangePitchCommand).toHaveBeenCalledWith(2, 'e5', 'n8', 'G#5', 1);
  });

  it('handles various pitch formats', () => {
    const selection = createDefaultSelection();
    const { result } = renderHook(() =>
      useNotePitch({ selection, dispatch: mockDispatch })
    );

    // Sharp
    act(() => {
      result.current.updateNotePitch(0, 'e1', 'n1', 'F#4');
    });
    expect(ChangePitchCommand).toHaveBeenLastCalledWith(0, 'e1', 'n1', 'F#4', 0);

    // Flat
    act(() => {
      result.current.updateNotePitch(0, 'e1', 'n1', 'Bb3');
    });
    expect(ChangePitchCommand).toHaveBeenLastCalledWith(0, 'e1', 'n1', 'Bb3', 0);

    // Natural
    act(() => {
      result.current.updateNotePitch(0, 'e1', 'n1', 'C5');
    });
    expect(ChangePitchCommand).toHaveBeenLastCalledWith(0, 'e1', 'n1', 'C5', 0);
  });
});
