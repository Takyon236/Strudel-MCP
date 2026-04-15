import { describe, test, expect } from 'bun:test';
import {
  FUNCTIONS,
  findFunction,
  functionsByCategory,
  FUNCTION_NAMES,
} from '../src/knowledge/functions.js';
import {
  EFFECTS,
  findEffect,
  effectsByCategory,
  EFFECT_NAMES,
} from '../src/knowledge/effects.js';
import {
  DRUMS,
  DRUM_BANKS,
  SYNTHS,
  SAMPLE_LIBRARIES,
  GM_INSTRUMENTS,
  ALL_SOUNDS,
  searchSounds,
} from '../src/knowledge/sounds.js';
import { SCALES, COMMON_PROGRESSIONS } from '../src/knowledge/scales.js';
import { EXAMPLES, searchExamples } from '../src/knowledge/examples.js';
import { MINI_RULES } from '../src/knowledge/minispec.js';

describe('knowledge — functions', () => {
  test('has core functions', () => {
    expect(findFunction('sound')).toBeDefined();
    expect(findFunction('note')).toBeDefined();
    expect(findFunction('stack')).toBeDefined();
    expect(findFunction('cat')).toBeDefined();
    expect(findFunction('jux')).toBeDefined();
  });

  test('findFunction case insensitive', () => {
    expect(findFunction('SOUND')).toBeDefined();
    expect(findFunction('Note')).toBeDefined();
  });

  test('findFunction strips leading dot', () => {
    expect(findFunction('.rev')).toBeDefined();
  });

  test('aliases resolve (s → sound)', () => {
    const s = findFunction('s');
    expect(s?.name).toBe('sound');
  });

  test('REGRESSION: density is alias of fast', () => {
    expect(findFunction('density')?.name).toBe('fast');
  });

  test('REGRESSION: hurry is a distinct function, NOT an alias of fast', () => {
    const hurry = findFunction('hurry');
    const fast = findFunction('fast');
    expect(hurry?.name).toBe('hurry');
    expect(fast?.name).toBe('fast');
    expect(hurry).not.toBe(fast);
    expect(hurry?.summary).toContain('pitch');
  });

  test('FUNCTION_NAMES includes all names + aliases', () => {
    expect(FUNCTION_NAMES.has('sound')).toBe(true);
    expect(FUNCTION_NAMES.has('s')).toBe(true);
    expect(FUNCTION_NAMES.has('hurry')).toBe(true);
    expect(FUNCTION_NAMES.has('density')).toBe(true);
  });

  test('functionsByCategory returns non-empty for each category', () => {
    const categories = [
      'source',
      'pattern',
      'time',
      'conditional',
      'control',
      'tempo',
    ] as const;
    for (const cat of categories) {
      expect(functionsByCategory(cat).length).toBeGreaterThan(0);
    }
  });
});

describe('knowledge — effects', () => {
  test('has core effects', () => {
    expect(findEffect('lpf')).toBeDefined();
    expect(findEffect('hpf')).toBeDefined();
    expect(findEffect('room')).toBeDefined();
    expect(findEffect('delay')).toBeDefined();
    expect(findEffect('gain')).toBeDefined();
    expect(findEffect('pan')).toBeDefined();
  });

  test('findEffect case insensitive and strips dot', () => {
    expect(findEffect('LPF')).toBeDefined();
    expect(findEffect('.room')).toBeDefined();
  });

  test('REGRESSION: size is an alias of roomsize', () => {
    const size = findEffect('size');
    expect(size?.name).toBe('roomsize');
  });

  test('EFFECT_NAMES includes aliases', () => {
    expect(EFFECT_NAMES.has('size')).toBe(true);
    expect(EFFECT_NAMES.has('roomsize')).toBe(true);
  });

  test('effectsByCategory has entries for every category', () => {
    const categories = [
      'filter',
      'dynamics',
      'spatial',
      'modulation',
      'envelope',
      'distortion',
      'pitch',
    ] as const;
    for (const cat of categories) {
      expect(effectsByCategory(cat).length).toBeGreaterThan(0);
    }
  });

  test('every effect has signature and summary', () => {
    for (const e of EFFECTS) {
      expect(e.name).toBeTruthy();
      expect(e.signature).toBeTruthy();
      expect(e.summary).toBeTruthy();
    }
  });
});

