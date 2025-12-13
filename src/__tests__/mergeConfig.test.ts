/**
 * Tests for mergeConfig utility
 */

import { mergeRiffConfig } from '@/utils/mergeConfig';
import { DEFAULT_RIFF_CONFIG } from '@/types';

describe('mergeConfig', () => {
  describe('mergeRiffConfig', () => {
    it('returns default config when called with empty object', () => {
      const result = mergeRiffConfig({});
      
      expect(result).toEqual(DEFAULT_RIFF_CONFIG);
    });

    it('returns default config when called with undefined', () => {
      const result = mergeRiffConfig();
      
      expect(result).toEqual(DEFAULT_RIFF_CONFIG);
    });

    it('merges top-level ui properties', () => {
      const result = mergeRiffConfig({
        ui: { scale: 2 }
      });
      
      expect(result.ui.scale).toBe(2);
      expect(result.ui.showToolbar).toBe(true); // Preserved from default
    });

    it('merges nested interaction properties', () => {
      const result = mergeRiffConfig({
        interaction: { isEnabled: false }
      });
      
      expect(result.interaction.isEnabled).toBe(false);
      expect(result.interaction.enableKeyboard).toBe(true); // Preserved from default
      expect(result.interaction.enablePlayback).toBe(true); // Preserved from default
    });

    it('merges nested score properties', () => {
      const result = mergeRiffConfig({
        score: { 
          title: 'My Song',
          measureCount: 8
        }
      });
      
      expect(result.score.title).toBe('My Song');
      expect(result.score.measureCount).toBe(8);
      expect(result.score.staff).toBe('grand'); // Preserved from default
      expect(result.score.bpm).toBe(120); // Preserved from default
    });

    it('allows staves array to override generator options', () => {
      const customStaves = [
        { id: 'custom-1', clef: 'treble' as const, keySignature: 'D', measures: [] }
      ];
      
      const result = mergeRiffConfig({
        score: { staves: customStaves }
      });
      
      expect(result.score.staves).toEqual(customStaves);
      // Generator options should still be present (not used when staves provided)
      expect(result.score.staff).toBe('grand');
    });

    it('merges multiple sections at once', () => {
      const result = mergeRiffConfig({
        ui: { showToolbar: false },
        interaction: { enablePlayback: false },
        score: { title: 'Test', keySignature: 'Bb' }
      });
      
      expect(result.ui.showToolbar).toBe(false);
      expect(result.interaction.enablePlayback).toBe(false);
      expect(result.score.title).toBe('Test');
      expect(result.score.keySignature).toBe('Bb');
    });
  });
});
