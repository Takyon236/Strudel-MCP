export interface SoundEntry {
  name: string;
  kind: 'drum' | 'bank' | 'gm' | 'synth' | 'sample';
  description: string;
}

export const DRUMS: SoundEntry[] = [
  { name: 'bd', kind: 'drum', description: 'Bass drum / kick' },
  { name: 'sd', kind: 'drum', description: 'Snare drum' },
  { name: 'rim', kind: 'drum', description: 'Rimshot' },
  { name: 'cp', kind: 'drum', description: 'Clap' },
  { name: 'hh', kind: 'drum', description: 'Closed hi-hat' },
  { name: 'oh', kind: 'drum', description: 'Open hi-hat' },
  { name: 'rd', kind: 'drum', description: 'Ride cymbal' },
  { name: 'cr', kind: 'drum', description: 'Crash cymbal' },
  { name: 'lt', kind: 'drum', description: 'Low tom' },
  { name: 'mt', kind: 'drum', description: 'Mid tom' },
  { name: 'ht', kind: 'drum', description: 'High tom' },
  { name: 'cb', kind: 'drum', description: 'Cowbell' },
  { name: 'sh', kind: 'drum', description: 'Shaker' },
];

export const DRUM_BANKS: SoundEntry[] = [
  { name: 'RolandTR909', kind: 'bank', description: '909 house/techno kit — punchy kick, crisp snare' },
  { name: 'RolandTR808', kind: 'bank', description: '808 hip-hop kit — deep sub kick, snappy snare' },
  { name: 'RolandTR707', kind: 'bank', description: '707 pop/rock kit — cleaner acoustic-ish sounds' },
  { name: 'RolandTR505', kind: 'bank', description: '505 kit — lo-fi charm, rock/pop' },
  { name: 'AkaiLinn', kind: 'bank', description: 'Linn LM-1 style — classic 80s' },
  { name: 'RhythmAce', kind: 'bank', description: 'Ace Tone Rhythm Ace — early preset machine' },
  { name: 'ViscoSpaceDrum', kind: 'bank', description: 'Visco space drum — ambient/experimental' },
  { name: 'RolandCompurhythm1000', kind: 'bank', description: 'CR-1000 — vintage 80s rhythm machine' },
  { name: 'RolandTR606', kind: 'bank', description: '606 kit — tight, electronic, classic acid house' },
  { name: 'RolandTR727', kind: 'bank', description: '727 Latin percussion' },
  { name: 'LinnLM1', kind: 'bank', description: 'Linn LM-1 — Prince, MJ-era 80s' },
  { name: 'LinnDrum', kind: 'bank', description: 'LinnDrum — the 80s pop standard' },
  { name: 'AlesisHR16', kind: 'bank', description: 'Alesis HR-16 — late-80s to 90s, crunchy' },
  { name: 'OberheimDMX', kind: 'bank', description: 'DMX — Run-DMC, classic hip-hop' },
  { name: 'EmuSP12', kind: 'bank', description: 'E-mu SP-12 — golden-era hip-hop sampler drums' },
  { name: 'CasioRZ1', kind: 'bank', description: 'Casio RZ-1 — lo-fi 80s' },
  { name: 'YamahaRX5', kind: 'bank', description: 'Yamaha RX5 — FM-esque 80s' },
  { name: 'RolandCompurhythm78', kind: 'bank', description: 'CR-78 — the Pet Shop Boys preset machine' },
];

export const SYNTHS: SoundEntry[] = [
  { name: 'sine', kind: 'synth', description: 'Sine wave oscillator' },
  { name: 'square', kind: 'synth', description: 'Square wave oscillator' },
  { name: 'triangle', kind: 'synth', description: 'Triangle wave oscillator' },
  { name: 'sawtooth', kind: 'synth', description: 'Sawtooth wave oscillator' },
  { name: 'white', kind: 'synth', description: 'White noise' },
  { name: 'pink', kind: 'synth', description: 'Pink noise' },
  { name: 'brown', kind: 'synth', description: 'Brown noise' },
  { name: 'fm', kind: 'synth', description: 'Default FM synth voice' },
  { name: 'supersaw', kind: 'synth', description: 'Layered supersaw' },
  { name: 'crackle', kind: 'synth', description: 'Subtle crackle noise (paired with .density)' },
  { name: 'z_sawtooth', kind: 'synth', description: 'ZZFX sawtooth variant' },
  { name: 'z_sine', kind: 'synth', description: 'ZZFX sine variant' },
  { name: 'z_square', kind: 'synth', description: 'ZZFX square variant' },
  { name: 'z_noise', kind: 'synth', description: 'ZZFX noise variant' },
  { name: 'wt_flute', kind: 'synth', description: 'Wavetable synth — flute shape' },
  { name: 'wt_dbass', kind: 'synth', description: 'Wavetable synth — detuned bass shape' },
];

