import { z } from 'zod';
import { progressionInScale, progressionToStrudelPattern } from '../lib/theory.js';
import { COMMON_PROGRESSIONS } from '../knowledge/scales.js';

const STYLE_NAMES = [
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
] as const;
type StyleName = (typeof STYLE_NAMES)[number];

export const composeInputSchema = {
  style: z.enum(STYLE_NAMES).describe('Genre template to base the pattern on.'),
  tempo_bpm: z
    .number()
    .int()
    .min(40)
    .max(220)
    .optional()
    .describe('Tempo in BPM. Defaults to a genre-appropriate value if omitted.'),
  key: z
    .string()
    .optional()
    .describe('Key + mode like "A:minor" or "C:major". Defaults to "A:minor".'),
  elements: z
    .array(z.enum(['drums', 'bass', 'lead', 'pad', 'chords']))
    .optional()
    .describe(
      'Which elements to include. Default: ["drums", "bass", "lead"]. Order does not matter.',
    ),
  progression: z
    .string()
    .optional()
    .describe('Optional chord progression name or Roman numerals (e.g. "I V vi IV").'),
};

interface StyleTemplate {
  bpm: number;
  drumBank: string;
  // Drums broken into discrete parts so each can get its own chain
  drumParts: (key: string) => string[];
  // Bass / lead / pad return FULL chained patterns
  bassPart: (key: string) => string;
  leadPart: (key: string) => string;
  padPart: (chords: string) => string; // chords arg is the pre-rendered chord progression string
  chordProgression: string;
  defaultKey?: string;
}

