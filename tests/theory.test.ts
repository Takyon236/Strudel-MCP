import { describe, test, expect } from 'bun:test';
import {
  parseChordSymbol,
  progressionInScale,
  chordToStrudelNote,
  progressionToStrudelPattern,
} from '../src/lib/theory.js';
import {
  notesInScale,
  parseRoot,
  findScale,
  SCALES,
} from '../src/knowledge/scales.js';

function pitchClasses(chord: { midi: number[] }): number[] {
  return chord.midi.map((m) => ((m % 12) + 12) % 12);
}

describe('theory — parseRoot', () => {
  test('natural notes', () => {
    expect(parseRoot('c')).toBe(60);
    expect(parseRoot('a')).toBe(69);
    expect(parseRoot('g')).toBe(67);
  });

  test('with octave', () => {
    expect(parseRoot('c4')).toBe(60);
    expect(parseRoot('c5')).toBe(72);
    expect(parseRoot('a2')).toBe(45);
  });

  test('sharps and flats', () => {
    expect(parseRoot('c#')).toBe(61);
    expect(parseRoot('db')).toBe(61);
    expect(parseRoot('f#3')).toBe(54);
  });

  test('invalid input returns null', () => {
    expect(parseRoot('h')).toBe(null);
    expect(parseRoot('cx')).toBe(null);
  });
});

