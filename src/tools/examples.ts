import { z } from 'zod';
import { EXAMPLES, searchExamples } from '../knowledge/examples.js';

export const examplesInputSchema = {
  query: z
    .string()
    .optional()
    .describe(
      'Free-text search over titles, descriptions, and tags. Useful tags: drums, bass, house, techno, hip-hop, jazz, ambient, dnb, acid, pad, melody, chord, pentatonic, euclidean, polymeter, trap, psytrance. Omit to get a default selection.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .describe('Maximum number of examples to return (default 5).'),
};

export function strudelExamples(input: { query?: string; limit?: number }) {
  const limit = input.limit ?? 5;
  const results = input.query ? searchExamples(input.query, limit) : EXAMPLES.slice(0, limit);
  if (results.length === 0) {
    return text(
      `No examples matched "${input.query}". Available tags: drums, bass, house, techno, hip-hop, jazz, ambient, dnb, acid, pad, melody, chord, pentatonic, euclidean, polymeter, trap, psytrance.`,
    );
  }
  const rendered = results
    .map(
      (ex) =>
        `### ${ex.title}\n**Tags:** ${ex.tags.join(', ')}\n\n${ex.description}\n\n\`\`\`js\n${ex.code}\n\`\`\``,
    )
    .join('\n\n---\n\n');
  return text(rendered);
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
