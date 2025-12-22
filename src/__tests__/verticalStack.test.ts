/**
 * Tests for Vertical Stack Utilities
 *
 * Unit tests for the shared utility functions that handle
 * vertical selection operations.
 *
 * @see verticalStack.ts
 */

import {
  calculateVerticalMetric,
  toVerticalPoint,
  collectVerticalStack,
  moveCursorInStack,
  selectionsMatch,
  VerticalPoint,
} from '@/utils/verticalStack';
import { createTestScore, createScoreWithRest } from './fixtures/selectionTestScores';

// =============================================================================
// calculateVerticalMetric
// =============================================================================

describe('calculateVerticalMetric', () => {
  test('treble notes have higher metric than bass notes', () => {
    const trebleC4 = calculateVerticalMetric(0, 60); // Staff 0, MIDI 60
    const bassC3 = calculateVerticalMetric(1, 48);   // Staff 1, MIDI 48
    
    expect(trebleC4).toBeGreaterThan(bassC3);
  });

  test('higher pitches have higher metric within same staff', () => {
    const c4 = calculateVerticalMetric(0, 60);
    const g4 = calculateVerticalMetric(0, 67);
    const c5 = calculateVerticalMetric(0, 72);
    
    expect(g4).toBeGreaterThan(c4);
    expect(c5).toBeGreaterThan(g4);
  });

  test('all treble notes are above all bass notes regardless of pitch', () => {
    const lowestTreble = calculateVerticalMetric(0, 0);   // Lowest possible treble
    const highestBass = calculateVerticalMetric(1, 127);  // Highest possible bass
    
    expect(lowestTreble).toBeGreaterThan(highestBass);
  });

  test('supports up to 100 staves without inversion', () => {
    const staff99 = calculateVerticalMetric(99, 60);
    
    // Staff 99 metric should still be positive
    expect(staff99).toBeGreaterThan(0);
    // Formula: (100 - 99) * 1000 + 60 = 1060
    expect(staff99).toBe(1060);
  });
});

// =============================================================================
// toVerticalPoint
// =============================================================================

