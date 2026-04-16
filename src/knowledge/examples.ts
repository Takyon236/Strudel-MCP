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
  .voicing()
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
  .struct("~ x x x x x x x")
  .lpf(sine.range(200, 1500).slow(4))
  .fm(2).fmh(3)
  .decay(.1).sustain(0)`,
  },
  {
    title: 'Trap hi-hat roll',
    tags: ['drums', 'trap', 'hi-hat'],
    description: 'Rolling trap hats with variable ply rate and velocity.',
    code: `s("hh*16").bank("RolandTR808")
  .ply("<1 1 2 <2 4>>")
  .gain("[.6 .8 1]*4")
  .sometimes(x => x.hpf(2000))`,
  },
  {
    title: 'Drum and bass beat',
    tags: ['drums', 'dnb', 'breakbeat', 'half-time'],
    description: 'Half-time DnB groove: syncopated kick, snare on beat 3, busy 16th hats.',
    code: `setcpm(174/4)
stack(
  s("bd ~ ~ ~ [bd ~] ~ ~ bd").bank("RolandTR909"),
  s("~ ~ ~ ~ ~ ~ sd ~").bank("RolandTR909"),
  s("hh*16").bank("RolandTR909").degradeBy(.2).gain(.5)
)`,
  },
  {
    title: 'Sidechained deep house',
    tags: ['drums', 'bass', 'house', 'sidechain', 'duck', 'orbit'],
    description: 'Classic sidechain pump: kick on orbit 0 ducks the bass on orbit 1.',
    code: `setcpm(124/4)
stack(
  s("bd*4").bank("RolandTR909")
    .orbit(0).duckorbit(1).duckdepth(.9).duckattack(.01),
  note("<a1 a1 c2 g1>*4")
    .s("sawtooth")
    .lpf(800).lpenv(3).lpa(.01).lpd(.3)
    .orbit(1).gain(.7)
)`,
  },
  {
    title: 'Voiced chord arpeggio',
    tags: ['arp', 'chord', 'voicing', 'melody', 'jazz'],
    description: 'Chord voicings spread into an ascending/descending arpeggio.',
    code: `setcpm(120/4)
chord("<Cmaj7 Am7 Fmaj7 G7>")
  .voicing()
  .arp("0 1 2 3 2 1")
  .room(.4).gain(.7)`,
  },
  {
    title: 'Acid bass with filter envelope',
    tags: ['bass', 'acid', '303', 'envelope'],
    description: 'TB-303 acid line driven by a punchy filter envelope.',
    code: `setcpm(128/4)
note("<a1 c2 a1 eb2 a1 g1 f1 a1>*2")
  .s("sawtooth")
  .lpf(400).lpq(14)
  .lpenv(6).lpa(.005).lpd(.15)
  .shape(.35).gain(.8)`,
  },
  {
    title: 'Layered reese bass',
    tags: ['bass', 'dnb', 'reese', 'layer'],
    description: 'Classic reese bass: detuned sawtooth with sub-octave square layer.',
    code: `setcpm(174/4)
note("<c1 c1 eb1 f1>/2")
  .layer(
    x => x.s("sawtooth").vib(4).vibmod(.3),
    x => x.s("square").add(note(12)).gain(.4)
  )
  .lpf(600).room(.15).gain(.7)`,
  },
  {
    title: 'Amen break chop',
    tags: ['drums', 'breakbeat', 'amen', 'dnb', 'jungle', 'chop'],
    description: 'Sliced Amen break with occasional double-time stutter.',
    code: `setcpm(165/4)
samples('github:yaxu/clean-breaks')
s("amen")
  .fit()
  .slice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2")
  .cut(1)
  .rarely(x => x.ply(2))`,
  },
  {
    title: 'Dub techno chord stab',
    tags: ['chord', 'techno', 'dub', 'stab', 'delay'],
    description: 'Sparse chord stabs with synced dotted-eighth delay.',
    code: `setcpm(128/4)
