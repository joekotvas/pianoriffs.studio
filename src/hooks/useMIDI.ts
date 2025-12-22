import { useState, useEffect, useRef } from 'react';
import { requestMIDIAccess, setupMIDIListeners, midiNoteToPitch } from '@/engines/midiEngine';
import { playNote } from '@/engines/toneEngine';
import { Score, getActiveStaff } from '@/types';

export const useMIDI = (
  addChordCallback: (
    measureIndex: number,
    notes: { pitch: string; accidental: string | null; id?: number }[],
    duration: string,
    isDotted: boolean
  ) => void,
  activeDuration: string,
  isDotted: boolean,
  activeAccidental: 'flat' | 'natural' | 'sharp' | null,
  scoreRef: React.MutableRefObject<Score>
) => {
  const [midiStatus, setMidiStatus] = useState<{
    connected: boolean;
    deviceName: string | null;
    error: string | null;
  }>({ connected: false, deviceName: null, error: null });

  const midiCleanupRef = useRef<(() => void) | null>(null);
  const midiChordBuffer = useRef<{ pitch: string; accidental: string | null }[]>([]);
  const midiChordTimer = useRef<NodeJS.Timeout | null>(null);

  // Refs to access latest state in callbacks
  const activeDurationRef = useRef(activeDuration);
  const isDottedRef = useRef(isDotted);
  const activeAccidentalRef = useRef(activeAccidental);
  const addChordRef = useRef(addChordCallback);

  useEffect(() => {
    activeDurationRef.current = activeDuration;
  }, [activeDuration]);
  useEffect(() => {
    isDottedRef.current = isDotted;
  }, [isDotted]);
  useEffect(() => {
    activeAccidentalRef.current = activeAccidental;
  }, [activeAccidental]);
  useEffect(() => {
    addChordRef.current = addChordCallback;
  }, [addChordCallback]);

  useEffect(() => {
    const initMIDI = async () => {
      const { inputs, access, error } = await requestMIDIAccess();
      if (error) {
        setMidiStatus({ connected: false, deviceName: null, error });
        return;
      }
      if (inputs.length === 0) {
        setMidiStatus({ connected: false, deviceName: null, error: null });
        return;
      }
      const device = inputs[0];
      setMidiStatus({ connected: true, deviceName: device.name || 'MIDI Device', error: null });

      const CHORD_WINDOW_MS = 50;

      const commitChord = () => {
        if (midiChordBuffer.current.length === 0) return;
        const notes = [...midiChordBuffer.current];
        midiChordBuffer.current = [];

        // Play tones
        // const keySignature = ... (unused)
        notes.forEach((n) => playNote(n.pitch));

        // Add chord
        if (addChordRef.current && scoreRef.current) {
          const currentScore = scoreRef.current;
          const targetMeasureIndex = getActiveStaff(currentScore).measures.length - 1;
          addChordRef.current(
            targetMeasureIndex,
            notes.map((n) => ({
              pitch: n.pitch,
              accidental: n.accidental || activeAccidentalRef.current,
              id: Date.now() + Math.random(),
            })),
            activeDurationRef.current,
            isDottedRef.current
          );
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanup = setupMIDIListeners(access as any, (midiNote: number, _velocity: number) => {
        const pitch = midiNoteToPitch(midiNote);
        // Valid range check could be here if needed

        midiChordBuffer.current.push({ pitch, accidental: null });

        if (midiChordTimer.current) clearTimeout(midiChordTimer.current);
        midiChordTimer.current = setTimeout(commitChord, CHORD_WINDOW_MS);
      });
      midiCleanupRef.current = cleanup;
    };

    initMIDI();

    return () => {
      if (midiCleanupRef.current) midiCleanupRef.current();
    };
  }, [scoreRef]); // Run once on mount (scoreRef is stable)

  return { midiStatus };
};