describe('toVerticalPoint', () => {
  test('converts selected note to vertical point', () => {
    const score = createTestScore();
    const note = { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' };
    
    const point = toVerticalPoint(note, score);
    
    expect(point).not.toBeNull();
    expect(point!.staffIndex).toBe(0);
    expect(point!.measureIndex).toBe(0);
    expect(point!.eventId).toBe('e0');
    expect(point!.noteId).toBe('n0');
    expect(point!.midi).toBe(60); // C4
    expect(point!.time).toBe(0); // First quant in measure 0
  });

  test('returns null for invalid staff index', () => {
    const score = createTestScore();
    const note = { staffIndex: 99, measureIndex: 0, eventId: 'e0', noteId: 'n0' };
    
    const point = toVerticalPoint(note, score);
    
    expect(point).toBeNull();
  });

  test('returns null for invalid measure index', () => {
    const score = createTestScore();
    const note = { staffIndex: 0, measureIndex: 99, eventId: 'e0', noteId: 'n0' };
    
    const point = toVerticalPoint(note, score);
    
    expect(point).toBeNull();
  });

  test('returns null for invalid event id', () => {
    const score = createTestScore();
    const note = { staffIndex: 0, measureIndex: 0, eventId: 'invalid', noteId: 'n0' };
    
    const point = toVerticalPoint(note, score);
    
    expect(point).toBeNull();
  });

  test('handles rest events with clef-appropriate MIDI', () => {
    const score = createScoreWithRest();
    const note = { staffIndex: 1, measureIndex: 0, eventId: 'bass-e0', noteId: 'rest-0' };
    
    const point = toVerticalPoint(note, score);
    
    expect(point).not.toBeNull();
    expect(point!.midi).toBe(50); // Bass clef rest: D3 (Line 3 = middle line)
  });
});

// =============================================================================
// collectVerticalStack
// =============================================================================

describe('collectVerticalStack', () => {
  test('collects all notes at quant 0 across staves', () => {
    const score = createTestScore();
    
    // globalTime = measureIndex * 100000 + quant = 0 * 100000 + 0 = 0
    const stack = collectVerticalStack(score, 0);
    
    // Should have treble notes (C4, E4, G4) + bass notes (C3, G3) = 5 notes
    expect(stack.length).toBe(5);
    
    // Should be sorted top to bottom (treble first, then bass)
    expect(stack[0].staffIndex).toBe(0); // Treble
    expect(stack[stack.length - 1].staffIndex).toBe(1); // Bass
  });

  test('includes rest in stack', () => {
    const score = createScoreWithRest();
    
    const stack = collectVerticalStack(score, 0);
    
    // Should have 2 treble notes + 1 bass rest = 3
    expect(stack.length).toBe(3);
    
    // Find the rest
    const rest = stack.find(p => p.noteId === 'rest-0');
    expect(rest).toBeDefined();
    expect(rest!.staffIndex).toBe(1);
  });

  test('returns empty stack for non-existent quant', () => {
    const score = createTestScore();
    
    // No notes at quant 50 in measure 0
    const stack = collectVerticalStack(score, 50);
    
    expect(stack.length).toBe(0);
  });

  test('stacks are sorted high to low (visual top to bottom)', () => {
    const score = createTestScore();
    const stack = collectVerticalStack(score, 0);
    
    // Verify descending order by metric
    for (let i = 0; i < stack.length - 1; i++) {
      const metricA = calculateVerticalMetric(stack[i].staffIndex, stack[i].midi);
      const metricB = calculateVerticalMetric(stack[i + 1].staffIndex, stack[i + 1].midi);
      expect(metricA).toBeGreaterThanOrEqual(metricB);
    }
  });
});

// =============================================================================
// moveCursorInStack
// =============================================================================

describe('moveCursorInStack', () => {
  const createMockStack = (): VerticalPoint[] => [
    { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n2', midi: 67, time: 0 }, // G4 (top)
    { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1', midi: 64, time: 0 }, // E4
    { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0', midi: 60, time: 0 }, // C4
    { staffIndex: 1, measureIndex: 0, eventId: 'bass-e0', noteId: 'bass-n1', midi: 55, time: 0 }, // G3
    { staffIndex: 1, measureIndex: 0, eventId: 'bass-e0', noteId: 'bass-n0', midi: 48, time: 0 }, // C3 (bottom)
  ];

  test('moves up from middle note', () => {
    const stack = createMockStack();
    const current = stack[2]; // C4
    
    const result = moveCursorInStack(stack, current, 'up');
    
    expect(result.noteId).toBe('n1'); // E4
  });

  test('moves down from middle note', () => {
    const stack = createMockStack();
    const current = stack[2]; // C4
    
    const result = moveCursorInStack(stack, current, 'down');
    
    expect(result.noteId).toBe('bass-n1'); // G3
  });

  test('up at top returns same position', () => {
    const stack = createMockStack();
    const current = stack[0]; // G4 (top)
    
    const result = moveCursorInStack(stack, current, 'up');
    
    expect(result.noteId).toBe('n2'); // Still G4
  });

  test('down at bottom returns same position', () => {
    const stack = createMockStack();
    const current = stack[4]; // C3 (bottom)
    
    const result = moveCursorInStack(stack, current, 'down');
    
    expect(result.noteId).toBe('bass-n0'); // Still C3
  });

  test('all direction moves to bottom of stack', () => {
    const stack = createMockStack();
    const current = stack[0]; // G4 (top)
    
    const result = moveCursorInStack(stack, current, 'all');
    
    expect(result.noteId).toBe('bass-n0'); // C3 (bottom)
  });

  test('returns current if not found in stack', () => {
    const stack = createMockStack();
    const current: VerticalPoint = {
      staffIndex: 0, measureIndex: 0, eventId: 'unknown', noteId: 'unknown', midi: 60, time: 0
    };
    
    const result = moveCursorInStack(stack, current, 'up');
    
    expect(result).toBe(current);
  });

  test('returns current for empty stack', () => {
    const current: VerticalPoint = {
      staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0', midi: 60, time: 0
    };
    
    const result = moveCursorInStack([], current, 'up');
    
    expect(result).toBe(current);
  });
});

// =============================================================================
// selectionsMatch
// =============================================================================

describe('selectionsMatch', () => {
  test('empty arrays match', () => {
    expect(selectionsMatch([], [])).toBe(true);
  });

  test('identical single-note arrays match', () => {
    const a = [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }];
    const b = [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }];
    
    expect(selectionsMatch(a, b)).toBe(true);
  });

  test('different order still matches', () => {
    const a = [
      { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
    ];
    const b = [
      { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
      { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
    ];
    
    expect(selectionsMatch(a, b)).toBe(true);
  });

  test('different lengths do not match', () => {
    const a = [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }];
    const b = [
      { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' },
      { staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' },
    ];
    
    expect(selectionsMatch(a, b)).toBe(false);
  });

  test('different notes do not match', () => {
    const a = [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n0' }];
    const b = [{ staffIndex: 0, measureIndex: 0, eventId: 'e0', noteId: 'n1' }];
    
    expect(selectionsMatch(a, b)).toBe(false);
  });
});