const STYLES: Record<StyleName, StyleTemplate> = {
  house: {
    bpm: 124,
    drumBank: 'RolandTR909',
    drumParts: (_key) => [
      `s("bd*4").bank("RolandTR909").gain(.95).duckorbit(2).duckdepth(.8).duckattack(.15)`,
      `s("~ cp ~ cp").bank("RolandTR909").room(.3).gain(.7)`,
      `s("[~ hh]*4").bank("RolandTR909").gain("[.5 .7]*4").late("[0 .01]*4")`,
      `s("~ ~ oh ~").bank("RolandTR909").gain(.6)`,
    ],
    bassPart: (key) =>
      `note("<0 ~ 0 4>*2").scale("${key}").orbit(2)
      .s("sawtooth").lpf(900).lpq(10).lpenv(4).lpa(.01).lpd(.18)
      .decay(.15).sustain(0).shape(.2).gain(.8)`,
    leadPart: (key) =>
      `n("<0 2 4 7 4 2>*2").scale("${key}").orbit(3)
      .s("gm_epiano1").clip(1.5).room(.4).gain(.5)
      .sometimesBy(.3, x => x.ply(2))`,
    padPart: (chords) =>
      `note("${chords}").slow(4).s("gm_pad_2_warm")
      .lpf(sine.range(600, 2400).slow(16)).room(.6)
      .attack(.5).release(2).gain(.4)`,
    chordProgression: 'vi-IV-I-V',
  },

  techno: {
    bpm: 132,
    drumBank: 'RolandTR909',
    drumParts: (_key) => [
      `s("bd*4").bank("RolandTR909").gain(.95).duckorbit(2).duckdepth(.85).duckattack(.12)`,
      `s("~ ~ ~ cp").bank("RolandTR909").room(.5).gain(.6)`,
      `s("hh*16").bank("RolandTR909").gain("[.35 .5 .4 .6]*4").degradeBy(.1)`,
      `s("~ ~ oh ~").bank("RolandTR909").gain(.5)`,
    ],
    bassPart: (key) =>
      `note("0*8").scale("${key}").orbit(2)
      .s("sawtooth").lpf(perlin.range(400, 2200).slow(8)).lpq(14)
      .lpenv(6).lpa(.01).lpd(.12).decay(.12).sustain(0)
      .shape(.3).gain(.8)`,
    leadPart: (key) =>
      `n("<0 ~ ~ 4 ~ 2 7 ~>*2").scale("${key}").orbit(3)
      .s("sawtooth").lpf(2200).lpq(6)
      .delay(.5).delaysync(3/16).delayfeedback(.6)
      .room(.4).gain(.55)
      .every(4, x => x.rev())`,
    padPart: (chords) =>
      `note("${chords}").slow(8).s("gm_pad_3_polysynth")
      .lpf(1200).attack(2).release(4).room(.7).gain(.35)`,
    chordProgression: 'i-iv-v',
  },

  'hip-hop': {
    bpm: 88,
    drumBank: 'RolandTR808',
    drumParts: (_key) => [
      `s("bd ~ ~ bd ~ ~ [~ bd] ~").bank("RolandTR808").gain(.95)`,
      `s("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808").room(.25).gain(.85).late("[0 .015]*8")`,
      `s("hh*8").bank("RolandTR808").gain("[.5 .7 .6 .65]*2").late("[0 .02 .04 .02]*2")`,
      `s("~ ~ ~ oh ~ ~ ~ ~").bank("RolandTR808").gain(.5)`,
    ],
    bassPart: (key) =>
      `note("<0 0 0 5 ~ 3 0 ~>").scale("${key}")
      .s("gm_acoustic_bass").gain(.8).lpf(1200)
      .sometimesBy(.2, x => x.add(12))`,
    leadPart: (key) =>
      `n("<0 2 4 [7 6] 4 2>").scale("${key}")
      .s("gm_epiano1").clip(2)
      .late("[0 .03]*8").room(.4).gain(.55)`,
    padPart: (chords) =>
      `note("${chords}").slow(4).s("gm_string_ensemble_1")
      .attack(1).release(2).room(.5).lpf(2400).gain(.3)`,
    chordProgression: 'i-VI-III-VII',
  },

  trap: {
    bpm: 140,
    drumBank: 'RolandTR808',
    drumParts: (_key) => [
      `s("bd ~ [~ bd] ~ ~ bd ~ [~ bd]").bank("RolandTR808").gain(.95).penv(-12).pdecay(.1)`,
      `s("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808").room(.4).gain(.85)`,
      `s("hh*8").bank("RolandTR808").ply("<1 1 2 <2 4>>").gain("[.5 .7]*4")`,
      `s("~ ~ ~ ~ ~ ~ oh ~").bank("RolandTR808").gain(.55)`,
    ],
    bassPart: (key) =>
      `note("0 0 0 0 0 0 0 0").scale("${key}")
      .s("sawtooth").lpf(180).lpq(6)
      .decay(.1).sustain(0).shape(.4).gain(.9)`,
    leadPart: (key) =>
      `n("<0 ~ 3 5 ~ 7>*2").scale("${key}")
      .s("gm_lead_2_sawtooth")
      .lpf(sine.range(800, 2400).slow(8)).lpq(4)
      .delay(.4).delayfeedback(.5).room(.5).gain(.55)`,
    padPart: (chords) =>
      `note("${chords}").slow(8).s("gm_pad_2_warm")
      .attack(2).release(4).room(.7).gain(.35)`,
    chordProgression: 'i-iv-v',
  },

  dnb: {
    bpm: 174,
    drumBank: 'RolandTR909',
    drumParts: (_key) => [
      `s("bd ~ ~ ~ ~ ~ ~ bd").bank("RolandTR909").gain(.95)`,
      `s("~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR909").room(.3).gain(.9)`,
      `s("hh*16").bank("RolandTR909").gain("[.5 .7]*8").degradeBy(.12)`,
      `s("~ ~ rd ~").bank("RolandTR909").gain(.5)`,
    ],
    bassPart: (key) =>
      `note("<0 0 0 3 ~ 0 5 ~>").scale("${key}")
      .layer(
        x => x.s("sawtooth").add(note("0")),
        x => x.s("square").add(note(12))
      )
      .lpf(500).lpq(8).lpenv(3).lpa(.01).lpd(.25)
      .shape(.4).gain(.8)`,
    leadPart: (key) =>
      `n("<0 ~ 4 2 ~ 7 5 ~>*2").scale("${key}")
      .s("gm_lead_2_sawtooth").clip(.5)
      .delay(.5).delaysync(3/16).delayfeedback(.6)
      .room(.4).gain(.55)`,
    padPart: (chords) =>
      `note("${chords}").slow(8).s("gm_pad_3_polysynth")
      .attack(2).release(4).lpf(1400).room(.6).gain(.3)`,
    chordProgression: 'i-VI-III-VII',
  },

  jazz: {
    bpm: 140,
    drumBank: 'AkaiLinn',
    drumParts: (_key) => [
      `s("rd ~ [rd rd] rd ~ [rd rd]").bank("AkaiLinn").gain(.7)`,
      `s("~ sd ~ sd").bank("AkaiLinn").gain(.5).late("[0 .04]*4")`,
      `s("bd ~ ~ [~ bd]").bank("AkaiLinn").gain(.6)`,
      `s("hh*4").bank("AkaiLinn").gain(.4).degradeBy(.4)`,
    ],
    bassPart: (_key) =>
      `"<Cmaj7 Dm7 G7 Cmaj7>".rootNotes(2)
      .note().s("gm_acoustic_bass")
      .gain(.85).late("[0 .02]*4")`,
    leadPart: (_key) =>
      `chord("<Cmaj7 Dm7 G7 Cmaj7>")
      .voicing().arp("0 1 2 3 2 1")
      .s("gm_vibraphone")
      .clip(1.5).room(.5).gain(.55)`,
    padPart: (_chords) =>
      `chord("<Cmaj7 Dm7 G7 Cmaj7>").voicing()
      .s("gm_epiano1").struct("~ x ~ x")
      .room(.4).gain(.4)`,
    chordProgression: 'ii-V-I',
    defaultKey: 'C3:major',
  },

  ambient: {
    bpm: 60,
    drumBank: 'ViscoSpaceDrum',
    drumParts: (_key) => [
      `s("~").gain(0)`,
    ],
    bassPart: (key) =>
      `note("<0 4 7>/16").scale("${key}")
      .s("sawtooth").add(note("0"))
      .lpf(perlin.range(200, 800).slow(32)).lpq(2)
      .room(.9).roomsize(10).attack(4).release(6)
      .gain(.35)`,
    leadPart: (key) =>
      `n(perlin.segment(16).range(0, 9)).scale("${key}")
      .s("gm_celesta").clip(4)
      .late(perlin.range(0, .1))
      .room(.9).roomsize(10).roomlp(3000)
      .pan(perlin.range(.2, .8).slow(8))
      .gain(.3)`,
    padPart: (chords) =>
      `note("${chords}").slow(16).s("gm_pad_2_warm")
      .add(note("0"))
      .lpf(perlin.range(400, 2400).slow(32)).lpq(3)
      .pan(sine.range(.3, .7).slow(12))
      .room(.95).roomsize(10).roomfade(8)
      .attack(4).release(8).gain(.4)`,
    chordProgression: 'i-iv-v',
  },

  psytrance: {
    bpm: 145,
    drumBank: 'RolandTR909',
    drumParts: (_key) => [
      `s("bd*4").bank("RolandTR909").gain(.95).duckorbit(2).duckdepth(.8).duckattack(.1)`,
      `s("hh*16").bank("RolandTR909").gain("[.35 .55 .4 .65]*4").degradeBy(.08)`,
      `s("~ ~ cp ~").bank("RolandTR909").room(.4).gain(.6)`,
    ],
    bassPart: (key) =>
      `note("0*8").scale("${key}").orbit(2)
      .s("sawtooth").struct("~ x x x x x x x")
      .lpf(perlin.range(300, 1600).slow(4)).lpq(18)
      .lpenv(8).lpa(.01).lpd(.1).decay(.1).sustain(0)
      .fm(2).shape(.25).gain(.85)`,
    leadPart: (key) =>
      `n("<0 ~ 7 3 5 ~ 10 ~>*4").scale("${key}").orbit(3)
      .s("sawtooth").lpf(2800).lpq(4)
      .delay(.5).delaysync(1/8).delayfeedback(.5)
      .room(.4).gain(.5)`,
    padPart: (chords) =>
      `note("${chords}").slow(8).s("gm_pad_3_polysynth")
      .lpf(1400).attack(2).release(4).room(.6).gain(.3)`,
    chordProgression: 'i-iv-v',
  },

  lofi: {
    bpm: 75,
    drumBank: 'RolandTR707',
    drumParts: (_key) => [
      `s("bd ~ ~ bd ~ ~ bd ~").bank("RolandTR707").gain(.9)`,
      `s("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR707").room(.3).gain(.8)`,
      `s("hh*8").bank("RolandTR707").gain("[.5 .7 .55 .65]*2").late("[0 .02 .04 .02]*2")`,
      `s("crackle*4").gain(.15).speed(perlin.range(.9, 1.1))`,
    ],
    bassPart: (key) =>
      `note("<0 3 5 0 ~ 3 0 ~>").scale("${key}")
      .s("gm_acoustic_bass").gain(.7).lpf(900)
      .late("[0 .025]*8")`,
    leadPart: (key) =>
      `n("<0 2 4 7 4 2 0 ~>").scale("${key}")
      .s("gm_epiano1").clip(2)
      .late(perlin.range(0, .04))
      .room(.4).gain(.5)`,
    padPart: (chords) =>
      `note("${chords}").slow(4).s("gm_voice_oohs")
      .attack(.8).release(2).room(.5).lpf(2200).gain(.3)`,
    chordProgression: 'vi-IV-I-V',
  },

  rock: {
    bpm: 120,
    drumBank: 'RolandTR505',
    drumParts: (_key) => [
      `s("bd ~ ~ bd").bank("RolandTR505").gain(.95)`,
      `s("~ sd ~ sd").bank("RolandTR505").room(.4).gain(.9).every(8, x => x.ply(2))`,
      `s("hh*8").bank("RolandTR505").gain("[.5 .7]*4")`,
      `s("~ ~ oh ~").bank("RolandTR505").gain(.6)`,
    ],
    bassPart: (key) =>
      `note("0*8").scale("${key}")
      .s("gm_electric_bass_finger").gain(.85).lpf(1600)
      .decay(.15).sustain(.6)`,
    leadPart: (key) =>
      `n("<0 3 5 7>").scale("${key}")
      .s("gm_overdriven_guitar").clip(.5)
      .every(4, x => x.rev())
      .room(.3).gain(.6)`,
    padPart: (chords) =>
      `note("${chords}").slow(4).s("gm_pad_3_polysynth")
      .attack(.5).release(2).room(.4).gain(.4)`,
    chordProgression: 'I-V-vi-IV',
  },
};

