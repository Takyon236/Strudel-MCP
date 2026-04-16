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
    summary: 'Pattern of chord symbols. Pair with `.voicing()` for automatic voice-leading, or `.rootNotes(2)` to extract basslines, or `.arp(...)` to arpeggiate.',
    example: 'chord("<C Am F G>").voicing().s("gm_epiano1")',
  },
  {
    name: 'voicing',
    category: 'control',
    signature: '.voicing()',
    summary: 'Voice a chord pattern for automatic voice leading. The default dictionary is iReal-inspired so `.chord("Cm7").voicing()` gives you smooth transitions with no further setup. For explicit dict selection use .dict(name) OR the .voicings(name) overload.',
    example: 'chord("<Am C D F>").voicing().room(.5)',
  },
  {
    name: 'dict',
    category: 'control',
    signature: '.dict(name)',
    summary: 'Select the chord voicing dictionary. The default is iReal-inspired; other options include "lefthand" (rootless jazz). Can be combined with `.chord(...).voicing()` or set via `.voicings(name)`.',
  },
  {
    name: 'bank',
    category: 'control',
    signature: '.bank(name)',
    summary: 'Select drum bank. Banks include RolandTR909 RolandTR808 RolandTR707 RolandTR606 RolandTR505 LinnLM1 LinnDrum AlesisHR16 OberheimDMX CasioRZ1 and dozens more from tidal-drum-machines.',
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
    summary: 'Divide sample into n slices; play slice idx pattern. Pair with .fit() to span exactly one cycle and .cut(n) to prevent overlapping hits from muddying the chop.',
    example: 's("amen").fit().slice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2").cut(1)',
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
    summary: "Apply a rhythmic structure to a value pattern. Use 'x' for hit and '~' (or '-') for rest. Common example: a chord held by rhythm stabs — `note('c,eb,g').struct('x ~ x ~ ~ x ~ x')`.",
    example: 'note("c e g").struct("x ~ x x")',
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
  // Change 1.1 — modern tonal/voicing API
  {
    name: 'voicings',
    category: 'control',
    signature: '.voicings(dict)',
    summary: "Like voicing() but with an explicit dictionary name. Built-in dictionaries include the default iReal-like set and 'lefthand' (rootless jazz). You can also register custom dicts with addVoicings().",
    example: 'chord("<Cmaj7 Dm7 G7 Cmaj7>").voicings("lefthand").note()',
  },
  {
    name: 'arp',
    category: 'pattern',
    signature: '.arp(pattern)',
    summary: 'Arpeggiate a voiced chord by indexing its notes. Pair with .voicing(). The pattern string references note indices within the current voicing (0 = lowest, 1 = next, etc).',
    example: 'chord("<C Am F G>").voicing().arp("0 2 1 3").note()',
  },
  {
    name: 'rootNotes',
    category: 'control',
    signature: '.rootNotes(octave)',
    summary: 'Extract the root note from a chord pattern. Useful for pairing a bassline with chord stabs: `chord("<C Am F G>").rootNotes(2)` yields `<c2 a1 f1 g1>`.',
    example: 'chord("<Cmaj7 Dm7 G7>").rootNotes(2).note().s("sawtooth")',
  },
  {
    name: 'transpose',
    category: 'pattern',
    signature: '.transpose(semitones)',
    summary: 'Shift every note by N semitones. Accepts patternable values for modulation.',
    example: 'note("c e g").transpose("<0 5 7>")',
  },
  {
    name: 'scaleTranspose',
    category: 'pattern',
    signature: '.scaleTranspose(steps)',
    summary: 'Transpose by N scale steps rather than semitones. Requires the pattern to have a .scale(...) applied.',
    example: 'n("0 2 4").scale("C:minor").scaleTranspose("<0 -1 -2>")',
  },
  {
    name: 'layer',
    category: 'pattern',
    signature: '.layer(...fns)',
    summary: 'Run multiple copies of the pattern through different transformation functions in parallel. Like stack, but each layer is a function that takes and returns the pattern.',
    example: 'note("<g1 bb1 d2 f1>").layer(x=>x.s("sawtooth"), x=>x.s("square").add(note(12)))',
  },
  {
    name: 'superimpose',
    category: 'pattern',
    signature: '.superimpose(fn)',
    summary: 'Layer the original pattern AND the result of fn applied to it. Like jux without the L/R split — both versions play together in full stereo.',
    example: 'note("c e g").superimpose(x => x.add(12))',
  },
  // Change 1.2 — random/conditional modifiers
  {
    name: 'degrade',
    category: 'conditional',
    signature: '.degrade()',
    summary: 'Drop 50% of events randomly. Short for .degradeBy(.5). Adds natural rhythmic variation.',
    example: 's("hh*16").degrade()',
  },
  {
    name: 'degradeBy',
    category: 'conditional',
    signature: '.degradeBy(amount)',
    summary: 'Drop events with a given probability (0 = none, 1 = all).',
    example: 's("hh*16").degradeBy(.25)',
  },
  {
    name: 'sometimesBy',
    category: 'conditional',
    signature: '.sometimesBy(prob, fn)',
    summary: 'Apply fn with the given probability each cycle. `sometimes` is `sometimesBy(.5)`, `often` is `.75`, `rarely` is `.25`.',
    example: 's("bd*4").sometimesBy(.3, x => x.ply(2))',
  },
  {
    name: 'choose',
    category: 'pattern',
    signature: 'choose(...values)',
    summary: 'Randomly pick one of the arguments for each event. Returns a signal-like pattern.',
    example: 'note("c2 g2").s(choose("sine", "triangle", "sawtooth"))',
  },
  {
    name: 'wchoose',
    category: 'pattern',
    signature: 'wchoose(...[value, weight])',
    summary: 'Weighted random choice. Each argument is a [value, weight] pair.',
    example: 'note("c2 g2").s(wchoose(["sine",10], ["triangle",1]))',
  },
  {
    name: 'firstOf',
    category: 'conditional',
    signature: '.firstOf(n, fn)',
    summary: 'Apply fn on the first of every n cycles.',
    example: 'note("c3 d3 e3 g3").firstOf(4, x => x.rev())',
  },
  {
    name: 'lastOf',
    category: 'conditional',
    signature: '.lastOf(n, fn)',
    summary: 'Apply fn on the last of every n cycles. Useful for fills.',
    example: 's("bd*4").lastOf(4, x => x.fast(2))',
  },
  {
    name: 'when',
    category: 'conditional',
    signature: '.when(boolPattern, fn)',
    summary: 'Apply fn wherever boolPattern is truthy. Lets a binary mini-string gate the transformation.',
    example: 'note("c3 eb3 g3").when("<0 1>/2", x => x.sub(5))',
  },
  // Change 1.3 — time and accumulation modifiers
  {
    name: 'palindrome',
    category: 'time',
    signature: '.palindrome()',
    summary: 'Alternate forward and reversed cycles. Equivalent to `cat(p, p.rev())` but atomic.',
    example: 'note("c d e g").palindrome()',
  },
  {
    name: 'compress',
    category: 'time',
    signature: '.compress(start, end)',
    summary: 'Squash the entire cycle into the fractional window [start, end], leaving silence outside.',
    example: 's("bd*4").compress(.25, .75)',
  },
  {
    name: 'zoom',
    category: 'time',
    signature: '.zoom(start, end)',
    summary: 'Play only the portion of the cycle between start and end, stretched back to full cycle length.',
    example: 's("bd sd hh oh").zoom(0, .5)',
  },
  {
    name: 'fastGap',
    category: 'time',
    signature: '.fastGap(n)',
    summary: 'Speed up the pattern by n and fill the remaining space with silence (not repetition, unlike .fast).',
    example: 's("bd*4").fastGap(2)',
  },
  {
    name: 'echo',
    category: 'pattern',
    signature: '.echo(times, time, feedback)',
    summary: 'Superimpose `times` delayed copies offset by `time` cycles each, fading by `feedback` per copy. A musical echo.',
    example: 's("bd sd").echo(4, 1/8, .6)',
  },
  {
    name: 'echoWith',
    category: 'pattern',
    signature: '.echoWith(times, time, fn)',
    summary: 'Like echo, but applies fn to each successive copy. NOTE: recent Strudel versions changed echoWith to a tidal-style fold signature — prefer echo(n, time, (p,i) => p.transform(i)) for forward-compat.',
    example: 'note("c3").echoWith(4, 1/8, (x,n) => x.add(n*2))',
  },
  // Change 1.4 — sampling utilities
  {
    name: 'splice',
    category: 'pattern',
    signature: '.splice(n, pattern)',
    summary: 'Like slice, but auto-adjusts playback speed so each slice fills its event duration exactly. No fit() needed.',
    example: 's("amen").splice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2").cut(1)',
  },
  {
    name: 'fit',
    category: 'time',
    signature: '.fit()',
    summary: 'Stretch the underlying sample to match the current cycle length. Essential before chop/slice on loops like the amen break.',
    example: 's("amen").fit().chop(16)',
  },
  {
    name: 'cut',
    category: 'control',
    signature: '.cut(group)',
    summary: 'Assign events to a cut group. Within a group, a new event silences any still-playing event. Use .cut(1) on chopped breaks so slices do not blur.',
    example: 's("amen").fit().chop(16).cut(1)',
  },
  {
    name: 'run',
    category: 'source',
    signature: 'run(n)',
    summary: 'Generate an ascending integer sequence 0..n-1 within one cycle. Used with n() to play through sample sets: `n(run(8))` plays variants 0-7.',
    example: 'n(run(8)).s("jazz")',
  },
  {
    name: 'irand',
    category: 'source',
    signature: 'irand(n)',
    summary: 'Random integer signal 0..n-1. Useful for randomly picking scale degrees or sample indices.',
    example: 'n(irand(8)).struct("x*16").scale("C:minor")',
  },
  {
    name: 'perlin',
    category: 'source',
    signature: 'perlin',
    summary: 'Smoothly-varying random signal (0..1). Pair with .range(a,b) for warm parameter drift — perfect for filter wobble and tape warble.',
    example: 'note("c2 e2 g2").lpf(perlin.range(200, 2000).slow(8))',
  },
  {
    name: 'piano',
    category: 'source',
    signature: '.piano()',
    summary: 'Shorthand for .s("piano"). Loads the default piano samples.',
    example: 'note("c e g b").piano()',
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
