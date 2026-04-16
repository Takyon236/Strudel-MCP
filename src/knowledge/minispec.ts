export interface MiniRule {
  syntax: string;
  name: string;
  description: string;
  example: string;
}

export const MINI_RULES: MiniRule[] = [
  {
    syntax: ' ',
    name: 'sequence',
    description: 'Space-separated events play in order within one cycle.',
    example: '"bd sd hh oh"',
  },
  {
    syntax: '~ or -',
    name: 'rest',
    description: 'A tilde or dash is a rest (silence).',
    example: '"bd ~ sd ~"',
  },
  {
    syntax: '[ ]',
    name: 'group',
    description: 'Square brackets group events into a subdivision of a step.',
    example: '"bd [hh hh] sd [hh hh hh]"',
  },
  {
    syntax: '< >',
    name: 'alternation',
    description: 'Angle brackets play one element per cycle, round-robin.',
    example: '"<c e g b>"',
  },
  {
    syntax: ',',
    name: 'polyphony',
    description: 'Commas stack patterns in parallel (play simultaneously).',
    example: '"bd*4, hh*8"',
  },
  {
    syntax: '*n',
    name: 'repeat (speed up)',
    description: 'Asterisk repeats or speeds up by factor n.',
    example: '"hh*8" — 8 hats per cycle',
  },
  {
    syntax: '/n',
    name: 'slow',
    description: 'Slash slows a pattern or subsequence over n cycles.',
    example: '"[c e g b]/4" — 4 cycles long',
  },
  {
    syntax: '!n',
    name: 'replicate',
    description: 'Exclamation repeats an event n times (duplicates, not speeds up).',
    example: '"c!3 e" — c c c e',
  },
  {
    syntax: '@n',
    name: 'elongate',
    description: 'At-sign gives an event weight n (stretches its duration).',
    example: '"c@3 e" — c lasts 3x as long as e',
  },
  {
    syntax: ':n',
    name: 'sample index',
    description: 'Colon selects a sample index (variant) from a set.',
    example: '"hh:0 hh:1 hh:2"',
  },
  {
    syntax: '?',
    name: 'random drop',
    description: 'Question mark gives each event a 50% chance of being dropped.',
    example: '"bd? sd? hh?"',
  },
  {
    syntax: '|',
    name: 'random choice',
    description: 'Pipe picks one element at random per cycle from the group.',
    example: '"[bd | sd | cp]"',
  },
  {
    syntax: '..',
    name: 'range',
    description: 'Range shorthand: "0 .. 7" = "0 1 2 3 4 5 6 7".',
    example: '"0 .. 7"',
  },
  {
    syntax: '(n,k) or (n,k,offset)',
    name: 'euclidean rhythm',
    description: 'Parenthesised trio distributes n hits evenly across k steps with optional rotation offset. The classic Bjorklund / Euclidean distribution.',
    example: '"bd(3,8)" — 3 kicks over 8 steps',
  },
  {
    syntax: ':n:gain',
    name: 'per-voice sample/gain',
    description: 'After a sound name, :n selects a sample variant and :gain adds per-voice gain. Used in layered sound stacks.',
    example: '"sawtooth, square:0:.5" — stack sawtooth and half-volume square',
  },
  {
    syntax: '_',
    name: 'elongate (underscore)',
    description: 'Underscore stretches the previous event, equivalent to @2 but visually concise in slow patterns.',
    example: '"<[g3,b3,e4] _ [a3,c3,e4]>" — first chord holds for 2 slots',
  },
  {
    syntax: '?p',
    name: 'random drop (explicit probability)',
    description: 'Like ? (50% drop) but ?0.1 drops only 10%, ?0.8 drops 80%. Use for thinning hi-hats or percussion.',
    example: '"hh*16?0.2" — sparse hats with 20% drop',
  },
];

export const MINI_OVERVIEW = `
Mini-notation is the DSL inside quoted strings passed to functions like sound(), note(), n().

Everything inside a string fills exactly one cycle unless modified. Space separates events;
brackets subdivide; angle brackets alternate one element per cycle; commas stack in parallel.

Core symbols:
  space  — next event in sequence
  ~ -    — rest
  [ ]    — group / subdivision
  < >    — alternation (one per cycle)
  ,      — polyphony (stack)
  *n     — repeat/speed up
  /n     — slow / stretch
  !n     — replicate event n times
  @n     — weighted duration (elongate)
  :n     — sample index
  ?      — 50% drop
  ?p     — explicit probability drop (e.g. ?0.2 = 20% drop)
  |      — random choice within a group
  ..     — numeric range
  (n,k)  — euclidean rhythm (n beats over k steps, optional ,offset)
  _      — elongate previous event (like @2)
  :n:g   — sample index plus per-voice gain

The mini language works for any value-bearing function: notes, sounds, numbers for gains/filters/etc.
`.trim();
