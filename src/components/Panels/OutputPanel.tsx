import React, { useMemo, useState } from 'react';
import { Music, Copy, Check } from 'lucide-react';
import { generateABC } from '../../exporters/abcExporter';
import { generateJSON } from '../../exporters/jsonExporter';
import { generateMusicXML } from '../../exporters/musicXmlExporter';
import { useTheme } from '../../context/ThemeContext';

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="text-xs px-2 py-1 rounded ml-auto flex items-center gap-1 transition-colors border"
      style={{
        backgroundColor: theme.buttonBackground,
        borderColor: theme.border,
        color: theme.text
      }}
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      <span className={copied ? "text-green-400" : ""}>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
};

const OutputPanel = ({ score, bpm }: { score: any, bpm: number }) => {
  const abcOutput = useMemo(() => generateABC(score, bpm), [score, bpm]);
  const jsonOutput = useMemo(() => generateJSON(score), [score]);
  const musicXmlOutput = useMemo(() => generateMusicXML(score), [score]);
  const { theme } = useTheme();

  return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded border"
          style={{ 
            backgroundColor: theme.panelBackground, 
            borderColor: theme.border 
          }}
        >
           <h4 
             className="text-xs font-bold uppercase mb-2 flex items-center gap-2"
             style={{ color: theme.secondaryText }}
           >
             <Music size={12} /> ABC Notation
             <CopyButton text={abcOutput} />
           </h4>
           <textarea 
             readOnly 
             value={abcOutput} 
             className="w-full h-48 text-xs font-mono p-2 border rounded outline-none resize-none"
             style={{
               backgroundColor: theme.background,
               borderColor: theme.border,
               color: theme.text,
               // Note: focus ring color is harder to dynamicize with inline styles without CSS variables or styled-components.
               // For now, we'll rely on a generic focus style or just the border color change if we added one.
             }}
           />
        </div>
        <div 
          className="p-4 rounded border"
          style={{ 
            backgroundColor: theme.panelBackground, 
            borderColor: theme.border 
          }}
        >
           <h4 
             className="text-xs font-bold uppercase mb-2 flex items-center justify-between"
             style={{ color: theme.secondaryText }}
           >
             JSON
             <CopyButton text={jsonOutput} />
           </h4>
           <textarea 
             readOnly 
             value={jsonOutput} 
             className="w-full h-48 text-xs font-mono p-2 border rounded outline-none resize-none"
             style={{
               backgroundColor: theme.background,
               borderColor: theme.border,
               color: theme.text,
               // Note: focus ring color is harder to dynamicize with inline styles without CSS variables or styled-components.
               // For now, we'll rely on a generic focus style or just the border color change if we added one.
             }}
           />
        </div>
        <div 
          className="p-4 rounded border"
          style={{ 
            backgroundColor: theme.panelBackground, 
            borderColor: theme.border 
          }}
        >
           <h4 
             className="text-xs font-bold uppercase mb-2 flex items-center justify-between"
             style={{ color: theme.secondaryText }}
           >
             MusicXML
             <CopyButton text={musicXmlOutput} />
           </h4>
           <textarea 
             readOnly 
             value={musicXmlOutput} 
             className="w-full h-48 text-xs font-mono p-2 border rounded outline-none resize-none"
             style={{
               backgroundColor: theme.background,
               borderColor: theme.border,
               color: theme.text,
             }}
           />
        </div>
      </div>
  );
};

export default OutputPanel;
