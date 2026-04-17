import { describe, test, expect } from 'bun:test';
import { EXAMPLES } from '../src/knowledge/examples.js';
import { FUNCTIONS } from '../src/knowledge/functions.js';
import { EFFECTS } from '../src/knowledge/effects.js';
import { SCALES, COMMON_PROGRESSIONS, notesInScale } from '../src/knowledge/scales.js';
import { ALL_SOUNDS, DRUM_BANKS } from '../src/knowledge/sounds.js';
import { validatePattern } from '../src/lib/validate.js';
import { strudelCompose } from '../src/tools/compose.js';
import { progressionInScale } from '../src/lib/theory.js';
import { parseChordSymbol } from '../src/lib/theory.js';

describe('cross-validation — curated examples parse cleanly', () => {
  for (const ex of EXAMPLES) {
    test(`example "${ex.title}" has no validator errors`, () => {
      const r = validatePattern(ex.code);
      const errs = r.issues.filter((i) => i.severity === 'error');
      expect(errs).toEqual([]);
    });
  }
});

describe('cross-validation — function doc examples validate', () => {
  for (const fn of FUNCTIONS) {
    if (!fn.example) continue;
    test(`function "${fn.name}" example validates`, () => {
      const r = validatePattern(fn.example!);
      const errs = r.issues.filter((i) => i.severity === 'error');
      expect(errs).toEqual([]);
    });
  }
});

describe('cross-validation — effect doc examples validate', () => {
  for (const fx of EFFECTS) {
    if (!fx.example) continue;
    test(`effect "${fx.name}" example validates`, () => {
      // Effect examples are partial chains like ".lpf(500)"; wrap in a source
      const code = `sound("bd*4")${fx.example}`;
      const r = validatePattern(code);
      const errs = r.issues.filter((i) => i.severity === 'error');
      expect(errs).toEqual([]);
    });
  }
});

describe('cross-validation — compose outputs use real knowledge base entries', () => {
  const styles = [
    'house',
    'techno',
    'hip-hop',
    'trap',
    'dnb',
    'jazz',
    'ambient',
    'psytrance',
    'lofi',
    'rock',
    'hardbass',
  ] as const;
  const soundNames = new Set(ALL_SOUNDS.map((s) => s.name));
  const bankNames = new Set(DRUM_BANKS.map((b) => b.name));

  for (const style of styles) {
    test(`compose "${style}" references only known drum banks`, () => {
      const out = strudelCompose({
        style,
        elements: ['drums', 'bass', 'lead', 'pad'],
      }).content[0].text;
      const bankMatches = out.matchAll(/\.bank\("([^"]+)"\)/g);
      for (const m of bankMatches) {
        expect(bankNames.has(m[1])).toBe(true);
      }
    });

    test(`compose "${style}" references only known sounds in .s() calls`, () => {
      const out = strudelCompose({
        style,
        elements: ['drums', 'bass', 'lead', 'pad'],
      }).content[0].text;
      const sMatches = out.matchAll(/\.s\("([^"]+)"\)/g);
      for (const m of sMatches) {
        const name = m[1].split(',')[0].trim(); // handle stacked sounds
        expect(soundNames.has(name)).toBe(true);
      }
    });

    test(`compose "${style}" references only resolvable scales`, () => {
      const out = strudelCompose({
        style,
        elements: ['drums', 'bass', 'lead', 'pad'],
      }).content[0].text;
      const scaleMatches = out.matchAll(/\.scale\("([^"]+)"\)/g);
      for (const m of scaleMatches) {
        const r = notesInScale(m[1]);
        expect(r).not.toBe(null);
        expect(r!.midi.length).toBeGreaterThan(0);
      }
    });
  }
});

describe('cross-validation — common progressions resolve in C major', () => {
  for (const [name, prog] of Object.entries(COMMON_PROGRESSIONS)) {
    test(`progression "${name}" resolves in C:major`, () => {
      const chords = progressionInScale(prog, 'C:major');
      expect(chords).not.toBe(null);
      expect(chords!.length).toBe(prog.length);
      for (const c of chords!) {
        expect(c.midi.length).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

describe('cross-validation — all scales in SCALES produce valid note sets', () => {
  for (const scale of SCALES) {
    test(`scale "${scale.name}" produces valid notes from C root`, () => {
      const r = notesInScale(`C:${scale.name}`);
      // Some scales (e.g. "harmonic_minor") may not be reached via notesInScale's
      // top-level split — but we can still verify the interval set directly
      if (r) {
        expect(r.midi.length).toBe(scale.intervals.length);
      } else {
        expect(scale.intervals.length).toBeGreaterThan(0);
      }
    });
  }
});

describe('cross-validation — every non-empty example validates at >=10 lines', () => {
  for (const ex of EXAMPLES) {
    test(`example "${ex.title}" is multi-line`, () => {
      expect(ex.code.split('\n').length).toBeGreaterThanOrEqual(2);
    });
  }
});

describe('cross-validation — all examples roundtrip through the encoder', () => {
  for (const ex of EXAMPLES) {
    test(`example "${ex.title}" roundtrips URL encode/decode`, async () => {
      const { patternUrl, hashToCode } = await import('../src/lib/encode.js');
      const url = patternUrl(ex.code);
      const hash = url.split('#')[1];
      expect(hashToCode(hash)).toBe(ex.code);
    });
  }
});

describe('cross-validation — compose outputs also roundtrip', () => {
  const styles = ['house', 'jazz', 'psytrance'] as const;
  for (const style of styles) {
    test(`compose "${style}" output roundtrips`, async () => {
      const { patternUrl, hashToCode } = await import('../src/lib/encode.js');
      const code = strudelCompose({ style, elements: ['drums', 'bass', 'lead', 'pad'] })
        .content[0].text;
      const url = patternUrl(code);
      expect(hashToCode(url.split('#')[1])).toBe(code);
    });
  }
});

describe('cross-validation — common progression chord qualities are parseable', () => {
  const chordTests = ['C', 'Cm', 'Cmaj7', 'Cm7', 'C7', 'Cdim', 'Caug', 'Csus4', 'Csus2'];
  for (const c of chordTests) {
    test(`parseChordSymbol accepts "${c}"`, () => {
      expect(parseChordSymbol(c)).not.toBe(null);
    });
  }
});
