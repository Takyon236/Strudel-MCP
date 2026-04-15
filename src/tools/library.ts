import { z } from 'zod';
import {
  saveSnippet,
  loadSnippet,
  listSnippets,
  deleteSnippet,
} from '../lib/library.js';
import { patternUrl } from '../lib/encode.js';

export const libraryInputSchema = {
  action: z
    .enum(['save', 'load', 'list', 'delete'])
    .describe('Operation to perform on the snippet library.'),
  name: z
    .string()
    .optional()
    .describe('Snippet name (required for save/load/delete).'),
  code: z.string().optional().describe('Pattern code (required for save).'),
  tags: z.array(z.string()).optional().describe('Optional tags for save.'),
  notes: z.string().optional().describe('Optional free-text notes for save.'),
};

export async function strudelLibrary(input: {
  action: 'save' | 'load' | 'list' | 'delete';
  name?: string;
  code?: string;
  tags?: string[];
  notes?: string;
}) {
  switch (input.action) {
    case 'save': {
      if (!input.name || !input.code) return text('save requires `name` and `code`.');
      const snip = await saveSnippet(input.name, input.code, {
        tags: input.tags,
        notes: input.notes,
      });
      return text(
        `Saved "${snip.name}" (${snip.code.length} chars, ${snip.tags.length} tag(s)).`,
      );
    }
    case 'load': {
      if (!input.name) return text('load requires `name`.');
      const snip = await loadSnippet(input.name);
      return text(
        `### ${snip.name}\n` +
          `**Tags:** ${snip.tags.join(', ') || '(none)'}\n` +
          `**Updated:** ${snip.updated}\n` +
          (snip.notes ? `**Notes:** ${snip.notes}\n` : '') +
          `**URL:** ${patternUrl(snip.code)}\n\n` +
          '```js\n' +
          snip.code +
          '\n```',
      );
    }
    case 'list': {
      const snips = await listSnippets();
      if (snips.length === 0) return text('Library is empty. Use `action: "save"` to add a snippet.');
      const rendered = snips
        .map(
          (s) =>
            `- **${s.name}** — ${s.tags.join(', ') || '(no tags)'}${
              s.notes ? ` — ${s.notes}` : ''
            } _(${s.updated.slice(0, 10)})_`,
        )
        .join('\n');
      return text(`## Library (${snips.length} snippets)\n\n${rendered}`);
    }
    case 'delete': {
      if (!input.name) return text('delete requires `name`.');
      const ok = await deleteSnippet(input.name);
      return text(ok ? `Deleted "${input.name}".` : `Snippet "${input.name}" not found.`);
    }
  }
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
