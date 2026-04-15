export interface FunctionDoc {
  name: string;
  category: 'source' | 'pattern' | 'effect' | 'time' | 'conditional' | 'control' | 'tempo';
  signature: string;
  summary: string;
  params?: string;
  example?: string;
  aliases?: string[];
}

export const FUNCTIONS: FunctionDoc[] = [
  {
    name: 'sound',
    aliases: ['s'],
    category: 'source',
    signature: 'sound(name)',
    summary: 'Play a named sample or synth. Accepts a pattern string.',
    example: 'sound("bd sd hh oh")',
  },
  {
    name: 'note',
    category: 'source',
    signature: 'note(pitch)',
    summary: 'Play a pitch (MIDI number, letter name, or sharps/flats). Works with samples and synths.',
    example: 'note("c e g b").sound("piano")',
  },
  {
    name: 'n',
    category: 'source',
    signature: 'n(index)',
    summary: 'Sample index OR scale degree (when combined with .scale()).',
    example: 'n("0 2 4 6").scale("C:minor").sound("piano")',
  },
  {
    name: 'scale',
    category: 'control',
    signature: '.scale(spec)',
    summary: 'Map n() values onto a scale. Format: "Root:type" e.g. "C:major", "A2:minor", "D:dorian".',
    example: 'n("<0 2 4 6>*4").scale("C:minor:pentatonic")',
  },
  {
    name: 'chord',
    category: 'source',
    signature: '.chord(pattern)',
    summary: 'Chord pattern. Pair with .voicing() to voice it.',
    example: 'chord("<C^7 Am7>").voicing()',
  },
  {
    name: 'voicing',
    category: 'control',
    signature: '.voicing()',
    summary: 'Voice a chord pattern using the ireal dictionary.',
  },
  {
    name: 'dict',
    category: 'control',
    signature: '.dict(name)',
    summary: 'Select the chord voicing dictionary (e.g. "ireal").',
  },
  {
    name: 'bank',
    category: 'control',
    signature: '.bank(name)',
    summary: 'Select drum bank. Banks include RolandTR909/808/707/505, AkaiLinn, RhythmAce.',
    example: 'sound("bd*4, [~ cp]*2").bank("RolandTR909")',
  },
  {
    name: 'stack',
    category: 'pattern',
    signature: 'stack(...patterns)',
    summary: 'Play multiple patterns simultaneously (polyphonic layering).',
    example: 'stack(sound("bd*4"), sound("hh*8"))',
  },
  {
    name: 'cat',
    category: 'pattern',
    signature: 'cat(...patterns)',
    summary: 'Concatenate patterns in sequence, one per cycle.',
  },
  {
    name: 'seq',
    category: 'pattern',
    signature: 'seq(...patterns)',
    summary: 'Play patterns in sequence within a single cycle.',
  },
  {
    name: 'rev',
    category: 'pattern',
    signature: '.rev()',
    summary: 'Reverse a pattern.',
    example: 'note("c d e f").rev()',
  },
  {
    name: 'jux',
    category: 'pattern',
    signature: '.jux(fn)',
    summary: 'Stereo split: left = original, right = modified by fn.',
    example: 'note("c e g").jux(rev)',
  },
  {
    name: 'add',
    category: 'pattern',
    signature: '.add(n)',
    summary: 'Add a number (or note offset) to every value in the pattern.',
    example: 'note("c e g").add("<0 7 12>")',
  },
  {
    name: 'sub',
    category: 'pattern',
    signature: '.sub(n)',
    summary: 'Subtract from every value in the pattern.',
  },
  {
    name: 'ply',
    category: 'pattern',
    signature: '.ply(n)',
    summary: 'Repeat each event n times within its duration.',
    example: 'sound("bd sd").ply(2)',
  },
  {
    name: 'off',
    category: 'pattern',
    signature: '.off(t, fn)',
    summary: 'Copy the pattern offset by t cycles and apply fn to the copy.',
    example: 'note("c e g").off(1/8, x => x.add(7))',
  },
  {
    name: 'chunk',
    category: 'pattern',
    signature: '.chunk(n, fn)',
    summary: 'Divide pattern into n chunks; apply fn to a different chunk each cycle.',
    example: 'note("c e g b").chunk(4, rev)',
  },
  {
    name: 'iter',
    category: 'pattern',
    signature: '.iter(n)',
    summary: 'Shift pattern by 1/n each cycle, rotating through the sequence.',
  },
  {
    name: 'stutter',
    category: 'pattern',
    signature: '.stutter(n, t)',
    summary: 'Repeat each event n times over time t.',
  },
  {
    name: 'chop',
    category: 'pattern',
    signature: '.chop(n)',
    summary: 'Cut each sample into n slices and play them in order.',
    example: 's("jazz").chop(16)',
  },
  {
    name: 'striate',
    category: 'pattern',
    signature: '.striate(n)',
    summary: 'Interleave slices across cycles (compare to .chop).',
  },
  {
    name: 'slice',
    category: 'pattern',
    signature: '.slice(n, idx)',
    summary: 'Divide sample into n slices; play slice idx pattern.',
    example: 's("jazz").slice(8, "0 2 4 6")',
  },
  {
    name: 'press',
    category: 'pattern',
    signature: '.press()',
    summary: 'Push events to the off-beat (useful for syncopation).',
  },
  {
    name: 'fast',
    aliases: ['density'],
    category: 'time',
    signature: '.fast(n)',
    summary: 'Speed pattern up by factor n. Pitch is unchanged.',
  },
  {
    name: 'hurry',
    category: 'time',
    signature: '.hurry(n)',
    summary: 'Speed pattern up by factor n AND raise sample pitch by n (equivalent to .fast(n).speed(n)).',
    example: 's("bd sd hh oh").hurry(2)',
  },
  {
    name: 'slow',
    category: 'time',
    signature: '.slow(n)',
    summary: 'Slow pattern down by factor n.',
  },
  {
    name: 'early',
    category: 'time',
    signature: '.early(t)',
    summary: 'Shift pattern earlier by t cycles.',
  },
  {
    name: 'late',
    category: 'time',
    signature: '.late(t)',
    summary: 'Shift pattern later by t cycles. Useful for humanization.',
    example: '.late("[0 .03]*8")',
  },
  {
    name: 'sometimes',
    category: 'conditional',
    signature: '.sometimes(fn)',
    summary: 'Apply fn with 50% probability each cycle.',
  },
  {
    name: 'often',
    category: 'conditional',
    signature: '.often(fn)',
    summary: 'Apply fn with 75% probability each cycle.',
  },
  {
    name: 'rarely',
    category: 'conditional',
    signature: '.rarely(fn)',
    summary: 'Apply fn with 25% probability each cycle.',
  },
  {
    name: 'almostNever',
    category: 'conditional',
    signature: '.almostNever(fn)',
    summary: 'Apply fn with 10% probability each cycle.',
  },
  {
    name: 'almostAlways',
    category: 'conditional',
    signature: '.almostAlways(fn)',
    summary: 'Apply fn with 90% probability each cycle.',
  },
  {
    name: 'every',
    category: 'conditional',
    signature: '.every(n, fn)',
    summary: 'Apply fn every n cycles.',
    example: 'note("c e g").every(4, rev)',
  },
  {
    name: 'mask',
    category: 'conditional',
    signature: '.mask(pattern)',
    summary: 'Gate events by a boolean mask pattern.',
  },
  {
    name: 'struct',
    category: 'conditional',
    signature: '.struct(pattern)',
    summary: 'Apply a rhythmic structure to a value pattern.',
    example: 'note("c e g").struct("1 0 1 1")',
  },
  {
    name: 'segment',
    category: 'time',
    signature: '.segment(n)',
    summary: 'Sample the pattern n times per cycle, holding each value.',
  },
  {
    name: 'clip',
    category: 'effect',
    signature: '.clip(n)',
    summary: 'Set duration of each note as fraction of its event length.',
  },
  {
    name: 'set',
    category: 'control',
    signature: '.set(pattern)',
    summary: 'Overwrite values with another pattern.',
  },
  {
    name: 'setcps',
    category: 'tempo',
    signature: 'setcps(n)',
    summary: 'Set cycles per second. 1 cps = 1 cycle/sec. For BPM: setcps(bpm/60/4).',
    example: 'setcps(120/60/4)',
  },
  {
    name: 'setcpm',
    category: 'tempo',
    signature: 'setcpm(n)',
    summary: 'Set cycles per minute. For a typical 4/4 beat: setcpm(bpm/4).',
    example: 'setcpm(120/4)',
  },
  {
    name: 'samples',
    category: 'source',
    signature: 'samples(spec, base?)',
    summary: 'Load samples. Accepts an object map, JSON URL, or "github:user/repo" shortcut.',
    example: 'samples("github:tidalcycles/dirt-samples")',
  },
];

export function findFunction(nameOrAlias: string): FunctionDoc | undefined {
  const lower = nameOrAlias.toLowerCase().replace(/^\./, '');
  return FUNCTIONS.find(
    (f) =>
      f.name.toLowerCase() === lower ||
      f.aliases?.some((a) => a.toLowerCase() === lower),
  );
}

export function functionsByCategory(category: FunctionDoc['category']): FunctionDoc[] {
  return FUNCTIONS.filter((f) => f.category === category);
}

export const FUNCTION_NAMES: ReadonlySet<string> = new Set(
  FUNCTIONS.flatMap((f) => [f.name, ...(f.aliases ?? [])]),
);
