// @ts-nocheck
import { NOTE_TYPES } from '../constants';
import { getActiveStaff } from '../types';

// ABC notation pitch mapping - Treble clef (C3 to G6)
const ABC_PITCH_MAP_TREBLE: Record<string, string> = {
  'C3': 'C,', 'D3': 'D,', 'E3': 'E,', 'F3': 'F,', 'G3': 'G,', 'A3': 'A,', 'B3': 'B,',
  'C4': 'C', 'D4': 'D', 'E4': 'E', 'F4': 'F', 'G4': 'G', 'A4': 'A', 'B4': 'B',
  'C5': 'c', 'D5': 'd', 'E5': 'e', 'F5': 'f', 'G5': 'g', 'A5': 'a', 'B5': 'b',
  'C6': "c'", 'D6': "d'", 'E6': "e'", 'F6': "f'", 'G6': "g'"
};

// ABC notation pitch mapping - Bass clef (E1 to B4)
const ABC_PITCH_MAP_BASS: Record<string, string> = {
  'E1': 'E,,,', 'F1': 'F,,,', 'G1': 'G,,,', 'A1': 'A,,,', 'B1': 'B,,,',
  'C2': 'C,,', 'D2': 'D,,', 'E2': 'E,,', 'F2': 'F,,', 'G2': 'G,,', 'A2': 'A,,', 'B2': 'B,,',
  'C3': 'C,', 'D3': 'D,', 'E3': 'E,', 'F3': 'F,', 'G3': 'G,', 'A3': 'A,', 'B3': 'B,',
  'C4': 'C', 'D4': 'D', 'E4': 'E', 'F4': 'F', 'G4': 'G', 'A4': 'A', 'B4': 'B'
};

const getAbcPitchMap = (clef: string): Record<string, string> => {
  return clef === 'bass' ? ABC_PITCH_MAP_BASS : ABC_PITCH_MAP_TREBLE;
};

export const generateABC = (score: any, bpm: number) => {
    // Phase 2: Iterate over all staves
    const staves = score.staves || [getActiveStaff(score)]; // Fallback for safety
    const timeSig = score.timeSignature || '4/4';
    const keySig = score.keySignature || 'C';
    
    // Header
    let abc = `X:1\nT:${score.title}\nM:${timeSig}\nL:1/4\nK:${keySig}\nQ:1/4=${bpm}\n`;
    
    // Staves definition if multiple
    if (staves.length > 1) {
        abc += `%%staves {${staves.map((_, i) => i + 1).join(' ')}}\n`;
    }

    staves.forEach((staff: any, staffIndex: number) => {
        const clef = staff.clef || 'treble';
        const abcClef = clef === 'bass' ? 'bass' : 'treble';
        const pitchMap = getAbcPitchMap(clef);
        const voiceId = staffIndex + 1;
        
        // Voice Header
        abc += `V:${voiceId} clef=${abcClef}\n`;
        
        staff.measures.forEach((measure: any, i: number) => {
            measure.events.forEach((event: any) => {
                // Calculate Duration
                let durationString = '';
                const base = NOTE_TYPES[event.duration]?.abcDuration || '';
          
                if (event.dotted) {
                    // Handle dotted durations explicitly
                    switch (event.duration) {
                        case 'whole': durationString = '6'; break;
                        case 'half': durationString = '3'; break;
                        case 'quarter': durationString = '3/2'; break;
                        case 'eighth': durationString = '3/4'; break;
                        case 'sixteenth': durationString = '3/8'; break;
                        case 'thirtysecond': durationString = '3/16'; break;
                        case 'sixtyfourth': durationString = '3/32'; break;
                        default: durationString = base;
                     }
                } else {
                    durationString = base;
                }

                let prefix = '';
                // Handle Tuplets
                if (event.tuplet && event.tuplet.position === 0) {
                     prefix += `(${event.tuplet.ratio[0]}`;
                }

                if (event.notes.length === 0) {
                    // Rest
                    abc += `${prefix}z${durationString} `;
                } else {
                    // Notes/Chords
                    const formatNote = (n: any) => {
                        let acc = '';
                        if (n.accidental === 'sharp') acc = '^';
                        else if (n.accidental === 'flat') acc = '_';
                        else if (n.accidental === 'natural') acc = '=';
                        
                        const pitch = pitchMap[n.pitch] || 'c';
                        const tie = n.tied ? '-' : '';
                        return `${acc}${pitch}${tie}`;
                    };

                    if (event.notes.length > 1) {
                        const chordContent = event.notes.map(formatNote).join("");
                        abc += `${prefix}[${chordContent}]${durationString} `;
                    } else {
                        const noteContent = formatNote(event.notes[0]);
                        abc += `${prefix}${noteContent}${durationString} `;
                    }
                }
            });
            abc += "| ";
            if ((i + 1) % 4 === 0) abc += "\n";
        });
        abc += "\n"; // Newline after each voice/staff block
    });

    return abc;
};