export function strudelCompose(input: {
  style: StyleName;
  tempo_bpm?: number;
  key?: string;
  elements?: Array<'drums' | 'bass' | 'lead' | 'pad' | 'chords'>;
  progression?: string;
}) {
  const tpl = STYLES[input.style];
  if (!tpl) return text(`Unknown style "${input.style}".`);

  const bpm = input.tempo_bpm ?? tpl.bpm;
  const key = input.key ?? tpl.defaultKey ?? 'A2:minor';
  const elements =
    input.elements && input.elements.length > 0 ? input.elements : ['drums', 'bass', 'lead'];

  const lines: string[] = [`setcpm(${bpm}/4)`];
  const stacks: string[] = [];

  if (elements.includes('drums')) {
    for (const p of tpl.drumParts(key)) {
      stacks.push('  ' + p.replace(/\n/g, '\n  '));
    }
  }

  if (elements.includes('bass')) {
    stacks.push('  ' + tpl.bassPart(key).replace(/\n/g, '\n  '));
  }

  if (elements.includes('lead')) {
    stacks.push('  ' + tpl.leadPart(key).replace(/\n/g, '\n  '));
  }

  if (elements.includes('pad') || elements.includes('chords')) {
    const progName = input.progression ?? tpl.chordProgression;
    const degrees = COMMON_PROGRESSIONS[progName] ?? progName.split(/[\s-]+/).filter(Boolean);
    const chords = progressionInScale(degrees, key);
    if (chords) {
      const pat = progressionToStrudelPattern(chords);
      stacks.push('  ' + tpl.padPart(pat).replace(/\n/g, '\n  '));
    }
  }

  lines.push('stack(');
  lines.push(stacks.join(',\n'));
  lines.push(')');

  return text(lines.join('\n'));
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
