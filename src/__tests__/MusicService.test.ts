import {
  getFrequency,
  getMidi,
  midiToPitch,
  getStaffPitch,
  getKeyInfo,
  getScaleNotes,
  getKeyAlteration,
  needsAccidental,
  applyKeySignature,
  movePitchVisual,
  getInterval,
  getSemitones,
  getAccidentalGlyph,
  getScaleDegree,
} from '@/services/MusicService';

describe('MusicService', () => {
  // =========================================================================
  // 1. ANALYSIS (Audio & MIDI)
  // =========================================================================
  describe('Analysis', () => {
    describe('getFrequency', () => {
      it('returns correct frequency for A4', () => {
        expect(getFrequency('A4')).toBeCloseTo(440);
      });

      it('returns correct frequency for C4', () => {
        expect(getFrequency('C4')).toBeCloseTo(261.63, 1);
      });

      it('handles sharps and flats', () => {
        expect(getFrequency('F#4')).toBeCloseTo(369.99, 1);
        expect(getFrequency('Bb3')).toBeCloseTo(233.08, 1);
      });

      it('returns 0 for invalid pitch', () => {
        expect(getFrequency('invalid')).toBe(0);
        expect(getFrequency('')).toBe(0);
      });
    });

    describe('getMidi', () => {
      it('returns correct MIDI for C4 (middle C)', () => {
        expect(getMidi('C4')).toBe(60);
      });

      it('returns correct MIDI for A4', () => {
        expect(getMidi('A4')).toBe(69);
      });

      it('handles edge cases', () => {
        expect(getMidi('C0')).toBe(12);
        expect(getMidi('G9')).toBe(127);
      });

      it('returns 60 for invalid pitch', () => {
        expect(getMidi('invalid')).toBe(60);
      });
    });

    describe('midiToPitch', () => {
      it('converts MIDI 60 to C4', () => {
        expect(midiToPitch(60)).toBe('C4');
      });

      it('converts MIDI 61 to Db4 or C#4 (enharmonic)', () => {
        const result = midiToPitch(61);
        expect(result === 'Db4' || result === 'C#4').toBe(true);
      });

      it('round-trips correctly', () => {
        const pitch = 'E5';
        expect(midiToPitch(getMidi(pitch))).toBe(pitch);
      });
    });

    describe('getInterval', () => {
      it('calculates perfect fifth', () => {
        expect(getInterval('C4', 'G4')).toBe('5P');
      });

      it('calculates major third', () => {
        expect(getInterval('C4', 'E4')).toBe('3M');
      });

      it('calculates descending intervals', () => {
        expect(getInterval('G4', 'C4')).toBe('-5P');
      });
    });

    describe('getSemitones', () => {
      it('returns 7 semitones for perfect fifth', () => {
        expect(getSemitones('5P')).toBe(7);
      });

      it('returns 4 semitones for major third', () => {
        expect(getSemitones('3M')).toBe(4);
      });

      it('returns 0 for invalid interval', () => {
        const result = getSemitones('invalid');
        expect(result === 0 || isNaN(result)).toBe(true);
      });
    });
  });

  // =========================================================================
  // 2. THEORY (Keys & Scales)
  // =========================================================================
  describe('Theory', () => {
    describe('getScaleNotes', () => {
      it('returns C major scale', () => {
        expect(getScaleNotes('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
      });

      it('returns G major scale with F#', () => {
        expect(getScaleNotes('G')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
      });

      it('returns F major scale with Bb', () => {
        expect(getScaleNotes('F')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
      });
    });

    describe('getKeyAlteration', () => {
      it('returns 0 for C major', () => {
        expect(getKeyAlteration('C')).toBe(0);
      });

      it('returns 1 for G major (one sharp)', () => {
        expect(getKeyAlteration('G')).toBe(1);
      });

      it('returns -1 for F major (one flat)', () => {
        expect(getKeyAlteration('F')).toBe(-1);
      });

      it('returns -2 for Bb major (two flats)', () => {
        expect(getKeyAlteration('Bb')).toBe(-2);
      });
    });

    describe('getScaleDegree', () => {
      it('returns correct degree for G in C major', () => {
        expect(getScaleDegree('G4', 'C')).toBe(5);
      });

      it('returns 0 for chromatic notes', () => {
        expect(getScaleDegree('C#4', 'C')).toBe(0);
      });
    });
  });

  // =========================================================================
  // 3. NOTATION (Rendering Logic)
  // =========================================================================
  describe('Notation', () => {
    describe('getStaffPitch', () => {
      it('removes accidentals', () => {
        expect(getStaffPitch('F#4')).toBe('F4');
        expect(getStaffPitch('Bb3')).toBe('B3');
      });

      it('preserves natural notes', () => {
        expect(getStaffPitch('C4')).toBe('C4');
      });

      it('handles invalid input', () => {
        expect(getStaffPitch('invalid')).toBe('invalid');
      });
    });

    describe('needsAccidental', () => {
      it('returns false for diatonic notes in key', () => {
        expect(needsAccidental('F#4', 'G')).toEqual({ show: false, type: null });
        expect(needsAccidental('C4', 'C')).toEqual({ show: false, type: null });
      });

      it('returns true for naturals that differ from key', () => {
        expect(needsAccidental('F4', 'G')).toEqual({ show: true, type: 'natural' });
      });

      it('returns true for chromatic sharps', () => {
        expect(needsAccidental('F#4', 'C')).toEqual({ show: true, type: 'sharp' });
      });

      it('returns true for chromatic flats', () => {
        expect(needsAccidental('Bb4', 'C')).toEqual({ show: true, type: 'flat' });
      });

      it('handles invalid input gracefully', () => {
        expect(needsAccidental('invalid', 'C')).toEqual({ show: false, type: null });
      });
    });

    describe('getAccidentalGlyph', () => {
      it('returns null for diatonic notes', () => {
        expect(getAccidentalGlyph('F#4', 'G')).toBeNull();
      });

      it('returns sharp glyph for chromatic sharps', () => {
        expect(getAccidentalGlyph('F#4', 'C')).toBe('\uE262');
      });

      it('returns flat glyph for chromatic flats', () => {
        expect(getAccidentalGlyph('Bb4', 'C')).toBe('\uE260');
      });

      it('returns natural glyph when needed', () => {
        expect(getAccidentalGlyph('F4', 'G')).toBe('\uE261');
      });

      it('respects manual overrides', () => {
        expect(getAccidentalGlyph('F#4', 'G', '♯')).toBe('♯');
        expect(getAccidentalGlyph('F#4', 'G', null)).toBeNull();
      });
    });
  });

  // =========================================================================
  // 4. INTERACTION (Drag & Drop Math)
  // =========================================================================
  describe('Interaction', () => {
    describe('applyKeySignature', () => {
      it('applies F# in G major', () => {
        expect(applyKeySignature('F4', 'G')).toBe('F#4');
      });

      it('applies Bb in F major', () => {
        expect(applyKeySignature('B4', 'F')).toBe('Bb4');
      });

      it('preserves naturals in C major', () => {
        expect(applyKeySignature('C4', 'C')).toBe('C4');
        expect(applyKeySignature('F4', 'C')).toBe('F4');
      });

      it('handles invalid input', () => {
        expect(applyKeySignature('invalid', 'C')).toBe('invalid');
      });
    });

    describe('movePitchVisual', () => {
      it('moves up one visual step in C major', () => {
        expect(movePitchVisual('E4', 1, 'C')).toBe('F4');
        expect(movePitchVisual('C4', 1, 'C')).toBe('D4');
      });

      it('moves up one visual step in G major (applies F#)', () => {
        expect(movePitchVisual('E4', 1, 'G')).toBe('F#4');
      });

      it('moves down one visual step', () => {
        expect(movePitchVisual('E4', -1, 'G')).toBe('D4');
        expect(movePitchVisual('F4', -1, 'C')).toBe('E4');
      });

      it('handles octave jumps (7 steps)', () => {
        expect(movePitchVisual('C4', 7, 'C')).toBe('C5');
        expect(movePitchVisual('C4', -7, 'C')).toBe('C3');
      });

      it('handles large positive steps', () => {
        expect(movePitchVisual('C4', 14, 'C')).toBe('C6');
      });

      it('handles large negative steps', () => {
        expect(movePitchVisual('C4', -14, 'C')).toBe('C2');
      });

      it('crosses octave boundaries correctly', () => {
        expect(movePitchVisual('B4', 1, 'C')).toBe('C5');
        expect(movePitchVisual('C4', -1, 'C')).toBe('B3');
      });

      it('defaults to C major', () => {
        expect(movePitchVisual('E4', 1)).toBe('F4');
      });

      it('handles invalid input', () => {
        expect(movePitchVisual('invalid', 1, 'C')).toBe('invalid');
      });
    });
  });
});
