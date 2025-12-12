import { useMemo, useCallback } from 'react';
import { Score } from '../types';
import { generateJSON } from '../exporters/jsonExporter';
import { generateABC } from '../exporters/abcExporter';
import { generateMusicXML } from '../exporters/musicXmlExporter';

export type ExportFormat = 'json' | 'abc' | 'musicxml';

interface FileInfo {
  filename: string;
  mimeType: string;
  extension: string;
}

const getFileInfo = (format: ExportFormat, title: string): FileInfo => {
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_') || 'untitled';
  
  switch (format) {
    case 'json':
      return { filename: `${safeTitle}.json`, mimeType: 'application/json', extension: '.json' };
    case 'abc':
      return { filename: `${safeTitle}.abc`, mimeType: 'text/plain', extension: '.abc' };
    case 'musicxml':
      return { filename: `${safeTitle}.musicxml`, mimeType: 'application/vnd.recordare.musicxml+xml', extension: '.musicxml' };
  }
};

export function useExport(score: Score, bpm: number) {
  const generate = useCallback((format: ExportFormat): string => {
    switch (format) {
      case 'json':
        return generateJSON(score);
      case 'abc':
        return generateABC(score, bpm);
      case 'musicxml':
        return generateMusicXML(score);
    }
  }, [score, bpm]);

  const copyToClipboard = useCallback(async (format: ExportFormat): Promise<void> => {
    const content = generate(format);
    await navigator.clipboard.writeText(content);
  }, [generate]);

  const downloadFile = useCallback(async (format: ExportFormat): Promise<void> => {
    const content = generate(format);
    const { filename, mimeType } = getFileInfo(format, score.title);
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [generate, score.title]);

  return { copyToClipboard, downloadFile };
}
