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
  {
    title: 'Hardbass — reverse bass signature (XS Project / 2011 Russian hardbass)',
    tags: ['hardbass', 'hardstyle', 'gabber', 'reverse-bass', 'rave', 'hoover', '154bpm'],
    description: 'The defining hardbass signature: distorted hardkick on every beat + offbeat saw bass stabs on every "and" (the "wamp" between kicks). NOT techno with sidechain — the bass-between-kicks alternation IS the genre. Uses hardkick (gabber-lineage) and hoover (Alpha Juno rave classic), never TR-909.',
    code: `setcpm(154/4)
samples('github:tidalcycles/dirt-samples')
stack(
  s("hardkick:0*4")
    .gain(1.2).shape(.7).penv(-8).pdecay(.05)
    .decay(.28).sustain(0).lpf(5500).hpf(50).room(.08),
  note("<a1 a1 f1 g1>")
    .struct("~ x ~ x ~ x ~ x")
    .s("sawtooth").decay(.1).sustain(0).release(.04)
    .lpf(450).lpq(6).shape(.95)
    .gain(1.15),
  note("a3 e4 g4 a4 g4 e4 d4 e4")
    .s("hoover")
    .lpf(perlin.range(1200, 4500).slow(8)).lpq(5)
    .room(.45).delay(".35:.1875:.5").gain(.5)
)`,
  },
  {
    title: 'Hardbass — clean production with heavy drop (layered kick + stacked lead + brass)',
    tags: ['hardbass', 'song', 'arrangement', 'production', 'layered-kick', 'stacked-lead', 'brass', 'hardstyle', 'clean'],
    description: 'Higher-quality hardbass production: layered kick (hardkick + sine sub at a1), clean reverse-bass with sine sub-octave, stacked lead (hoover + supersaw octave-up with slow pan-sweep), brass stabs via gm_brass_section on drop2, gm_voice_oohs pad for hardstyle euphoria, crash on phrase downbeats. Drop2 adds a third detuned panned bass layer + square octave-up lead with subtle crush as harder-variant reprise. Stereo widening via detune + pan modulation rather than global distortion. References: XS Project "Bochka Bass Kolbaser", Hard Bass School "Narkoman Pavlik".',
    code: `samples('github:tidalcycles/dirt-samples')
setcpm(154/4)

let kick = stack(
  s("hardkick:0*4").gain(1.15).shape(.55).penv(-8).pdecay(.04)
    .decay(.22).sustain(0).lpf(6500).hpf(40).room(.06),
  note("a1*4").s("sine").attack(.001).decay(.18).sustain(0)
    .shape(.3).gain(.85)
).orbit(1)

let kickHalf = stack(
  s("hardkick:0 ~ hardkick:0 ~").gain(1.1).shape(.55).penv(-8).pdecay(.04)
    .decay(.22).sustain(0).lpf(6500).hpf(40).room(.08),
  note("a1 ~ a1 ~").s("sine").attack(.001).decay(.18).sustain(0)
    .shape(.3).gain(.85)
).orbit(1)

let bass = stack(
  note("<a1 a1 f1 g1>")
    .struct("~ x ~ x ~ x ~ x").s("sawtooth")
    .attack(.001).decay(.09).sustain(0).release(.03)
    .lpf(550).lpq(7).shape(.85).gain(1.05),
  note("<a0 a0 f0 g0>")
    .struct("~ x ~ x ~ x ~ x").s("sine")
    .attack(.001).decay(.1).sustain(0).gain(.5)
).orbit(2).duckorbit(1)

let bassHard = stack(
  note("<a1 a1 f1 g1>")
    .struct("~ x ~ x ~ x ~ x").s("sawtooth")
    .attack(.001).decay(.09).sustain(0).release(.03)
    .lpf(700).lpq(9).shape(.95).distort(".5:.3").gain(1.2),
  note("<a0 a0 f0 g0>")
    .struct("~ x ~ x ~ x ~ x").s("sine")
    .attack(.001).decay(.12).sustain(0).shape(.3).gain(.65),
  note("<a1 a1 f1 g1>")
    .struct("~ x ~ x ~ x ~ x").s("sawtooth")
    .attack(.001).decay(.05).sustain(0).release(.02)
    .detune(.15).lpf(2000).hpf(500).shape(.5).pan(.3).gain(.4)
).orbit(2).duckorbit(1)

let lead = stack(
  note("a3 e4 g4 a4 g4 e4 d4 e4")
    .s("hoover").attack(.015).decay(.5).sustain(.4).release(.3)
    .lpf(perlin.range(1500, 4500).slow(8)).lpq(4)
    .room(.5).delay(".35:.1875:.45").gain(.5),
  note("a4 e5 g5 a5 g5 e5 d5 e5")
    .s("supersaw").attack(.02).decay(.4).sustain(.3).release(.25)
    .lpf(perlin.range(2000, 5500).slow(8)).lpq(3).detune(.3)
    .room(.55).delay(".35:.125:.5").pan(sine.range(.25,.75).slow(4))
    .gain(.35)
).orbit(3).duckorbit(1)

let leadHard = stack(
  note("a3 e4 g4 a4 g4 e4 d4 e4")
    .s("hoover").attack(.015).decay(.5).sustain(.4).release(.3)
    .lpf(perlin.range(1800, 5500).slow(8)).lpq(5).shape(.35)
    .room(.5).delay(".35:.1875:.45").gain(.55),
  note("a4 e5 g5 a5 g5 e5 d5 e5")
    .s("supersaw").attack(.02).decay(.4).sustain(.3).release(.25)
    .lpf(perlin.range(2500, 6500).slow(8)).lpq(4).detune(.5)
    .room(.6).delay(".35:.125:.5").pan(sine.range(.15,.85).slow(4))
    .gain(.45),
  note("a5 e6 g6 a6 g6 e6 d6 e6")
    .s("square").attack(.02).decay(.3).sustain(.2).release(.2)
    .lpf(4500).lpq(3).crush(4)
    .room(.4).delay(".25:.1875:.4").gain(.22)
).orbit(3).duckorbit(1)

let brass = note("<[a3,c4,e4] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4]>")
  .struct("x ~ ~ ~ x ~ ~ ~").s("gm_brass_section")
  .attack(.01).decay(.4).sustain(0).release(.2)
  .shape(.4).lpf(3500).hpf(200)
  .room(.35).gain(.55).orbit(4).duckorbit(1)

let stab = note("<[a4,c5,e5] [f4,a4,c5] [g4,b4,d5] [a4,c5,e5]>")
  .struct("x ~ x ~ x ~ x ~").s("supersaw")
  .attack(.002).decay(.12).sustain(0).detune(.25)
  .lpf(3200).lpq(3).shape(.3)
  .room(.3).delay(".25:.125:.3").gain(.45)
  .orbit(5).duckorbit(1)

let vox = note("a5 ~ ~ g5 ~ a5 ~ e5")
  .s("square").attack(.003).decay(.1).sustain(0)
  .lpf(4500).vib(6).vibmod(.3).crush(5).shape(.4)
  .room(.35).delay(".25:.125:.5").gain(.4)
  .orbit(6).duckorbit(1)

let oohs = note("<[a3,c4,e4] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4]>/2")
  .s("gm_voice_oohs")
  .attack(.4).decay(.3).sustain(.8).release(1.5)
  .lpf(2500).shape(.2)
  .room(.6).gain(.35).orbit(7).duckorbit(1)

let clap = s("~ cp ~ cp").gain(.85).room(.2).hpf(600).shape(.2).orbit(8)
let hats = s("hh*16")
  .gain("[.2 .35 .25 .45]*4").hpf(7500)
  .pan(sine.range(.35,.65).fast(4)).orbit(8)
let roll = s("sd*16").gain(perlin.range(.25, .95).slow(4)).hpf(300).shape(.3).orbit(8)
let crash = s("cr").struct("x ~ ~ ~ ~ ~ ~ ~").gain(.6).room(.5).hpf(300).orbit(8)

let riser = s("white").decay(4).sustain(0)
  .hpf(sine.range(500, 9000).slow(8))
  .gain(perlin.range(.1, .45).slow(4))
  .room(.55).orbit(9)

let pad = note("<[a3,c4,e4] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4]>/4")
  .s("supersaw").attack(.8).decay(.4).sustain(.8).release(2).detune(.4)
  .lpf(1500).lpq(2)
  .room(.7).delay(".5:.25:.6").gain(.3).orbit(5)

let sub = note("<a1 a1 f1 g1>/2").s("sine")
  .attack(.01).decay(.3).sustain(.4).release(.2)
  .gain(.65).orbit(10).duckorbit(1)

let intro = stack(pad, sub.gain(.4), riser.gain(.15)).duckdepth(.85).duckattack(.12)
let intro2 = stack(kickHalf, pad, sub.gain(.5), riser.gain(.2)).duckdepth(.85).duckattack(.12)
let build1 = stack(kickHalf, pad, stab.gain(.3), hats.gain(.4), riser.gain(.3), vox.gain(.25)).duckdepth(.88).duckattack(.1)
let drop1 = stack(kick, bass, lead, stab, vox, clap, hats, sub.gain(.3), crash.gain(.25)).duckdepth(.9).duckattack(.1)
let break1 = stack(pad, lead.gain(.35).lpf(900), clap.gain(.6), vox.gain(.3), oohs.gain(.3)).duckdepth(.8).duckattack(.15)
let build2 = stack(kick, roll, hats, pad, riser.gain(.55), vox.gain(.35), oohs.gain(.25)).duckdepth(.88).duckattack(.08)
let drop2 = stack(kick, bassHard, leadHard, brass, stab, vox, clap, hats, sub.gain(.35), oohs.gain(.4), crash.gain(.35)).duckdepth(.95).duckattack(.08)
let outro = stack(pad, lead.gain(.3).lpf(700), sub.gain(.3), oohs.gain(.2)).duckdepth(.8).duckattack(.15)

arrange(
  [4, intro],
  [4, intro2],
  [8, build1],
  [16, drop1],
  [8, break1],
  [8, build2],
  [16, drop2],
  [8, outro]
)`,
  },
  {
    title: 'Hardbass full song with Distorted Records aesthetic',
    tags: ['hardbass', 'song', 'arrangement', 'structure', 'crush', 'coarse', 'lo-fi', 'distortion', 'arrange'],
    description: 'Complete 7-section hardbass track (~68 cycles): intro → build → drop → break → build → drop2 → outro. Second drop applies A$AP Rocky "Distorted Records" damage — crush(2-3) + coarse(2-4) + distort + shape — to bass and lead. Same skeleton as drop1 but noticeably more destroyed. Shows arrange() with let-named sections, crush/coarse for lo-fi digital-damage aesthetic, and variation via harder-treated reprises.',
    code: `samples('github:tidalcycles/dirt-samples')
setcpm(154/4)

let kick = s("hardkick:0*4")
  .gain(1.2).shape(.7).penv(-8).pdecay(.05)
  .decay(.28).sustain(0).lpf(5500).hpf(50).room(.08).orbit(1)

let kickHalf = s("hardkick:0 ~ hardkick:0 ~")
  .gain(1.15).shape(.65).penv(-8).pdecay(.05)
  .decay(.28).sustain(0).lpf(5500).hpf(50).room(.1).orbit(1)

let bass = note("<a1 a1 f1 g1>")
  .struct("~ x ~ x ~ x ~ x").s("sawtooth")
  .decay(.1).sustain(0).release(.04)
  .lpf(450).lpq(6).shape(.95).crush(6)
  .gain(1.15).orbit(2).duckorbit(1)

let bassHard = note("<a1 a1 f1 g1>")
  .struct("~ x ~ x ~ x ~ x").s("sawtooth")
  .decay(.1).sustain(0).release(.04)
  .lpf(550).lpq(8).shape(.98).distort(".8:.4").crush(3).coarse(2)
  .gain(1.25).orbit(2).duckorbit(1)

let hoover = note("a3 e4 g4 a4 g4 e4 d4 e4")
  .s("hoover").decay(.5).sustain(.45).release(.3)
  .lpf(perlin.range(1200, 4500).slow(8)).lpq(5)
  .room(.45).delay(".35:.1875:.5")
  .gain(.5).orbit(3).duckorbit(1)

let hooverCrushed = note("a3 e4 g4 a4 g4 e4 d4 e4")
  .s("hoover").decay(.5).sustain(.45).release(.3)
  .lpf(perlin.range(1500, 5000).slow(8)).lpq(5)
  .crush(3).coarse(3).shape(.6).distort(".7:.3")
  .room(.45).delay(".35:.1875:.5")
  .gain(.55).orbit(3).duckorbit(1)

let stab = note("<[a4,c5,e5] [f4,a4,c5] [g4,b4,d5] [a4,c5,e5]>")
  .struct("x ~ x ~ x ~ x ~").s("sawtooth")
  .decay(.12).sustain(0).lpf(2800).lpq(4).shape(.5).crush(5)
  .room(.3).gain(.52).orbit(4).duckorbit(1)

let vox = note("a5 ~ ~ g5 ~ a5 ~ e5")
  .s("square").decay(.1).sustain(0)
  .lpf(4800).vib(7).vibmod(.4).crush(2).coarse(4)
  .shape(.6).distort(".8:.3")
  .room(.35).delay(".25:.125:.55")
  .gain(.45).orbit(5).duckorbit(1)

let clap = s("~ cp ~ cp").gain(.85).room(.25).hpf(500).orbit(6)

let hats = s("hh*16")
  .gain("[.22 .35 .28 .45]*4").hpf(7500)
  .pan(sine.range(.35,.65).fast(4)).orbit(6)

let roll = s("sd*16")
  .gain(perlin.range(.3, .9).slow(4)).hpf(400).shape(.4).orbit(6)

let riser = s("white").decay(4).sustain(0)
  .hpf(sine.range(500, 8000).slow(8))
  .gain(perlin.range(.15, .5).slow(4))
  .room(.5).orbit(7)

let pad = note("<[a3,c4,e4] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4]>/4")
  .s("supersaw").attack(.8).decay(.4).sustain(.8).release(2)
  .lpf(1200).lpq(3).crush(7)
  .room(.7).delay(".5:.25:.6").gain(.3).orbit(4)

let sub = note("<a1 a1 f1 g1>/2").s("sine")
  .attack(.01).decay(.3).sustain(.4).release(.2)
  .gain(.7).orbit(8).duckorbit(1)

let intro = stack(kickHalf, pad, sub.gain(.5), riser.gain(.15)).duckdepth(.85).duckattack(.12)
let build1 = stack(kickHalf, pad, stab.gain(.3), hats.gain(.4), riser.gain(.3), vox.gain(.25)).duckdepth(.85).duckattack(.12)
let drop1 = stack(kick, bass, hoover, stab, vox, clap, hats, sub.gain(.4)).duckdepth(.9).duckattack(.1)
let break1 = stack(pad, hoover.gain(.3).lpf(800), clap.gain(.5), vox.gain(.3)).duckdepth(.8).duckattack(.15)
let build2 = stack(kick, roll, hats, pad, riser.gain(.5), vox.gain(.3)).duckdepth(.85).duckattack(.1)
let drop2 = stack(kick, bassHard, hooverCrushed, stab, vox, clap, hats, sub.gain(.4)).duckdepth(.9).duckattack(.08)
let outro = stack(pad, hoover.gain(.3).lpf(600), sub.gain(.3)).duckdepth(.8).duckattack(.15)

arrange(
  [8, intro],
  [4, build1],
  [16, drop1],
  [8, break1],
  [8, build2],
  [16, drop2],
  [8, outro]
)`,
  },
  {
    title: 'Nightcore → hardbass finale — 170 BPM with DUDUDUDU heavy drop',
    tags: ['nightcore', 'eurotrance', 'hardbass', 'song', 'arrangement', 'supersaw', 'chipmunk', 'arrange', 'fast', 'crush', 'distort'],
    description: 'Complete 7-section nightcore→hardbass track (~88 cycles ≈ 2:04 at 170 BPM): build1 (gentle lead-in) → drop1 (main supersaw drop, vi-IV-I-V in A major) → break1 (piano + triangle bells + sub swell — emotional bridge) → build3 (full-power pre-drop) → drop2 (eurotrance drop with detuned hard bass + octave-up arp) → buildFinal (escalating snare roll, destructive stuttered vox) → drop3 (HARDBASS finale: DUDUDUDU offbeat crushed-sawtooth bass at shape .98 + crush 3 + coarse 2 + distort .85:.4, heavier pdecay kick, crushed/distorted arp, crushed vocal — same A major prog, heaviest texture). Key A major, vi-IV-I-V (F#m-D-A-E). Escalation arc: drop1 is clean supersaw, drop2 adds detuned layers + octave-up square, drop3 applies the hardbass destruction pipeline to bass/arp/vox. Chipmunk aesthetic from octave 5-6 note range on vocal supersaw, not pitch-shifted samples.',
    code: `samples('github:tidalcycles/dirt-samples')
setcpm(170/4)

// Layered kick: punchy transient + sine sub for premium modern-EDM thickness
let kick = stack(
  s("bd*4").bank("RolandTR909")
    .gain(.95).shape(.4).lpf(5500).hpf(60).orbit(1),
  note("a1*4").s("sine")
    .attack(.001).decay(.14).sustain(0)
    .shape(.35).gain(.9).orbit(1)
).room(.1)

let kickSoft = s("bd*4").bank("RolandTR909")
  .gain(.85).shape(.3).lpf(4500).room(.1).orbit(1)

// Hardbass kick — hardkick from dirt-samples (gabber/hardstyle lineage, not TR-909)
let kickHardbass = stack(
  s("hardkick:2*4")
    .gain(1.1).shape(.6).lpf(6000).hpf(50).orbit(1),
  note("a1*4").s("sine")
    .attack(.001).decay(.18).sustain(0)
    .shape(.55).gain(1.0).orbit(1)
).room(.08)

let clap = s("~ cp ~ cp").bank("RolandTR909")
  .gain(.9).shape(.25).room(.35).hpf(200)
  .delay(".125:.1875:.3").orbit(8)

let hats = s("hh*8").bank("RolandTR909")
  .gain("[.4 .55 .45 .6]*2").shape(.15).hpf(8500)
  .pan(sine.range(.3, .7).fast(3)).orbit(8)

let openHat = s("~ ~ oh ~").bank("RolandTR909")
  .gain(.7).room(.25).hpf(5000).orbit(8)

let ride = s("rd*16").bank("RolandTR909")
  .gain(.32).hpf(6000).pan(sine.range(.4, .6).fast(2)).orbit(8)

let snareRoll = s("sd*16").bank("RolandTR909")
  .gain(perlin.range(.3, .9).slow(4))
  .speed(perlin.range(1, 2).slow(4))
  .shape(.3).hpf(300).orbit(8)

let crash = s("cr").struct("x ~ ~ ~ ~ ~ ~ ~")
  .bank("RolandTR909").gain(.85).room(.7).hpf(4000).orbit(8)

let bass = stack(
  note("<fs2 d2 a2 e2>")
    .struct("~ x ~ x ~ x ~ x").s("supersaw").detune(.22)
    .attack(.002).decay(.11).sustain(0).release(.05)
    .lpf(2200).lpq(6).shape(.35).gain(.85),
  note("<fs1 d1 a1 e1>")
    .s("sine").attack(.01).decay(.4).sustain(.4).release(.15)
    .gain(.7)
).orbit(2).duckorbit(1)

let bassHard = stack(
  note("<fs2 d2 a2 e2>")
    .struct("~ x ~ x ~ x ~ x").s("supersaw").detune(.28)
    .attack(.002).decay(.11).sustain(0).release(.05)
    .lpf(2800).lpq(7).shape(.45).gain(.95),
  note("<fs3 d3 a2 e3>")
    .struct("~ x ~ x ~ x ~ x").s("supersaw").detune(.35)
    .attack(.002).decay(.08).sustain(0)
    .lpf(4500).pan(.3).gain(.35),
  note("<fs1 d1 a1 e1>")
    .s("sine").attack(.01).decay(.4).sustain(.45).gain(.75)
).orbit(2).duckorbit(1)

// HARDBASS DONK — the DUDUDUDU offbeat crushed-sawtooth bass
// Raw sawtooth is intentional here: hardbass is the crushed/distorted thin-saw donk
let bassHardbass = note("<fs2 d2 a2 e2>")
  .struct("~ x ~ x ~ x ~ x").s("sawtooth")
  .attack(.001).decay(.12).sustain(0).release(.03)
  .lpf(650).lpq(10).shape(.98)
  .crush(3).coarse(2).distort(".85:.4")
  .gain(1.3).orbit(2).duckorbit(1)

let arp = n("0 2 4 6 4 2 4 0 2 4 6 4 2 0 4 2")
  .scale("A4:major")
  .s("supersaw").detune(.35)
  .attack(.002).decay(.1).sustain(.2).release(.08)
  .lpf(perlin.range(2500, 7000).slow(16)).lpq(3).shape(.2)
  .room(.5).delay(".1875:.125:.4")
  .pan(sine.range(.25, .75).slow(5))
  .gain(.7).orbit(3).duckorbit(1)

let arpHard = stack(
  n("0 2 4 6 4 2 4 0 2 4 6 4 2 0 4 2")
    .scale("A4:major")
    .s("supersaw").detune(.4)
    .attack(.002).decay(.1).sustain(.2).release(.08)
    .lpf(perlin.range(3000, 8000).slow(16)).lpq(3).shape(.3)
    .room(.5).delay(".1875:.125:.4")
    .pan(sine.range(.2, .8).slow(5))
    .gain(.75),
  n("0 2 4 6 4 2 4 0 2 4 6 4 2 0 4 2")
    .scale("A5:major")
    .s("square").attack(.002).decay(.08).sustain(.1)
    .lpf(6500).crush(6).gain(.22)
    .pan(sine.range(.3, .7).slow(3))
).orbit(3).duckorbit(1)

// Crushed + distorted arp for drop3 hardbass finale
let arpDestroyed = stack(
  n("0 2 4 6 4 2 4 0 2 4 6 4 2 0 4 2")
    .scale("A4:major")
    .s("supersaw").detune(.45)
    .attack(.002).decay(.08).sustain(.18).release(.08)
    .lpf(perlin.range(4000, 9000).slow(16)).lpq(3).shape(.45)
    .crush(4).distort(".65:.3")
    .room(.4).delay(".1875:.125:.4")
    .pan(sine.range(.2, .8).slow(5))
    .gain(.9),
  n("0 2 4 6 4 2 4 0 2 4 6 4 2 0 4 2")
    .scale("A5:major")
    .s("square").attack(.002).decay(.06).sustain(.12)
    .lpf(7000).crush(3).distort(".5:.2")
    .pan(sine.range(.3, .7).slow(3))
    .gain(.3)
).orbit(3).duckorbit(1)

let vox = stack(
  note("<[a5 cs6 a5 fs5] [d5 fs5 a5 d6] [cs6 e5 a5 cs6] [b5 gs5 e5 b5]>")
    .s("supersaw").detune(.25)
    .attack(.04).decay(.22).sustain(.55).release(.2)
    .vowel("<a e i o>")
    .lpf(5500).hpf(300).shape(.15)
    .room(.55).delay(".375:.1875:.5")
    .pan(sine.range(.4, .6).slow(7))
    .gain(.6),
  note("<[a6 cs7 a6 fs6] [d6 fs6 a6 d7] [cs7 e6 a6 cs7] [b6 gs6 e6 b6]>")
    .s("sine").attack(.08).decay(.35).sustain(.3).release(.25)
    .room(.7).gain(.22)
    .pan(sine.range(.35, .65).slow(3))
).orbit(4).duckorbit(1)

// Crushed + distorted vocal for drop3 hardbass finale
let voxCrushed = stack(
  note("<[a5 cs6 a5 fs5] [d5 fs5 a5 d6] [cs6 e5 a5 cs6] [b5 gs5 e5 b5]>")
    .s("supersaw").detune(.3)
    .attack(.02).decay(.2).sustain(.5).release(.18)
    .vowel("<a e i o>")
    .lpf(5500).hpf(300).shape(.3)
    .crush(4).distort(".55:.25")
    .room(.55).delay(".375:.1875:.5")
    .pan(sine.range(.4, .6).slow(7))
    .gain(.65),
  note("<[a6 cs7 a6 fs6] [d6 fs6 a6 d7] [cs7 e6 a6 cs7] [b6 gs6 e6 b6]>")
    .s("sine").attack(.08).decay(.35).sustain(.3).release(.25)
    .room(.7).gain(.22)
    .pan(sine.range(.35, .65).slow(3))
).orbit(4).duckorbit(1)

let voxChop = note("<[a5 cs6 a5 fs5] [d5 fs5 a5 d6] [cs6 e5 a5 cs6] [b5 gs5 e5 b5]>")
  .s("supersaw").detune(.3)
  .attack(.01).decay(.1).sustain(.2).release(.08)
  .ply("<1 2 1 4 1 2 1 8>")
  .lpf(5000).shape(.2)
  .room(.4).delay(".25:.125:.4")
  .gain(.5).orbit(4).duckorbit(1)

let pad = note("<[fs3,a3,cs4,fs4] [d3,fs3,a3,d4] [a3,cs4,e4,a4] [e3,gs3,b3,e4]>")
  .s("supersaw").detune(.18)
  .attack(.5).decay(.4).sustain(.75).release(1.2)
  .lpf(perlin.range(1500, 4500).slow(16)).lpq(2)
  .room(.75).gain(.4).orbit(5).duckorbit(1)

let padBright = note("<[fs4,a4,cs5] [d4,fs4,a4] [a4,cs5,e5] [e4,gs4,b4]>")
  .s("supersaw").detune(.4)
  .attack(.05).decay(.35).sustain(.55).release(.6)
  .lpf(7000).lpq(1).hpf(400)
  .room(.6).gain(.28).orbit(5).duckorbit(1)

let piano = note("<[a4 cs5 e5 a5] [fs4 a4 d5 fs5] [e4 gs4 b4 e5] [a4 cs5 e5 a5]>")
  .s("gm_electric_piano_1")
  .attack(.01).decay(.3).sustain(.3).release(.4)
  .room(.6).delay(".25:.1875:.4")
  .pan(sine.range(.3, .7).slow(3))
  .gain(.55).orbit(6).duckorbit(1)

// Triangle-wave bells for break sparkle (counter-melody)
let bells = note("<[a6 ~ cs7 ~] [~ d6 fs6 ~] [~ e6 ~ cs7] [b6 ~ gs6 ~]>")
  .s("triangle")
  .attack(.001).decay(.6).sustain(.05).release(.4)
  .room(.85).delay(".375:.125:.6")
  .pan(sine.range(.25, .75).slow(6))
  .gain(.35).orbit(7)

// Swelling sub for break emotional depth
let breakSub = note("<fs1 d1 a0 e1>/4").s("sine")
  .attack(.6).decay(.4).sustain(.6).release(.8)
  .gain(perlin.range(.35, .6).slow(8))
  .orbit(2)

let riser = s("white").decay(4).sustain(0)
  .hpf(sine.range(500, 9000).slow(8))
  .gain(perlin.range(.1, .45).slow(4))
  .room(.55).orbit(9)

let sweep = s("white").struct("x ~ ~ ~ ~ ~ ~ ~")
  .attack(.5).decay(.5).sustain(0)
  .hpf(sine.range(2000, 8000).slow(8))
  .gain(.3).room(.6).orbit(9)

let build1 = stack(pad, padBright.gain(.15), kickSoft, hats, openHat.gain(.4), bass.gain(.6), riser.gain(.2))
  .duckdepth(.85).duckattack(.12)

let drop1 = stack(kick, clap, hats, openHat, bass, arp, vox, pad, padBright, crash, sweep.gain(.2))
  .duckdepth(.9).duckattack(.1)

// Improved break — added triangle bells + swelling sub for emotional lift
let break1 = stack(pad, padBright.gain(.25), vox.gain(.45), piano, bells, breakSub, ride.gain(.3))
  .duckdepth(.82).duckattack(.18)

let build3 = stack(pad, padBright, vox.gain(.5), kick, hats, openHat, bass, snareRoll.gain(.55), voxChop.gain(.4), riser.gain(.5))
  .duckdepth(.9).duckattack(.08)

let drop2 = stack(kick, clap, hats, openHat, bassHard, arpHard, vox, pad, padBright, ride.gain(.25), crash, sweep.gain(.25))
  .duckdepth(.95).duckattack(.08)

// Final build — intensifying snare roll + destructive stutter vox to set up drop3
let buildFinal = stack(kick, hats, openHat, snareRoll.gain("<.3 .45 .65 .9>"), voxChop.gain(.55), pad, padBright.gain(.45), bass.gain(.85), riser.gain(.6), sweep.gain(.4))
  .duckdepth(.92).duckattack(.08)

// HARDBASS FINALE — DUDUDUDU crushed-saw bass, destroyed arp, crushed vocal
let drop3 = stack(kickHardbass, bassHardbass, arpDestroyed, voxCrushed, clap, hats, openHat, pad, padBright, ride.gain(.3), crash, sweep.gain(.3))
  .duckdepth(.95).duckattack(.07)

arrange(
  [8, build1],
  [16, drop1],
  [8, break1],
  [8, build3],
  [16, drop2],
  [8, buildFinal],
  [16, drop3]
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
