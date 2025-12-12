// @ts-nocheck
import React from 'react';

/**
 * SMuFL (Standard Music Font Layout) codepoints for common music symbols.
 * Reference: https://w3c.github.io/smufl/latest/tables/
 */
export const SMUFL = {
  // Rests
  restWhole: '\uE4E3',
  restHalf: '\uE4E4',
  restQuarter: '\uE4E5',
  rest8th: '\uE4E6',
  rest16th: '\uE4E7',
  rest32nd: '\uE4E8',
  rest64th: '\uE4E9',
  rest128th: '\uE4EA',

  // Noteheads
  noteheadWhole: '\uE0A2',
  noteheadHalf: '\uE0A3',
  noteheadBlack: '\uE0A4',
  noteheadDoubleWhole: '\uE0A0',

  // Clefs
  gClef: '\uE050',
  fClef: '\uE062',
  cClef: '\uE05C',

  // Accidentals
  accidentalFlat: '\uE260',
  accidentalNatural: '\uE261',
  accidentalSharp: '\uE262',
  accidentalDoubleFlat: '\uE264',
  accidentalDoubleSharp: '\uE263',

  // Flags
  flag8thUp: '\uE240',
  flag8thDown: '\uE241',
  flag16thUp: '\uE242',
  flag16thDown: '\uE243',
  flag32ndUp: '\uE244',
  flag32ndDown: '\uE245',

  // Time Signatures
  timeSig0: '\uE080',
  timeSig1: '\uE081',
  timeSig2: '\uE082',
  timeSig3: '\uE083',
  timeSig4: '\uE084',
  timeSig5: '\uE085',
  timeSig6: '\uE086',
  timeSig7: '\uE087',
  timeSig8: '\uE088',
  timeSig9: '\uE089',

  // Dynamics
  dynamicPiano: '\uE520',
  dynamicMezzo: '\uE521',
  dynamicForte: '\uE522',
  dynamicPianissimo: '\uE52B',
  dynamicFortissimo: '\uE52F',

  // Articulations
  articAccentAbove: '\uE4A0',
  articStaccatoAbove: '\uE4A2',
  articTenutoAbove: '\uE4A4',
  articMarcatoAbove: '\uE4AC',
};

/**
 * Test component to verify Bravura font rendering.
 * Displays common music symbols using the SMuFL codepoints.
 */
const BravuraTest: React.FC = () => {
  const fontStyle = {
    fontFamily: 'Bravura, serif',
    fontSize: '48px',
    lineHeight: 1,
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  };

  const glyphStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #eee',
    borderRadius: '8px',
    minWidth: '80px',
  };

  const sectionStyle = {
    marginBottom: '32px',
  };

  const gridStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>Bravura Font Test</h1>

      {/* Rests */}
      <section style={sectionStyle}>
        <h2>Rests</h2>
        <div style={gridStyle}>
          {['restWhole', 'restHalf', 'restQuarter', 'rest8th', 'rest16th', 'rest32nd'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={fontStyle}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Noteheads */}
      <section style={sectionStyle}>
        <h2>Noteheads</h2>
        <div style={gridStyle}>
          {['noteheadDoubleWhole', 'noteheadWhole', 'noteheadHalf', 'noteheadBlack'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={fontStyle}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Clefs */}
      <section style={sectionStyle}>
        <h2>Clefs</h2>
        <div style={gridStyle}>
          {['gClef', 'fClef', 'cClef'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={{ ...fontStyle, fontSize: '64px' }}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Accidentals */}
      <section style={sectionStyle}>
        <h2>Accidentals</h2>
        <div style={gridStyle}>
          {['accidentalDoubleFlat', 'accidentalFlat', 'accidentalNatural', 'accidentalSharp', 'accidentalDoubleSharp'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={fontStyle}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Flags */}
      <section style={sectionStyle}>
        <h2>Flags</h2>
        <div style={gridStyle}>
          {['flag8thUp', 'flag8thDown', 'flag16thUp', 'flag16thDown', 'flag32ndUp', 'flag32ndDown'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={fontStyle}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Time Signature Digits */}
      <section style={sectionStyle}>
        <h2>Time Signature Digits</h2>
        <div style={gridStyle}>
          {['timeSig0', 'timeSig1', 'timeSig2', 'timeSig3', 'timeSig4', 'timeSig5', 'timeSig6', 'timeSig7', 'timeSig8', 'timeSig9'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={fontStyle}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamics */}
      <section style={sectionStyle}>
        <h2>Dynamics</h2>
        <div style={gridStyle}>
          {['dynamicPianissimo', 'dynamicPiano', 'dynamicMezzo', 'dynamicForte', 'dynamicFortissimo'].map(name => (
            <div key={name} style={glyphStyle}>
              <span style={fontStyle}>{SMUFL[name]}</span>
              <span style={labelStyle}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SVG Rendering Test */}
      <section style={sectionStyle}>
        <h2>SVG Rendering Test</h2>
        <svg width="400" height="120" style={{ border: '1px solid #ccc', background: '#fafafa' }}>
          {/* Staff lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="20" y1={30 + i * 12} x2="380" y2={30 + i * 12} stroke="#000" strokeWidth="1" />
          ))}
          
          {/* G Clef */}
          <text x="30" y="78" style={{ fontFamily: 'Bravura', fontSize: '64px' }}>{SMUFL.gClef}</text>
          
          {/* Quarter note head on middle line */}
          <text x="120" y="54" style={{ fontFamily: 'Bravura', fontSize: '40px' }}>{SMUFL.noteheadBlack}</text>
          
          {/* Quarter rest */}
          <text x="180" y="66" style={{ fontFamily: 'Bravura', fontSize: '40px' }}>{SMUFL.restQuarter}</text>
          
          {/* Eighth rest */}
          <text x="240" y="54" style={{ fontFamily: 'Bravura', fontSize: '40px' }}>{SMUFL.rest8th}</text>
          
          {/* Half rest */}
          <text x="300" y="54" style={{ fontFamily: 'Bravura', fontSize: '40px' }}>{SMUFL.restHalf}</text>
        </svg>
      </section>
    </div>
  );
};

export default BravuraTest;
