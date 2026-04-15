import { z } from 'zod';
import { validatePattern } from '../lib/validate.js';

export const validateInputSchema = {
  code: z.string().describe('Strudel pattern code to validate.'),
};

export function strudelValidate(input: { code: string }) {
  const result = validatePattern(input.code);
  if (result.issues.length === 0) {
    return text(
      `OK — no issues detected in ${input.code.split('\n').length} lines.\n\n` +
        (result.miniStrings.length
          ? `Mini-notation strings parsed: ${result.miniStrings.length}`
          : ''),
    );
  }
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const infos = result.issues.filter((i) => i.severity === 'info');
  const rendered = [
    `**Status:** ${result.ok ? 'parseable (with warnings)' : 'errors present'}`,
    `**Summary:** ${errors.length} error(s), ${warnings.length} warning(s), ${infos.length} info`,
    '',
    ...result.issues.map((i) => {
      const loc = i.line ? `${i.line}:${i.column ?? 0}` : '';
      return `- [${i.severity}] ${loc ? loc + ' ' : ''}${i.message}${i.hint ? ` — ${i.hint}` : ''}`;
    }),
  ];
  return text(rendered.join('\n'));
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
