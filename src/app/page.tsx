"use client";

import { RiffScore } from "@/components/SheetMusicEditor";
import { ThemeProvider, useTheme } from "@/components/SheetMusicEditor/context/ThemeContext";
import ConfigMenu from "@/components/SheetMusicEditor/components/Panels/ConfigMenu";

const examples = [
  {
    title: "Grand Staff (Default)",
    description: "A standard grand staff with treble and bass clefs, 4 measures",
    config: {
      score: { 
        title: "Grand Staff Example",
        staff: 'grand' as const, 
        measureCount: 4 
      }
    }
  },
  {
    title: "Treble Clef Only",
    description: "Single treble staff for melody lines",
    config: {
      score: { 
        title: "Melody Line",
        staff: 'treble' as const, 
        measureCount: 4,
        keySignature: 'G'
      }
    }
  },
  {
    title: "Bass Clef Only",
    description: "Single bass staff for bass parts",
    config: {
      score: { 
        title: "Bass Line",
        staff: 'bass' as const, 
        measureCount: 4,
        keySignature: 'F'
      }
    }
  },
  {
    title: "Read-Only Display",
    description: "Interactions disabled - perfect for embedding static scores",
    config: {
      ui: { showToolbar: false },
      interaction: { isEnabled: false },
      score: { 
        title: "Static Score",
        staff: 'grand' as const, 
        measureCount: 2 
      }
    }
  },
  {
    title: "Compact View",
    description: "Scaled down for preview or thumbnail display",
    config: {
      ui: { scale: 0.75, showToolbar: false },
      score: { 
        title: "Compact Preview",
        staff: 'treble' as const, 
        measureCount: 2 
      }
    }
  }
];

function ExamplesContent() {
  const { theme } = useTheme();
  
  return (
    <div 
      className="min-h-screen p-8 font-sans transition-colors duration-300" 
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <ConfigMenu />
      
      <header className="text-center mb-12">
        <h1 className="text-7xl font-light mb-2" style={{ color: theme.text }}>
          RiffScore
        </h1>
        <p className="text-xl" style={{ color: theme.secondaryText }}>
          Configurable Music Notation Editor for React
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-16 pb-24">
        {examples.map((example, index) => (
          <section key={index} className="space-y-4">
            <div className="border-l-4 pl-4" style={{ borderColor: theme.accent }}>
              <h2 className="text-2xl font-semibold" style={{ color: theme.text }}>
                {example.title}
              </h2>
              <p style={{ color: theme.secondaryText }}>
                {example.description}
              </p>
              <code 
                className="text-xs block mt-2 p-2 rounded overflow-x-auto"
                style={{ backgroundColor: theme.panelBackground, color: theme.secondaryText }}
              >
                {`<RiffScore config={${JSON.stringify(example.config, null, 2)}} />`}
              </code>
            </div>
            <RiffScore config={example.config} />
          </section>
        ))}
      </main>

      <footer 
        className="fixed bottom-0 left-0 right-0 p-4 text-center border-t backdrop-blur-sm" 
        style={{ 
          backgroundColor: `${theme.background}EE`, 
          borderColor: theme.border, 
          color: theme.secondaryText 
        }}
      >
        <p className="text-sm">
          RiffScore is <span className="font-semibold">Open Source</span>. 
          Developed by <a href="https://jokma.com/" className="underline hover:opacity-80 transition-opacity">Joe Kotvas</a>. 
          <span className="mx-2">•</span>
          <a href="https://github.com/joekotvas/pianoriffs.studio" className="underline hover:opacity-80 transition-opacity">View on GitHub</a>
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <ExamplesContent />
    </ThemeProvider>
  );
}
