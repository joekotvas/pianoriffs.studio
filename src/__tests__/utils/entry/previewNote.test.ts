import { createPreviewNote, arePreviewsEqual, PreviewNote } from '@/utils/entry/previewNote';

describe('createPreviewNote', () => {
  const baseOptions = {
    measureIndex: 0,
    staffIndex: 0,
    pitch: 'C4',
    duration: 'quarter',
    dotted: false,
    mode: 'APPEND' as const,
    index: 0,
  };

  describe('basic preview creation', () => {
    it('creates a preview with required fields', () => {
      const preview = createPreviewNote(baseOptions);

      expect(preview.measureIndex).toBe(0);
      expect(preview.staffIndex).toBe(0);
      expect(preview.pitch).toBe('C4');
      expect(preview.duration).toBe('quarter');
      expect(preview.dotted).toBe(false);
      expect(preview.mode).toBe('APPEND');
      expect(preview.index).toBe(0);
    });

    it('sets default quant values to 0', () => {
      const preview = createPreviewNote(baseOptions);

      expect(preview.quant).toBe(0);
      expect(preview.visualQuant).toBe(0);
    });

    it('defaults isRest to false', () => {
      const preview = createPreviewNote(baseOptions);
      expect(preview.isRest).toBe(false);
    });

    it('defaults source to hover', () => {
      const preview = createPreviewNote(baseOptions);
      expect(preview.source).toBe('hover');
    });
  });

  describe('optional fields', () => {
    it('includes eventId for CHORD mode', () => {
      const preview = createPreviewNote({
        ...baseOptions,
        mode: 'CHORD',
        eventId: 'event-123',
      });

      expect(preview.eventId).toBe('event-123');
    });

    it('creates rest preview', () => {
      const preview = createPreviewNote({
        ...baseOptions,
        isRest: true,
      });

      expect(preview.isRest).toBe(true);
    });

    it('sets keyboard source', () => {
      const preview = createPreviewNote({
        ...baseOptions,
        source: 'keyboard',
      });

      expect(preview.source).toBe('keyboard');
    });
  });

  describe('INSERT mode', () => {
    it('handles INSERT mode with index', () => {
      const preview = createPreviewNote({
        ...baseOptions,
        mode: 'INSERT',
        index: 2,
      });

      expect(preview.mode).toBe('INSERT');
      expect(preview.index).toBe(2);
    });
  });
});

describe('arePreviewsEqual', () => {
  const basePreview: PreviewNote = {
    measureIndex: 0,
    staffIndex: 0,
    quant: 0,
    visualQuant: 0,
    pitch: 'C4',
    duration: 'quarter',
    dotted: false,
    mode: 'APPEND',
    index: 0,
    isRest: false,
    source: 'hover',
  };

  describe('equality checks', () => {
    it('returns false when prev is null', () => {
      expect(arePreviewsEqual(null, basePreview)).toBe(false);
    });

    it('returns true for identical previews', () => {
      expect(arePreviewsEqual(basePreview, { ...basePreview })).toBe(true);
    });

    it('ignores pitch differences for rests', () => {
      const restPrev = { ...basePreview, isRest: true, pitch: 'C4' };
      const restNext = { ...basePreview, isRest: true, pitch: 'G5' };

      expect(arePreviewsEqual(restPrev, restNext)).toBe(true);
    });

    it('detects pitch differences for notes', () => {
      const next = { ...basePreview, pitch: 'G5' };

      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });
  });

  describe('field differences', () => {
    it('detects measureIndex change', () => {
      const next = { ...basePreview, measureIndex: 1 };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });

    it('detects staffIndex change', () => {
      const next = { ...basePreview, staffIndex: 1 };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });

    it('detects mode change', () => {
      const next = { ...basePreview, mode: 'INSERT' as const };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });

    it('detects index change', () => {
      const next = { ...basePreview, index: 3 };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });

    it('detects isRest change', () => {
      const next = { ...basePreview, isRest: true };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });

    it('detects duration change', () => {
      const next = { ...basePreview, duration: 'eighth' };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });

    it('detects dotted change', () => {
      const next = { ...basePreview, dotted: true };
      expect(arePreviewsEqual(basePreview, next)).toBe(false);
    });
  });
});
