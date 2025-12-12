"use client";

import { useState } from "react";
import { RiffScore } from "@riffscore/RiffScore";
import { ThemeProvider, useTheme } from "@riffscore/context/ThemeContext";
import ConfigMenu from "@riffscore/components/Panels/ConfigMenu";

// Copy to clipboard button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 text-xs rounded transition-all hover:opacity-80"
      style={{ 
        backgroundColor: copied ? theme.accent : theme.buttonBackground,
        color: copied ? '#fff' : theme.secondaryText,
        border: `1px solid ${theme.border}`
      }}
      title="Copy to clipboard"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  );
}

const examples = [
  {
    title: "Default (No Props)",
    description: "Using <RiffScore /> with no configuration renders an interactive grand staff with 4 measures"
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
        {examples.map((example, index) => {
          const codeSnippet = example.config 
            ? `<RiffScore config={${JSON.stringify(example.config, null, 2)}} />`
            : `<RiffScore />`;
          return (
            <section key={index} className="space-y-4">
              <div className="border-l-4 pl-4" style={{ borderColor: theme.accent }}>
                <h2 className="text-2xl font-semibold" style={{ color: theme.text }}>
                  {example.title}
                </h2>
                <p style={{ color: theme.secondaryText }}>
                  {example.description}
                </p>
                <div className="mt-2 relative">
                  <div className="flex items-start gap-2">
                    <pre
                      className="text-xs flex-1 p-3 rounded overflow-x-auto font-mono"
                      style={{ backgroundColor: theme.panelBackground, color: theme.secondaryText }}
                    >
                      <code>{codeSnippet}</code>
                    </pre>
                    <CopyButton text={codeSnippet} />
                  </div>
                </div>
              </div>
              <RiffScore config={example.config} />
            </section>
          );
        })}
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
          <a href="https://github.com/joekotvas/riffscore" className="underline hover:opacity-80 transition-opacity">View on GitHub</a>
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