export const SAMPLE_LIBRARIES: SoundEntry[] = [
  { name: 'piano', kind: 'sample', description: 'Grand piano samples' },
  { name: 'jazz', kind: 'sample', description: 'Jazz loop samples' },
  { name: 'metal', kind: 'sample', description: 'Metal hit samples' },
  { name: 'wind', kind: 'sample', description: 'Wind texture samples' },
  { name: 'insect', kind: 'sample', description: 'Insect field recordings' },
  { name: 'east', kind: 'sample', description: 'Eastern instruments' },
  { name: 'crow', kind: 'sample', description: 'Crow calls' },
  { name: 'space', kind: 'sample', description: 'Space texture samples' },
  { name: 'numbers', kind: 'sample', description: 'Spoken number samples' },
  { name: 'perc', kind: 'sample', description: 'General percussion' },
  { name: 'casio', kind: 'sample', description: 'Casio keyboard samples' },
  { name: 'amen', kind: 'sample', description: 'The Amen break (loaded via samples("github:yaxu/clean-breaks") or similar). Pair with .fit().chop(N).cut(1).' },
  { name: 'breaks', kind: 'sample', description: 'Breakbeat loops (needs samples() call).' },
  { name: 'crate', kind: 'sample', description: 'eddyflux/crate percussion kit (load with samples("github:eddyflux/crate").bank("crate"))' },
];

export const GM_INSTRUMENTS: SoundEntry[] = [
  { name: 'gm_acoustic_grand_piano', kind: 'gm', description: 'GM acoustic grand piano' },
  { name: 'gm_electric_piano_1', kind: 'gm', description: 'GM electric piano (Rhodes-like)' },
  { name: 'gm_acoustic_guitar_nylon', kind: 'gm', description: 'GM nylon acoustic guitar' },
  { name: 'gm_electric_guitar_muted', kind: 'gm', description: 'GM muted electric guitar' },
  { name: 'gm_overdriven_guitar', kind: 'gm', description: 'GM overdriven guitar' },
  { name: 'gm_acoustic_bass', kind: 'gm', description: 'GM acoustic bass' },
  { name: 'gm_electric_bass_finger', kind: 'gm', description: 'GM fingered electric bass' },
  { name: 'gm_synth_bass_1', kind: 'gm', description: 'GM synth bass 1' },
  { name: 'gm_synth_bass_2', kind: 'gm', description: 'GM synth bass 2' },
  { name: 'gm_synth_strings_1', kind: 'gm', description: 'GM synth strings 1' },
  { name: 'gm_string_ensemble_1', kind: 'gm', description: 'GM string ensemble' },
  { name: 'gm_voice_oohs', kind: 'gm', description: 'GM voice "oohs" pad' },
  { name: 'gm_choir_aahs', kind: 'gm', description: 'GM choir "aahs" pad' },
  { name: 'gm_blown_bottle', kind: 'gm', description: 'GM blown bottle' },
  { name: 'gm_lead_1_square', kind: 'gm', description: 'GM square lead' },
  { name: 'gm_lead_2_sawtooth', kind: 'gm', description: 'GM sawtooth lead' },
  { name: 'gm_pad_2_warm', kind: 'gm', description: 'GM warm pad' },
  { name: 'gm_pad_3_polysynth', kind: 'gm', description: 'GM polysynth pad' },
  { name: 'gm_epiano1', kind: 'gm', description: 'GM electric piano alias' },
  { name: 'gm_electric_guitar_clean', kind: 'gm', description: 'GM clean electric guitar — for arpeggios' },
  { name: 'gm_accordion', kind: 'gm', description: 'GM accordion' },
  { name: 'gm_xylophone', kind: 'gm', description: 'GM xylophone — arpeggio playground' },
  { name: 'gm_marimba', kind: 'gm', description: 'GM marimba' },
  { name: 'gm_vibraphone', kind: 'gm', description: 'GM vibraphone — jazz comping' },
  { name: 'gm_celesta', kind: 'gm', description: 'GM celesta — bell-like' },
  { name: 'gm_french_horn', kind: 'gm', description: 'GM french horn' },
  { name: 'gm_brass_section', kind: 'gm', description: 'GM brass section — stab horns' },
  { name: 'gm_trumpet', kind: 'gm', description: 'GM trumpet' },
  { name: 'gm_lead_6_voice', kind: 'gm', description: 'GM voice lead' },
  { name: 'gm_lead_8_bass_lead', kind: 'gm', description: 'GM bass lead' },
  { name: 'gm_pad_1_new_age', kind: 'gm', description: 'GM new age pad' },
  { name: 'gm_pad_4_choir', kind: 'gm', description: 'GM choir pad' },
  { name: 'gm_pad_5_bowed', kind: 'gm', description: 'GM bowed pad' },
  { name: 'gm_pad_7_halo', kind: 'gm', description: 'GM halo pad' },
  { name: 'gm_fx_1_rain', kind: 'gm', description: 'GM rain effect' },
  { name: 'gm_fx_4_atmosphere', kind: 'gm', description: 'GM atmosphere' },
  { name: 'gm_banjo', kind: 'gm', description: 'GM banjo' },
];

export const ALL_SOUNDS: SoundEntry[] = [
  ...DRUMS,
  ...DRUM_BANKS,
  ...SYNTHS,
  ...SAMPLE_LIBRARIES,
  ...GM_INSTRUMENTS,
];

export function searchSounds(query: string): SoundEntry[] {
  const q = query.toLowerCase();
  return ALL_SOUNDS.filter(
    (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
  );
}
