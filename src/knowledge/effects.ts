export interface EffectDoc {
  name: string;
  signature: string;
  summary: string;
  range?: string;
  example?: string;
  category: 'filter' | 'dynamics' | 'spatial' | 'modulation' | 'envelope' | 'distortion' | 'pitch';
  aliases?: string[];
}

export const EFFECTS: EffectDoc[] = [
  {
    name: 'lpf',
    category: 'filter',
    signature: '.lpf(hz)',
    summary: 'Low-pass filter. Cutoff in Hz.',
    range: '20–20000 (typical 200–8000)',
    example: '.lpf(sine.range(500, 4000).slow(4))',
  },
  {
    name: 'lpq',
    category: 'filter',
    signature: '.lpq(q)',
    summary: 'Resonance for the low-pass filter.',
    range: '0–30 (typical 0–10)',
  },
  {
    name: 'hpf',
    category: 'filter',
    signature: '.hpf(hz)',
    summary: 'High-pass filter. Cutoff in Hz.',
    range: '20–20000',
  },
  {
    name: 'hpq',
    category: 'filter',
    signature: '.hpq(q)',
    summary: 'Resonance for the high-pass filter.',
    range: '0–30',
  },
  {
    name: 'bpf',
    category: 'filter',
    signature: '.bpf(hz)',
    summary: 'Band-pass filter.',
    range: '20–20000',
  },
  {
    name: 'bpq',
    category: 'filter',
    signature: '.bpq(q)',
    summary: 'Resonance for the band-pass filter.',
  },
  {
    name: 'vowel',
    category: 'filter',
    signature: '.vowel(v)',
    summary: 'Formant/vowel filter. Accepts "a", "e", "i", "o", "u" in a pattern.',
    example: '.vowel("<a e i o>")',
  },
  {
    name: 'gain',
    category: 'dynamics',
    signature: '.gain(amount)',
    summary: 'Volume. Patternable.',
    range: '0–1.5',
    example: '.gain("[.5 1]*4")',
  },
  {
    name: 'velocity',
    category: 'dynamics',
    signature: '.velocity(v)',
    summary: 'Note velocity (MIDI-style).',
    range: '0–1',
  },
  {
    name: 'pan',
    category: 'spatial',
    signature: '.pan(pos)',
    summary: 'Stereo position. 0 = left, 0.5 = center, 1 = right.',
    range: '0–1',
    example: '.pan(sine.range(0, 1).slow(4))',
  },
  {
    name: 'room',
    category: 'spatial',
    signature: '.room(wet)',
    summary: 'Reverb wet amount.',
    range: '0–1 (can go higher)',
  },
  {
    name: 'roomsize',
    aliases: ['size'],
    category: 'spatial',
    signature: '.roomsize(size)',
    summary: 'Reverb size/decay. Also aliased as .size().',
    range: '0–10',
  },
  {
    name: 'delay',
    category: 'spatial',
    signature: '.delay(wet) or .delay("wet:time:feedback")',
    summary: 'Delay effect. Compact form packs wet, time, feedback.',
    range: '0–1 for wet/feedback',
    example: '.delay(".8:.125:.6")',
  },
  {
    name: 'delaytime',
    category: 'spatial',
    signature: '.delaytime(t)',
    summary: 'Delay time in cycles.',
    range: '0–2',
  },
  {
    name: 'delayfeedback',
    category: 'spatial',
    signature: '.delayfeedback(amount)',
    summary: 'Delay feedback amount.',
    range: '0–1 (>.95 → runaway)',
  },
  {
    name: 'phaser',
    category: 'modulation',
    signature: '.phaser(rate)',
    summary: 'Phaser effect.',
    range: '0–10',
  },
  {
    name: 'tremolo',
    category: 'modulation',
    signature: '.tremolo(rate)',
    summary: 'Amplitude modulation tremolo.',
  },
  {
    name: 'vibrato',
    category: 'modulation',
    signature: '.vibrato(rate)',
    summary: 'Pitch modulation vibrato.',
  },
  {
    name: 'shape',
    category: 'distortion',
    signature: '.shape(amount)',
    summary: 'Waveshaping distortion.',
    range: '0–1',
  },
  {
    name: 'distort',
    category: 'distortion',
    signature: '.distort(amount)',
    summary: 'Distortion amount.',
    range: '0–1',
  },
  {
    name: 'crush',
    category: 'distortion',
    signature: '.crush(bits)',
    summary: 'Bitcrusher. Lower bits = more crunch.',
    range: '1–16',
  },
  {
    name: 'coarse',
    category: 'distortion',
    signature: '.coarse(n)',
    summary: 'Sample-rate reduction.',
  },
  {
    name: 'attack',
    category: 'envelope',
    signature: '.attack(seconds)',
    summary: 'Envelope attack time.',
    range: '0–5',
  },
  {
    name: 'decay',
    category: 'envelope',
    signature: '.decay(seconds)',
    summary: 'Envelope decay time.',
  },
  {
    name: 'sustain',
    category: 'envelope',
    signature: '.sustain(level)',
    summary: 'Envelope sustain level.',
    range: '0–1',
  },
  {
    name: 'release',
    category: 'envelope',
    signature: '.release(seconds)',
    summary: 'Envelope release time.',
  },
  {
    name: 'adsr',
    category: 'envelope',
    signature: '.adsr("a:d:s:r")',
    summary: 'Compact ADSR shorthand.',
    example: '.adsr(".02:.1:.5:.3")',
  },
  {
    name: 'speed',
    category: 'pitch',
    signature: '.speed(rate)',
    summary: 'Playback rate. Negative reverses the sample.',
    range: '-4–4',
  },
  {
    name: 'fm',
    category: 'modulation',
    signature: '.fm(index)',
    summary: 'FM modulation index (for the default FM synth voice).',
    range: '0–10',
  },
  {
    name: 'fmh',
    category: 'modulation',
    signature: '.fmh(harmonicity)',
    summary: 'FM harmonicity ratio.',
  },
  {
    name: 'begin',
    category: 'pitch',
    signature: '.begin(t)',
    summary: 'Start sample at fraction t (0–1).',
  },
  {
    name: 'end',
    category: 'pitch',
    signature: '.end(t)',
    summary: 'End sample at fraction t (0–1).',
  },
  {
    name: 'loop',
    category: 'pitch',
    signature: '.loop(n)',
    summary: 'Loop sample n times.',
  },
];

export function findEffect(name: string): EffectDoc | undefined {
  const lower = name.toLowerCase().replace(/^\./, '');
  return EFFECTS.find(
    (e) =>
      e.name.toLowerCase() === lower ||
      e.aliases?.some((a) => a.toLowerCase() === lower),
  );
}

export function effectsByCategory(category: EffectDoc['category']): EffectDoc[] {
  return EFFECTS.filter((e) => e.category === category);
}

export const EFFECT_NAMES: ReadonlySet<string> = new Set(
  EFFECTS.flatMap((e) => [e.name, ...(e.aliases ?? [])]),
);