chord("<Cm7 Fm7>")
  .voicing()
  .struct("~ x ~ x ~ x ~ x")
  .s("gm_pad_2_warm")
  .delay(.65).delaysync(3/16)
  .room(.5).gain(.55)`,
  },
  {
    title: 'Jux and every for stereo variation',
    tags: ['pattern', 'jux', 'every', 'stereo', 'variation'],
    description: 'Jux splits a pattern left/right; every 4 cycles doubles the speed.',
    code: `setcpm(120/4)
note("c4 eb4 g4 bb4")
  .s("sawtooth")
  .lpf(1800).room(.3)
  .jux(rev)
  .every(4, x => x.fast(2))`,
  },
  {
    title: 'Euclidean percussion layers',
    tags: ['drums', 'euclidean', 'polyrhythm', 'percussion'],
    description: 'Four Euclidean rhythms layered for a dense polyrhythmic groove.',
    code: `stack(
  s("bd(3,8)").bank("RolandTR909"),
  s("cp(2,8,3)").bank("RolandTR909"),
  s("hh(7,16)").bank("RolandTR909").gain(.55),
  s("rim(5,16,2)").bank("RolandTR909").gain(.45)
)`,
  },
  {
    title: 'Off ornamentation',
    tags: ['melody', 'off', 'ornament', 'arpeggio'],
    description: 'Offset copies at 5th and octave create shimmering melodic harmonics.',
    code: `setcpm(110/4)
note("c4 e4 g4 b4")
  .s("piano")
  .off(1/8, x => x.add(7))
  .off(1/4, x => x.add(12).gain(.4))
  .room(.4)`,
  },
  {
    title: 'Ambient drone with perlin',
    tags: ['ambient', 'drone', 'pad', 'perlin', 'slow'],
    description: 'Slowly evolving drone where perlin noise shapes filter and pan.',
    code: `setcpm(30/4)
note("<c2 f2>/8")
  .s("sawtooth,square")
  .lpf(perlin.range(300, 1800).slow(32))
  .pan(perlin.range(0, 1).slow(20))
  .lpa(2).lpd(.5)
  .room(.9).gain(.35)`,
  },
  {
    title: 'Synthesized drum kit (no samples)',
    tags: ['drums', 'synthesis', 'modern', 'noise', 'fm', 'sound-design'],
    description: 'Kick, snare, and hats built from raw oscillators and noise — no drum machine banks. The modern production approach.',
    code: `setcpm(130/4)
stack(
  note("c1 ~ [~ c1] ~ ~ c1 ~ ~")
    .s("sine").decay(.35).sustain(0)
    .shape(.35).penv(-24).pdecay(.08).gain(1.1),
  s("~ ~ noise ~ ~ ~ noise ~")
    .decay(.07).sustain(0).bpf(1200).bpq(3)
    .distort(.4).crush(10).room(.3).gain(.65),
  s("white*16")
    .decay("[.02 .015]*8").sustain(0)
    .hpf(7000).gain("[.2 .45 .3 .5]*4")
    .degradeBy(.12)
)`,
  },
  {
    title: 'FM metallic percussion',
    tags: ['drums', 'fm', 'synthesis', 'metallic', 'modern', 'experimental'],
    description: 'FM synthesis creates complex metallic textures impossible with samples. Change .fm() and .fmh() ratios for different timbres.',
    code: `stack(
  note("c5 ~ g5 ~ eb5 ~ [c5 g5] ~")
    .s("sine").fm("<4 8 6 12>").fmh("<3 1.5 2 5>")
    .fmdecay(.03).fmsustain(0)
    .decay(.06).sustain(0).gain(.35)
    .hpf(2000).room(.4).pan(.6),
  note("c1*4").s("sine")
    .decay(.3).sustain(0).shape(.3).gain(1)
)`,
  },
  {
    title: 'Dirt-samples modern textures',
    tags: ['samples', 'dirt', 'modern', 'texture', 'glitch', 'future'],
    description: 'Load the dirt-samples library for modern electronic textures, glitch, and rave sounds beyond vintage drum machines.',
    code: `samples('github:tidalcycles/dirt-samples')
