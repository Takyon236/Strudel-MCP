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
  |      — random choice within a group
  ..     — numeric range

The mini language works for any value-bearing function: notes, sounds, numbers for gains/filters/etc.
`.trim();
