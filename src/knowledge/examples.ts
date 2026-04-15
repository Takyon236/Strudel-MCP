export interface Example {
  title: string;
  tags: string[];
  code: string;
  description: string;
}

export const EXAMPLES: Example[] = [
  {
    title: 'Four-on-the-floor house',
    tags: ['drums', 'house', 'techno', 'beginner', '909'],
    description: 'Classic house pattern: kick every beat, offbeat hats, claps on 2 and 4.',
    code: `setcpm(124/4)
sound("bd*4, [~ cp]*2, [~ hh]*4").bank("RolandTR909")`,
  },
  {
    title: 'Boom-bap hip-hop',
    tags: ['drums', 'hip-hop', 'beginner', '808'],
    description: '90s boom-bap groove with swung hats.',
    code: `setcpm(90/4)
stack(
  s("bd ~ ~ bd ~ ~ bd ~").bank("RolandTR808"),
  s("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808"),
  s("hh*8").bank("RolandTR808").gain(.6).late("[0 .02]*8")
)`,
  },
  {
    title: 'Rolling acid bass',
    tags: ['bass', 'acid', 'techno', '303'],
    description: 'TB-303 style acid line with resonant filter sweep.',
    code: `setcpm(128/4)
note("<a1 a1 c2 a1 eb2 a1 g1 f1>*2")
  .s("sawtooth")
  .lpf(sine.range(300, 2500).slow(8))
  .lpq(12)
  .shape(.4)
  .gain(.8)`,
  },
  {
    title: 'Chord pad with filter sweep',
    tags: ['pad', 'chord', 'ambient'],
    description: 'Warm sustained chord with slow low-pass sweep.',
    code: `chord("<Cmaj7 Am7 Fmaj7 G7>/2")
  .dict('ireal').voicing()
  .s("gm_pad_2_warm")
  .lpf(sine.range(400, 3000).slow(8))
  .room(.6).gain(.5)`,
  },
  {
    title: 'Pentatonic arpeggio',
    tags: ['melody', 'pentatonic', 'piano', 'beginner'],
    description: 'Rising and falling pentatonic lines on piano.',
    code: `n("<0 2 4 6 4 2>*4")
  .scale("C4:minor:pentatonic")
  .s("piano")
  .room(.3)`,
  },
  {
    title: 'Drum and bass break',
    tags: ['drums', 'dnb', 'breakbeat'],
    description: 'Chopped Amen-style break pattern.',
    code: `setcpm(174/4)
s("bd ~ sd [~ bd] ~ bd sd ~")
  .bank("RolandTR909")
  .fast(1)`,
  },
  {
    title: 'Ambient drone',
    tags: ['ambient', 'drone', 'texture'],
    description: 'Slow evolving drone with modulation.',
    code: `note("<c2 f2 g2 eb2>/8")
  .s("sawtooth,square")
  .detune(sine.range(0, .3).slow(4))
  .lpf(sine.range(200, 1200).slow(16))
  .room(.9).gain(.4)`,
  },
  {
    title: 'Euclidean rhythm',
    tags: ['drums', 'euclidean', 'polyrhythm'],
    description: 'Euclidean distribution of hits across a cycle.',
    code: `stack(
  s("bd(3,8)").bank("RolandTR909"),
  s("hh(5,8)").bank("RolandTR909"),
  s("cp(2,8,3)").bank("RolandTR909")
)`,
  },
  {
    title: 'Polymeter groove',
    tags: ['drums', 'polymeter', 'experimental'],
    description: 'Three-against-four polymeter feel.',
    code: `stack(
  s("bd ~ bd").bank("RolandTR808"),
  s("~ hh").bank("RolandTR808").fast(2),
  s("~ ~ ~ sd").bank("RolandTR808")
)`,
  },
  {
    title: 'Jazz walking bass',
    tags: ['bass', 'jazz', 'walking'],
    description: 'Walking bass line over a ii-V-I progression.',
    code: `setcpm(140/4)
note("<[d2 f2 a2 c3] [g2 b2 d3 f3] [c3 e3 g3 b3]>")
  .s("gm_acoustic_bass")
  .gain(.8)`,
  },
  {
    title: 'Psytrance bassline',
    tags: ['bass', 'psytrance', 'offbeat'],
    description: 'Offbeat rolling bass with FM character.',
    code: `setcpm(145/4)
note("f1*8")
  .s("sawtooth")
  .struct("0 1 1 1 1 1 1 1")
  .lpf(sine.range(200, 1500).slow(4))
  .fm(2).fmh(3)
  .decay(.1).sustain(0)`,
  },
  {
    title: 'Trap hi-hat roll',
    tags: ['drums', 'trap', 'hi-hat'],
    description: 'Rolling trap hats with variable rate.',
    code: `s("hh*16").bank("RolandTR808")
  .fast("<1 1 2 4>")
  .gain("[.6 .8 1]*4")`,
  },
];

export function searchExamples(query: string, limit = 5): Example[] {
  const q = query.toLowerCase().trim();
  if (!q) return EXAMPLES.slice(0, limit);
  const scored = EXAMPLES.map((ex) => {
    let score = 0;
    if (ex.title.toLowerCase().includes(q)) score += 3;
    if (ex.description.toLowerCase().includes(q)) score += 2;
    for (const tag of ex.tags) {
      if (tag.toLowerCase() === q) score += 5;
      else if (tag.toLowerCase().includes(q)) score += 2;
    }
    return { ex, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.ex);
}
