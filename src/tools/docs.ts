import { z } from 'zod';
import { FUNCTIONS, findFunction, functionsByCategory, FunctionDoc } from '../knowledge/functions.js';
import { EFFECTS, findEffect, effectsByCategory, EffectDoc } from '../knowledge/effects.js';
import { MINI_OVERVIEW, MINI_RULES } from '../knowledge/minispec.js';

export const docsInputSchema = {
  topic: z
    .string()
    .describe(
      'Function name (e.g. "note", "stack"), effect (e.g. "lpf"), category ' +
        '("effects", "filters", "envelope", "conditional", "time", "pattern", "source"), ' +
        'or concept ("mini-notation", "minispec", "overview").',
    ),
};

function renderFunction(f: FunctionDoc): string {
  const lines = [
    `### ${f.name}${f.aliases?.length ? ` (aliases: ${f.aliases.join(', ')})` : ''}`,
    `**Category:** ${f.category}`,
    `**Signature:** \`${f.signature}\``,
    ``,
    f.summary,
  ];
  if (f.example) lines.push('', '```js', f.example, '```');
  return lines.join('\n');
}

function renderEffect(e: EffectDoc): string {
  const lines = [
    `### ${e.name}`,
    `**Category:** ${e.category}`,
    `**Signature:** \`${e.signature}\``,
    e.range ? `**Range:** ${e.range}` : '',
    ``,
    e.summary,
  ].filter(Boolean);
  if (e.example) lines.push('', '```js', e.example, '```');
  return lines.join('\n');
}

const CATEGORY_MAP: Record<string, () => string> = {
  effects: () => EFFECTS.map(renderEffect).join('\n\n'),
  filters: () => effectsByCategory('filter').map(renderEffect).join('\n\n'),
  envelope: () => effectsByCategory('envelope').map(renderEffect).join('\n\n'),
  dynamics: () => effectsByCategory('dynamics').map(renderEffect).join('\n\n'),
  spatial: () => effectsByCategory('spatial').map(renderEffect).join('\n\n'),
  modulation: () => effectsByCategory('modulation').map(renderEffect).join('\n\n'),
  distortion: () => effectsByCategory('distortion').map(renderEffect).join('\n\n'),
  pitch: () => effectsByCategory('pitch').map(renderEffect).join('\n\n'),
  source: () => functionsByCategory('source').map(renderFunction).join('\n\n'),
  pattern: () => functionsByCategory('pattern').map(renderFunction).join('\n\n'),
  time: () => functionsByCategory('time').map(renderFunction).join('\n\n'),
  conditional: () => functionsByCategory('conditional').map(renderFunction).join('\n\n'),
  control: () => functionsByCategory('control').map(renderFunction).join('\n\n'),
  tempo: () => functionsByCategory('tempo').map(renderFunction).join('\n\n'),
};

export function strudelDocs(input: { topic: string }): { content: Array<{ type: 'text'; text: string }> } {
  const topic = input.topic.trim().toLowerCase().replace(/^\./, '');

  if (topic === 'overview' || topic === 'intro' || topic === 'help' || topic === '') {
    return text(
      [
        '# Strudel Quick Reference',
        '',
        'Strudel is a JavaScript port of TidalCycles — a pattern language for live-coded music.',
        'Patterns live in strings ("mini-notation") and are chained with methods for effects.',
        '',
        '## Core idea',
        '- `sound("...")`, `note("...")`, `n("...").scale(...)` produce sound sources',
        '- Chain methods like `.lpf(1200).room(.5).gain(.8)` to shape them',
        '- `stack(...)` layers patterns; `cat(...)` concatenates them',
        '- Set tempo with `setcpm(bpm/4)` or `setcps(bpm/60/4)`',
        '',
        '## Topics to query',
        '- **Categories:** effects, filters, envelope, dynamics, spatial, modulation, distortion, pattern, time, conditional, source, control, tempo',
        '- **Concepts:** mini-notation, minispec',
        '- **Any function or effect by name:** e.g. "lpf", "jux", "chop", "scale"',
        '',
        'Try `strudel_docs topic="mini-notation"` or `strudel_docs topic="effects"`.',
      ].join('\n'),
    );
  }

  if (topic === 'mini-notation' || topic === 'minispec' || topic === 'mini' || topic === 'notation') {
    const rules = MINI_RULES.map((r) => `- \`${r.syntax}\` **${r.name}** — ${r.description}  \n  Example: \`${r.example}\``).join('\n');
    return text(`${MINI_OVERVIEW}\n\n## Rules\n\n${rules}`);
  }

  if (topic in CATEGORY_MAP) return text(CATEGORY_MAP[topic]());

  const fn = findFunction(topic);
  if (fn) return text(renderFunction(fn));

  const fx = findEffect(topic);
  if (fx) return text(renderEffect(fx));

  const fnMatches = FUNCTIONS.filter(
    (f) => f.name.includes(topic) || f.summary.toLowerCase().includes(topic),
  );
  const fxMatches = EFFECTS.filter(
    (e) => e.name.includes(topic) || e.summary.toLowerCase().includes(topic),
  );
  if (fnMatches.length + fxMatches.length === 0) {
    return text(
      `No direct match for "${topic}". Try one of: ${[...Object.keys(CATEGORY_MAP), 'mini-notation', 'overview'].join(', ')}`,
    );
  }
  const parts = [
    fnMatches.length ? `## Matching functions\n\n${fnMatches.map(renderFunction).join('\n\n')}` : '',
    fxMatches.length ? `## Matching effects\n\n${fxMatches.map(renderEffect).join('\n\n')}` : '',
  ].filter(Boolean);
  return text(parts.join('\n\n'));
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
