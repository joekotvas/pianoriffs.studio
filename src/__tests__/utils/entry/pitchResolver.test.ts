import { resolvePitch } from '@/utils/entry/pitchResolver';

describe('resolvePitch', () => {
  describe('explicit accidental override', () => {
    it('applies sharp accidental', () => {
      const result = resolvePitch({ rawPitch: 'F4', accidental: 'sharp' });
      expect(result).toBe('F#4');
    });

    it('applies flat accidental', () => {
      const result = resolvePitch({ rawPitch: 'B4', accidental: 'flat' });
      expect(result).toBe('Bb4');
    });

    it('applies natural (strips key signature accidental)', () => {
      // Natural means just the letter + octave, no accidental
      const result = resolvePitch({ rawPitch: 'F#4', accidental: 'natural' });
      expect(result).toBe('F4');
    });

    it('handles accidental on already-accidental pitch', () => {
      // If user clicks sharp on F#, result should still be F#
      const result = resolvePitch({ rawPitch: 'F#4', accidental: 'sharp' });
      expect(result).toBe('F#4');
    });

    it('overrides key signature when accidental is explicit', () => {
      // Even in G major, if user selects natural, F stays F (not F#)
      const result = resolvePitch({
        rawPitch: 'F4',
        accidental: 'natural',
        keySignature: 'G',
      });
      expect(result).toBe('F4');
    });
  });

  describe('key signature snapping', () => {
    it('snaps F to F# in G major', () => {
      const result = resolvePitch({ rawPitch: 'F4', keySignature: 'G' });
      expect(result).toBe('F#4');
    });

    it('snaps B to Bb in F major', () => {
      const result = resolvePitch({ rawPitch: 'B4', keySignature: 'F' });
      expect(result).toBe('Bb4');
    });

    it('returns unmodified pitch in C major', () => {
      const result = resolvePitch({ rawPitch: 'F4', keySignature: 'C' });
      expect(result).toBe('F4');
    });

    it('defaults to C major when no key signature provided', () => {
      const result = resolvePitch({ rawPitch: 'F4' });
      expect(result).toBe('F4');
    });
  });

  describe('edge cases', () => {
    it('handles various octaves', () => {
      expect(resolvePitch({ rawPitch: 'C2', accidental: 'sharp' })).toBe('C#2');
      expect(resolvePitch({ rawPitch: 'G6', accidental: 'flat' })).toBe('Gb6');
    });

    it('handles null accidental like no accidental', () => {
      const result = resolvePitch({
        rawPitch: 'F4',
        accidental: null,
        keySignature: 'G',
      });
      expect(result).toBe('F#4');
    });

    it('returns raw pitch when pitch is invalid', () => {
      // Invalid pitch format - can't be parsed by tonal
      const result = resolvePitch({ rawPitch: 'invalid', accidental: 'sharp' });
      expect(result).toBe('invalid');
    });

    it('handles pitch without octave', () => {
      // Note.get('F') returns valid note but oct is undefined
      const result = resolvePitch({ rawPitch: 'F', accidental: 'sharp' });
      expect(result).toBe('F');
    });
  });

  describe('multiple sharps/flats key signatures', () => {
    it('handles D major (F# and C#)', () => {
      expect(resolvePitch({ rawPitch: 'F4', keySignature: 'D' })).toBe('F#4');
      expect(resolvePitch({ rawPitch: 'C4', keySignature: 'D' })).toBe('C#4');
    });

    it('handles Bb major (Bb and Eb)', () => {
      expect(resolvePitch({ rawPitch: 'B4', keySignature: 'Bb' })).toBe('Bb4');
      expect(resolvePitch({ rawPitch: 'E4', keySignature: 'Bb' })).toBe('Eb4');
    });
  });
});
