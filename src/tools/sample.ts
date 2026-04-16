import { z } from 'zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ensureSamplesDir,
  ensureServer,
  sanitizeName,
  classifyUrl,
  checkYtDlp,
  downloadWithYtDlp,
  downloadDirect,
  listSamples,
} from '../lib/sampleServer.js';

export const sampleInputSchema = {
  action: z
    .enum(['download', 'list'])
    .describe('"download" fetches audio from a URL. "list" shows all downloaded samples with their serve URLs.'),
  url: z
    .string()
    .optional()
    .describe('URL to download audio from. Supports YouTube, SoundCloud (via yt-dlp), or direct audio file URLs.'),
  name: z
    .string()
    .optional()
    .describe('Name for the sample (used in Strudel patterns). Defaults to sanitized filename or video title.'),
  format: z
    .enum(['wav', 'mp3'])
    .optional()
    .describe('Output format for yt-dlp downloads. Default: wav.'),
};

export async function strudelSample(input: {
  action: string;
  url?: string;
  name?: string;
  format?: string;
}) {
  try {
    switch (input.action) {
      case 'download':
        return await handleDownload(input);
      case 'list':
        return await handleList();
      default:
        return text(`Unknown action "${input.action}". Use "download" or "list".`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return text(`Error: ${msg}`);
  }
}

async function handleDownload(input: { url?: string; name?: string; format?: string }) {
  if (!input.url) {
    return text('download requires a url parameter.');
  }

  const url = input.url;
  const format = input.format ?? 'wav';
  const kind = classifyUrl(url);

  const rawName = input.name ?? deriveNameFromUrl(url);
  const name = sanitizeName(rawName);
  const dir = await ensureSamplesDir();

  const destPath = path.join(dir, `${name}.${format}`);

  try {
    await fs.access(destPath);
    const port = await ensureServer();
    const stat = await fs.stat(destPath);
    const serveUrl = `http://127.0.0.1:${port}/${encodeURIComponent(`${name}.${format}`)}`;
    return text(formatResponse(name, `${name}.${format}`, stat.size, serveUrl, true));
  } catch {
    // file doesn't exist, proceed with download
  }

  let finalPath: string;

  if (kind === 'youtube' || kind === 'soundcloud') {
    const hasYtDlp = await checkYtDlp();
    if (!hasYtDlp) {
      return text(
        'yt-dlp is not installed. Install it with:\n' +
        '  brew install yt-dlp    (macOS)\n' +
        '  sudo apt install yt-dlp (Ubuntu)\n' +
        '  pip install yt-dlp      (pip)\n' +
        '  See https://github.com/yt-dlp/yt-dlp',
      );
    }
    finalPath = await downloadWithYtDlp(url, dir, name, format);
  } else {
    await downloadDirect(url, destPath);
    finalPath = destPath;
  }

  const port = await ensureServer();
  const stat = await fs.stat(finalPath);
  const filename = path.basename(finalPath);
  const serveUrl = `http://127.0.0.1:${port}/${encodeURIComponent(filename)}`;

  return text(formatResponse(name, filename, stat.size, serveUrl, false));
}

async function handleList() {
  const port = await ensureServer();
  const samples = await listSamples(port);

  if (samples.length === 0) {
    return text('No samples downloaded yet. Use action "download" with a URL to get started.');
  }

  const lines = samples.map(
    (s) => `- **${s.name}** (${formatSize(s.size)}) — \`${s.url}\``,
  );

  return text(
    `## Downloaded samples (${samples.length})\n\n` +
    `Server running at http://127.0.0.1:${port}/\n\n` +
    lines.join('\n') +
    '\n\n### Load in Strudel:\n```js\nsamples({\n' +
    samples.map((s) => `  ${s.name}: '${s.url}'`).join(',\n') +
    '\n})\n```',
  );
}

function deriveNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      return last.replace(/\.[^.]+$/, '');
    }
  } catch { /* ignore */ }
  return 'sample';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

function formatResponse(
  name: string,
  filename: string,
  size: number,
  serveUrl: string,
  cached: boolean,
): string {
  return [
    cached ? `## Sample "${name}" (cached)` : `## Sample "${name}" downloaded`,
    '',
    `- **File:** ${filename} (${formatSize(size)})`,
    `- **Serve URL:** ${serveUrl}`,
    '',
    '### Load in Strudel:',
    '```js',
    `samples({ ${name}: '${serveUrl}' })`,
    '```',
    '',
    '### Example patterns:',
    '```js',
    `// Play the full sample`,
    `s("${name}")`,
    '',
    `// Chop into 16 slices and play in order`,
    `s("${name}").fit().chop(16).cut(1)`,
    '',
    `// Rearrange slices`,
    `s("${name}").fit().slice(8, "<0 1 2 3 4*2 5 6 [6 7]>*2").cut(1)`,
    '',
    `// Reverse every 4th cycle`,
    `s("${name}").fit().chop(8).cut(1).every(4, rev)`,
    '',
    `// Pitch shift`,
    `s("${name}").note("<0 5 7 12>")`,
    '```',
  ].join('\n');
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
