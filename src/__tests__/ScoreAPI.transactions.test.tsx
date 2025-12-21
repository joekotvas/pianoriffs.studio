import { renderHook, act } from '@testing-library/react';
import { useScoreAPI } from '../hooks/useScoreAPI';
import { ScoreProvider } from '../context/ScoreContext';
import { createDefaultScore, DEFAULT_RIFF_CONFIG } from '../types';
// Mock clipboard to avoid errors in test env
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ScoreProvider initialScore={createDefaultScore()}>{children}</ScoreProvider>
);

describe('ScoreAPI Transactions', () => {
  it('should group multiple commands into a single undo step', () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId: 'test', config: DEFAULT_RIFF_CONFIG }), { wrapper });
    
    // 1. Start transaction
    act(() => {
      result.current.beginTransaction();
    });

    // 2. Perform multiple actions
    // Add note (creates measure 0 event)
    act(() => {
      result.current.addNote('C4');
    });
    
    // Add another note (should be in same measure)
    act(() => {
      result.current.addNote('E4');
    });

    // 3. Commit
    act(() => {
      result.current.commitTransaction('Add Chord');
    });

    // Verify state: Should have 2 notes
    const score = result.current.getScore();
    const measure = score.staves[0].measures[0];
    expect(measure.events.length).toBeGreaterThan(0);
    expect(measure.events.length).toBe(2); 

    // 4. Undo once - should revert BOTH addNote calls
    act(() => {
      result.current.undo();
    });

    const undoScore = result.current.getScore();
    const undoMeasure = undoScore.staves[0].measures[0];
    expect(undoMeasure.events.length).toBe(0);
  });

  it('should support nested transactions flattening to single batch', () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId: 'test-nest', config: DEFAULT_RIFF_CONFIG }), { wrapper });

    act(() => {
      result.current.beginTransaction(); // Depth 1
      result.current.addNote('C4');
      
      result.current.beginTransaction(); // Depth 2
      result.current.addNote('E4');
      result.current.commitTransaction(); // Depth 1
      
      result.current.commitTransaction(); // Depth 0 -> Commit
    });

    // Check state
    const score = result.current.getScore();
    expect(score.staves[0].measures[0].events.length).toBe(2);

    // Undo should remove both
    act(() => {
      result.current.undo();
    });
    expect(result.current.getScore().staves[0].measures[0].events.length).toBe(0);
  });

  it('should allow rollback to clear pending changes', () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId: 'test-rollback', config: DEFAULT_RIFF_CONFIG }), { wrapper });

    act(() => {
      result.current.beginTransaction();
      result.current.addNote('C4');
      result.current.rollbackTransaction();
    });

    // State should be reverted
    expect(result.current.getScore().staves[0].measures[0].events.length).toBe(0);
    
    // History should be empty (nothing committed)
    act(() => {
        result.current.undo(); // Should do nothing if history empty
    });
    expect(result.current.getScore().staves[0].measures[0].events.length).toBe(0);
  });

  it('should notify listeners during batch (History-Only Strategy)', () => {
    const { result } = renderHook(() => useScoreAPI({ instanceId: 'test-listeners', config: DEFAULT_RIFF_CONFIG }), { wrapper });
    const listener = jest.fn();
    
    // Subscribe
    const unsubscribe = result.current.on('score', listener);

    act(() => {
      result.current.beginTransaction();
      result.current.addNote('C4');
    });

    // Should have fired once for the addNote (immediate update)
    expect(listener).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.commitTransaction();
    });

    // Should NOT fire again on commit (only history update)
    // Wait, typically history push doesn't change state, so no 'score' event?
    // ScoreEngine.commitBatch pushes to history but doesn't call setState.
    // So listener count remains 1.
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
