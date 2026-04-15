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
