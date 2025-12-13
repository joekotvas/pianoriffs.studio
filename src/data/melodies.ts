import { Melody } from '@/types';

export const MELODIES: Melody[] = [
  {
    id: 'twinkle',
    title: 'Twinkle, Twinkle, Little Star',
    score: {
      title: "Twinkle, Twinkle, Little Star",
      timeSignature: '4/4',
      keySignature: 'C',
      bpm: 100,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'C',
          measures: [
            // Staff 1 (Soprano/Alto)
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 3, pitch: 'G4' }, { id: 4, pitch: 'C5' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 7, pitch: 'G4' }, { id: 8, pitch: 'C5' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 11, pitch: 'G4' }, { id: 12, pitch: 'G5' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 15, pitch: 'G4' }, { id: 16, pitch: 'G5' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 19, pitch: 'A4' }, { id: 20, pitch: 'A5' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 23, pitch: 'A4' }, { id: 24, pitch: 'A5' }] },
                { id: 203, duration: 'half', dotted: false, notes: [{ id: 27, pitch: 'G4' }, { id: 28, pitch: 'G5' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 31, pitch: 'G4' }, { id: 32, pitch: 'F5' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 35, pitch: 'G4' }, { id: 36, pitch: 'F5' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 39, pitch: 'G4' }, { id: 40, pitch: 'E5' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 43, pitch: 'G4' }, { id: 44, pitch: 'E5' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 47, pitch: 'G4' }, { id: 48, pitch: 'D5' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 51, pitch: 'G4' }, { id: 52, pitch: 'D5' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 55, pitch: 'G4' }, { id: 56, pitch: 'C5' }] }
              ]
            },
            // B Section
            {
              id: 5,
              events: [
                { id: 501, duration: 'quarter', dotted: false, notes: [{ id: 59, pitch: 'G4' }, { id: 60, pitch: 'G5' }] },
                { id: 502, duration: 'quarter', dotted: false, notes: [{ id: 63, pitch: 'G4' }, { id: 64, pitch: 'G5' }] },
                { id: 503, duration: 'quarter', dotted: false, notes: [{ id: 67, pitch: 'G4' }, { id: 68, pitch: 'F5' }] },
                { id: 504, duration: 'quarter', dotted: false, notes: [{ id: 71, pitch: 'G4' }, { id: 72, pitch: 'F5' }] }
              ]
            },
            {
              id: 6,
              events: [
                { id: 601, duration: 'quarter', dotted: false, notes: [{ id: 75, pitch: 'G4' }, { id: 76, pitch: 'E5' }] },
                { id: 602, duration: 'quarter', dotted: false, notes: [{ id: 79, pitch: 'G4' }, { id: 80, pitch: 'E5' }] },
                { id: 603, duration: 'half', dotted: false, notes: [{ id: 83, pitch: 'G4' }, { id: 84, pitch: 'D5' }] }
              ]
            },
            {
              id: 7,
              events: [
                { id: 701, duration: 'quarter', dotted: false, notes: [{ id: 87, pitch: 'G4' }, { id: 88, pitch: 'G5' }] },
                { id: 702, duration: 'quarter', dotted: false, notes: [{ id: 91, pitch: 'G4' }, { id: 92, pitch: 'G5' }] },
                { id: 703, duration: 'quarter', dotted: false, notes: [{ id: 95, pitch: 'G4' }, { id: 96, pitch: 'F5' }] },
                { id: 704, duration: 'quarter', dotted: false, notes: [{ id: 99, pitch: 'G4' }, { id: 100, pitch: 'F5' }] }
              ]
            },
            {
              id: 8,
              events: [
                { id: 801, duration: 'quarter', dotted: false, notes: [{ id: 103, pitch: 'G4' }, { id: 104, pitch: 'E5' }] },
                { id: 802, duration: 'quarter', dotted: false, notes: [{ id: 107, pitch: 'G4' }, { id: 108, pitch: 'E5' }] },
                { id: 803, duration: 'half', dotted: false, notes: [{ id: 111, pitch: 'G4' }, { id: 112, pitch: 'D5' }] }
              ]
            },
            // A Section Repeat
            {
              id: 9,
              events: [
                { id: 901, duration: 'quarter', dotted: false, notes: [{ id: 115, pitch: 'G4' }, { id: 116, pitch: 'C5' }] },
                { id: 902, duration: 'quarter', dotted: false, notes: [{ id: 119, pitch: 'G4' }, { id: 120, pitch: 'C5' }] },
                { id: 903, duration: 'quarter', dotted: false, notes: [{ id: 123, pitch: 'G4' }, { id: 124, pitch: 'G5' }] },
                { id: 904, duration: 'quarter', dotted: false, notes: [{ id: 127, pitch: 'G4' }, { id: 128, pitch: 'G5' }] }
              ]
            },
            {
              id: 10,
              events: [
                { id: 1001, duration: 'quarter', dotted: false, notes: [{ id: 131, pitch: 'A4' }, { id: 132, pitch: 'A5' }] },
                { id: 1002, duration: 'quarter', dotted: false, notes: [{ id: 135, pitch: 'A4' }, { id: 136, pitch: 'A5' }] },
                { id: 1003, duration: 'half', dotted: false, notes: [{ id: 139, pitch: 'G4' }, { id: 140, pitch: 'G5' }] }
              ]
            },
            {
              id: 11,
              events: [
                { id: 1101, duration: 'quarter', dotted: false, notes: [{ id: 143, pitch: 'G4' }, { id: 144, pitch: 'F5' }] },
                { id: 1102, duration: 'quarter', dotted: false, notes: [{ id: 147, pitch: 'G4' }, { id: 148, pitch: 'F5' }] },
                { id: 1103, duration: 'quarter', dotted: false, notes: [{ id: 151, pitch: 'G4' }, { id: 152, pitch: 'E5' }] },
                { id: 1104, duration: 'quarter', dotted: false, notes: [{ id: 155, pitch: 'G4' }, { id: 156, pitch: 'E5' }] }
              ]
            },
            {
              id: 12,
              events: [
                { id: 1201, duration: 'quarter', dotted: false, notes: [{ id: 159, pitch: 'G4' }, { id: 160, pitch: 'D5' }] },
                { id: 1202, duration: 'quarter', dotted: false, notes: [{ id: 163, pitch: 'G4' }, { id: 164, pitch: 'D5' }] },
                { id: 1203, duration: 'half', dotted: false, notes: [{ id: 167, pitch: 'G4' }, { id: 168, pitch: 'C5' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'C',
          measures: [
            // Staff 2 (Tenor/Bass - Transposed down 1 octave from original C4 start)
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 1, pitch: 'C3' }, { id: 2, pitch: 'E3' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 5, pitch: 'C3' }, { id: 6, pitch: 'E3' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 9, pitch: 'C3' }, { id: 10, pitch: 'E3' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 13, pitch: 'C3' }, { id: 14, pitch: 'E3' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 17, pitch: 'C3' }, { id: 18, pitch: 'F3' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 21, pitch: 'C3' }, { id: 22, pitch: 'F3' }] },
                { id: 203, duration: 'half', dotted: false, notes: [{ id: 25, pitch: 'C3' }, { id: 26, pitch: 'E3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 29, pitch: 'B2' }, { id: 30, pitch: 'D3' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 33, pitch: 'B2' }, { id: 34, pitch: 'D3' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 37, pitch: 'C3' }, { id: 38, pitch: 'E3' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 41, pitch: 'C3' }, { id: 42, pitch: 'E3' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 45, pitch: 'B2' }, { id: 46, pitch: 'D3' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 49, pitch: 'B2' }, { id: 50, pitch: 'D3' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 53, pitch: 'C3' }, { id: 54, pitch: 'E3' }] }
              ]
            },
            // B Section
            {
              id: 5,
              events: [
                { id: 501, duration: 'quarter', dotted: false, notes: [{ id: 57, pitch: 'C3' }, { id: 58, pitch: 'E3' }] },
                { id: 502, duration: 'quarter', dotted: false, notes: [{ id: 61, pitch: 'C3' }, { id: 62, pitch: 'E3' }] },
                { id: 503, duration: 'quarter', dotted: false, notes: [{ id: 65, pitch: 'B2' }, { id: 66, pitch: 'D3' }] },
                { id: 504, duration: 'quarter', dotted: false, notes: [{ id: 69, pitch: 'B2' }, { id: 70, pitch: 'D3' }] }
              ]
            },
            {
              id: 6,
              events: [
                { id: 601, duration: 'quarter', dotted: false, notes: [{ id: 73, pitch: 'C3' }, { id: 74, pitch: 'E3' }] },
                { id: 602, duration: 'quarter', dotted: false, notes: [{ id: 77, pitch: 'C3' }, { id: 78, pitch: 'E3' }] },
                { id: 603, duration: 'half', dotted: false, notes: [{ id: 81, pitch: 'B2' }, { id: 82, pitch: 'D3' }] }
              ]
            },
            {
              id: 7,
              events: [
                { id: 701, duration: 'quarter', dotted: false, notes: [{ id: 85, pitch: 'C3' }, { id: 86, pitch: 'E3' }] },
                { id: 702, duration: 'quarter', dotted: false, notes: [{ id: 89, pitch: 'C3' }, { id: 90, pitch: 'E3' }] },
                { id: 703, duration: 'quarter', dotted: false, notes: [{ id: 93, pitch: 'B2' }, { id: 94, pitch: 'D3' }] },
                { id: 704, duration: 'quarter', dotted: false, notes: [{ id: 97, pitch: 'B2' }, { id: 98, pitch: 'D3' }] }
              ]
            },
            {
              id: 8,
              events: [
                { id: 801, duration: 'quarter', dotted: false, notes: [{ id: 101, pitch: 'C3' }, { id: 102, pitch: 'E3' }] },
                { id: 802, duration: 'quarter', dotted: false, notes: [{ id: 105, pitch: 'C3' }, { id: 106, pitch: 'E3' }] },
                { id: 803, duration: 'half', dotted: false, notes: [{ id: 109, pitch: 'B2' }, { id: 110, pitch: 'D3' }] }
              ]
            },
            // A Section Repeat
            {
              id: 9,
              events: [
                { id: 901, duration: 'quarter', dotted: false, notes: [{ id: 113, pitch: 'C3' }, { id: 114, pitch: 'E3' }] },
                { id: 902, duration: 'quarter', dotted: false, notes: [{ id: 117, pitch: 'C3' }, { id: 118, pitch: 'E3' }] },
                { id: 903, duration: 'quarter', dotted: false, notes: [{ id: 121, pitch: 'C3' }, { id: 122, pitch: 'E3' }] },
                { id: 904, duration: 'quarter', dotted: false, notes: [{ id: 125, pitch: 'C3' }, { id: 126, pitch: 'E3' }] }
              ]
            },
            {
              id: 10,
              events: [
                { id: 1001, duration: 'quarter', dotted: false, notes: [{ id: 129, pitch: 'C3' }, { id: 130, pitch: 'F3' }] },
                { id: 1002, duration: 'quarter', dotted: false, notes: [{ id: 133, pitch: 'C3' }, { id: 134, pitch: 'F3' }] },
                { id: 1003, duration: 'half', dotted: false, notes: [{ id: 137, pitch: 'C3' }, { id: 138, pitch: 'E3' }] }
              ]
            },
            {
              id: 11,
              events: [
                { id: 1101, duration: 'quarter', dotted: false, notes: [{ id: 141, pitch: 'B2' }, { id: 142, pitch: 'D3' }] },
                { id: 1102, duration: 'quarter', dotted: false, notes: [{ id: 145, pitch: 'B2' }, { id: 146, pitch: 'D3' }] },
                { id: 1103, duration: 'quarter', dotted: false, notes: [{ id: 149, pitch: 'C3' }, { id: 150, pitch: 'E3' }] },
                { id: 1104, duration: 'quarter', dotted: false, notes: [{ id: 153, pitch: 'C3' }, { id: 154, pitch: 'E3' }] }
              ]
            },
            {
              id: 12,
              events: [
                { id: 1201, duration: 'quarter', dotted: false, notes: [{ id: 157, pitch: 'B2' }, { id: 158, pitch: 'D3' }] },
                { id: 1202, duration: 'quarter', dotted: false, notes: [{ id: 161, pitch: 'B2' }, { id: 162, pitch: 'D3' }] },
                { id: 1203, duration: 'half', dotted: false, notes: [{ id: 165, pitch: 'C3' }, { id: 166, pitch: 'E3' }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'amazing_grace',
    title: 'Amazing Grace',
    score: {
      title: "Amazing Grace",
      timeSignature: '3/4',
      keySignature: 'G',
      bpm: 72,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'G',
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 1, pitch: 'D4' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'half', dotted: false, notes: [{ id: 4, pitch: 'D4' }, { id: 5, pitch: 'G4' }] },
                { id: 202, duration: 'eighth', dotted: false, notes: [{ id: 7, pitch: 'D4' }, { id: 9, pitch: 'B4' }] }, // Re-voiced for clarity
                { id: 203, duration: 'eighth', dotted: false, notes: [{ id: 12, pitch: 'D4' }, { id: 13, pitch: 'G4' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'half', dotted: false, notes: [{ id: 16, pitch: 'G4' }, { id: 17, pitch: 'B4' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 20, pitch: 'A4' }, { id: 21, pitch: 'A4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'half', dotted: false, notes: [{ id: 24, pitch: 'D4' }, { id: 25, pitch: 'G4' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 28, pitch: 'G4' }, { id: 29, pitch: 'E4' }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: 'half', dotted: false, notes: [{ id: 32, pitch: 'D4' }, { id: 33, pitch: 'D4' }] },
                { id: 502, duration: 'quarter', dotted: false, notes: [{ id: 36, pitch: 'D4' }, { id: 37, pitch: 'D4' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'G',
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: 'quarter', dotted: false, isRest: true, notes: [] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'half', dotted: false, notes: [{ id: 2, pitch: 'G3' }, { id: 3, pitch: 'B3' }] },
                { id: 202, duration: 'eighth', dotted: false, notes: [{ id: 6, pitch: 'G3' }, { id: 8, pitch: 'G4' }] }, // Placeholder or G3
                { id: 203, duration: 'eighth', dotted: false, notes: [{ id: 10, pitch: 'G3' }, { id: 11, pitch: 'B3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'half', dotted: false, notes: [{ id: 14, pitch: 'G3' }, { id: 15, pitch: 'D4' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 18, pitch: 'D4' }, { id: 19, pitch: 'F#4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'half', dotted: false, notes: [{ id: 22, pitch: 'G3' }, { id: 23, pitch: 'B3' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 26, pitch: 'C4' }, { id: 27, pitch: 'E4' }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: 'half', dotted: false, notes: [{ id: 30, pitch: 'G3' }, { id: 31, pitch: 'B3' }] },
                { id: 502, duration: 'quarter', dotted: false, notes: [{ id: 34, pitch: 'G3' }, { id: 35, pitch: 'B3' }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'frere_jacques',
    title: 'Frère Jacques',
    score: {
      title: "Frère Jacques",
      timeSignature: '4/4',
      keySignature: 'C',
      bpm: 120,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'C',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 3, pitch: 'G4' }, { id: 4, pitch: 'C5' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 7, pitch: 'G4' }, { id: 8, pitch: 'D5' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 11, pitch: 'G4' }, { id: 12, pitch: 'E5' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 15, pitch: 'G4' }, { id: 16, pitch: 'C5' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 19, pitch: 'G4' }, { id: 20, pitch: 'C5' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 23, pitch: 'G4' }, { id: 24, pitch: 'D5' }] },
                { id: 203, duration: 'quarter', dotted: false, notes: [{ id: 27, pitch: 'G4' }, { id: 28, pitch: 'E5' }] },
                { id: 204, duration: 'quarter', dotted: false, notes: [{ id: 31, pitch: 'G4' }, { id: 32, pitch: 'C5' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 35, pitch: 'G4' }, { id: 36, pitch: 'E5' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 39, pitch: 'A4' }, { id: 40, pitch: 'F5' }] },
                { id: 303, duration: 'half', dotted: false, notes: [{ id: 43, pitch: 'G4' }, { id: 44, pitch: 'G5' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 47, pitch: 'G4' }, { id: 48, pitch: 'E5' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 51, pitch: 'A4' }, { id: 52, pitch: 'F5' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 55, pitch: 'G4' }, { id: 56, pitch: 'G5' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'C',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 1, pitch: 'C3' }, { id: 2, pitch: 'E3' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 5, pitch: 'B2' }, { id: 6, pitch: 'D3' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 9, pitch: 'C3' }, { id: 10, pitch: 'E3' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 13, pitch: 'C3' }, { id: 14, pitch: 'E3' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 17, pitch: 'C3' }, { id: 18, pitch: 'E3' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 21, pitch: 'B2' }, { id: 22, pitch: 'D3' }] },
                { id: 203, duration: 'quarter', dotted: false, notes: [{ id: 25, pitch: 'C3' }, { id: 26, pitch: 'E3' }] },
                { id: 204, duration: 'quarter', dotted: false, notes: [{ id: 29, pitch: 'C3' }, { id: 30, pitch: 'E3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 33, pitch: 'C3' }, { id: 34, pitch: 'E3' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 37, pitch: 'C3' }, { id: 38, pitch: 'F3' }] },
                { id: 303, duration: 'half', dotted: false, notes: [{ id: 41, pitch: 'C3' }, { id: 42, pitch: 'E3' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 45, pitch: 'C3' }, { id: 46, pitch: 'E3' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 49, pitch: 'C3' }, { id: 50, pitch: 'F3' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 53, pitch: 'C3' }, { id: 54, pitch: 'E3' }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    score: {
      title: "Greensleeves",
      timeSignature: '6/8',
      keySignature: 'C',
      bpm: 80,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'C',
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: 'eighth', dotted: false, notes: [{ id: 2, pitch: 'A4' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 5, pitch: 'C5' }] },
                { id: 202, duration: 'eighth', dotted: false, notes: [{ id: 8, pitch: 'D5' }] },
                { id: 203, duration: 'eighth', dotted: true, notes: [{ id: 11, pitch: 'E5' }] },
                { id: 204, duration: 'sixteenth', dotted: false, notes: [{ id: 14, pitch: 'F5' }] },
                { id: 205, duration: 'eighth', dotted: false, notes: [{ id: 17, pitch: 'E5' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 20, pitch: 'D5' }] },
                { id: 302, duration: 'eighth', dotted: false, notes: [{ id: 23, pitch: 'B4' }] },
                { id: 303, duration: 'eighth', dotted: true, notes: [{ id: 25, pitch: 'G4' }] },
                { id: 304, duration: 'sixteenth', dotted: false, notes: [{ id: 27, pitch: 'A4' }] },
                { id: 305, duration: 'eighth', dotted: false, notes: [{ id: 30, pitch: 'B4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 33, pitch: 'C5' }] },
                { id: 402, duration: 'eighth', dotted: false, notes: [{ id: 35, pitch: 'A4' }] },
                { id: 403, duration: 'eighth', dotted: true, notes: [{ id: 37, pitch: 'A4' }] },
                { id: 404, duration: 'sixteenth', dotted: false, notes: [{ id: 39, pitch: 'G#4' }] },
                { id: 405, duration: 'eighth', dotted: false, notes: [{ id: 42, pitch: 'A4' }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: 'quarter', dotted: false, notes: [{ id: 45, pitch: 'B4' }] },
                { id: 502, duration: 'eighth', dotted: false, notes: [{ id: 47, pitch: 'G#4' }] },
                { id: 503, duration: 'quarter', dotted: false, notes: [{ id: 48, pitch: 'E4' }] },
                { id: 504, duration: 'eighth', dotted: false, notes: [{ id: 50, pitch: 'A4' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'C',
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: 'eighth', dotted: false, notes: [{ id: 1, pitch: 'E3' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 3, pitch: 'E3' }, { id: 4, pitch: 'A3' }] },
                { id: 202, duration: 'eighth', dotted: false, notes: [{ id: 6, pitch: 'F3' }, { id: 7, pitch: 'A3' }] },
                { id: 203, duration: 'eighth', dotted: true, notes: [{ id: 9, pitch: 'E3' }, { id: 10, pitch: 'G#3' }] },
                { id: 204, duration: 'sixteenth', dotted: false, notes: [{ id: 12, pitch: 'F3' }, { id: 13, pitch: 'A3' }] },
                { id: 205, duration: 'eighth', dotted: false, notes: [{ id: 15, pitch: 'E3' }, { id: 16, pitch: 'G#3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 18, pitch: 'E3' }, { id: 19, pitch: 'G3' }] },
                { id: 302, duration: 'eighth', dotted: false, notes: [{ id: 21, pitch: 'D3' }, { id: 22, pitch: 'G3' }] },
                { id: 303, duration: 'eighth', dotted: true, notes: [{ id: 24, pitch: 'E3' }] },
                { id: 304, duration: 'sixteenth', dotted: false, notes: [{ id: 26, pitch: 'E3' }] },
                { id: 305, duration: 'eighth', dotted: false, notes: [{ id: 28, pitch: 'D3' }, { id: 29, pitch: 'G#3' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 31, pitch: 'E3' }, { id: 32, pitch: 'A3' }] },
                { id: 402, duration: 'eighth', dotted: false, notes: [{ id: 34, pitch: 'E3' }] },
                { id: 403, duration: 'eighth', dotted: true, notes: [{ id: 36, pitch: 'E3' }] },
                { id: 404, duration: 'sixteenth', dotted: false, notes: [{ id: 38, pitch: 'D3' }] },
                { id: 405, duration: 'eighth', dotted: false, notes: [{ id: 41, pitch: 'E3' }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: 'quarter', dotted: false, notes: [{ id: 43, pitch: 'D3' }, { id: 44, pitch: 'G#3' }] },
                { id: 502, duration: 'eighth', dotted: false, notes: [{ id: 46, pitch: 'D3' }] },
                { id: 503, duration: 'quarter', dotted: false, isRest: true, notes: [] }, // rest
                { id: 504, duration: 'eighth', dotted: false, notes: [{ id: 49, pitch: 'E3' }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'sakura',
    title: 'Sakura',
    score: {
      title: "Sakura",
      timeSignature: '4/4',
      keySignature: 'C',
      bpm: 60,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'C',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 2, pitch: 'A4' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 4, pitch: 'A4' }] },
                { id: 103, duration: 'half', dotted: false, notes: [{ id: 7, pitch: 'B4' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 9, pitch: 'A4' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 11, pitch: 'A4' }] },
                { id: 203, duration: 'half', dotted: false, notes: [{ id: 14, pitch: 'B4' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 16, pitch: 'A4' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 19, pitch: 'B4' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 21, pitch: 'A4' }, { id: 22, pitch: 'C5' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 25, pitch: 'B4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 27, pitch: 'A4' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 30, pitch: 'B4' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 32, pitch: 'A4' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'C',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 1, pitch: 'E3' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 3, pitch: 'E3' }] },
                { id: 103, duration: 'half', dotted: false, notes: [{ id: 5, pitch: 'E3' }, { id: 6, pitch: 'G#3' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 8, pitch: 'E3' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 10, pitch: 'E3' }] },
                { id: 203, duration: 'half', dotted: false, notes: [{ id: 12, pitch: 'E3' }, { id: 13, pitch: 'G#3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 15, pitch: 'E3' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 17, pitch: 'E3' }, { id: 18, pitch: 'G#3' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 20, pitch: 'E3' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 23, pitch: 'E3' }, { id: 24, pitch: 'G#3' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 26, pitch: 'E3' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 28, pitch: 'E3' }, { id: 29, pitch: 'G#3' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 31, pitch: 'E3' }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'old_macdonald',
    title: 'Old Macdonald',
    score: {
      title: "Old Macdonald Had a Farm",
      timeSignature: '4/4',
      keySignature: 'G',
      bpm: 120,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'G',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 3, pitch: 'D4' }, { id: 4, pitch: 'G4' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 7, pitch: 'D4' }, { id: 8, pitch: 'G4' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 11, pitch: 'D4' }, { id: 12, pitch: 'G4' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 15, pitch: 'D4' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 18, pitch: 'G4' }, { id: 19, pitch: 'E4' }] }, // C major chord -> C, E, G (in key G.. C natural?). Old macdonald is G major. C E G is C Major. B diminished? C major (IV).
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 22, pitch: 'G4' }, { id: 23, pitch: 'E4' }] },
                { id: 203, duration: 'half', dotted: false, notes: [{ id: 26, pitch: 'D4' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 29, pitch: 'G4' }, { id: 30, pitch: 'B4' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 33, pitch: 'G4' }, { id: 34, pitch: 'B4' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 36, pitch: 'F#4' }, { id: 37, pitch: 'A4' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 39, pitch: 'F#4' }, { id: 40, pitch: 'A4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'half', dotted: false, notes: [{ id: 43, pitch: 'D4' }, { id: 44, pitch: 'G4' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 47, pitch: 'D4' }] },
                { id: 403, duration: 'quarter', dotted: false, notes: [{ id: 50, pitch: 'D4' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'G',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 1, pitch: 'G3' }, { id: 2, pitch: 'B3' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 5, pitch: 'G3' }, { id: 6, pitch: 'B3' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 9, pitch: 'G3' }, { id: 10, pitch: 'B3' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 13, pitch: 'G3' }, { id: 14, pitch: 'B3' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 16, pitch: 'C4' }, { id: 17, pitch: 'E4' }] }, // C4, E4 -> Transpose down? C3, E3.
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 20, pitch: 'C4' }, { id: 21, pitch: 'E4' }] },
                { id: 203, duration: 'half', dotted: false, notes: [{ id: 24, pitch: 'G3' }, { id: 25, pitch: 'B3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 27, pitch: 'G3' }, { id: 28, pitch: 'D4' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 31, pitch: 'G3' }, { id: 32, pitch: 'D4' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 35, pitch: 'D4' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 38, pitch: 'D4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'half', dotted: false, notes: [{ id: 41, pitch: 'G3' }, { id: 42, pitch: 'B3' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 45, pitch: 'G3' }, { id: 46, pitch: 'B3' }] },
                { id: 403, duration: 'quarter', dotted: false, notes: [{ id: 48, pitch: 'G3' }, { id: 49, pitch: 'B3' }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'oh_susanna',
    title: 'Oh! Susanna',
    score: {
      title: "Oh! Susanna",
      timeSignature: '4/4',
      keySignature: 'D',
      bpm: 116,
      staves: [
        {
          id: 1,
          clef: 'treble',
          keySignature: 'D',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 3, pitch: 'A4' }, { id: 4, pitch: 'D4' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 7, pitch: 'G#4' }, { id: 8, pitch: 'E4' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 11, pitch: 'A4' }, { id: 12, pitch: 'F#4' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 15, pitch: 'A4' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 18, pitch: 'A4' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 20, pitch: 'G4' }, { id: 21, pitch: 'B4' }] },
                { id: 203, duration: 'quarter', dotted: false, notes: [{ id: 24, pitch: 'A4' }] },
                { id: 204, duration: 'quarter', dotted: false, notes: [{ id: 26, pitch: 'F#4' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 29, pitch: 'A4' }, { id: 30, pitch: 'D4' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 33, pitch: 'G#4' }, { id: 34, pitch: 'E4' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 37, pitch: 'A4' }, { id: 38, pitch: 'F#4' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 41, pitch: 'A4' }, { id: 42, pitch: 'F#4' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 45, pitch: 'G#4' }, { id: 46, pitch: 'E4' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 49, pitch: 'F#4' }, { id: 50, pitch: 'D4' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 53, pitch: 'G#4' }, { id: 54, pitch: 'E4' }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: 'bass',
          keySignature: 'D',
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: 'quarter', dotted: false, notes: [{ id: 1, pitch: 'D3' }, { id: 2, pitch: 'F#3' }] },
                { id: 102, duration: 'quarter', dotted: false, notes: [{ id: 5, pitch: 'B2' }, { id: 6, pitch: 'E3' }] },
                { id: 103, duration: 'quarter', dotted: false, notes: [{ id: 9, pitch: 'D3' }, { id: 10, pitch: 'F#3' }] },
                { id: 104, duration: 'quarter', dotted: false, notes: [{ id: 13, pitch: 'D3' }, { id: 14, pitch: 'F#3' }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: 'quarter', dotted: false, notes: [{ id: 16, pitch: 'D3' }, { id: 17, pitch: 'F#3' }] },
                { id: 202, duration: 'quarter', dotted: false, notes: [{ id: 19, pitch: 'D3' }] },
                { id: 203, duration: 'quarter', dotted: false, notes: [{ id: 22, pitch: 'D3' }, { id: 23, pitch: 'F#3' }] },
                { id: 204, duration: 'quarter', dotted: false, notes: [{ id: 25, pitch: 'D3' }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: 'quarter', dotted: false, notes: [{ id: 27, pitch: 'D3' }, { id: 28, pitch: 'F#3' }] },
                { id: 302, duration: 'quarter', dotted: false, notes: [{ id: 31, pitch: 'B2' }, { id: 32, pitch: 'E3' }] },
                { id: 303, duration: 'quarter', dotted: false, notes: [{ id: 35, pitch: 'D3' }, { id: 36, pitch: 'F#3' }] },
                { id: 304, duration: 'quarter', dotted: false, notes: [{ id: 39, pitch: 'D3' }, { id: 40, pitch: 'F#3' }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: 'quarter', dotted: false, notes: [{ id: 43, pitch: 'B2' }, { id: 44, pitch: 'E3' }] },
                { id: 402, duration: 'quarter', dotted: false, notes: [{ id: 47, pitch: 'A2' }, { id: 48, pitch: 'D3' }] },
                { id: 403, duration: 'half', dotted: false, notes: [{ id: 51, pitch: 'B2' }, { id: 52, pitch: 'E3' }] }
              ]
            }
          ]
        }
      ]
    }
  }
];
