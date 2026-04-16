import { notesInScale, NOTE_NAMES } from '../knowledge/scales.js';

export interface ChordInfo {
  symbol: string;
  root: number;
  midi: number[];
  names: string[];
}

const ROMAN_TO_INDEX: Record<string, number> = {
  I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
  i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6,
};

const CHORD_QUALITIES: Record<string, number[]> = {
  '': [0, 4, 7],
  'maj': [0, 4, 7],
  'M': [0, 4, 7],
  'm': [0, 3, 7],
  'min': [0, 3, 7],
  '-': [0, 3, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  '+': [0, 4, 8],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'M7': [0, 4, 7, 11],
  '^7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  '-7': [0, 3, 7, 10],
  'm7b5': [0, 3, 6, 10],
  'dim7': [0, 3, 6, 9],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '9': [0, 4, 7, 10, 14],
  'maj9': [0, 4, 7, 11, 14],
  'm9': [0, 3, 7, 10, 14],
};

export function parseChordSymbol(symbol: string, baseOct = 4): ChordInfo | null {
  const m = symbol.match(/^([A-Ga-g])([#b]?)(.*)$/);
  if (!m) return null;
  const [, letter, acc, quality] = m;
  const baseMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  let root = baseMap[letter.toLowerCase()];
  if (acc === '#') root += 1;
  if (acc === 'b') root -= 1;
  root = ((root % 12) + 12) % 12;
  const rootMidi = root + 12 * (baseOct + 1);
  const intervals = CHORD_QUALITIES[quality] ?? CHORD_QUALITIES[''];
  const midi = intervals.map((i) => rootMidi + i);
  const names = midi.map((n) => {
    const pc = ((n % 12) + 12) % 12;
    const oct = Math.floor(n / 12) - 1;
    return NOTE_NAMES[pc] + oct;
  });
  return { symbol, root, midi, names };
}

export function progressionInScale(
  progression: string[],
  scaleSpec: string,
): ChordInfo[] | null {
  const scale = notesInScale(scaleSpec);
  if (!scale) return null;
  const result: ChordInfo[] = [];
  for (const degree of progression) {
    const numeric = degree.replace(/[^ivxIVX]/g, '');
    const idx = ROMAN_TO_INDEX[numeric];
    if (idx === undefined) return null;
    // Build triad: root, third, fifth — monotonically ascending.
    // Scale has scaleLen notes. Wrap into next octave by adding 12 per wrap.
    const scaleLen = scale.midi.length;
    const pickDegree = (offset: number): number => {
      const rawIdx = idx + offset;
      const wrap = Math.floor(rawIdx / scaleLen);
      const local = ((rawIdx % scaleLen) + scaleLen) % scaleLen;
      return scale.midi[local] + 12 * wrap;
    };
    const midi = [pickDegree(0), pickDegree(2), pickDegree(4)];
    const names = midi.map((n) => {
      const pc = ((n % 12) + 12) % 12;
      const oct = Math.floor(n / 12) - 1;
      return NOTE_NAMES[pc] + oct;
    });
    result.push({ symbol: degree, root: midi[0] % 12, midi, names });
  }
  return result;
}

export function chordToStrudelNote(chord: ChordInfo): string {
  return `[${chord.names.join(',')}]`;
}

export function progressionToStrudelPattern(chords: ChordInfo[]): string {
  const parts = chords.map((c) => chordToStrudelNote(c));
  return `<${parts.join(' ')}>`;
}
