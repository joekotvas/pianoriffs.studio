// @ts-nocheck
import { NOTE_TYPES, KEY_SIGNATURES } from '../constants';
import { getActiveStaff } from '../types';
import { isRestEvent } from '../utils/core';

export const generateMusicXML = (score: any) => {
    // Phase 2: Iterate over all staves
    const staves = score.staves || [getActiveStaff(score)];
    const timeSig = score.timeSignature || '4/4';
    
    // Calculate Key Signature Fifths (Global)
    const keySigData = KEY_SIGNATURES[score.keySignature || 'C'];
    let fifths = 0;
    if (keySigData) {
        fifths = keySigData.type === 'sharp' ? keySigData.count : -keySigData.count;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>`;

    // Generate Part List
    staves.forEach((_, index) => {
        const id = index + 1;
        xml += `
    <score-part id="P${id}">
      <part-name>Staff ${id}</part-name>
    </score-part>`;
    });

    xml += `
  </part-list>`;

    // Generate Parts
    staves.forEach((staff: any, staffIndex: number) => {
        const partId = `P${staffIndex + 1}`;
        const clef = staff.clef || 'treble';
        // Clef logic
        const clefSign = clef === 'bass' ? 'F' : 'G';
        const clefLine = clef === 'bass' ? '4' : '2';

        // Track active ties specific to this part
        const activeTies = new Set<string>();

        xml += `
  <part id="${partId}">`;

        staff.measures.forEach((measure: any, mIndex: number) => {
            xml += `\n    <measure number="${mIndex + 1}">`;
            
            // Attributes appear on first measure
            if (mIndex === 0) {
                xml += `
    <attributes>
      <divisions>16</divisions>
      <key>
        <fifths>${fifths}</fifths>
      </key>
      <time>
        <beats>${timeSig.split('/')[0]}</beats>
        <beat-type>${timeSig.split('/')[1]}</beat-type>
      </time>
      <clef>
        <sign>${clefSign}</sign>
        <line>${clefLine}</line>
      </clef>
    </attributes>`;
            }

            // Render Events sequentially
            measure.events.forEach((event: any) => {
                let duration = NOTE_TYPES[event.duration].duration;
                if (event.dotted) duration = duration * 1.5;
                
                // Tuplet Duration Scaling
                if (event.tuplet) {
                     duration = Math.floor(duration * event.tuplet.ratio[1] / event.tuplet.ratio[0]);
                }

                const xmlType = NOTE_TYPES[event.duration].xmlType;

                if (isRestEvent(event)) {
                    // REST
                    xml += `
    <note>
      <rest/>
      <duration>${duration}</duration>
      <type>${xmlType}</type>
      ${event.dotted ? '<dot/>' : ''}
    </note>`;
                } else {
                    // NOTES / CHORDS
                    event.notes.forEach((note: any, nIndex: number) => {
                       const isChord = nIndex > 0;
                       const step = note.pitch.charAt(0);
                       const octave = note.pitch.slice(-1);
                       
                       let accidentalTag = '';
                       if (note.accidental) {
                           const acc = note.accidental === 'natural' ? 'natural' : 
                                       note.accidental === 'sharp' ? 'sharp' : 
                                       note.accidental === 'flat' ? 'flat' : '';
                           if (acc) accidentalTag = `<accidental>${acc}</accidental>`;
                       }

                       // Tie Logic
                       let tieTags = '';
                       let tiedNotations = '';
                       const pitchKey = note.pitch;
                       
                       if (activeTies.has(pitchKey)) {
                           tieTags += '<tie type="stop"/>';
                           tiedNotations += '<tied type="stop"/>';
                       }
                       
                       if (note.tied) {
                           tieTags += '<tie type="start"/>';
                           tiedNotations += '<tied type="start"/>';
                           activeTies.add(pitchKey);
                       } else {
                           if (activeTies.has(pitchKey)) {
                               activeTies.delete(pitchKey);
                           }
                       }
                       
                       if (tiedNotations) {
                           tiedNotations = `<notations>${tiedNotations}</notations>`;
                       }

                       // Tuplet Logic
                       let timeModTag = '';
                       let tupletNotations = '';
                       if (event.tuplet) {
                           timeModTag = `
      <time-modification>
        <actual-notes>${event.tuplet.groupSize}</actual-notes>
        <normal-notes>${event.tuplet.ratio[1]}</normal-notes>
      </time-modification>`;
                           
                           if (event.tuplet.position === 0) {
                               const tupTag = '<tuplet type="start" bracket="yes"/>';
                               if (tiedNotations) {
                                   tupletNotations = tupTag;
                               } else {
                                   tupletNotations = `<notations>${tupTag}</notations>`;
                               }
                           } else if (event.tuplet.position === event.tuplet.groupSize - 1) {
                                const tupTag = '<tuplet type="stop"/>';
                                if (tiedNotations) {
                                    tupletNotations = tupTag;
                                } else {
                                    tupletNotations = `<notations>${tupTag}</notations>`;
                                }
                           }
                       }
                       
                       // Merge notations
                       let finalNotations = tiedNotations;
                       if (tupletNotations) {
                           if (finalNotations) {
                               const content = tupletNotations.replace('<notations>', '').replace('</notations>', '');
                               finalNotations = finalNotations.replace('</notations>', `${content}</notations>`);
                           } else {
                               finalNotations = tupletNotations;
                           }
                       }

                       xml += `
    <note>
      ${isChord ? '<chord/>' : ''}
      <pitch>
        <step>${step}</step>
        <octave>${octave}</octave>
      </pitch>
      <duration>${duration}</duration>
      <type>${xmlType}</type>
      ${accidentalTag}
      ${timeModTag}
      ${event.dotted ? '<dot/>' : ''}
      ${tieTags}
      ${finalNotations}
    </note>`;
                    });
                }
            });
            xml += `\n    </measure>`;
        });
        xml += `\n  </part>`;
    });

    xml += `\n</score-partwise>`;
    return xml;
};
