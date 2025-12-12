// @ts-nocheck
"use client";
import React from 'react';
import ScoreEditor from './ScoreEditor';
import { RiffScore } from './RiffScore';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ConfigMenu from './components/Panels/ConfigMenu';

// Named exports
export { RiffScore };
export { ScoreEditor };
const AppContent = () => {
  const { theme, zoom } = useTheme();
  
  return (
    <div className="min-h-screen p-8 font-sans transition-colors duration-300" style={{ backgroundColor: theme.background, color: theme.text }}>
      <ConfigMenu />
      <h1 className="text-8xl font-light mb-0 text-center" style={{ color: theme.text }}>RiffScore</h1>
      <h1 className="text-3xl font-bold mb-0 text-center" style={{ color: theme.text }}>Interactive Music Notation Editor for React</h1>
      <div className="max-w-6xl mx-auto space-y-12 mb-16">
        <ScoreEditor label="Row 1" scale={zoom} />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center border-t backdrop-blur-sm" style={{ backgroundColor: `${theme.background}EE`, borderColor: theme.border, color: theme.secondaryText }}>
        <p className="text-sm">
          RiffScore is <span className="font-semibold">Open Source</span>. 
          Developed by <a href="https://jokma.com/" className="underline hover:opacity-80 transition-opacity">Joe Kotvas</a>. 
          <span className="mx-2">•</span>
          <a href="https://github.com/joekotvas/pianoriffs.studio" className="underline hover:opacity-80 transition-opacity">View on GitHub</a>
        </p>
      </footer>
    </div>
  );
};

export default function SheetMusicApp() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
