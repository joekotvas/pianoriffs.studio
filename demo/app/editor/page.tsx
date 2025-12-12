"use client";

import ScoreEditor from "@riffscore/ScoreEditor";
import { ThemeProvider } from "@riffscore/context/ThemeContext";

export default function EditorPage() {
  return (
    <ThemeProvider>
      <ScoreEditor />
    </ThemeProvider>
  );
}
