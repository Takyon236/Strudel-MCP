import { z } from 'zod';
import { notesInScale, SCALES, COMMON_PROGRESSIONS } from '../knowledge/scales.js';
import {
  parseChordSymbol,
  progressionInScale,
  progressionToStrudelPattern,
  chordToStrudelNote,
} from '../lib/theory.js';

export const theoryInputSchema = {
  action: z
    .enum(['scale', 'chord', 'progression', 'list-scales', 'list-progressions'])
    .describe(
      '"scale" → notes in a scale. "chord" → intervals/notes of a chord symbol. ' +
        '"progression" → Roman numerals to notes in a key. ' +
        '"list-scales" / "list-progressions" → catalog lookups.',
    ),
  scale: z
    .string()
    .optional()
    .describe('Scale spec like "C:minor", "A2:dorian", "F:major:pentatonic".'),
  chord: z.string().optional().describe('Chord symbol like "Cmaj7", "Am7", "G7", "Dsus4".'),
  progression: z
    .string()
    .optional()
    .describe(
      'Roman numeral progression like "I V vi IV" or named: "I-V-vi-IV", "ii-V-I", "12-bar-blues".',
    ),
};

export function strudelTheory(input: {
  action: 'scale' | 'chord' | 'progression' | 'list-scales' | 'list-progressions';
  scale?: string;
  chord?: string;
  progression?: string;
}) {
  switch (input.action) {
    case 'list-scales':
      return text(
        '## Available scales\n\n' +
          SCALES.map((s) => `- **${s.name}** (${s.family}) — ${s.description}`).join('\n'),
      );
    case 'list-progressions':
      return text(
        '## Common progressions\n\n' +
          Object.entries(COMMON_PROGRESSIONS)
            .map(([name, prog]) => `- **${name}** — ${prog.join(' ')}`)
            .join('\n'),
      );
    case 'scale': {
      if (!input.scale) return text('Provide `scale` (e.g. "C:minor" or "A:major:pentatonic").');
      const result = notesInScale(input.scale);
      if (!result) return text(`Could not parse scale "${input.scale}". Use format "Root:type".`);
      return text(
        `### Scale: ${input.scale}\n\n` +
          `**Notes:** ${result.names.join(' ')}\n` +
          `**MIDI:** ${result.midi.join(' ')}\n\n` +
          `**Strudel usage:**\n\`\`\`js\nn("0 1 2 3 4 5 6").scale("${input.scale}").sound("piano")\n\`\`\``,
      );
    }
    case 'chord': {
      if (!input.chord) return text('Provide `chord` (e.g. "Cmaj7", "Am7", "G7").');
      const parsed = parseChordSymbol(input.chord);
      if (!parsed) return text(`Could not parse chord symbol "${input.chord}".`);
      return text(
        `### Chord: ${parsed.symbol}\n\n` +
          `**Notes:** ${parsed.names.join(' ')}\n` +
          `**MIDI:** ${parsed.midi.join(' ')}\n\n` +
          `**Strudel note pattern:** \`${chordToStrudelNote(parsed)}\`\n\n` +
          `**Usage:**\n\`\`\`js\nnote("${chordToStrudelNote(parsed)}").sound("piano")\n\`\`\``,
      );
    }
    case 'progression': {
      if (!input.progression || !input.scale) {
        return text(
          'Provide both `progression` (e.g. "I V vi IV" or "ii-V-I") and `scale` (e.g. "C:major").',
        );
      }
      const named = COMMON_PROGRESSIONS[input.progression];
      const degrees = named ?? input.progression.split(/[\s-]+/).filter(Boolean);
      const chords = progressionInScale(degrees, input.scale);
      if (!chords) {
        return text(
          `Could not resolve progression "${input.progression}" in "${input.scale}". ` +
            `Check Roman numerals (I II III IV V VI VII) and scale spec.`,
        );
      }
      const chordList = chords
        .map((c) => `- **${c.symbol}** — ${c.names.join(' ')}`)
        .join('\n');
      return text(
        `### Progression: ${degrees.join(' ')} in ${input.scale}\n\n` +
          `${chordList}\n\n` +
          `**Strudel pattern:** \`${progressionToStrudelPattern(chords)}\`\n\n` +
          `**Usage:**\n\`\`\`js\nnote("${progressionToStrudelPattern(chords)}").sound("piano").slow(4)\n\`\`\``,
      );
    }
  }
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
