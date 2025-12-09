/**
 * Unit tests for MusicService
 * 
 * Tests cover:
 * - Pitch operations (frequency, MIDI, normalization)
 * - Transposition
 * - Key signature operations
 * - Accidental detection
 * - Scale-aware movement
 */

import {
  getFrequency,
  getMidi,
  midiToPitch,
  getStaffPitch,
  getPitchClass,
  getOctave,
  transpose,
  transposeBySemitones,
  getScaleNotes,
  getKeyAlteration,
  needsAccidental,
  getNextScaleDegree,
  applyKeySignature,
  getInterval,
  getSemitones,
} from '../MusicService';

describe('MusicService', () => {
  // ==========================================================================
  // PITCH OPERATIONS
  // ==========================================================================

  describe('getFrequency', () => {
    it('returns correct frequency for A4', () => {
      expect(getFrequency('A4')).toBe(440);
    });

    it('returns correct frequency for C4', () => {
      expect(getFrequency('C4')).toBeCloseTo(261.63, 1);
    });

    it('handles sharps correctly', () => {
      expect(getFrequency('F#4')).toBeCloseTo(369.99, 1);
    });

    it('handles flats correctly', () => {
      expect(getFrequency('Bb4')).toBeCloseTo(466.16, 1);
    });

    it('returns 0 for invalid pitch', () => {
      expect(getFrequency('invalid')).toBe(0);
    });
  });

  describe('getMidi', () => {
    it('returns 60 for middle C', () => {
      expect(getMidi('C4')).toBe(60);
    });

    it('returns 69 for A4', () => {
      expect(getMidi('A4')).toBe(69);
    });

    it('handles sharps', () => {
      expect(getMidi('C#4')).toBe(61);
    });

    it('handles flats', () => {
      expect(getMidi('Db4')).toBe(61);
    });
  });

  describe('midiToPitch', () => {
    it('converts 60 to C4', () => {
      expect(midiToPitch(60)).toBe('C4');
    });

    it('converts 61 to Db4 (Tonal uses flats)', () => {
      expect(midiToPitch(61)).toBe('Db4');
    });

    it('handles octave boundaries', () => {
      expect(midiToPitch(48)).toBe('C3');
      expect(midiToPitch(72)).toBe('C5');
    });
  });

  describe('getStaffPitch', () => {
    it('strips sharp from pitch', () => {
      expect(getStaffPitch('F#4')).toBe('F4');
    });

    it('strips flat from pitch', () => {
      expect(getStaffPitch('Bb3')).toBe('B3');
    });

    it('leaves natural pitches unchanged', () => {
      expect(getStaffPitch('C4')).toBe('C4');
    });
  });

  describe('getPitchClass', () => {
    it('extracts pitch class with sharp', () => {
      expect(getPitchClass('C#4')).toBe('C#');
    });

    it('extracts pitch class with flat', () => {
      expect(getPitchClass('Bb3')).toBe('Bb');
    });

    it('extracts natural pitch class', () => {
      expect(getPitchClass('G5')).toBe('G');
    });
  });

  describe('getOctave', () => {
    it('returns correct octave', () => {
      expect(getOctave('C4')).toBe(4);
      expect(getOctave('F#5')).toBe(5);
      expect(getOctave('Bb2')).toBe(2);
    });
  });

  // ==========================================================================
  // TRANSPOSITION
  // ==========================================================================

  describe('transpose', () => {
    it('transposes up by perfect fifth', () => {
      expect(transpose('C4', 'P5')).toBe('G4');
    });

    it('transposes by major second', () => {
      expect(transpose('C4', 'M2')).toBe('D4');
    });

    it('transposes down by octave', () => {
      expect(transpose('C4', '-8P')).toBe('C3');
    });
  });

  describe('transposeBySemitones', () => {
    it('transposes up by 1 semitone', () => {
      expect(transposeBySemitones('C4', 1)).toBe('Db4'); // Tonal uses flats
    });

    it('transposes down by 1 semitone', () => {
      expect(transposeBySemitones('C4', -1)).toBe('B3');
    });

    it('transposes by octave', () => {
      expect(transposeBySemitones('C4', 12)).toBe('C5');
      expect(transposeBySemitones('C4', -12)).toBe('C3');
    });
  });

  // ==========================================================================
  // KEY SIGNATURE OPERATIONS
  // ==========================================================================

  describe('getScaleNotes', () => {
    it('returns C major scale', () => {
      expect(getScaleNotes('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    it('returns G major scale with F#', () => {
      const scale = getScaleNotes('G');
      expect(scale).toContain('F#');
      expect(scale).not.toContain('F');
    });

    it('returns F major scale with Bb', () => {
      const scale = getScaleNotes('F');
      expect(scale).toContain('Bb');
      expect(scale).not.toContain('B');
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

  describe('needsAccidental', () => {
    describe('in G major (F# diatonic)', () => {
      it('F# does not need accidental', () => {
        const result = needsAccidental('F#4', 'G');
        expect(result.show).toBe(false);
      });

      it('F natural needs natural accidental', () => {
        const result = needsAccidental('F4', 'G');
        expect(result.show).toBe(true);
        expect(result.type).toBe('natural');
      });
    });

    describe('in C major (no accidentals)', () => {
      it('F natural does not need accidental', () => {
        const result = needsAccidental('F4', 'C');
        expect(result.show).toBe(false);
      });

      it('F# needs sharp accidental', () => {
        const result = needsAccidental('F#4', 'C');
        expect(result.show).toBe(true);
        expect(result.type).toBe('sharp');
      });

      it('Bb needs flat accidental', () => {
        const result = needsAccidental('Bb4', 'C');
        expect(result.show).toBe(true);
        expect(result.type).toBe('flat');
      });
    });

    describe('in F major (Bb diatonic)', () => {
      it('Bb does not need accidental', () => {
        const result = needsAccidental('Bb4', 'F');
        expect(result.show).toBe(false);
      });

      it('B natural needs natural accidental', () => {
        const result = needsAccidental('B4', 'F');
        expect(result.show).toBe(true);
        expect(result.type).toBe('natural');
      });
    });
  });

  // ==========================================================================
  // SCALE-AWARE MOVEMENT
  // ==========================================================================

  describe('getNextScaleDegree', () => {
    describe('in C major', () => {
      it('moves C to D going up', () => {
        expect(getNextScaleDegree('C4', 'C', 'up')).toBe('D4');
      });

      it('moves E to F going up', () => {
        expect(getNextScaleDegree('E4', 'C', 'up')).toBe('F4');
      });

      it('moves B to C going up (octave change)', () => {
        expect(getNextScaleDegree('B4', 'C', 'up')).toBe('C5');
      });

      it('moves C to B going down (octave change)', () => {
        expect(getNextScaleDegree('C4', 'C', 'down')).toBe('B3');
      });
    });

    describe('in G major', () => {
      it('moves F# to G going up', () => {
        expect(getNextScaleDegree('F#4', 'G', 'up')).toBe('G4');
      });

      it('moves E to F# going up', () => {
        expect(getNextScaleDegree('E4', 'G', 'up')).toBe('F#4');
      });
    });

    describe('chromatic pitches', () => {
      it('transposes C# by semitone in C major', () => {
        expect(getNextScaleDegree('C#4', 'C', 'up')).toBe('D4');
      });

      it('transposes Eb by semitone in C major down', () => {
        expect(getNextScaleDegree('Eb4', 'C', 'down')).toBe('D4');
      });
    });
  });

  describe('applyKeySignature', () => {
    it('applies F# in G major', () => {
      expect(applyKeySignature('F4', 'G')).toBe('F#4');
    });

    it('applies Bb in F major', () => {
      expect(applyKeySignature('B4', 'F')).toBe('Bb4');
    });

    it('leaves C unchanged in C major', () => {
      expect(applyKeySignature('C4', 'C')).toBe('C4');
    });
  });

  // ==========================================================================
  // INTERVAL OPERATIONS
  // ==========================================================================

  describe('getInterval', () => {
    it('identifies perfect fifth', () => {
      expect(getInterval('C4', 'G4')).toBe('5P');
    });

    it('identifies major third', () => {
      expect(getInterval('C4', 'E4')).toBe('3M');
    });
  });

  describe('getSemitones', () => {
    it('returns 7 for perfect fifth', () => {
      expect(getSemitones('5P')).toBe(7);
    });

    it('returns 4 for major third', () => {
      expect(getSemitones('3M')).toBe(4);
    });
  });
});
