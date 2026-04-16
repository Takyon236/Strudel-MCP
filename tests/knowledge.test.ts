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
  VCSL_INSTRUMENTS,
  DIRT_SAMPLES,
  ALL_SOUNDS,
  searchSounds,
} from '../src/knowledge/sounds.js';
import { SCALES, COMMON_PROGRESSIONS } from '../src/knowledge/scales.js';
import { EXAMPLES, searchExamples } from '../src/knowledge/examples.js';
import { MINI_RULES, MINI_OVERVIEW } from '../src/knowledge/minispec.js';

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

describe('knowledge — effects regression (Batch 2)', () => {
  test('filter envelope controls exist', () => {
    expect(findEffect('lpenv')).toBeDefined();
    expect(findEffect('lpa')).toBeDefined();
    expect(findEffect('lpd')).toBeDefined();
    expect(findEffect('lps')).toBeDefined();
    expect(findEffect('lpr')).toBeDefined();
    expect(findEffect('hpenv')).toBeDefined();
    expect(findEffect('bpenv')).toBeDefined();
    expect(findEffect('ftype')).toBeDefined();
    expect(findEffect('djf')).toBeDefined();
  });

  test('orbit and ducking controls exist', () => {
    expect(findEffect('orbit')).toBeDefined();
    expect(findEffect('duckorbit')).toBeDefined();
    expect(findEffect('duckattack')).toBeDefined();
    expect(findEffect('duckdepth')).toBeDefined();
    expect(findEffect('compressor')).toBeDefined();
    expect(findEffect('postgain')).toBeDefined();
  });

  test('pitch envelope controls exist', () => {
    expect(findEffect('penv')).toBeDefined();
    expect(findEffect('pattack')).toBeDefined();
    expect(findEffect('pdecay')).toBeDefined();
    expect(findEffect('prelease')).toBeDefined();
    expect(findEffect('pcurve')).toBeDefined();
    expect(findEffect('panchor')).toBeDefined();
  });

  test('filter alias resolution — hcutoff resolves to hpf', () => {
    const e = EFFECTS.find((ef) => ef.aliases?.includes('hcutoff'));
    expect(e?.name).toBe('hpf');
    expect(findEffect('hcutoff')?.name).toBe('hpf');
  });

  test('filter alias resolution — cutoff resolves to lpf', () => {
    const e = EFFECTS.find((ef) => ef.aliases?.includes('cutoff'));
    expect(e?.name).toBe('lpf');
    expect(findEffect('cutoff')?.name).toBe('lpf');
  });

  test('filter alias resolution — bandf resolves to bpf', () => {
    expect(findEffect('bandf')?.name).toBe('bpf');
  });

  test('filter alias resolution — resonance resolves to lpq', () => {
    expect(findEffect('resonance')?.name).toBe('lpq');
  });

  test('filter alias resolution — hresonance resolves to hpq', () => {
    expect(findEffect('hresonance')?.name).toBe('hpq');
  });

  test('lpq range fix — range includes 50', () => {
    expect(findEffect('lpq')?.range).toMatch(/50/);
  });

  test('lpq summary fix — mentions self-oscillation', () => {
    expect(findEffect('lpq')?.summary).toMatch(/self-oscillat/);
  });

  test('modulation extras exist', () => {
    expect(findEffect('phaserdepth')).toBeDefined();
    expect(findEffect('phasercenter')).toBeDefined();
    expect(findEffect('phasersweep')).toBeDefined();
    expect(findEffect('tremolosync')).toBeDefined();
    expect(findEffect('tremolodepth')).toBeDefined();
    expect(findEffect('tremoloshape')).toBeDefined();
    expect(findEffect('vib')).toBeDefined();
    expect(findEffect('vibmod')).toBeDefined();
  });

  test('FM synth controls exist', () => {
    expect(findEffect('fmattack')).toBeDefined();
    expect(findEffect('fmdecay')).toBeDefined();
    expect(findEffect('fmsustain')).toBeDefined();
    expect(findEffect('fmenv')).toBeDefined();
  });

  test('distortion type controls exist', () => {
    expect(findEffect('distorttype')).toBeDefined();
    expect(findEffect('distortvol')).toBeDefined();
  });

  test('reverb/delay extras exist', () => {
    expect(findEffect('roomlp')).toBeDefined();
    expect(findEffect('roomdim')).toBeDefined();
    expect(findEffect('roomfade')).toBeDefined();
    expect(findEffect('iresponse')).toBeDefined();
    expect(findEffect('delaysync')).toBeDefined();
  });

  test('dfb resolves to delayfeedback', () => {
    expect(findEffect('dfb')?.name).toBe('delayfeedback');
  });

  test('EFFECT_NAMES includes all new aliases', () => {
    expect(EFFECT_NAMES.has('lpe')).toBe(true);
    expect(EFFECT_NAMES.has('hcutoff')).toBe(true);
    expect(EFFECT_NAMES.has('cutoff')).toBe(true);
    expect(EFFECT_NAMES.has('bandf')).toBe(true);
    expect(EFFECT_NAMES.has('resonance')).toBe(true);
    expect(EFFECT_NAMES.has('dfb')).toBe(true);
    expect(EFFECT_NAMES.has('o')).toBe(true);
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
        GM_INSTRUMENTS.length +
        VCSL_INSTRUMENTS.length +
        DIRT_SAMPLES.length,
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

describe('knowledge — functions regression', () => {
  test('modern voicing API is documented', () => {
    expect(findFunction('voicing')).toBeDefined();
    expect(findFunction('arp')).toBeDefined();
    expect(findFunction('voicings')).toBeDefined();
    expect(findFunction('rootNotes')).toBeDefined();
  });

  test('idiomatic modifiers are documented', () => {
    expect(findFunction('sometimesBy')).toBeDefined();
    expect(findFunction('degrade')).toBeDefined();
    expect(findFunction('degradeBy')).toBeDefined();
    expect(findFunction('layer')).toBeDefined();
    expect(findFunction('superimpose')).toBeDefined();
    expect(findFunction('echo')).toBeDefined();
  });

  test('sampling utilities are documented', () => {
    expect(findFunction('fit')).toBeDefined();
    expect(findFunction('splice')).toBeDefined();
    expect(findFunction('cut')).toBeDefined();
    expect(findFunction('run')).toBeDefined();
    expect(findFunction('irand')).toBeDefined();
    expect(findFunction('perlin')).toBeDefined();
  });

  test('struct example uses x ~ notation', () => {
    const fn = findFunction('struct');
    expect(fn?.example).toMatch(/x\s*~/);
  });
});

describe('knowledge — expanded sounds + mini', () => {
  test('new drum banks present', () => {
    const names = DRUM_BANKS.map(b => b.name);
    expect(names).toContain('RolandTR606');
    expect(names).toContain('LinnLM1');
    expect(names).toContain('OberheimDMX');
    expect(DRUM_BANKS.length).toBeGreaterThanOrEqual(18);
  });
  test('new GM instruments present', () => {
    const names = GM_INSTRUMENTS.map(g => g.name);
    expect(names).toContain('gm_vibraphone');
    expect(names).toContain('gm_epiano1');
    expect(names).toContain('gm_celesta');
  });
  test('mini-notation euclidean rule documented', () => {
    expect(MINI_RULES.some(r => r.name.toLowerCase().includes('euclidean'))).toBe(true);
  });
});

describe('knowledge — richer examples', () => {
  test('examples count expanded', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(22);
  });
  test('examples teach arpeggio via voicing', () => {
    const found = EXAMPLES.find(e => e.code.includes('.voicing()') && e.code.includes('.arp('));
    expect(found).toBeDefined();
  });
  test('examples teach sidechain via duckorbit', () => {
    const found = EXAMPLES.find(e => e.code.includes('duckorbit'));
    expect(found).toBeDefined();
  });
  test('examples teach filter envelope', () => {
    const found = EXAMPLES.find(e => e.code.includes('.lpenv('));
    expect(found).toBeDefined();
  });
  test('examples teach layer', () => {
    const found = EXAMPLES.find(e => e.code.includes('.layer('));
    expect(found).toBeDefined();
  });
});

describe('knowledge — gap batch functions', () => {
  test('arrange is registered', () => {
    const fn = findFunction('arrange');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('pattern');
    expect(fn?.example).toContain('arrange(');
  });

  test('pick is registered', () => {
    const fn = findFunction('pick');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('control');
  });

  test('pickOut is registered', () => {
    const fn = findFunction('pickOut');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('control');
  });

  test('pickRestart is registered', () => {
    const fn = findFunction('pickRestart');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('control');
  });

  test('signal functions: sine/saw/cosine/tri/rand', () => {
    for (const name of ['sine', 'saw', 'cosine', 'tri', 'rand']) {
      const fn = findFunction(name);
      expect(fn).toBeDefined();
      expect(fn?.category).toBe('source');
    }
  });

  test('brand is registered as source', () => {
    const fn = findFunction('brand');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('source');
  });

  test('brandBy is registered with signature', () => {
    const fn = findFunction('brandBy');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('source');
    expect(fn?.signature).toContain('probability');
  });

  test('sine2 alias resolves to sine', () => {
    const fn = findFunction('sine2');
    expect(fn).toBeDefined();
    expect(fn?.name).toBe('sine');
  });

  test('saw2 alias resolves to saw', () => {
    const fn = findFunction('saw2');
    expect(fn).toBeDefined();
    expect(fn?.name).toBe('saw');
  });

  test('cosine2 alias resolves to cosine', () => {
    const fn = findFunction('cosine2');
    expect(fn).toBeDefined();
    expect(fn?.name).toBe('cosine');
  });

  test('tri2 alias resolves to tri', () => {
    const fn = findFunction('tri2');
    expect(fn).toBeDefined();
    expect(fn?.name).toBe('tri');
  });

  test('register is registered as control', () => {
    const fn = findFunction('register');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('control');
    expect(fn?.signature).toContain('name');
  });

  test('swing is registered as time', () => {
    const fn = findFunction('swing');
    expect(fn).toBeDefined();
    expect(fn?.category).toBe('time');
    expect(fn?.example).toContain('swing(');
  });

  test('all gap-batch entries appear in FUNCTION_NAMES set', () => {
    const expected = ['arrange', 'pickOut', 'pickRestart', 'sine2', 'saw2', 'cosine2', 'tri2', 'brand', 'brandBy', 'register', 'swing'];
    for (const name of expected) {
      expect(FUNCTION_NAMES.has(name)).toBe(true);
    }
  });

  test('gap-batch examples are standalone (no bare leading dot)', () => {
    const gapFns = ['arrange', 'pickOut', 'pickRestart', 'sine', 'saw', 'cosine', 'tri', 'rand', 'brand', 'brandBy', 'register', 'swing'];
    for (const name of gapFns) {
      const fn = findFunction(name);
      if (fn?.example) {
        expect(fn.example.trimStart()).not.toMatch(/^\./);
      }
    }
  });
});

describe('knowledge — batch C aliases + labeled pattern', () => {
  test('att resolves to attack', () => {
    expect(findEffect('att')?.name).toBe('attack');
  });

  test('dec resolves to decay', () => {
    expect(findEffect('dec')?.name).toBe('decay');
  });

  test('sus resolves to sustain', () => {
    expect(findEffect('sus')?.name).toBe('sustain');
  });

  test('rel resolves to release', () => {
    expect(findEffect('rel')?.name).toBe('release');
  });

  test('vel resolves to velocity', () => {
    expect(findEffect('vel')?.name).toBe('velocity');
  });

  test('dist resolves to distort', () => {
    expect(findEffect('dist')?.name).toBe('distort');
  });

  test('EFFECT_NAMES includes new aliases', () => {
    expect(EFFECT_NAMES.has('att')).toBe(true);
    expect(EFFECT_NAMES.has('dec')).toBe(true);
    expect(EFFECT_NAMES.has('sus')).toBe(true);
    expect(EFFECT_NAMES.has('rel')).toBe(true);
    expect(EFFECT_NAMES.has('vel')).toBe(true);
    expect(EFFECT_NAMES.has('dist')).toBe(true);
  });

  test('labeled pattern rule present in MINI_RULES', () => {
    const rule = MINI_RULES.find(r => r.name === 'labeled pattern');
    expect(rule).toBeDefined();
    expect(rule?.syntax).toContain('$:');
    expect(rule?.example).toContain('$:');
  });

  test('MINI_OVERVIEW contains $:', () => {
    expect(MINI_OVERVIEW).toContain('$:');
  });
});
