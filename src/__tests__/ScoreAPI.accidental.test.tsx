/**
 * ScoreAPI.accidental.test.tsx
 *
 * Tests for accidental modification methods.
 * Covers: setAccidental, toggleAccidental.
 */

import { render, act } from '@testing-library/react';
import { RiffScore } from '../RiffScore';
import type { MusicEditorAPI } from '../api.types';
import { Note } from '../types';

const getAPI = (id: string): MusicEditorAPI => {
  return window.riffScore.get(id) as MusicEditorAPI;
};

// Helper to get first note of first measure
const getNote = (api: MusicEditorAPI, measureIdx = 0, eventIdx = 0, noteIdx = 0): Note => {
  return api.getScore().staves[0].measures[measureIdx].events[eventIdx].notes[noteIdx];
};

describe('ScoreAPI Accidental Methods', () => {
  beforeEach(() => {
    Element.prototype.scrollTo = jest.fn();
  });

  afterEach(() => {
    if (window.riffScore) {
      window.riffScore.instances.clear();
      window.riffScore.active = null;
    }
    jest.restoreAllMocks();
  });

  describe('setAccidental', () => {
    test('sets accidental for selected note', () => {
      render(<RiffScore id="acc-set" />);
      const api = getAPI('acc-set');

      act(() => {
        api.select(0).addNote('C4', 'quarter');
      });

      // By default, notes have no explicit accidental (follows key signature)
      expect(getNote(api).accidental).toBeFalsy();

      // Select note
      act(() => {
        api.select(0, 0, 0, 0);
      });

      // Set Sharp
      act(() => {
        api.setAccidental('sharp');
      });
      expect(getNote(api).accidental).toBe('sharp');

      // Set Flat
      act(() => {
        api.setAccidental('flat');
      });
      expect(getNote(api).accidental).toBe('flat');
    });

    test('sets accidental for multiple selected notes', () => {
      render(<RiffScore id="acc-multi" />);
      const api = getAPI('acc-multi');

      act(() => {
        // Measure 1: C4, D4
        api.select(0).addNote('C4', 'quarter').addNote('D4', 'quarter');
      });

      // Select both notes (simulate multi-select via array if possible, or selecting range)
      // Since API.select() is single point, we need to construct a multi-selection state manually?
      // Or use selectAll('measure')?
      act(() => {
        api.selectAll('measure');
      });

      act(() => {
        api.setAccidental('sharp');
      });

      expect(getNote(api, 0, 0, 0).accidental).toBe('sharp');
      expect(getNote(api, 0, 1, 0).accidental).toBe('sharp');

      // Undo should revert both (transaction)
      act(() => {
        api.undo();
      });
      expect(getNote(api, 0, 0, 0).accidental).toBeFalsy();
      expect(getNote(api, 0, 1, 0).accidental).toBeFalsy();
    });
  });

  describe('toggleAccidental', () => {
    test('cycles through accidentals (Sharp -> Flat -> Natural -> Null)', () => {
      render(<RiffScore id="acc-toggle" />);
      const api = getAPI('acc-toggle');

      act(() => {
        api.select(0).addNote('C4', 'quarter');
        api.select(0, 0, 0, 0);
      });

      // Initial state: no accidental (undefined). First toggle applies 'sharp'.
      // Cycle: (undefined) -> sharp -> flat -> natural -> null
      // Note: 'natural' is an explicit marking that cancels sharps/flats.

      // Toggle 1: no accidental -> sharp
      act(() => {
        api.toggleAccidental();
      });
      expect(getNote(api).accidental).toBe('sharp');

      // Toggle 2: Sharp -> Flat
      act(() => {
        api.toggleAccidental();
      });
      expect(getNote(api).accidental).toBe('flat');

      // Toggle 3: Flat -> Natural
      act(() => {
        api.toggleAccidental();
      });
      expect(getNote(api).accidental).toBe('natural');

      // Toggle 4: Natural -> Null
      act(() => {
        api.toggleAccidental();
      });
      expect(getNote(api).accidental).toBeNull();
      // Depending on implementation, might delete the key or set to null/undefined.
      // UpdateNoteCommand merges partial. If we pass {accidental: null}, it sets it to null.
    });
  });
});