describe('knowledge — sounds', () => {
  test('drum voices exist', () => {
    const names = DRUMS.map((d) => d.name);
    expect(names).toContain('bd');
    expect(names).toContain('sd');
    expect(names).toContain('hh');
    expect(names).toContain('oh');
    expect(names).toContain('cp');
  });

  test('drum banks exist with Roland naming', () => {
    const banks = DRUM_BANKS.map((b) => b.name);
    expect(banks).toContain('RolandTR909');
    expect(banks).toContain('RolandTR808');
    expect(banks).toContain('AkaiLinn');
  });

  test('synth oscillators exist', () => {
    expect(SYNTHS.map((s) => s.name)).toContain('sawtooth');
    expect(SYNTHS.map((s) => s.name)).toContain('sine');
  });

  test('sample libraries include piano', () => {
    expect(SAMPLE_LIBRARIES.map((s) => s.name)).toContain('piano');
  });

  test('GM instruments exist', () => {
    expect(GM_INSTRUMENTS.length).toBeGreaterThan(5);
    expect(GM_INSTRUMENTS.every((g) => g.name.startsWith('gm_'))).toBe(true);
  });

  test('ALL_SOUNDS is union of categories', () => {
    expect(ALL_SOUNDS.length).toBe(
      DRUMS.length +
        DRUM_BANKS.length +
        SYNTHS.length +
        SAMPLE_LIBRARIES.length +
        GM_INSTRUMENTS.length,
    );
  });

  test('searchSounds finds by name substring', () => {
    const results = searchSounds('909');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes('909'))).toBe(true);
  });

  test('searchSounds finds by description keyword', () => {
    const results = searchSounds('bass');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('knowledge — scales', () => {
  test('core scales defined', () => {
    const names = SCALES.map((s) => s.name);
    expect(names).toContain('major');
    expect(names).toContain('minor');
    expect(names).toContain('dorian');
    expect(names).toContain('phrygian');
    expect(names).toContain('lydian');
    expect(names).toContain('mixolydian');
    expect(names).toContain('minor_pentatonic');
    expect(names).toContain('blues');
  });

  test('every scale has 5-12 intervals', () => {
    for (const s of SCALES) {
      expect(s.intervals.length).toBeGreaterThanOrEqual(5);
      expect(s.intervals.length).toBeLessThanOrEqual(12);
      expect(s.intervals[0]).toBe(0);
    }
  });

  test('common progressions map defined', () => {
    expect(COMMON_PROGRESSIONS['I-V-vi-IV']).toBeDefined();
    expect(COMMON_PROGRESSIONS['ii-V-I']).toBeDefined();
    expect(COMMON_PROGRESSIONS['12-bar-blues']).toBeDefined();
  });
});

describe('knowledge — examples', () => {
  test('has at least 10 examples', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(10);
  });

  test('every example has code and tags', () => {
    for (const ex of EXAMPLES) {
      expect(ex.title).toBeTruthy();
      expect(ex.code).toBeTruthy();
      expect(ex.tags.length).toBeGreaterThan(0);
    }
  });

  test('searchExamples by tag', () => {
    const results = searchExamples('house');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tags.some((t) => t === 'house')).toBe(true);
  });

  test('searchExamples returns defaults on empty query', () => {
    expect(searchExamples('', 3).length).toBe(3);
  });

  test('searchExamples respects limit', () => {
    expect(searchExamples('drums', 2).length).toBeLessThanOrEqual(2);
  });
});

describe('knowledge — mini-notation rules', () => {
  test('all core symbols documented', () => {
    const syms = MINI_RULES.map((r) => r.syntax);
    expect(syms.some((s) => s.includes(' '))).toBe(true); // sequence
    expect(syms.some((s) => s.includes('~'))).toBe(true); // rest
    expect(syms.some((s) => s.includes('['))).toBe(true); // group
    expect(syms.some((s) => s.includes('<'))).toBe(true); // alternation
    expect(syms.some((s) => s.includes('*'))).toBe(true); // repeat
  });

  test('every rule has example', () => {
    for (const r of MINI_RULES) {
      expect(r.example).toBeTruthy();
    }
  });
});