describe('theory — notesInScale', () => {
  test('C major', () => {
    const r = notesInScale('C:major');
    expect(r?.midi).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  test('A minor', () => {
    const r = notesInScale('A3:minor');
    expect(r?.midi).toEqual([57, 59, 60, 62, 64, 65, 67]);
  });

  test('D dorian', () => {
    const r = notesInScale('D:dorian');
    // D E F G A B C
    expect(pitchClassesMidi(r!.midi)).toEqual([2, 4, 5, 7, 9, 11, 0]);
  });

  test('E phrygian', () => {
    const r = notesInScale('E:phrygian');
    expect(pitchClassesMidi(r!.midi)).toEqual([4, 5, 7, 9, 11, 0, 2]);
  });

  test('G mixolydian', () => {
    const r = notesInScale('G:mixolydian');
    expect(pitchClassesMidi(r!.midi)).toEqual([7, 9, 11, 0, 2, 4, 5]);
  });

  test('F lydian', () => {
    const r = notesInScale('F:lydian');
    expect(pitchClassesMidi(r!.midi)).toEqual([5, 7, 9, 11, 0, 2, 4]);
  });

  test('C minor pentatonic', () => {
    const r = notesInScale('C:minor:pentatonic');
    expect(pitchClassesMidi(r!.midi)).toEqual([0, 3, 5, 7, 10]);
  });

  test('invalid scale returns null', () => {
    expect(notesInScale('X:zorp')).toBe(null);
  });
});

function pitchClassesMidi(midi: number[]): number[] {
  return midi.map((m) => ((m % 12) + 12) % 12);
}

describe('theory — findScale', () => {
  test('case insensitive + underscore alias', () => {
    expect(findScale('major')?.name).toBe('major');
    expect(findScale('Minor_Pentatonic')?.name).toBe('minor_pentatonic');
  });

  test('every SCALES entry is findable', () => {
    for (const s of SCALES) {
      expect(findScale(s.name)).toBeDefined();
    }
  });
});

describe('theory — parseChordSymbol', () => {
  test('C major triad', () => {
    const c = parseChordSymbol('C');
    expect(pitchClasses(c!)).toEqual([0, 4, 7]);
  });

  test('Am (minor triad)', () => {
    expect(pitchClasses(parseChordSymbol('Am')!)).toEqual([9, 0, 4]);
  });

  test('Cmaj7', () => {
    expect(pitchClasses(parseChordSymbol('Cmaj7')!)).toEqual([0, 4, 7, 11]);
  });

  test('Am7', () => {
    expect(pitchClasses(parseChordSymbol('Am7')!)).toEqual([9, 0, 4, 7]);
  });

  test('G7 (dominant)', () => {
    expect(pitchClasses(parseChordSymbol('G7')!)).toEqual([7, 11, 2, 5]);
  });

  test('F#m7 (sharp root minor 7)', () => {
    expect(pitchClasses(parseChordSymbol('F#m7')!)).toEqual([6, 9, 1, 4]);
  });

  test('Bbmaj7 (flat root major 7)', () => {
    expect(pitchClasses(parseChordSymbol('Bbmaj7')!)).toEqual([10, 2, 5, 9]);
  });

  test('C#dim', () => {
    expect(pitchClasses(parseChordSymbol('C#dim')!)).toEqual([1, 4, 7]);
  });

  test('Gsus4', () => {
    expect(pitchClasses(parseChordSymbol('Gsus4')!)).toEqual([7, 0, 2]);
  });

  test('Dmaj9', () => {
    expect(pitchClasses(parseChordSymbol('Dmaj9')!)).toEqual([2, 6, 9, 1, 4]);
  });

  test('invalid returns null', () => {
    expect(parseChordSymbol('zz')).toBe(null);
  });
});

describe('theory — progressionInScale', () => {
  test('I-V-vi-IV in C major', () => {
    const chords = progressionInScale(['I', 'V', 'vi', 'IV'], 'C:major');
    expect(chords).not.toBe(null);
    expect(pitchClasses(chords![0])).toEqual([0, 4, 7]); // C
    expect(pitchClasses(chords![1])).toEqual([7, 11, 2]); // G
    expect(pitchClasses(chords![2])).toEqual([9, 0, 4]); // Am
    expect(pitchClasses(chords![3])).toEqual([5, 9, 0]); // F
  });

  test('ii-V-I in C major', () => {
    const chords = progressionInScale(['ii', 'V', 'I'], 'C:major');
    expect(pitchClasses(chords![0])).toEqual([2, 5, 9]); // Dm
    expect(pitchClasses(chords![1])).toEqual([7, 11, 2]); // G
    expect(pitchClasses(chords![2])).toEqual([0, 4, 7]); // C
  });

  test('REGRESSION: i-iv-v in A minor gives real minor chords', () => {
    // Earlier bug: rotation=5 turned these into F, Bdim, C
    const chords = progressionInScale(['i', 'iv', 'v'], 'A3:minor');
    expect(pitchClasses(chords![0])).toEqual([9, 0, 4]); // Am
    expect(pitchClasses(chords![1])).toEqual([2, 5, 9]); // Dm
    expect(pitchClasses(chords![2])).toEqual([4, 7, 11]); // Em
  });

  test('i-iv-v in C minor', () => {
    const chords = progressionInScale(['i', 'iv', 'v'], 'C:minor');
    expect(pitchClasses(chords![0])).toEqual([0, 3, 7]); // Cm
    expect(pitchClasses(chords![1])).toEqual([5, 8, 0]); // Fm
    expect(pitchClasses(chords![2])).toEqual([7, 10, 2]); // Gm
  });

  test('D dorian i IV — IV is major (dorian signature)', () => {
    const chords = progressionInScale(['i', 'IV'], 'D:dorian');
    expect(pitchClasses(chords![0])).toEqual([2, 5, 9]); // Dm
    expect(pitchClasses(chords![1])).toEqual([7, 11, 2]); // G major
  });

  test('E phrygian i II — II is major (phrygian signature)', () => {
    const chords = progressionInScale(['i', 'II'], 'E:phrygian');
    expect(pitchClasses(chords![0])).toEqual([4, 7, 11]); // Em
    expect(pitchClasses(chords![1])).toEqual([5, 9, 0]); // F major
  });

  test('invalid Roman numeral returns null', () => {
    expect(progressionInScale(['ZZ'], 'C:major')).toBe(null);
  });

  test('invalid scale spec returns null', () => {
    expect(progressionInScale(['I'], 'X:zorp')).toBe(null);
  });
});

describe('theory — strudel formatters', () => {
  test('chordToStrudelNote produces bracket polyphony', () => {
    const c = parseChordSymbol('Cmaj7')!;
    expect(chordToStrudelNote(c)).toMatch(/^\[.+\]$/);
    expect(chordToStrudelNote(c)).toContain(',');
  });

  test('progressionToStrudelPattern produces angle-bracket sequence', () => {
    const chords = progressionInScale(['I', 'IV', 'V'], 'C:major')!;
    const pat = progressionToStrudelPattern(chords);
    expect(pat).toMatch(/^<.+>$/);
  });
});

describe('theory — 12 keys × I-IV-V in major', () => {
  const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  for (const root of roots) {
    test(`${root}:major I-IV-V produces 3 valid chords`, () => {
      const chords = progressionInScale(['I', 'IV', 'V'], `${root}:major`);
      expect(chords).not.toBe(null);
      expect(chords!.length).toBe(3);
      for (const c of chords!) {
        expect(c.midi.length).toBeGreaterThanOrEqual(3);
      }
    });
  }
});

describe('theory — 12 keys × i-iv-v in minor', () => {
  const roots = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  for (const root of roots) {
    test(`${root}:minor i-iv-v produces real minor chords`, () => {
      const chords = progressionInScale(['i', 'iv', 'v'], `${root}:minor`);
      expect(chords).not.toBe(null);
      // Every chord's third interval should be minor (3 semitones) for i/iv/v
      for (const c of chords!) {
        const root_ = c.midi[0];
        const third = c.midi[1];
        const interval = ((third - root_) % 12 + 12) % 12;
        expect(interval).toBe(3);
      }
    });
  }
});

describe('theory — root-position chord fix', () => {
  test('V in C:major is in root position (G4 B4 D5)', () => {
    const chords = progressionInScale(['V'], 'C:major');
    // Each subsequent MIDI note should be >= the previous
    const m = chords![0].midi;
    expect(m[1]).toBeGreaterThanOrEqual(m[0]);
    expect(m[2]).toBeGreaterThanOrEqual(m[1]);
  });
  test('iv in A3:minor ends above root, not below', () => {
    const chords = progressionInScale(['iv'], 'A3:minor');
    const m = chords![0].midi;
    expect(m[2]).toBeGreaterThanOrEqual(m[0]);
  });
  test('IV in C:major is F4 A4 C5 not F4 A4 C4', () => {
    const chords = progressionInScale(['IV'], 'C:major');
    const m = chords![0].midi;
    // C5 should be 72, not 60
    expect(m[2]).toBe(72);
  });
});

describe('theory — new scales', () => {
  test('phrygian_dominant defined', () => {
    expect(findScale('phrygian_dominant')).toBeDefined();
    expect(findScale('phrygian_dominant')?.intervals).toEqual([0, 1, 4, 5, 7, 8, 10]);
  });
  test('hungarian_minor defined', () => {
    expect(findScale('hungarian_minor')).toBeDefined();
  });
  test('hirajoshi is pentatonic (5 notes)', () => {
    expect(findScale('hirajoshi')?.intervals.length).toBe(5);
  });
});

describe('theory — extended chord qualities', () => {
  test('minor 9', () => {
    const c = parseChordSymbol('Cm9');
    expect(c).not.toBe(null);
    expect(c!.midi.length).toBe(5);
  });

  test('dominant 9', () => {
    const c = parseChordSymbol('C9');
    expect(c!.midi.length).toBe(5);
  });

  test('half-diminished m7b5', () => {
    const c = parseChordSymbol('Cm7b5');
    expect(c).not.toBe(null);
    expect(pitchClasses(c!)).toEqual([0, 3, 6, 10]);
  });

  test('augmented', () => {
    const c = parseChordSymbol('Caug');
    expect(pitchClasses(c!)).toEqual([0, 4, 8]);
  });

  test('diminished 7', () => {
    const c = parseChordSymbol('Cdim7');
    expect(pitchClasses(c!)).toEqual([0, 3, 6, 9]);
  });

  test('sus2', () => {
    const c = parseChordSymbol('Csus2');
    expect(pitchClasses(c!)).toEqual([0, 2, 7]);
  });
});
