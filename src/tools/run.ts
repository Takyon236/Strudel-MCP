import { z } from 'zod';
import { spawn } from 'node:child_process';
import { patternUrl, generateEmbedHtml } from '../lib/encode.js';
import { saveExport } from '../lib/library.js';
import { validatePattern } from '../lib/validate.js';

const URL_STRATEGY_THRESHOLD = 1200;
const URL_SAFE_LENGTH = 2000;

export const runInputSchema = {
  code: z.string().describe('Strudel pattern code to run.'),
  strategy: z
    .enum(['auto', 'url', 'embed'])
    .optional()
    .default('auto')
    .describe(
      '"url" → return strudel.cc/#<base64> share URL. ' +
        '"embed" → write a local HTML file using @strudel/embed (no URL length limit). ' +
        '"auto" (default) → URL for short patterns (<1500 chars), embed for longer ones.',
    ),
  name: z
    .string()
    .optional()
    .describe('Optional filename for embed mode (without .html extension).'),
  open: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Open the URL or HTML file in the system default browser via xdg-open/open/start. ' +
        'Non-blocking — the browser runs independently.',
    ),
};

function pickStrategy(code: string, explicit: 'auto' | 'url' | 'embed'): 'url' | 'embed' {
  if (explicit !== 'auto') return explicit;
  return code.length < URL_STRATEGY_THRESHOLD ? 'url' : 'embed';
}

function openExternal(target: string): { ok: boolean; message: string } {
  const platform = process.platform;
  try {
    let child;
    if (platform === 'darwin') {
      child = spawn('open', [target], { detached: true, stdio: 'ignore' });
    } else if (platform === 'win32') {
      child = spawn('cmd', ['/c', 'start', '""', target], { detached: true, stdio: 'ignore' });
    } else {
      child = spawn('xdg-open', [target], { detached: true, stdio: 'ignore' });
    }
    child.unref();
    child.on('error', () => {});
    const label = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
    return { ok: true, message: `Spawned ${label} (browser should appear; if not, open the file manually).` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Failed to launch system opener: ${msg}` };
  }
}

export async function strudelRun(input: {
  code: string;
  strategy?: 'auto' | 'url' | 'embed';
  name?: string;
  open?: boolean;
}) {
  const validation = validatePattern(input.code);
  const errorIssues = validation.issues.filter((i) => i.severity === 'error');
  const strategy = pickStrategy(input.code, input.strategy ?? 'auto');

  const lines: string[] = [];
  lines.push(`**Strategy:** ${strategy} (code: ${input.code.length} chars)`);

  if (errorIssues.length > 0) {
    lines.push('', '**Warning — validator found errors:**');
    for (const e of errorIssues) lines.push(`- ${e.message}`);
  }

  const url = patternUrl(input.code);

  if (strategy === 'url') {
    lines.push('', `**URL:** ${url}`);
    lines.push(`**URL length:** ${url.length} chars`);
    if (url.length > URL_SAFE_LENGTH) {
      lines.push(
        '',
        `> ⚠️ URL is ${url.length} chars — markdown link rendering may break. Consider \`strategy: "embed"\` for a local HTML file instead.`,
      );
    }
    if (input.open) {
      const r = openExternal(url);
      lines.push('', r.message);
    } else {
      lines.push('', 'Open this URL in a browser to hear it, or re-call with `open: true`.');
    }
    return text(lines.join('\n'));
  }

  const name = input.name ?? `pattern-${Date.now()}`;
  const html = generateEmbedHtml(input.code, name);
  let file: string;
  try {
    file = await saveExport(name, html);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    lines.push('', `**Embed file write failed:** ${msg}`, '', `**Fallback URL:** ${url}`);
    if (url.length > URL_SAFE_LENGTH) {
      lines.push(
        '',
        '> ⚠️ Fallback URL is over 2000 chars and may be truncated by markdown/browser. ' +
          'Copy the code manually into strudel.cc.',
      );
    }
    return text(lines.join('\n'));
  }
  const fileUrl = `file://${file}`;

  lines.push('', `**HTML file:** ${file}`);
  lines.push(`**file:// URL:** ${fileUrl}`);
  if (url.length <= URL_SAFE_LENGTH) {
    lines.push(`**Backup strudel.cc URL:** ${url} (${url.length} chars)`);
  } else {
    lines.push(
      `**Backup URL omitted:** would be ${url.length} chars — above the 2000-char safe threshold.`,
    );
  }

  if (input.open) {
    const r = openExternal(file);
    lines.push('', r.message);
    lines.push(
      'The embedded Strudel REPL will load in your browser with the pattern pre-filled. Click play to hear it.',
    );
  } else {
    lines.push(
      '',
      `Open the file with: \`xdg-open "${file}"\` (Linux) · \`open "${file}"\` (Mac) · \`start "" "${file}"\` (Windows).`,
      'Or re-call this tool with `open: true`.',
    );
  }

  return text(lines.join('\n'));
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
