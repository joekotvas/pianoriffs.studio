// @ts-nocheck
import { NOTE_TYPES } from '../constants';
import { getActiveStaff } from '../types';

// ABC notation pitch mapping - Algorithmic
const toAbcPitch = (pitch: string, clef: string = 'treble'): string => {
  // Extract letter and octave
  const match = pitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
  if (!match) return 'C'; // Fallback

  const letter = match[1];
  const octave = parseInt(match[3], 10);
  
  // ABC Logic:
  // C4 (Middle C) -> C
  // c (C5) -> c
  // c' (C6) -> c'
  // C, (C3) -> C,
  
  let abcPitch = "";
  
  if (octave >= 5) {
      abcPitch = letter.toLowerCase();
      if (octave > 5) {
          abcPitch += "'".repeat(octave - 5);
      }
  } else {
      abcPitch = letter.toUpperCase();
      if (octave < 4) {
          abcPitch += ",".repeat(4 - octave);
      }
  }
  
  return abcPitch;
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

                if (event.notes.length === 0 || event.isRest || (event.notes.length === 1 && event.notes[0].pitch === null)) {
                    // Rest
                    abc += `${prefix}z${durationString} `;
                } else {
                    // Notes/Chords
                    const formatNote = (n: any) => {
                        let acc = '';
                        // 1. Check explicit property
                        if (n.accidental === 'sharp') acc = '^';
                        else if (n.accidental === 'flat') acc = '_';
                        else if (n.accidental === 'natural') acc = '=';
                        else if (n.accidental === 'double-sharp') acc = '^^';
                        else if (n.accidental === 'double-flat') acc = '__';
                        
                        // 2. Fallback: Check Pitch String
                        // If no explicit accidental property, parse from "F#4", "Bb4", etc.
                        if (!acc) {
                            // Match accidentals: #, ##, b, bb anywhere in string
                            if (n.pitch.includes('##')) acc = '^^';
                            else if (n.pitch.includes('#')) acc = '^';
                            else if (n.pitch.includes('bb')) acc = '__';
                            else if (n.pitch.includes('b')) acc = '_'; // Note: Be careful with 'b' vs flat symbol if stored as unicode, but usually it's 'b'. Tonal uses 'b'.
                        }
                        
                        const pitch = toAbcPitch(n.pitch, clef);
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
