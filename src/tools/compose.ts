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
  kickPattern: string;
  snarePattern: string;
  hatPattern: string;
  bassPattern: (key: string) => string;
  leadSound: string;
  leadPattern: string;
  padSound: string;
  defaultProgression: string;
  defaultKey?: string;
}

const STYLES: Record<StyleName, StyleTemplate> = {
  house: {
    bpm: 124,
    drumBank: 'RolandTR909',
    kickPattern: 'bd*4',
    snarePattern: '[~ cp]*2',
    hatPattern: '[~ hh]*4',
    bassPattern: (key) =>
      `note("<0 0 4 0>*2").scale("${key}").s("sawtooth").lpf(800).lpq(6).decay(.2).sustain(0).gain(.8)`,
    leadSound: 'gm_synth_bass_1',
    leadPattern: 'n("0 2 4 7").scale("KEY")',
    padSound: 'gm_pad_2_warm',
    defaultProgression: 'vi-IV-I-V',
  },
  techno: {
    bpm: 130,
    drumBank: 'RolandTR909',
    kickPattern: 'bd*4',
    snarePattern: '[~ ~ ~ cp]',
    hatPattern: '[~ hh]*8',
    bassPattern: (key) =>
      `note("<0 0 3 0>*2").scale("${key}").s("sawtooth").lpf(sine.range(400,1800).slow(4)).lpq(8)`,
    leadSound: 'sawtooth',
    leadPattern: 'n("<0 ~ 4 2>*4").scale("KEY")',
    padSound: 'gm_pad_3_polysynth',
    defaultProgression: 'i-iv-v',
  },
  'hip-hop': {
    bpm: 90,
    drumBank: 'RolandTR808',
    kickPattern: 'bd ~ ~ bd ~ ~ bd ~',
    snarePattern: '~ ~ sd ~ ~ ~ sd ~',
    hatPattern: 'hh*8',
    bassPattern: (key) => `note("<0 0 3 5>").scale("${key}").s("gm_acoustic_bass")`,
    leadSound: 'gm_electric_piano_1',
    leadPattern: 'n("0 2 4 [7 6]").scale("KEY")',
    padSound: 'gm_string_ensemble_1',
    defaultProgression: 'i-VI-III-VII',
  },
  trap: {
    bpm: 140,
    drumBank: 'RolandTR808',
    kickPattern: 'bd ~ ~ [~ bd] ~ ~ bd ~',
    snarePattern: '~ ~ sd ~ ~ ~ sd ~',
    hatPattern: 'hh*16',
    bassPattern: (key) =>
      `note("0*8").scale("${key}").s("sawtooth").decay(.1).sustain(0).lpf(300)`,
    leadSound: 'gm_lead_2_sawtooth',
    leadPattern: 'n("<0 3 5 7>*2").scale("KEY")',
    padSound: 'gm_pad_2_warm',
    defaultProgression: 'i-iv-v',
  },
  dnb: {
    bpm: 174,
    drumBank: 'RolandTR909',
    kickPattern: 'bd ~ ~ [~ bd] ~ ~ ~ bd',
    snarePattern: '~ ~ sd ~ ~ ~ sd ~',
    hatPattern: 'hh*8',
    bassPattern: (key) =>
      `note("0").scale("${key}").s("sawtooth").decay(.3).sustain(0).lpf(600).shape(.4)`,
    leadSound: 'sawtooth',
    leadPattern: 'n("<0 ~ 4 2 ~ 5>*2").scale("KEY")',
    padSound: 'gm_pad_3_polysynth',
    defaultProgression: 'i-VI-III-VII',
  },
  jazz: {
    bpm: 140,
    drumBank: 'AkaiLinn',
    kickPattern: 'bd ~ ~ [bd ~]',
    snarePattern: '~ sd ~ sd',
    hatPattern: '[hh hh hh]*2',
    bassPattern: (key) =>
      `note("<0 2 4 5>").scale("${key}").s("gm_acoustic_bass").gain(.8)`,
    leadSound: 'gm_electric_piano_1',
    leadPattern: 'n("<0 2 4 7 6 4 2 0>").scale("KEY")',
    padSound: 'gm_string_ensemble_1',
    defaultProgression: 'ii-V-I',
    defaultKey: 'C3:major',
  },
  ambient: {
    bpm: 60,
    drumBank: 'ViscoSpaceDrum',
    kickPattern: 'bd',
    snarePattern: '~',
    hatPattern: '[~ hh]',
    bassPattern: (key) => `note("<0 3>/4").scale("${key}").s("sawtooth").lpf(400).gain(.5)`,
    leadSound: 'gm_pad_2_warm',
    leadPattern: 'n("<0 4 7>/4").scale("KEY")',
    padSound: 'gm_pad_2_warm',
    defaultProgression: 'i-iv-v',
  },
  psytrance: {
    bpm: 145,
    drumBank: 'RolandTR909',
    kickPattern: 'bd*4',
    snarePattern: '~',
    hatPattern: 'hh*8',
    bassPattern: (key) =>
      `note("0*8").scale("${key}").s("sawtooth").struct("0 1 1 1 1 1 1 1").decay(.1).sustain(0).lpf(sine.range(300,1400).slow(4)).fm(2)`,
    leadSound: 'sawtooth',
    leadPattern: 'n("<0 7 3 5>*4").scale("KEY")',
    padSound: 'gm_pad_3_polysynth',
    defaultProgression: 'i-iv-v',
  },
  lofi: {
    bpm: 75,
    drumBank: 'RolandTR707',
    kickPattern: 'bd ~ ~ bd ~ ~ bd ~',
    snarePattern: '~ ~ sd ~ ~ ~ sd ~',
    hatPattern: '[hh*4]',
    bassPattern: (key) => `note("<0 3 5>").scale("${key}").s("gm_acoustic_bass").gain(.7)`,
    leadSound: 'gm_electric_piano_1',
    leadPattern: 'n("<0 2 4 7>").scale("KEY")',
    padSound: 'gm_voice_oohs',
    defaultProgression: 'vi-IV-I-V',
  },
  rock: {
    bpm: 120,
    drumBank: 'RolandTR505',
    kickPattern: 'bd ~ ~ bd',
    snarePattern: '~ sd ~ sd',
    hatPattern: 'hh*8',
    bassPattern: (key) => `note("0*8").scale("${key}").s("gm_electric_bass_finger")`,
    leadSound: 'gm_overdriven_guitar',
    leadPattern: 'n("<0 3 5 7>").scale("KEY")',
    padSound: 'gm_pad_3_polysynth',
    defaultProgression: 'I-V-vi-IV',
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
    stacks.push(
      `  s("${tpl.kickPattern}, ${tpl.snarePattern}, ${tpl.hatPattern}").bank("${tpl.drumBank}")`,
    );
  }

  if (elements.includes('bass')) {
    stacks.push(`  ${tpl.bassPattern(key).replace(/\n/g, '\n  ')}`);
  }

  if (elements.includes('lead')) {
    stacks.push(`  ${tpl.leadPattern.replace(/KEY/g, key)}.s("${tpl.leadSound}").gain(.7)`);
  }

  if (elements.includes('pad') || elements.includes('chords')) {
    const progName = input.progression ?? tpl.defaultProgression;
    const degrees = COMMON_PROGRESSIONS[progName] ?? progName.split(/[\s-]+/).filter(Boolean);
    const chords = progressionInScale(degrees, key);
    if (chords) {
      const pat = progressionToStrudelPattern(chords);
      stacks.push(
        `  note("${pat}").s("${tpl.padSound}").slow(4).room(.6).gain(.5).attack(.5).release(1)`,
      );
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
