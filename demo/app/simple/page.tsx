"use client";

import { RiffScore } from "@riffscore/RiffScore";
import { RiffScoreConfig } from "@riffscore/types";

export default function SimplePage() {

    const config = {
        score: {
            title: "Simple Score",
            staff: "treble" as const,
            measureCount: 2,
            keySignature: "C"
        },
        ui: {
            scale: 0.75,
            showToolbar: false,
            showScoreTitle: false,
            theme: 'LIGHT'
        },
        interaction: {
            isEnabled: false
        },
    } as RiffScoreConfig


  return (
    <div style={{ padding: "2rem" }}>
      <h1>Simple RiffScore Demo</h1>
      <p>Just drop in the component with zero configuration:</p>
      
      <RiffScore config={config} />
    </div>
  );
}
