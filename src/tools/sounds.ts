import { z } from 'zod';
import {
  DRUMS,
  DRUM_BANKS,
  SYNTHS,
  SAMPLE_LIBRARIES,
  GM_INSTRUMENTS,
  searchSounds,
  SoundEntry,
} from '../knowledge/sounds.js';

export const soundsInputSchema = {
  category: z
    .enum(['drums', 'banks', 'synths', 'samples', 'gm', 'all'])
    .optional()
    .describe(
      '"drums" = drum voice names (bd, sd...). "banks" = named drum machines (TR909...). ' +
        '"synths" = oscillator voices. "samples" = built-in sample libraries. ' +
        '"gm" = General MIDI instruments (gm_*). "all" = every category.',
    ),
  query: z
    .string()
    .optional()
    .describe('Free-text search across names and descriptions (e.g. "bass", "808", "piano").'),
};

function render(entries: SoundEntry[], heading?: string): string {
  if (entries.length === 0) return 'No sounds matched.';
  const lines = entries.map((e) => `- \`${e.name}\` — ${e.description}`);
  return heading ? `## ${heading}\n\n${lines.join('\n')}` : lines.join('\n');
}

export function strudelSounds(input: { category?: string; query?: string }) {
  if (input.query) {
    const results = searchSounds(input.query);
    return text(render(results, `Matches for "${input.query}"`));
  }
  switch (input.category) {
    case 'drums':
      return text(render(DRUMS, 'Drum voices'));
    case 'banks':
      return text(render(DRUM_BANKS, 'Drum machine banks (use with .bank(...))'));
    case 'synths':
      return text(render(SYNTHS, 'Synth oscillators'));
    case 'samples':
      return text(render(SAMPLE_LIBRARIES, 'Built-in sample libraries'));
    case 'gm':
      return text(render(GM_INSTRUMENTS, 'General MIDI instruments'));
    case 'all':
    default:
      return text(
        [
          render(DRUMS, 'Drum voices'),
          render(DRUM_BANKS, 'Drum machine banks'),
          render(SYNTHS, 'Synth oscillators'),
          render(SAMPLE_LIBRARIES, 'Built-in sample libraries'),
          render(GM_INSTRUMENTS, 'General MIDI instruments'),
        ].join('\n\n'),
      );
  }
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
