import { isValidPitch, parseDuration, clampBpm } from '../utils/validation';

describe('Validation Utils', () => {
  describe('isValidPitch', () => {
    test('accepts valid scientific notation', () => {
      expect(isValidPitch('C4')).toBe(true);
      expect(isValidPitch('G#5')).toBe(true);
      expect(isValidPitch('Bbb3')).toBe(true);
    });

    test('rejects invalid inputs', () => {
      expect(isValidPitch('H4')).toBe(false);
      expect(isValidPitch('not a note')).toBe(false);
      expect(isValidPitch('')).toBe(false);
    });

    test('accepts null (for rests)', () => {
      expect(isValidPitch(null)).toBe(true);
    });

    test('accepts case-insensitive', () => {
      expect(isValidPitch('c4')).toBe(true);
    });
  });

  describe('parseDuration', () => {
    test('returns valid durations unchanged', () => {
      expect(parseDuration('quarter')).toBe('quarter');
      expect(parseDuration('whole')).toBe('whole');
    });

    test('normalizes shorthands', () => {
      expect(parseDuration('q')).toBe('quarter');
      expect(parseDuration('4n')).toBe('quarter');
      expect(parseDuration('h')).toBe('half');
      expect(parseDuration('w')).toBe('whole');
    });

    test('returns null for invalid durations', () => {
      expect(parseDuration('bad')).toBeNull();
      expect(parseDuration('')).toBeNull();
    });
  });

  describe('clampBpm', () => {
    test('returns value within range', () => {
      expect(clampBpm(100)).toBe(100);
    });

    test('clamps low values', () => {
      expect(clampBpm(10)).toBe(30);
    });

    test('clamps high values', () => {
      expect(clampBpm(400)).toBe(300);
    });

    test('parses strings', () => {
      expect(clampBpm('120')).toBe(120);
    });

    test('defaults invalid strings', () => {
      expect(clampBpm('abc')).toBe(120);
    });
  });
});
