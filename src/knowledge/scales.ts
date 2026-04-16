export interface ScaleDef {
  name: string;
  intervals: number[];
  description: string;
  family: 'diatonic' | 'pentatonic' | 'modal' | 'exotic' | 'blues' | 'jazz';
}

export const SCALES: ScaleDef[] = [
  { name: 'major', intervals: [0, 2, 4, 5, 7, 9, 11], description: 'Major (Ionian)', family: 'diatonic' },
  { name: 'minor', intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Natural minor (Aeolian)', family: 'diatonic' },
  { name: 'harmonic_minor', intervals: [0, 2, 3, 5, 7, 8, 11], description: 'Harmonic minor', family: 'diatonic' },
  { name: 'melodic_minor', intervals: [0, 2, 3, 5, 7, 9, 11], description: 'Melodic minor (ascending)', family: 'diatonic' },

  { name: 'ionian', intervals: [0, 2, 4, 5, 7, 9, 11], description: 'Ionian (major)', family: 'modal' },
  { name: 'dorian', intervals: [0, 2, 3, 5, 7, 9, 10], description: 'Dorian — minor with raised 6th', family: 'modal' },
  { name: 'phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], description: 'Phrygian — minor with b2', family: 'modal' },
  { name: 'lydian', intervals: [0, 2, 4, 6, 7, 9, 11], description: 'Lydian — major with #4', family: 'modal' },
  { name: 'mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], description: 'Mixolydian — major with b7', family: 'modal' },
  { name: 'aeolian', intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Aeolian (natural minor)', family: 'modal' },
  { name: 'locrian', intervals: [0, 1, 3, 5, 6, 8, 10], description: 'Locrian — diminished mode', family: 'modal' },

  { name: 'major_pentatonic', intervals: [0, 2, 4, 7, 9], description: 'Major pentatonic', family: 'pentatonic' },
  { name: 'minor_pentatonic', intervals: [0, 3, 5, 7, 10], description: 'Minor pentatonic', family: 'pentatonic' },
  { name: 'blues', intervals: [0, 3, 5, 6, 7, 10], description: 'Minor blues scale', family: 'blues' },
  { name: 'whole_tone', intervals: [0, 2, 4, 6, 8, 10], description: 'Whole tone scale', family: 'exotic' },
  { name: 'chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], description: 'All twelve tones', family: 'exotic' },
  { name: 'diminished', intervals: [0, 2, 3, 5, 6, 8, 9, 11], description: 'Whole-half diminished', family: 'exotic' },
  { name: 'bebop', intervals: [0, 2, 4, 5, 7, 9, 10, 11], description: 'Bebop dominant', family: 'jazz' },

  { name: 'phrygian_dominant', intervals: [0, 1, 4, 5, 7, 8, 10], description: 'Phrygian dominant (Spanish / flamenco / Ahava Raba)', family: 'exotic' },
  { name: 'hungarian_minor', intervals: [0, 2, 3, 6, 7, 8, 11], description: 'Hungarian minor / double harmonic minor', family: 'exotic' },
  { name: 'double_harmonic', intervals: [0, 1, 4, 5, 7, 8, 11], description: 'Double harmonic major / Byzantine', family: 'exotic' },
  { name: 'major_blues', intervals: [0, 2, 3, 4, 7, 9], description: 'Major blues (6-note with b3 blue note)', family: 'blues' },
  { name: 'hirajoshi', intervals: [0, 2, 3, 7, 8], description: 'Japanese hirajoshi pentatonic', family: 'pentatonic' },
  { name: 'insen', intervals: [0, 1, 5, 7, 10], description: 'Japanese insen pentatonic', family: 'pentatonic' },
];

export const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
export const NOTE_NAMES_FLAT = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];

export function parseRoot(root: string): number | null {
  const m = root.toLowerCase().match(/^([a-g])([#b]?)(\d*)$/);
  if (!m) return null;
  const [, letter, acc, octStr] = m;
  const base: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  let pc = base[letter];
  if (acc === '#') pc += 1;
  if (acc === 'b') pc -= 1;
  pc = ((pc % 12) + 12) % 12;
  const oct = octStr ? parseInt(octStr, 10) : 4;
  return pc + 12 * (oct + 1);
}

export function findScale(name: string): ScaleDef | undefined {
  const n = name.toLowerCase().replace(/[\s-]/g, '_');
  return SCALES.find((s) => s.name === n);
}

export function notesInScale(scaleSpec: string): { midi: number[]; names: string[] } | null {
  const [root, type = 'major', mod] = scaleSpec.split(':');
  const rootMidi = parseRoot(root);
  if (rootMidi === null) return null;
  let scaleName = type.toLowerCase();
  if (mod === 'pentatonic') {
    scaleName = scaleName === 'minor' ? 'minor_pentatonic' : 'major_pentatonic';
  }
  const scale = findScale(scaleName);
  if (!scale) return null;
  const midi = scale.intervals.map((i) => rootMidi + i);
  const names = midi.map((m) => {
    const pc = ((m % 12) + 12) % 12;
    const oct = Math.floor(m / 12) - 1;
    return NOTE_NAMES[pc] + oct;
  });
  return { midi, names };
}

export const COMMON_PROGRESSIONS: Record<string, string[]> = {
  'I-V-vi-IV': ['I', 'V', 'vi', 'IV'],
  'ii-V-I': ['ii', 'V', 'I'],
  'I-vi-IV-V': ['I', 'vi', 'IV', 'V'],
  'I-IV-V': ['I', 'IV', 'V'],
  'vi-IV-I-V': ['vi', 'IV', 'I', 'V'],
  '12-bar-blues': ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V'],
  'i-VI-III-VII': ['i', 'VI', 'III', 'VII'],
  'i-iv-v': ['i', 'iv', 'v'],
  'andalusian': ['i', 'VII', 'VI', 'V'],
};