setcpm(136/4)
stack(
  s("clubkick*4").gain(.9),
  s("future:0 ~ future:2 ~").gain(.5).room(.3),
  s("glitch:1*8").gain(.3).crush(8).hpf(3000)
    .degradeBy(.3).pan(perlin.range(.2,.8)),
  s("techno:0 ~ [~ techno:2] ~").gain(.4).room(.5)
)`,
  },
  {
    title: 'Detuned unison bass',
    tags: ['bass', 'modern', 'detune', 'unison', 'synthesis'],
    description: 'Layer slightly detuned oscillators for thick modern bass. The .add(note("0,.07,.14")) trick creates a 3-voice unison.',
    code: `setcpm(140/4)
note("<c2 c2 eb2 f2>*2")
  .s("sawtooth").add(note("0,.07,.14"))
  .lpf(perlin.range(200, 1200).slow(8))
  .lpq(8).lpenv(4).lpa(.005).lpd(.2)
  .distort(.6).distorttype("diode")
  .shape(.4).decay(.3).sustain(0).gain(.8)`,
  },
  {
    title: 'Song structure with arrange',
    tags: ['arrangement', 'structure', 'arrange', 'song', 'sections'],
    description: 'Use arrange() to sequence intro, verse, and drop sections. The fundamental tool for building songs instead of loops.',
    code: `setcpm(128/4)
let intro = s("bd*4").bank("RolandTR909")
let verse = stack(
  s("bd*4").bank("RolandTR909"),
  s("[~ hh]*4").bank("RolandTR909").gain(.6),
  note("0*4").scale("A2:minor").s("sawtooth").lpf(800).gain(.7)
)
let drop = stack(
  s("bd*4").bank("RolandTR909"),
  s("~ cp ~ cp").bank("RolandTR909").gain(.7),
  s("hh*16").bank("RolandTR909").gain(.5),
  note("<0 3 5 7>*2").scale("A2:minor").s("sawtooth").lpf(2000).gain(.8)
)
arrange([4, intro], [8, verse], [8, drop], [4, intro])`,
  },
  {
    title: 'Per-voice drum processing with layer',
    tags: ['drums', 'layer', 'per-voice', 'processing', 'effects'],
    description: 'Apply different effects per drum voice by splitting with layer + struct. Filter the kick, reverb the snare, hi-pass the hats.',
    code: `setcpm(128/4)
s("bd sd hh oh bd [sd hh] hh oh")
  .bank("RolandTR909")
  .layer(
    x => x.struct("x ~ ~ ~ x ~ ~ ~").lpf(400).gain(1),
    x => x.struct("~ x ~ ~ ~ x ~ ~").room(.4).gain(.8),
    x => x.struct("~ ~ x ~ ~ ~ x ~").hpf(6000).gain(.5),
    x => x.struct("~ ~ ~ x ~ ~ ~ x").hpf(4000).delay(.3).gain(.6)
  )`,
  },
  {
    title: 'Track muting with mask for arrangement',
    tags: ['arrangement', 'mask', 'mute', 'tracks', 'structure'],
    description: 'Use mask() with slow alternation to bring elements in and out across sections. Each mask value gates 4 bars.',
    code: `setcpm(124/4)
stack(
  s("bd*4").bank("RolandTR909").gain(.95)
    .mask("<0 1 1 1>/4"),
  s("~ cp ~ cp").bank("RolandTR909").room(.3).gain(.7)
    .mask("<0 0 1 1>/4"),
  s("[~ hh]*4").bank("RolandTR909").gain(.55)
    .mask("<0 1 1 1>/4"),
  note("<0 0 3 5>*2").scale("A2:minor").s("sawtooth")
    .lpf(800).decay(.15).sustain(0).gain(.8)
    .mask("<0 0 1 1>/4")
)`,
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
