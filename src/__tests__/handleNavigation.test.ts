import { handleNavigation } from '@/hooks/handlers/handleNavigation';

describe('handleNavigation', () => {
  let mockMoveSelection: any;
  let mockEvent: any;

  beforeEach(() => {
    mockMoveSelection = jest.fn();
    mockEvent = {
      key: '',
      preventDefault: jest.fn(),
      metaKey: false,
      ctrlKey: false,
    };
  });

  test('should handle ArrowLeft', () => {
    mockEvent.key = 'ArrowLeft';
    const result = handleNavigation(mockEvent, mockMoveSelection);

    expect(result).toBe(true);
    expect(mockMoveSelection).toHaveBeenCalledWith('left', undefined);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('should handle ArrowRight', () => {
    mockEvent.key = 'ArrowRight';
    const result = handleNavigation(mockEvent, mockMoveSelection);

    expect(result).toBe(true);
    expect(mockMoveSelection).toHaveBeenCalledWith('right', undefined);
  });

  test('should ignore ArrowUp/Down without Meta/Ctrl', () => {
    mockEvent.key = 'ArrowUp';
    const result = handleNavigation(mockEvent, mockMoveSelection);

    expect(result).toBe(false);
    expect(mockMoveSelection).not.toHaveBeenCalled();
  });

  test('should handle ArrowUp with Meta (Chord Navigation)', () => {
    mockEvent.key = 'ArrowUp';
    mockEvent.metaKey = true;
    const result = handleNavigation(mockEvent, mockMoveSelection);

    expect(result).toBe(true);
    expect(mockMoveSelection).toHaveBeenCalledWith('up', undefined);
  });

  test('should ignore non-arrow keys', () => {
    mockEvent.key = 'Enter';
    const result = handleNavigation(mockEvent, mockMoveSelection);
    expect(result).toBe(false);
  });
});
