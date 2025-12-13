'use strict';

var tonal = require('tonal');
var React3 = require('react');
var Tone = require('tone');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');
var reactDom = require('react-dom');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React3__default = /*#__PURE__*/_interopDefault(React3);
var Tone__namespace = /*#__PURE__*/_interopNamespace(Tone);

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/themes.ts
var COLORS, DARK, COOL, WARM, LIGHT, THEMES, DEFAULT_THEME;
var init_themes = __esm({
  "src/themes.ts"() {
    COLORS = {
      // Slate (Dark/Default)
      slate800: "hsla(217, 33%, 18%, 1.00)",
      slate700: "hsla(218, 33%, 28%, 1.00)",
      slate600: "hsla(215, 16%, 38%, 1.00)",
      slate500: "hsla(215, 16%, 47%, 1.00)",
      slate400: "hsla(215, 20%, 65%, 1.00)",
      slate200: "#e2e8f0",
      teal: "#20B2AA",
      // Blue (Cool)
      blue950: "#0f172a",
      blue900: "#1e3a8a",
      blue800: "#1e40af",
      blue400: "#60a5fa",
      blue200: "#bfdbfe",
      cyan400: "#22d3ee",
      // Warm
      stone900: "#1c1917",
      stone800: "#292524",
      stone500: "#78716c",
      stone400: "#a8a29e",
      stone200: "#e7e5e4",
      orange400: "#fb923c",
      amber400: "#fbbf24",
      // Common
      whiteAlpha10: "rgba(255, 255, 255, 0.1)",
      slate800Alpha80: "rgba(30, 41, 59, 0.8)",
      blue950Alpha80: "rgba(15, 23, 42, 0.8)",
      stone900Alpha80: "rgba(28, 25, 23, 0.8)"
    };
    DARK = {
      accent: COLORS.teal,
      background: COLORS.slate800,
      panelBackground: COLORS.slate800Alpha80,
      text: COLORS.slate200,
      secondaryText: COLORS.slate400,
      border: COLORS.whiteAlpha10,
      buttonBackground: COLORS.slate800Alpha80,
      buttonHoverBackground: COLORS.slate700,
      score: {
        line: COLORS.slate500,
        note: COLORS.slate200,
        fill: COLORS.slate200
      }
    };
    COOL = {
      accent: COLORS.cyan400,
      background: COLORS.blue950,
      panelBackground: COLORS.blue950Alpha80,
      text: COLORS.blue200,
      secondaryText: COLORS.blue400,
      border: COLORS.whiteAlpha10,
      buttonBackground: COLORS.blue950Alpha80,
      buttonHoverBackground: COLORS.blue900,
      score: {
        line: COLORS.blue400,
        note: COLORS.blue200,
        fill: COLORS.blue200
      }
    };
    WARM = {
      accent: COLORS.orange400,
      background: COLORS.stone900,
      panelBackground: COLORS.stone900Alpha80,
      text: COLORS.stone200,
      secondaryText: COLORS.stone400,
      border: COLORS.whiteAlpha10,
      buttonBackground: COLORS.stone900Alpha80,
      buttonHoverBackground: COLORS.stone800,
      score: {
        line: COLORS.stone500,
        note: COLORS.stone200,
        fill: COLORS.stone200
      }
    };
    LIGHT = {
      accent: COLORS.teal,
      background: "#ffffff",
      panelBackground: "#f9f9f9",
      text: COLORS.slate800,
      secondaryText: COLORS.slate500,
      border: "#e2e8f0",
      buttonBackground: "#ffffff",
      buttonHoverBackground: "#f1f5f9",
      score: {
        line: COLORS.slate400,
        note: "#000000",
        fill: "#000000"
      }
    };
    THEMES = {
      DARK,
      COOL,
      WARM,
      LIGHT
    };
    DEFAULT_THEME = "DARK";
  }
});

// src/config.ts
var CONFIG;
var init_config = __esm({
  "src/config.ts"() {
    init_themes();
    CONFIG = {
      lineHeight: 12,
      topMargin: 20,
      baseY: 70,
      quantsPerMeasure: 64,
      measurePaddingLeft: 36,
      measurePaddingRight: 0,
      scoreMarginLeft: 60,
      headerWidth: 60,
      staffSpacing: 120,
      debug: {
        enabled: true,
        logCommands: true,
        logStateChanges: true,
        logValidation: true
      }
    };
  }
});
var SPACE, HALF_SPACE, STAFF_POSITION, MIDDLE_LINE_Y, TIME_SIGNATURES, SHARPS, FLATS, MAJOR_ROOTS, KEY_SIGNATURES, KEY_SIGNATURE_OFFSETS, CLEF_TYPES, NOTE_TYPES, NOTE_SPACING_BASE_UNIT, WHOLE_REST_WIDTH, DEFAULT_SCALE, LAYOUT, STEM, BEAMING, TUPLET, TIE;
var init_constants = __esm({
  "src/constants.ts"() {
    init_config();
    SPACE = CONFIG.lineHeight;
    HALF_SPACE = 0.5 * SPACE;
    STAFF_POSITION = {
      aboveStaff: -0.5 * SPACE,
      line5: 0,
      space4: 0.5 * SPACE,
      line4: 1 * SPACE,
      space3: 1.5 * SPACE,
      line3: 2 * SPACE,
      space2: 2.5 * SPACE,
      line2: 3 * SPACE,
      space1: 3.5 * SPACE,
      line1: 4 * SPACE,
      belowStaff: 4.5 * SPACE
    };
    MIDDLE_LINE_Y = CONFIG.baseY + 24;
    TIME_SIGNATURES = {
      "4/4": 64,
      "3/4": 48,
      "2/4": 32,
      "6/8": 48
    };
    SHARPS = ["F", "C", "G", "D", "A", "E", "B"];
    FLATS = ["B", "E", "A", "D", "G", "C", "F"];
    MAJOR_ROOTS = [
      "C",
      "G",
      "D",
      "A",
      "E",
      "B",
      "F#",
      "C#",
      // Sharp Keys
      "F",
      "Bb",
      "Eb",
      "Ab",
      "Db",
      "Gb",
      "Cb"
      // Flat Keys
    ];
    KEY_SIGNATURES = {};
    MAJOR_ROOTS.forEach((root) => {
      const keyInfo = tonal.Key.majorKey(root);
      const count = Math.abs(keyInfo.alteration);
      const type = keyInfo.alteration < 0 ? "flat" : "sharp";
      const accidentals = type === "flat" ? FLATS.slice(0, count) : SHARPS.slice(0, count);
      KEY_SIGNATURES[root] = { label: `${root} Major`, type, count, accidentals };
      KEY_SIGNATURES[keyInfo.minorRelative] = {
        label: `${keyInfo.minorRelative} Minor`,
        type,
        count,
        accidentals
      };
    });
    KEY_SIGNATURE_OFFSETS = {
      treble: {
        sharp: {
          "F": STAFF_POSITION.line5,
          "C": STAFF_POSITION.space3,
          "G": STAFF_POSITION.aboveStaff,
          "D": STAFF_POSITION.line4,
          "A": STAFF_POSITION.space2,
          "E": STAFF_POSITION.space4,
          "B": STAFF_POSITION.line3
        },
        flat: {
          "B": STAFF_POSITION.line3,
          "E": STAFF_POSITION.space4,
          "A": STAFF_POSITION.space2,
          "D": STAFF_POSITION.line4,
          "G": STAFF_POSITION.line2,
          "C": STAFF_POSITION.space3,
          "F": STAFF_POSITION.space1
        }
      },
      bass: {
        sharp: {
          "F": STAFF_POSITION.line4,
          "C": STAFF_POSITION.space2,
          "G": STAFF_POSITION.space4,
          "D": STAFF_POSITION.line3,
          "A": STAFF_POSITION.line5,
          "E": STAFF_POSITION.space3,
          "B": STAFF_POSITION.aboveStaff
        },
        flat: {
          "B": STAFF_POSITION.line2,
          "E": STAFF_POSITION.space3,
          "A": STAFF_POSITION.space1,
          "D": STAFF_POSITION.line3,
          "G": STAFF_POSITION.line1,
          "C": STAFF_POSITION.space2,
          "F": STAFF_POSITION.belowStaff
        }
      }
    };
    CLEF_TYPES = {
      treble: { label: "Treble" },
      bass: { label: "Bass" },
      grand: { label: "Grand", isGrand: true }
    };
    NOTE_TYPES = {
      whole: { duration: 64, label: "Whole", fill: "transparent", stroke: "black", stem: false, abcDuration: "4", xmlType: "whole" },
      half: { duration: 32, label: "Half", fill: "transparent", stroke: "black", stem: true, abcDuration: "2", xmlType: "half" },
      quarter: { duration: 16, label: "Quarter", fill: "black", stroke: "black", stem: true, abcDuration: "", xmlType: "quarter" },
      eighth: { duration: 8, label: "Eighth", fill: "black", stroke: "black", stem: true, flag: 1, abcDuration: "/2", xmlType: "eighth" },
      sixteenth: { duration: 4, label: "16th", fill: "black", stroke: "black", stem: true, flag: 2, abcDuration: "/4", xmlType: "16th" },
      thirtysecond: { duration: 2, label: "32nd", fill: "black", stroke: "black", stem: true, flag: 3, abcDuration: "/8", xmlType: "32nd" },
      sixtyfourth: { duration: 1, label: "64th", fill: "black", stroke: "black", stem: true, flag: 4, abcDuration: "/16", xmlType: "64th" }
    };
    NOTE_SPACING_BASE_UNIT = 16;
    WHOLE_REST_WIDTH = 12;
    DEFAULT_SCALE = 1;
    LAYOUT = {
      // Core Primitives
      LINE_STROKE_WIDTH: 1.5,
      NOTE_RX: 6,
      NOTE_RY: 4,
      DOT_RADIUS: 3,
      // Derived from lineHeight
      SECOND_INTERVAL_SHIFT: SPACE - 1,
      SECOND_INTERVAL_SPACE: HALF_SPACE,
      DOT_OFFSET_X: SPACE,
      LEDGER_LINE_EXTENSION: SPACE - 2,
      // Accidentals
      ACCIDENTAL: {
        OFFSET_X: -16,
        OFFSET_Y: 0,
        FONT_SIZE: 22,
        // Legacy, now using getFontSize() from SMuFL
        SPACING: HALF_SPACE + 2
      },
      // Hit Detection
      HIT_AREA: {
        WIDTH: 20,
        HEIGHT: 12,
        OFFSET_X: -10,
        OFFSET_Y: -6
      },
      HIT_ZONE_RADIUS: 14,
      APPEND_ZONE_WIDTH: 2e3,
      // Min widths for short notes
      MIN_WIDTH_FACTORS: {
        sixtyfourth: 1.2,
        thirtysecond: 1.5,
        sixteenth: 1.8,
        eighth: 2.2
      },
      LOOKAHEAD_PADDING_FACTOR: 0.3
    };
    STEM = {
      LENGTHS: {
        default: 44,
        thirtysecond: 44,
        sixtyfourth: 44
      },
      BEAMED_LENGTHS: {
        default: 44,
        thirtysecond: 48,
        sixtyfourth: 56
      },
      OFFSET_X: HALF_SPACE + 0.25
    };
    BEAMING = {
      THICKNESS: 5,
      SPACING: 8,
      MAX_SLOPE: 1,
      EXTENSION_PX: 0.625
    };
    TUPLET = {
      HOOK_HEIGHT: 8,
      PADDING: 15,
      MAX_SLOPE: 0.5,
      NUMBER_FONT_SIZE: 11,
      NUMBER_OFFSET_UP: -4,
      NUMBER_OFFSET_DOWN: 12,
      VISUAL_NOTE_RADIUS: 8
    };
    TIE = {
      START_GAP: 0,
      END_GAP: 5,
      VERTICAL_OFFSET: 8,
      MID_THICKNESS: 4,
      TIP_THICKNESS: 1.2
    };
  }
});

// src/constants/SMuFL.ts
var NOTEHEADS, RESTS, REST_GLYPHS, CLEFS, ACCIDENTALS, FLAGS, PRECOMPOSED_NOTES_UP, TIME_SIG_DIGITS, DOTS, getFontSize, BRAVURA_FONT;
var init_SMuFL = __esm({
  "src/constants/SMuFL.ts"() {
    NOTEHEADS = {
      doubleWhole: "\uE0A0",
      whole: "\uE0A2",
      half: "\uE0A3",
      black: "\uE0A4",
      // Quarter note and shorter
      // Parenthesized noteheads
      parenthesisLeft: "\uE0F5",
      parenthesisRight: "\uE0F6"
    };
    RESTS = {
      maxima: "\uE4E0",
      longa: "\uE4E1",
      doubleWhole: "\uE4E2",
      whole: "\uE4E3",
      half: "\uE4E4",
      quarter: "\uE4E5",
      eighth: "\uE4E6",
      sixteenth: "\uE4E7",
      thirtysecond: "\uE4E8",
      sixtyfourth: "\uE4E9",
      oneHundredTwentyEighth: "\uE4EA"
    };
    REST_GLYPHS = {
      whole: RESTS.whole,
      half: RESTS.half,
      quarter: RESTS.quarter,
      eighth: RESTS.eighth,
      sixteenth: RESTS.sixteenth,
      thirtysecond: RESTS.thirtysecond,
      sixtyfourth: RESTS.sixtyfourth
    };
    CLEFS = {
      gClef: "\uE050",
      // Treble clef
      gClef8vb: "\uE052",
      // Treble clef with 8 below
      gClef8va: "\uE053",
      // Treble clef with 8 above
      fClef: "\uE062",
      // Bass clef
      fClef8vb: "\uE064",
      // Bass clef with 8 below
      fClef8va: "\uE065",
      // Bass clef with 8 above
      cClef: "\uE05C"
      // Alto/Tenor clef
    };
    ACCIDENTALS = {
      flat: "\uE260",
      natural: "\uE261",
      sharp: "\uE262",
      doubleSharp: "\uE263",
      doubleFlat: "\uE264",
      // Parenthesized
      parenthesisLeft: "\uE26A",
      parenthesisRight: "\uE26B"
    };
    FLAGS = {
      // Up flags
      eighthUp: "\uE240",
      sixteenthUp: "\uE242",
      thirtysecondUp: "\uE244",
      sixtyfourthUp: "\uE246",
      oneHundredTwentyEighthUp: "\uE248",
      // Down flags
      eighthDown: "\uE241",
      sixteenthDown: "\uE243",
      thirtysecondDown: "\uE245",
      sixtyfourthDown: "\uE247",
      oneHundredTwentyEighthDown: "\uE249"
    };
    PRECOMPOSED_NOTES_UP = {
      whole: "\uE1D2",
      // noteWhole (no stem)
      half: "\uE1D3",
      // noteHalfUp
      quarter: "\uE1D5",
      // noteQuarterUp
      eighth: "\uE1D7",
      // note8thUp
      sixteenth: "\uE1D9",
      // note16thUp
      thirtysecond: "\uE1DB",
      // note32ndUp
      sixtyfourth: "\uE1DD"
      // note64thUp
    };
    TIME_SIG_DIGITS = {
      0: "\uE080",
      1: "\uE081",
      2: "\uE082",
      3: "\uE083",
      4: "\uE084",
      5: "\uE085",
      6: "\uE086",
      7: "\uE087",
      8: "\uE088",
      9: "\uE089",
      common: "\uE08A",
      // C (common time)
      cutCommon: "\uE08B"
      // Cut C (alla breve)
    };
    DOTS = {
      augmentationDot: "\uE1E7"
    };
    getFontSize = (staffSpace) => staffSpace * 4;
    BRAVURA_FONT = "'Bravura', serif";
  }
});
var STAFF_LETTERS, getFrequency, getMidi, midiToPitch, getStaffPitch, needsAccidental, getAccidentalGlyph, applyKeySignature, movePitchVisual;
var init_MusicService = __esm({
  "src/services/MusicService.ts"() {
    init_SMuFL();
    STAFF_LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
    getFrequency = (pitch) => {
      var _a;
      return (_a = tonal.Note.freq(pitch)) != null ? _a : 0;
    };
    getMidi = (pitch) => {
      var _a;
      return (_a = tonal.Note.midi(pitch)) != null ? _a : 60;
    };
    midiToPitch = (midi) => {
      var _a;
      return (_a = tonal.Note.fromMidi(midi)) != null ? _a : "C4";
    };
    getStaffPitch = (pitch) => {
      const n = tonal.Note.get(pitch);
      return n.letter && n.oct !== void 0 ? `${n.letter}${n.oct}` : pitch;
    };
    needsAccidental = (pitch, keyRoot) => {
      const n = tonal.Note.get(pitch);
      if (!n.pc) return { show: false, type: null };
      const scale = tonal.Key.majorKey(keyRoot).scale;
      if (scale.includes(n.pc)) {
        return { show: false, type: null };
      }
      if (n.alt === 0) {
        return { show: true, type: "natural" };
      }
      return {
        show: true,
        type: n.alt > 0 ? "sharp" : "flat"
      };
    };
    getAccidentalGlyph = (pitch, keySignature, overrideSymbol) => {
      if (overrideSymbol !== void 0) return overrideSymbol;
      const { show, type } = needsAccidental(pitch, keySignature);
      return show && type ? ACCIDENTALS[type] : null;
    };
    applyKeySignature = (visualPitch, keyRoot) => {
      const n = tonal.Note.get(visualPitch);
      if (!n.letter || n.oct === void 0) return visualPitch;
      const scale = tonal.Key.majorKey(keyRoot).scale;
      const match = scale.find((pc) => tonal.Note.get(pc).letter === n.letter);
      return match ? `${match}${n.oct}` : visualPitch;
    };
    movePitchVisual = (pitch, steps, keyRoot = "C") => {
      const n = tonal.Note.get(pitch);
      if (!n.letter || n.oct === void 0) return pitch;
      const currentIdx = STAFF_LETTERS.indexOf(n.letter);
      const totalIdx = currentIdx + steps;
      const wrappedIdx = (totalIdx % 7 + 7) % 7;
      const octaveChange = Math.floor(totalIdx / 7);
      const newLetter = STAFF_LETTERS[wrappedIdx];
      const newOctave = n.oct + octaveChange;
      return applyKeySignature(`${newLetter}${newOctave}`, keyRoot);
    };
  }
});

// src/utils/core.ts
var getNoteDuration, calculateTotalQuants, getBreakdownOfQuants, reflowScore, isRestEvent, getFirstNoteId, navigateSelection;
var init_core = __esm({
  "src/utils/core.ts"() {
    init_constants();
    init_MusicService();
    getNoteDuration = (type, dotted, tuplet) => {
      const base = NOTE_TYPES[type].duration;
      const dottedValue = dotted ? base * 1.5 : base;
      if (tuplet) {
        return dottedValue * tuplet.ratio[1] / tuplet.ratio[0];
      }
      return dottedValue;
    };
    calculateTotalQuants = (events) => {
      return events.reduce((acc, event) => {
        return acc + getNoteDuration(event.duration, event.dotted, event.tuplet);
      }, 0);
    };
    getBreakdownOfQuants = (quants) => {
      const options = [
        { quants: 64, type: "whole", dotted: false },
        { quants: 48, type: "half", dotted: true },
        { quants: 32, type: "half", dotted: false },
        { quants: 24, type: "quarter", dotted: true },
        { quants: 16, type: "quarter", dotted: false },
        { quants: 12, type: "eighth", dotted: true },
        { quants: 8, type: "eighth", dotted: false },
        { quants: 6, type: "sixteenth", dotted: true },
        { quants: 4, type: "sixteenth", dotted: false },
        { quants: 3, type: "thirtysecond", dotted: true },
        { quants: 2, type: "thirtysecond", dotted: false },
        { quants: 1, type: "sixtyfourth", dotted: false }
      ];
      let remaining = quants;
      const parts = [];
      for (const opt of options) {
        while (remaining >= opt.quants) {
          parts.push({ duration: opt.type, dotted: opt.dotted, quants: opt.quants });
          remaining -= opt.quants;
        }
        if (remaining === 0) break;
      }
      return parts;
    };
    reflowScore = (measures, newTimeSignature) => {
      const maxQuants = TIME_SIGNATURES[newTimeSignature] || 64;
      const isPickup = measures.length > 0 && measures[0].isPickup;
      const allEvents = [];
      measures.forEach((m) => {
        m.events.forEach((e) => {
          const event = __spreadProps(__spreadValues({}, e), {
            notes: e.notes.map((n) => __spreadProps(__spreadValues({}, n), { tied: false }))
          });
          allEvents.push(event);
        });
      });
      const newMeasures = [];
      let currentMeasureEvents = [];
      let currentMeasureQuants = 0;
      const commitMeasure = (isPickupMeasure = false) => {
        newMeasures.push({
          id: Date.now() + Math.random(),
          // New IDs
          events: currentMeasureEvents,
          isPickup: isPickupMeasure
        });
        currentMeasureEvents = [];
        currentMeasureQuants = 0;
      };
      if (isPickup) {
        const originalPickupEvents = measures[0].events;
        calculateTotalQuants(originalPickupEvents);
        const originalPickupDuration = calculateTotalQuants(measures[0].events);
        const targetPickupDuration = Math.min(originalPickupDuration, maxQuants);
        var isFillingPickup = true;
        var pickupTarget = targetPickupDuration;
      } else {
        var isFillingPickup = false;
        var pickupTarget = 0;
      }
      allEvents.forEach((event) => {
        const eventDuration = getNoteDuration(event.duration, event.dotted, event.tuplet);
        let currentMax = maxQuants;
        if (isFillingPickup) {
          currentMax = pickupTarget;
        }
        if (currentMeasureQuants + eventDuration <= currentMax) {
          currentMeasureEvents.push(event);
          currentMeasureQuants += eventDuration;
        } else {
          const available = currentMax - currentMeasureQuants;
          const remaining = eventDuration - available;
          if (available > 0) {
            const firstParts = getBreakdownOfQuants(available);
            firstParts.forEach((part) => {
              const newEvent = __spreadProps(__spreadValues({}, event), {
                id: Date.now() + Math.random(),
                duration: part.duration,
                dotted: part.dotted,
                notes: event.notes.map((n) => __spreadProps(__spreadValues({}, n), { tied: true }))
              });
              currentMeasureEvents.push(newEvent);
            });
          }
          commitMeasure(isFillingPickup);
          if (isFillingPickup) {
            isFillingPickup = false;
          }
          if (remaining > 0) {
            const secondParts = getBreakdownOfQuants(remaining);
            secondParts.forEach((part) => {
              const newEvent = __spreadProps(__spreadValues({}, event), {
                id: Date.now() + Math.random(),
                duration: part.duration,
                dotted: part.dotted,
                notes: event.notes.map((n) => __spreadProps(__spreadValues({}, n), { tied: event.notes[0].tied }))
              });
              if (currentMeasureQuants + part.quants <= maxQuants) {
                currentMeasureEvents.push(newEvent);
                currentMeasureQuants += part.quants;
              } else {
                currentMeasureEvents.push(newEvent);
                currentMeasureQuants += part.quants;
              }
            });
          }
        }
      });
      if (currentMeasureEvents.length > 0) {
        commitMeasure(isFillingPickup);
      }
      if (newMeasures.length === 0) {
        newMeasures.push({ id: Date.now(), events: [], isPickup });
      }
      return newMeasures;
    };
    isRestEvent = (event) => {
      return !!event.isRest;
    };
    getFirstNoteId = (event) => {
      var _a;
      if (!((_a = event.notes) == null ? void 0 : _a.length)) return null;
      return event.notes[0].id;
    };
    navigateSelection = (measures, selection, direction, clef = "treble") => {
      var _a;
      const { measureIndex, eventId, noteId } = selection;
      if (measureIndex === null || !eventId) return selection;
      const measure = measures[measureIndex];
      if (!measure) return selection;
      const eventIdx = measure.events.findIndex((e) => e.id === eventId);
      if (eventIdx === -1) return selection;
      if (direction === "left") {
        if (eventIdx > 0) {
          const prevEvent = measure.events[eventIdx - 1];
          return __spreadProps(__spreadValues({}, selection), { eventId: prevEvent.id, noteId: getFirstNoteId(prevEvent) });
        } else if (measureIndex > 0) {
          const prevMeasure = measures[measureIndex - 1];
          if (prevMeasure.events.length > 0) {
            const prevEvent = prevMeasure.events[prevMeasure.events.length - 1];
            return __spreadProps(__spreadValues({}, selection), { measureIndex: measureIndex - 1, eventId: prevEvent.id, noteId: getFirstNoteId(prevEvent) });
          }
        }
      } else if (direction === "right") {
        if (eventIdx < measure.events.length - 1) {
          const nextEvent = measure.events[eventIdx + 1];
          return __spreadProps(__spreadValues({}, selection), { eventId: nextEvent.id, noteId: getFirstNoteId(nextEvent) });
        } else if (measureIndex < measures.length - 1) {
          const nextMeasure = measures[measureIndex + 1];
          if (nextMeasure.events.length > 0) {
            const nextEvent = nextMeasure.events[0];
            return __spreadProps(__spreadValues({}, selection), { measureIndex: measureIndex + 1, eventId: nextEvent.id, noteId: getFirstNoteId(nextEvent) });
          }
        }
      } else if (direction === "up" || direction === "down") {
        const event = measure.events[eventIdx];
        if (((_a = event.notes) == null ? void 0 : _a.length) > 1 && noteId) {
          const sortedNotes = [...event.notes].sort((a, b) => {
            const midiA = getMidi(a.pitch);
            const midiB = getMidi(b.pitch);
            return midiA - midiB;
          });
          const currentNoteIdx = sortedNotes.findIndex((n) => n.id === noteId);
          if (currentNoteIdx !== -1) {
            const newIdx = direction === "up" ? currentNoteIdx + 1 : currentNoteIdx - 1;
            if (newIdx >= 0 && newIdx < sortedNotes.length) {
              return __spreadProps(__spreadValues({}, selection), { noteId: sortedNotes[newIdx].id });
            }
          }
        }
      }
      return selection;
    };
  }
});

// src/engines/layout/types.ts
var init_types = __esm({
  "src/engines/layout/types.ts"() {
  }
});

// src/engines/layout/positioning.ts
var HEADER_LAYOUT_CONSTANTS, calculateHeaderLayout, HEADER_CONSTANTS, PITCH_TO_OFFSET, Y_TO_PITCH, BASS_PITCH_TO_OFFSET, BASS_Y_TO_PITCH, getPitchToOffset, getYToPitch, getOffsetForPitch, getPitchForOffset, getNoteWidth, calculateChordLayout, getStemOffset;
var init_positioning = __esm({
  "src/engines/layout/positioning.ts"() {
    init_constants();
    init_config();
    init_core();
    init_MusicService();
    HEADER_LAYOUT_CONSTANTS = {
      KEY_SIG_START_X: 45,
      KEY_SIG_ACCIDENTAL_WIDTH: 10,
      KEY_SIG_PADDING: 10,
      TIME_SIG_WIDTH: 30,
      TIME_SIG_PADDING: 20
    };
    calculateHeaderLayout = (keySignature) => {
      var _a;
      const { KEY_SIG_START_X, KEY_SIG_ACCIDENTAL_WIDTH, KEY_SIG_PADDING, TIME_SIG_WIDTH, TIME_SIG_PADDING } = HEADER_LAYOUT_CONSTANTS;
      const keySigCount = ((_a = KEY_SIGNATURES[keySignature]) == null ? void 0 : _a.count) || 0;
      const keySigVisualWidth = keySigCount > 0 ? keySigCount * KEY_SIG_ACCIDENTAL_WIDTH + 10 : 0;
      const timeSigStartX = KEY_SIG_START_X + keySigVisualWidth + KEY_SIG_PADDING;
      const startOfMeasures = timeSigStartX + TIME_SIG_WIDTH + TIME_SIG_PADDING;
      return {
        keySigStartX: KEY_SIG_START_X,
        keySigVisualWidth,
        timeSigStartX,
        startOfMeasures
      };
    };
    HEADER_CONSTANTS = HEADER_LAYOUT_CONSTANTS;
    PITCH_TO_OFFSET = {
      "C3": 102,
      "D3": 96,
      "E3": 90,
      "F3": 84,
      "G3": 78,
      "A3": 72,
      "B3": 66,
      "C4": 60,
      "D4": 54,
      "E4": 48,
      "F4": 42,
      "G4": 36,
      "A4": 30,
      "B4": 24,
      "C5": 18,
      "D5": 12,
      "E5": 6,
      "F5": 0,
      "G5": -6,
      "A5": -12,
      "B5": -18,
      "C6": -24,
      "D6": -30,
      "E6": -36,
      "F6": -42,
      "G6": -48
    };
    Y_TO_PITCH = Object.fromEntries(
      Object.entries(PITCH_TO_OFFSET).map(([pitch, offset]) => [offset, pitch])
    );
    BASS_PITCH_TO_OFFSET = {
      "E1": 102,
      "F1": 96,
      "G1": 90,
      "A1": 84,
      "B1": 78,
      "C2": 72,
      "D2": 66,
      "E2": 60,
      "F2": 54,
      "G2": 48,
      "A2": 42,
      "B2": 36,
      "C3": 30,
      "D3": 24,
      "E3": 18,
      "F3": 12,
      "G3": 6,
      "A3": 0,
      "B3": -6,
      "C4": -12,
      "D4": -18,
      "E4": -24,
      "F4": -30,
      "G4": -36,
      "A4": -42,
      "B4": -48
    };
    BASS_Y_TO_PITCH = Object.fromEntries(
      Object.entries(BASS_PITCH_TO_OFFSET).map(([pitch, offset]) => [offset, pitch])
    );
    getPitchToOffset = (clef = "treble") => {
      return clef === "bass" ? BASS_PITCH_TO_OFFSET : PITCH_TO_OFFSET;
    };
    getYToPitch = (clef = "treble") => {
      return clef === "bass" ? BASS_Y_TO_PITCH : Y_TO_PITCH;
    };
    getOffsetForPitch = (pitch, clef = "treble") => {
      var _a;
      const mapping = getPitchToOffset(clef);
      const normalizedPitch = getStaffPitch(pitch);
      return (_a = mapping[normalizedPitch]) != null ? _a : 0;
    };
    getPitchForOffset = (offset, clef = "treble") => {
      const mapping = getYToPitch(clef);
      return mapping[offset];
    };
    getNoteWidth = (duration, dotted) => {
      const quants = getNoteDuration(duration, dotted, void 0);
      const baseWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(quants);
      const MIN_WIDTH_FACTORS3 = {
        "sixtyfourth": 1.2,
        "thirtysecond": 1.5,
        "sixteenth": 1.8,
        "eighth": 2.2
      };
      const minWidth = (MIN_WIDTH_FACTORS3[duration] || 0) * NOTE_SPACING_BASE_UNIT;
      let width = Math.max(baseWidth, minWidth);
      if (dotted) {
        width += NOTE_SPACING_BASE_UNIT * 0.5;
      }
      return width;
    };
    calculateChordLayout = (notes, clef = "treble", forcedDirection) => {
      const realNotes = notes.filter((n) => n.pitch !== null);
      if (!realNotes || realNotes.length === 0) {
        return {
          sortedNotes: [],
          direction: forcedDirection || "up",
          noteOffsets: {},
          maxNoteShift: 0,
          minNoteShift: 0,
          minY: 0,
          maxY: 0
        };
      }
      const sortedNotes = [...realNotes].sort((a, b) => {
        const yA = getOffsetForPitch(a.pitch, clef);
        const yB = getOffsetForPitch(b.pitch, clef);
        return yA - yB;
      });
      let furthestNote = sortedNotes[0];
      let maxDist = -1;
      let minY = Infinity;
      let maxY = -Infinity;
      sortedNotes.forEach((n) => {
        const y = CONFIG.baseY + getOffsetForPitch(n.pitch, clef);
        const dist = Math.abs(y - MIDDLE_LINE_Y);
        if (dist > maxDist) {
          maxDist = dist;
          furthestNote = n;
        }
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
      const furthestY = CONFIG.baseY + getOffsetForPitch(furthestNote.pitch, clef);
      const direction = forcedDirection || (furthestY <= MIDDLE_LINE_Y ? "down" : "up");
      const noteOffsets = {};
      if (direction === "up") {
        for (let i = sortedNotes.length - 1; i > 0; i--) {
          const noteLower = sortedNotes[i];
          const noteUpper = sortedNotes[i - 1];
          const yLower = getOffsetForPitch(noteLower.pitch, clef);
          const yUpper = getOffsetForPitch(noteUpper.pitch, clef);
          if (Math.abs(yLower - yUpper) === 6) {
            if (!noteOffsets[noteLower.id]) {
              noteOffsets[noteUpper.id] = LAYOUT.SECOND_INTERVAL_SHIFT;
            }
          }
        }
      } else {
        for (let i = 0; i < sortedNotes.length - 1; i++) {
          const noteUpper = sortedNotes[i];
          const noteLower = sortedNotes[i + 1];
          const yUpper = getOffsetForPitch(noteUpper.pitch, clef);
          const yLower = getOffsetForPitch(noteLower.pitch, clef);
          if (Math.abs(yLower - yUpper) === 6) {
            if (!noteOffsets[noteUpper.id]) {
              noteOffsets[noteLower.id] = -LAYOUT.SECOND_INTERVAL_SHIFT;
            }
          }
        }
      }
      const offsets = Object.values(noteOffsets);
      const maxNoteShift = offsets.length > 0 ? Math.max(0, ...offsets) : 0;
      const minNoteShift = offsets.length > 0 ? Math.min(0, ...offsets) : 0;
      return { sortedNotes, direction, noteOffsets, maxNoteShift, minNoteShift, minY, maxY };
    };
    getStemOffset = (chordLayout, direction) => {
      const hasUpSecond = chordLayout.maxNoteShift > 0;
      const hasDownSecond = Object.values(chordLayout.noteOffsets).some((v) => v < 0);
      if (hasUpSecond) return STEM.OFFSET_X;
      if (hasDownSecond) return -STEM.OFFSET_X;
      return direction === "up" ? STEM.OFFSET_X : -STEM.OFFSET_X;
    };
  }
});

// src/engines/layout/stems.ts
var STEM_LENGTHS, STEM_BEAMED_LENGTHS, calculateStemGeometry;
var init_stems = __esm({
  "src/engines/layout/stems.ts"() {
    init_constants();
    STEM_LENGTHS = STEM.LENGTHS;
    STEM_BEAMED_LENGTHS = STEM.BEAMED_LENGTHS;
    calculateStemGeometry = ({ beamSpec, stemX, direction, minY, maxY, duration }) => {
      if (beamSpec) {
        const m = (beamSpec.endY - beamSpec.startY) / (beamSpec.endX - beamSpec.startX);
        const stemEndY = beamSpec.startY + m * (stemX - beamSpec.startX);
        const stemStartY = direction === "up" ? maxY : minY;
        return { startY: stemStartY, endY: stemEndY };
      }
      const length = STEM_LENGTHS[duration] || STEM_LENGTHS.default;
      if (direction === "up") {
        return { startY: maxY, endY: minY - length };
      }
      return { startY: minY, endY: maxY + length };
    };
  }
});

// src/engines/layout/beaming.ts
var calculateBeamingGroups, processBeamGroup;
var init_beaming = __esm({
  "src/engines/layout/beaming.ts"() {
    init_core();
    init_positioning();
    init_config();
    init_constants();
    init_stems();
    calculateBeamingGroups = (events, eventPositions, clef = "treble") => {
      const groups = [];
      let currentGroup = [];
      let currentType = null;
      const finalizeGroup = () => {
        if (currentGroup.length > 1) {
          groups.push(processBeamGroup(currentGroup, eventPositions, clef));
        }
        currentGroup = [];
        currentType = null;
      };
      let currentQuant = 0;
      events.forEach((event, index) => {
        const type = event.duration;
        const isFlagged = ["eighth", "sixteenth", "thirtysecond", "sixtyfourth"].includes(type);
        const durationQuants = getNoteDuration(type, event.dotted, event.tuplet);
        if (!isFlagged || event.isRest) {
          finalizeGroup();
          currentQuant += durationQuants;
          return;
        }
        if (currentType && currentType !== type) {
          finalizeGroup();
        }
        const BEAT_QUANTS = CONFIG.quantsPerMeasure / 4;
        if (currentQuant % BEAT_QUANTS === 0 && currentGroup.length > 0) {
          finalizeGroup();
        }
        currentGroup.push(event);
        currentType = type;
        currentQuant += durationQuants;
      });
      finalizeGroup();
      return groups;
    };
    processBeamGroup = (groupEvents, eventPositions, clef) => {
      const startEvent = groupEvents[0];
      groupEvents[groupEvents.length - 1];
      let minStemLength = STEM_BEAMED_LENGTHS.default;
      const uniqueDurations = new Set(groupEvents.map((e) => e.duration));
      if (uniqueDurations.has("sixtyfourth")) {
        minStemLength = STEM_BEAMED_LENGTHS.sixtyfourth;
      } else if (uniqueDurations.has("thirtysecond")) {
        minStemLength = STEM_BEAMED_LENGTHS.thirtysecond;
      }
      const noteData = groupEvents.map((e) => {
        const noteX = eventPositions[e.id];
        const noteYs = e.notes.map((n) => CONFIG.baseY + getOffsetForPitch(n.pitch, clef));
        const chordLayout = calculateChordLayout(e.notes, clef);
        const hasSecond = Object.values(chordLayout.noteOffsets).some((v) => v !== 0);
        return {
          noteX,
          minY: Math.min(...noteYs),
          maxY: Math.max(...noteYs),
          avgY: noteYs.reduce((sum, y) => sum + y, 0) / noteYs.length,
          hasSecond
        };
      });
      const avgY = noteData.reduce((sum, d) => sum + d.avgY, 0) / noteData.length;
      const direction = avgY <= MIDDLE_LINE_Y ? "down" : "up";
      const startChordLayout = calculateChordLayout(groupEvents[0].notes, clef);
      const endChordLayout = calculateChordLayout(groupEvents[groupEvents.length - 1].notes, clef);
      const startStemOffset = getStemOffset(startChordLayout, direction);
      const endStemOffset = getStemOffset(endChordLayout, direction);
      const startX = noteData[0].noteX + startStemOffset - BEAMING.EXTENSION_PX;
      const endX = noteData[noteData.length - 1].noteX + endStemOffset + BEAMING.EXTENSION_PX;
      noteData.forEach((d, i) => {
        const layout = calculateChordLayout(groupEvents[i].notes, clef);
        d.eventX = d.noteX + getStemOffset(layout, direction);
      });
      let highestNoteY = Infinity;
      let lowestNoteY = -Infinity;
      noteData.forEach((d) => {
        highestNoteY = Math.min(highestNoteY, d.minY);
        lowestNoteY = Math.max(lowestNoteY, d.maxY);
      });
      let startBeamY, endBeamY;
      if (direction === "up") {
        const startNoteY = noteData[0].minY;
        const endNoteY = noteData[noteData.length - 1].minY;
        startBeamY = startNoteY - minStemLength;
        endBeamY = endNoteY - minStemLength;
      } else {
        const startNoteY = noteData[0].maxY;
        const endNoteY = noteData[noteData.length - 1].maxY;
        startBeamY = startNoteY + minStemLength;
        endBeamY = endNoteY + minStemLength;
      }
      const rawSlope = (endBeamY - startBeamY) / (endX - startX);
      if (Math.abs(rawSlope) > BEAMING.MAX_SLOPE) {
        const clampedSlope = Math.sign(rawSlope) * BEAMING.MAX_SLOPE;
        const deltaX = endX - startX;
        const deltaY = clampedSlope * deltaX;
        endBeamY = startBeamY + deltaY;
      }
      const slope = (endBeamY - startBeamY) / (endX - startX);
      const intercept = startBeamY - slope * startX;
      let maxAdditionalClearance = 0;
      noteData.forEach((d) => {
        const beamYAtPoint = slope * d.eventX + intercept;
        const anchorNoteY = direction === "up" ? d.minY : d.maxY;
        const currentStemLength = Math.abs(beamYAtPoint - anchorNoteY);
        if (currentStemLength < minStemLength) {
          const needed = minStemLength - currentStemLength;
          maxAdditionalClearance = Math.max(maxAdditionalClearance, needed);
        }
      });
      if (maxAdditionalClearance > 0) {
        if (direction === "up") {
          startBeamY -= maxAdditionalClearance;
          endBeamY -= maxAdditionalClearance;
        } else {
          startBeamY += maxAdditionalClearance;
          endBeamY += maxAdditionalClearance;
        }
      }
      return {
        ids: groupEvents.map((e) => e.id),
        startX,
        endX,
        startY: startBeamY,
        endY: endBeamY,
        direction,
        type: startEvent.duration
      };
    };
  }
});

// src/engines/layout/tuplets.ts
var getTupletGroup, calculateTupletBrackets;
var init_tuplets = __esm({
  "src/engines/layout/tuplets.ts"() {
    init_core();
    init_positioning();
    init_config();
    init_constants();
    getTupletGroup = (events, startIndex) => {
      const startEvent = events[startIndex];
      if (!startEvent.tuplet) return [];
      const groupEvents = [];
      const { groupSize, ratio } = startEvent.tuplet;
      if (startEvent.tuplet.id) {
        const targetId = startEvent.tuplet.id;
        for (let j = 0; startIndex + j < events.length; j++) {
          const e = events[startIndex + j];
          if (e.tuplet && e.tuplet.id === targetId) {
            groupEvents.push(e);
          } else {
            break;
          }
        }
      } else if (startEvent.tuplet.baseDuration) {
        const { ratio: ratio2, baseDuration } = startEvent.tuplet;
        const baseQuants = getNoteDuration(baseDuration, false);
        const targetQuants = ratio2[0] * baseQuants;
        let currentQuants = 0;
        for (let j = 0; startIndex + j < events.length; j++) {
          const e = events[startIndex + j];
          const eventQuants = getNoteDuration(e.duration, e.dotted, void 0);
          currentQuants += eventQuants;
          groupEvents.push(e);
          if (currentQuants >= targetQuants) {
            break;
          }
        }
      } else {
        for (let j = 0; j < groupSize && startIndex + j < events.length; j++) {
          groupEvents.push(events[startIndex + j]);
        }
      }
      return groupEvents;
    };
    calculateTupletBrackets = (events, eventPositions, clef = "treble") => {
      const brackets = [];
      const getEventYBounds = (event, dir) => {
        var _a;
        const realNotes = event.notes.filter((n) => n.pitch !== null);
        if (realNotes.length === 0) {
          const middleY = CONFIG.baseY + CONFIG.lineHeight * 2;
          return { topY: middleY, bottomY: middleY };
        }
        const noteYs = realNotes.map((n) => CONFIG.baseY + getOffsetForPitch(n.pitch, clef));
        const minNoteY = Math.min(...noteYs);
        const maxNoteY = Math.max(...noteYs);
        const chordDir = ((_a = event.chordLayout) == null ? void 0 : _a.direction) || "down";
        const stemLen = STEM.LENGTHS.default;
        let topY = minNoteY;
        let bottomY = maxNoteY;
        if (chordDir === "up") {
          topY = Math.min(topY, minNoteY - stemLen);
        } else {
          bottomY = Math.max(bottomY, maxNoteY + stemLen);
        }
        return { topY, bottomY };
      };
      const processedIndices = /* @__PURE__ */ new Set();
      for (let i = 0; i < events.length; i++) {
        if (processedIndices.has(i)) continue;
        const event = events[i];
        if (event.tuplet && event.tuplet.position === 0) {
          const groupEvents = getTupletGroup(events, i);
          if (groupEvents.length === 0) continue;
          let upCount = 0;
          let downCount = 0;
          groupEvents.forEach((e) => {
            var _a;
            if (((_a = e.chordLayout) == null ? void 0 : _a.direction) === "up") upCount++;
            else downCount++;
          });
          const direction = upCount >= downCount ? "up" : "down";
          const xValues = groupEvents.map((e) => eventPositions[e.id] || 0);
          const minX = Math.min(...xValues);
          const maxX = Math.max(...xValues);
          const startX = minX - TUPLET.VISUAL_NOTE_RADIUS;
          const endX = maxX + TUPLET.VISUAL_NOTE_RADIUS;
          const yBounds = groupEvents.map((e) => getEventYBounds(e));
          Math.min(...yBounds.map((b) => b.topY));
          Math.max(...yBounds.map((b) => b.bottomY));
          const limits = groupEvents.map((e) => {
            const bounds = getEventYBounds(e);
            return {
              x: eventPositions[e.id],
              y: direction === "up" ? bounds.topY : bounds.bottomY
            };
          });
          let y1 = limits[0].y + (direction === "up" ? -TUPLET.PADDING : TUPLET.PADDING);
          let y2 = limits[limits.length - 1].y + (direction === "up" ? -TUPLET.PADDING : TUPLET.PADDING);
          let m = (y2 - y1) / (endX - startX);
          if (Math.abs(m) > TUPLET.MAX_SLOPE) {
            m = m > 0 ? TUPLET.MAX_SLOPE : -TUPLET.MAX_SLOPE;
            const midX = (startX + endX) / 2;
            const midY = (y1 + y2) / 2;
            y1 = midY - m * (midX - startX);
            y2 = midY + m * (endX - midX);
          }
          let maxShift = 0;
          limits.forEach((limit) => {
            const targetY = y1 + m * (limit.x - startX);
            if (direction === "up") {
              const dist = targetY - (limit.y - TUPLET.PADDING);
              if (dist > 0) {
                maxShift = Math.max(maxShift, dist);
              }
            } else {
              const dist = limit.y + TUPLET.PADDING - targetY;
              if (dist > 0) {
                maxShift = Math.max(maxShift, dist);
              }
            }
          });
          if (direction === "up") {
            y1 -= maxShift;
            y2 -= maxShift;
          } else {
            y1 += maxShift;
            y2 += maxShift;
          }
          brackets.push({
            startX,
            endX,
            startY: y1,
            endY: y2,
            direction,
            number: event.tuplet.ratio[0]
          });
        }
      }
      return brackets;
    };
  }
});

// src/engines/layout/measure.ts
var HIT_RADIUS, ACCIDENTAL_PADDING, addHitZone, createEventHitZones, getEventMetrics, applyMeasureCentering, createEmptyMeasureLayout, processRegularEvent, getTupletUnifiedDirection, processTupletGroup, calculateMeasureLayout, calculateMeasureWidth, analyzePlacement;
var init_measure = __esm({
  "src/engines/layout/measure.ts"() {
    init_config();
    init_core();
    init_constants();
    init_positioning();
    init_tuplets();
    HIT_RADIUS = LAYOUT.HIT_ZONE_RADIUS;
    ACCIDENTAL_PADDING = NOTE_SPACING_BASE_UNIT * 0.8;
    LAYOUT.MIN_WIDTH_FACTORS;
    addHitZone = (zones, newZone) => {
      if (zones.length > 0) {
        const prevZone = zones[zones.length - 1];
        prevZone.endX = Math.min(prevZone.endX, newZone.startX);
      }
      zones.push(newZone);
    };
    createEventHitZones = (noteheadX, eventIndex, eventId, minOffset, maxOffset, totalWidth) => {
      const zones = [];
      const adjustedStartX = Math.max(0, noteheadX - HIT_RADIUS + minOffset);
      const adjustedEndX = noteheadX + HIT_RADIUS + maxOffset;
      zones.push({
        startX: adjustedStartX,
        endX: adjustedEndX,
        index: eventIndex,
        type: "EVENT",
        eventId
      });
      if (totalWidth > adjustedEndX - noteheadX + HIT_RADIUS) {
        zones.push({
          startX: adjustedEndX,
          endX: noteheadX + totalWidth,
          index: eventIndex + 1,
          type: "INSERT"
        });
      }
      return zones;
    };
    getEventMetrics = (event, clef) => {
      const chordLayout = calculateChordLayout(event.notes, clef);
      const hasAccidental = event.notes.some((n) => n.accidental);
      const accidentalSpace = hasAccidental ? ACCIDENTAL_PADDING : 0;
      const baseWidth = getNoteWidth(event.duration, event.dotted);
      const offsets = Object.values(chordLayout.noteOffsets);
      const hasSecond = offsets.some((v) => v !== 0);
      const secondSpace = hasSecond ? LAYOUT.SECOND_INTERVAL_SPACE : 0;
      const secondAccidentalSpace = hasSecond && hasAccidental ? ACCIDENTAL_PADDING * 0.5 : 0;
      const totalWidth = accidentalSpace + baseWidth + secondSpace + secondAccidentalSpace;
      const minOffset = offsets.length > 0 ? Math.min(0, ...offsets) : 0;
      const maxOffset = offsets.length > 0 ? Math.max(0, ...offsets) : 0;
      return { chordLayout, totalWidth, accidentalSpace, minOffset, maxOffset, baseWidth };
    };
    applyMeasureCentering = (events, measureWidth) => {
      if (events.length === 1 && events[0].id === "rest-placeholder") {
        const rest = events[0];
        const targetVisualCenter = measureWidth / 2;
        const x = targetVisualCenter - WHOLE_REST_WIDTH / 2;
        return [__spreadProps(__spreadValues({}, rest), { x })];
      }
      return events;
    };
    createEmptyMeasureLayout = () => {
      const width = getNoteWidth("whole", false);
      const x = CONFIG.measurePaddingLeft;
      const emptyChordLayout = {
        sortedNotes: [],
        direction: "up",
        noteOffsets: {},
        maxNoteShift: 0,
        minY: 0,
        maxY: 0
      };
      const totalWidth = Math.max(x + width, width + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight);
      const processedEvents = [{
        id: "rest-placeholder",
        duration: "whole",
        dotted: false,
        notes: [],
        isRest: true,
        x,
        quant: 0,
        chordLayout: emptyChordLayout
      }];
      return {
        hitZones: [{ startX: CONFIG.measurePaddingLeft, endX: x + width, index: 0, type: "APPEND" }],
        eventPositions: {},
        totalWidth,
        processedEvents: applyMeasureCentering(processedEvents, totalWidth)
      };
    };
    processRegularEvent = (event, eventIndex, ctx) => {
      var _a;
      const metrics = getEventMetrics(event, ctx.clef);
      let baseX = ctx.currentX;
      if (((_a = ctx.forcedEventPositions) == null ? void 0 : _a[ctx.currentQuant]) !== void 0) {
        baseX = ctx.forcedEventPositions[ctx.currentQuant];
      }
      const negativeCompensation = Math.abs(metrics.minOffset);
      const noteheadX = baseX + metrics.accidentalSpace + negativeCompensation;
      const processedEvent = __spreadProps(__spreadValues({}, event), {
        x: noteheadX,
        quant: ctx.currentQuant,
        chordLayout: metrics.chordLayout
      });
      const hitZones = createEventHitZones(
        noteheadX,
        eventIndex,
        event.id,
        metrics.minOffset,
        metrics.maxOffset,
        metrics.totalWidth
      );
      return {
        processedEvents: [processedEvent],
        hitZones,
        eventPositions: { [event.id]: noteheadX },
        widthConsumed: metrics.totalWidth + negativeCompensation,
        quantsConsumed: getNoteDuration(event.duration, event.dotted, event.tuplet)
      };
    };
    getTupletUnifiedDirection = (tupletGroup, clef) => {
      let maxDist = -1;
      let direction = "down";
      tupletGroup.forEach((te) => {
        te.notes.forEach((n) => {
          if (n.pitch === null) return;
          const y = CONFIG.baseY + getOffsetForPitch(n.pitch, clef);
          const dist = Math.abs(y - MIDDLE_LINE_Y);
          if (dist > maxDist) {
            maxDist = dist;
            direction = y <= MIDDLE_LINE_Y ? "down" : "up";
          }
        });
      });
      return direction;
    };
    processTupletGroup = (events, startIndex, ctx) => {
      var _a;
      const tupletGroup = getTupletGroup(events, startIndex);
      const startEvent = events[startIndex];
      const { ratio } = startEvent.tuplet;
      const unifiedDirection = getTupletUnifiedDirection(tupletGroup, ctx.clef);
      const processedEvents = [];
      const hitZones = [];
      const eventPositions = {};
      let x = ctx.currentX;
      let quant = ctx.currentQuant;
      if (((_a = ctx.forcedEventPositions) == null ? void 0 : _a[quant]) !== void 0) {
        x = ctx.forcedEventPositions[quant];
      }
      tupletGroup.forEach((tupletEvent) => {
        const evtIndex = events.indexOf(tupletEvent);
        const originalWidth = getNoteWidth(tupletEvent.duration, tupletEvent.dotted);
        const tupletWidth = originalWidth * Math.sqrt(ratio[1] / ratio[0]);
        const chordLayout = calculateChordLayout(tupletEvent.notes, ctx.clef, unifiedDirection);
        const minOffset = Math.min(0, ...Object.values(chordLayout.noteOffsets), 0);
        const maxOffset = Math.max(0, ...Object.values(chordLayout.noteOffsets), 0);
        eventPositions[tupletEvent.id] = x;
        processedEvents.push(__spreadProps(__spreadValues({}, tupletEvent), {
          x,
          quant,
          chordLayout
        }));
        const adjustedStartX = Math.max(0, x - HIT_RADIUS + minOffset);
        const adjustedEndX = x + HIT_RADIUS + maxOffset;
        hitZones.push({
          startX: adjustedStartX,
          endX: adjustedEndX,
          index: evtIndex,
          type: "EVENT",
          eventId: tupletEvent.id
        });
        if (tupletWidth > HIT_RADIUS * 2 + maxOffset) {
          hitZones.push({
            startX: adjustedEndX,
            endX: x + tupletWidth,
            index: evtIndex + 1,
            type: "INSERT"
          });
        }
        x += tupletWidth;
        quant += getNoteDuration(tupletEvent.duration, tupletEvent.dotted, tupletEvent.tuplet);
      });
      return {
        processedEvents,
        hitZones,
        eventPositions,
        widthConsumed: x - ctx.currentX,
        quantsConsumed: quant - ctx.currentQuant
      };
    };
    calculateMeasureLayout = (events, totalQuants = CONFIG.quantsPerMeasure, clef = "treble", isPickup = false, forcedEventPositions) => {
      if (events.length === 0) {
        return createEmptyMeasureLayout();
      }
      const hitZones = [];
      const eventPositions = {};
      const processedEvents = [];
      const processedIndices = /* @__PURE__ */ new Set();
      let currentX = CONFIG.measurePaddingLeft;
      let currentQuant = 0;
      hitZones.push({ startX: 0, endX: CONFIG.measurePaddingLeft, index: 0, type: "INSERT" });
      events.forEach((event, index) => {
        if (processedIndices.has(index)) return;
        const ctx = {
          currentX,
          currentQuant,
          clef,
          forcedEventPositions
        };
        const isTupletStart = event.tuplet && event.tuplet.position === 0;
        let result;
        if (isTupletStart) {
          result = processTupletGroup(events, index, ctx);
          const tupletGroup = getTupletGroup(events, index);
          tupletGroup.forEach((te) => {
            const idx = events.indexOf(te);
            if (idx !== -1) processedIndices.add(idx);
          });
        } else if (!event.tuplet || event.tuplet.position === 0) {
          result = processRegularEvent(event, index, ctx);
        } else {
          return;
        }
        result.processedEvents.forEach((pe) => processedEvents.push(pe));
        result.hitZones.forEach((hz) => addHitZone(hitZones, hz));
        Object.assign(eventPositions, result.eventPositions);
        currentX += result.widthConsumed;
        currentQuant += result.quantsConsumed;
        const nextEvent = events[index + 1];
        if (nextEvent && nextEvent.notes.some((n) => n.accidental)) {
          currentX += NOTE_SPACING_BASE_UNIT * LAYOUT.LOOKAHEAD_PADDING_FACTOR;
        }
      });
      addHitZone(hitZones, { startX: currentX, endX: currentX + LAYOUT.APPEND_ZONE_WIDTH, index: events.length, type: "APPEND" });
      const minDuration = isPickup ? "quarter" : "whole";
      const minWidth = getNoteWidth(minDuration, false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
      const finalWidth = Math.max(currentX + CONFIG.measurePaddingRight, minWidth);
      return { hitZones, eventPositions, totalWidth: finalWidth, processedEvents };
    };
    calculateMeasureWidth = (events, isPickup = false) => {
      return calculateMeasureLayout(events, void 0, "treble", isPickup).totalWidth;
    };
    analyzePlacement = (events, intendedQuant) => {
      const MAGNET_THRESHOLD = 3;
      let currentQuant = 0;
      for (const [i, event] of events.entries()) {
        const eventDur = getNoteDuration(event.duration, event.dotted, event.tuplet);
        if (Math.abs(intendedQuant - currentQuant) <= MAGNET_THRESHOLD) {
          return { mode: "CHORD", index: i, visualQuant: currentQuant };
        }
        if (intendedQuant < currentQuant + eventDur) {
          return { mode: "INSERT", index: i, quant: currentQuant, visualQuant: intendedQuant };
        }
        currentQuant += eventDur;
      }
      return { mode: "APPEND", index: events.length, visualQuant: currentQuant };
    };
  }
});

// src/engines/layout/system.ts
var ACCIDENTAL_PADDING2, MIN_WIDTH_FACTORS2, getSystemTimePoints, findEventAtQuant, calculateEventPadding, getSegmentWidthRequirement, calculateSystemLayout;
var init_system = __esm({
  "src/engines/layout/system.ts"() {
    init_config();
    init_core();
    init_constants();
    init_positioning();
    ACCIDENTAL_PADDING2 = NOTE_SPACING_BASE_UNIT * 0.8;
    MIN_WIDTH_FACTORS2 = LAYOUT.MIN_WIDTH_FACTORS;
    getSystemTimePoints = (measures) => {
      const points = /* @__PURE__ */ new Set([0]);
      measures.forEach((measure) => {
        let q = 0;
        measure.events.forEach((event) => {
          points.add(q);
          q += getNoteDuration(event.duration, event.dotted, event.tuplet);
          points.add(q);
        });
      });
      return Array.from(points).sort((a, b) => a - b);
    };
    findEventAtQuant = (events, targetQuant) => {
      let q = 0;
      for (const event of events) {
        if (q === targetQuant) return event;
        q += getNoteDuration(event.duration, event.dotted, event.tuplet);
        if (q > targetQuant) return null;
      }
      return null;
    };
    calculateEventPadding = (event) => {
      let padding = 0;
      const hasAccidental = event.notes.some((n) => n.accidental);
      if (hasAccidental) {
        padding = Math.max(padding, ACCIDENTAL_PADDING2);
      }
      const chordLayout = calculateChordLayout(event.notes, "treble");
      const hasSecond = Object.values(chordLayout.noteOffsets).some((v) => v !== 0);
      if (hasSecond) {
        padding = Math.max(padding, LAYOUT.SECOND_INTERVAL_SPACE);
        if (hasAccidental) {
          padding = Math.max(padding, LAYOUT.SECOND_INTERVAL_SPACE + ACCIDENTAL_PADDING2 * 0.5);
        }
      }
      if (event.dotted) {
        padding = Math.max(padding, NOTE_SPACING_BASE_UNIT * 0.5);
      }
      return padding;
    };
    getSegmentWidthRequirement = (startQuant, endQuant, measures) => {
      const segmentDuration = endQuant - startQuant;
      let maxSegmentWidth = NOTE_SPACING_BASE_UNIT * Math.sqrt(segmentDuration);
      let maxExtraPadding = 0;
      measures.forEach((measure) => {
        const event = findEventAtQuant(measure.events, startQuant);
        if (!event) return;
        const minFactor = MIN_WIDTH_FACTORS2[event.duration] || 0;
        if (minFactor > 0) {
          maxSegmentWidth = Math.max(maxSegmentWidth, minFactor * NOTE_SPACING_BASE_UNIT);
        }
        const padding = calculateEventPadding(event);
        maxExtraPadding = Math.max(maxExtraPadding, padding);
      });
      return maxSegmentWidth + maxExtraPadding;
    };
    calculateSystemLayout = (measures) => {
      const timePoints = getSystemTimePoints(measures);
      const quantToX = { [timePoints[0]]: CONFIG.measurePaddingLeft };
      let currentX = CONFIG.measurePaddingLeft;
      for (let i = 0; i < timePoints.length - 1; i++) {
        const startQuant = timePoints[i];
        const endQuant = timePoints[i + 1];
        const segmentWidth = getSegmentWidthRequirement(startQuant, endQuant, measures);
        currentX += segmentWidth;
        quantToX[endQuant] = currentX;
      }
      return quantToX;
    };
  }
});

// src/engines/layout/index.ts
var layout_exports = {};
__export(layout_exports, {
  BASS_PITCH_TO_OFFSET: () => BASS_PITCH_TO_OFFSET,
  BASS_Y_TO_PITCH: () => BASS_Y_TO_PITCH,
  HEADER_CONSTANTS: () => HEADER_CONSTANTS,
  PITCH_TO_OFFSET: () => PITCH_TO_OFFSET,
  Y_TO_PITCH: () => Y_TO_PITCH,
  analyzePlacement: () => analyzePlacement,
  applyMeasureCentering: () => applyMeasureCentering,
  calculateBeamingGroups: () => calculateBeamingGroups,
  calculateChordLayout: () => calculateChordLayout,
  calculateHeaderLayout: () => calculateHeaderLayout,
  calculateMeasureLayout: () => calculateMeasureLayout,
  calculateMeasureWidth: () => calculateMeasureWidth,
  calculateSystemLayout: () => calculateSystemLayout,
  calculateTupletBrackets: () => calculateTupletBrackets,
  getNoteWidth: () => getNoteWidth,
  getOffsetForPitch: () => getOffsetForPitch,
  getPitchForOffset: () => getPitchForOffset,
  getPitchToOffset: () => getPitchToOffset,
  getStemOffset: () => getStemOffset,
  getTupletGroup: () => getTupletGroup,
  getYToPitch: () => getYToPitch
});
var init_layout = __esm({
  "src/engines/layout/index.ts"() {
    init_types();
    init_positioning();
    init_beaming();
    init_measure();
    init_tuplets();
    init_system();
  }
});

// src/types.ts
var createDefaultScore = () => ({
  title: "Composition",
  timeSignature: "4/4",
  keySignature: "C",
  bpm: 120,
  staves: [
    {
      id: "staff-1",
      clef: "treble",
      keySignature: "C",
      measures: [
        { id: "m1", events: [] },
        { id: "m2", events: [] }
      ]
    },
    {
      id: "staff-2",
      clef: "bass",
      keySignature: "C",
      measures: [
        { id: "m1-bass", events: [] },
        { id: "m2-bass", events: [] }
      ]
    }
  ]
});
var getActiveStaff = (score, staffIndex = 0) => {
  return score.staves[staffIndex] || score.staves[0];
};
var migrateScore = (oldScore) => {
  var _a;
  if (oldScore.staves && Array.isArray(oldScore.staves)) {
    const result = __spreadValues({}, oldScore);
    if (!result.keySignature) {
      result.keySignature = ((_a = result.staves[0]) == null ? void 0 : _a.keySignature) || "C";
    }
    if (result.staves[0]) {
      const updatedStaff = __spreadValues({}, result.staves[0]);
      if (oldScore.measures && oldScore.measures !== result.staves[0].measures) {
        updatedStaff.measures = oldScore.measures;
      }
      if (oldScore.keySignature && oldScore.keySignature !== result.staves[0].keySignature) {
        updatedStaff.keySignature = oldScore.keySignature;
        result.keySignature = oldScore.keySignature;
      }
      if (oldScore.clef && oldScore.clef !== result.staves[0].clef) {
        updatedStaff.clef = oldScore.clef;
      }
      if (!result.timeSignature && updatedStaff.timeSignature) {
        result.timeSignature = updatedStaff.timeSignature;
      }
      result.staves = [updatedStaff, ...result.staves.slice(1)];
    }
    return result;
  }
  return {
    title: oldScore.title || "Composition",
    timeSignature: oldScore.timeSignature || "4/4",
    keySignature: oldScore.keySignature || "C",
    bpm: oldScore.bpm || 120,
    staves: [
      {
        id: "staff-1",
        clef: oldScore.clef || "treble",
        keySignature: oldScore.keySignature || "C",
        measures: oldScore.measures || [{ id: "m1", events: [] }, { id: "m2", events: [] }]
      }
    ]
  };
};
var createDefaultSelection = () => ({
  staffIndex: 0,
  measureIndex: null,
  eventId: null,
  noteId: null,
  selectedNotes: [],
  anchor: null
});
var DEFAULT_RIFF_CONFIG = {
  ui: {
    showToolbar: true,
    scale: 1
  },
  interaction: {
    isEnabled: true,
    enableKeyboard: true,
    enablePlayback: true
  },
  score: {
    title: "Untitled",
    bpm: 120,
    timeSignature: "4/4",
    keySignature: "C",
    staff: "grand",
    measureCount: 4
  }
};

// src/utils/mergeConfig.ts
var isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function mergeObjects(target, source) {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return target;
  }
  const result = __spreadValues({}, target);
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];
    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      result[key] = mergeObjects(targetVal, sourceVal);
    } else if (sourceVal !== void 0) {
      result[key] = sourceVal;
    }
  }
  return result;
}
var mergeRiffConfig = (userConfig = {}) => {
  var _a, _b, _c;
  const base = __spreadValues({}, DEFAULT_RIFF_CONFIG);
  return {
    ui: mergeObjects(base.ui, (_a = userConfig.ui) != null ? _a : {}),
    interaction: mergeObjects(base.interaction, (_b = userConfig.interaction) != null ? _b : {}),
    score: mergeObjects(base.score, (_c = userConfig.score) != null ? _c : {})
  };
};

// src/utils/generateScore.ts
var idCounter = 0;
var generateId = (prefix) => `${prefix}-${++idCounter}`;
var createEmptyMeasure = () => ({
  id: generateId("m"),
  events: []
});
var createStaff = (clef, measureCount, keySignature) => ({
  id: generateId("staff"),
  clef,
  keySignature,
  measures: Array.from({ length: measureCount }, () => createEmptyMeasure())
});
var generateStaves = (template, measureCount, keySignature) => {
  idCounter = 0;
  switch (template) {
    case "grand":
      return [
        createStaff("treble", measureCount, keySignature),
        createStaff("bass", measureCount, keySignature)
      ];
    case "treble":
      return [createStaff("treble", measureCount, keySignature)];
    case "bass":
      return [createStaff("bass", measureCount, keySignature)];
    default:
      return [createStaff("treble", measureCount, keySignature)];
  }
};

// src/hooks/useRiffScore.ts
var useRiffScore = (userConfig = {}) => {
  const config = React3.useMemo(
    () => mergeRiffConfig(userConfig),
    [userConfig]
  );
  const initialScore = React3.useMemo(() => {
    var _a, _b;
    const { score: scoreConfig } = config;
    if (scoreConfig.staves && scoreConfig.staves.length > 0) {
      return {
        title: scoreConfig.title,
        timeSignature: scoreConfig.timeSignature,
        keySignature: scoreConfig.keySignature,
        bpm: scoreConfig.bpm,
        staves: scoreConfig.staves
      };
    }
    const template = (_a = scoreConfig.staff) != null ? _a : "grand";
    const measureCount = (_b = scoreConfig.measureCount) != null ? _b : 2;
    const generatedStaves = generateStaves(
      template,
      measureCount,
      scoreConfig.keySignature
    );
    return {
      title: scoreConfig.title,
      timeSignature: scoreConfig.timeSignature,
      keySignature: scoreConfig.keySignature,
      bpm: scoreConfig.bpm,
      staves: generatedStaves
    };
  }, [config]);
  return { config, initialScore };
};

// src/hooks/useScoreLogic.ts
init_constants();
init_config();

// src/utils/debug.ts
init_config();
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
  return LogLevel2;
})(LogLevel || {});
var DebugLogger = class _DebugLogger {
  constructor() {
  }
  static getInstance() {
    if (!_DebugLogger.instance) {
      _DebugLogger.instance = new _DebugLogger();
    }
    return _DebugLogger.instance;
  }
  shouldLog(level) {
    var _a;
    if (!((_a = CONFIG.debug) == null ? void 0 : _a.enabled)) return false;
    return true;
  }
  log(message, data, level = 1 /* INFO */) {
    if (!this.shouldLog(level)) return;
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[1].slice(0, -1);
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;
    switch (level) {
      case 3 /* ERROR */:
        console.error(prefix, message, data || "");
        break;
      case 2 /* WARN */:
        console.warn(prefix, message, data || "");
        break;
      case 0 /* DEBUG */:
        console.debug(prefix, message, data || "");
        break;
      default:
        console.log(prefix, message, data || "");
    }
  }
  group(label) {
    var _a;
    if ((_a = CONFIG.debug) == null ? void 0 : _a.enabled) {
      console.group(label);
    }
  }
  groupEnd() {
    var _a;
    if ((_a = CONFIG.debug) == null ? void 0 : _a.enabled) {
      console.groupEnd();
    }
  }
  logCommand(commandType, payload) {
    var _a;
    if ((_a = CONFIG.debug) == null ? void 0 : _a.logCommands) {
      this.log(`COMMAND: ${commandType}`, payload, 1 /* INFO */);
    }
  }
  logStateChange(oldStateHash, newStateHash) {
    var _a;
    if ((_a = CONFIG.debug) == null ? void 0 : _a.logStateChanges) {
      this.log(`STATE CHANGE: ${oldStateHash} -> ${newStateHash}`, void 0, 0 /* DEBUG */);
    }
  }
  logValidationFailure(reason, context) {
    var _a;
    if ((_a = CONFIG.debug) == null ? void 0 : _a.logValidation) {
      this.log(`VALIDATION FAILED: ${reason}`, context, 3 /* ERROR */);
    }
  }
};
var logger = DebugLogger.getInstance();

// src/engines/ScoreEngine.ts
var ScoreEngine = class {
  constructor(initialScore) {
    this.listeners = /* @__PURE__ */ new Set();
    this.history = [];
    this.redoStack = [];
    this.state = initialScore || createDefaultScore();
  }
  getHistory() {
    return this.history;
  }
  getRedoStack() {
    return this.redoStack;
  }
  getState() {
    return this.state;
  }
  setState(newState) {
    if (!newState || !newState.staves) {
      logger.logValidationFailure("Attempted to set invalid state in ScoreEngine", newState);
      return;
    }
    this.state = newState;
    this.notifyListeners();
  }
  dispatch(command) {
    logger.logCommand(command.type, command);
    try {
      const newState = command.execute(this.state);
      if (!newState || !newState.staves) {
        logger.logValidationFailure(`Command ${command.type} returned invalid state`, newState);
        return;
      }
      this.history.push(command);
      this.redoStack = [];
      this.setState(newState);
    } catch (error) {
      logger.log(`Error executing command ${command.type}`, error, 3 /* ERROR */);
      console.error(error);
    }
  }
  undo() {
    const command = this.history.pop();
    if (command) {
      const newState = command.undo(this.state);
      this.redoStack.push(command);
      this.setState(newState);
    }
  }
  redo() {
    const command = this.redoStack.pop();
    if (command) {
      const newState = command.execute(this.state);
      this.history.push(command);
      this.setState(newState);
    }
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }
};

// src/hooks/useScoreEngine.ts
var useScoreEngine = (initialScore) => {
  const engineRef = React3.useRef(null);
  if (!engineRef.current) {
    engineRef.current = new ScoreEngine(initialScore);
  }
  const engine = engineRef.current;
  const [score, setScore] = React3.useState(engine.getState());
  React3.useEffect(() => {
    const unsubscribe = engine.subscribe((newScore) => {
      setScore(newScore);
    });
    return () => {
      unsubscribe();
    };
  }, [engine]);
  return {
    score,
    engine
  };
};
var useEditorTools = () => {
  const [activeDuration, setActiveDuration] = React3.useState("quarter");
  const [isDotted, setIsDotted] = React3.useState(false);
  const [activeAccidental, setActiveAccidental] = React3.useState(null);
  const [activeTie, setActiveTie] = React3.useState(false);
  const [inputMode, setInputMode] = React3.useState("NOTE");
  const [userSelectedDuration, setUserSelectedDuration] = React3.useState("quarter");
  const [userSelectedDotted, setUserSelectedDotted] = React3.useState(false);
  const handleDurationChange = (newDuration) => {
    setActiveDuration(newDuration);
    setUserSelectedDuration(newDuration);
  };
  const handleDotToggle = () => {
    const newState = !isDotted;
    setIsDotted(newState);
    setUserSelectedDotted(newState);
    return newState;
  };
  const handleAccidentalToggle = (type) => {
    const newState = activeAccidental === type ? null : type;
    setActiveAccidental(newState);
    return newState;
  };
  const handleTieToggle = () => {
    const newState = !activeTie;
    setActiveTie(newState);
    return newState;
  };
  const toggleInputMode = React3.useCallback(() => {
    setInputMode((prev) => prev === "NOTE" ? "REST" : "NOTE");
  }, []);
  return {
    activeDuration,
    setActiveDuration,
    isDotted,
    setIsDotted,
    activeAccidental,
    setActiveAccidental,
    activeTie,
    setActiveTie,
    userSelectedDuration,
    userSelectedDotted,
    handleDurationChange,
    handleDotToggle,
    handleAccidentalToggle,
    handleTieToggle,
    // New: Input mode
    inputMode,
    setInputMode,
    toggleInputMode
  };
};

// src/commands/MeasureCommands.ts
var AddMeasureCommand = class {
  constructor() {
    this.type = "ADD_MEASURE";
    this.addedMeasureIds = [];
  }
  execute(score) {
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      const newId = Date.now().toString() + "-" + index;
      this.addedMeasureIds[index] = newId;
      const newMeasure = {
        id: newId,
        events: []
      };
      newMeasures.push(newMeasure);
      return __spreadProps(__spreadValues({}, staff), { measures: newMeasures });
    });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
  undo(score) {
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      if (newMeasures.length > 0) {
        const lastMeasure = newMeasures[newMeasures.length - 1];
        if (this.addedMeasureIds[index] && lastMeasure.id === this.addedMeasureIds[index]) {
          newMeasures.pop();
        } else if (!this.addedMeasureIds[index]) {
          newMeasures.pop();
        }
      }
      return __spreadProps(__spreadValues({}, staff), { measures: newMeasures });
    });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
};
var DeleteMeasureCommand = class {
  constructor(index) {
    this.index = index;
    this.type = "DELETE_MEASURE";
    this.deletedMeasures = [];
    this.deletedIndex = -1;
  }
  execute(score) {
    const firstStaff = score.staves[0];
    if (!firstStaff || firstStaff.measures.length === 0) return score;
    const targetIndex = this.index !== void 0 ? this.index : firstStaff.measures.length - 1;
    if (targetIndex < 0 || targetIndex >= firstStaff.measures.length) return score;
    this.deletedIndex = targetIndex;
    this.deletedMeasures = [];
    const newStaves = score.staves.map((staff) => {
      const newMeasures = [...staff.measures];
      if (targetIndex < newMeasures.length) {
        this.deletedMeasures.push(newMeasures[targetIndex]);
        newMeasures.splice(targetIndex, 1);
      }
      return __spreadProps(__spreadValues({}, staff), { measures: newMeasures });
    });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
  undo(score) {
    if (this.deletedIndex === -1 || this.deletedMeasures.length === 0) return score;
    const newStaves = score.staves.map((staff, index) => {
      const newMeasures = [...staff.measures];
      const deletedMeasure = this.deletedMeasures[index];
      if (deletedMeasure) {
        newMeasures.splice(this.deletedIndex, 0, deletedMeasure);
      }
      return __spreadProps(__spreadValues({}, staff), { measures: newMeasures });
    });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
};

// src/commands/TogglePickupCommand.ts
var TogglePickupCommand = class {
  constructor() {
    this.type = "TOGGLE_PICKUP";
  }
  execute(score) {
    const firstStaff = score.staves[0];
    if (!firstStaff || firstStaff.measures.length === 0) return score;
    const firstMeasure = firstStaff.measures[0];
    this.previousIsPickup = !!firstMeasure.isPickup;
    const newIsPickup = !firstMeasure.isPickup;
    const newStaves = score.staves.map((staff) => {
      if (staff.measures.length === 0) return staff;
      const newMeasures = [...staff.measures];
      newMeasures[0] = __spreadProps(__spreadValues({}, newMeasures[0]), {
        isPickup: newIsPickup
      });
      return __spreadProps(__spreadValues({}, staff), { measures: newMeasures });
    });
    return __spreadProps(__spreadValues({}, score), {
      staves: newStaves
    });
  }
  undo(score) {
    if (this.previousIsPickup === void 0) return score;
    const newStaves = score.staves.map((staff) => {
      if (staff.measures.length === 0) return staff;
      const newMeasures = [...staff.measures];
      newMeasures[0] = __spreadProps(__spreadValues({}, newMeasures[0]), {
        isPickup: this.previousIsPickup
      });
      return __spreadProps(__spreadValues({}, staff), { measures: newMeasures });
    });
    return __spreadProps(__spreadValues({}, score), {
      staves: newStaves
    });
  }
};

// src/commands/SetGrandStaffCommand.ts
var SetGrandStaffCommand = class {
  constructor() {
    this.type = "SET_GRAND_STAFF";
    this.previousStaves = null;
  }
  execute(score) {
    if (score.staves.length >= 2) return score;
    this.previousStaves = [...score.staves];
    const existingStaff = score.staves[0];
    const isBassClef = existingStaff.clef === "bass";
    const emptyMeasures = existingStaff.measures.map((m, index) => ({
      id: Date.now() + index + 1e3,
      events: [],
      isPickup: m.isPickup
    }));
    if (isBassClef) {
      const trebleStaff = {
        id: Date.now() + 2e3,
        clef: "treble",
        keySignature: existingStaff.keySignature,
        measures: emptyMeasures
      };
      const bassStaff = __spreadProps(__spreadValues({}, existingStaff), {
        clef: "bass"
        // Ensure it's marked as bass
      });
      return __spreadProps(__spreadValues({}, score), {
        staves: [trebleStaff, bassStaff]
      });
    } else {
      const bassStaff = {
        id: Date.now() + 2e3,
        clef: "bass",
        keySignature: existingStaff.keySignature,
        measures: emptyMeasures
      };
      const trebleStaff = __spreadProps(__spreadValues({}, existingStaff), {
        clef: "treble"
      });
      return __spreadProps(__spreadValues({}, score), {
        staves: [trebleStaff, bassStaff]
      });
    }
  }
  undo(score) {
    if (!this.previousStaves) return score;
    return __spreadProps(__spreadValues({}, score), {
      staves: this.previousStaves
    });
  }
};

// src/commands/SetTimeSignatureCommand.ts
init_core();
var SetTimeSignatureCommand = class {
  constructor(newSignature) {
    this.newSignature = newSignature;
    this.type = "SET_TIME_SIGNATURE";
    this.previousTimeSignature = null;
    this.previousStaves = null;
  }
  execute(score) {
    this.previousTimeSignature = score.timeSignature;
    this.previousStaves = score.staves;
    if (this.newSignature === score.timeSignature) {
      return score;
    }
    const newStaves = score.staves.map((staff) => __spreadProps(__spreadValues({}, staff), {
      measures: reflowScore(staff.measures, this.newSignature)
    }));
    return __spreadProps(__spreadValues({}, score), {
      timeSignature: this.newSignature,
      staves: newStaves
    });
  }
  undo(score) {
    if (!this.previousTimeSignature || !this.previousStaves) return score;
    return __spreadProps(__spreadValues({}, score), {
      timeSignature: this.previousTimeSignature,
      staves: this.previousStaves
    });
  }
};

// src/commands/SetKeySignatureCommand.ts
var SetKeySignatureCommand = class {
  constructor(newSignature) {
    this.newSignature = newSignature;
    this.type = "SET_KEY_SIGNATURE";
    this.previousKeySignature = null;
    this.previousStaves = null;
  }
  execute(score) {
    this.previousKeySignature = score.keySignature;
    this.previousStaves = score.staves;
    if (this.newSignature === score.keySignature) {
      return score;
    }
    const newStaves = score.staves.map((staff) => __spreadProps(__spreadValues({}, staff), {
      keySignature: this.newSignature
    }));
    return __spreadProps(__spreadValues({}, score), {
      keySignature: this.newSignature,
      staves: newStaves
    });
  }
  undo(score) {
    if (!this.previousKeySignature || !this.previousStaves) return score;
    return __spreadProps(__spreadValues({}, score), {
      keySignature: this.previousKeySignature,
      staves: this.previousStaves
    });
  }
};

// src/hooks/useMeasureActions.ts
var useMeasureActions = ({
  score,
  setSelection,
  setPreviewNote,
  dispatch
}) => {
  const handleTimeSignatureChange = React3.useCallback((newSig) => {
    if (newSig === score.timeSignature) return;
    dispatch(new SetTimeSignatureCommand(newSig));
    setSelection(createDefaultSelection());
    setPreviewNote(null);
  }, [score.timeSignature, dispatch, setSelection, setPreviewNote]);
  const handleKeySignatureChange = React3.useCallback((newKey) => {
    if (newKey === score.keySignature) return;
    dispatch(new SetKeySignatureCommand(newKey));
  }, [score.keySignature, dispatch]);
  const addMeasure = React3.useCallback(() => {
    dispatch(new AddMeasureCommand());
  }, [dispatch]);
  const removeMeasure = React3.useCallback(() => {
    dispatch(new DeleteMeasureCommand());
  }, [dispatch]);
  return {
    handleTimeSignatureChange,
    handleKeySignatureChange,
    addMeasure,
    removeMeasure,
    togglePickup: React3.useCallback(() => {
      dispatch(new TogglePickupCommand());
    }, [dispatch]),
    setGrandStaff: React3.useCallback(() => {
      dispatch(new SetGrandStaffCommand());
    }, [dispatch])
  };
};

// src/utils/interaction.ts
init_core();
init_MusicService();
init_config();
var getAppendPreviewNote = (measure, measureIndex, staffIndex, activeDuration, isDotted, pitch, isRest = false) => {
  var _a;
  const totalQuants = calculateTotalQuants(measure.events || []);
  let defaultPitch = pitch;
  if (!defaultPitch) {
    if (measure.events.length > 0) {
      const lastEvent = measure.events[measure.events.length - 1];
      if (!lastEvent.isRest && ((_a = lastEvent.notes) == null ? void 0 : _a.length) > 0) {
        defaultPitch = lastEvent.notes[0].pitch;
      } else {
        defaultPitch = "C4";
      }
    } else {
      defaultPitch = "C4";
    }
  }
  return {
    measureIndex,
    staffIndex,
    quant: totalQuants,
    visualQuant: totalQuants,
    pitch: defaultPitch,
    duration: activeDuration,
    dotted: isDotted,
    mode: "APPEND",
    index: measure.events.length,
    isRest
  };
};
var calculateNextSelection = (measures, selection, direction, previewNote, activeDuration, isDotted, currentQuantsPerMeasure = CONFIG.quantsPerMeasure, clef = "treble", staffIndex = 0, inputMode = "NOTE") => {
  var _a, _b, _c;
  if (selection.eventId === null && previewNote && direction === "left") {
    const measureIndex = previewNote.measureIndex;
    const measure = measures[measureIndex];
    if (measure && measure.events.length > 0) {
      const lastEvent = measure.events[measure.events.length - 1];
      const noteId = lastEvent.isRest || !((_a = lastEvent.notes) == null ? void 0 : _a.length) ? null : lastEvent.notes[0].id;
      const audio = lastEvent.isRest ? null : { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted };
      return {
        selection: { staffIndex, measureIndex, eventId: lastEvent.id, noteId },
        previewNote: null,
        audio
      };
    } else if (measureIndex > 0) {
      const prevMeasure = measures[measureIndex - 1];
      if (prevMeasure && prevMeasure.events.length > 0) {
        const lastEvent = prevMeasure.events[prevMeasure.events.length - 1];
        const noteId = lastEvent.isRest || !((_b = lastEvent.notes) == null ? void 0 : _b.length) ? null : lastEvent.notes[0].id;
        const audio = lastEvent.isRest ? null : { notes: lastEvent.notes, duration: lastEvent.duration, dotted: lastEvent.dotted };
        return {
          selection: { staffIndex, measureIndex: measureIndex - 1, eventId: lastEvent.id, noteId },
          previewNote: null,
          audio
        };
      }
    }
  }
  const newSelection = navigateSelection(measures, selection, direction, clef);
  if (newSelection !== selection) {
    const measure = measures[newSelection.measureIndex];
    let audio = null;
    if (measure) {
      const event = measure.events.find((e) => e.id === newSelection.eventId);
      if (event) {
        if (newSelection.noteId) {
          const note = event.notes.find((n) => n.id === newSelection.noteId);
          if (note) audio = { notes: [note], duration: event.duration, dotted: event.dotted };
        } else {
          audio = { notes: event.notes, duration: event.duration, dotted: event.dotted };
        }
      }
    }
    return { selection: __spreadProps(__spreadValues({}, newSelection), { staffIndex }), previewNote: null, audio };
  }
  if (direction === "right" && selection.measureIndex !== null) {
    const currentMeasure = measures[selection.measureIndex];
    const eventIdx = currentMeasure.events.findIndex((e) => e.id === selection.eventId);
    if (eventIdx === currentMeasure.events.length - 1) {
      const totalQuants = calculateTotalQuants(currentMeasure.events);
      const currentEvent = currentMeasure.events[eventIdx];
      if (!currentEvent) {
        return null;
      }
      const defaultPitch = clef === "bass" ? "D3" : "B4";
      const pitch = !currentEvent.isRest && ((_c = currentEvent.notes) == null ? void 0 : _c.length) > 0 ? currentEvent.notes[0].pitch : defaultPitch;
      if (totalQuants < currentQuantsPerMeasure) {
        return {
          selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
          previewNote: getAppendPreviewNote(currentMeasure, selection.measureIndex, staffIndex, activeDuration, isDotted, pitch, inputMode === "REST"),
          audio: null
        };
      } else {
        const nextMeasureIndex = selection.measureIndex + 1;
        const shouldCreateMeasure = nextMeasureIndex >= measures.length;
        return {
          selection: { staffIndex, measureIndex: null, eventId: null, noteId: null },
          previewNote: {
            measureIndex: nextMeasureIndex,
            staffIndex,
            quant: 0,
            visualQuant: 0,
            pitch,
            duration: activeDuration,
            dotted: isDotted,
            mode: "APPEND",
            index: 0,
            isRest: inputMode === "REST"
          },
          shouldCreateMeasure,
          audio: null
        };
      }
    }
  }
  return null;
};
var calculateTransposition = (measures, selection, steps, keySignature = "C") => {
  const { measureIndex, eventId, noteId } = selection;
  if (measureIndex === null || !eventId) return null;
  const newMeasures = [...measures];
  const measure = __spreadValues({}, newMeasures[measureIndex]);
  const events = [...measure.events];
  const eventIdx = events.findIndex((e) => e.id === eventId);
  if (eventIdx === -1) return null;
  const event = __spreadValues({}, events[eventIdx]);
  const notes = [...event.notes];
  const modifyNote = (note) => {
    const newPitch = movePitchVisual(note.pitch, steps, keySignature);
    return __spreadProps(__spreadValues({}, note), { pitch: newPitch });
  };
  if (noteId) {
    const noteIdx = notes.findIndex((n) => n.id === noteId);
    if (noteIdx !== -1) {
      notes[noteIdx] = modifyNote(notes[noteIdx]);
    }
  } else {
    notes.forEach((n, i) => {
      notes[i] = modifyNote(n);
    });
  }
  event.notes = notes;
  events[eventIdx] = event;
  measure.events = events;
  newMeasures[measureIndex] = measure;
  return { measures: newMeasures, event };
};
var calculateTranspositionWithPreview = (measures, selection, previewNote, direction, isShift, keySignature = "C") => {
  let steps = direction === "up" ? 1 : -1;
  if (isShift) steps *= 7;
  if (selection.eventId === null && previewNote) {
    const newPitch = movePitchVisual(previewNote.pitch, steps, keySignature);
    if (newPitch !== previewNote.pitch) {
      return {
        previewNote: __spreadProps(__spreadValues({}, previewNote), { pitch: newPitch }),
        audio: { notes: [{ pitch: newPitch }], duration: previewNote.duration, dotted: previewNote.dotted }
      };
    }
    return null;
  }
  const result = calculateTransposition(measures, selection, steps, keySignature);
  if (result) {
    const { measures: newMeasures, event } = result;
    let audio = null;
    if (selection.noteId) {
      const note = event.notes.find((n) => n.id === selection.noteId);
      if (note) audio = { notes: [note], duration: event.duration, dotted: event.dotted };
    } else {
      audio = { notes: event.notes, duration: event.duration, dotted: event.dotted };
    }
    return { measures: newMeasures, audio };
  }
  return null;
};
var calculateCrossStaffSelection = (score, selection, direction, activeDuration = "quarter", isDotted = false) => {
  const { staffIndex, measureIndex, eventId } = selection;
  if (staffIndex === void 0 || measureIndex === null || !eventId) return null;
  const currentStaff = score.staves[staffIndex];
  if (!currentStaff) return null;
  const targetStaffIndex = direction === "up" ? staffIndex - 1 : staffIndex + 1;
  if (targetStaffIndex < 0 || targetStaffIndex >= score.staves.length) return null;
  const targetStaff = score.staves[targetStaffIndex];
  const currentMeasure = currentStaff.measures[measureIndex];
  if (!currentMeasure) return null;
  let currentQuantStart = 0;
  const currentEvent = currentMeasure.events.find((e) => {
    if (e.id === eventId) return true;
    currentQuantStart += getNoteDuration(e.duration, e.dotted, e.tuplet);
    return false;
  });
  if (!currentEvent) return null;
  const targetMeasure = targetStaff.measures[measureIndex];
  if (!targetMeasure) return null;
  let targetEvent = null;
  let targetQuant = 0;
  for (const e of targetMeasure.events) {
    const duration = getNoteDuration(e.duration, e.dotted, e.tuplet);
    const start2 = targetQuant;
    const end = targetQuant + duration;
    if (currentQuantStart >= start2 && currentQuantStart < end) {
      targetEvent = e;
      break;
    }
    targetQuant += duration;
  }
  if (targetEvent) {
    const noteId = targetEvent.notes.length > 0 ? targetEvent.notes[0].id : null;
    return {
      selection: {
        staffIndex: targetStaffIndex,
        measureIndex,
        eventId: targetEvent.id,
        noteId,
        selectedNotes: [],
        // Clear multi-select
        anchor: null
        // Clear anchor
      },
      previewNote: null
    };
  } else {
    const clef = targetStaff.clef || "treble";
    let defaultPitch = "C4";
    if (clef === "bass") defaultPitch = "C3";
    if (clef === "alto") defaultPitch = "C4";
    const previewNote = getAppendPreviewNote(
      targetMeasure,
      measureIndex,
      targetStaffIndex,
      activeDuration,
      isDotted,
      defaultPitch
    );
    return {
      selection: {
        staffIndex: targetStaffIndex,
        measureIndex,
        eventId: null,
        noteId: null,
        selectedNotes: [],
        anchor: null
      },
      previewNote
    };
  }
};

// src/utils/validation.ts
init_config();
init_core();
var canAddEventToMeasure = (events, duration, dotted, maxQuants = CONFIG.quantsPerMeasure) => {
  const currentTotal = calculateTotalQuants(events);
  const newDur = getNoteDuration(duration, dotted, void 0);
  return currentTotal + newDur <= maxQuants;
};
var canModifyEventDuration = (events, eventId, targetDuration, maxQuants = CONFIG.quantsPerMeasure) => {
  const eventIndex = events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) return true;
  const currentEvent = events[eventIndex];
  const otherEventsQuants = events.reduce((acc, e, idx) => {
    if (idx === eventIndex) return acc;
    return acc + getNoteDuration(e.duration, e.dotted, e.tuplet);
  }, 0);
  const newEventQuants = getNoteDuration(targetDuration, currentEvent.dotted, currentEvent.tuplet);
  return otherEventsQuants + newEventQuants <= maxQuants;
};
var canToggleEventDot = (events, eventId, maxQuants = CONFIG.quantsPerMeasure) => {
  const eventIndex = events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) return true;
  const currentEvent = events[eventIndex];
  const otherEventsQuants = events.reduce((acc, e, idx) => {
    if (idx === eventIndex) return acc;
    return acc + getNoteDuration(e.duration, e.dotted, e.tuplet);
  }, 0);
  const newEventQuants = getNoteDuration(currentEvent.duration, !currentEvent.dotted, currentEvent.tuplet);
  return otherEventsQuants + newEventQuants <= maxQuants;
};
var SYNTH_PRESETS = {
  bright: {
    name: "Bright Synth",
    create: () => new Tone__namespace.PolySynth(Tone__namespace.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.2,
        release: 1.5
      },
      modulation: { type: "triangle" },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.1,
        release: 0.5
      }
    }),
    volume: -10
  },
  mellow: {
    name: "Mellow Synth",
    create: () => new Tone__namespace.PolySynth(Tone__namespace.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.05,
        // Slower attack for warmth
        decay: 0.6,
        sustain: 0.3,
        release: 2
        // Long, smooth release
      }
    }),
    volume: -8
  },
  organ: {
    name: "Organ Synth",
    create: () => new Tone__namespace.PolySynth(Tone__namespace.Synth, {
      oscillator: { type: "triangle" },
      // Original audioEngine sound
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8
      }
    }),
    volume: -6
  }
};
var synths = {};
var sampler = null;
var currentPart = null;
var state = {
  instrumentState: "initializing",
  selectedInstrument: "bright",
  samplerLoaded: false,
  isPlaying: false
};
var onStateChange = null;
var freqToNote = (frequency) => {
  return Tone__namespace.Frequency(frequency).toNote();
};
var updateState = (partial) => {
  state = __spreadValues(__spreadValues({}, state), partial);
  onStateChange == null ? void 0 : onStateChange(state);
};
var initTone = async (onState) => {
  if (onState) onStateChange = onState;
  await Tone__namespace.start();
  for (const [key, preset] of Object.entries(SYNTH_PRESETS)) {
    if (!synths[key]) {
      const synth = preset.create().toDestination();
      synth.volume.value = preset.volume;
      synth.maxPolyphony = 24;
      synths[key] = synth;
    }
  }
  updateState({ instrumentState: "ready" });
  loadPianoSampler();
};
var loadPianoSampler = () => {
  if (sampler) return;
  console.log("\u{1F3B9} Starting piano sample load...");
  updateState({ instrumentState: "loading-samples" });
  const baseUrl = "/audio/piano/";
  sampler = new Tone__namespace.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      A6: "A6.mp3",
      C7: "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      A7: "A7.mp3",
      C8: "C8.mp3"
    },
    baseUrl,
    onload: () => {
      console.log("\u{1F3B9} Piano samples loaded");
      updateState({ samplerLoaded: true, instrumentState: "ready" });
    },
    onerror: (error) => {
      console.warn("Failed to load piano samples:", error);
      updateState({ instrumentState: "ready" });
    }
  }).toDestination();
};
var setInstrument = (type) => {
  updateState({ selectedInstrument: type });
};
var getActiveInstrument = () => {
  const selected = state.selectedInstrument;
  if (selected === "piano") {
    if (sampler && state.samplerLoaded) {
      return sampler;
    }
    return synths["bright"] || null;
  }
  return synths[selected] || synths["bright"] || null;
};
var scheduleTonePlayback = (timeline, bpm, startTimeOffset = 0, onPositionUpdate, onComplete) => {
  const instrument = getActiveInstrument();
  if (!instrument) {
    console.error("Tone engine not initialized");
    return;
  }
  stopTonePlayback();
  Tone__namespace.Transport.bpm.value = bpm;
  const filteredTimeline = timeline.filter((e) => e.time >= startTimeOffset);
  if (filteredTimeline.length === 0) {
    onComplete == null ? void 0 : onComplete();
    return;
  }
  const adjustedTimeline = filteredTimeline.map((e) => __spreadProps(__spreadValues({}, e), {
    time: e.time - startTimeOffset
  }));
  const events = adjustedTimeline.map((e) => ({
    time: e.time,
    note: e.pitch || freqToNote(e.frequency),
    duration: e.duration,
    measureIndex: e.measureIndex,
    quant: e.quant
  }));
  currentPart = new Tone__namespace.Part((time, event) => {
    instrument.triggerAttackRelease(event.note, event.duration, time);
    Tone__namespace.Draw.schedule(() => {
      onPositionUpdate == null ? void 0 : onPositionUpdate(event.measureIndex, event.quant, event.duration);
    }, time);
  }, events);
  currentPart.start(0);
  const lastEvent = events[events.length - 1];
  const endTime = lastEvent.time + lastEvent.duration + 0.1;
  Tone__namespace.Transport.scheduleOnce(() => {
    updateState({ isPlaying: false });
    onComplete == null ? void 0 : onComplete();
  }, endTime);
  Tone__namespace.Transport.start();
  updateState({ isPlaying: true });
};
var stopTonePlayback = () => {
  Tone__namespace.Transport.stop();
  Tone__namespace.Transport.cancel();
  if (currentPart) {
    currentPart.dispose();
    currentPart = null;
  }
  updateState({ isPlaying: false });
};
var playNote = async (pitch, duration = "8n") => {
  if (state.instrumentState === "initializing") {
    await initTone();
  }
  const instrument = getActiveInstrument();
  if (instrument) {
    instrument.triggerAttackRelease(pitch, duration);
  }
};
var isSamplerLoaded = () => state.samplerLoaded;

// src/hooks/useNoteActions.ts
init_MusicService();

// src/utils/commandHelpers.ts
var updateMeasure = (score, staffIndex, measureIndex, updateFn) => {
  const activeStaff = score.staves[staffIndex];
  if (!activeStaff) return score;
  const newMeasures = [...activeStaff.measures];
  if (!newMeasures[measureIndex]) return score;
  const measure = __spreadValues({}, newMeasures[measureIndex]);
  const shouldUpdate = updateFn(measure);
  if (shouldUpdate === false) return score;
  newMeasures[measureIndex] = measure;
  const newStaves = [...score.staves];
  newStaves[staffIndex] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
  return __spreadProps(__spreadValues({}, score), { staves: newStaves });
};
var updateEvent = (score, staffIndex, measureIndex, eventIdOrIndex, updateFn) => {
  return updateMeasure(score, staffIndex, measureIndex, (measure) => {
    const events = [...measure.events];
    let eventIndex = -1;
    if (typeof eventIdOrIndex === "number" && eventIdOrIndex < events.length && events[eventIdOrIndex]) {
      eventIndex = eventIdOrIndex;
    } else {
      eventIndex = events.findIndex((e) => e.id === eventIdOrIndex);
    }
    if (eventIndex === -1) return false;
    const event = __spreadValues({}, events[eventIndex]);
    const result = updateFn(event);
    if (result === false) return false;
    events[eventIndex] = event;
    measure.events = events;
    return true;
  });
};
var updateNote = (score, staffIndex, measureIndex, eventId, noteId, updateFn) => {
  return updateEvent(score, staffIndex, measureIndex, eventId, (event) => {
    const noteIndex = event.notes.findIndex((n) => n.id === noteId);
    if (noteIndex === -1) return false;
    const newNotes = [...event.notes];
    const note = __spreadValues({}, newNotes[noteIndex]);
    const result = updateFn(note);
    if (result === false) return false;
    newNotes[noteIndex] = note;
    event.notes = newNotes;
    return true;
  });
};

// src/commands/AddEventCommand.ts
var AddEventCommand = class {
  /**
   * @param measureIndex - Index of the target measure
   * @param isRest - Whether this event is a rest
   * @param note - Note payload (null for rests)
   * @param duration - Duration of the event (whole, half, quarter, etc.)
   * @param isDotted - Whether the event is dotted
   * @param index - Optional insertion index within measure events
   * @param eventId - Optional custom event ID (defaults to timestamp)
   * @param staffIndex - Staff index (default 0)
   */
  constructor(measureIndex, isRest, note, duration, isDotted, index, eventId, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.isRest = isRest;
    this.note = note;
    this.duration = duration;
    this.isDotted = isDotted;
    this.index = index;
    this.eventId = eventId;
    this.staffIndex = staffIndex;
    this.type = "ADD_EVENT";
  }
  execute(score) {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
      const newEvents = [...measure.events];
      const eventId = this.eventId || Date.now().toString();
      let newEvent;
      if (this.isRest) {
        const restNoteId = `${eventId}-rest`;
        newEvent = {
          id: eventId,
          duration: this.duration,
          dotted: this.isDotted,
          isRest: true,
          notes: [{
            id: restNoteId,
            pitch: null,
            isRest: true
          }]
        };
      } else {
        newEvent = {
          id: eventId,
          duration: this.duration,
          dotted: this.isDotted,
          isRest: false,
          notes: this.note ? [this.note] : []
        };
      }
      if (this.index !== void 0 && this.index >= 0 && this.index <= newEvents.length) {
        newEvents.splice(this.index, 0, newEvent);
      } else {
        newEvents.push(newEvent);
      }
      measure.events = newEvents;
      return true;
    });
  }
  undo(score) {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
      const newEvents = [...measure.events];
      if (this.index !== void 0 && this.index >= 0 && this.index < newEvents.length) {
        newEvents.splice(this.index, 1);
      } else {
        newEvents.pop();
      }
      measure.events = newEvents;
      return true;
    });
  }
};

// src/commands/AddNoteToEventCommand.ts
var AddNoteToEventCommand = class {
  constructor(measureIndex, eventId, note, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.eventId = eventId;
    this.note = note;
    this.staffIndex = staffIndex;
    this.type = "ADD_NOTE_TO_EVENT";
  }
  execute(score) {
    return updateEvent(score, this.staffIndex, this.measureIndex, this.eventId, (event) => {
      if (event.notes.some((n) => n.pitch === this.note.pitch)) return false;
      event.notes = [...event.notes, this.note];
      return true;
    });
  }
  undo(score) {
    return updateEvent(score, this.staffIndex, this.measureIndex, this.eventId, (event) => {
      const initialLength = event.notes.length;
      event.notes = event.notes.filter((n) => n.id !== this.note.id);
      return event.notes.length !== initialLength;
    });
  }
};

// src/commands/DeleteNoteCommand.ts
var DeleteNoteCommand = class {
  constructor(measureIndex, eventId, noteId, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.eventId = eventId;
    this.noteId = noteId;
    this.staffIndex = staffIndex;
    this.type = "DELETE_NOTE";
    this.deletedEventIndex = -1;
    this.deletedEvent = null;
    this.deletedNote = null;
    this.wasLastNoteInEvent = false;
  }
  execute(score) {
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
      const eventIndex = measure.events.findIndex((e) => e.id === this.eventId);
      if (eventIndex === -1) return false;
      const event = __spreadValues({}, measure.events[eventIndex]);
      this.deletedEventIndex = eventIndex;
      const noteIndex = event.notes.findIndex((n) => n.id === this.noteId);
      if (noteIndex === -1) return false;
      this.deletedNote = event.notes[noteIndex];
      if (event.notes.length === 1) {
        this.wasLastNoteInEvent = true;
        this.deletedEvent = event;
        const newEvents = [...measure.events];
        newEvents.splice(eventIndex, 1);
        measure.events = newEvents;
      } else {
        this.wasLastNoteInEvent = false;
        const newNotes = [...event.notes];
        newNotes.splice(noteIndex, 1);
        event.notes = newNotes;
        const newEvents = [...measure.events];
        newEvents[eventIndex] = event;
        measure.events = newEvents;
      }
      return true;
    });
  }
  undo(score) {
    if (this.deletedEventIndex === -1 || !this.deletedNote) return score;
    return updateMeasure(score, this.staffIndex, this.measureIndex, (measure) => {
      const newEvents = [...measure.events];
      if (this.wasLastNoteInEvent && this.deletedEvent) {
        newEvents.splice(this.deletedEventIndex, 0, this.deletedEvent);
      } else {
        let targetIndex = this.deletedEventIndex;
        let event = newEvents[targetIndex];
        if (!event || event.id !== this.eventId) {
          targetIndex = newEvents.findIndex((e) => e.id === this.eventId);
          if (targetIndex === -1) return false;
          event = newEvents[targetIndex];
        }
        const newEvent = __spreadValues({}, event);
        newEvent.notes = [...newEvent.notes, this.deletedNote];
        newEvents[targetIndex] = newEvent;
      }
      measure.events = newEvents;
      return true;
    });
  }
};

// src/commands/DeleteEventCommand.ts
var DeleteEventCommand = class {
  constructor(measureIndex, eventId, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.eventId = eventId;
    this.staffIndex = staffIndex;
    this.type = "DELETE_EVENT";
    this.deletedEventIndex = -1;
    this.deletedEvent = null;
  }
  execute(score) {
    const activeStaff = getActiveStaff(score, this.staffIndex);
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.measureIndex]) return score;
    const measure = __spreadValues({}, newMeasures[this.measureIndex]);
    const eventIndex = measure.events.findIndex((e) => e.id === this.eventId);
    if (eventIndex === -1) return score;
    this.deletedEvent = measure.events[eventIndex];
    this.deletedEventIndex = eventIndex;
    const newEvents = [...measure.events];
    newEvents.splice(eventIndex, 1);
    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
  undo(score) {
    if (this.deletedEventIndex === -1 || !this.deletedEvent) return score;
    const activeStaff = getActiveStaff(score, this.staffIndex);
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.measureIndex]) return score;
    const measure = __spreadValues({}, newMeasures[this.measureIndex]);
    const newEvents = [...measure.events];
    newEvents.splice(this.deletedEventIndex, 0, this.deletedEvent);
    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
};

// src/commands/ChangePitchCommand.ts
var ChangePitchCommand = class {
  constructor(measureIndex, eventId, noteId, newPitch, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.eventId = eventId;
    this.noteId = noteId;
    this.newPitch = newPitch;
    this.staffIndex = staffIndex;
    this.type = "CHANGE_PITCH";
    this.oldPitch = null;
  }
  execute(score) {
    return updateNote(score, this.staffIndex, this.measureIndex, this.eventId, this.noteId, (note) => {
      this.oldPitch = note.pitch;
      note.pitch = this.newPitch;
      return true;
    });
  }
  undo(score) {
    if (this.oldPitch === null) return score;
    return updateNote(score, this.staffIndex, this.measureIndex, this.eventId, this.noteId, (note) => {
      note.pitch = this.oldPitch;
      return true;
    });
  }
};

// src/hooks/useNoteActions.ts
var useNoteActions = ({
  scoreRef,
  selection,
  setSelection,
  select,
  setPreviewNote,
  activeDuration,
  isDotted,
  activeAccidental,
  activeTie,
  currentQuantsPerMeasure,
  dispatch,
  inputMode
}) => {
  const handleMeasureHover = React3.useCallback((measureIndex, hit, rawPitch, staffIndex = 0) => {
    if (measureIndex === null || !hit) {
      setPreviewNote((prev) => {
        if (!prev) return null;
        if (prev.staffIndex === staffIndex) return null;
        return prev;
      });
      return;
    }
    if (!rawPitch) {
      return;
    }
    const currentScore = scoreRef.current;
    const currentStaff = getActiveStaff(currentScore, staffIndex);
    const measure = currentStaff.measures[measureIndex];
    let finalPitch = rawPitch;
    const keySig = currentStaff.keySignature || currentScore.keySignature || "C";
    if (activeAccidental) {
      const note = tonal.Note.get(rawPitch);
      if (!note.empty && note.letter && note.oct !== void 0) {
        if (activeAccidental === "sharp") finalPitch = `${note.letter}#${note.oct}`;
        else if (activeAccidental === "flat") finalPitch = `${note.letter}b${note.oct}`;
        else if (activeAccidental === "natural") finalPitch = `${note.letter}${note.oct}`;
      }
    } else {
      finalPitch = applyKeySignature(rawPitch, keySig);
    }
    let targetMeasureIndex = measureIndex;
    let targetIndex = hit.index;
    let targetMode = hit.type === "EVENT" ? "CHORD" : hit.type === "INSERT" ? "INSERT" : "APPEND";
    if (targetMode === "INSERT" && targetIndex === measure.events.length) {
      targetMode = "APPEND";
    }
    if (targetMode === "APPEND") {
      if (!canAddEventToMeasure(measure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
        if (measureIndex === currentStaff.measures.length - 1) {
          targetMeasureIndex = measureIndex + 1;
          targetIndex = 0;
        } else {
          setPreviewNote(null);
          return;
        }
      } else {
        if (measure.events.length > 0) {
          targetMode = "INSERT";
          targetIndex = measure.events.length;
        }
      }
    } else if (targetMode === "INSERT") {
      if (!canAddEventToMeasure(measure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
        setPreviewNote(null);
        return;
      }
    }
    const newPreview = {
      measureIndex: targetMeasureIndex,
      staffIndex,
      quant: 0,
      visualQuant: 0,
      pitch: finalPitch,
      duration: activeDuration,
      dotted: isDotted,
      mode: targetMode,
      index: targetIndex,
      eventId: hit.type === "EVENT" ? hit.eventId : void 0,
      isRest: inputMode === "REST"
    };
    setPreviewNote((prev) => {
      if (!prev) return newPreview;
      const pitchMatch = newPreview.isRest ? true : prev.pitch === newPreview.pitch;
      if (prev.measureIndex === newPreview.measureIndex && prev.staffIndex === newPreview.staffIndex && pitchMatch && prev.mode === newPreview.mode && prev.index === newPreview.index && prev.isRest === newPreview.isRest && prev.duration === newPreview.duration && prev.dotted === newPreview.dotted) {
        return prev;
      }
      return newPreview;
    });
  }, [activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, setPreviewNote, activeAccidental, inputMode]);
  const addNoteToMeasure = React3.useCallback((measureIndex, newNote, shouldAutoAdvance = false, placementOverride = null) => {
    var _a;
    const currentScore = scoreRef.current;
    const currentStaffIndex = newNote.staffIndex !== void 0 ? newNote.staffIndex : selection.staffIndex;
    const currentStaffData = getActiveStaff(currentScore, currentStaffIndex);
    const newMeasures = [...currentStaffData.measures];
    const targetMeasure = __spreadValues({}, newMeasures[measureIndex]);
    if (!targetMeasure.events) targetMeasure.events = [];
    let insertIndex = targetMeasure.events.length;
    let mode = "APPEND";
    if (placementOverride) {
      mode = placementOverride.mode;
      insertIndex = placementOverride.index;
    } else if (newNote.mode) {
      mode = newNote.mode;
      insertIndex = newNote.index;
    }
    if (mode !== "CHORD" && !canAddEventToMeasure(targetMeasure.events, activeDuration, isDotted, currentQuantsPerMeasure)) {
      if (shouldAutoAdvance && measureIndex === currentStaffData.measures.length - 1) {
        dispatch(new AddMeasureCommand());
        addNoteToMeasure(measureIndex + 1, __spreadProps(__spreadValues({}, newNote), { staffIndex: currentStaffIndex }), false, { mode: "APPEND", index: 0 });
        return;
      } else {
        return;
      }
    }
    const targetEventId = (placementOverride == null ? void 0 : placementOverride.eventId) || newNote.eventId || mode === "CHORD" && ((_a = targetMeasure.events[insertIndex]) == null ? void 0 : _a.id);
    if (mode === "CHORD" && targetEventId) {
      if (inputMode === "REST") {
        return;
      }
      const noteToAdd = {
        id: Date.now() + 1,
        pitch: newNote.pitch,
        accidental: activeAccidental,
        tied: activeTie
      };
      dispatch(new AddNoteToEventCommand(measureIndex, targetEventId, noteToAdd, currentStaffIndex));
      select(measureIndex, targetEventId, noteToAdd.id, currentStaffIndex);
      setPreviewNote(null);
    } else {
      const eventId = Date.now().toString();
      const isRest = inputMode === "REST";
      const notePayload = isRest ? null : {
        id: Date.now() + 1,
        pitch: newNote.pitch,
        accidental: activeAccidental,
        tied: activeTie
      };
      const noteId = isRest ? `${eventId}-rest` : notePayload.id;
      dispatch(new AddEventCommand(
        measureIndex,
        isRest,
        notePayload,
        activeDuration,
        isDotted,
        mode === "INSERT" ? insertIndex : void 0,
        eventId,
        currentStaffIndex
      ));
      select(measureIndex, eventId, noteId, currentStaffIndex, { onlyHistory: true });
      setPreviewNote(null);
    }
    if (inputMode === "NOTE") {
      playNote(newNote.pitch);
    }
    if (shouldAutoAdvance && mode === "APPEND") {
      const simulatedEvents = [...targetMeasure.events];
      simulatedEvents.push({
        id: "sim-event",
        duration: activeDuration,
        dotted: isDotted,
        notes: [{ id: 9999, pitch: newNote.pitch, tied: false }]
      });
      const simulatedMeasure = __spreadProps(__spreadValues({}, targetMeasure), { events: simulatedEvents });
      const nextPreview = getAppendPreviewNote(
        simulatedMeasure,
        measureIndex,
        currentStaffIndex,
        activeDuration,
        isDotted,
        newNote.pitch,
        inputMode === "REST"
      );
      if (nextPreview.quant >= currentQuantsPerMeasure) {
        setPreviewNote({
          measureIndex: measureIndex + 1,
          staffIndex: currentStaffIndex,
          quant: 0,
          visualQuant: 0,
          pitch: newNote.pitch,
          duration: activeDuration,
          dotted: isDotted,
          mode: "APPEND",
          index: 0
        });
      } else {
        setPreviewNote(nextPreview);
      }
      return;
    }
    setPreviewNote(null);
  }, [activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, setPreviewNote, activeAccidental, activeTie, dispatch, selection, select, inputMode]);
  const deleteSelected = React3.useCallback(() => {
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      const notesToDelete = [...selection.selectedNotes];
      notesToDelete.forEach((note) => {
        if (note.noteId) {
          dispatch(new DeleteNoteCommand(note.measureIndex, note.eventId, note.noteId, note.staffIndex));
        } else {
          dispatch(new DeleteEventCommand(note.measureIndex, note.eventId, note.staffIndex));
        }
      });
      select(null, null, null, selection.staffIndex);
      return;
    }
    if (selection.measureIndex === null || !selection.eventId) return;
    if (selection.noteId) {
      dispatch(new DeleteNoteCommand(selection.measureIndex, selection.eventId, selection.noteId, selection.staffIndex));
    } else {
      dispatch(new DeleteEventCommand(selection.measureIndex, selection.eventId, selection.staffIndex));
    }
    select(null, null, null, selection.staffIndex);
  }, [selection, dispatch, select]);
  const addChordToMeasure = React3.useCallback((measureIndex, notes, duration, dotted) => {
    if (!notes || notes.length === 0) return;
    const eventId = Date.now().toString();
    const firstNote = notes[0];
    const noteToAdd = {
      id: Date.now() + 1,
      pitch: firstNote.pitch,
      accidental: firstNote.accidental,
      tied: false
    };
    dispatch(new AddEventCommand(
      measureIndex,
      false,
      // isRest = false for chord notes
      noteToAdd,
      duration,
      dotted,
      void 0,
      eventId,
      selection.staffIndex
    ));
    for (let i = 1; i < notes.length; i++) {
      const note = notes[i];
      const chordNote = {
        id: Date.now() + 1 + i,
        pitch: note.pitch,
        accidental: note.accidental,
        tied: false
      };
      dispatch(new AddNoteToEventCommand(measureIndex, eventId, chordNote, selection.staffIndex));
    }
    select(measureIndex, eventId, noteToAdd.id, selection.staffIndex);
    setPreviewNote(null);
  }, [dispatch, select, setPreviewNote, selection.staffIndex]);
  const updateNotePitch = React3.useCallback((measureIndex, eventId, noteId, newPitch) => {
    dispatch(new ChangePitchCommand(measureIndex, eventId, noteId, newPitch, selection.staffIndex));
  }, [dispatch, selection.staffIndex]);
  return {
    handleMeasureHover,
    addNoteToMeasure,
    addChordToMeasure,
    deleteSelected,
    updateNotePitch
  };
};

// src/commands/UpdateEventCommand.ts
var UpdateEventCommand = class {
  constructor(measureIndex, eventId, updates, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.eventId = eventId;
    this.updates = updates;
    this.staffIndex = staffIndex;
    this.type = "UPDATE_EVENT";
    this.previousEvent = null;
  }
  execute(score) {
    const activeStaff = score.staves[this.staffIndex];
    if (!activeStaff) return score;
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.measureIndex]) return score;
    const measure = __spreadValues({}, newMeasures[this.measureIndex]);
    const eventIndex = measure.events.findIndex((e) => e.id === this.eventId);
    if (eventIndex === -1) return score;
    const event = __spreadValues({}, measure.events[eventIndex]);
    this.previousEvent = event;
    const newEvent = __spreadValues(__spreadValues({}, event), this.updates);
    const newEvents = [...measure.events];
    newEvents[eventIndex] = newEvent;
    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
  undo(score) {
    if (!this.previousEvent) return score;
    const activeStaff = score.staves[this.staffIndex];
    if (!activeStaff) return score;
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.measureIndex]) return score;
    const measure = __spreadValues({}, newMeasures[this.measureIndex]);
    const eventIndex = measure.events.findIndex((e) => e.id === this.eventId);
    if (eventIndex === -1) return score;
    const newEvents = [...measure.events];
    newEvents[eventIndex] = this.previousEvent;
    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[this.staffIndex] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
};

// src/commands/UpdateNoteCommand.ts
var UpdateNoteCommand = class {
  constructor(measureIndex, eventId, noteId, updates, staffIndex = 0) {
    this.measureIndex = measureIndex;
    this.eventId = eventId;
    this.noteId = noteId;
    this.updates = updates;
    this.staffIndex = staffIndex;
    this.type = "UPDATE_NOTE";
    this.previousNote = null;
  }
  execute(score) {
    return updateNote(score, this.staffIndex, this.measureIndex, this.eventId, this.noteId, (note) => {
      this.previousNote = __spreadValues({}, note);
      Object.assign(note, this.updates);
      return true;
    });
  }
  undo(score) {
    if (!this.previousNote) return score;
    return updateNote(score, this.staffIndex, this.measureIndex, this.eventId, this.noteId, (note) => {
      Object.assign(note, this.previousNote);
      return true;
    });
  }
};
var getNoteTargets = (selection) => {
  if (selection.selectedNotes && selection.selectedNotes.length > 0) {
    return selection.selectedNotes.filter((n) => n.noteId).map((n) => ({
      measureIndex: n.measureIndex,
      eventId: n.eventId,
      noteId: n.noteId,
      staffIndex: n.staffIndex
    }));
  } else if (selection.measureIndex !== null && selection.eventId && selection.noteId) {
    return [{
      measureIndex: selection.measureIndex,
      eventId: selection.eventId,
      noteId: selection.noteId,
      staffIndex: selection.staffIndex !== void 0 ? selection.staffIndex : 0
    }];
  }
  return [];
};
var getEventTargets = (selection) => {
  const targets = [];
  if (selection.selectedNotes && selection.selectedNotes.length > 0) {
    selection.selectedNotes.forEach((n) => {
      const exists = targets.find((t) => t.measureIndex === n.measureIndex && t.eventId === n.eventId && t.staffIndex === n.staffIndex);
      if (!exists) {
        targets.push({ measureIndex: n.measureIndex, eventId: n.eventId, staffIndex: n.staffIndex });
      }
    });
  } else if (selection.measureIndex !== null && selection.eventId) {
    targets.push({
      measureIndex: selection.measureIndex,
      eventId: selection.eventId,
      staffIndex: selection.staffIndex !== void 0 ? selection.staffIndex : 0
    });
  }
  return targets;
};
var calculateNewPitch = (currentPitch, targetType) => {
  const note = tonal.Note.get(currentPitch);
  if (note.empty) return null;
  const letter = note.letter;
  const oct = note.oct;
  if (!letter || oct === void 0) return null;
  if (targetType === "sharp") {
    return `${letter}#${oct}`;
  } else if (targetType === "flat") {
    return `${letter}b${oct}`;
  } else if (targetType === "natural") {
    return `${letter}${oct}`;
  }
  return currentPitch;
};
var useModifiers = ({
  scoreRef,
  selection,
  currentQuantsPerMeasure,
  tools,
  dispatch
}) => {
  const handleDurationChange = React3.useCallback((newDuration, applyToSelection = false) => {
    tools.handleDurationChange(newDuration);
    if (applyToSelection) {
      const targets = getEventTargets(selection);
      targets.forEach((target) => {
        const staff = scoreRef.current.staves[target.staffIndex] || getActiveStaff(scoreRef.current);
        const measure = staff.measures[target.measureIndex];
        if (measure && canModifyEventDuration(measure.events, target.eventId, newDuration, currentQuantsPerMeasure)) {
          dispatch(new UpdateEventCommand(target.measureIndex, target.eventId, { duration: newDuration }, target.staffIndex));
        }
      });
    }
  }, [selection, tools, dispatch, scoreRef, currentQuantsPerMeasure]);
  const handleDotToggle = React3.useCallback(() => {
    const targets = getEventTargets(selection);
    if (targets.length === 0) {
      tools.handleDotToggle();
      return;
    }
    const score = scoreRef.current;
    const eventObjects = targets.map((t) => {
      var _a;
      const staff = score.staves[t.staffIndex] || getActiveStaff(score);
      return (_a = staff.measures[t.measureIndex]) == null ? void 0 : _a.events.find((e) => e.id === t.eventId);
    }).filter((e) => !!e);
    if (eventObjects.length === 0) return;
    const hasAnyDotted = eventObjects.some((e) => e.dotted);
    const targetState = !hasAnyDotted;
    targets.forEach((target) => {
      const staff = score.staves[target.staffIndex] || getActiveStaff(score);
      const measure = staff.measures[target.measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === target.eventId);
      if (event) {
        if (!!event.dotted === targetState) return;
        if (canToggleEventDot(measure.events, target.eventId, currentQuantsPerMeasure)) {
          dispatch(new UpdateEventCommand(target.measureIndex, target.eventId, { dotted: targetState }, target.staffIndex));
        }
      }
    });
    if (tools.isDotted !== targetState) tools.handleDotToggle();
  }, [selection, tools, dispatch, scoreRef, currentQuantsPerMeasure]);
  const handleAccidentalToggle = React3.useCallback((type) => {
    if (!type) return;
    const targets = getNoteTargets(selection);
    if (targets.length === 0) {
      tools.handleAccidentalToggle(type);
      return;
    }
    const score = scoreRef.current;
    const noteObjects = targets.map((t) => {
      var _a;
      const staff = score.staves[t.staffIndex] || getActiveStaff(score);
      const event = (_a = staff.measures[t.measureIndex]) == null ? void 0 : _a.events.find((e) => e.id === t.eventId);
      return event == null ? void 0 : event.notes.find((n) => n.id === t.noteId);
    }).filter((n) => !!n && n.pitch !== null);
    if (noteObjects.length === 0) return;
    const allMatch = noteObjects.every((n) => {
      const note = tonal.Note.get(n.pitch);
      if (type === "sharp") return note.acc === "#";
      if (type === "flat") return note.acc === "b";
      if (type === "natural") return !note.acc;
      return false;
    });
    let targetType = type;
    if (allMatch && type !== "natural") {
      targetType = "natural";
    }
    targets.forEach((target) => {
      const staff = score.staves[target.staffIndex] || getActiveStaff(score);
      const measure = staff.measures[target.measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === target.eventId);
      const note = event == null ? void 0 : event.notes.find((n) => n.id === target.noteId);
      if (note && note.pitch !== null) {
        const newPitch = calculateNewPitch(note.pitch, targetType);
        if (newPitch && newPitch !== note.pitch) {
          dispatch(new UpdateNoteCommand(target.measureIndex, target.eventId, target.noteId, { pitch: newPitch }, target.staffIndex));
        }
      }
    });
    if (selection.measureIndex !== null && selection.eventId && selection.noteId) {
      const staffIdx = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
      const staff = score.staves[staffIdx] || getActiveStaff(score);
      const measure = staff.measures[selection.measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === selection.eventId);
      const note = event == null ? void 0 : event.notes.find((n) => n.id === selection.noteId);
      if (note && note.pitch !== null) {
        const newPitch = calculateNewPitch(note.pitch, targetType);
        if (newPitch) playNote(newPitch);
      }
    }
    tools.handleAccidentalToggle(null);
  }, [selection, tools, dispatch, scoreRef]);
  const handleTieToggle = React3.useCallback(() => {
    const targets = getNoteTargets(selection);
    if (targets.length === 0) {
      tools.handleTieToggle();
      return;
    }
    const score = scoreRef.current;
    const noteObjects = targets.map((t) => {
      const staff = score.staves[t.staffIndex] || getActiveStaff(score);
      const measure = staff.measures[t.measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === t.eventId);
      return event == null ? void 0 : event.notes.find((n) => n.id === t.noteId);
    }).filter((n) => !!n);
    if (noteObjects.length === 0) return;
    const hasAnyTied = noteObjects.some((n) => n.tied);
    const targetState = !hasAnyTied;
    targets.forEach((target) => {
      dispatch(new UpdateNoteCommand(target.measureIndex, target.eventId, target.noteId, { tied: targetState }, target.staffIndex));
    });
    if (tools.activeTie !== targetState) tools.handleTieToggle();
  }, [selection, tools, dispatch, scoreRef]);
  const checkDurationValidity = React3.useCallback((targetDuration) => {
    if (selection.measureIndex === null || !selection.eventId) return true;
    const staffIdx = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
    const staff = scoreRef.current.staves[staffIdx];
    if (!staff) return true;
    const measure = staff.measures[selection.measureIndex];
    if (!measure) return true;
    return canModifyEventDuration(measure.events, selection.eventId, targetDuration, currentQuantsPerMeasure);
  }, [selection, currentQuantsPerMeasure, scoreRef]);
  const checkDotValidity = React3.useCallback(() => {
    if (selection.measureIndex === null || !selection.eventId) return true;
    const staffIdx = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
    const staff = scoreRef.current.staves[staffIdx];
    if (!staff) return true;
    const measure = staff.measures[selection.measureIndex];
    if (!measure) return true;
    return canToggleEventDot(measure.events, selection.eventId, currentQuantsPerMeasure);
  }, [selection, currentQuantsPerMeasure, scoreRef]);
  return {
    handleDurationChange,
    handleDotToggle,
    handleAccidentalToggle,
    handleTieToggle,
    checkDurationValidity,
    checkDotValidity
  };
};

// src/commands/TransposeSelectionCommand.ts
init_MusicService();
var TransposeSelectionCommand = class _TransposeSelectionCommand {
  constructor(selection, semitones, keySignature = "C") {
    this.selection = selection;
    this.semitones = semitones;
    this.keySignature = keySignature;
    this.type = "TRANSPOSE_SELECTION";
  }
  execute(score) {
    var _a;
    if (this.selection.measureIndex === null) return score;
    const staffIndex = (_a = this.selection.staffIndex) != null ? _a : 0;
    const activeStaff = getActiveStaff(score, staffIndex);
    const keySig = activeStaff.keySignature || this.keySignature || "C";
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.selection.measureIndex]) return score;
    const measure = __spreadValues({}, newMeasures[this.selection.measureIndex]);
    let steps = this.semitones;
    if (Math.abs(steps) === 12) {
      steps = steps > 0 ? 7 : -7;
    }
    const idsMatch = (a, b) => String(a) === String(b);
    const transposeFn = (pitch) => movePitchVisual(pitch, steps, keySig);
    if (this.selection.selectedNotes && this.selection.selectedNotes.length > 0) {
      const newStaves2 = [...score.staves];
      const staffMap = /* @__PURE__ */ new Map();
      this.selection.selectedNotes.forEach((sn) => {
        const sIndex = sn.staffIndex;
        let currentStaff = staffMap.get(sIndex);
        if (!currentStaff) {
          currentStaff = __spreadProps(__spreadValues({}, newStaves2[sIndex]), { measures: [...newStaves2[sIndex].measures] });
          staffMap.set(sIndex, currentStaff);
          newStaves2[sIndex] = currentStaff;
        }
        if (!currentStaff.measures[sn.measureIndex]) return;
      });
      const notesByMeasure = /* @__PURE__ */ new Map();
      this.selection.selectedNotes.forEach((sn) => {
        const key = `${sn.staffIndex}-${sn.measureIndex}`;
        if (!notesByMeasure.has(key)) notesByMeasure.set(key, []);
        notesByMeasure.get(key).push(sn);
      });
      notesByMeasure.forEach((notesInMeasure, key) => {
        const [sIdxStr, mIdxStr] = key.split("-");
        const sIdx = parseInt(sIdxStr, 10);
        const mIdx = parseInt(mIdxStr, 10);
        if (!staffMap.has(sIdx)) {
          staffMap.set(sIdx, __spreadProps(__spreadValues({}, newStaves2[sIdx]), {
            measures: [...newStaves2[sIdx].measures]
          }));
          newStaves2[sIdx] = staffMap.get(sIdx);
        }
        const workingStaff = staffMap.get(sIdx);
        const originalMeasure = workingStaff.measures[mIdx];
        if (!originalMeasure) return;
        const newMeasure = __spreadProps(__spreadValues({}, originalMeasure), { events: [...originalMeasure.events] });
        workingStaff.measures[mIdx] = newMeasure;
        const notesByEvent = /* @__PURE__ */ new Map();
        notesInMeasure.forEach((n) => {
          const eKey = String(n.eventId);
          if (!notesByEvent.has(eKey)) notesByEvent.set(eKey, []);
          notesByEvent.get(eKey).push(n);
        });
        notesByEvent.forEach((notesInEvent, eIdStr) => {
          const eventIndex = newMeasure.events.findIndex((e) => String(e.id) === eIdStr);
          if (eventIndex === -1) return;
          const newEvent = __spreadProps(__spreadValues({}, newMeasure.events[eventIndex]), { notes: [...newMeasure.events[eventIndex].notes] });
          newMeasure.events[eventIndex] = newEvent;
          notesInEvent.forEach((nTarget) => {
            const noteIndex = newEvent.notes.findIndex((note) => idsMatch(note.id, nTarget.noteId));
            if (noteIndex !== -1) {
              const currentPitch = newEvent.notes[noteIndex].pitch;
              if (currentPitch !== null) {
                newEvent.notes[noteIndex] = __spreadProps(__spreadValues({}, newEvent.notes[noteIndex]), {
                  pitch: transposeFn(currentPitch)
                });
              }
            }
          });
        });
      });
      return __spreadProps(__spreadValues({}, score), { staves: newStaves2 });
    }
    if (this.selection.eventId && this.selection.noteId) {
      const eventIndex = measure.events.findIndex((e) => idsMatch(e.id, this.selection.eventId));
      if (eventIndex === -1) return score;
      const event = __spreadValues({}, measure.events[eventIndex]);
      const noteIndex = event.notes.findIndex((n) => idsMatch(n.id, this.selection.noteId));
      if (noteIndex === -1) return score;
      const note = __spreadValues({}, event.notes[noteIndex]);
      if (note.pitch !== null) {
        note.pitch = transposeFn(note.pitch);
      }
      const newNotes = [...event.notes];
      newNotes[noteIndex] = note;
      event.notes = newNotes;
      const newEvents = [...measure.events];
      newEvents[eventIndex] = event;
      measure.events = newEvents;
    } else if (this.selection.eventId) {
      const eventIndex = measure.events.findIndex((e) => idsMatch(e.id, this.selection.eventId));
      if (eventIndex === -1) return score;
      const event = __spreadValues({}, measure.events[eventIndex]);
      const newNotes = event.notes.map((n) => __spreadProps(__spreadValues({}, n), {
        // Skip rest notes (null pitch)
        pitch: n.pitch !== null ? transposeFn(n.pitch) : null
      }));
      event.notes = newNotes;
      const newEvents = [...measure.events];
      newEvents[eventIndex] = event;
      measure.events = newEvents;
    } else {
      const newEvents = measure.events.map((e) => __spreadProps(__spreadValues({}, e), {
        notes: e.notes.map((n) => __spreadProps(__spreadValues({}, n), {
          // Skip rest notes (null pitch)
          pitch: n.pitch !== null ? transposeFn(n.pitch) : null
        }))
      }));
      measure.events = newEvents;
    }
    newMeasures[this.selection.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[staffIndex] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
  undo(score) {
    const undoCommand = new _TransposeSelectionCommand(this.selection, -this.semitones, this.keySignature);
    return undoCommand.execute(score);
  }
};

// src/hooks/useNavigation.ts
var useNavigation = ({
  scoreRef,
  selection,
  lastSelection,
  setSelection,
  select,
  previewNote,
  setPreviewNote,
  activeDuration,
  isDotted,
  currentQuantsPerMeasure,
  dispatch,
  inputMode
}) => {
  const playAudioFeedback = React3.useCallback((notes) => {
    notes.forEach((n) => playNote(n.pitch));
  }, []);
  const handleNoteSelection = React3.useCallback((measureIndex, eventId, noteId, staffIndex = 0, isMulti = false, selectAllInEvent = false, isShift = false) => {
    select(measureIndex, eventId, noteId, staffIndex, { isMulti, isShift, selectAllInEvent });
  }, [select]);
  const moveSelection = React3.useCallback((direction, isShift = false) => {
    let activeSel = selection;
    if ((!selection.eventId || selection.measureIndex === null) && lastSelection && lastSelection.eventId) {
      activeSel = lastSelection;
    }
    const activeStaff = getActiveStaff(scoreRef.current, activeSel.staffIndex || 0);
    const navResult = calculateNextSelection(
      activeStaff.measures,
      activeSel,
      direction,
      previewNote,
      activeDuration,
      isDotted,
      currentQuantsPerMeasure,
      activeStaff.clef,
      activeSel.staffIndex || 0,
      inputMode
    );
    if (!navResult) return;
    if (navResult.selection) {
      let targetSelection = navResult.selection;
      if (targetSelection.eventId && !targetSelection.noteId && targetSelection.measureIndex !== null) {
        const m = activeStaff.measures[targetSelection.measureIndex];
        const e = m == null ? void 0 : m.events.find((ev) => ev.id === targetSelection.eventId);
        if (e && e.notes.length > 0) {
          select(
            targetSelection.measureIndex,
            targetSelection.eventId,
            targetSelection.noteId,
            // Might be null
            targetSelection.staffIndex,
            { isShift }
          );
        } else {
          select(
            targetSelection.measureIndex,
            targetSelection.eventId,
            targetSelection.noteId,
            targetSelection.staffIndex,
            { isShift }
          );
        }
      } else {
        select(
          targetSelection.measureIndex,
          targetSelection.eventId,
          targetSelection.noteId,
          targetSelection.staffIndex,
          { isShift }
        );
      }
    }
    if (navResult.previewNote !== void 0) {
      setPreviewNote(navResult.previewNote);
    }
    if (navResult.shouldCreateMeasure) {
      dispatch(new AddMeasureCommand());
    }
    if (navResult.audio) {
      playAudioFeedback(navResult.audio.notes);
    }
  }, [selection, previewNote, activeDuration, isDotted, currentQuantsPerMeasure, scoreRef, dispatch, select, setPreviewNote, playAudioFeedback, inputMode]);
  const transposeSelection = React3.useCallback((direction, isShift) => {
    let semitones = 0;
    if (direction === "up") semitones = isShift ? 12 : 1;
    if (direction === "down") semitones = isShift ? -12 : -1;
    if (semitones === 0) return;
    const activeStaff = getActiveStaff(scoreRef.current, selection.staffIndex || 0);
    if (selection.eventId === null && previewNote) {
      const previewResult = calculateTranspositionWithPreview(
        activeStaff.measures,
        selection,
        previewNote,
        direction,
        isShift,
        activeStaff.clef
      );
      if (previewResult == null ? void 0 : previewResult.previewNote) {
        setPreviewNote(previewResult.previewNote);
        if (previewResult.audio) playAudioFeedback(previewResult.audio.notes);
      }
      return;
    }
    const keySignature = activeStaff.keySignature || "C";
    dispatch(new TransposeSelectionCommand(selection, semitones, keySignature));
    if (selection.measureIndex !== null && selection.eventId) {
      const audioResult = calculateTranspositionWithPreview(
        activeStaff.measures,
        selection,
        previewNote,
        direction,
        isShift,
        activeStaff.clef
      );
      if (audioResult == null ? void 0 : audioResult.audio) playAudioFeedback(audioResult.audio.notes);
    }
  }, [selection, previewNote, scoreRef, dispatch, setPreviewNote, playAudioFeedback]);
  const switchStaff = React3.useCallback((direction) => {
    var _a, _b;
    const numStaves = ((_a = scoreRef.current.staves) == null ? void 0 : _a.length) || 1;
    if (numStaves <= 1) return;
    if (selection.eventId) {
      const crossResult = calculateCrossStaffSelection(scoreRef.current, selection, direction, activeDuration, isDotted);
      if (crossResult && crossResult.selection) {
        select(
          crossResult.selection.measureIndex,
          crossResult.selection.eventId,
          crossResult.selection.noteId,
          crossResult.selection.staffIndex
        );
        setPreviewNote(crossResult.previewNote || null);
        if (crossResult.selection.eventId && crossResult.selection.measureIndex !== null) {
          const staff = getActiveStaff(scoreRef.current, crossResult.selection.staffIndex);
          const event = (_b = staff.measures[crossResult.selection.measureIndex]) == null ? void 0 : _b.events.find((e) => e.id === crossResult.selection.eventId);
          if (event) playAudioFeedback(event.notes);
        }
        return;
      }
    }
    const currentIdx = selection.staffIndex || 0;
    let newIdx = currentIdx;
    if (direction === "up" && currentIdx > 0) newIdx--;
    else if (direction === "down" && currentIdx < numStaves - 1) newIdx++;
    if (newIdx !== currentIdx) {
      select(null, null, null, newIdx);
    }
  }, [selection, scoreRef, select, activeDuration, isDotted, playAudioFeedback, setPreviewNote]);
  return {
    handleNoteSelection,
    moveSelection,
    transposeSelection,
    switchStaff
  };
};

// src/commands/TupletCommands.ts
var ApplyTupletCommand = class {
  constructor(measureIndex, startEventIndex, groupSize, ratio) {
    this.measureIndex = measureIndex;
    this.startEventIndex = startEventIndex;
    this.groupSize = groupSize;
    this.ratio = ratio;
    this.type = "APPLY_TUPLET";
    this.previousStates = [];
  }
  execute(score) {
    const activeStaff = getActiveStaff(score);
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.measureIndex]) {
      return score;
    }
    const measure = __spreadValues({}, newMeasures[this.measureIndex]);
    const newEvents = [...measure.events];
    if (this.startEventIndex + this.groupSize > newEvents.length) {
      return score;
    }
    this.previousStates = [];
    const tupletId = `tuplet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    for (let i = 0; i < this.groupSize; i++) {
      const eventIndex = this.startEventIndex + i;
      if (eventIndex >= newEvents.length) {
        break;
      }
      const event = newEvents[eventIndex];
      this.previousStates.push({
        eventId: event.id,
        tuplet: event.tuplet ? __spreadValues({}, event.tuplet) : void 0
      });
      const baseDuration = newEvents[this.startEventIndex].duration;
      newEvents[eventIndex] = __spreadProps(__spreadValues({}, event), {
        tuplet: {
          ratio: this.ratio,
          groupSize: this.groupSize,
          position: i,
          baseDuration,
          id: tupletId
        }
      });
    }
    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[0] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
  undo(score) {
    const activeStaff = getActiveStaff(score);
    const newMeasures = [...activeStaff.measures];
    if (!newMeasures[this.measureIndex]) {
      return score;
    }
    const measure = __spreadValues({}, newMeasures[this.measureIndex]);
    const newEvents = [...measure.events];
    this.previousStates.forEach(({ eventId, tuplet }) => {
      const eventIndex = newEvents.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        const event = newEvents[eventIndex];
        newEvents[eventIndex] = __spreadProps(__spreadValues({}, event), {
          tuplet
        });
      }
    });
    measure.events = newEvents;
    newMeasures[this.measureIndex] = measure;
    const newStaves = [...score.staves];
    newStaves[0] = __spreadProps(__spreadValues({}, activeStaff), { measures: newMeasures });
    return __spreadProps(__spreadValues({}, score), { staves: newStaves });
  }
};

// src/commands/RemoveTupletCommand.ts
var RemoveTupletCommand = class {
  constructor(measureIndex, eventIndex) {
    this.measureIndex = measureIndex;
    this.eventIndex = eventIndex;
    this.type = "REMOVE_TUPLET";
    this.previousStates = [];
  }
  execute(score) {
    const staffIndex = 0;
    return updateMeasure(score, staffIndex, this.measureIndex, (measure) => {
      const events = measure.events;
      const targetEvent = events[this.eventIndex];
      if (!(targetEvent == null ? void 0 : targetEvent.tuplet)) return false;
      const { groupSize, position } = targetEvent.tuplet;
      const startIndex = this.eventIndex - position;
      this.previousStates = [];
      const newEvents = [...events];
      for (let i = 0; i < groupSize; i++) {
        const idx = startIndex + i;
        if (idx < 0 || idx >= newEvents.length) continue;
        const event = newEvents[idx];
        this.previousStates.push({
          eventId: event.id,
          tuplet: event.tuplet ? __spreadValues({}, event.tuplet) : void 0
        });
        newEvents[idx] = __spreadProps(__spreadValues({}, event), { tuplet: void 0 });
      }
      measure.events = newEvents;
      return true;
    });
  }
  undo(score) {
    const staffIndex = 0;
    return updateMeasure(score, staffIndex, this.measureIndex, (measure) => {
      const newEvents = [...measure.events];
      this.previousStates.forEach(({ eventId, tuplet }) => {
        const eventIndex = newEvents.findIndex((e) => e.id === eventId);
        if (eventIndex !== -1) {
          newEvents[eventIndex] = __spreadProps(__spreadValues({}, newEvents[eventIndex]), { tuplet });
        }
      });
      measure.events = newEvents;
      return true;
    });
  }
};

// src/hooks/useTupletActions.ts
var useTupletActions = (scoreRef, selection, dispatch) => {
  const applyTuplet = React3.useCallback((ratio, groupSize) => {
    if (!scoreRef.current) {
      console.warn("Score not initialized");
      return false;
    }
    if (selection.measureIndex === null || selection.eventId === null) {
      console.warn("No event selected for tuplet application");
      return false;
    }
    const currentScore = scoreRef.current;
    const activeStaff = getActiveStaff(currentScore);
    const measure = activeStaff.measures[selection.measureIndex];
    if (!measure) {
      console.warn("Selected measure not found");
      return false;
    }
    const eventIndex = measure.events.findIndex((e) => e.id === selection.eventId);
    if (eventIndex === -1) {
      console.warn("Selected event not found in measure");
      return false;
    }
    if (eventIndex + groupSize > measure.events.length) {
      console.warn(`Not enough events for tuplet (need ${groupSize}, have ${measure.events.length - eventIndex})`);
      return false;
    }
    dispatch(new ApplyTupletCommand(
      selection.measureIndex,
      eventIndex,
      groupSize,
      ratio
    ));
    return true;
  }, [selection, scoreRef, dispatch]);
  const removeTuplet = React3.useCallback(() => {
    if (!scoreRef.current) {
      console.warn("Score not initialized");
      return false;
    }
    if (selection.measureIndex === null || selection.eventId === null) {
      console.warn("No event selected for tuplet removal");
      return false;
    }
    const currentScore = scoreRef.current;
    const activeStaff = getActiveStaff(currentScore);
    const measure = activeStaff.measures[selection.measureIndex];
    if (!measure) {
      console.warn("Selected measure not found");
      return false;
    }
    const eventIndex = measure.events.findIndex((e) => e.id === selection.eventId);
    if (eventIndex === -1) {
      console.warn("Selected event not found in measure");
      return false;
    }
    const event = measure.events[eventIndex];
    if (!event.tuplet) {
      console.warn("Selected event is not part of a tuplet");
      return false;
    }
    dispatch(new RemoveTupletCommand(
      selection.measureIndex,
      eventIndex
    ));
    return true;
  }, [selection, scoreRef, dispatch]);
  const canApplyTuplet = React3.useCallback((groupSize) => {
    if (!scoreRef.current) return false;
    if (selection.measureIndex === null || selection.eventId === null) {
      return false;
    }
    const currentScore = scoreRef.current;
    const activeStaff = getActiveStaff(currentScore);
    const measure = activeStaff.measures[selection.measureIndex];
    if (!measure) return false;
    const eventIndex = measure.events.findIndex((e) => e.id === selection.eventId);
    if (eventIndex === -1) return false;
    return eventIndex + groupSize <= measure.events.length;
  }, [selection, scoreRef]);
  const getActiveTupletRatio = React3.useCallback(() => {
    var _a;
    if (!scoreRef.current) return null;
    if (selection.measureIndex === null || selection.eventId === null) {
      return null;
    }
    const currentScore = scoreRef.current;
    const activeStaff = getActiveStaff(currentScore);
    const measure = activeStaff.measures[selection.measureIndex];
    if (!measure) return null;
    const event = measure.events.find((e) => e.id === selection.eventId);
    return ((_a = event == null ? void 0 : event.tuplet) == null ? void 0 : _a.ratio) || null;
  }, [selection, scoreRef]);
  return {
    applyTuplet,
    removeTuplet,
    canApplyTuplet,
    getActiveTupletRatio
  };
};

// src/utils/selection.ts
var compareIds = (id1, id2) => {
  if (id1 == null && id2 == null) return true;
  if (id1 == null || id2 == null) return false;
  return String(id1) === String(id2);
};
var isNoteSelected = (selection, context) => {
  const { staffIndex, measureIndex, eventId, noteId } = context;
  if (selection.selectedNotes && selection.selectedNotes.length > 0) {
    return selection.selectedNotes.some(
      (sn) => compareIds(sn.noteId, noteId) && compareIds(sn.eventId, eventId) && sn.measureIndex === measureIndex && sn.staffIndex === staffIndex
    );
  }
  return compareIds(selection.eventId, eventId) && compareIds(selection.noteId, noteId) && selection.measureIndex === measureIndex && (selection.staffIndex === void 0 || selection.staffIndex === staffIndex);
};
var areAllNotesSelected = (selection, staffIndex, measureIndex, eventId, notes) => {
  if (!notes || notes.length === 0) return false;
  return notes.every((note) => isNoteSelected(selection, { staffIndex, measureIndex, eventId, noteId: note.id }));
};
var toggleNoteInSelection = (prevSelection, context, isMulti) => {
  var _a;
  const { staffIndex, measureIndex, eventId, noteId } = context;
  if (!eventId) {
    return __spreadProps(__spreadValues({}, createDefaultSelection()), { staffIndex });
  }
  if (!isMulti) {
    return {
      staffIndex,
      measureIndex,
      eventId,
      noteId,
      selectedNotes: [{ staffIndex, measureIndex, eventId, noteId }],
      anchor: null
      // Reset anchor on single click
    };
  }
  const newSelectedNotes = prevSelection.selectedNotes ? [...prevSelection.selectedNotes] : [];
  if (prevSelection.eventId && prevSelection.measureIndex != null) {
    const isPrevInList = newSelectedNotes.some(
      (n) => compareIds(n.noteId, prevSelection.noteId) && compareIds(n.eventId, prevSelection.eventId)
    );
    if (!isPrevInList) {
      newSelectedNotes.push({
        staffIndex: (_a = prevSelection.staffIndex) != null ? _a : 0,
        measureIndex: prevSelection.measureIndex,
        eventId: prevSelection.eventId,
        noteId: prevSelection.noteId
        // Can be null for rests
      });
    }
  }
  const existingIndex = newSelectedNotes.findIndex(
    (n) => compareIds(n.noteId, noteId) && compareIds(n.eventId, eventId)
  );
  if (existingIndex >= 0) {
    newSelectedNotes.splice(existingIndex, 1);
  } else {
    newSelectedNotes.push({ staffIndex, measureIndex, eventId, noteId });
  }
  if (newSelectedNotes.length === 0) {
    return __spreadProps(__spreadValues({}, createDefaultSelection()), { staffIndex });
  }
  let newFocus = { staffIndex, measureIndex, eventId, noteId };
  if (existingIndex >= 0) {
    newFocus = newSelectedNotes[newSelectedNotes.length - 1];
  }
  return {
    staffIndex: newFocus.staffIndex,
    measureIndex: newFocus.measureIndex,
    eventId: newFocus.eventId,
    noteId: newFocus.noteId,
    selectedNotes: newSelectedNotes,
    anchor: prevSelection.anchor
    // Preserve anchor for shift-select ranges
  };
};
var getLinearizedNotes = (score) => {
  const notes = [];
  score.staves.forEach((staff, staffInd) => {
    staff.measures.forEach((measure, measureInd) => {
      measure.events.forEach((event) => {
        if (event.notes && event.notes.length > 0) {
          event.notes.forEach((note) => {
            notes.push({
              staffIndex: staffInd,
              measureIndex: measureInd,
              eventId: event.id,
              noteId: note.id
            });
          });
        }
      });
    });
  });
  return notes;
};
var calculateNoteRange = (anchor, focus, linearNotes) => {
  const getIndex = (ctx) => linearNotes.findIndex(
    (n) => compareIds(n.noteId, ctx.noteId) && compareIds(n.eventId, ctx.eventId)
  );
  const anchorIndex = getIndex(anchor);
  const focusIndex = getIndex(focus);
  if (anchorIndex === -1 || focusIndex === -1) return [];
  const start2 = Math.min(anchorIndex, focusIndex);
  const end = Math.max(anchorIndex, focusIndex);
  const rawSlice = linearNotes.slice(start2, end + 1);
  const affectedEventIds = new Set(rawSlice.map((n) => n.eventId));
  return linearNotes.filter(
    (n) => affectedEventIds.has(n.eventId) && n.staffIndex === anchor.staffIndex
    // Generally prevent ranges spanning staves
  );
};
var isRestSelected = (selection, event, measureIndex, staffIndex) => {
  var _a, _b, _c, _d, _e;
  const restNoteId = (_c = (_b = (_a = event.notes) == null ? void 0 : _a[0]) == null ? void 0 : _b.id) != null ? _c : null;
  const isPrimary = selection.measureIndex === measureIndex && compareIds(selection.eventId, event.id) && selection.staffIndex === staffIndex;
  const isInMulti = (_e = (_d = selection.selectedNotes) == null ? void 0 : _d.some(
    (sn) => sn.measureIndex === measureIndex && compareIds(sn.eventId, event.id) && sn.staffIndex === staffIndex && compareIds(sn.noteId, restNoteId)
  )) != null ? _e : false;
  return isPrimary || isInMulti;
};
var isBeamGroupSelected = (selection, beam, events, measureIndex) => {
  const beamNoteIds = [];
  beam.ids.forEach((eventId) => {
    const ev = events.find((e) => compareIds(e.id, eventId));
    if (ev == null ? void 0 : ev.notes) {
      ev.notes.forEach((n) => beamNoteIds.push({ eventId: ev.id, noteId: n.id }));
    }
  });
  if (beamNoteIds.length === 0) return false;
  return beamNoteIds.every((bn) => {
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      return selection.selectedNotes.some(
        (sn) => sn.measureIndex === measureIndex && compareIds(sn.eventId, bn.eventId) && compareIds(sn.noteId, bn.noteId)
      );
    }
    return selection.measureIndex === measureIndex && compareIds(selection.eventId, bn.eventId) && compareIds(selection.noteId, bn.noteId);
  });
};

// src/hooks/useSelection.ts
var useSelection = ({ score }) => {
  const [selection, setSelection] = React3.useState(createDefaultSelection());
  const [lastSelection, setLastSelection] = React3.useState(null);
  const playAudioFeedback = React3.useCallback((notes) => {
    notes.filter((n) => n.pitch !== null).forEach((n) => playNote(n.pitch));
  }, []);
  const clearSelection = React3.useCallback(() => {
    setSelection((prev) => {
      setLastSelection(prev);
      return __spreadProps(__spreadValues({}, createDefaultSelection()), {
        staffIndex: prev.staffIndex
        // Maintain current staff focus
      });
    });
  }, []);
  const select = React3.useCallback((measureIndex, eventId, noteId, staffIndex = 0, options = {}) => {
    const { isMulti = false, isShift = false, selectAllInEvent = false, onlyHistory = false } = options;
    if (!eventId || measureIndex === null) {
      if (!onlyHistory) clearSelection();
      return;
    }
    const startStaffIndex = staffIndex !== void 0 ? staffIndex : selection.staffIndex || 0;
    if (isShift && !onlyHistory) {
      const anchor = selection.anchor || {
        staffIndex: selection.staffIndex || 0,
        measureIndex: selection.measureIndex,
        eventId: selection.eventId,
        noteId: selection.noteId
      };
      if (!anchor.eventId) ; else {
        const context = {
          staffIndex: startStaffIndex,
          measureIndex,
          eventId,
          noteId
        };
        const linearNotes = getLinearizedNotes(score);
        let targetNoteId2 = noteId;
        if (!targetNoteId2) {
          const measure2 = getActiveStaff(score, startStaffIndex).measures[measureIndex];
          const event2 = measure2 == null ? void 0 : measure2.events.find((e) => e.id === eventId);
          if (event2 && event2.notes.length > 0) targetNoteId2 = event2.notes[0].id;
        }
        if (targetNoteId2) {
          const focus = __spreadProps(__spreadValues({}, context), { noteId: targetNoteId2 });
          const selectedNotes = calculateNoteRange(anchor, focus, linearNotes);
          setSelection((prev) => __spreadProps(__spreadValues({}, prev), {
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            noteId: targetNoteId2,
            // Update cursor
            selectedNotes,
            anchor
            // Keep anchor
          }));
          return;
        }
      }
    }
    let targetNoteId = noteId;
    let notesToSelect = [];
    const measure = getActiveStaff(score, startStaffIndex).measures[measureIndex];
    const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
    const hasNotes = event && event.notes && event.notes.length > 0;
    if (hasNotes) {
      if (selectAllInEvent || !noteId) {
        notesToSelect = event.notes.map((n) => ({
          staffIndex: startStaffIndex,
          measureIndex,
          eventId,
          noteId: n.id
        }));
        if (!targetNoteId) targetNoteId = event.notes[0].id;
      }
    }
    let nextSelection = null;
    if (notesToSelect.length > 0) {
      if (isMulti && !onlyHistory) {
        setSelection((prev) => {
          const newSelectedNotes = prev.selectedNotes ? [...prev.selectedNotes] : [];
          notesToSelect.forEach((n) => {
            const exists = newSelectedNotes.some((ex) => {
              if (n.noteId) {
                return ex.noteId === n.noteId;
              } else {
                return ex.eventId === n.eventId && ex.noteId === null;
              }
            });
            if (!exists) {
              newSelectedNotes.push(n);
            }
          });
          return __spreadProps(__spreadValues({}, prev), {
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            noteId: targetNoteId,
            selectedNotes: newSelectedNotes,
            anchor: prev.anchor
            // Maintain anchor? Or reset?
          });
        });
        if (!(event == null ? void 0 : event.isRest)) playAudioFeedback((event == null ? void 0 : event.notes) || []);
        return;
      } else {
        nextSelection = {
          staffIndex: startStaffIndex,
          measureIndex,
          eventId,
          noteId: targetNoteId,
          selectedNotes: notesToSelect,
          anchor: { staffIndex: startStaffIndex, measureIndex, eventId, noteId: targetNoteId }
          // New Anchor
        };
      }
    } else {
      if (onlyHistory) {
        nextSelection = {
          staffIndex: startStaffIndex,
          measureIndex,
          eventId,
          noteId: targetNoteId,
          selectedNotes: [{ staffIndex: startStaffIndex, measureIndex, eventId, noteId: targetNoteId }],
          // Mimic standard selection structure
          anchor: { staffIndex: startStaffIndex, measureIndex, eventId, noteId: targetNoteId }
        };
      } else {
        setSelection((prev) => {
          const emptySelection = __spreadProps(__spreadValues({}, createDefaultSelection()), { staffIndex: startStaffIndex });
          const base = prev || emptySelection;
          const newSel = toggleNoteInSelection(base, {
            staffIndex: startStaffIndex,
            measureIndex,
            eventId,
            noteId: targetNoteId
          }, isMulti);
          return newSel;
        });
        if (targetNoteId) {
          const note = event == null ? void 0 : event.notes.find((n) => n.id === targetNoteId);
          if (note) playAudioFeedback([note]);
        }
        return;
      }
    }
    if (onlyHistory && nextSelection) {
      setLastSelection(nextSelection);
      setSelection((prev) => __spreadProps(__spreadValues({}, createDefaultSelection()), {
        staffIndex: startStaffIndex
      }));
    } else if (nextSelection) {
      setSelection(nextSelection);
      playAudioFeedback((event == null ? void 0 : event.notes) || []);
    }
  }, [selection, score, playAudioFeedback, clearSelection]);
  const updateSelection = React3.useCallback((partial) => {
    setSelection((prev) => __spreadValues(__spreadValues({}, prev), partial));
  }, []);
  const selectAllInMeasure = React3.useCallback((measureIndex, staffIndex = 0) => {
    const measure = getActiveStaff(score, staffIndex).measures[measureIndex];
    if (!measure) return;
    const allNotes = [];
    measure.events.forEach((event) => {
      if (event.notes) {
        event.notes.forEach((note) => {
          allNotes.push({
            staffIndex,
            measureIndex,
            eventId: event.id,
            noteId: note.id
          });
        });
      }
    });
    if (allNotes.length > 0) {
      const first = allNotes[0];
      setSelection({
        staffIndex,
        measureIndex,
        eventId: first.eventId,
        noteId: first.noteId,
        selectedNotes: allNotes,
        anchor: __spreadValues({}, first)
      });
    }
  }, [score]);
  return {
    selection,
    setSelection,
    // Exposed for low-level overrides if absolutely needed
    select,
    clearSelection,
    updateSelection,
    selectAllInMeasure,
    lastSelection
  };
};
var useEditorMode = ({ selection, previewNote }) => {
  const editorState = React3.useMemo(() => {
    if (selection.eventId && selection.measureIndex !== null) {
      return "SELECTION_READY";
    }
    if (previewNote) {
      return "ENTRY_READY";
    }
    return "IDLE";
  }, [selection, previewNote]);
  return {
    editorState,
    // Helper booleans for easier JSX usage
    isSelectionMode: editorState === "SELECTION_READY",
    isEntryMode: editorState === "ENTRY_READY"
  };
};

// src/utils/focusScore.ts
init_core();
init_constants();
var createSelection = (measureIndex, eventId = null, noteId = null) => ({
  staffIndex: 0,
  measureIndex,
  eventId,
  noteId,
  selectedNotes: []
});
var isSelectionValid = (score, selection) => {
  var _a;
  if (!selection.eventId || selection.measureIndex === null) return false;
  const staff = score.staves[selection.staffIndex || 0];
  const measure = staff == null ? void 0 : staff.measures[selection.measureIndex];
  return (_a = measure == null ? void 0 : measure.events.some((e) => e.id === selection.eventId)) != null ? _a : false;
};
function calculateFocusSelection(score, existingSelection) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  if (isSelectionValid(score, existingSelection)) {
    return existingSelection;
  }
  const activeStaff = getActiveStaff(score, 0);
  if (!((_a = activeStaff.measures) == null ? void 0 : _a.length)) {
    return createSelection(null);
  }
  const quantsPerMeasure = TIME_SIGNATURES[score.timeSignature] || 64;
  for (let i = 0; i < activeStaff.measures.length; i++) {
    const measure = activeStaff.measures[i];
    if (!((_b = measure.events) == null ? void 0 : _b.length)) {
      return createSelection(i);
    }
    if (calculateTotalQuants(measure.events) < quantsPerMeasure) {
      const lastEvent2 = measure.events.at(-1);
      return createSelection(i, lastEvent2.id, (_e = (_d = (_c = lastEvent2.notes) == null ? void 0 : _c[0]) == null ? void 0 : _d.id) != null ? _e : null);
    }
  }
  const lastIdx = activeStaff.measures.length - 1;
  const lastEvent = activeStaff.measures[lastIdx].events.at(-1);
  return createSelection(lastIdx, (_f = lastEvent == null ? void 0 : lastEvent.id) != null ? _f : null, (_i = (_h = (_g = lastEvent == null ? void 0 : lastEvent.notes) == null ? void 0 : _g[0]) == null ? void 0 : _h.id) != null ? _i : null);
}

// src/hooks/useScoreLogic.ts
var useScoreLogic = (initialScore) => {
  const defaultScore = createDefaultScore();
  const migratedInitialScore = initialScore ? migrateScore(initialScore) : defaultScore;
  const { score, engine } = useScoreEngine(migratedInitialScore);
  const undo = React3.useCallback(() => engine.undo(), [engine]);
  const redo = React3.useCallback(() => engine.redo(), [engine]);
  const history = engine.getHistory();
  const redoStack = engine.getRedoStack();
  const scoreRef = React3.useRef(score);
  scoreRef.current = score;
  const tools = useEditorTools();
  const {
    activeDuration,
    setActiveDuration,
    isDotted,
    setIsDotted,
    activeAccidental,
    setActiveAccidental,
    activeTie,
    setActiveTie,
    inputMode,
    setInputMode,
    toggleInputMode
  } = tools;
  const { selection, setSelection, select, lastSelection } = useSelection({ score });
  const [previewNote, setPreviewNote] = React3.useState(null);
  if (!score || !score.staves) {
    console.error("CRITICAL: Score corrupted in useScoreLogic", score);
    if (!score) console.error("Score is null/undefined");
    else if (!score.staves) console.error("Score.staves is undefined");
  }
  const currentQuantsPerMeasure = React3.useMemo(() => {
    if (score.timeSignature) {
      return TIME_SIGNATURES[score.timeSignature] || 64;
    }
    return CONFIG.quantsPerMeasure;
  }, [score.timeSignature]);
  React3.useEffect(() => {
    const { measureIndex, eventId, noteId, staffIndex } = selection;
    if (measureIndex === null || !eventId) {
      return;
    }
    const measure = getActiveStaff(score, staffIndex || 0).measures[measureIndex];
    if (!measure) return;
    const event = measure.events.find((e) => e.id === eventId);
    if (event) {
      if (noteId) {
        const note = event.notes.find((n) => n.id === noteId);
        if (note) {
          setActiveAccidental(note.accidental || null);
          setActiveTie(!!note.tied);
        }
      } else {
        setActiveAccidental(null);
        setActiveTie(false);
      }
      const targetMode = event.isRest ? "REST" : "NOTE";
      if (inputMode !== targetMode) {
        setInputMode(targetMode);
      }
    }
  }, [selection, score, setActiveAccidental, setActiveTie, setInputMode, inputMode]);
  React3.useCallback(() => {
  }, []);
  const measureActions = useMeasureActions({
    score,
    setSelection,
    setPreviewNote,
    dispatch: engine.dispatch.bind(engine)
  });
  const noteActions = useNoteActions({
    scoreRef,
    selection,
    setSelection,
    // Still passed but might be unused if we fully switched
    select,
    setPreviewNote,
    // Deprecated
    activeDuration,
    isDotted,
    activeAccidental,
    activeTie,
    currentQuantsPerMeasure,
    dispatch: engine.dispatch.bind(engine),
    inputMode
  });
  const modifiers = useModifiers({
    scoreRef,
    selection,
    currentQuantsPerMeasure,
    tools,
    dispatch: engine.dispatch.bind(engine)
  });
  const navigation = useNavigation({
    scoreRef,
    selection,
    lastSelection,
    // Pass history
    setSelection,
    select,
    previewNote,
    setPreviewNote,
    activeDuration,
    isDotted,
    currentQuantsPerMeasure,
    dispatch: engine.dispatch.bind(engine),
    inputMode
  });
  const tupletActions = useTupletActions(
    scoreRef,
    selection,
    engine.dispatch.bind(engine)
  );
  const { editorState } = useEditorMode({ selection, previewNote });
  const selectedDurations = React3.useMemo(() => {
    if (editorState !== "SELECTION_READY") return [];
    const durations = /* @__PURE__ */ new Set();
    const currentScore = scoreRef.current;
    const addFromEvent = (measureIndex, eventId, staffIndex) => {
      const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
      const measure = staff.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
      if (event) durations.add(event.duration);
    };
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => {
        addFromEvent(n.measureIndex, n.eventId, n.staffIndex);
      });
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
      addFromEvent(selection.measureIndex, selection.eventId, staffIndex);
    }
    return Array.from(durations);
  }, [selection, score, editorState]);
  const selectedDots = React3.useMemo(() => {
    if (editorState !== "SELECTION_READY") return [];
    const dots = /* @__PURE__ */ new Set();
    const currentScore = scoreRef.current;
    const addFromEvent = (measureIndex, eventId, staffIndex) => {
      const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
      const measure = staff.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
      if (event) dots.add(!!event.dotted);
    };
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => addFromEvent(n.measureIndex, n.eventId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
      addFromEvent(selection.measureIndex, selection.eventId, staffIndex);
    }
    return Array.from(dots);
  }, [selection, score, editorState]);
  const selectedTies = React3.useMemo(() => {
    if (editorState !== "SELECTION_READY") return [];
    const ties = /* @__PURE__ */ new Set();
    const currentScore = scoreRef.current;
    const addFromNote = (measureIndex, eventId, noteId, staffIndex) => {
      const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
      const measure = staff.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
      if (event) {
        if (noteId) {
          const note = event.notes.find((n) => n.id === noteId);
          if (note) ties.add(!!note.tied);
        } else {
          event.notes.forEach((n) => ties.add(!!n.tied));
        }
      }
    };
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => addFromNote(n.measureIndex, n.eventId, n.noteId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
      addFromNote(selection.measureIndex, selection.eventId, selection.noteId, staffIndex);
    }
    return Array.from(ties);
  }, [selection, score, editorState]);
  const selectedAccidentals = React3.useMemo(() => {
    if (editorState !== "SELECTION_READY") return [];
    const accidentals = /* @__PURE__ */ new Set();
    const currentScore = scoreRef.current;
    const getAccidentalType = (pitch) => {
      const match = pitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
      if (!match) return "natural";
      const acc = match[2];
      if (acc == null ? void 0 : acc.startsWith("#")) return "sharp";
      if (acc == null ? void 0 : acc.startsWith("b")) return "flat";
      return "natural";
    };
    const addFromNote = (measureIndex, eventId, noteId, staffIndex) => {
      const staff = currentScore.staves[staffIndex] || getActiveStaff(currentScore);
      const measure = staff.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
      if (event) {
        if (noteId) {
          const note = event.notes.find((n) => n.id === noteId);
          if (note && note.pitch !== null) accidentals.add(getAccidentalType(note.pitch));
        } else {
          event.notes.forEach((n) => {
            if (n.pitch !== null) accidentals.add(getAccidentalType(n.pitch));
          });
        }
      }
    };
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => addFromNote(n.measureIndex, n.eventId, n.noteId, n.staffIndex));
    } else if (selection.measureIndex !== null && selection.eventId) {
      const staffIndex = selection.staffIndex !== void 0 ? selection.staffIndex : 0;
      addFromNote(selection.measureIndex, selection.eventId, selection.noteId, staffIndex);
    }
    return Array.from(accidentals);
  }, [selection, score, editorState]);
  const handleDurationChangeWrapper = React3.useCallback((newDuration) => {
    if (editorState === "SELECTION_READY") {
      modifiers.handleDurationChange(newDuration, true);
    } else {
      setActiveDuration(newDuration);
      if (editorState === "IDLE" && lastSelection && lastSelection.measureIndex !== null) {
        const staffIndex = lastSelection.staffIndex !== void 0 ? lastSelection.staffIndex : 0;
        const staff = scoreRef.current.staves[staffIndex] || getActiveStaff(scoreRef.current);
        const measure = staff.measures[lastSelection.measureIndex];
        if (measure) {
          const newPreview = getAppendPreviewNote(
            measure,
            lastSelection.measureIndex,
            staffIndex,
            newDuration,
            // Use the NEW duration
            isDotted
          );
          setPreviewNote(newPreview);
        }
      } else if (editorState === "ENTRY_READY" && previewNote) {
        setPreviewNote((prev) => __spreadProps(__spreadValues({}, prev), {
          duration: newDuration
        }));
      }
    }
  }, [editorState, modifiers.handleDurationChange, setActiveDuration, lastSelection, scoreRef, isDotted, previewNote]);
  const focusScore = React3.useCallback(() => {
    const newSelection = calculateFocusSelection(score, selection);
    setSelection(newSelection);
    if (!newSelection.eventId && newSelection.measureIndex !== null) {
      const staff = score.staves[newSelection.staffIndex || 0];
      const measure = staff == null ? void 0 : staff.measures[newSelection.measureIndex];
      if (measure) {
        const clef = staff.clef || "treble";
        const defaultPitch = clef === "bass" ? "D3" : "B4";
        const preview = getAppendPreviewNote(
          measure,
          newSelection.measureIndex,
          newSelection.staffIndex || 0,
          activeDuration,
          isDotted,
          defaultPitch,
          inputMode === "REST"
        );
        setPreviewNote(preview);
      }
    }
  }, [score, selection, setSelection, setPreviewNote, activeDuration, isDotted, inputMode]);
  return {
    score,
    selection,
    editorState,
    selectedDurations,
    // Expose derived durations
    selectedDots,
    selectedTies,
    selectedAccidentals,
    setSelection,
    previewNote,
    setPreviewNote,
    history,
    redoStack,
    undo,
    redo,
    dispatch: engine.dispatch.bind(engine),
    activeDuration,
    setActiveDuration,
    isDotted,
    setIsDotted,
    activeAccidental,
    activeTie,
    inputMode,
    setInputMode,
    toggleInputMode,
    handleTimeSignatureChange: measureActions.handleTimeSignatureChange,
    handleKeySignatureChange: measureActions.handleKeySignatureChange,
    addMeasure: measureActions.addMeasure,
    removeMeasure: measureActions.removeMeasure,
    togglePickup: measureActions.togglePickup,
    setGrandStaff: measureActions.setGrandStaff,
    handleMeasureHover: noteActions.handleMeasureHover,
    addNoteToMeasure: noteActions.addNoteToMeasure,
    addChordToMeasure: noteActions.addChordToMeasure,
    deleteSelected: noteActions.deleteSelected,
    handleNoteSelection: navigation.handleNoteSelection,
    handleDurationChange: handleDurationChangeWrapper,
    // Use wrapper
    handleDotToggle: modifiers.handleDotToggle,
    handleAccidentalToggle: modifiers.handleAccidentalToggle,
    handleTieToggle: modifiers.handleTieToggle,
    currentQuantsPerMeasure,
    scoreRef,
    checkDurationValidity: modifiers.checkDurationValidity,
    checkDotValidity: modifiers.checkDotValidity,
    updateNotePitch: noteActions.updateNotePitch,
    // Tuplet actions
    applyTuplet: tupletActions.applyTuplet,
    removeTuplet: tupletActions.removeTuplet,
    canApplyTuplet: tupletActions.canApplyTuplet,
    activeTupletRatio: tupletActions.getActiveTupletRatio(),
    transposeSelection: navigation.transposeSelection,
    moveSelection: navigation.moveSelection,
    switchStaff: navigation.switchStaff,
    focusScore
  };
};

// src/commands/SetSingleStaffCommand.ts
var SetSingleStaffCommand = class {
  constructor(targetClef) {
    this.targetClef = targetClef;
    this.type = "SET_SINGLE_STAFF";
    this.previousStaves = null;
  }
  execute(score) {
    if (score.staves.length < 2) return score;
    this.previousStaves = score.staves.map((s) => __spreadProps(__spreadValues({}, s), {
      measures: s.measures.map((m) => __spreadProps(__spreadValues({}, m), {
        events: [...m.events]
      }))
    }));
    const trebleStaff = score.staves[0];
    const bassStaff = score.staves[1];
    const keepStaff = this.targetClef === "treble" ? trebleStaff : bassStaff;
    const resultMeasures = keepStaff.measures.map((m) => __spreadValues({}, m));
    const resultStaff = __spreadProps(__spreadValues({}, keepStaff), {
      clef: this.targetClef,
      measures: resultMeasures
    });
    return __spreadProps(__spreadValues({}, score), {
      staves: [resultStaff]
    });
  }
  undo(score) {
    if (!this.previousStaves) return score;
    return __spreadProps(__spreadValues({}, score), {
      staves: this.previousStaves
    });
  }
};
var ScoreContext = React3.createContext(null);
var useScoreContext = () => {
  const context = React3.useContext(ScoreContext);
  if (!context) {
    throw new Error("useScoreContext must be used within a ScoreProvider");
  }
  return context;
};
var ScoreProvider = ({ children, initialScore }) => {
  const logic = useScoreLogic(initialScore);
  const [pendingClefChange, setPendingClefChange] = React3__default.default.useState(null);
  const handleClefChange = React3__default.default.useCallback((val) => {
    const newClef = String(val).trim();
    if (newClef === "grand") {
      logic.setGrandStaff();
    } else if (logic.score.staves.length >= 2) {
      setPendingClefChange({ targetClef: newClef });
    } else {
      logic.dispatch(new SetSingleStaffCommand(newClef));
    }
  }, [logic.score.staves.length, logic.setGrandStaff, logic.dispatch]);
  const contextValue = React3__default.default.useMemo(() => __spreadProps(__spreadValues({}, logic), {
    pendingClefChange,
    setPendingClefChange,
    handleClefChange
  }), [logic, pendingClefChange, handleClefChange]);
  return /* @__PURE__ */ jsxRuntime.jsx(ScoreContext.Provider, { value: contextValue, children });
};

// src/context/ThemeContext.tsx
init_config();
init_constants();
var ThemeContext = React3.createContext(void 0);
var ThemeProvider = ({ children, initialTheme }) => {
  const [themeName, setThemeName] = React3.useState(initialTheme || DEFAULT_THEME);
  const [zoom, setZoom] = React3.useState(DEFAULT_SCALE);
  React3.useEffect(() => {
    if (initialTheme) {
      setThemeName(initialTheme);
    }
  }, [initialTheme]);
  const theme = THEMES[themeName];
  return /* @__PURE__ */ jsxRuntime.jsx(ThemeContext.Provider, { value: { theme, themeName, setTheme: setThemeName, zoom, setZoom }, children });
};
var useTheme = () => {
  const context = React3.useContext(ThemeContext);
  if (context === void 0) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// src/hooks/handlers/handlePlayback.ts
var handlePlayback = (e, playback, selection, score) => {
  const { playScore, stopPlayback, isPlaying, lastPlayStart } = playback;
  const measures = getActiveStaff(score).measures;
  if (e.key.toLowerCase() === "p") {
    e.preventDefault();
    if (selection.measureIndex !== null && selection.eventId) {
      const m = measures[selection.measureIndex];
      const eIdx = m.events.findIndex((evt) => evt.id === selection.eventId);
      playScore(selection.measureIndex, eIdx !== -1 ? eIdx : 0);
    } else {
      playScore(0, 0);
    }
    return true;
  }
  if (e.code === "Space") {
    e.preventDefault();
    if (e.shiftKey && (e.altKey || e.metaKey)) {
      playScore(0, 0);
    } else if (e.shiftKey) {
      playScore(lastPlayStart.measureIndex, lastPlayStart.eventIndex);
    } else {
      if (isPlaying) stopPlayback();
      else {
        if (selection.measureIndex !== null && selection.eventId) {
          const m = measures[selection.measureIndex];
          const eIdx = m.events.findIndex((evt) => evt.id === selection.eventId);
          playScore(selection.measureIndex, eIdx !== -1 ? eIdx : 0);
        } else {
          playScore(0, 0);
        }
      }
    }
    return true;
  }
  return false;
};

// src/hooks/handlers/handleNavigation.ts
var handleNavigation = (e, moveSelection, switchStaff) => {
  if (!e.key.startsWith("Arrow")) return false;
  const direction = e.key.replace("Arrow", "").toLowerCase();
  if ((direction === "up" || direction === "down") && e.altKey && switchStaff) {
    e.preventDefault();
    switchStaff(direction);
    return true;
  }
  if (direction === "left" || direction === "right") {
    e.preventDefault();
    moveSelection(direction, e.shiftKey);
    return true;
  }
  if (direction === "up" || direction === "down") {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      moveSelection(direction, e.shiftKey);
      return true;
    }
  }
  return false;
};

// src/commands/ToggleRestCommand.ts
var getCenterPitch = (clef) => {
  return clef === "bass" ? "D3" : "B4";
};
var ToggleRestCommand = class {
  /**
   * @param selection - Current selection containing events to toggle
   */
  constructor(selection) {
    this.selection = selection;
    this.type = "TOGGLE_REST";
    /** Stores previous state for each event for undo */
    this.previousStates = [];
  }
  execute(score) {
    var _a;
    const eventMap = /* @__PURE__ */ new Map();
    for (const item of this.selection.selectedNotes) {
      const key = `${item.staffIndex}-${item.measureIndex}-${item.eventId}`;
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          staffIndex: item.staffIndex,
          measureIndex: item.measureIndex,
          eventId: item.eventId
        });
      }
    }
    if (this.selection.measureIndex !== null && this.selection.eventId !== null) {
      const key = `${this.selection.staffIndex}-${this.selection.measureIndex}-${this.selection.eventId}`;
      if (!eventMap.has(key)) {
        eventMap.set(key, {
          staffIndex: this.selection.staffIndex,
          measureIndex: this.selection.measureIndex,
          eventId: this.selection.eventId
        });
      }
    }
    if (eventMap.size === 0) return score;
    let allRests = true;
    for (const { staffIndex, measureIndex, eventId } of eventMap.values()) {
      const staff = getActiveStaff(score, staffIndex);
      const measure = staff.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
      if (event && !event.isRest) {
        allRests = false;
        break;
      }
    }
    let newScore = score;
    for (const { staffIndex, measureIndex, eventId } of eventMap.values()) {
      const staff = getActiveStaff(newScore, staffIndex);
      const measure = staff.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((e) => e.id === eventId);
      if (!event) continue;
      this.previousStates.push({
        staffIndex,
        measureIndex,
        eventId,
        isRest: (_a = event.isRest) != null ? _a : false,
        notes: [...event.notes]
      });
      if (allRests) {
        const clef = staff.clef;
        const centeredPitch = getCenterPitch(clef);
        newScore = updateEvent(newScore, staffIndex, measureIndex, eventId, (e) => {
          e.isRest = false;
          e.notes = [{
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            pitch: centeredPitch
          }];
          return true;
        });
      } else {
        newScore = updateEvent(newScore, staffIndex, measureIndex, eventId, (e) => {
          e.isRest = true;
          e.notes = [];
          return true;
        });
      }
    }
    return newScore;
  }
  undo(score) {
    let newScore = score;
    for (const state2 of this.previousStates) {
      newScore = updateEvent(
        newScore,
        state2.staffIndex,
        state2.measureIndex,
        state2.eventId,
        (event) => {
          event.isRest = state2.isRest;
          event.notes = [...state2.notes];
          return true;
        }
      );
    }
    return newScore;
  }
};

// src/hooks/handlers/handleMutation.ts
var handleMutation = (e, logic) => {
  var _a;
  const {
    undo,
    redo,
    handleAccidentalToggle,
    handleTieToggle,
    handleDotToggle,
    deleteSelected,
    transposeSelection,
    addNoteToMeasure,
    previewNote,
    handleDurationChange,
    // R key / Rest toggle
    toggleInputMode,
    selection,
    dispatch,
    editorState
  } = logic;
  const durationMap = {
    "1": "sixtyfourth",
    "2": "thirtysecond",
    "3": "sixteenth",
    "4": "eighth",
    "5": "quarter",
    "6": "half",
    "7": "whole"
  };
  if (durationMap[e.key]) {
    e.preventDefault();
    const applyToSelection = e.metaKey || e.ctrlKey;
    handleDurationChange(durationMap[e.key], applyToSelection);
    return true;
  }
  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    toggleInputMode();
    if (editorState === "SELECTION_READY" && ((_a = selection == null ? void 0 : selection.selectedNotes) == null ? void 0 : _a.length) > 0) {
      dispatch(new ToggleRestCommand(selection));
    }
    return true;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) redo();
    else undo();
    return true;
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
    e.preventDefault();
    redo();
    return true;
  }
  if (e.key === "-" || e.key === "_") {
    e.preventDefault();
    handleAccidentalToggle("flat");
    return true;
  }
  if (e.key === "=" || e.key === "+") {
    e.preventDefault();
    handleAccidentalToggle("sharp");
    return true;
  }
  if (e.key === "0") {
    e.preventDefault();
    handleAccidentalToggle("natural");
    return true;
  }
  if (e.key.toLowerCase() === "t") {
    e.preventDefault();
    handleTieToggle();
    return true;
  }
  if (e.key === ".") {
    e.preventDefault();
    handleDotToggle();
    return true;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    if (previewNote) {
      addNoteToMeasure(previewNote.measureIndex, previewNote, true, { mode: previewNote.mode, index: previewNote.index });
    }
    return true;
  }
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();
    const direction = e.key.replace("Arrow", "").toLowerCase();
    transposeSelection(direction, e.shiftKey);
    return true;
  }
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    deleteSelected();
    return true;
  }
  return false;
};

// src/hooks/useKeyboardShortcuts.ts
var useKeyboardShortcuts = (logic, playback, meta, handlers) => {
  const {
    selection,
    score,
    moveSelection,
    setSelection,
    scoreRef,
    switchStaff
  } = logic;
  const { isEditingTitle, isHoveringScore, scoreContainerRef, isAnyMenuOpen } = meta;
  const { handleTitleCommit } = handlers;
  const handleKeyDown = React3.useCallback((e) => {
    var _a, _b;
    const tagName = ((_a = e.target.tagName) == null ? void 0 : _a.toLowerCase()) || "";
    if (tagName === "input" || tagName === "textarea") {
      if (e.key === "Enter" && isEditingTitle) {
        e.preventDefault();
        handleTitleCommit();
      }
      return;
    }
    if (isEditingTitle) return;
    if (scoreContainerRef && scoreContainerRef.current) {
      const isFocused = document.activeElement === scoreContainerRef.current || scoreContainerRef.current.contains(document.activeElement);
      if (!isFocused && !isHoveringScore) {
        return;
      }
    }
    if (e.key === "Escape") {
      e.preventDefault();
      console.log("ESC Pressed. Focused:", (_b = document.activeElement) == null ? void 0 : _b.getAttribute("data-testid"));
      if (playback.isPlaying) {
        playback.handlePlayToggle();
        return;
      }
      if (isAnyMenuOpen && isAnyMenuOpen()) {
        return;
      }
      if (selection.noteId) {
        const activeStaff = getActiveStaff(scoreRef.current);
        const measure = activeStaff.measures[selection.measureIndex];
        const event = measure.events.find((ev) => ev.id === selection.eventId);
        if (event && event.notes.length > 1) {
          const allSelected = event.notes.every((n) => {
            if (String(n.id) === String(selection.noteId)) return true;
            return selection.selectedNotes.some((sn) => String(sn.noteId) === String(n.id));
          });
          if (!allSelected) {
            const allNoteSelections = event.notes.map((n) => ({
              staffIndex: selection.staffIndex || 0,
              measureIndex: selection.measureIndex,
              eventId: selection.eventId,
              noteId: n.id
            }));
            setSelection(__spreadProps(__spreadValues({}, selection), {
              selectedNotes: allNoteSelections
            }));
            return;
          }
        }
        setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null, selectedNotes: [] });
      } else if (selection.eventId) {
        setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null, selectedNotes: [] });
      }
      return;
    }
    if (handlePlayback(e, playback, selection, score)) return;
    if (handleNavigation(e, moveSelection, switchStaff)) return;
    if (handleMutation(e, logic)) return;
  }, [
    logic,
    playback,
    meta,
    handlers,
    selection,
    score,
    moveSelection,
    switchStaff,
    isEditingTitle,
    handleTitleCommit,
    isHoveringScore,
    scoreContainerRef
  ]);
  React3.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  return handleKeyDown;
};

// src/services/TimelineService.ts
init_constants();
init_core();
init_MusicService();
var createTimeline = (score, bpm) => {
  const timeline = [];
  const secondsPerBeat = 60 / bpm;
  const secondsPerQuant = secondsPerBeat / 16;
  const staves = score.staves || [getActiveStaff(score)];
  if (staves.length === 0) return [];
  const timeSig = score.timeSignature || "4/4";
  const firstStaffMeasures = staves[0].measures;
  const measureStartTimes = [];
  let currentGlobalTime = 0;
  firstStaffMeasures.forEach((measure) => {
    measureStartTimes.push(currentGlobalTime);
    let measureQuants;
    if (measure.isPickup) {
      measureQuants = measure.events.reduce((acc, e) => acc + getNoteDuration(e.duration, e.dotted, e.tuplet), 0);
    } else {
      measureQuants = TIME_SIGNATURES[timeSig] || 64;
    }
    currentGlobalTime += measureQuants * secondsPerQuant;
  });
  staves.forEach((staff, staffIndex) => {
    const rawEvents = [];
    staff.measures.forEach((measure, mIndex) => {
      if (mIndex >= measureStartTimes.length) return;
      const measureStartTime = measureStartTimes[mIndex];
      let currentMeasureQuant = 0;
      measure.events.forEach((event, eIndex) => {
        const eventDurQuants = getNoteDuration(event.duration, event.dotted, event.tuplet);
        event.notes.forEach((note) => {
          rawEvents.push({
            time: measureStartTime + currentMeasureQuant * secondsPerQuant,
            duration: eventDurQuants * secondsPerQuant,
            pitch: note.pitch,
            tied: !!note.tied,
            measureIndex: mIndex,
            eventIndex: eIndex,
            quant: currentMeasureQuant,
            staffIndex
          });
        });
        currentMeasureQuant += eventDurQuants;
      });
    });
    rawEvents.sort((a, b) => {
      if (a.pitch !== b.pitch) return a.pitch.localeCompare(b.pitch);
      return a.time - b.time;
    });
    if (rawEvents.length > 0) {
      let current = rawEvents[0];
      for (let i = 1; i < rawEvents.length; i++) {
        const next = rawEvents[i];
        const isConnected = current.tied && next.pitch === current.pitch && Math.abs(next.time - (current.time + current.duration)) < 1e-3;
        if (isConnected) {
          current.duration += next.duration;
          current.tied = next.tied;
        } else {
          addEventToTimeline(current);
          current = next;
        }
      }
      addEventToTimeline(current);
    }
  });
  function addEventToTimeline(raw) {
    const freq = getFrequency(raw.pitch);
    if (freq) {
      timeline.push({
        time: raw.time,
        duration: raw.duration,
        pitch: raw.pitch,
        frequency: freq,
        type: "note",
        measureIndex: raw.measureIndex,
        eventIndex: raw.eventIndex,
        staffIndex: raw.staffIndex,
        quant: raw.quant
      });
    }
  }
  return timeline.sort((a, b) => a.time - b.time);
};

// src/hooks/usePlayback.ts
var usePlayback = (score, bpm) => {
  const [isPlaying, setIsPlaying] = React3.useState(false);
  const [playbackPosition, setPlaybackPosition] = React3.useState({ measureIndex: null, quant: null, duration: 0 });
  const [lastPlayStart, setLastPlayStart] = React3.useState({ measureIndex: 0, quant: 0 });
  const [instrumentState, setInstrumentState] = React3.useState("initializing");
  const isInitialized = React3.useRef(false);
  const ensureInit = React3.useCallback(async () => {
    if (isInitialized.current) return;
    await initTone((state2) => {
      setInstrumentState(state2.instrumentState);
    });
    isInitialized.current = true;
  }, []);
  const stopPlayback = React3.useCallback(() => {
    stopTonePlayback();
    setIsPlaying(false);
    setPlaybackPosition({ measureIndex: null, quant: null, duration: 0 });
  }, []);
  const playScore = React3.useCallback(async (startMeasureIndex = 0, startQuant = 0) => {
    await ensureInit();
    stopPlayback();
    setLastPlayStart({ measureIndex: startMeasureIndex, quant: startQuant });
    setIsPlaying(true);
    const timeline = createTimeline(score, bpm);
    let startTimeOffset = 0;
    const startEvent = timeline.find(
      (e) => e.measureIndex >= startMeasureIndex && (e.measureIndex > startMeasureIndex || e.quant >= startQuant)
    );
    if (startEvent) {
      startTimeOffset = startEvent.time;
    }
    scheduleTonePlayback(
      timeline,
      bpm,
      startTimeOffset,
      (measureIndex, quant, duration) => {
        setPlaybackPosition({ measureIndex, quant, duration: duration || 0 });
      },
      () => {
        setIsPlaying(false);
        setPlaybackPosition({ measureIndex: null, quant: null, duration: 0 });
      }
    );
  }, [score, bpm, stopPlayback, ensureInit]);
  const handlePlayToggle = React3.useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playScore();
    }
  }, [isPlaying, playScore, stopPlayback]);
  return {
    isPlaying,
    playbackPosition,
    playScore,
    stopPlayback,
    handlePlayToggle,
    lastPlayStart,
    instrumentState
    // Expose for UI (e.g., "Loading piano samples...")
  };
};

// src/engines/midiEngine.ts
init_MusicService();
var midiNoteToPitch = (midiNote) => {
  return midiToPitch(midiNote);
};
var requestMIDIAccess = async () => {
  if (typeof navigator === "undefined" || !navigator.requestMIDIAccess) {
    return { inputs: [], access: null, error: "Web MIDI API not supported in this browser" };
  }
  try {
    const access = await navigator.requestMIDIAccess();
    const inputs = Array.from(access.inputs.values());
    return { inputs, access, error: null };
  } catch (err) {
    return { inputs: [], access: null, error: `MIDI access denied: ${err.message}` };
  }
};
var setupMIDIListeners = (access, onNoteOn, onNoteOff) => {
  const handleMessage = (event) => {
    const [status, note, velocity] = event.data;
    if ((status & 240) === 144 && velocity > 0) {
      onNoteOn(note, velocity);
    }
  };
  access.inputs.forEach((input) => {
    input.onmidimessage = handleMessage;
  });
  access.onstatechange = (event) => {
    const port = event.port;
    if (port.type === "input") {
      if (port.state === "connected") {
        port.onmidimessage = handleMessage;
      }
    }
  };
  return () => {
    access.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    access.onstatechange = null;
  };
};

// src/hooks/useMIDI.ts
var useMIDI = (addChordCallback, activeDuration, isDotted, activeAccidental, scoreRef) => {
  const [midiStatus, setMidiStatus] = React3.useState({ connected: false, deviceName: null, error: null });
  const midiCleanupRef = React3.useRef(null);
  const midiChordBuffer = React3.useRef([]);
  const midiChordTimer = React3.useRef(null);
  const activeDurationRef = React3.useRef(activeDuration);
  const isDottedRef = React3.useRef(isDotted);
  const activeAccidentalRef = React3.useRef(activeAccidental);
  const addChordRef = React3.useRef(addChordCallback);
  React3.useEffect(() => {
    activeDurationRef.current = activeDuration;
  }, [activeDuration]);
  React3.useEffect(() => {
    isDottedRef.current = isDotted;
  }, [isDotted]);
  React3.useEffect(() => {
    activeAccidentalRef.current = activeAccidental;
  }, [activeAccidental]);
  React3.useEffect(() => {
    addChordRef.current = addChordCallback;
  }, [addChordCallback]);
  React3.useEffect(() => {
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
      setMidiStatus({ connected: true, deviceName: device.name || "MIDI Device", error: null });
      const CHORD_WINDOW_MS = 50;
      const commitChord = () => {
        if (midiChordBuffer.current.length === 0) return;
        const notes = [...midiChordBuffer.current];
        midiChordBuffer.current = [];
        scoreRef.current ? getActiveStaff(scoreRef.current).keySignature || "C" : "C";
        notes.forEach((n) => playNote(n.pitch));
        if (addChordRef.current && scoreRef.current) {
          const currentScore = scoreRef.current;
          const targetMeasureIndex = currentScore.measures.length - 1;
          addChordRef.current(targetMeasureIndex, notes.map((n) => ({
            pitch: n.pitch,
            accidental: n.accidental || activeAccidentalRef.current,
            id: Date.now() + Math.random()
          })), activeDurationRef.current, isDottedRef.current);
        }
      };
      const cleanup = setupMIDIListeners(access, (midiNote, velocity) => {
        const pitch = midiNoteToPitch(midiNote);
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
  }, []);
  return { midiStatus };
};

// src/hooks/useScoreInteraction.ts
init_MusicService();
init_config();
var useScoreInteraction = ({ scoreRef, selection, onUpdatePitch, onSelectNote }) => {
  const [dragState, setDragState] = React3.useState({
    active: false,
    measureIndex: null,
    eventId: null,
    noteId: null,
    startY: 0,
    startPitch: "",
    currentPitch: "",
    staffIndex: 0,
    initialPitches: /* @__PURE__ */ new Map()
  });
  const mouseDownTime = React3.useRef(0);
  const handleDragStart = React3.useCallback((params) => {
    var _a;
    const { measureIndex, eventId, noteId, startPitch, startY, isMulti = false, isShift = false, selectAllInEvent = false, staffIndex = 0 } = params;
    mouseDownTime.current = Date.now();
    const initialPitches = /* @__PURE__ */ new Map();
    const getPitch = (sIndex, mIndex, eId, nId) => {
      var _a2, _b, _c;
      const m = (_a2 = scoreRef.current.staves[sIndex]) == null ? void 0 : _a2.measures[mIndex];
      const e = m == null ? void 0 : m.events.find((ev) => String(ev.id) === String(eId));
      if (nId) {
        return (_b = e == null ? void 0 : e.notes.find((n) => String(n.id) === String(nId))) == null ? void 0 : _b.pitch;
      }
      return (_c = e == null ? void 0 : e.notes[0]) == null ? void 0 : _c.pitch;
    };
    const isNoteInSelection = isNoteSelected(selection, { staffIndex, measureIndex, eventId, noteId });
    if (isNoteInSelection && selection.selectedNotes && selection.selectedNotes.length > 0) {
      selection.selectedNotes.forEach((n) => {
        const p = getPitch(n.staffIndex, n.measureIndex, n.eventId, n.noteId);
        if (p) initialPitches.set(String(n.noteId), p);
      });
    } else if (selectAllInEvent) {
      const measure = (_a = scoreRef.current.staves[staffIndex]) == null ? void 0 : _a.measures[measureIndex];
      const event = measure == null ? void 0 : measure.events.find((ev) => String(ev.id) === String(eventId));
      if (event && event.notes) {
        event.notes.forEach((n) => {
          if (n.pitch) initialPitches.set(String(n.id), n.pitch);
        });
      }
    } else {
      initialPitches.set(String(noteId), startPitch);
    }
    setDragState({
      active: true,
      measureIndex,
      eventId: typeof eventId === "number" ? String(eventId) : eventId,
      noteId,
      startY,
      startPitch,
      currentPitch: startPitch,
      staffIndex,
      initialPitches
    });
    onSelectNote(measureIndex, eventId, noteId, staffIndex, isMulti, selectAllInEvent, isShift);
  }, [onSelectNote, selection, scoreRef]);
  React3.useEffect(() => {
    if (!dragState.active) return;
    const handleMouseMove = (e) => {
      var _a;
      if (!dragState.active) return;
      const deltaY = dragState.startY - e.clientY;
      const stepHeight = CONFIG.lineHeight / 2;
      const steps = Math.round(deltaY / stepHeight);
      if (steps === 0) return;
      const currentScore = scoreRef.current;
      const currentStaff = (_a = currentScore == null ? void 0 : currentScore.staves) == null ? void 0 : _a[dragState.staffIndex];
      const keySignature = (currentStaff == null ? void 0 : currentStaff.keySignature) || "C";
      dragState.initialPitches.forEach((pStart, noteIdStr) => {
        const newP = movePitchVisual(pStart, steps, keySignature);
        if (selection.selectedNotes && selection.selectedNotes.length > 1) {
          const noteInfo = selection.selectedNotes.find((n) => String(n.noteId) === noteIdStr);
          if (noteInfo && noteInfo.noteId !== null) {
            onUpdatePitch(noteInfo.measureIndex, noteInfo.eventId, noteInfo.noteId, newP);
          } else if (dragState.measureIndex !== null && dragState.eventId) {
            onUpdatePitch(dragState.measureIndex, dragState.eventId, noteIdStr, newP);
          }
        } else if (dragState.measureIndex !== null && dragState.eventId) {
          onUpdatePitch(dragState.measureIndex, dragState.eventId, noteIdStr, newP);
        }
      });
      if (dragState.initialPitches.size > 0) {
        const primaryStart = dragState.initialPitches.get(String(dragState.noteId)) || dragState.startPitch;
        const newPrimary = movePitchVisual(primaryStart, steps, keySignature);
        if (newPrimary !== dragState.currentPitch) {
          setDragState((prev) => __spreadProps(__spreadValues({}, prev), { currentPitch: newPrimary }));
        }
      }
    };
    const handleMouseUp = () => {
      Date.now() - mouseDownTime.current;
      setDragState((prev) => __spreadProps(__spreadValues({}, prev), { active: false }));
      document.body.style.cursor = "default";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ns-resize";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [dragState, scoreRef, onUpdatePitch]);
  return {
    dragState,
    handleDragStart
  };
};
function useSamplerStatus() {
  const [loaded, setLoaded] = React3.useState(false);
  React3.useEffect(() => {
    const checkSampler = () => setLoaded(isSamplerLoaded());
    checkSampler();
    const interval = setInterval(checkSampler, 500);
    return () => clearInterval(interval);
  }, []);
  return loaded;
}
function useModifierKeys() {
  const [modifierHeld, setModifierHeld] = React3.useState(false);
  React3.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) setModifierHeld(true);
    };
    const handleKeyUp = (e) => {
      if (!e.metaKey && !e.ctrlKey) setModifierHeld(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return modifierHeld;
}

// src/commands/UpdateTitleCommand.ts
var UpdateTitleCommand = class {
  constructor(newTitle) {
    this.newTitle = newTitle;
    this.type = "UPDATE_TITLE";
    this.previousTitle = "";
  }
  execute(score) {
    this.previousTitle = score.title;
    return __spreadProps(__spreadValues({}, score), {
      title: this.newTitle
    });
  }
  undo(score) {
    return __spreadProps(__spreadValues({}, score), {
      title: this.previousTitle
    });
  }
};

// src/hooks/useTitleEditor.ts
function useTitleEditor(currentTitle, dispatch) {
  const [isEditing, setIsEditing] = React3.useState(false);
  const [buffer, setBuffer] = React3.useState("");
  const inputRef = React3.useRef(null);
  React3.useEffect(() => {
    if (isEditing && inputRef.current) {
      setBuffer(currentTitle);
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, currentTitle]);
  const commit = React3.useCallback(() => {
    setIsEditing(false);
    if (buffer !== currentTitle) {
      dispatch(new UpdateTitleCommand(buffer));
    }
  }, [buffer, currentTitle, dispatch]);
  return { isEditing, setIsEditing, buffer, setBuffer, commit, inputRef };
}

// src/components/Canvas/ScoreCanvas.tsx
init_config();
init_layout();
init_core();

// src/components/Canvas/Staff.tsx
init_config();
init_layout();
init_core();

// src/components/Canvas/Measure.tsx
init_config();
init_core();
var getEffectiveAccidental = (pitch, keySignature) => {
  const note = tonal.Note.get(pitch);
  if (note.empty) return "natural";
  if (note.alt > 0) return "sharp";
  if (note.alt < 0) return "flat";
  return "natural";
};
var getKeyAccidental = (letter, keySignature) => {
  const scale = tonal.Key.majorKey(keySignature).scale;
  const match = scale.find((n) => n.startsWith(letter));
  if (match) {
    if (match.includes("#")) return "sharp";
    if (match.includes("b")) return "flat";
  }
  return "natural";
};
var getDiatonicPitch = (pitch) => {
  const note = tonal.Note.get(pitch);
  if (note.empty) return pitch;
  return `${note.letter}${note.oct}`;
};

// src/hooks/useAccidentalContext.ts
function useAccidentalContext(events, keySignature) {
  return React3.useMemo(() => {
    const overrides = {};
    const pitchHistory = {};
    const alteredLetters = /* @__PURE__ */ new Set();
    events.forEach((event) => {
      if (!event.notes) return;
      event.notes.forEach((note) => {
        if (note.pitch === null) return;
        const effective = getEffectiveAccidental(note.pitch);
        const keyAccidental = getKeyAccidental(note.pitch.charAt(0), keySignature);
        const diatonicPitch = getDiatonicPitch(note.pitch);
        let showSymbol = null;
        const prev = pitchHistory[diatonicPitch];
        if (prev) {
          if (prev !== effective) {
            showSymbol = effective;
          } else {
            showSymbol = null;
          }
        } else {
          if (effective !== keyAccidental) {
            showSymbol = effective;
            alteredLetters.add(note.pitch.charAt(0));
          } else {
            if (alteredLetters.has(note.pitch.charAt(0))) {
              showSymbol = effective;
            } else {
              showSymbol = null;
            }
          }
        }
        pitchHistory[diatonicPitch] = effective;
        if (showSymbol) {
          const symbolMap = {
            sharp: "\u266F",
            flat: "\u266D",
            natural: "\u266E"
          };
          overrides[note.id] = symbolMap[showSymbol] || null;
        } else {
          overrides[note.id] = null;
        }
      });
    });
    return overrides;
  }, [events, keySignature]);
}

// src/hooks/useMeasureLayout.ts
init_layout();
init_tuplets();
function useMeasureLayout(events, clef, isPickup, forcedEventPositions, forcedWidth) {
  const measureLayout = React3.useMemo(() => {
    return calculateMeasureLayout(events, void 0, clef, isPickup, forcedEventPositions);
  }, [events, clef, isPickup, forcedEventPositions]);
  const { hitZones, eventPositions, totalWidth, processedEvents } = measureLayout;
  const effectiveWidth = forcedWidth || totalWidth;
  const centeredEvents = React3.useMemo(() => {
    if (forcedWidth && processedEvents.length === 1 && processedEvents[0].id === "rest-placeholder") {
      return applyMeasureCentering(processedEvents, effectiveWidth);
    }
    return processedEvents;
  }, [processedEvents, forcedWidth, effectiveWidth]);
  const beamGroups = React3.useMemo(() => {
    return calculateBeamingGroups(events, eventPositions, clef);
  }, [events, eventPositions, clef]);
  const tupletGroups = React3.useMemo(() => {
    return calculateTupletBrackets(centeredEvents, eventPositions, clef);
  }, [centeredEvents, eventPositions, clef]);
  return {
    hitZones,
    eventPositions,
    totalWidth,
    effectiveWidth,
    centeredEvents,
    beamGroups,
    tupletGroups
  };
}

// src/hooks/useMeasureInteraction.ts
init_layout();
function useMeasureInteraction({
  hitZones,
  clef,
  scale,
  measureIndex,
  isLast,
  activeDuration,
  previewNote,
  selection,
  onHover,
  onAddNote
}) {
  const [hoveredMeasure, setHoveredMeasure] = React3.useState(false);
  const [cursorStyle, setCursorStyle] = React3.useState("crosshair");
  const [isNoteHovered, setIsNoteHovered] = React3.useState(false);
  const handleMeasureMouseMove = React3.useCallback((e) => {
    if (isNoteHovered) {
      onHover == null ? void 0 : onHover(null, null, null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const hit = hitZones.find((zone) => x >= zone.startX && x < zone.endX);
    let yOffset = Math.round((y - 50) / 6) * 6;
    const MIN_OFFSET = -48;
    const MAX_OFFSET = 102;
    yOffset = Math.max(MIN_OFFSET, Math.min(MAX_OFFSET, yOffset));
    const pitch = getPitchForOffset(yOffset, clef) || null;
    setHoveredMeasure(true);
    if (hit) {
      onHover == null ? void 0 : onHover(measureIndex, hit, pitch);
      setCursorStyle(hit.type === "EVENT" ? "default" : "crosshair");
    } else {
      onHover == null ? void 0 : onHover(measureIndex, { x, quant: 0, duration: activeDuration }, pitch);
      setCursorStyle("crosshair");
    }
  }, [isNoteHovered, hitZones, clef, scale, measureIndex, activeDuration, onHover]);
  const handleMeasureMouseLeave = React3.useCallback(() => {
    setHoveredMeasure(false);
    onHover == null ? void 0 : onHover(null, null, null);
    setCursorStyle("crosshair");
  }, [onHover]);
  const handleMeasureClick = React3.useCallback((e) => {
    if (isNoteHovered) return;
    if (selection.selectedNotes && selection.selectedNotes.length > 0) {
      return;
    }
    e.stopPropagation();
    if (hoveredMeasure && onAddNote && previewNote) {
      const isOverflow = isLast && previewNote.measureIndex === measureIndex + 1;
      if (previewNote.measureIndex === measureIndex || isOverflow) {
        onAddNote(measureIndex, previewNote, true);
      }
    }
  }, [isNoteHovered, selection.selectedNotes, hoveredMeasure, onAddNote, previewNote, isLast, measureIndex]);
  return {
    handleMeasureMouseMove,
    handleMeasureMouseLeave,
    handleMeasureClick,
    cursorStyle,
    isNoteHovered,
    setIsNoteHovered,
    hoveredMeasure
  };
}

// src/hooks/usePreviewRender.ts
init_layout();
init_config();
function usePreviewRender({
  previewNote,
  events,
  measureIndex,
  isLast,
  clef,
  hitZones,
  eventPositions,
  totalWidth,
  selectedNotes
}) {
  const restPreviewCacheRef = React3.useRef(null);
  return React3.useMemo(() => {
    if (!previewNote) return null;
    if (selectedNotes && selectedNotes.length > 0) return null;
    const isOverflowPreview = isLast && previewNote.measureIndex === measureIndex + 1;
    if (previewNote.measureIndex !== measureIndex && !isOverflowPreview) {
      return null;
    }
    if (previewNote.isRest) {
      const cacheKey = `${previewNote.measureIndex}-${previewNote.index}-${previewNote.mode}-${previewNote.duration}-${previewNote.dotted}`;
      if (restPreviewCacheRef.current && restPreviewCacheRef.current.key === cacheKey) {
        return restPreviewCacheRef.current.result;
      }
    }
    const visualTempNote = __spreadProps(__spreadValues({}, previewNote), {
      quant: 0,
      // Not used for positioning anymore
      id: "preview"
    });
    let combinedNotes = [visualTempNote];
    let xPos = 0;
    if (isOverflowPreview) {
      const lastInsertZone = hitZones.find((z) => z.type === "INSERT" && z.index === events.length);
      if (lastInsertZone) {
        xPos = lastInsertZone.startX + (lastInsertZone.endX - lastInsertZone.startX) / 2;
      } else {
        xPos = totalWidth - CONFIG.measurePaddingRight;
      }
    } else if (previewNote.mode === "CHORD") {
      const existingEvent = events[previewNote.index];
      if (existingEvent) {
        xPos = eventPositions[existingEvent.id];
        combinedNotes = [...existingEvent.notes, visualTempNote];
      }
    } else if (previewNote.mode === "INSERT") {
      const insertZone = hitZones.find((z) => z.type === "INSERT" && z.index === previewNote.index);
      if (insertZone) {
        xPos = insertZone.startX + (insertZone.endX - insertZone.startX) / 2;
      } else {
        if (previewNote.index < events.length) {
          xPos = eventPositions[events[previewNote.index].id] - 20;
        } else {
          xPos = totalWidth - CONFIG.measurePaddingRight;
        }
      }
    } else {
      const appendZone = hitZones.find((z) => z.type === "APPEND");
      xPos = appendZone ? appendZone.startX : 0;
    }
    const chordLayout = calculateChordLayout(combinedNotes, clef);
    const result = {
      chordNotes: combinedNotes,
      quant: 0,
      x: xPos,
      chordLayout
    };
    if (previewNote.isRest) {
      const cacheKey = `${previewNote.measureIndex}-${previewNote.index}-${previewNote.mode}-${previewNote.duration}-${previewNote.dotted}`;
      restPreviewCacheRef.current = { key: cacheKey, result };
    }
    return result;
  }, [previewNote, events, measureIndex, isLast, clef, hitZones, eventPositions, totalWidth, selectedNotes]);
}

// src/components/Canvas/ChordGroup.tsx
init_constants();
init_layout();
init_stems();
init_MusicService();

// src/components/Canvas/Note.tsx
init_constants();
init_config();
init_layout();
init_SMuFL();
var NoteHead = ({ x, y, duration, color }) => {
  const getGlyph = () => {
    if (duration === "whole") return NOTEHEADS.whole;
    if (duration === "half") return NOTEHEADS.half;
    return NOTEHEADS.black;
  };
  const fontSize = getFontSize(CONFIG.lineHeight);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      className: "NoteHead",
      x,
      y,
      fontFamily: BRAVURA_FONT,
      fontSize,
      textAnchor: "middle",
      fill: color,
      style: { userSelect: "none" },
      children: getGlyph()
    }
  );
};
var Accidental = ({ x, y, symbol, color }) => {
  if (!symbol) return null;
  const fontSize = getFontSize(CONFIG.lineHeight);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x,
      y,
      fontSize,
      fontFamily: BRAVURA_FONT,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: symbol
    }
  );
};
var Dot = ({ x, y, color }) => {
  const fontSize = getFontSize(CONFIG.lineHeight);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x,
      y,
      fontFamily: BRAVURA_FONT,
      fontSize,
      fill: color,
      textAnchor: "start",
      style: { userSelect: "none" },
      children: DOTS.augmentationDot
    }
  );
};
var LedgerLines = ({ x, y, baseY, color }) => {
  const lines = [];
  const relativeY = y - baseY;
  if (relativeY < 0) {
    for (let i = -12; i >= relativeY; i -= 12) {
      lines.push(
        /* @__PURE__ */ jsxRuntime.jsx(
          "line",
          {
            x1: x - LAYOUT.LEDGER_LINE_EXTENSION,
            y1: baseY + i,
            x2: x + LAYOUT.LEDGER_LINE_EXTENSION,
            y2: baseY + i,
            stroke: color,
            strokeWidth: LAYOUT.LINE_STROKE_WIDTH
          },
          `ledger-${i}`
        )
      );
    }
  }
  if (relativeY > 48) {
    for (let i = 60; i <= relativeY; i += 12) {
      lines.push(
        /* @__PURE__ */ jsxRuntime.jsx(
          "line",
          {
            x1: x - LAYOUT.LEDGER_LINE_EXTENSION,
            y1: baseY + i,
            x2: x + LAYOUT.LEDGER_LINE_EXTENSION,
            y2: baseY + i,
            stroke: color,
            strokeWidth: LAYOUT.LINE_STROKE_WIDTH
          },
          `ledger-${i}`
        )
      );
    }
  }
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: lines });
};
var HitArea = ({ x, y, cursor, onClick, onMouseDown, onDoubleClick, testId }) => /* @__PURE__ */ jsxRuntime.jsx(
  "rect",
  {
    x,
    y,
    width: LAYOUT.HIT_AREA.WIDTH,
    height: LAYOUT.HIT_AREA.HEIGHT,
    fill: "white",
    fillOpacity: 0.01,
    style: { cursor },
    onClick,
    onMouseDown,
    onDoubleClick,
    "data-testid": testId
  }
);
var Note5 = React3__default.default.memo(({
  // Note data
  note,
  pitch,
  // Alternative to note.pitch for simpler use cases
  duration,
  dotted = false,
  // Positioning
  x,
  baseY,
  clef,
  xShift = 0,
  dotShift = 0,
  // Appearance
  isSelected = false,
  isGhost = false,
  accidentalGlyph = null,
  color: overrideColor = null,
  // Interaction handlers (optional for interactive notes)
  handlers = null
  // { onMouseEnter, onMouseLeave, onMouseDown, onDoubleClick }
}) => {
  const { theme } = useTheme();
  const effectivePitch = pitch || (note == null ? void 0 : note.pitch);
  if (!effectivePitch) return null;
  const noteX = x + xShift;
  const noteY = baseY + getOffsetForPitch(effectivePitch, clef);
  const color = overrideColor || (isGhost ? theme.accent : isSelected ? theme.accent : theme.score.note);
  const relativeY = noteY - baseY;
  const dotY = relativeY % 12 === 0 ? noteY - 6 : noteY;
  const dotX = noteX + dotShift + LAYOUT.DOT_OFFSET_X;
  const accidentalX = noteX + LAYOUT.ACCIDENTAL.OFFSET_X;
  const accidentalY = noteY + LAYOUT.ACCIDENTAL.OFFSET_Y;
  const hitX = noteX + LAYOUT.HIT_AREA.OFFSET_X;
  const hitY = noteY + LAYOUT.HIT_AREA.OFFSET_Y;
  const noteId = (note == null ? void 0 : note.id) || "note";
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "g",
    {
      className: !isGhost ? "note-group-container" : "",
      onMouseEnter: () => {
        var _a;
        return (_a = handlers == null ? void 0 : handlers.onMouseEnter) == null ? void 0 : _a.call(handlers, note == null ? void 0 : note.id);
      },
      onMouseLeave: handlers == null ? void 0 : handlers.onMouseLeave,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(LedgerLines, { x: noteX, y: noteY, baseY, color }),
        /* @__PURE__ */ jsxRuntime.jsx(Accidental, { x: accidentalX, y: accidentalY, symbol: accidentalGlyph, color }),
        /* @__PURE__ */ jsxRuntime.jsx("g", { style: { pointerEvents: "none" }, children: /* @__PURE__ */ jsxRuntime.jsx(NoteHead, { x: noteX, y: noteY, duration, color }) }),
        dotted && /* @__PURE__ */ jsxRuntime.jsx(Dot, { x: dotX, y: dotY, color }),
        handlers && /* @__PURE__ */ jsxRuntime.jsx(
          HitArea,
          {
            x: hitX,
            y: hitY,
            cursor: !isGhost ? "pointer" : "default",
            onClick: (e) => !isGhost && e.stopPropagation(),
            onMouseDown: (e) => {
              var _a;
              return (_a = handlers.onMouseDown) == null ? void 0 : _a.call(handlers, e, note);
            },
            onDoubleClick: (e) => {
              var _a;
              return (_a = handlers.onDoubleClick) == null ? void 0 : _a.call(handlers, e, note);
            },
            testId: `note-${noteId}`
          }
        )
      ]
    }
  );
});
var Note_default = Note5;

// src/components/Canvas/Stem.tsx
init_constants();
var Stem = ({ x, startY, endY, color }) => /* @__PURE__ */ jsxRuntime.jsx(
  "line",
  {
    x1: x,
    y1: startY,
    x2: x,
    y2: endY,
    stroke: color,
    strokeWidth: LAYOUT.LINE_STROKE_WIDTH
  }
);
var Stem_default = Stem;

// src/components/Canvas/Flags.tsx
init_config();
init_SMuFL();
var getFlagGlyph = (duration, direction) => {
  if (direction === "up") {
    switch (duration) {
      case "eighth":
        return FLAGS.eighthUp;
      case "sixteenth":
        return FLAGS.sixteenthUp;
      case "thirtysecond":
        return FLAGS.thirtysecondUp;
      case "sixtyfourth":
        return FLAGS.sixtyfourthUp;
      default:
        return null;
    }
  } else {
    switch (duration) {
      case "eighth":
        return FLAGS.eighthDown;
      case "sixteenth":
        return FLAGS.sixteenthDown;
      case "thirtysecond":
        return FLAGS.thirtysecondDown;
      case "sixtyfourth":
        return FLAGS.sixtyfourthDown;
      default:
        return null;
    }
  }
};
var Flags = ({ stemX, stemTipY, duration, direction, color }) => {
  const glyph = getFlagGlyph(duration, direction);
  if (!glyph) return null;
  const fontSize = getFontSize(CONFIG.lineHeight);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: stemX - 0.75,
      y: stemTipY,
      fontFamily: BRAVURA_FONT,
      fontSize,
      fill: color,
      textAnchor: "start",
      style: { userSelect: "none" },
      children: glyph
    }
  );
};
var Flags_default = Flags;
var ChordGroup = ({
  // Data
  notes,
  quant,
  duration,
  dotted,
  measureIndex,
  eventId,
  chordLayout,
  beamSpec = null,
  // Appearance & Options
  isGhost = false,
  opacity = 1,
  renderStem = true,
  x = 0,
  filterNote = null,
  accidentalOverrides = null,
  // Contexts
  layout,
  interaction,
  onNoteHover = null
}) => {
  var _a;
  const { theme } = useTheme();
  const { baseY, clef, keySignature, staffIndex } = layout;
  const { selection, onDragStart, onSelectNote, isDragging } = interaction;
  const [hoveredNoteId, setHoveredNoteId] = React3.useState(null);
  const { sortedNotes, direction, noteOffsets, maxNoteShift, minY, maxY } = chordLayout;
  const effectiveDirection = (beamSpec == null ? void 0 : beamSpec.direction) || direction;
  const stemX = React3.useMemo(
    () => x + getStemOffset(chordLayout, effectiveDirection),
    [x, chordLayout, effectiveDirection]
  );
  const { startY: stemStartY, endY: stemEndY } = React3.useMemo(
    () => calculateStemGeometry({ beamSpec, stemX, direction: effectiveDirection, minY, maxY, duration }),
    [beamSpec, stemX, effectiveDirection, minY, maxY, duration]
  );
  const isWholeChordSelected = !isGhost && areAllNotesSelected(selection, staffIndex, measureIndex, eventId, notes);
  const isAnyNoteHovered = !isGhost && !isDragging && hoveredNoteId !== null;
  const groupColor = isGhost || isWholeChordSelected || isAnyNoteHovered ? theme.accent : theme.score.note;
  const notesToRender = React3.useMemo(() => {
    if (!filterNote) return sortedNotes;
    return typeof filterNote === "function" ? sortedNotes.filter(filterNote) : sortedNotes.filter((n) => n.pitch === filterNote);
  }, [sortedNotes, filterNote]);
  const handlers = React3.useMemo(() => ({
    onMouseEnter: (id) => {
      if (isGhost) return;
      setHoveredNoteId(id);
      onNoteHover == null ? void 0 : onNoteHover(true);
    },
    onMouseLeave: () => {
      setHoveredNoteId(null);
      onNoteHover == null ? void 0 : onNoteHover(false);
    },
    onMouseDown: (e, note) => {
      if (isGhost || !onDragStart) return;
      e.stopPropagation();
      const isModifier = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      onDragStart({
        measureIndex,
        eventId,
        noteId: note.id,
        startPitch: note.pitch,
        startY: e.clientY,
        isMulti: isModifier,
        isShift,
        selectAllInEvent: !isModifier && !isShift,
        staffIndex
      });
    },
    onDoubleClick: (e, note) => {
      if (isGhost || !onSelectNote) return;
      e.stopPropagation();
      onSelectNote(measureIndex, eventId, note.id, staffIndex, false, false);
    }
  }), [isGhost, onDragStart, onSelectNote, onNoteHover, measureIndex, eventId, staffIndex]);
  const handleGroupClick = React3.useCallback((e) => {
    var _a2;
    if (isGhost || !onDragStart) return;
    e.stopPropagation();
    const isModifier = e.metaKey || e.ctrlKey;
    onDragStart({
      measureIndex,
      eventId,
      noteId: (_a2 = notes[0]) == null ? void 0 : _a2.id,
      startPitch: null,
      startY: e.clientY,
      isMulti: isModifier,
      selectAllInEvent: !isModifier,
      staffIndex
    });
  }, [isGhost, onDragStart, measureIndex, eventId, staffIndex, notes]);
  const showStem = renderStem && ((_a = NOTE_TYPES[duration]) == null ? void 0 : _a.stem);
  const showFlags = renderStem && !beamSpec && ["eighth", "sixteenth", "thirtysecond", "sixtyfourth"].includes(duration);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "g",
    {
      className: `chord-group ${isGhost ? "opacity-50" : ""}`,
      "data-testid": isGhost ? "ghost-note" : `chord-${eventId}`,
      "data-selected": isWholeChordSelected,
      style: { opacity },
      onMouseEnter: () => onNoteHover == null ? void 0 : onNoteHover(true),
      onMouseLeave: () => onNoteHover == null ? void 0 : onNoteHover(false),
      onClick: handleGroupClick,
      children: [
        showStem && /* @__PURE__ */ jsxRuntime.jsx(Stem_default, { x: stemX, startY: stemStartY, endY: stemEndY, color: groupColor }),
        showFlags && /* @__PURE__ */ jsxRuntime.jsx(
          Flags_default,
          {
            stemX,
            stemTipY: stemEndY,
            duration,
            direction: effectiveDirection,
            color: groupColor
          }
        ),
        notesToRender.map((note) => {
          const accidentalGlyph = getAccidentalGlyph(
            note.pitch,
            keySignature,
            accidentalOverrides == null ? void 0 : accidentalOverrides[note.id]
          );
          const isSelected = isNoteSelected(selection, {
            staffIndex,
            measureIndex,
            eventId,
            noteId: note.id
          });
          return /* @__PURE__ */ jsxRuntime.jsx(
            Note_default,
            {
              note,
              duration,
              dotted,
              x,
              baseY,
              clef,
              xShift: noteOffsets[note.id] || 0,
              dotShift: maxNoteShift,
              isSelected: isSelected || isAnyNoteHovered,
              isGhost,
              accidentalGlyph,
              color: groupColor,
              handlers
            },
            note.id
          );
        })
      ]
    }
  );
};
var ChordGroup_default = ChordGroup;

// src/components/Canvas/Rest.tsx
init_config();
init_SMuFL();
var getRestY = (duration, baseY) => {
  const lineHeight = CONFIG.lineHeight;
  const staffMiddle = baseY + lineHeight * 2;
  switch (duration) {
    case "whole":
      return baseY + lineHeight;
    case "half":
      return baseY + lineHeight * 2;
    default:
      return staffMiddle;
  }
};
var Rest = ({
  duration,
  dotted = false,
  x = 0,
  baseY = CONFIG.baseY,
  isSelected = false,
  isGhost = false,
  onClick,
  eventId
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React3.useState(false);
  const glyph = REST_GLYPHS[duration];
  if (!glyph) {
    console.warn(`Unknown rest duration: ${duration}`);
    return null;
  }
  const showHighlight = isGhost || isSelected || isHovered && onClick;
  const color = showHighlight ? theme.accent : theme.score.note;
  const finalX = x > 0 ? x : CONFIG.measurePaddingLeft;
  const restY = getRestY(duration, baseY);
  const fontSize = getFontSize(CONFIG.lineHeight);
  const hitAreaWidth = 30;
  const staffHeight = CONFIG.lineHeight * 4;
  const hitAreaTop = baseY;
  const hitAreaHeight = staffHeight;
  const renderDot = () => {
    if (!dotted) return null;
    const dotX = finalX + fontSize * 0.4;
    const dotY = restY - CONFIG.lineHeight / 2;
    return /* @__PURE__ */ jsxRuntime.jsx(
      "text",
      {
        x: dotX,
        y: dotY,
        fontFamily: BRAVURA_FONT,
        fontSize,
        textAnchor: "start",
        fill: color,
        style: { userSelect: "none" },
        children: DOTS.augmentationDot
      }
    );
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "g",
    {
      className: "Rest rest-group",
      "data-selected": isSelected,
      "data-testid": eventId ? `rest-${eventId}` : void 0,
      style: { opacity: isGhost ? 0.5 : 1 },
      children: [
        onClick && /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            x: finalX - hitAreaWidth / 2,
            y: hitAreaTop,
            width: hitAreaWidth,
            height: hitAreaHeight,
            fill: "white",
            fillOpacity: 0.01,
            style: { cursor: "pointer" },
            onClick,
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false)
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          {
            x: finalX,
            y: restY,
            fontFamily: BRAVURA_FONT,
            fontSize,
            textAnchor: "middle",
            fill: color,
            style: { userSelect: "none", pointerEvents: "none" },
            children: glyph
          }
        ),
        renderDot()
      ]
    }
  );
};

// src/components/Canvas/GhostPreview.tsx
init_constants();
var GhostPreview = ({
  previewRender,
  previewNote,
  baseY,
  layout,
  interaction,
  measureIndex
}) => {
  var _a;
  const { chordNotes, quant, x, chordLayout } = previewRender;
  if (previewNote == null ? void 0 : previewNote.isRest) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Rest,
      {
        duration: previewNote.duration,
        dotted: previewNote.dotted,
        x,
        baseY,
        isGhost: true
      }
    );
  }
  const shouldDrawStem = ((_a = NOTE_TYPES[previewNote.duration]) == null ? void 0 : _a.stem) && previewNote.mode !== "CHORD";
  return /* @__PURE__ */ jsxRuntime.jsx(
    ChordGroup_default,
    {
      notes: chordNotes,
      quant,
      duration: previewNote.duration,
      dotted: previewNote.dotted,
      eventId: "preview",
      x,
      chordLayout,
      isGhost: true,
      layout,
      interaction,
      measureIndex,
      opacity: 0.5,
      renderStem: shouldDrawStem
    }
  );
};
var GhostPreview_default = GhostPreview;

// src/components/Canvas/Beam.tsx
init_constants();
var Beam = ({ beam, color }) => {
  const { startX, endX, startY, endY, type, direction } = beam;
  const { theme } = useTheme();
  BEAMING.THICKNESS;
  BEAMING.SPACING;
  const renderBeam = (y1, y2, key, thickness = 5) => {
    const halfWidth = thickness / 2;
    const points = [
      `${startX},${y1 - halfWidth}`,
      `${endX},${y2 - halfWidth}`,
      `${endX},${y2 + halfWidth}`,
      `${startX},${y1 + halfWidth}`
    ].join(" ");
    return /* @__PURE__ */ jsxRuntime.jsx("polygon", { points, fill: color || theme.score.note }, key);
  };
  const paths = [];
  paths.push(renderBeam(startY, endY, "primary", BEAMING.THICKNESS));
  const beamSpacing = BEAMING.SPACING;
  const innerBeamThickness = BEAMING.THICKNESS;
  const addBeam = (index) => {
    const offset = direction === "up" ? index * beamSpacing : -(index * beamSpacing);
    paths.push(renderBeam(startY + offset, endY + offset, `beam-${index}`, innerBeamThickness));
  };
  if (["sixteenth", "thirtysecond", "sixtyfourth"].includes(type)) {
    addBeam(1);
  }
  if (["thirtysecond", "sixtyfourth"].includes(type)) {
    addBeam(2);
  }
  if (type === "sixtyfourth") {
    addBeam(3);
  }
  return /* @__PURE__ */ jsxRuntime.jsx("g", { className: "beam-group", children: paths });
};
var Beam_default = Beam;

// src/components/Canvas/TupletBracket.tsx
init_constants();
var TupletBracket = ({
  startX,
  endX,
  startY,
  endY,
  number,
  direction
}) => {
  const { theme } = useTheme();
  const bracketHeight = TUPLET.HOOK_HEIGHT;
  const numberFontSize = TUPLET.NUMBER_FONT_SIZE;
  const hookLength = direction === "up" ? bracketHeight : -bracketHeight;
  const path = `
    M ${startX} ${startY + hookLength}
    L ${startX} ${startY}
    L ${endX} ${endY}
    L ${endX} ${endY + hookLength}
  `;
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;
  const textY = direction === "up" ? centerY + TUPLET.NUMBER_OFFSET_UP : centerY + TUPLET.NUMBER_OFFSET_DOWN;
  return /* @__PURE__ */ jsxRuntime.jsxs("g", { className: "tuplet-bracket", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: path,
        stroke: theme.score.note,
        strokeWidth: "1",
        fill: "none"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "text",
      {
        x: centerX,
        y: textY,
        textAnchor: "middle",
        fontSize: numberFontSize,
        fontWeight: "bold",
        fontStyle: "italic",
        fill: theme.score.note,
        children: number
      }
    )
  ] });
};
var TupletBracket_default = TupletBracket;
var StaffLines = ({ width, theme, baseY }) => /* @__PURE__ */ jsxRuntime.jsx("g", { className: "staff-lines", style: { pointerEvents: "none" }, children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntime.jsx(
  "line",
  {
    x1: 0,
    y1: baseY + i * CONFIG.lineHeight,
    x2: width,
    y2: baseY + i * CONFIG.lineHeight,
    stroke: theme.score.line,
    strokeWidth: 1
  },
  `staff-${i}`
)) });
var MeasureBarLine = ({ x, baseY, isLast, theme }) => /* @__PURE__ */ jsxRuntime.jsx(
  "line",
  {
    x1: x,
    y1: baseY,
    x2: x,
    y2: baseY + CONFIG.lineHeight * 4,
    stroke: theme.score.line,
    strokeWidth: isLast ? 3 : 1
  }
);
var Measure2 = ({
  measureData,
  measureIndex,
  startX,
  isLast,
  forcedWidth,
  forcedEventPositions,
  layout,
  interaction
}) => {
  const { theme } = useTheme();
  const { events } = measureData;
  const { scale, baseY, clef, keySignature } = layout;
  const { selection, previewNote, activeDuration, onAddNote, onHover } = interaction;
  const {
    hitZones,
    eventPositions,
    totalWidth,
    effectiveWidth,
    centeredEvents,
    beamGroups,
    tupletGroups
  } = useMeasureLayout(events, clef, measureData.isPickup, forcedEventPositions, forcedWidth);
  const accidentalOverrides = useAccidentalContext(events, keySignature);
  const {
    handleMeasureMouseMove,
    handleMeasureMouseLeave,
    handleMeasureClick,
    cursorStyle,
    isNoteHovered,
    setIsNoteHovered
  } = useMeasureInteraction({
    hitZones,
    clef,
    scale,
    measureIndex,
    isLast,
    activeDuration,
    previewNote,
    selection,
    onHover,
    onAddNote
  });
  const previewRender = usePreviewRender({
    previewNote,
    events,
    measureIndex,
    isLast,
    clef,
    hitZones,
    eventPositions,
    totalWidth,
    selectedNotes: selection.selectedNotes
  });
  const beamMap = React3.useMemo(() => {
    const map = {};
    beamGroups.forEach((group) => {
      group.ids.forEach((id) => {
        map[id] = group;
      });
    });
    return map;
  }, [beamGroups]);
  return /* @__PURE__ */ jsxRuntime.jsxs("g", { className: "Measure", transform: `translate(${startX}, 0)`, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "rect",
      {
        "data-testid": `measure-hit-area-${layout.staffIndex}-${measureIndex}`,
        x: 0,
        y: baseY - 50,
        width: effectiveWidth,
        height: CONFIG.lineHeight * 12,
        fill: "transparent",
        style: { cursor: cursorStyle },
        onClick: handleMeasureClick,
        onMouseMove: handleMeasureMouseMove,
        onMouseLeave: handleMeasureMouseLeave
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(StaffLines, { width: effectiveWidth, theme, baseY }),
    centeredEvents.map((event) => {
      if (event.isRest) {
        const isPlaceholder = event.id === "rest-placeholder";
        const isSelected = isRestSelected(selection, event, measureIndex, layout.staffIndex);
        return /* @__PURE__ */ jsxRuntime.jsx(
          Rest,
          __spreadProps(__spreadValues({}, event), {
            baseY,
            isSelected,
            eventId: event.id,
            onClick: isPlaceholder ? void 0 : (e) => {
              e.stopPropagation();
              interaction.onSelectNote(
                measureIndex,
                event.id,
                getFirstNoteId(event),
                layout.staffIndex,
                e.metaKey || e.ctrlKey
              );
            }
          }),
          event.id
        );
      }
      return /* @__PURE__ */ jsxRuntime.jsx(
        ChordGroup_default,
        __spreadProps(__spreadValues({}, event), {
          eventId: event.id,
          beamSpec: beamMap[event.id],
          layout,
          interaction,
          measureIndex,
          onNoteHover: setIsNoteHovered,
          accidentalOverrides,
          isGhost: false
        }),
        event.id
      );
    }),
    beamGroups.map((beam, idx) => /* @__PURE__ */ jsxRuntime.jsx(
      Beam_default,
      {
        beam,
        color: isBeamGroupSelected(selection, beam, events, measureIndex) ? theme.accent : theme.score.note
      },
      `beam-${idx}`
    )),
    tupletGroups.map((tuplet, idx) => /* @__PURE__ */ jsxRuntime.jsx(
      TupletBracket_default,
      {
        group: tuplet,
        baseY,
        staffHeight: CONFIG.lineHeight * 4,
        theme
      },
      `tuplet-${idx}`
    )),
    /* @__PURE__ */ jsxRuntime.jsx(
      MeasureBarLine,
      {
        x: effectiveWidth,
        baseY,
        isLast,
        theme
      }
    ),
    previewRender && !isNoteHovered && previewNote && /* @__PURE__ */ jsxRuntime.jsx("g", { style: { pointerEvents: "none" }, children: /* @__PURE__ */ jsxRuntime.jsx(
      GhostPreview_default,
      {
        previewRender,
        previewNote,
        baseY,
        layout,
        interaction,
        measureIndex
      }
    ) })
  ] });
};
var Measure_default = Measure2;

// src/components/Canvas/Tie.tsx
init_constants();
var Tie = ({ startX, startY, endX, endY, direction, color = "black" }) => {
  const dirMult = direction === "up" ? -1 : 1;
  const sX = startX + TIE.START_GAP;
  const eX = endX - TIE.END_GAP;
  const sY = startY + TIE.VERTICAL_OFFSET * dirMult;
  const eY = endY + TIE.VERTICAL_OFFSET * dirMult;
  const width = eX - sX;
  if (width <= 0) return null;
  const height = Math.min(25, Math.max(12, width * 0.2));
  const midThickness = TIE.MID_THICKNESS;
  const tipThickness = TIE.TIP_THICKNESS;
  const cpX = sX + width / 2;
  const cpY_Outer = sY + height * dirMult;
  const cpY_Inner = sY + (height - midThickness) * dirMult;
  const P1_Inner_Y = sY;
  const P1_Outer_Y = sY + tipThickness * dirMult;
  const P2_Inner_Y = eY;
  const P2_Outer_Y = eY + tipThickness * dirMult;
  const path = `
    M ${sX} ${P1_Inner_Y}
    L ${sX} ${P1_Outer_Y}
    Q ${cpX} ${cpY_Outer} ${eX} ${P2_Outer_Y}
    L ${eX} ${P2_Inner_Y}
    Q ${cpX} ${cpY_Inner} ${sX} ${P1_Inner_Y}
    Z
  `;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: path,
      fill: color,
      stroke: "none"
    }
  );
};
var Tie_default = Tie;

// src/components/Canvas/ScoreHeader.tsx
init_constants();
init_config();
init_layout();
init_SMuFL();
var ScoreHeader = ({
  clef,
  keySignature,
  timeSignature,
  baseY = CONFIG.baseY,
  onClefClick,
  onKeySigClick,
  onTimeSigClick
}) => {
  var _a;
  const { theme } = useTheme();
  const headerLayout = calculateHeaderLayout(keySignature);
  const { keySigStartX, keySigVisualWidth, timeSigStartX, startOfMeasures } = headerLayout;
  const { KEY_SIG_ACCIDENTAL_WIDTH, TIME_SIG_WIDTH } = HEADER_CONSTANTS;
  const CLEF_WIDTH = 40;
  return /* @__PURE__ */ jsxRuntime.jsxs("g", { className: "ScoreHeader", children: [
    [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 0, y1: baseY + i * CONFIG.lineHeight, x2: startOfMeasures, y2: baseY + i * CONFIG.lineHeight, stroke: theme.score.line, strokeWidth: "1" }, `staff-head-${i}`)),
    /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 0, y1: baseY, x2: 0, y2: baseY + CONFIG.lineHeight * 4, stroke: theme.secondaryText, strokeWidth: "1" }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "g",
      {
        onClick: onClefClick,
        style: { cursor: "pointer" },
        "data-testid": `clef-${clef}`,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "-5", y: baseY - 25, width: CLEF_WIDTH, height: "100", fill: "transparent" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "text",
            {
              x: 12,
              y: clef === "treble" ? baseY + CONFIG.lineHeight * 3 : baseY + CONFIG.lineHeight,
              fontFamily: BRAVURA_FONT,
              fontSize: getFontSize(CONFIG.lineHeight),
              fill: theme.score.fill,
              textAnchor: "start",
              children: clef === "treble" ? CLEFS.gClef : CLEFS.fClef
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "g",
      {
        onClick: onKeySigClick,
        style: { cursor: "pointer", userSelect: "none" },
        "data-testid": `keysig-${keySignature}`,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("rect", { x: keySigStartX, y: baseY - 20, width: Math.max(20, keySigVisualWidth), height: "80", fill: "transparent" }),
          (_a = KEY_SIGNATURES[keySignature]) == null ? void 0 : _a.accidentals.map((acc, i) => {
            const type = KEY_SIGNATURES[keySignature].type;
            const validClef = clef in KEY_SIGNATURE_OFFSETS ? clef : "treble";
            const offset = KEY_SIGNATURE_OFFSETS[validClef][type][acc];
            const x = keySigStartX + 5 + i * KEY_SIG_ACCIDENTAL_WIDTH;
            const y = baseY + offset;
            return /* @__PURE__ */ jsxRuntime.jsx(
              "text",
              {
                x,
                y,
                fontSize: getFontSize(CONFIG.lineHeight),
                fontFamily: BRAVURA_FONT,
                fill: theme.score.fill,
                children: type === "sharp" ? ACCIDENTALS.sharp : ACCIDENTALS.flat
              },
              i
            );
          })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "g",
      {
        onClick: onTimeSigClick,
        style: { cursor: "pointer", userSelect: "none" },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("rect", { x: timeSigStartX, y: baseY, width: TIME_SIG_WIDTH, height: "48", fill: "transparent" }),
          /* @__PURE__ */ jsxRuntime.jsx("text", { x: timeSigStartX + 15, y: baseY + CONFIG.lineHeight, fontSize: getFontSize(CONFIG.lineHeight), fontFamily: BRAVURA_FONT, textAnchor: "middle", fill: theme.text, children: TIME_SIG_DIGITS[timeSignature.split("/")[0]] }),
          /* @__PURE__ */ jsxRuntime.jsx("text", { x: timeSigStartX + 15, y: baseY + CONFIG.lineHeight * 3, fontSize: getFontSize(CONFIG.lineHeight), fontFamily: BRAVURA_FONT, textAnchor: "middle", fill: theme.text, children: TIME_SIG_DIGITS[timeSignature.split("/")[1]] })
        ]
      }
    )
  ] });
};
var ScoreHeader_default = ScoreHeader;
var Staff3 = ({
  staffIndex,
  clef,
  keySignature,
  timeSignature,
  measures,
  baseY = CONFIG.baseY,
  measureLayouts,
  scale,
  interaction,
  playbackPosition,
  hidePlaybackCursor = false,
  onClefClick,
  onKeySigClick,
  onTimeSigClick
}) => {
  const { theme } = useTheme();
  const verticalOffset = baseY - CONFIG.baseY;
  const { startOfMeasures } = calculateHeaderLayout(keySignature);
  let currentX = startOfMeasures;
  const measureComponents = measures.map((measure, index) => {
    const layoutData = measureLayouts == null ? void 0 : measureLayouts[index];
    const width = layoutData ? layoutData.width : calculateMeasureWidth(measure.events, measure.isPickup);
    const forcedPositions = layoutData == null ? void 0 : layoutData.forcedPositions;
    const staffPreviewNote = interaction.previewNote && interaction.previewNote.staffIndex === staffIndex ? interaction.previewNote : null;
    const scopedInteraction = __spreadProps(__spreadValues({}, interaction), {
      previewNote: staffPreviewNote
    });
    const component = /* @__PURE__ */ jsxRuntime.jsx(
      Measure_default,
      {
        startX: currentX,
        measureIndex: index,
        measureData: measure,
        isLast: index === measures.length - 1,
        forcedWidth: width,
        forcedEventPositions: forcedPositions,
        layout: {
          scale,
          baseY: CONFIG.baseY,
          clef,
          keySignature,
          staffIndex,
          verticalOffset
        },
        interaction: scopedInteraction
      },
      measure.id
    );
    currentX += width;
    return component;
  });
  const renderTies = () => {
    const ties = [];
    const { startOfMeasures: tieStartX } = calculateHeaderLayout(keySignature);
    let currentMeasureX = tieStartX;
    const allNotes = [];
    measures.forEach((measure, mIndex) => {
      const layout = calculateMeasureLayout(measure.events, void 0, clef, false);
      measure.events.forEach((event, eIndex) => {
        const eventX = currentMeasureX + layout.eventPositions[event.id];
        event.notes.forEach((note, nIndex) => {
          allNotes.push({
            measureIndex: mIndex,
            eventIndex: eIndex,
            noteIndex: nIndex,
            pitch: note.pitch,
            tied: note.tied,
            x: eventX,
            y: CONFIG.baseY + getOffsetForPitch(note.pitch, clef),
            // Use CONFIG.baseY for normalized coords
            id: note.id
          });
        });
      });
      currentMeasureX += layout.totalWidth;
    });
    allNotes.forEach((note) => {
      var _a, _b;
      if (note.tied) {
        let nextNote = null;
        const eventId = (_b = (_a = measures[note.measureIndex]) == null ? void 0 : _a.events[note.eventIndex]) == null ? void 0 : _b.id;
        const isSelected = isNoteSelected(interaction.selection, {
          staffIndex,
          // Staff prop
          measureIndex: note.measureIndex,
          eventId,
          noteId: note.id
        });
        const tieColor = isSelected ? theme.accent : theme.score.note;
        let targetMIndex = note.measureIndex;
        let targetEIndex = note.eventIndex + 1;
        if (targetEIndex >= measures[targetMIndex].events.length) {
          targetMIndex++;
          targetEIndex = 0;
        }
        if (targetMIndex < measures.length && targetEIndex < measures[targetMIndex].events.length) {
          nextNote = allNotes.find(
            (n) => n.measureIndex === targetMIndex && n.eventIndex === targetEIndex && n.pitch === note.pitch
          );
        }
        const direction = getOffsetForPitch(note.pitch, clef) > 24 ? "down" : "up";
        if (nextNote) {
          ties.push(
            /* @__PURE__ */ jsxRuntime.jsx(
              Tie_default,
              {
                startX: note.x + 10,
                startY: note.y,
                endX: nextNote.x,
                endY: nextNote.y,
                direction,
                color: tieColor
              },
              `tie-${note.id}`
            )
          );
        } else {
          ties.push(
            /* @__PURE__ */ jsxRuntime.jsx(
              Tie_default,
              {
                startX: note.x + 10,
                startY: note.y,
                endX: note.x + 35,
                endY: note.y,
                direction,
                color: tieColor
              },
              `tie-hanging-${note.id}`
            )
          );
        }
      }
    });
    return ties;
  };
  const playbackCursorX = React3__default.default.useMemo(() => {
    if (playbackPosition.measureIndex === null || playbackPosition.quant === null) {
      return null;
    }
    const { startOfMeasures: cursorStartX } = calculateHeaderLayout(keySignature);
    let absX = cursorStartX;
    for (let i = 0; i < playbackPosition.measureIndex; i++) {
      if (measures[i]) {
        absX += calculateMeasureWidth(measures[i].events, measures[i].isPickup);
      }
    }
    const measure = measures[playbackPosition.measureIndex];
    if (measure) {
      const layout = calculateMeasureLayout(measure.events, void 0, clef, false);
      const targetQuant = playbackPosition.quant;
      const targetEvent = layout.processedEvents.find((e) => {
        const dur = getNoteDuration(e.duration, e.dotted, e.tuplet);
        return e.quant <= targetQuant && e.quant + dur > targetQuant;
      });
      if (targetEvent) {
        absX += targetEvent.x;
      } else {
        absX += CONFIG.measurePaddingLeft;
      }
    }
    return absX;
  }, [playbackPosition, measures, keySignature, clef]);
  return /* @__PURE__ */ jsxRuntime.jsxs("g", { className: "staff", transform: `translate(0, ${verticalOffset})`, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ScoreHeader_default,
      {
        clef,
        keySignature,
        timeSignature,
        baseY: CONFIG.baseY,
        onClefClick: (e) => {
          e.stopPropagation();
          if (onClefClick) onClefClick();
        },
        onKeySigClick: (e) => {
          e.stopPropagation();
          if (onKeySigClick) onKeySigClick();
        },
        onTimeSigClick: (e) => {
          e.stopPropagation();
          if (onTimeSigClick) onTimeSigClick();
        }
      }
    ),
    measureComponents,
    renderTies(),
    !hidePlaybackCursor && playbackCursorX !== null && /* @__PURE__ */ jsxRuntime.jsx(
      "g",
      {
        style: {
          transform: `translateX(${playbackCursorX}px)`,
          transition: `transform ${playbackPosition.duration || 0.1}s linear`,
          pointerEvents: "none"
        },
        children: /* @__PURE__ */ jsxRuntime.jsx(
          "line",
          {
            x1: 0,
            y1: CONFIG.baseY - 20,
            x2: 0,
            y2: CONFIG.baseY + CONFIG.lineHeight * 4 + 20,
            stroke: theme.accent,
            strokeWidth: "3",
            opacity: "0.8"
          }
        )
      }
    )
  ] });
};
var calculateStaffWidth = (measures, keySignature) => {
  const { startOfMeasures } = calculateHeaderLayout(keySignature);
  let width = startOfMeasures;
  measures.forEach((measure) => {
    width += calculateMeasureWidth(measure.events, measure.isPickup);
  });
  return width + 50;
};
var Staff_default = Staff3;

// src/hooks/useAutoScroll.ts
init_config();
init_layout();
init_core();
var useAutoScroll = ({
  containerRef,
  score,
  selection,
  playbackPosition,
  previewNote,
  scale
}) => {
  const activeStaff = getActiveStaff(score);
  const keySignature = score.keySignature || activeStaff.keySignature || "C";
  const clef = score.staves.length >= 2 ? "grand" : activeStaff.clef || "treble";
  React3.useEffect(() => {
    if (!containerRef.current) return;
    let targetX = null;
    let targetMeasureIndex = null;
    if (selection.measureIndex !== null && selection.eventId) {
      targetMeasureIndex = selection.measureIndex;
    } else if (previewNote) {
      targetMeasureIndex = previewNote.measureIndex;
    }
    if (targetMeasureIndex !== null) {
      const { startOfMeasures } = calculateHeaderLayout(keySignature);
      let currentMeasureX = startOfMeasures;
      for (let i = 0; i < targetMeasureIndex; i++) {
        if (getActiveStaff(score).measures[i]) {
          currentMeasureX += calculateMeasureWidth(getActiveStaff(score).measures[i].events, getActiveStaff(score).measures[i].isPickup);
        }
      }
      const measure = getActiveStaff(score).measures[targetMeasureIndex];
      if (measure) {
        const layout = calculateMeasureLayout(measure.events, void 0, clef);
        if (selection.measureIndex !== null) {
          targetX = currentMeasureX + (layout.eventPositions[selection.eventId] || 0);
        } else if (previewNote) {
          if (previewNote.mode === "APPEND") {
            targetX = currentMeasureX + layout.totalWidth - CONFIG.measurePaddingRight;
          } else if (previewNote.mode === "INSERT") {
            if (previewNote.index !== void 0 && previewNote.index > 0 && previewNote.index <= measure.events.length) {
              const prevEvent = measure.events[previewNote.index - 1];
              const prevX = layout.eventPositions[prevEvent.id];
              targetX = currentMeasureX + prevX + 30;
            } else {
              targetX = currentMeasureX + CONFIG.measurePaddingLeft;
            }
          } else {
            if (previewNote.index !== null && previewNote.index !== void 0) {
              const event = measure.events[previewNote.index];
              if (event) {
                targetX = currentMeasureX + (layout.eventPositions[event.id] || 0);
              }
            }
          }
        }
      }
    }
    if (targetX !== null) {
      const container = containerRef.current;
      const { scrollLeft, clientWidth } = container;
      const scaledX = targetX * scale;
      const padding = 100;
      if (scaledX > scrollLeft + clientWidth - padding) {
        container.scrollTo({
          left: scaledX - clientWidth + padding + 200,
          behavior: "smooth"
        });
      } else if (scaledX < scrollLeft + padding) {
        container.scrollTo({
          left: Math.max(0, scaledX - padding - 100),
          behavior: "smooth"
        });
      }
    }
  }, [selection, score, scale, keySignature, clef, previewNote, containerRef]);
  React3.useEffect(() => {
    if (!containerRef.current || playbackPosition.measureIndex === null || playbackPosition.quant === null) return;
    const container = containerRef.current;
    const { scrollLeft, clientWidth } = container;
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    let absX = startOfMeasures;
    const currentActiveStaff = getActiveStaff(score);
    const measures = currentActiveStaff.measures || [];
    for (let i = 0; i < playbackPosition.measureIndex; i++) {
      if (measures[i]) {
        absX += calculateMeasureWidth(measures[i].events, measures[i].isPickup);
      }
    }
    const measure = measures[playbackPosition.measureIndex];
    if (measure) {
      const layout = calculateMeasureLayout(measure.events, void 0, clef);
      let currentQuant = 0;
      for (const event of measure.events) {
        if (currentQuant >= playbackPosition.quant) {
          absX += layout.eventPositions[event.id] || CONFIG.measurePaddingLeft;
          break;
        }
        currentQuant += getNoteDuration(event.duration, event.dotted, event.tuplet);
      }
      if (currentQuant < playbackPosition.quant) {
        absX += layout.totalWidth - CONFIG.measurePaddingRight;
      }
    }
    const scaledX = absX * scale;
    const padding = 150;
    if (scaledX > scrollLeft + clientWidth - padding) {
      container.scrollTo({
        left: scaledX - clientWidth / 2,
        behavior: "smooth"
      });
    } else if (scaledX < scrollLeft + padding) {
      container.scrollTo({
        left: Math.max(0, scaledX - clientWidth / 2),
        behavior: "smooth"
      });
    }
  }, [playbackPosition, score, scale, keySignature, clef, containerRef]);
};

// src/hooks/useGrandStaffLayout.ts
init_config();
init_layout();
var useGrandStaffLayout = ({
  score,
  playbackPosition,
  activeStaff,
  keySignature,
  clef
}) => {
  var _a, _b, _c;
  const synchronizedLayoutData = React3.useMemo(() => {
    var _a2;
    if (!score.staves || score.staves.length <= 1) return void 0;
    const maxMeasures = Math.max(...score.staves.map((s) => {
      var _a3;
      return ((_a3 = s.measures) == null ? void 0 : _a3.length) || 0;
    }));
    const layouts = [];
    for (let i = 0; i < maxMeasures; i++) {
      const measuresAtIndices = score.staves.map((staff) => {
        var _a3;
        return (_a3 = staff.measures) == null ? void 0 : _a3[i];
      }).filter(Boolean);
      if (measuresAtIndices.length > 0) {
        const forcedPositions = calculateSystemLayout(measuresAtIndices);
        const maxX = Math.max(...Object.values(forcedPositions));
        const isPickup = (_a2 = measuresAtIndices[0]) == null ? void 0 : _a2.isPickup;
        const minDuration = isPickup ? "quarter" : "whole";
        const minWidth = getNoteWidth(minDuration, false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
        const width = Math.max(maxX + CONFIG.measurePaddingRight, minWidth);
        layouts.push({ width, forcedPositions });
      } else {
        const minWidth = getNoteWidth("whole", false) + CONFIG.measurePaddingLeft + CONFIG.measurePaddingRight;
        layouts.push({ width: minWidth, forcedPositions: {} });
      }
    }
    return layouts;
  }, [score.staves]);
  const numStaves = ((_a = score.staves) == null ? void 0 : _a.length) || 1;
  const isGrandStaff = numStaves > 1;
  const unifiedCursor = React3.useMemo(() => {
    var _a2;
    if (!isGrandStaff) return null;
    if (playbackPosition.measureIndex === null || playbackPosition.quant === null) return null;
    const referenceStaff = (_a2 = score.staves) == null ? void 0 : _a2[0];
    if (!referenceStaff) return null;
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    let cursorX = startOfMeasures;
    let cursorWidth = 0;
    if (synchronizedLayoutData) {
      for (let i = 0; i < playbackPosition.measureIndex; i++) {
        if (synchronizedLayoutData[i]) {
          cursorX += synchronizedLayoutData[i].width;
        }
      }
    } else {
      for (let i = 0; i < playbackPosition.measureIndex; i++) {
        if (referenceStaff.measures && referenceStaff.measures[i]) {
          cursorX += calculateMeasureWidth(referenceStaff.measures[i].events, referenceStaff.measures[i].isPickup);
        }
      }
    }
    const currentMeasureIndex = playbackPosition.measureIndex;
    const currentQuant = playbackPosition.quant;
    if (synchronizedLayoutData && synchronizedLayoutData[currentMeasureIndex]) {
      const forcedPositions = synchronizedLayoutData[currentMeasureIndex].forcedPositions;
      if (forcedPositions && currentQuant in forcedPositions) {
        cursorX += forcedPositions[currentQuant];
        const sortedQuants = Object.keys(forcedPositions).map(Number).sort((a, b) => a - b);
        const idx = sortedQuants.indexOf(currentQuant);
        if (idx !== -1 && idx < sortedQuants.length - 1) {
          const nextQuant = sortedQuants[idx + 1];
          const nextX = forcedPositions[nextQuant];
          cursorWidth = nextX - forcedPositions[currentQuant];
        } else {
          const measureWidth = synchronizedLayoutData[currentMeasureIndex].width;
          cursorWidth = measureWidth - forcedPositions[currentQuant];
          cursorWidth = Math.max(cursorWidth, 20);
        }
      } else {
        cursorWidth = 20;
      }
    }
    return { x: cursorX, width: cursorWidth };
  }, [isGrandStaff, playbackPosition, score.staves, keySignature, synchronizedLayoutData, clef]);
  return {
    synchronizedLayoutData,
    unifiedCursorX: (_b = unifiedCursor == null ? void 0 : unifiedCursor.x) != null ? _b : null,
    unifiedCursorWidth: (_c = unifiedCursor == null ? void 0 : unifiedCursor.width) != null ? _c : 0,
    isGrandStaff,
    numStaves
  };
};
var useDragToSelect = ({
  svgRef,
  notePositions,
  onSelectionComplete,
  scale,
  enabled = true
}) => {
  const [dragState, setDragState] = React3.useState({
    isDragging: false,
    startPoint: null,
    currentPoint: null,
    isAdditive: false
  });
  const [justFinishedDrag, setJustFinishedDrag] = React3.useState(false);
  const selectionRect = dragState.isDragging && dragState.startPoint && dragState.currentPoint ? {
    x: Math.min(dragState.startPoint.x, dragState.currentPoint.x),
    y: Math.min(dragState.startPoint.y, dragState.currentPoint.y),
    width: Math.abs(dragState.currentPoint.x - dragState.startPoint.x),
    height: Math.abs(dragState.currentPoint.y - dragState.startPoint.y)
  } : null;
  const noteIntersectsRect = React3.useCallback((note, rect) => {
    const noteRight = note.x + note.width;
    const noteBottom = note.y + note.height;
    const rectRight = rect.x + rect.width;
    const rectBottom = rect.y + rect.height;
    return !(note.x > rectRight || noteRight < rect.x || note.y > rectBottom || noteBottom < rect.y);
  }, []);
  const getSelectedNotes = React3.useCallback(() => {
    if (!selectionRect) return [];
    return notePositions.filter((note) => noteIntersectsRect(note, selectionRect)).map((note) => ({
      staffIndex: note.staffIndex,
      measureIndex: note.measureIndex,
      eventId: note.eventId,
      noteId: note.noteId
    }));
  }, [selectionRect, notePositions, noteIntersectsRect]);
  const handleMouseDown = React3.useCallback((e) => {
    if (!enabled) return;
    const target = e.target;
    if (target.closest("[data-note-hit-area]") || target.closest("[data-interactive]")) {
      return;
    }
    const svgElement = svgRef.current;
    if (!svgElement) return;
    const rect = svgElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setDragState({
      isDragging: true,
      startPoint: { x, y },
      currentPoint: { x, y },
      isAdditive: e.metaKey || e.ctrlKey
    });
    e.preventDefault();
  }, [enabled, svgRef, scale]);
  React3.useEffect(() => {
    if (!dragState.isDragging) return;
    const handleMouseMove = (e) => {
      const svgElement = svgRef.current;
      if (!svgElement) return;
      const rect = svgElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      setDragState((prev) => __spreadProps(__spreadValues({}, prev), {
        currentPoint: { x, y }
      }));
    };
    const handleMouseUp = () => {
      const selectedNotes = getSelectedNotes();
      const hasMoved = dragState.startPoint && dragState.currentPoint && (Math.abs(dragState.currentPoint.x - dragState.startPoint.x) > 5 || Math.abs(dragState.currentPoint.y - dragState.startPoint.y) > 5);
      if (hasMoved && selectedNotes.length > 0) {
        onSelectionComplete(selectedNotes, dragState.isAdditive);
        setJustFinishedDrag(true);
        setTimeout(() => setJustFinishedDrag(false), 50);
      }
      setDragState({
        isDragging: false,
        startPoint: null,
        currentPoint: null,
        isAdditive: false
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState.isDragging, dragState.isAdditive, getSelectedNotes, onSelectionComplete, svgRef, scale]);
  return {
    isDragging: dragState.isDragging,
    justFinishedDrag,
    selectionRect,
    handleMouseDown
  };
};
var GrandStaffBracket = ({ topY, bottomY, x = 0 }) => {
  const { theme } = useTheme();
  const height = bottomY - topY;
  if (height <= 0) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: `translate(${x}, 0)`, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "svg",
      {
        x: 0,
        y: topY,
        width: 13,
        height,
        viewBox: "0 0 13 159",
        preserveAspectRatio: "none",
        overflow: "visible",
        children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            fillRule: "evenodd",
            clipRule: "evenodd",
            d: "M11.1337 0.00122854C10.6545 0.0294863 10.1459 0.537114 9.27963 1.78379C7.52747 4.10559 5.01383 9.54316 4.00961 12.3786C2.50364 18.3271 2.00972 25.5609 2.51171 32.5444C2.75767 34.8636 3.25184 40.0279 4.00961 44.1631C5.25979 53.9925 5.51663 58.1278 5.51663 62.2629C5.2606 68.9819 3.51492 74.4037 0.748947 78.0226C0.246709 78.5389 0 79.0561 0 79.3207C0 79.5853 0.246709 80.1025 0.748947 80.6188C3.51492 84.2377 5.2606 89.6552 5.51663 96.1225C5.51663 100.509 5.25979 104.639 4.00961 114.204C3.25184 118.604 2.75767 123.773 2.51171 125.841C2.00972 133.076 2.50364 140.314 4.00961 145.998C5.25979 150.649 9.78239 158.668 11.0424 158.668C11.5444 158.668 12.0471 158.144 12.0471 157.625C12.0471 157.363 11.5444 156.596 11.0424 155.816C8.03022 151.429 6.76757 147.031 6.26558 140.312C6.26558 136.177 6.52243 132.296 7.77261 122.477C8.27459 118.606 8.77725 113.954 9.03303 112.138C10.0373 99.7353 8.03443 89.1381 3.01405 81.3866C2.25603 80.3516 1.75363 79.3207 1.75363 79.3207C1.75363 79.3207 2.25603 78.2807 3.01405 77.2456C8.03443 69.4942 10.0373 58.8965 9.03303 46.229C8.77725 44.6777 8.27459 40.0318 7.77261 35.8993C6.52243 26.3423 6.26558 22.4556 6.26558 18.3205C6.76757 11.6015 8.03022 7.20354 11.0424 2.81676C12.0464 1.26543 12.3025 0.755146 11.8005 0.238904C11.5636 0.0767645 11.3516 -0.0116103 11.1337 0.00122854Z",
            fill: theme.secondaryText
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "line",
      {
        x1: 20,
        y1: topY,
        x2: 20,
        y2: bottomY,
        stroke: theme.secondaryText,
        strokeWidth: "1"
      }
    )
  ] });
};
var GrandStaffBracket_default = GrandStaffBracket;

// src/components/Canvas/ScoreCanvas.tsx
init_constants();
var ScoreCanvas = ({
  scale,
  playbackPosition = { measureIndex: null, quant: null, duration: 0 },
  onKeySigClick,
  onTimeSigClick,
  onClefClick,
  containerRef,
  onHoverChange,
  onBackgroundClick
}) => {
  var _a, _b;
  const { theme } = useTheme();
  const {
    score,
    selection,
    setSelection,
    handleNoteSelection,
    addNoteToMeasure,
    activeDuration,
    isDotted,
    previewNote,
    setPreviewNote,
    handleMeasureHover,
    scoreRef,
    updateNotePitch
  } = useScoreContext();
  const [modifierHeld, setModifierHeld] = React3.useState(false);
  React3.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) setModifierHeld(true);
    };
    const handleKeyUp = (e) => {
      if (!e.metaKey && !e.ctrlKey) setModifierHeld(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  const { dragState, handleDragStart } = useScoreInteraction({
    scoreRef,
    selection,
    onUpdatePitch: (m, e, n, p) => updateNotePitch(m, e, n, p),
    onSelectNote: (measureIndex, eventId, noteId, staffIndexParam, isMulti, selectAllInEvent, isShift) => {
      if (measureIndex !== null && eventId !== null) {
        const targetStaff = staffIndexParam !== void 0 ? staffIndexParam : 0;
        handleNoteSelection(measureIndex, eventId, noteId, targetStaff, isMulti, selectAllInEvent, isShift);
      }
      setPreviewNote(null);
    }
  });
  const activeStaff = getActiveStaff(score);
  const keySignature = score.keySignature || activeStaff.keySignature || "C";
  const timeSignature = score.timeSignature || "4/4";
  const clef = score.staves.length >= 2 ? "grand" : activeStaff.clef || "treble";
  useAutoScroll({
    containerRef,
    score,
    selection,
    playbackPosition,
    previewNote,
    scale
  });
  const { synchronizedLayoutData, unifiedCursorX, unifiedCursorWidth, isGrandStaff, numStaves } = useGrandStaffLayout({
    score,
    playbackPosition,
    activeStaff,
    keySignature,
    clef
  });
  const cursorRef = React3.useRef(null);
  React3.useEffect(() => {
    if (cursorRef.current && unifiedCursorX !== null && unifiedCursorWidth !== void 0) {
      cursorRef.current.style.transition = "none";
      cursorRef.current.style.transform = `translateX(${unifiedCursorX}px)`;
      if (playbackPosition.duration > 0) {
        requestAnimationFrame(() => {
          if (!cursorRef.current) return;
          cursorRef.current.style.transition = `transform ${playbackPosition.duration}s linear`;
          cursorRef.current.style.transform = `translateX(${unifiedCursorX + unifiedCursorWidth}px)`;
        });
      }
    }
  }, [unifiedCursorX, unifiedCursorWidth, playbackPosition.duration]);
  const totalWidth = React3__default.default.useMemo(() => {
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    if (synchronizedLayoutData) {
      const measuresWidth = synchronizedLayoutData.reduce((sum, layout) => sum + layout.width, 0);
      return startOfMeasures + measuresWidth + 50;
    }
    return calculateStaffWidth(activeStaff.measures, keySignature);
  }, [synchronizedLayoutData, activeStaff.measures, keySignature]);
  const svgHeight = CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 50;
  const svgRef = React3.useRef(null);
  const notePositions = React3.useMemo(() => {
    const positions = [];
    const { startOfMeasures } = calculateHeaderLayout(keySignature);
    score.staves.forEach((staff, staffIdx) => {
      const staffBaseY = CONFIG.baseY + staffIdx * CONFIG.staffSpacing;
      const staffClef = staff.clef || (staffIdx === 0 ? "treble" : "bass");
      let measureX = startOfMeasures;
      staff.measures.forEach((measure, measureIdx) => {
        var _a2, _b2;
        const forcedPositions = (_a2 = synchronizedLayoutData == null ? void 0 : synchronizedLayoutData[measureIdx]) == null ? void 0 : _a2.forcedPositions;
        const { calculateMeasureLayout: calculateMeasureLayout3 } = (init_layout(), __toCommonJS(layout_exports));
        const layout = calculateMeasureLayout3(measure.events, void 0, staffClef, false, forcedPositions);
        measure.events.forEach((event) => {
          var _a3, _b3;
          const eventX = measureX + (((_a3 = layout.eventPositions) == null ? void 0 : _a3[event.id]) || 0);
          if (isRestEvent(event)) {
            if (event.id === "rest-placeholder") return;
            const restNoteId = getFirstNoteId(event);
            const staffHeight = CONFIG.lineHeight * 4;
            positions.push({
              x: eventX - 15,
              // Center with ~30px width
              y: staffBaseY,
              width: 30,
              height: staffHeight,
              staffIndex: staffIdx,
              measureIndex: measureIdx,
              eventId: event.id,
              noteId: restNoteId
              // Use the rest note ID for selection
            });
          } else {
            (_b3 = event.notes) == null ? void 0 : _b3.forEach((note) => {
              const noteY = staffBaseY + getOffsetForPitch(note.pitch, staffClef);
              positions.push({
                x: eventX - LAYOUT.NOTE_RX,
                // Center of ellipse minus radius
                y: noteY - LAYOUT.NOTE_RY,
                width: LAYOUT.NOTE_RX * 2,
                height: LAYOUT.NOTE_RY * 2,
                staffIndex: staffIdx,
                measureIndex: measureIdx,
                eventId: event.id,
                noteId: note.id
              });
            });
          }
        });
        measureX += layout.totalWidth || ((_b2 = synchronizedLayoutData == null ? void 0 : synchronizedLayoutData[measureIdx]) == null ? void 0 : _b2.width) || 0;
      });
    });
    return positions;
  }, [score.staves, synchronizedLayoutData, keySignature]);
  const { isDragging, justFinishedDrag, selectionRect, handleMouseDown: handleDragSelectMouseDown } = useDragToSelect({
    svgRef,
    notePositions,
    onSelectionComplete: (notes, isAdditive) => {
      if (notes.length === 0) return;
      if (isAdditive) {
        setSelection((prev) => __spreadProps(__spreadValues({}, prev), {
          selectedNotes: [
            ...prev.selectedNotes,
            ...notes.filter((n) => !prev.selectedNotes.some(
              (sn) => sn.noteId === n.noteId && sn.eventId === n.eventId
            ))
          ],
          // Update focus to first new note
          measureIndex: notes[0].measureIndex,
          eventId: notes[0].eventId,
          noteId: notes[0].noteId,
          staffIndex: notes[0].staffIndex
        }));
      } else {
        setSelection({
          staffIndex: notes[0].staffIndex,
          measureIndex: notes[0].measureIndex,
          eventId: notes[0].eventId,
          noteId: notes[0].noteId,
          selectedNotes: notes,
          anchor: {
            staffIndex: notes[0].staffIndex,
            measureIndex: notes[0].measureIndex,
            eventId: notes[0].eventId,
            noteId: notes[0].noteId
          }
        });
      }
    },
    scale
  });
  const handleBackgroundClick = (e) => {
    var _a2;
    if (isDragging || justFinishedDrag) return;
    onBackgroundClick == null ? void 0 : onBackgroundClick();
    setSelection(createDefaultSelection());
    (_a2 = containerRef.current) == null ? void 0 : _a2.focus();
  };
  const memoizedOnSelectNote = React3.useCallback((measureIndex, eventId, noteId, staffIndexParam, isMulti) => {
    if (eventId !== null && measureIndex !== null) {
      const targetStaff = staffIndexParam !== void 0 ? staffIndexParam : 0;
      handleNoteSelection(measureIndex, eventId, noteId, targetStaff, isMulti);
    }
  }, [handleNoteSelection]);
  const memoizedOnDragStart = React3.useCallback((args) => {
    handleDragStart(args);
  }, [handleDragStart]);
  const handleMeasureHoverRef = React3.useRef(handleMeasureHover);
  React3.useEffect(() => {
    handleMeasureHoverRef.current = handleMeasureHover;
  }, [handleMeasureHover]);
  const hoverHandlersRef = React3.useRef(/* @__PURE__ */ new Map());
  const getHoverHandler = React3.useCallback((staffIndex) => {
    if (!hoverHandlersRef.current.has(staffIndex)) {
      hoverHandlersRef.current.set(staffIndex, (measureIndex, hit, pitch) => {
        if (!dragState.active) {
          handleMeasureHoverRef.current(measureIndex, hit, pitch || "", staffIndex);
        }
      });
    }
    return hoverHandlersRef.current.get(staffIndex);
  }, [dragState.active]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: containerRef,
      "data-testid": "score-canvas-container",
      className: "ScoreCanvas overflow-x-auto relative outline-none z-10 pl-12 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600/50",
      style: { marginTop: "-30px", backgroundColor: theme.background },
      onClick: handleBackgroundClick,
      tabIndex: 0,
      onMouseEnter: () => onHoverChange(true),
      onMouseLeave: () => onHoverChange(false),
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "svg",
        {
          ref: svgRef,
          width: totalWidth * scale,
          height: svgHeight * scale,
          className: "ml-0 overflow-visible",
          onMouseDown: handleDragSelectMouseDown,
          children: /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: `scale(${scale})`, children: [
            ((_a = score.staves) == null ? void 0 : _a.length) > 1 && /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: (() => {
              const topY = CONFIG.baseY;
              const bottomY = CONFIG.baseY + (score.staves.length - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4;
              return /* @__PURE__ */ jsxRuntime.jsx(GrandStaffBracket_default, { topY, bottomY, x: -20 });
            })() }),
            (_b = score.staves) == null ? void 0 : _b.map((staff, staffIndex) => {
              const staffBaseY = CONFIG.baseY + staffIndex * CONFIG.staffSpacing;
              const interaction = {
                selection,
                // Always pass the real selection - isNoteSelected checks staffIndex per-note
                previewNote,
                // Global preview note (Staff filters it)
                activeDuration,
                isDotted,
                modifierHeld,
                isDragging: dragState.active,
                onAddNote: addNoteToMeasure,
                onSelectNote: memoizedOnSelectNote,
                onDragStart: memoizedOnDragStart,
                onHover: getHoverHandler(staffIndex)
              };
              return /* @__PURE__ */ jsxRuntime.jsx(
                Staff_default,
                {
                  staffIndex,
                  clef: staff.clef || (staffIndex === 0 ? "treble" : "bass"),
                  keySignature: staff.keySignature || keySignature,
                  timeSignature,
                  measures: staff.measures,
                  measureLayouts: synchronizedLayoutData,
                  baseY: staffBaseY,
                  scale,
                  interaction,
                  playbackPosition,
                  onClefClick,
                  onKeySigClick,
                  onTimeSigClick,
                  hidePlaybackCursor: isGrandStaff
                },
                staff.id || staffIndex
              );
            }),
            isGrandStaff && unifiedCursorX !== null && /* @__PURE__ */ jsxRuntime.jsxs(
              "g",
              {
                ref: cursorRef,
                style: {
                  transform: `translateX(${unifiedCursorX}px)`,
                  pointerEvents: "none"
                },
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "line",
                    {
                      x1: 0,
                      y1: CONFIG.baseY - 20,
                      x2: 0,
                      y2: CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 20,
                      stroke: theme.accent,
                      strokeWidth: "3",
                      opacity: "0.8"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: 0, cy: CONFIG.baseY - 20, r: "4", fill: theme.accent, opacity: "0.9" }),
                  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: 0, cy: CONFIG.baseY + (numStaves - 1) * CONFIG.staffSpacing + CONFIG.lineHeight * 4 + 20, r: "4", fill: theme.accent, opacity: "0.9" })
                ]
              }
            ),
            isDragging && selectionRect && /* @__PURE__ */ jsxRuntime.jsx(
              "rect",
              {
                x: selectionRect.x,
                y: selectionRect.y,
                width: selectionRect.width,
                height: selectionRect.height,
                fill: "rgba(59, 130, 246, 0.2)",
                stroke: "rgba(59, 130, 246, 0.8)",
                strokeWidth: "1",
                style: { pointerEvents: "none" }
              }
            )
          ] })
        }
      )
    }
  );
};
var ScoreCanvas_default = ScoreCanvas;
var ToolbarButton = React3__default.default.forwardRef(({
  icon,
  label,
  showLabel = false,
  isActive = false,
  onClick,
  className = "",
  disabled = false,
  title,
  preventFocus = false,
  isEmphasized = false,
  isDashed = false,
  height = "h-9",
  variant = "default"
}, ref) => {
  const { theme } = useTheme();
  const baseStyles = "flex items-center justify-center rounded border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeStyles = showLabel ? "min-w-9 px-3" : "w-9";
  const borderStyle = isDashed ? "border-dashed" : "border-solid";
  const [isHovered, setIsHovered] = React3__default.default.useState(false);
  const isGhost = variant === "ghost";
  const getBackgroundColor = () => {
    if (isActive) return theme.accent;
    if (isHovered) return theme.buttonHoverBackground;
    if (isGhost) return "transparent";
    if (isEmphasized) return theme.buttonBackground;
    return theme.buttonBackground;
  };
  const getBorderColor = () => {
    if (isActive) return theme.accent;
    if (isEmphasized) return theme.accent;
    if (isDashed) return theme.secondaryText;
    if (isGhost && !isHovered) return "transparent";
    return theme.border;
  };
  const getColor = () => {
    if (isActive) return "#ffffff";
    if (isEmphasized) return theme.accent;
    return theme.secondaryText;
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      ref,
      onClick,
      onMouseEnter: () => !disabled && setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onMouseDown: (e) => {
        if (preventFocus) {
          e.preventDefault();
        }
      },
      disabled,
      className: `
        ${baseStyles}
        ${height}
        ${sizeStyles}
        ${borderStyle}
        ${className}
      `,
      style: {
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
        color: getColor()
      },
      title: title || label,
      "aria-label": label,
      children: [
        icon && /* @__PURE__ */ jsxRuntime.jsx("span", { className: showLabel ? "mr-2" : "", children: icon }),
        showLabel ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-bold uppercase tracking-wide", children: label }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: label })
      ]
    }
  );
});
ToolbarButton.displayName = "ToolbarButton";
var ToolbarButton_default = ToolbarButton;
var InstrumentSelector = ({
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  height = "h-9",
  variant = "default"
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = React3.useState(false);
  const [isHovered, setIsHovered] = React3.useState(false);
  const containerRef = React3.useRef(null);
  const options = [
    { id: "bright", name: "Bright Synth" },
    { id: "mellow", name: "Mellow Synth" },
    { id: "organ", name: "Organ Synth" },
    {
      id: "piano",
      name: samplerLoaded ? "Piano Samples" : "Piano (Loading...)",
      loading: !samplerLoaded
    }
  ];
  const selectedOption = options.find((o) => o.id === selectedInstrument) || options[0];
  React3.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  const handleSelect = (id) => {
    onInstrumentChange(id);
    setInstrument(id);
    setIsOpen(false);
  };
  const isGhost = variant === "ghost";
  const borderColor = isOpen ? theme.accent : isGhost && !isHovered ? "transparent" : theme.border;
  const bgColor = isGhost && !isHovered && !isOpen ? "transparent" : theme.buttonBackground;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: containerRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        className: `flex items-center gap-1.5 px-3 ${height} rounded border text-xs font-medium transition-colors`,
        style: {
          backgroundColor: bgColor,
          borderColor,
          color: theme.secondaryText
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Volume2, { size: 12 }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "max-w-24 truncate", children: selectedOption.name }),
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { size: 12, className: `transition-transform ${isOpen ? "rotate-180" : ""}` })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "absolute top-full left-0 mt-1 w-44 rounded border shadow-lg z-50",
        style: {
          backgroundColor: theme.panelBackground,
          borderColor: theme.border
        },
        children: options.map((option) => /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: () => handleSelect(option.id),
            className: `w-full px-3 py-2 text-left text-xs font-medium transition-colors flex items-center justify-between ${option.id === selectedInstrument ? "opacity-100" : "opacity-70 hover:opacity-100"}`,
            style: {
              backgroundColor: option.id === selectedInstrument ? theme.buttonHoverBackground : "transparent",
              color: theme.text
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: option.name }),
              option.id === selectedInstrument && /* @__PURE__ */ jsxRuntime.jsx("span", { style: { color: theme.accent }, children: "\u2713" })
            ]
          },
          option.id
        ))
      }
    )
  ] });
};
var InstrumentSelector_default = InstrumentSelector;
function useFocusTrap({
  containerRef,
  isActive,
  onEscape,
  returnFocusRef,
  autoFocus = true,
  enableArrowKeys = false
}) {
  const getFocusableElements = React3.useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, [containerRef]);
  React3.useEffect(() => {
    if (!isActive) return;
    if (autoFocus) {
      const timer = setTimeout(() => {
        const elements = getFocusableElements();
        if (elements.length > 0) {
          elements[0].focus();
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isActive, autoFocus, getFocusableElements]);
  React3.useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e) => {
      var _a;
      if (!((_a = containerRef.current) == null ? void 0 : _a.contains(document.activeElement))) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onEscape == null ? void 0 : onEscape();
        return;
      }
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      const activeElement = document.activeElement;
      const currentIndex = focusableElements.indexOf(activeElement);
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
          const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          focusableElements[prevIndex].focus();
        } else {
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
        }
      } else if (enableArrowKeys && ["ArrowDown", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
      } else if (enableArrowKeys && ["ArrowUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        focusableElements[prevIndex].focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (returnFocusRef == null ? void 0 : returnFocusRef.current) {
        returnFocusRef.current.focus();
      }
    };
  }, [isActive, onEscape, containerRef, returnFocusRef, enableArrowKeys, getFocusableElements]);
}
var Portal = ({ children }) => {
  const [mounted, setMounted] = React3.useState(false);
  React3.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return mounted ? reactDom.createPortal(children, document.body) : null;
};
var Portal_default = Portal;
var DropdownOverlay = ({
  onClose,
  triggerRef,
  position,
  children,
  width = "auto",
  maxHeight = "auto",
  className = ""
}) => {
  const ref = React3.useRef(null);
  const { theme } = useTheme();
  useFocusTrap({
    containerRef: ref,
    isActive: true,
    onEscape: onClose,
    returnFocusRef: triggerRef,
    autoFocus: true,
    enableArrowKeys: true
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(Portal_default, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "fixed inset-0 z-40 bg-transparent",
        onClick: (e) => {
          e.stopPropagation();
          onClose();
        },
        "aria-hidden": "true"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ref,
        className: `fixed z-50 rounded-lg shadow-xl border overflow-hidden backdrop-blur-md ${className}`,
        style: __spreadProps(__spreadValues({
          left: position.x,
          top: position.y
        }, width !== "auto" && { width }), {
          maxHeight,
          backgroundColor: theme.panelBackground,
          borderColor: theme.border,
          color: theme.text
        }),
        role: "menu",
        "aria-modal": "true",
        children: [
          children,
          /* @__PURE__ */ jsxRuntime.jsx("style", { children: `
          .dropdown-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .dropdown-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .dropdown-scroll::-webkit-scrollbar-thumb {
            background-color: ${theme.border};
            border-radius: 3px;
          }
          .dropdown-scroll::-webkit-scrollbar-thumb:hover {
            background-color: ${theme.secondaryText};
          }
        ` })
        ]
      }
    )
  ] });
};
var DropdownOverlay_default = DropdownOverlay;

// src/exporters/jsonExporter.ts
var generateJSON = (score) => {
  return JSON.stringify(score, null, 2);
};

// src/exporters/abcExporter.ts
init_constants();
init_core();
var toAbcPitch = (pitch, clef = "treble") => {
  const match = pitch.match(/^([A-G])(#{1,2}|b{1,2})?(\d+)$/);
  if (!match) return "C";
  const letter = match[1];
  const octave = parseInt(match[3], 10);
  let abcPitch = "";
  if (octave >= 5) {
    abcPitch = letter.toLowerCase();
    if (octave > 5) {
      abcPitch += "'".repeat(octave - 5);
    }
  } else {
    abcPitch = letter.toUpperCase();
    if (octave < 4) {
      abcPitch += ",".repeat(4 - octave);
    }
  }
  return abcPitch;
};
var generateABC = (score, bpm) => {
  const staves = score.staves || [getActiveStaff(score)];
  const timeSig = score.timeSignature || "4/4";
  const keySig = score.keySignature || "C";
  let abc = `X:1
T:${score.title}
M:${timeSig}
L:1/4
K:${keySig}
Q:1/4=${bpm}
`;
  if (staves.length > 1) {
    abc += `%%staves {${staves.map((_, i) => i + 1).join(" ")}}
`;
  }
  staves.forEach((staff, staffIndex) => {
    const clef = staff.clef || "treble";
    const abcClef = clef === "bass" ? "bass" : "treble";
    const voiceId = staffIndex + 1;
    abc += `V:${voiceId} clef=${abcClef}
`;
    staff.measures.forEach((measure, i) => {
      measure.events.forEach((event) => {
        var _a;
        let durationString = "";
        const base = ((_a = NOTE_TYPES[event.duration]) == null ? void 0 : _a.abcDuration) || "";
        if (event.dotted) {
          switch (event.duration) {
            case "whole":
              durationString = "6";
              break;
            case "half":
              durationString = "3";
              break;
            case "quarter":
              durationString = "3/2";
              break;
            case "eighth":
              durationString = "3/4";
              break;
            case "sixteenth":
              durationString = "3/8";
              break;
            case "thirtysecond":
              durationString = "3/16";
              break;
            case "sixtyfourth":
              durationString = "3/32";
              break;
            default:
              durationString = base;
          }
        } else {
          durationString = base;
        }
        let prefix = "";
        if (event.tuplet && event.tuplet.position === 0) {
          prefix += `(${event.tuplet.ratio[0]}`;
        }
        if (isRestEvent(event)) {
          abc += `${prefix}z${durationString} `;
        } else {
          const formatNote = (n) => {
            let acc = "";
            if (n.accidental === "sharp") acc = "^";
            else if (n.accidental === "flat") acc = "_";
            else if (n.accidental === "natural") acc = "=";
            else if (n.accidental === "double-sharp") acc = "^^";
            else if (n.accidental === "double-flat") acc = "__";
            if (!acc) {
              if (n.pitch.includes("##")) acc = "^^";
              else if (n.pitch.includes("#")) acc = "^";
              else if (n.pitch.includes("bb")) acc = "__";
              else if (n.pitch.includes("b")) acc = "_";
            }
            const pitch = toAbcPitch(n.pitch, clef);
            const tie = n.tied ? "-" : "";
            return `${acc}${pitch}${tie}`;
          };
          if (event.notes.length > 1) {
            const chordContent = event.notes.map(formatNote).join("");
            abc += `${prefix}[${chordContent}]${durationString} `;
          } else {
            const noteContent = formatNote(event.notes[0]);
            abc += `${prefix}${noteContent}${durationString} `;
          }
        }
      });
      abc += "| ";
      if ((i + 1) % 4 === 0) abc += "\n";
    });
    abc += "\n";
  });
  return abc;
};

// src/exporters/musicXmlExporter.ts
init_constants();
init_core();
var generateMusicXML = (score) => {
  const staves = score.staves || [getActiveStaff(score)];
  const timeSig = score.timeSignature || "4/4";
  const keySigData = KEY_SIGNATURES[score.keySignature || "C"];
  let fifths = 0;
  if (keySigData) {
    fifths = keySigData.type === "sharp" ? keySigData.count : -keySigData.count;
  }
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>`;
  staves.forEach((_, index) => {
    const id = index + 1;
    xml += `
    <score-part id="P${id}">
      <part-name>Staff ${id}</part-name>
    </score-part>`;
  });
  xml += `
  </part-list>`;
  staves.forEach((staff, staffIndex) => {
    const partId = `P${staffIndex + 1}`;
    const clef = staff.clef || "treble";
    const clefSign = clef === "bass" ? "F" : "G";
    const clefLine = clef === "bass" ? "4" : "2";
    const activeTies = /* @__PURE__ */ new Set();
    xml += `
  <part id="${partId}">`;
    staff.measures.forEach((measure, mIndex) => {
      xml += `
    <measure number="${mIndex + 1}">`;
      if (mIndex === 0) {
        xml += `
    <attributes>
      <divisions>16</divisions>
      <key>
        <fifths>${fifths}</fifths>
      </key>
      <time>
        <beats>${timeSig.split("/")[0]}</beats>
        <beat-type>${timeSig.split("/")[1]}</beat-type>
      </time>
      <clef>
        <sign>${clefSign}</sign>
        <line>${clefLine}</line>
      </clef>
    </attributes>`;
      }
      measure.events.forEach((event) => {
        let duration = NOTE_TYPES[event.duration].duration;
        if (event.dotted) duration = duration * 1.5;
        if (event.tuplet) {
          duration = Math.floor(duration * event.tuplet.ratio[1] / event.tuplet.ratio[0]);
        }
        const xmlType = NOTE_TYPES[event.duration].xmlType;
        if (isRestEvent(event)) {
          xml += `
    <note>
      <rest/>
      <duration>${duration}</duration>
      <type>${xmlType}</type>
      ${event.dotted ? "<dot/>" : ""}
    </note>`;
        } else {
          event.notes.forEach((note, nIndex) => {
            const isChord = nIndex > 0;
            const step = note.pitch.charAt(0);
            const octave = note.pitch.slice(-1);
            let accidentalTag = "";
            if (note.accidental) {
              const acc = note.accidental === "natural" ? "natural" : note.accidental === "sharp" ? "sharp" : note.accidental === "flat" ? "flat" : "";
              if (acc) accidentalTag = `<accidental>${acc}</accidental>`;
            }
            let tieTags = "";
            let tiedNotations = "";
            const pitchKey = note.pitch;
            if (activeTies.has(pitchKey)) {
              tieTags += '<tie type="stop"/>';
              tiedNotations += '<tied type="stop"/>';
            }
            if (note.tied) {
              tieTags += '<tie type="start"/>';
              tiedNotations += '<tied type="start"/>';
              activeTies.add(pitchKey);
            } else {
              if (activeTies.has(pitchKey)) {
                activeTies.delete(pitchKey);
              }
            }
            if (tiedNotations) {
              tiedNotations = `<notations>${tiedNotations}</notations>`;
            }
            let timeModTag = "";
            let tupletNotations = "";
            if (event.tuplet) {
              timeModTag = `
      <time-modification>
        <actual-notes>${event.tuplet.groupSize}</actual-notes>
        <normal-notes>${event.tuplet.ratio[1]}</normal-notes>
      </time-modification>`;
              if (event.tuplet.position === 0) {
                const tupTag = '<tuplet type="start" bracket="yes"/>';
                if (tiedNotations) {
                  tupletNotations = tupTag;
                } else {
                  tupletNotations = `<notations>${tupTag}</notations>`;
                }
              } else if (event.tuplet.position === event.tuplet.groupSize - 1) {
                const tupTag = '<tuplet type="stop"/>';
                if (tiedNotations) {
                  tupletNotations = tupTag;
                } else {
                  tupletNotations = `<notations>${tupTag}</notations>`;
                }
              }
            }
            let finalNotations = tiedNotations;
            if (tupletNotations) {
              if (finalNotations) {
                const content = tupletNotations.replace("<notations>", "").replace("</notations>", "");
                finalNotations = finalNotations.replace("</notations>", `${content}</notations>`);
              } else {
                finalNotations = tupletNotations;
              }
            }
            xml += `
    <note>
      ${isChord ? "<chord/>" : ""}
      <pitch>
        <step>${step}</step>
        <octave>${octave}</octave>
      </pitch>
      <duration>${duration}</duration>
      <type>${xmlType}</type>
      ${accidentalTag}
      ${timeModTag}
      ${event.dotted ? "<dot/>" : ""}
      ${tieTags}
      ${finalNotations}
    </note>`;
          });
        }
      });
      xml += `
    </measure>`;
    });
    xml += `
  </part>`;
  });
  xml += `
</score-partwise>`;
  return xml;
};

// src/hooks/useExport.ts
var getFileInfo = (format, title) => {
  const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_") || "untitled";
  switch (format) {
    case "json":
      return { filename: `${safeTitle}.json`, mimeType: "application/json", extension: ".json" };
    case "abc":
      return { filename: `${safeTitle}.abc`, mimeType: "text/plain", extension: ".abc" };
    case "musicxml":
      return { filename: `${safeTitle}.musicxml`, mimeType: "application/vnd.recordare.musicxml+xml", extension: ".musicxml" };
  }
};
function useExport(score, bpm) {
  const generate = React3.useCallback((format) => {
    switch (format) {
      case "json":
        return generateJSON(score);
      case "abc":
        return generateABC(score, bpm);
      case "musicxml":
        return generateMusicXML(score);
    }
  }, [score, bpm]);
  const copyToClipboard = React3.useCallback(async (format) => {
    const content = generate(format);
    await navigator.clipboard.writeText(content);
  }, [generate]);
  const downloadFile = React3.useCallback(async (format) => {
    const content = generate(format);
    const { filename, mimeType } = getFileInfo(format, score.title);
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [generate, score.title]);
  return { copyToClipboard, downloadFile };
}
var ExportButton = ({
  onClick,
  icon,
  successIcon = /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { size: 14 }),
  label,
  isSuccess = false
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React3.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      onClick,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      className: "p-1.5 rounded transition-colors",
      style: {
        backgroundColor: isSuccess ? "transparent" : isHovered ? theme.buttonHoverBackground : theme.buttonBackground,
        color: isSuccess ? "#4ade80" : theme.text,
        borderColor: theme.border
      },
      title: label,
      children: isSuccess ? successIcon : icon
    }
  );
};
var ExportRow = ({
  label,
  icon,
  format,
  onCopy,
  onDownload,
  feedback
}) => {
  const { theme } = useTheme();
  const isCopied = feedback === `${format}-copy`;
  const isDownloaded = feedback === `${format}-download`;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "flex items-center justify-between px-4 py-2 border-b last:border-b-0",
      style: { borderColor: theme.border },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 text-sm", style: { color: theme.text }, children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { style: { color: theme.secondaryText }, children: icon }),
          label
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ExportButton,
            {
              onClick: () => onCopy(format),
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { size: 14 }),
              label: "Copy to clipboard",
              isSuccess: isCopied
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ExportButton,
            {
              onClick: () => onDownload(format),
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Download, { size: 14 }),
              label: "Download file",
              isSuccess: isDownloaded
            }
          )
        ] })
      ]
    }
  );
};
var FileMenu = ({ score, bpm, height = "h-9", variant = "default" }) => {
  var _a, _b;
  const [isOpen, setIsOpen] = React3.useState(false);
  const [feedback, setFeedback] = React3.useState(null);
  const buttonRef = React3.useRef(null);
  const { theme } = useTheme();
  const { copyToClipboard, downloadFile } = useExport(score, bpm);
  const handleAction = async (format, action) => {
    try {
      if (action === "copy") {
        await copyToClipboard(format);
      } else {
        await downloadFile(format);
      }
      setFeedback(`${format}-${action}`);
      setTimeout(() => {
        setFeedback(null);
        setIsOpen(false);
      }, 1e3);
    } catch (error) {
      console.error(`Export failed:`, error);
    }
  };
  const handleClose = () => {
    setIsOpen(false);
    setFeedback(null);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        ref: buttonRef,
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Menu, { size: 18 }),
        label: "File Menu",
        onClick: () => setIsOpen(!isOpen),
        isActive: isOpen,
        preventFocus: true,
        height,
        variant
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntime.jsxs(
      DropdownOverlay_default,
      {
        onClose: handleClose,
        triggerRef: buttonRef,
        position: {
          x: ((_a = buttonRef.current) == null ? void 0 : _a.getBoundingClientRect().left) || 0,
          y: (((_b = buttonRef.current) == null ? void 0 : _b.getBoundingClientRect().bottom) || 0) + 5
        },
        width: 220,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "px-4 py-2 border-b",
              style: {
                backgroundColor: theme.buttonHoverBackground,
                borderColor: theme.border
              },
              children: /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-semibold text-sm", style: { color: theme.text }, children: "Export" })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ExportRow,
            {
              label: "JSON",
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileJson, { size: 14 }),
              format: "json",
              onCopy: (f) => handleAction(f, "copy"),
              onDownload: (f) => handleAction(f, "download"),
              feedback
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ExportRow,
            {
              label: "ABC Notation",
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Music, { size: 14 }),
              format: "abc",
              onCopy: (f) => handleAction(f, "copy"),
              onDownload: (f) => handleAction(f, "download"),
              feedback
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ExportRow,
            {
              label: "MusicXML",
              icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileCode, { size: 14 }),
              format: "musicxml",
              onCopy: (f) => handleAction(f, "copy"),
              onDownload: (f) => handleAction(f, "download"),
              feedback
            }
          )
        ]
      }
    )
  ] });
};
var FileMenu_default = FileMenu;
var MainControls = ({
  scoreTitle,
  isEditingTitle,
  onEditingChange,
  onTitleChange,
  isPlaying,
  onPlayToggle,
  bpm,
  onBpmChange,
  midiStatus,
  onToggleHelp,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  score,
  children,
  rowHeight = "h-9",
  buttonVariant = "default"
}) => {
  const { theme } = useTheme();
  const titleInputRef = React3.useRef(null);
  const [titleBuffer, setTitleBuffer] = React3.useState("");
  const [bpmBuffer, setBpmBuffer] = React3.useState(String(bpm));
  const [isFocused, setIsFocused] = React3.useState(false);
  const [isBpmHovered, setIsBpmHovered] = React3.useState(false);
  const [isMidiHovered, setIsMidiHovered] = React3.useState(false);
  React3.useEffect(() => {
    setBpmBuffer(String(bpm));
  }, [bpm]);
  React3.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      setTitleBuffer(scoreTitle);
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle, scoreTitle]);
  const handleBpmBlur = () => {
    setIsFocused(false);
    const value = Number(bpmBuffer);
    if (!bpmBuffer || isNaN(value) || value <= 0) {
      setBpmBuffer("120");
      onBpmChange(120);
    } else {
      const clamped = Math.max(1, Math.min(300, value));
      setBpmBuffer(String(clamped));
      onBpmChange(clamped);
    }
  };
  const isGhost = buttonVariant === "ghost";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(FileMenu_default, { score, bpm, height: rowHeight, variant: buttonVariant }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarButton_default,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RotateCcw, { size: 18 }),
          label: "Undo",
          onClick: onUndo,
          disabled: !canUndo,
          height: rowHeight,
          variant: buttonVariant
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarButton_default,
        {
          icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RotateCw, { size: 18 }),
          label: "Redo",
          onClick: onRedo,
          disabled: !canRedo,
          height: rowHeight,
          variant: buttonVariant
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ToolbarButton_default,
        {
          icon: isPlaying ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Pause, { size: 14, fill: "currentColor" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Play, { size: 14, fill: "currentColor" }),
          label: isPlaying ? "Pause" : "Play",
          showLabel: true,
          onClick: onPlayToggle,
          isEmphasized: true,
          height: rowHeight,
          variant: buttonVariant
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: `flex items-center gap-0 px-2 rounded border ${rowHeight} transition-colors`,
          style: {
            borderColor: isFocused ? theme.accent : isGhost && !isBpmHovered ? "transparent" : theme.border,
            backgroundColor: isGhost && !isBpmHovered && !isFocused ? "transparent" : "transparent"
          },
          onMouseEnter: () => setIsBpmHovered(true),
          onMouseLeave: () => setIsBpmHovered(false),
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                className: "text-xs font-bold uppercase tracking-wider",
                style: { color: theme.secondaryText },
                children: "BPM"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "text",
                value: bpmBuffer,
                onChange: (e) => setBpmBuffer(e.target.value),
                onFocus: () => setIsFocused(true),
                onBlur: handleBpmBlur,
                className: "w-12 bg-transparent text-sm font-bold text-center outline-none",
                style: { color: theme.accent }
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: `flex items-center gap-1.5 px-3 ${rowHeight} rounded border text-xs font-medium ${midiStatus.connected ? "bg-[#0ac5b20f] border-[#507d7d] text-[#4f9e9e]" : "bg-slate-800/50 border-white/10 text-slate-400"}`,
        style: {
          borderColor: isGhost && !isMidiHovered && !midiStatus.connected ? "transparent" : midiStatus.connected ? "#507d7d" : isMidiHovered ? theme.border : isGhost ? "transparent" : theme.border,
          // Note: Keep MIDI status distinct if connected, otherwise follow ghost rules
          backgroundColor: isGhost && !midiStatus.connected ? "transparent" : void 0
        },
        onMouseEnter: () => setIsMidiHovered(true),
        onMouseLeave: () => setIsMidiHovered(false),
        title: midiStatus.connected ? `MIDI: ${midiStatus.deviceName}` : midiStatus.error || "No MIDI device connected",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Music2, { size: 12 }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: midiStatus.connected ? "MIDI" : "No MIDI" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      InstrumentSelector_default,
      {
        selectedInstrument,
        onInstrumentChange,
        samplerLoaded,
        height: rowHeight,
        variant: buttonVariant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1" }),
    children,
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: onToggleHelp,
        label: "Keyboard Shortcuts",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.HelpCircle, { size: 18 }),
        preventFocus: true,
        height: rowHeight,
        variant: buttonVariant
      }
    )
  ] });
};
var MainControls_default = MainControls;

// src/components/Assets/ClefIcon.tsx
init_SMuFL();
var ClefIcon = (_a) => {
  var _b = _a, { clef } = _b, props = __objRest(_b, ["clef"]);
  const viewBox = props.viewBox || "0 0 60 60";
  const key = clef || "treble";
  const getClefGlyph = () => {
    switch (key) {
      case "treble":
        return CLEFS.gClef;
      case "bass":
        return CLEFS.fClef;
      case "alto":
      case "tenor":
        return CLEFS.cClef;
      default:
        return CLEFS.gClef;
    }
  };
  const getClefConfig = () => {
    switch (key) {
      case "treble":
        return { fontSize: 55, x: 30, y: 42 };
      case "bass":
        return { fontSize: 45, x: 28, y: 28 };
      case "alto":
      case "tenor":
        return { fontSize: 40, x: 30, y: 30 };
      default:
        return { fontSize: 55, x: 30, y: 42 };
    }
  };
  const config = getClefConfig();
  return /* @__PURE__ */ jsxRuntime.jsx("svg", __spreadProps(__spreadValues({ viewBox, fill: "none" }, props), { children: key === "grand" ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5,10 Q0,10 0,20 L0,40 Q0,50 5,50", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }),
    [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "8", y1: 12 + i * 6, x2: "55", y2: 12 + i * 6, stroke: "currentColor", strokeWidth: "1", opacity: "0.4" }, `t-${i}`)),
    /* @__PURE__ */ jsxRuntime.jsx(
      "text",
      {
        x: 22,
        y: 26,
        fontFamily: BRAVURA_FONT,
        fontSize: 28,
        fill: "currentColor",
        textAnchor: "middle",
        children: CLEFS.gClef
      }
    ),
    [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "8", y1: 38 + i * 6, x2: "55", y2: 38 + i * 6, stroke: "currentColor", strokeWidth: "1", opacity: "0.4" }, `b-${i}`)),
    /* @__PURE__ */ jsxRuntime.jsx(
      "text",
      {
        x: 22,
        y: 46,
        fontFamily: BRAVURA_FONT,
        fontSize: 22,
        fill: "currentColor",
        textAnchor: "middle",
        children: CLEFS.fClef
      }
    )
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntime.jsx(
      "line",
      {
        x1: "0",
        y1: 10 + i * 10,
        x2: "60",
        y2: 10 + i * 10,
        stroke: "currentColor",
        strokeWidth: "1",
        opacity: "0.3"
      },
      i
    )),
    /* @__PURE__ */ jsxRuntime.jsx(
      "text",
      {
        x: config.x,
        y: config.y,
        fontFamily: BRAVURA_FONT,
        fontSize: config.fontSize,
        fill: "currentColor",
        textAnchor: "middle",
        children: getClefGlyph()
      }
    )
  ] }) }));
};
var ClefIcon_default = ClefIcon;

// src/components/Toolbar/StaffControls.tsx
init_constants();

// src/components/Toolbar/Menus/ClefOverlay.tsx
init_constants();
var ClefOverlay = ({ current, onSelect, onClose, position, triggerRef }) => {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownOverlay_default,
    {
      onClose,
      position,
      triggerRef,
      width: "auto",
      className: "w-[320px]",
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 grid grid-cols-3 gap-2", children: ["grand", "treble", "bass"].map((key) => {
        const data = CLEF_TYPES[key];
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: () => onSelect(key),
            className: "flex flex-col items-center justify-center p-2 rounded-md transition-colors border",
            style: {
              backgroundColor: current === key ? theme.buttonHoverBackground : "transparent",
              borderColor: current === key ? theme.accent : "transparent",
              color: theme.text
            },
            onMouseEnter: (e) => {
              if (current !== key) {
                e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
              }
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = current === key ? theme.buttonHoverBackground : "transparent";
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 h-16 flex items-center justify-center w-full relative", children: /* @__PURE__ */ jsxRuntime.jsx(ClefIcon_default, { clef: key, width: "60", height: "60" }) }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-medium", children: data.label })
            ]
          },
          key
        );
      }) })
    }
  );
};
var ClefOverlay_default = ClefOverlay;

// src/components/Toolbar/Menus/KeySignatureOverlay.tsx
init_constants();
init_SMuFL();
var KeySignatureOverlay = ({
  current,
  clef = "treble",
  onSelect,
  onClose,
  position,
  triggerRef
}) => {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownOverlay_default,
    {
      onClose,
      position,
      triggerRef,
      width: "auto",
      className: "w-72 md:w-[600px] max-w-full",
      maxHeight: 400,
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 grid grid-cols-2 md:grid-cols-5 gap-2 dropdown-scroll overflow-y-auto", style: { maxHeight: "400px" }, children: Object.entries(KEY_SIGNATURES).map(([key, data]) => {
        const accWidth = Math.max(40, data.count * 10 + 20);
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: () => onSelect(key),
            className: "flex flex-col items-center justify-center p-2 rounded-md transition-colors border",
            style: {
              backgroundColor: current === key ? theme.buttonHoverBackground : "transparent",
              borderColor: current === key ? theme.accent : "transparent",
              color: theme.text
            },
            onMouseEnter: (e) => {
              if (current !== key) {
                e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
              }
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = current === key ? theme.buttonHoverBackground : "transparent";
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-2 h-16 flex items-center justify-center w-full", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: accWidth, height: "60", viewBox: `0 0 ${accWidth} 60`, children: [
                [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntime.jsx(
                  "line",
                  {
                    x1: "0",
                    y1: 10 + i * 10,
                    x2: accWidth,
                    y2: 10 + i * 10,
                    stroke: theme.secondaryText,
                    strokeWidth: "1",
                    opacity: "0.5"
                  },
                  i
                )),
                data.accidentals.map((acc, i) => {
                  const type = data.type;
                  const validClef = clef in KEY_SIGNATURE_OFFSETS ? clef : "treble";
                  const offset = KEY_SIGNATURE_OFFSETS[validClef][type][acc];
                  const x = 10 + i * 10;
                  const y = 10 + offset;
                  return /* @__PURE__ */ jsxRuntime.jsx(
                    "text",
                    {
                      x,
                      y,
                      fontSize: "32",
                      fontFamily: BRAVURA_FONT,
                      fill: theme.text,
                      children: type === "sharp" ? ACCIDENTALS.sharp : ACCIDENTALS.flat
                    },
                    i
                  );
                })
              ] }) }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-medium", children: data.label })
            ]
          },
          key
        );
      }) })
    }
  );
};
var KeySignatureOverlay_default = KeySignatureOverlay;

// src/components/Toolbar/Menus/TimeSignatureOverlay.tsx
init_constants();
var TimeSignatureOverlay = ({ current, onSelect, onClose, position, triggerRef }) => {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownOverlay_default,
    {
      onClose,
      position,
      triggerRef,
      width: 200,
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 grid grid-cols-2 gap-2", children: Object.keys(TIME_SIGNATURES).map((sig) => {
        const [top, bottom] = sig.split("/");
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            onClick: () => onSelect(sig),
            className: "flex flex-col items-center justify-center p-2 rounded-md transition-colors border",
            style: {
              backgroundColor: current === sig ? theme.buttonHoverBackground : "transparent",
              borderColor: current === sig ? theme.accent : "transparent",
              color: theme.text
            },
            onMouseEnter: (e) => {
              if (current !== sig) {
                e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
              }
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = current === sig ? theme.buttonHoverBackground : "transparent";
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 h-16 flex items-center justify-center w-full", children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "40", height: "60", viewBox: "0 0 40 60", children: [
                [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntime.jsx(
                  "line",
                  {
                    x1: "0",
                    y1: 10 + i * 10,
                    x2: "40",
                    y2: 10 + i * 10,
                    stroke: theme.secondaryText,
                    strokeWidth: "1",
                    opacity: "0.3"
                  },
                  i
                )),
                /* @__PURE__ */ jsxRuntime.jsx("text", { x: "20", y: "28", fontSize: "24", fontWeight: "bold", fontFamily: "serif", textAnchor: "middle", fill: theme.text, children: top }),
                /* @__PURE__ */ jsxRuntime.jsx("text", { x: "20", y: "48", fontSize: "24", fontWeight: "bold", fontFamily: "serif", textAnchor: "middle", fill: theme.text, children: bottom })
              ] }) }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-medium", children: sig })
            ]
          },
          sig
        );
      }) })
    }
  );
};
var TimeSignatureOverlay_default = TimeSignatureOverlay;
var StaffControls = React3.forwardRef(({
  clef,
  onClefChange,
  keySignature,
  onKeySignatureChange,
  timeSignature,
  onTimeSignatureChange,
  variant = "default"
}, ref) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const [showClefMenu, setShowClefMenu] = React3.useState(false);
  const [showKeySig, setShowKeySig] = React3.useState(false);
  const [showTimeSig, setShowTimeSig] = React3.useState(false);
  const clefBtnRef = React3.useRef(null);
  const keySigBtnRef = React3.useRef(null);
  const timeSigBtnRef = React3.useRef(null);
  React3.useImperativeHandle(ref, () => ({
    openClefMenu: () => setShowClefMenu(true),
    openKeySigMenu: () => setShowKeySig(true),
    openTimeSigMenu: () => setShowTimeSig(true),
    isMenuOpen: () => showClefMenu || showKeySig || showTimeSig
  }), [showClefMenu, showKeySig, showTimeSig]);
  const currentClef = CLEF_TYPES[clef] || CLEF_TYPES["treble"];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        ref: clefBtnRef,
        label: currentClef.label,
        showLabel: false,
        onClick: () => setShowClefMenu(!showClefMenu),
        icon: /* @__PURE__ */ jsxRuntime.jsx(ClefIcon_default, { clef: clef || "treble", className: "w-6 h-6" }),
        variant
      }
    ),
    showClefMenu && /* @__PURE__ */ jsxRuntime.jsx(
      ClefOverlay_default,
      {
        current: clef,
        onSelect: (c) => {
          onClefChange(c);
          setShowClefMenu(false);
        },
        onClose: () => setShowClefMenu(false),
        position: {
          x: ((_a = clefBtnRef.current) == null ? void 0 : _a.getBoundingClientRect().left) || 0,
          y: (((_b = clefBtnRef.current) == null ? void 0 : _b.getBoundingClientRect().bottom) || 0) + 5
        },
        triggerRef: clefBtnRef
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        ref: keySigBtnRef,
        label: ((_c = KEY_SIGNATURES[keySignature]) == null ? void 0 : _c.label) || keySignature,
        showLabel: true,
        onClick: () => setShowKeySig(!showKeySig),
        className: "text-xs font-bold",
        variant
      }
    ),
    showKeySig && /* @__PURE__ */ jsxRuntime.jsx(
      KeySignatureOverlay_default,
      {
        current: keySignature,
        clef,
        onSelect: (k) => {
          onKeySignatureChange(k);
          setShowKeySig(false);
        },
        onClose: () => setShowKeySig(false),
        position: {
          x: ((_d = keySigBtnRef.current) == null ? void 0 : _d.getBoundingClientRect().left) || 0,
          y: (((_e = keySigBtnRef.current) == null ? void 0 : _e.getBoundingClientRect().bottom) || 0) + 5
        },
        triggerRef: keySigBtnRef
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        ref: timeSigBtnRef,
        label: timeSignature,
        showLabel: true,
        onClick: () => setShowTimeSig(!showTimeSig),
        className: "text-xs font-bold",
        variant
      }
    ),
    showTimeSig && /* @__PURE__ */ jsxRuntime.jsx(
      TimeSignatureOverlay_default,
      {
        current: timeSignature,
        onSelect: (ts) => {
          onTimeSignatureChange(ts);
          setShowTimeSig(false);
        },
        onClose: () => setShowTimeSig(false),
        position: {
          x: ((_f = timeSigBtnRef.current) == null ? void 0 : _f.getBoundingClientRect().left) || 0,
          y: (((_g = timeSigBtnRef.current) == null ? void 0 : _g.getBoundingClientRect().bottom) || 0) + 5
        },
        triggerRef: timeSigBtnRef
      }
    )
  ] });
});
StaffControls.displayName = "StaffControls";
var StaffControls_default = StaffControls;

// src/components/Toolbar/DurationControls.tsx
init_constants();

// src/components/Assets/NoteIcon.tsx
init_SMuFL();
var NOTE_SIZING = {
  whole: { y: 14, fontSize: 24 },
  // Centered (no stem)
  thirtysecond: { y: 20, fontSize: 20 },
  sixtyfourth: { y: 22, fontSize: 18 }
};
var NoteIcon = ({ type, color = "currentColor" }) => {
  const glyph = PRECOMPOSED_NOTES_UP[type] || PRECOMPOSED_NOTES_UP.quarter;
  const sizing = NOTE_SIZING[type] || { y: 20, fontSize: 24 };
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 12,
      y: sizing.y,
      fontFamily: BRAVURA_FONT,
      fontSize: sizing.fontSize,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: glyph
    }
  ) });
};
var NoteIcon_default = NoteIcon;

// src/components/Assets/RestIcon.tsx
init_SMuFL();
var RestIcon = ({ type, color = "currentColor" }) => {
  const commonProps = {
    fontFamily: BRAVURA_FONT,
    fill: color,
    textAnchor: "middle",
    style: { userSelect: "none" }
  };
  const renderGlyph = () => {
    switch (type) {
      case "whole":
        return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 6, y1: 9.5, x2: 18, y2: 9.5, stroke: color, strokeWidth: 1 }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "text",
            __spreadProps(__spreadValues({
              x: 12,
              y: 10,
              fontSize: 24
            }, commonProps), {
              children: REST_GLYPHS.whole
            })
          )
        ] });
      case "half":
        return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 6, y1: 14, x2: 18, y2: 14, stroke: color, strokeWidth: 1 }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "text",
            __spreadProps(__spreadValues({
              x: 12,
              y: 14,
              fontSize: 24
            }, commonProps), {
              children: REST_GLYPHS.half
            })
          )
        ] });
      case "quarter":
        return /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          __spreadProps(__spreadValues({
            x: 12,
            y: 14,
            fontSize: 24
          }, commonProps), {
            children: REST_GLYPHS.quarter
          })
        );
      case "eighth":
        return /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          __spreadProps(__spreadValues({
            x: 12,
            y: 12,
            fontSize: 26
          }, commonProps), {
            children: REST_GLYPHS.eighth
          })
        );
      case "sixteenth":
        return /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          __spreadProps(__spreadValues({
            x: 12,
            y: 10,
            fontSize: 24
          }, commonProps), {
            children: REST_GLYPHS.sixteenth
          })
        );
      case "thirtysecond":
        return /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          __spreadProps(__spreadValues({
            x: 12,
            y: 12,
            fontSize: 24
          }, commonProps), {
            children: REST_GLYPHS.thirtysecond
          })
        );
      case "sixtyfourth":
        return /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          __spreadProps(__spreadValues({
            x: 12,
            y: 10,
            fontSize: 20
          }, commonProps), {
            children: REST_GLYPHS.sixtyfourth
          })
        );
      default:
        return /* @__PURE__ */ jsxRuntime.jsx(
          "text",
          __spreadProps(__spreadValues({
            x: 12,
            y: 14,
            fontSize: 24
          }, commonProps), {
            children: REST_GLYPHS.quarter
          })
        );
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: renderGlyph() });
};
var RestIcon_default = RestIcon;
var DurationControls = ({
  activeDuration,
  onDurationChange,
  isDurationValid,
  selectedDurations = [],
  editorState = "IDLE",
  inputMode = "NOTE",
  variant = "default"
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: Object.keys(NOTE_TYPES).map((type) => {
    const shortcuts = {
      whole: "7",
      half: "6",
      quarter: "5",
      eighth: "4",
      sixteenth: "3",
      thirtysecond: "2",
      sixtyfourth: "1"
    };
    let isActive = false;
    let isEmphasized = false;
    let isDashed = false;
    if (editorState === "SELECTION_READY") {
      if (selectedDurations.length === 1 && selectedDurations.includes(type)) {
        isActive = true;
      } else if (selectedDurations.length > 1 && selectedDurations.includes(type)) {
        isEmphasized = true;
        isDashed = true;
      }
    } else {
      isActive = activeDuration === type;
    }
    const IconComponent = inputMode === "REST" ? RestIcon_default : NoteIcon_default;
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: () => onDurationChange(type),
        label: NOTE_TYPES[type].label,
        title: `${NOTE_TYPES[type].label} (${shortcuts[type]})`,
        isActive,
        isEmphasized,
        isDashed,
        icon: /* @__PURE__ */ jsxRuntime.jsx(IconComponent, { type, color: isActive ? "white" : "currentColor" }),
        preventFocus: true,
        disabled: !isDurationValid(type),
        variant
      },
      type
    );
  }) });
};
var DurationControls_default = DurationControls;
var TieIcon = ({ size = 16, color = "currentColor" }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M 0 10 Q 12 23 24 10 Q 12 16 0 10 Z" }) });
};
var TieIcon_default = TieIcon;
var ModifierControls = ({
  isDotted,
  onDotToggle,
  activeTie,
  onToggleTie,
  isDotValid,
  selectedDots = [],
  selectedTies = [],
  editorState = "IDLE",
  variant = "default"
}) => {
  let dotActive = isDotted;
  let dotDashed = false;
  let dotEmphasized = false;
  if (editorState === "SELECTION_READY") {
    if (selectedDots.length > 1) {
      dotActive = false;
      dotDashed = true;
      dotEmphasized = true;
    } else if (selectedDots.length === 1 && selectedDots[0] === true) {
      dotActive = true;
    } else {
      dotActive = false;
    }
  }
  let tieActive = activeTie;
  let tieDashed = false;
  let tieEmphasized = false;
  if (editorState === "SELECTION_READY") {
    if (selectedTies.length > 1) {
      tieActive = false;
      tieDashed = true;
      tieEmphasized = true;
    } else if (selectedTies.length === 1 && selectedTies[0] === true) {
      tieActive = true;
    } else {
      tieActive = false;
    }
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: onDotToggle,
        label: "Dotted Note",
        isActive: dotActive,
        isDashed: dotDashed,
        isEmphasized: dotEmphasized,
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Circle, { size: 8, fill: "currentColor" }),
        preventFocus: true,
        disabled: !isDotValid,
        variant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: onToggleTie,
        label: "Tie (T)",
        isActive: tieActive,
        isDashed: tieDashed,
        isEmphasized: tieEmphasized,
        icon: /* @__PURE__ */ jsxRuntime.jsx(TieIcon_default, { size: 16 }),
        preventFocus: true,
        variant
      }
    )
  ] });
};
var ModifierControls_default = ModifierControls;
var AccidentalControls = ({
  activeAccidental,
  onToggleAccidental,
  selectedAccidentals = [],
  editorState = "IDLE",
  variant = "default"
}) => {
  const getVisualState = (type) => {
    let isActive = activeAccidental === type;
    let isDashed = false;
    let isEmphasized = false;
    if (editorState === "SELECTION_READY" && selectedAccidentals.length > 0) {
      const present = selectedAccidentals.includes(type);
      if (selectedAccidentals.length > 1) {
        isActive = false;
        if (present) {
          isDashed = true;
          isEmphasized = true;
        }
      } else {
        isActive = present;
        isDashed = false;
      }
    }
    return { isActive, isDashed, isEmphasized };
  };
  const flatState = getVisualState("flat");
  const naturalState = getVisualState("natural");
  const sharpState = getVisualState("sharp");
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: () => onToggleAccidental("flat"),
        label: "Flat",
        isActive: flatState.isActive,
        isDashed: flatState.isDashed,
        isEmphasized: flatState.isEmphasized,
        className: "text-xl pb-1",
        icon: "\u266D",
        preventFocus: true,
        variant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: () => onToggleAccidental("natural"),
        label: "Natural",
        isActive: naturalState.isActive,
        isDashed: naturalState.isDashed,
        isEmphasized: naturalState.isEmphasized,
        className: "text-xl pb-1",
        icon: "\u266E",
        preventFocus: true,
        variant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: () => onToggleAccidental("sharp"),
        label: "Sharp",
        isActive: sharpState.isActive,
        isDashed: sharpState.isDashed,
        isEmphasized: sharpState.isEmphasized,
        className: "text-xl pb-1",
        icon: "\u266F",
        preventFocus: true,
        variant
      }
    )
  ] });
};
var AccidentalControls_default = AccidentalControls;
var MeasureControls = ({
  onAddMeasure,
  onRemoveMeasure,
  onTogglePickup,
  isPickup,
  variant = "default"
}) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: onAddMeasure,
        label: "Add Measure",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.SquarePlus, { size: 16 }),
        variant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: onRemoveMeasure,
        label: "Remove Measure",
        icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.SquareMinus, { size: 16 }),
        variant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: onTogglePickup,
        isActive: isPickup,
        label: "Toggle Pickup",
        icon: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-bold", children: "PK" }),
        variant
      }
    )
  ] });
};
var MeasureControls_default = MeasureControls;
var TupletControls = ({
  onApplyTuplet,
  onRemoveTuplet,
  canApplyTriplet,
  canApplyQuintuplet,
  activeTupletRatio,
  variant = "default"
}) => {
  const { theme } = useTheme();
  const isTripletActive = (activeTupletRatio == null ? void 0 : activeTupletRatio[0]) === 3 && (activeTupletRatio == null ? void 0 : activeTupletRatio[1]) === 2;
  const isQuintupletActive = (activeTupletRatio == null ? void 0 : activeTupletRatio[0]) === 5 && (activeTupletRatio == null ? void 0 : activeTupletRatio[1]) === 4;
  const handleTriplet = () => {
    if (isTripletActive) {
      onRemoveTuplet();
    } else {
      onApplyTuplet([3, 2], 3);
    }
  };
  const handleQuintuplet = () => {
    if (isQuintupletActive) {
      onRemoveTuplet();
    } else {
      onApplyTuplet([5, 4], 5);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: handleTriplet,
        label: "Triplet (3)",
        isActive: isTripletActive,
        disabled: !canApplyTriplet && !isTripletActive,
        preventFocus: true,
        icon: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center", style: { fontSize: "10px", lineHeight: "1" }, children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { style: { fontWeight: "bold", fontSize: "11px" }, children: "3" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-0.5 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } })
          ] })
        ] }),
        variant
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ToolbarButton_default,
      {
        onClick: handleQuintuplet,
        label: "Quintuplet (5)",
        isActive: isQuintupletActive,
        disabled: !canApplyQuintuplet && !isQuintupletActive,
        preventFocus: true,
        icon: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center justify-center", style: { fontSize: "10px", lineHeight: "1" }, children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { style: { fontWeight: "bold", fontSize: "11px" }, children: "5" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-0.5 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-1 h-1 rounded-full", style: { backgroundColor: "currentColor" } })
          ] })
        ] }),
        variant
      }
    )
  ] });
};
var TupletControls_default = TupletControls;
var MelodyLibrary = ({ melodies, onSelectMelody, onClose, position, triggerRef }) => {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsxRuntime.jsxs(
    DropdownOverlay_default,
    {
      onClose,
      position,
      triggerRef,
      width: 256,
      maxHeight: 320,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "px-4 py-3 border-b flex items-center gap-2",
            style: {
              backgroundColor: theme.buttonHoverBackground,
              borderColor: theme.border
            },
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BookOpen, { size: 16, style: { color: theme.secondaryText } }),
              /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-semibold text-sm", style: { color: theme.text }, children: "Melody Library" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-y-auto p-2 dropdown-scroll", style: { maxHeight: "320px" }, children: melodies.map((melody) => /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: () => onSelectMelody(melody),
            className: "w-full text-left px-3 py-2 rounded-md transition-colors text-sm mb-1",
            style: {
              color: theme.text
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = theme.buttonHoverBackground;
              e.currentTarget.style.color = theme.accent;
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.text;
            },
            children: melody.title
          },
          melody.id
        )) })
      ]
    }
  );
};
var MelodyLibrary_default = MelodyLibrary;

// src/components/Toolbar/InputModeToggle.tsx
init_SMuFL();
var RestGroupIcon = ({ color }) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 5,
      y: 15,
      fontFamily: BRAVURA_FONT,
      fontSize: 20,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: RESTS.eighth
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 12,
      y: 14,
      fontFamily: BRAVURA_FONT,
      fontSize: 24,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: RESTS.quarter
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 19,
      y: 13,
      fontFamily: BRAVURA_FONT,
      fontSize: 18,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: RESTS.sixteenth
    }
  )
] });
var NoteGroupIcon = ({ color }) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 6,
      y: 18,
      fontFamily: BRAVURA_FONT,
      fontSize: 20,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: NOTEHEADS.black
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 8.5, y1: 18, x2: 8.5, y2: 8, stroke: color, strokeWidth: 1.5 }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 12,
      y: 19,
      fontFamily: BRAVURA_FONT,
      fontSize: 24,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: NOTEHEADS.black
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 15, y1: 19, x2: 15, y2: 6, stroke: color, strokeWidth: 2 }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "text",
    {
      x: 18,
      y: 18,
      fontFamily: BRAVURA_FONT,
      fontSize: 20,
      fill: color,
      textAnchor: "middle",
      style: { userSelect: "none" },
      children: NOTEHEADS.half
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("line", { x1: 20.5, y1: 18, x2: 20.5, y2: 8, stroke: color, strokeWidth: 1.5 })
] });
var InputModeToggle = ({ mode, onToggle, variant = "default" }) => {
  const { theme } = useTheme();
  const isActive = mode === "REST";
  return /* @__PURE__ */ jsxRuntime.jsx(
    ToolbarButton_default,
    {
      label: "Toggle Input Mode",
      onClick: onToggle,
      isActive: false,
      title: isActive ? "Switch to Note Mode (R)" : "Switch to Rest Mode (R)",
      preventFocus: true,
      icon: isActive ? /* @__PURE__ */ jsxRuntime.jsx(NoteGroupIcon, { color: theme.secondaryText }) : /* @__PURE__ */ jsxRuntime.jsx(RestGroupIcon, { color: theme.secondaryText }),
      variant
    }
  );
};
var InputModeToggle_default = InputModeToggle;

// src/commands/LoadScoreCommand.ts
var LoadScoreCommand = class {
  constructor(newScore) {
    this.newScore = newScore;
    this.type = "LOAD_SCORE";
    this.previousScore = null;
  }
  execute(score) {
    this.previousScore = score;
    return this.newScore;
  }
  undo(score) {
    return this.previousScore || score;
  }
};
var TOP_ROW_HEIGHT = "h-9";
var Toolbar = React3.forwardRef(({
  scoreTitle,
  label,
  isEditingTitle,
  onEditingChange,
  onTitleChange,
  isPlaying,
  onPlayToggle,
  bpm,
  onBpmChange,
  errorMsg,
  onToggleHelp,
  midiStatus = { connected: false, deviceName: null, error: null },
  melodies,
  selectedInstrument,
  onInstrumentChange,
  samplerLoaded,
  onEscape
}, ref) => {
  var _a, _b, _c, _d, _e;
  const staffControlsRef = React3.useRef(null);
  const melodyLibBtnRef = React3.useRef(null);
  const toolbarContainerRef = React3.useRef(null);
  const [showLibrary, setShowLibrary] = React3.useState(false);
  const [isToolbarFocused, setIsToolbarFocused] = React3.useState(false);
  const { theme } = useTheme();
  const {
    score,
    selection,
    // Added selection
    activeDuration,
    handleDurationChange,
    checkDurationValidity,
    isDotted,
    handleDotToggle,
    checkDotValidity,
    activeAccidental,
    handleAccidentalToggle,
    activeTie,
    handleTieToggle,
    history,
    undo,
    redoStack,
    redo,
    addMeasure,
    removeMeasure,
    togglePickup,
    handleTimeSignatureChange,
    handleKeySignatureChange,
    handleClefChange,
    dispatch,
    applyTuplet,
    removeTuplet,
    canApplyTuplet,
    activeTupletRatio,
    selectedDurations,
    editorState,
    selectedDots,
    selectedTies,
    selectedAccidentals,
    inputMode,
    setInputMode,
    toggleInputMode
    // Added toggleInputMode
  } = useScoreContext();
  const handleInputModeClick = () => {
    const hasSelection = (selection == null ? void 0 : selection.selectedNotes) && selection.selectedNotes.length > 0;
    if (hasSelection) {
      dispatch(new ToggleRestCommand(selection));
    } else {
      toggleInputMode();
    }
  };
  React3.useImperativeHandle(ref, () => ({
    openTimeSigMenu: () => {
      var _a2;
      return (_a2 = staffControlsRef.current) == null ? void 0 : _a2.openTimeSigMenu();
    },
    openKeySigMenu: () => {
      var _a2;
      return (_a2 = staffControlsRef.current) == null ? void 0 : _a2.openKeySigMenu();
    },
    openClefMenu: () => {
      var _a2;
      return (_a2 = staffControlsRef.current) == null ? void 0 : _a2.openClefMenu();
    },
    isMenuOpen: () => {
      var _a2, _b2;
      return showLibrary || ((_b2 = (_a2 = staffControlsRef.current) == null ? void 0 : _a2.isMenuOpen()) != null ? _b2 : false);
    }
  }), [showLibrary]);
  const handleMelodySelect = (melody) => {
    dispatch(new LoadScoreCommand(melody.score));
    setShowLibrary(false);
  };
  const isAnyMenuOpen = showLibrary || ((_b = (_a = staffControlsRef.current) == null ? void 0 : _a.isMenuOpen()) != null ? _b : false);
  useFocusTrap({
    containerRef: toolbarContainerRef,
    isActive: isToolbarFocused && !isAnyMenuOpen,
    onEscape: () => {
      setIsToolbarFocused(false);
      onEscape == null ? void 0 : onEscape();
    },
    autoFocus: false,
    // Don't auto-focus first element
    enableArrowKeys: false
    // Use Tab only for toolbar navigation
  });
  const activeStaff = getActiveStaff(score);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref: toolbarContainerRef,
      className: "flex flex-col gap-2 mb-4 border-b pb-2",
      style: { borderColor: theme.border },
      onFocus: () => setIsToolbarFocused(true),
      onBlur: (e) => {
        var _a2;
        if (!((_a2 = toolbarContainerRef.current) == null ? void 0 : _a2.contains(e.relatedTarget))) {
          setIsToolbarFocused(false);
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          MainControls_default,
          {
            scoreTitle,
            isEditingTitle,
            onEditingChange,
            onTitleChange,
            isPlaying,
            onPlayToggle,
            bpm,
            onBpmChange,
            midiStatus,
            onToggleHelp,
            canUndo: history.length > 0,
            onUndo: undo,
            canRedo: redoStack.length > 0,
            onRedo: redo,
            selectedInstrument,
            onInstrumentChange,
            samplerLoaded,
            score,
            rowHeight: TOP_ROW_HEIGHT,
            buttonVariant: "ghost",
            children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-1 relative", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                ToolbarButton_default,
                {
                  ref: melodyLibBtnRef,
                  onClick: () => setShowLibrary(!showLibrary),
                  label: "Melody Library",
                  icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.BookOpen, { size: 18 }),
                  isActive: showLibrary,
                  preventFocus: true,
                  showLabel: true,
                  isEmphasized: !showLibrary,
                  height: TOP_ROW_HEIGHT,
                  variant: "ghost"
                }
              ),
              showLibrary && /* @__PURE__ */ jsxRuntime.jsx(
                MelodyLibrary_default,
                {
                  melodies,
                  onSelectMelody: handleMelodySelect,
                  onClose: () => setShowLibrary(false),
                  position: {
                    x: (((_c = melodyLibBtnRef.current) == null ? void 0 : _c.getBoundingClientRect().right) || 0) - 256,
                    // Align right edge
                    y: (((_d = melodyLibBtnRef.current) == null ? void 0 : _d.getBoundingClientRect().bottom) || 0) + 5
                  },
                  triggerRef: melodyLibBtnRef
                }
              )
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-px mb-2", style: { backgroundColor: theme.border } }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            StaffControls_default,
            {
              ref: staffControlsRef,
              clef: score.staves.length >= 2 ? "grand" : activeStaff.clef || "treble",
              onClefChange: handleClefChange,
              keySignature: score.keySignature || activeStaff.keySignature,
              onKeySignatureChange: handleKeySignatureChange,
              timeSignature: score.timeSignature,
              onTimeSignatureChange: handleTimeSignatureChange,
              variant: "ghost"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
          /* @__PURE__ */ jsxRuntime.jsx(
            InputModeToggle_default,
            {
              mode: inputMode,
              onToggle: handleInputModeClick,
              variant: "ghost"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            DurationControls_default,
            {
              activeDuration,
              onDurationChange: handleDurationChange,
              isDurationValid: checkDurationValidity,
              selectedDurations,
              editorState,
              inputMode,
              variant: "ghost"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ModifierControls_default,
            {
              isDotted,
              onDotToggle: handleDotToggle,
              activeTie,
              onToggleTie: handleTieToggle,
              isDotValid: checkDotValidity(),
              selectedDots,
              selectedTies,
              editorState,
              variant: "ghost"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
          /* @__PURE__ */ jsxRuntime.jsx(
            AccidentalControls_default,
            {
              activeAccidental,
              onToggleAccidental: handleAccidentalToggle,
              selectedAccidentals,
              editorState,
              variant: "ghost"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-px h-6", style: { backgroundColor: theme.border } }),
          /* @__PURE__ */ jsxRuntime.jsx(
            TupletControls_default,
            {
              onApplyTuplet: applyTuplet,
              onRemoveTuplet: removeTuplet,
              canApplyTriplet: canApplyTuplet(3),
              canApplyQuintuplet: canApplyTuplet(5),
              activeTupletRatio,
              variant: "ghost"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            MeasureControls_default,
            {
              onAddMeasure: addMeasure,
              onRemoveMeasure: removeMeasure,
              onTogglePickup: togglePickup,
              isPickup: (_e = activeStaff.measures[0]) == null ? void 0 : _e.isPickup,
              variant: "ghost"
            }
          )
        ] }),
        errorMsg && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full text-red-600 text-xs mt-2 font-bold animate-pulse", children: [
          "\u26A0\uFE0F ",
          errorMsg
        ] })
      ]
    }
  );
});
Toolbar.displayName = "Toolbar";
var Toolbar_default = Toolbar;
function ScoreTitleField({
  title,
  isEditing,
  setIsEditing,
  buffer,
  setBuffer,
  commit,
  inputRef,
  theme
}) {
  if (isEditing) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        ref: inputRef,
        value: buffer,
        onChange: (e) => setBuffer(e.target.value),
        onBlur: commit,
        onKeyDown: (e) => e.key === "Enter" && commit(),
        className: "font-bold font-serif text-3xl px-2 py-0 rounded outline-none bg-transparent",
        style: { color: theme.text, borderColor: theme.border, borderWidth: "1px" }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "h2",
    {
      onClick: () => setIsEditing(true),
      className: "font-bold font-serif text-3xl px-2 py-0 rounded hover:bg-white/10 cursor-pointer transition-colors inline-block",
      style: { color: theme.text },
      children: title
    }
  );
}
var ShortcutGroup = ({ title, shortcuts, theme }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-6", children: [
  /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-sm font-bold uppercase tracking-wider mb-3 border-b pb-1", style: { color: theme.secondaryText, borderColor: theme.border }, children: title }),
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-1 gap-2", children: shortcuts.map((s, i) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { style: { color: theme.text }, children: s.label }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-1", children: s.keys.map((k, j) => /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "px-2 py-1 rounded text-xs font-mono min-w-[24px] text-center", style: { backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.secondaryText }, children: k }, j)) })
  ] }, i)) })
] });
var ShortcutsOverlay = ({ onClose }) => {
  const { theme } = useTheme();
  React3.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  const shortcuts = {
    selection: [
      { label: "Move Selection", keys: ["\u2190", "\u2192"] },
      { label: "Chord Navigation", keys: ["Cmd/Ctrl", "\u2191/\u2193"] },
      { label: "Select Note", keys: ["Cmd/Ctrl", "Click"] },
      { label: "Clear Selection", keys: ["Esc"] }
    ],
    playback: [
      { label: "Toggle Playback", keys: ["Space"] },
      { label: "Play Selection", keys: ["P"] },
      { label: "Replay Last Start", keys: ["Shift", "Space"] },
      { label: "Play From Start", keys: ["Shift", "Alt", "Space"] }
    ],
    editing: [
      { label: "Add Note", keys: ["Enter"] },
      { label: "Remove Note", keys: ["Backspace"] },
      { label: "Undo", keys: ["Cmd/Ctrl", "Z"] },
      { label: "Redo", keys: ["Cmd/Ctrl", "Shift", "Z"] },
      { label: "Pitch Up/Down", keys: ["\u2191", "\u2193"] },
      { label: "Octave Jump", keys: ["Shift", "\u2191/\u2193"] },
      { label: "Flat", keys: ["-"] },
      { label: "Sharp", keys: ["="] },
      { label: "Natural", keys: ["0"] }
    ],
    durations: [
      { label: "Whole Note", keys: ["7"] },
      { label: "Half Note", keys: ["6"] },
      { label: "Quarter Note", keys: ["5"] },
      { label: "Eighth Note", keys: ["4"] },
      { label: "16th Note", keys: ["3"] },
      { label: "32nd Note", keys: ["2"] },
      { label: "64th Note", keys: ["1"] }
    ]
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden", style: { backgroundColor: theme.panelBackground }, onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-4 border-b flex items-center justify-between", style: { backgroundColor: theme.background, borderColor: theme.border }, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", style: { color: theme.accent }, children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Keyboard, { size: 20 }),
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "font-bold text-lg", style: { color: theme.text }, children: "Keyboard Shortcuts" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: onClose, className: "p-1 rounded-full transition-colors", style: { color: theme.secondaryText }, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-6 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-8 p-4 rounded-lg border", style: { backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }, children: [
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-bold mb-2", style: { color: theme.accent }, children: "Welcome to PianoRiffs Studio!" }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm mb-4", style: { color: theme.text }, children: "This editor allows you to create sheet music using both mouse and keyboard. Use the toolbar above to change note duration, add dots, or manage measures." }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-bold mb-1", style: { color: theme.text }, children: "\u{1F5B1}\uFE0F Mouse Interactions" }),
            /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "list-disc list-inside space-y-1", style: { color: theme.secondaryText }, children: [
              /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Click anywhere in a measure to place the cursor." }),
              /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Click existing notes to select them." }),
              /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Click the background to deselect." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-bold mb-1", style: { color: theme.text }, children: "\u2328\uFE0F Keyboard Interactions" }),
            /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "list-disc list-inside space-y-1", style: { color: theme.secondaryText }, children: [
              /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
                "Use ",
                /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "font-mono px-1 rounded", style: { backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.accent }, children: "Arrow Keys" }),
                " to move the cursor."
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
                "Press ",
                /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "font-mono px-1 rounded", style: { backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.accent }, children: "Enter" }),
                " to add a note at the cursor."
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
                "Press ",
                /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "font-mono px-1 rounded", style: { backgroundColor: theme.buttonBackground, border: `1px solid ${theme.border}`, color: theme.accent }, children: "Space" }),
                " to play/pause."
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ShortcutGroup, { title: "Playback", shortcuts: shortcuts.playback, theme }),
          /* @__PURE__ */ jsxRuntime.jsx(ShortcutGroup, { title: "Selection", shortcuts: shortcuts.selection, theme })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ShortcutGroup, { title: "Editing", shortcuts: shortcuts.editing, theme }),
          /* @__PURE__ */ jsxRuntime.jsx(ShortcutGroup, { title: "Durations", shortcuts: shortcuts.durations, theme })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-4 border-t text-center text-xs", style: { backgroundColor: theme.background, borderColor: theme.border, color: theme.secondaryText }, children: [
      "Press ",
      /* @__PURE__ */ jsxRuntime.jsx("kbd", { className: "px-1 py-0.5 rounded border font-mono", style: { backgroundColor: theme.buttonBackground, borderColor: theme.border, color: theme.text }, children: "Esc" }),
      " to close"
    ] })
  ] }) });
};
var ShortcutsOverlay_default = ShortcutsOverlay;
var ConfirmDialog = ({
  title,
  message,
  actions,
  onClose
}) => {
  const { theme } = useTheme();
  React3__default.default.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);
  const getButtonStyle = (variant = "secondary") => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.accent,
          color: "#fff",
          border: "none"
        };
      case "danger":
        return {
          backgroundColor: "#ef4444",
          // Gentler red
          color: "#fff",
          border: "none"
        };
      case "secondary":
      default:
        return {
          backgroundColor: "transparent",
          color: theme.text,
          border: `1px solid ${theme.border}`
        };
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: "fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center",
      style: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative",
          style: { backgroundColor: theme.background, maxHeight: "90vh", overflowY: "auto" },
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "h2",
              {
                className: "text-lg font-semibold mb-2",
                style: { color: theme.text },
                children: title
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "p",
              {
                className: "mb-6",
                style: { color: theme.secondaryText },
                children: message
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end gap-3", children: actions.map((action, index) => /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: action.onClick,
                className: "px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-80",
                style: getButtonStyle(action.variant),
                children: action.label
              },
              index
            )) })
          ]
        }
      )
    }
  );
};
var ConfirmDialog_default = ConfirmDialog;

// src/data/melodies.ts
var MELODIES = [
  {
    id: "twinkle",
    title: "Twinkle, Twinkle, Little Star",
    score: {
      title: "Twinkle, Twinkle, Little Star",
      timeSignature: "4/4",
      keySignature: "C",
      bpm: 100,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "C",
          measures: [
            // Staff 1 (Soprano/Alto)
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 3, pitch: "G4" }, { id: 4, pitch: "C5" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 7, pitch: "G4" }, { id: 8, pitch: "C5" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 11, pitch: "G4" }, { id: 12, pitch: "G5" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 15, pitch: "G4" }, { id: 16, pitch: "G5" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 19, pitch: "A4" }, { id: 20, pitch: "A5" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 23, pitch: "A4" }, { id: 24, pitch: "A5" }] },
                { id: 203, duration: "half", dotted: false, notes: [{ id: 27, pitch: "G4" }, { id: 28, pitch: "G5" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 31, pitch: "G4" }, { id: 32, pitch: "F5" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 35, pitch: "G4" }, { id: 36, pitch: "F5" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 39, pitch: "G4" }, { id: 40, pitch: "E5" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 43, pitch: "G4" }, { id: 44, pitch: "E5" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 47, pitch: "G4" }, { id: 48, pitch: "D5" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 51, pitch: "G4" }, { id: 52, pitch: "D5" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 55, pitch: "G4" }, { id: 56, pitch: "C5" }] }
              ]
            },
            // B Section
            {
              id: 5,
              events: [
                { id: 501, duration: "quarter", dotted: false, notes: [{ id: 59, pitch: "G4" }, { id: 60, pitch: "G5" }] },
                { id: 502, duration: "quarter", dotted: false, notes: [{ id: 63, pitch: "G4" }, { id: 64, pitch: "G5" }] },
                { id: 503, duration: "quarter", dotted: false, notes: [{ id: 67, pitch: "G4" }, { id: 68, pitch: "F5" }] },
                { id: 504, duration: "quarter", dotted: false, notes: [{ id: 71, pitch: "G4" }, { id: 72, pitch: "F5" }] }
              ]
            },
            {
              id: 6,
              events: [
                { id: 601, duration: "quarter", dotted: false, notes: [{ id: 75, pitch: "G4" }, { id: 76, pitch: "E5" }] },
                { id: 602, duration: "quarter", dotted: false, notes: [{ id: 79, pitch: "G4" }, { id: 80, pitch: "E5" }] },
                { id: 603, duration: "half", dotted: false, notes: [{ id: 83, pitch: "G4" }, { id: 84, pitch: "D5" }] }
              ]
            },
            {
              id: 7,
              events: [
                { id: 701, duration: "quarter", dotted: false, notes: [{ id: 87, pitch: "G4" }, { id: 88, pitch: "G5" }] },
                { id: 702, duration: "quarter", dotted: false, notes: [{ id: 91, pitch: "G4" }, { id: 92, pitch: "G5" }] },
                { id: 703, duration: "quarter", dotted: false, notes: [{ id: 95, pitch: "G4" }, { id: 96, pitch: "F5" }] },
                { id: 704, duration: "quarter", dotted: false, notes: [{ id: 99, pitch: "G4" }, { id: 100, pitch: "F5" }] }
              ]
            },
            {
              id: 8,
              events: [
                { id: 801, duration: "quarter", dotted: false, notes: [{ id: 103, pitch: "G4" }, { id: 104, pitch: "E5" }] },
                { id: 802, duration: "quarter", dotted: false, notes: [{ id: 107, pitch: "G4" }, { id: 108, pitch: "E5" }] },
                { id: 803, duration: "half", dotted: false, notes: [{ id: 111, pitch: "G4" }, { id: 112, pitch: "D5" }] }
              ]
            },
            // A Section Repeat
            {
              id: 9,
              events: [
                { id: 901, duration: "quarter", dotted: false, notes: [{ id: 115, pitch: "G4" }, { id: 116, pitch: "C5" }] },
                { id: 902, duration: "quarter", dotted: false, notes: [{ id: 119, pitch: "G4" }, { id: 120, pitch: "C5" }] },
                { id: 903, duration: "quarter", dotted: false, notes: [{ id: 123, pitch: "G4" }, { id: 124, pitch: "G5" }] },
                { id: 904, duration: "quarter", dotted: false, notes: [{ id: 127, pitch: "G4" }, { id: 128, pitch: "G5" }] }
              ]
            },
            {
              id: 10,
              events: [
                { id: 1001, duration: "quarter", dotted: false, notes: [{ id: 131, pitch: "A4" }, { id: 132, pitch: "A5" }] },
                { id: 1002, duration: "quarter", dotted: false, notes: [{ id: 135, pitch: "A4" }, { id: 136, pitch: "A5" }] },
                { id: 1003, duration: "half", dotted: false, notes: [{ id: 139, pitch: "G4" }, { id: 140, pitch: "G5" }] }
              ]
            },
            {
              id: 11,
              events: [
                { id: 1101, duration: "quarter", dotted: false, notes: [{ id: 143, pitch: "G4" }, { id: 144, pitch: "F5" }] },
                { id: 1102, duration: "quarter", dotted: false, notes: [{ id: 147, pitch: "G4" }, { id: 148, pitch: "F5" }] },
                { id: 1103, duration: "quarter", dotted: false, notes: [{ id: 151, pitch: "G4" }, { id: 152, pitch: "E5" }] },
                { id: 1104, duration: "quarter", dotted: false, notes: [{ id: 155, pitch: "G4" }, { id: 156, pitch: "E5" }] }
              ]
            },
            {
              id: 12,
              events: [
                { id: 1201, duration: "quarter", dotted: false, notes: [{ id: 159, pitch: "G4" }, { id: 160, pitch: "D5" }] },
                { id: 1202, duration: "quarter", dotted: false, notes: [{ id: 163, pitch: "G4" }, { id: 164, pitch: "D5" }] },
                { id: 1203, duration: "half", dotted: false, notes: [{ id: 167, pitch: "G4" }, { id: 168, pitch: "C5" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "C",
          measures: [
            // Staff 2 (Tenor/Bass - Transposed down 1 octave from original C4 start)
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 1, pitch: "C3" }, { id: 2, pitch: "E3" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 5, pitch: "C3" }, { id: 6, pitch: "E3" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 9, pitch: "C3" }, { id: 10, pitch: "E3" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 13, pitch: "C3" }, { id: 14, pitch: "E3" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 17, pitch: "C3" }, { id: 18, pitch: "F3" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 21, pitch: "C3" }, { id: 22, pitch: "F3" }] },
                { id: 203, duration: "half", dotted: false, notes: [{ id: 25, pitch: "C3" }, { id: 26, pitch: "E3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 29, pitch: "B2" }, { id: 30, pitch: "D3" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 33, pitch: "B2" }, { id: 34, pitch: "D3" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 37, pitch: "C3" }, { id: 38, pitch: "E3" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 41, pitch: "C3" }, { id: 42, pitch: "E3" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 45, pitch: "B2" }, { id: 46, pitch: "D3" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 49, pitch: "B2" }, { id: 50, pitch: "D3" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 53, pitch: "C3" }, { id: 54, pitch: "E3" }] }
              ]
            },
            // B Section
            {
              id: 5,
              events: [
                { id: 501, duration: "quarter", dotted: false, notes: [{ id: 57, pitch: "C3" }, { id: 58, pitch: "E3" }] },
                { id: 502, duration: "quarter", dotted: false, notes: [{ id: 61, pitch: "C3" }, { id: 62, pitch: "E3" }] },
                { id: 503, duration: "quarter", dotted: false, notes: [{ id: 65, pitch: "B2" }, { id: 66, pitch: "D3" }] },
                { id: 504, duration: "quarter", dotted: false, notes: [{ id: 69, pitch: "B2" }, { id: 70, pitch: "D3" }] }
              ]
            },
            {
              id: 6,
              events: [
                { id: 601, duration: "quarter", dotted: false, notes: [{ id: 73, pitch: "C3" }, { id: 74, pitch: "E3" }] },
                { id: 602, duration: "quarter", dotted: false, notes: [{ id: 77, pitch: "C3" }, { id: 78, pitch: "E3" }] },
                { id: 603, duration: "half", dotted: false, notes: [{ id: 81, pitch: "B2" }, { id: 82, pitch: "D3" }] }
              ]
            },
            {
              id: 7,
              events: [
                { id: 701, duration: "quarter", dotted: false, notes: [{ id: 85, pitch: "C3" }, { id: 86, pitch: "E3" }] },
                { id: 702, duration: "quarter", dotted: false, notes: [{ id: 89, pitch: "C3" }, { id: 90, pitch: "E3" }] },
                { id: 703, duration: "quarter", dotted: false, notes: [{ id: 93, pitch: "B2" }, { id: 94, pitch: "D3" }] },
                { id: 704, duration: "quarter", dotted: false, notes: [{ id: 97, pitch: "B2" }, { id: 98, pitch: "D3" }] }
              ]
            },
            {
              id: 8,
              events: [
                { id: 801, duration: "quarter", dotted: false, notes: [{ id: 101, pitch: "C3" }, { id: 102, pitch: "E3" }] },
                { id: 802, duration: "quarter", dotted: false, notes: [{ id: 105, pitch: "C3" }, { id: 106, pitch: "E3" }] },
                { id: 803, duration: "half", dotted: false, notes: [{ id: 109, pitch: "B2" }, { id: 110, pitch: "D3" }] }
              ]
            },
            // A Section Repeat
            {
              id: 9,
              events: [
                { id: 901, duration: "quarter", dotted: false, notes: [{ id: 113, pitch: "C3" }, { id: 114, pitch: "E3" }] },
                { id: 902, duration: "quarter", dotted: false, notes: [{ id: 117, pitch: "C3" }, { id: 118, pitch: "E3" }] },
                { id: 903, duration: "quarter", dotted: false, notes: [{ id: 121, pitch: "C3" }, { id: 122, pitch: "E3" }] },
                { id: 904, duration: "quarter", dotted: false, notes: [{ id: 125, pitch: "C3" }, { id: 126, pitch: "E3" }] }
              ]
            },
            {
              id: 10,
              events: [
                { id: 1001, duration: "quarter", dotted: false, notes: [{ id: 129, pitch: "C3" }, { id: 130, pitch: "F3" }] },
                { id: 1002, duration: "quarter", dotted: false, notes: [{ id: 133, pitch: "C3" }, { id: 134, pitch: "F3" }] },
                { id: 1003, duration: "half", dotted: false, notes: [{ id: 137, pitch: "C3" }, { id: 138, pitch: "E3" }] }
              ]
            },
            {
              id: 11,
              events: [
                { id: 1101, duration: "quarter", dotted: false, notes: [{ id: 141, pitch: "B2" }, { id: 142, pitch: "D3" }] },
                { id: 1102, duration: "quarter", dotted: false, notes: [{ id: 145, pitch: "B2" }, { id: 146, pitch: "D3" }] },
                { id: 1103, duration: "quarter", dotted: false, notes: [{ id: 149, pitch: "C3" }, { id: 150, pitch: "E3" }] },
                { id: 1104, duration: "quarter", dotted: false, notes: [{ id: 153, pitch: "C3" }, { id: 154, pitch: "E3" }] }
              ]
            },
            {
              id: 12,
              events: [
                { id: 1201, duration: "quarter", dotted: false, notes: [{ id: 157, pitch: "B2" }, { id: 158, pitch: "D3" }] },
                { id: 1202, duration: "quarter", dotted: false, notes: [{ id: 161, pitch: "B2" }, { id: 162, pitch: "D3" }] },
                { id: 1203, duration: "half", dotted: false, notes: [{ id: 165, pitch: "C3" }, { id: 166, pitch: "E3" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "amazing_grace",
    title: "Amazing Grace",
    score: {
      title: "Amazing Grace",
      timeSignature: "3/4",
      keySignature: "G",
      bpm: 72,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "G",
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 1, pitch: "D4" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "half", dotted: false, notes: [{ id: 4, pitch: "D4" }, { id: 5, pitch: "G4" }] },
                { id: 202, duration: "eighth", dotted: false, notes: [{ id: 7, pitch: "D4" }, { id: 9, pitch: "B4" }] },
                // Re-voiced for clarity
                { id: 203, duration: "eighth", dotted: false, notes: [{ id: 12, pitch: "D4" }, { id: 13, pitch: "G4" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "half", dotted: false, notes: [{ id: 16, pitch: "G4" }, { id: 17, pitch: "B4" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 20, pitch: "A4" }, { id: 21, pitch: "A4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "half", dotted: false, notes: [{ id: 24, pitch: "D4" }, { id: 25, pitch: "G4" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 28, pitch: "G4" }, { id: 29, pitch: "E4" }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: "half", dotted: false, notes: [{ id: 32, pitch: "D4" }, { id: 33, pitch: "D4" }] },
                { id: 502, duration: "quarter", dotted: false, notes: [{ id: 36, pitch: "D4" }, { id: 37, pitch: "D4" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "G",
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: "quarter", dotted: false, isRest: true, notes: [] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "half", dotted: false, notes: [{ id: 2, pitch: "G3" }, { id: 3, pitch: "B3" }] },
                { id: 202, duration: "eighth", dotted: false, notes: [{ id: 6, pitch: "G3" }, { id: 8, pitch: "G4" }] },
                // Placeholder or G3
                { id: 203, duration: "eighth", dotted: false, notes: [{ id: 10, pitch: "G3" }, { id: 11, pitch: "B3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "half", dotted: false, notes: [{ id: 14, pitch: "G3" }, { id: 15, pitch: "D4" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 18, pitch: "D4" }, { id: 19, pitch: "F#4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "half", dotted: false, notes: [{ id: 22, pitch: "G3" }, { id: 23, pitch: "B3" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 26, pitch: "C4" }, { id: 27, pitch: "E4" }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: "half", dotted: false, notes: [{ id: 30, pitch: "G3" }, { id: 31, pitch: "B3" }] },
                { id: 502, duration: "quarter", dotted: false, notes: [{ id: 34, pitch: "G3" }, { id: 35, pitch: "B3" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "frere_jacques",
    title: "Fr\xE8re Jacques",
    score: {
      title: "Fr\xE8re Jacques",
      timeSignature: "4/4",
      keySignature: "C",
      bpm: 120,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "C",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 3, pitch: "G4" }, { id: 4, pitch: "C5" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 7, pitch: "G4" }, { id: 8, pitch: "D5" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 11, pitch: "G4" }, { id: 12, pitch: "E5" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 15, pitch: "G4" }, { id: 16, pitch: "C5" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 19, pitch: "G4" }, { id: 20, pitch: "C5" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 23, pitch: "G4" }, { id: 24, pitch: "D5" }] },
                { id: 203, duration: "quarter", dotted: false, notes: [{ id: 27, pitch: "G4" }, { id: 28, pitch: "E5" }] },
                { id: 204, duration: "quarter", dotted: false, notes: [{ id: 31, pitch: "G4" }, { id: 32, pitch: "C5" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 35, pitch: "G4" }, { id: 36, pitch: "E5" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 39, pitch: "A4" }, { id: 40, pitch: "F5" }] },
                { id: 303, duration: "half", dotted: false, notes: [{ id: 43, pitch: "G4" }, { id: 44, pitch: "G5" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 47, pitch: "G4" }, { id: 48, pitch: "E5" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 51, pitch: "A4" }, { id: 52, pitch: "F5" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 55, pitch: "G4" }, { id: 56, pitch: "G5" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "C",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 1, pitch: "C3" }, { id: 2, pitch: "E3" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 5, pitch: "B2" }, { id: 6, pitch: "D3" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 9, pitch: "C3" }, { id: 10, pitch: "E3" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 13, pitch: "C3" }, { id: 14, pitch: "E3" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 17, pitch: "C3" }, { id: 18, pitch: "E3" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 21, pitch: "B2" }, { id: 22, pitch: "D3" }] },
                { id: 203, duration: "quarter", dotted: false, notes: [{ id: 25, pitch: "C3" }, { id: 26, pitch: "E3" }] },
                { id: 204, duration: "quarter", dotted: false, notes: [{ id: 29, pitch: "C3" }, { id: 30, pitch: "E3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 33, pitch: "C3" }, { id: 34, pitch: "E3" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 37, pitch: "C3" }, { id: 38, pitch: "F3" }] },
                { id: 303, duration: "half", dotted: false, notes: [{ id: 41, pitch: "C3" }, { id: 42, pitch: "E3" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 45, pitch: "C3" }, { id: 46, pitch: "E3" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 49, pitch: "C3" }, { id: 50, pitch: "F3" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 53, pitch: "C3" }, { id: 54, pitch: "E3" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "greensleeves",
    title: "Greensleeves",
    score: {
      title: "Greensleeves",
      timeSignature: "6/8",
      keySignature: "C",
      bpm: 80,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "C",
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: "eighth", dotted: false, notes: [{ id: 2, pitch: "A4" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 5, pitch: "C5" }] },
                { id: 202, duration: "eighth", dotted: false, notes: [{ id: 8, pitch: "D5" }] },
                { id: 203, duration: "eighth", dotted: true, notes: [{ id: 11, pitch: "E5" }] },
                { id: 204, duration: "sixteenth", dotted: false, notes: [{ id: 14, pitch: "F5" }] },
                { id: 205, duration: "eighth", dotted: false, notes: [{ id: 17, pitch: "E5" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 20, pitch: "D5" }] },
                { id: 302, duration: "eighth", dotted: false, notes: [{ id: 23, pitch: "B4" }] },
                { id: 303, duration: "eighth", dotted: true, notes: [{ id: 25, pitch: "G4" }] },
                { id: 304, duration: "sixteenth", dotted: false, notes: [{ id: 27, pitch: "A4" }] },
                { id: 305, duration: "eighth", dotted: false, notes: [{ id: 30, pitch: "B4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 33, pitch: "C5" }] },
                { id: 402, duration: "eighth", dotted: false, notes: [{ id: 35, pitch: "A4" }] },
                { id: 403, duration: "eighth", dotted: true, notes: [{ id: 37, pitch: "A4" }] },
                { id: 404, duration: "sixteenth", dotted: false, notes: [{ id: 39, pitch: "G#4" }] },
                { id: 405, duration: "eighth", dotted: false, notes: [{ id: 42, pitch: "A4" }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: "quarter", dotted: false, notes: [{ id: 45, pitch: "B4" }] },
                { id: 502, duration: "eighth", dotted: false, notes: [{ id: 47, pitch: "G#4" }] },
                { id: 503, duration: "quarter", dotted: false, notes: [{ id: 48, pitch: "E4" }] },
                { id: 504, duration: "eighth", dotted: false, notes: [{ id: 50, pitch: "A4" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "C",
          measures: [
            {
              id: 1,
              isPickup: true,
              events: [
                { id: 101, duration: "eighth", dotted: false, notes: [{ id: 1, pitch: "E3" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 3, pitch: "E3" }, { id: 4, pitch: "A3" }] },
                { id: 202, duration: "eighth", dotted: false, notes: [{ id: 6, pitch: "F3" }, { id: 7, pitch: "A3" }] },
                { id: 203, duration: "eighth", dotted: true, notes: [{ id: 9, pitch: "E3" }, { id: 10, pitch: "G#3" }] },
                { id: 204, duration: "sixteenth", dotted: false, notes: [{ id: 12, pitch: "F3" }, { id: 13, pitch: "A3" }] },
                { id: 205, duration: "eighth", dotted: false, notes: [{ id: 15, pitch: "E3" }, { id: 16, pitch: "G#3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 18, pitch: "E3" }, { id: 19, pitch: "G3" }] },
                { id: 302, duration: "eighth", dotted: false, notes: [{ id: 21, pitch: "D3" }, { id: 22, pitch: "G3" }] },
                { id: 303, duration: "eighth", dotted: true, notes: [{ id: 24, pitch: "E3" }] },
                { id: 304, duration: "sixteenth", dotted: false, notes: [{ id: 26, pitch: "E3" }] },
                { id: 305, duration: "eighth", dotted: false, notes: [{ id: 28, pitch: "D3" }, { id: 29, pitch: "G#3" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 31, pitch: "E3" }, { id: 32, pitch: "A3" }] },
                { id: 402, duration: "eighth", dotted: false, notes: [{ id: 34, pitch: "E3" }] },
                { id: 403, duration: "eighth", dotted: true, notes: [{ id: 36, pitch: "E3" }] },
                { id: 404, duration: "sixteenth", dotted: false, notes: [{ id: 38, pitch: "D3" }] },
                { id: 405, duration: "eighth", dotted: false, notes: [{ id: 41, pitch: "E3" }] }
              ]
            },
            {
              id: 5,
              events: [
                { id: 501, duration: "quarter", dotted: false, notes: [{ id: 43, pitch: "D3" }, { id: 44, pitch: "G#3" }] },
                { id: 502, duration: "eighth", dotted: false, notes: [{ id: 46, pitch: "D3" }] },
                { id: 503, duration: "quarter", dotted: false, isRest: true, notes: [] },
                // rest
                { id: 504, duration: "eighth", dotted: false, notes: [{ id: 49, pitch: "E3" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "sakura",
    title: "Sakura",
    score: {
      title: "Sakura",
      timeSignature: "4/4",
      keySignature: "C",
      bpm: 60,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "C",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 2, pitch: "A4" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 4, pitch: "A4" }] },
                { id: 103, duration: "half", dotted: false, notes: [{ id: 7, pitch: "B4" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 9, pitch: "A4" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 11, pitch: "A4" }] },
                { id: 203, duration: "half", dotted: false, notes: [{ id: 14, pitch: "B4" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 16, pitch: "A4" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 19, pitch: "B4" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 21, pitch: "A4" }, { id: 22, pitch: "C5" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 25, pitch: "B4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 27, pitch: "A4" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 30, pitch: "B4" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 32, pitch: "A4" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "C",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 1, pitch: "E3" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 3, pitch: "E3" }] },
                { id: 103, duration: "half", dotted: false, notes: [{ id: 5, pitch: "E3" }, { id: 6, pitch: "G#3" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 8, pitch: "E3" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 10, pitch: "E3" }] },
                { id: 203, duration: "half", dotted: false, notes: [{ id: 12, pitch: "E3" }, { id: 13, pitch: "G#3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 15, pitch: "E3" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 17, pitch: "E3" }, { id: 18, pitch: "G#3" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 20, pitch: "E3" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 23, pitch: "E3" }, { id: 24, pitch: "G#3" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 26, pitch: "E3" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 28, pitch: "E3" }, { id: 29, pitch: "G#3" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 31, pitch: "E3" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "old_macdonald",
    title: "Old Macdonald",
    score: {
      title: "Old Macdonald Had a Farm",
      timeSignature: "4/4",
      keySignature: "G",
      bpm: 120,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "G",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 3, pitch: "D4" }, { id: 4, pitch: "G4" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 7, pitch: "D4" }, { id: 8, pitch: "G4" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 11, pitch: "D4" }, { id: 12, pitch: "G4" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 15, pitch: "D4" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 18, pitch: "G4" }, { id: 19, pitch: "E4" }] },
                // C major chord -> C, E, G (in key G.. C natural?). Old macdonald is G major. C E G is C Major. B diminished? C major (IV).
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 22, pitch: "G4" }, { id: 23, pitch: "E4" }] },
                { id: 203, duration: "half", dotted: false, notes: [{ id: 26, pitch: "D4" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 29, pitch: "G4" }, { id: 30, pitch: "B4" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 33, pitch: "G4" }, { id: 34, pitch: "B4" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 36, pitch: "F#4" }, { id: 37, pitch: "A4" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 39, pitch: "F#4" }, { id: 40, pitch: "A4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "half", dotted: false, notes: [{ id: 43, pitch: "D4" }, { id: 44, pitch: "G4" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 47, pitch: "D4" }] },
                { id: 403, duration: "quarter", dotted: false, notes: [{ id: 50, pitch: "D4" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "G",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 1, pitch: "G3" }, { id: 2, pitch: "B3" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 5, pitch: "G3" }, { id: 6, pitch: "B3" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 9, pitch: "G3" }, { id: 10, pitch: "B3" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 13, pitch: "G3" }, { id: 14, pitch: "B3" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 16, pitch: "C4" }, { id: 17, pitch: "E4" }] },
                // C4, E4 -> Transpose down? C3, E3.
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 20, pitch: "C4" }, { id: 21, pitch: "E4" }] },
                { id: 203, duration: "half", dotted: false, notes: [{ id: 24, pitch: "G3" }, { id: 25, pitch: "B3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 27, pitch: "G3" }, { id: 28, pitch: "D4" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 31, pitch: "G3" }, { id: 32, pitch: "D4" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 35, pitch: "D4" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 38, pitch: "D4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "half", dotted: false, notes: [{ id: 41, pitch: "G3" }, { id: 42, pitch: "B3" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 45, pitch: "G3" }, { id: 46, pitch: "B3" }] },
                { id: 403, duration: "quarter", dotted: false, notes: [{ id: 48, pitch: "G3" }, { id: 49, pitch: "B3" }] }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    id: "oh_susanna",
    title: "Oh! Susanna",
    score: {
      title: "Oh! Susanna",
      timeSignature: "4/4",
      keySignature: "D",
      bpm: 116,
      staves: [
        {
          id: 1,
          clef: "treble",
          keySignature: "D",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 3, pitch: "A4" }, { id: 4, pitch: "D4" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 7, pitch: "G#4" }, { id: 8, pitch: "E4" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 11, pitch: "A4" }, { id: 12, pitch: "F#4" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 15, pitch: "A4" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 18, pitch: "A4" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 20, pitch: "G4" }, { id: 21, pitch: "B4" }] },
                { id: 203, duration: "quarter", dotted: false, notes: [{ id: 24, pitch: "A4" }] },
                { id: 204, duration: "quarter", dotted: false, notes: [{ id: 26, pitch: "F#4" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 29, pitch: "A4" }, { id: 30, pitch: "D4" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 33, pitch: "G#4" }, { id: 34, pitch: "E4" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 37, pitch: "A4" }, { id: 38, pitch: "F#4" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 41, pitch: "A4" }, { id: 42, pitch: "F#4" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 45, pitch: "G#4" }, { id: 46, pitch: "E4" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 49, pitch: "F#4" }, { id: 50, pitch: "D4" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 53, pitch: "G#4" }, { id: 54, pitch: "E4" }] }
              ]
            }
          ]
        },
        {
          id: 2,
          clef: "bass",
          keySignature: "D",
          measures: [
            {
              id: 1,
              events: [
                { id: 101, duration: "quarter", dotted: false, notes: [{ id: 1, pitch: "D3" }, { id: 2, pitch: "F#3" }] },
                { id: 102, duration: "quarter", dotted: false, notes: [{ id: 5, pitch: "B2" }, { id: 6, pitch: "E3" }] },
                { id: 103, duration: "quarter", dotted: false, notes: [{ id: 9, pitch: "D3" }, { id: 10, pitch: "F#3" }] },
                { id: 104, duration: "quarter", dotted: false, notes: [{ id: 13, pitch: "D3" }, { id: 14, pitch: "F#3" }] }
              ]
            },
            {
              id: 2,
              events: [
                { id: 201, duration: "quarter", dotted: false, notes: [{ id: 16, pitch: "D3" }, { id: 17, pitch: "F#3" }] },
                { id: 202, duration: "quarter", dotted: false, notes: [{ id: 19, pitch: "D3" }] },
                { id: 203, duration: "quarter", dotted: false, notes: [{ id: 22, pitch: "D3" }, { id: 23, pitch: "F#3" }] },
                { id: 204, duration: "quarter", dotted: false, notes: [{ id: 25, pitch: "D3" }] }
              ]
            },
            {
              id: 3,
              events: [
                { id: 301, duration: "quarter", dotted: false, notes: [{ id: 27, pitch: "D3" }, { id: 28, pitch: "F#3" }] },
                { id: 302, duration: "quarter", dotted: false, notes: [{ id: 31, pitch: "B2" }, { id: 32, pitch: "E3" }] },
                { id: 303, duration: "quarter", dotted: false, notes: [{ id: 35, pitch: "D3" }, { id: 36, pitch: "F#3" }] },
                { id: 304, duration: "quarter", dotted: false, notes: [{ id: 39, pitch: "D3" }, { id: 40, pitch: "F#3" }] }
              ]
            },
            {
              id: 4,
              events: [
                { id: 401, duration: "quarter", dotted: false, notes: [{ id: 43, pitch: "B2" }, { id: 44, pitch: "E3" }] },
                { id: 402, duration: "quarter", dotted: false, notes: [{ id: 47, pitch: "A2" }, { id: 48, pitch: "D3" }] },
                { id: 403, duration: "half", dotted: false, notes: [{ id: 51, pitch: "B2" }, { id: 52, pitch: "E3" }] }
              ]
            }
          ]
        }
      ]
    }
  }
];
var ScoreEditorContent = ({
  scale = 1,
  label,
  showToolbar = true,
  enableKeyboard = true,
  enablePlayback = true
}) => {
  const { theme } = useTheme();
  const scoreLogic = useScoreContext();
  const {
    score,
    dispatch,
    pendingClefChange,
    setPendingClefChange,
    selection,
    setSelection,
    setPreviewNote,
    activeDuration,
    isDotted,
    activeAccidental,
    scoreRef,
    updateNotePitch,
    handleNoteSelection,
    addChordToMeasure,
    focusScore
  } = scoreLogic;
  const [bpm, setBpm] = React3.useState(120);
  const [showHelp, setShowHelp] = React3.useState(false);
  const [isHoveringScore, setIsHoveringScore] = React3.useState(false);
  const [selectedInstrument, setSelectedInstrument] = React3.useState("bright");
  const [errorMsg, setErrorMsg] = React3.useState(null);
  const toolbarRef = React3.useRef(null);
  const scoreContainerRef = React3.useRef(null);
  const samplerLoaded = useSamplerStatus();
  useModifierKeys();
  const titleEditor = useTitleEditor(score.title, dispatch);
  const playback = usePlayback(score, bpm);
  const { midiStatus } = useMIDI(addChordToMeasure, activeDuration, isDotted, activeAccidental, scoreRef);
  useScoreInteraction({
    scoreRef,
    selection,
    onUpdatePitch: updateNotePitch,
    onSelectNote: handleNoteSelection
  });
  useKeyboardShortcuts(
    scoreLogic,
    playback,
    {
      isEditingTitle: titleEditor.isEditing,
      isHoveringScore,
      scoreContainerRef,
      isAnyMenuOpen: () => {
        var _a, _b;
        return ((_b = (_a = toolbarRef.current) == null ? void 0 : _a.isMenuOpen()) != null ? _b : false) || showHelp;
      },
      isDisabled: !enableKeyboard
    },
    { handleTitleCommit: titleEditor.commit }
  );
  const handleInstrumentChange = React3.useCallback((instrument) => {
    setSelectedInstrument(instrument);
    setInstrument(instrument);
  }, []);
  const handleEscape = React3.useCallback(() => {
    setTimeout(() => {
      var _a;
      return (_a = scoreContainerRef.current) == null ? void 0 : _a.focus();
    }, 0);
    focusScore();
  }, [focusScore]);
  const handleClefConfirm = React3.useCallback(() => {
    if (!pendingClefChange) return;
    dispatch(new SetSingleStaffCommand(pendingClefChange.targetClef));
    setPendingClefChange(null);
  }, [pendingClefChange, dispatch, setPendingClefChange]);
  const handleBackgroundClick = React3.useCallback(() => {
    setSelection({ staffIndex: 0, measureIndex: null, eventId: null, noteId: null });
  }, [setSelection]);
  const handleHoverChange = React3.useCallback((isHovering) => {
    var _a;
    setIsHoveringScore(isHovering);
    if (!isHovering) {
      const isFocused = document.activeElement === scoreContainerRef.current || ((_a = scoreContainerRef.current) == null ? void 0 : _a.contains(document.activeElement));
      if (!isFocused) setPreviewNote(null);
    }
  }, [setPreviewNote]);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "ScoreEditor backdrop-blur-md rounded-lg shadow-xl mb-8",
      style: {
        padding: ".5rem",
        backgroundColor: theme.panelBackground,
        borderColor: theme.border,
        borderWidth: "1px",
        color: theme.text,
        scrollbarWidth: "thin",
        scrollbarColor: `${theme.border} transparent`
      },
      children: [
        showToolbar && /* @__PURE__ */ jsxRuntime.jsx(
          Toolbar_default,
          {
            ref: toolbarRef,
            label,
            scoreTitle: score.title,
            isEditingTitle: titleEditor.isEditing,
            onEditingChange: titleEditor.setIsEditing,
            onTitleChange: (t) => dispatch(new UpdateTitleCommand(t)),
            isPlaying: playback.isPlaying,
            onPlayToggle: enablePlayback ? playback.handlePlayToggle : void 0,
            bpm,
            onBpmChange: setBpm,
            midiStatus,
            melodies: MELODIES,
            selectedInstrument,
            onInstrumentChange: handleInstrumentChange,
            samplerLoaded,
            errorMsg,
            onToggleHelp: () => setShowHelp(true),
            onEscape: handleEscape
          }
        ),
        showHelp && /* @__PURE__ */ jsxRuntime.jsx(Portal_default, { children: /* @__PURE__ */ jsxRuntime.jsx(ShortcutsOverlay_default, { onClose: () => setShowHelp(false) }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-8", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-4 relative z-20", children: /* @__PURE__ */ jsxRuntime.jsx(
            ScoreTitleField,
            {
              title: score.title,
              isEditing: titleEditor.isEditing,
              setIsEditing: titleEditor.setIsEditing,
              buffer: titleEditor.buffer,
              setBuffer: titleEditor.setBuffer,
              commit: titleEditor.commit,
              inputRef: titleEditor.inputRef,
              theme
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ScoreCanvas_default,
            {
              scale,
              playbackPosition: playback.playbackPosition,
              containerRef: scoreContainerRef,
              onHoverChange: handleHoverChange,
              onBackgroundClick: handleBackgroundClick,
              onKeySigClick: () => {
                var _a;
                return (_a = toolbarRef.current) == null ? void 0 : _a.openKeySigMenu();
              },
              onTimeSigClick: () => {
                var _a;
                return (_a = toolbarRef.current) == null ? void 0 : _a.openTimeSigMenu();
              },
              onClefClick: () => {
                var _a;
                return (_a = toolbarRef.current) == null ? void 0 : _a.openClefMenu();
              }
            }
          )
        ] }),
        pendingClefChange && /* @__PURE__ */ jsxRuntime.jsx(Portal_default, { children: /* @__PURE__ */ jsxRuntime.jsx(
          ConfirmDialog_default,
          {
            title: "Change to Single Staff?",
            message: `This will remove the ${pendingClefChange.targetClef === "treble" ? "bass" : "treble"} clef and all its contents.`,
            actions: [
              { label: "Cancel", onClick: () => setPendingClefChange(null), variant: "secondary" },
              {
                label: `Drop ${pendingClefChange.targetClef === "treble" ? "Bass" : "Treble"} Clef`,
                onClick: handleClefConfirm,
                variant: "danger"
              }
            ],
            onClose: () => setPendingClefChange(null)
          }
        ) })
      ]
    }
  );
};
var ScoreEditor = ({ scale = 1, label, initialData }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(ScoreProvider, { initialScore: initialData, children: /* @__PURE__ */ jsxRuntime.jsx(ScoreEditorContent, { scale, label }) });
};
var ScoreEditor_default = ScoreEditor;
var RiffScoreInner = ({ config: userConfig }) => {
  const { config, initialScore } = useRiffScore(userConfig);
  const { theme } = useTheme();
  const containerStyle = React3.useMemo(() => ({
    pointerEvents: config.interaction.isEnabled ? "auto" : "none",
    userSelect: "none"
  }), [config.interaction.isEnabled]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "RiffScore", style: containerStyle, children: /* @__PURE__ */ jsxRuntime.jsx(ScoreProvider, { initialScore, children: /* @__PURE__ */ jsxRuntime.jsx(
    ScoreEditorContent,
    {
      scale: config.ui.scale,
      showToolbar: config.ui.showToolbar,
      enableKeyboard: config.interaction.enableKeyboard,
      enablePlayback: config.interaction.enablePlayback
    }
  ) }) });
};
var RiffScore = ({ config }) => {
  var _a;
  return /* @__PURE__ */ jsxRuntime.jsx(ThemeProvider, { initialTheme: (_a = config == null ? void 0 : config.ui) == null ? void 0 : _a.theme, children: /* @__PURE__ */ jsxRuntime.jsx(RiffScoreInner, { config }) });
};
init_config();
var ConfigMenu = () => {
  const { theme, themeName, setTheme, zoom, setZoom } = useTheme();
  const [isOpen, setIsOpen] = React3.useState(false);
  const menuRef = React3__default.default.useRef(null);
  React3__default.default.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "ConfigMenu fixed top-4 right-4 z-50", ref: menuRef, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "p-2 rounded-full shadow-lg transition-colors",
        style: {
          backgroundColor: theme.buttonBackground,
          color: theme.text,
          border: `1px solid ${theme.border}`
        },
        children: isOpen ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { size: 24 }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Settings, { size: 24 })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "absolute top-12 right-0 w-64 p-4 rounded-lg shadow-xl backdrop-blur-md border",
        style: {
          backgroundColor: theme.panelBackground,
          borderColor: theme.border,
          color: theme.text
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-bold mb-4 text-sm uppercase tracking-wider", style: { color: theme.secondaryText }, children: "Configuration" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxRuntime.jsx("label", { className: "block text-xs font-bold mb-2 uppercase", style: { color: theme.secondaryText }, children: "Theme" }),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.keys(THEMES).map((name) => /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                onClick: () => setTheme(name),
                className: `px-3 py-2 rounded text-xs font-medium transition-all border ${themeName === name ? "ring-2 ring-offset-1 ring-offset-transparent" : "opacity-70 hover:opacity-100"}`,
                style: {
                  backgroundColor: THEMES[name].background,
                  color: THEMES[name].text,
                  borderColor: themeName === name ? theme.accent : THEMES[name].border,
                  "--tw-ring-color": theme.accent
                },
                children: name
              },
              name
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block text-xs font-bold mb-2 uppercase", style: { color: theme.secondaryText }, children: [
              "Zoom: ",
              Math.round(zoom * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "range",
                min: "0.5",
                max: "2.0",
                step: "0.1",
                value: zoom,
                onChange: (e) => setZoom(parseFloat(e.target.value)),
                className: "w-full h-2 rounded-lg appearance-none cursor-pointer",
                style: {
                  background: theme.border,
                  accentColor: theme.accent
                }
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-xs mt-1", style: { color: theme.secondaryText }, children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: "50%" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: "100%" }),
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: "200%" })
            ] })
          ] })
        ]
      }
    )
  ] });
};
var ConfigMenu_default = ConfigMenu;

exports.ConfigMenu = ConfigMenu_default;
exports.RiffScore = RiffScore;
exports.ScoreEditor = ScoreEditor_default;
exports.ScoreEditorContent = ScoreEditorContent;
exports.ScoreProvider = ScoreProvider;
exports.ThemeProvider = ThemeProvider;
exports.useScoreContext = useScoreContext;
exports.useTheme = useTheme;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map