import { createNotePayload } from '@/utils/entry/notePayload';

describe('createNotePayload', () => {
  describe('basic note creation', () => {
    it('creates a note with default values', () => {
      const note = createNotePayload({ pitch: 'C4' });

      expect(note.pitch).toBe('C4');
      expect(note.accidental).toBeNull();
      expect(note.tied).toBe(false);
      expect(note.id).toBeDefined();
    });

    it('creates a note with explicit accidental', () => {
      const note = createNotePayload({ pitch: 'F4', accidental: 'sharp' });

      expect(note.pitch).toBe('F4');
      expect(note.accidental).toBe('sharp');
    });

    it('creates a tied note', () => {
      const note = createNotePayload({ pitch: 'G4', tied: true });

      expect(note.pitch).toBe('G4');
      expect(note.tied).toBe(true);
    });

    it('creates a note with all options', () => {
      const note = createNotePayload({
        pitch: 'Bb3',
        accidental: 'flat',
        tied: true,
      });

      expect(note.pitch).toBe('Bb3');
      expect(note.accidental).toBe('flat');
      expect(note.tied).toBe(true);
    });
  });

  describe('ID handling', () => {
    it('generates unique IDs when not provided', () => {
      const note1 = createNotePayload({ pitch: 'C4' });
      const note2 = createNotePayload({ pitch: 'C4' });

      expect(note1.id).not.toBe(note2.id);
    });

    it('uses provided ID when specified', () => {
      const note = createNotePayload({ pitch: 'C4', id: 'custom-id-123' });

      expect(note.id).toBe('custom-id-123');
    });

    it('uses numeric ID when specified', () => {
      const note = createNotePayload({ pitch: 'C4', id: 12345 });

      expect(note.id).toBe(12345);
    });
  });

  describe('accidental values', () => {
    it('handles sharp accidental', () => {
      const note = createNotePayload({ pitch: 'F4', accidental: 'sharp' });
      expect(note.accidental).toBe('sharp');
    });

    it('handles flat accidental', () => {
      const note = createNotePayload({ pitch: 'B4', accidental: 'flat' });
      expect(note.accidental).toBe('flat');
    });

    it('handles natural accidental', () => {
      const note = createNotePayload({ pitch: 'F4', accidental: 'natural' });
      expect(note.accidental).toBe('natural');
    });

    it('handles null accidental', () => {
      const note = createNotePayload({ pitch: 'C4', accidental: null });
      expect(note.accidental).toBeNull();
    });
  });
});
