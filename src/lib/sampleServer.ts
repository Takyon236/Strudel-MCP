import { promises as fs } from 'node:fs';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import https from 'node:https';
import { spawn } from 'node:child_process';

const DEFAULT_DIR = path.join(os.homedir(), '.strudel-mcp', 'samples');

function samplesDir(): string {
  return process.env.STRUDEL_MCP_SAMPLES ?? DEFAULT_DIR;
}

export async function ensureSamplesDir(): Promise<string> {
  const dir = samplesDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function sanitizeName(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return cleaned || 'sample';
}

const CONTENT_TYPES: Record<string, string> = {
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.aiff': 'audio/aiff',
  '.webm': 'audio/webm',
  '.m4a': 'audio/mp4',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.json': 'application/json',
};

const AUDIO_EXTENSIONS = new Set(['.wav', '.mp3', '.ogg', '.flac', '.aiff', '.webm', '.m4a']);

// ── HTTP server singleton ──

let serverReady: Promise<number> | null = null;

export function ensureServer(): Promise<number> {
  if (serverReady) return serverReady;
  serverReady = startServer();
  return serverReady;
}

async function startServer(): Promise<number> {
  const dir = await ensureSamplesDir();
  return new Promise((resolve, reject) => {
    const srv = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method !== 'GET') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
      }

      const rawPath = decodeURIComponent(req.url ?? '/');

      if (rawPath === '/play' || rawPath.startsWith('/play?')) {
        const code = new URL(req.url ?? '/', `http://${req.headers.host}`).searchParams.get('code') ?? '';
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(generatePlayerHtml(code));
        return;
      }

      if (rawPath === '/strudel.json') {
        try {
          const files = await fs.readdir(dir);
          const audioFiles = files.filter((f) => AUDIO_EXTENSIONS.has(path.extname(f).toLowerCase()));
          const manifest: Record<string, string | string[]> = { '_base': './' };
          for (const f of audioFiles) {
            const sampleName = path.basename(f, path.extname(f));
            manifest[sampleName] = [f];
          }
          const json = JSON.stringify(manifest, null, 2);
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(json),
          });
          res.end(json);
        } catch {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
        return;
      }

      const filename = path.basename(rawPath.slice(1));
      if (!filename || filename.includes('..')) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
      }

      const filePath = path.join(dir, filename);
      try {
        const stat = await fs.stat(filePath);
        const ext = path.extname(filename).toLowerCase();
        const rangeHeader = req.headers.range;
        res.setHeader('Accept-Ranges', 'bytes');
        if (rangeHeader) {
          const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader);
          if (match) {
            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : stat.size - 1;
            if (start > end || end >= stat.size) {
              res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
              res.end();
              return;
            }
            const chunkSize = end - start + 1;
            res.writeHead(206, {
              'Content-Type': CONTENT_TYPES[ext] ?? 'application/octet-stream',
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Content-Length': chunkSize,
            });
            createReadStream(filePath, { start, end }).pipe(res);
            return;
          }
        }
        res.writeHead(200, {
          'Content-Type': CONTENT_TYPES[ext] ?? 'application/octet-stream',
          'Content-Length': stat.size,
        });
        createReadStream(filePath).pipe(res);
      } catch {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    const port = parseInt(process.env.STRUDEL_MCP_SAMPLE_PORT || '0', 10);
    srv.listen(port, '127.0.0.1', () => {
      const addr = srv.address();
      if (typeof addr === 'object' && addr) {
        resolve(addr.port);
      } else {
        reject(new Error('Failed to bind server'));
      }
    });

    srv.on('error', reject);
    srv.unref();
  });
}

// ── URL classification ──

export function classifyUrl(url: string): 'youtube' | 'soundcloud' | 'direct' {
  try {
    const u = new URL(url);
    const host = u.hostname.replace('www.', '');
    if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') return 'youtube';
    if (host === 'soundcloud.com') return 'soundcloud';
  } catch { /* invalid URL, treat as direct */ }
  return 'direct';
}

// ── yt-dlp ──

export async function checkYtDlp(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('yt-dlp', ['--version'], { stdio: 'ignore' });
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
  });
}

export async function downloadWithYtDlp(
  url: string,
  dir: string,
  name: string,
  format: string,
): Promise<string> {
  const template = path.join(dir, `${name}.%(ext)s`);
  return new Promise((resolve, reject) => {
    const args = ['-x', '--audio-format', format, '-o', template, '--no-playlist', url];
    const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    proc.on('error', (err) => reject(new Error(`yt-dlp spawn error: ${err.message}`)));
    proc.on('close', async (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp failed (exit ${code}): ${stderr.slice(0, 500)}`));
        return;
      }
      const target = path.join(dir, `${name}.${format}`);
      if (existsSync(target)) {
        resolve(target);
        return;
      }
      const files = await fs.readdir(dir);
      const match = files.find((f) => f.startsWith(name + '.') && AUDIO_EXTENSIONS.has(path.extname(f).toLowerCase()));
      if (match) {
        resolve(path.join(dir, match));
      } else {
        reject(new Error(`yt-dlp finished but no audio file found for ${name}`));
      }
    });
  });
}

// ── Direct download ──

export async function downloadDirect(
  url: string,
  destPath: string,
  redirects = 5,
): Promise<void> {
  if (redirects <= 0) throw new Error('Too many redirects');
  const mod = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    mod.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        downloadDirect(next, destPath, redirects - 1).then(resolve, reject);
        return;
      }
      if (res.statusCode && res.statusCode >= 400) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const stream = createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);
    }).on('error', reject);
  });
}

// ── List samples ──

export interface SampleInfo {
  name: string;
  filename: string;
  size: number;
  url: string;
}

export async function listSamples(port: number): Promise<SampleInfo[]> {
  const dir = await ensureSamplesDir();
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const audioFiles = files.filter((f) => AUDIO_EXTENSIONS.has(path.extname(f).toLowerCase()));
  const results: SampleInfo[] = [];
  for (const f of audioFiles) {
    const stat = await fs.stat(path.join(dir, f));
    const name = path.basename(f, path.extname(f));
    results.push({
      name,
      filename: f,
      size: stat.size,
      url: `http://127.0.0.1:${port}/${encodeURIComponent(f)}`,
    });
  }
  return results;
}

function generatePlayerHtml(code: string): string {
  const escapedCode = code.replace(/<\/(script)/gi, '<\\/$1');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Strudel MCP Player</title>
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #0a0a0a; color: #eee; font-family: system-ui; }
  header { padding: 10px 20px; border-bottom: 1px solid #222; font-size: 13px; display: flex; align-items: center; gap: 12px; }
  header code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; color: #ffb86c; }
  #editor { width: 100%; height: calc(100vh - 100px); background: #111; color: #ffb86c; font-family: monospace; font-size: 14px; padding: 16px; border: none; resize: none; box-sizing: border-box; }
  #controls { padding: 8px 20px; display: flex; gap: 12px; align-items: center; border-top: 1px solid #222; }
  button { background: #1a1a1a; color: #eee; border: 1px solid #333; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-size: 13px; }
  button:hover { background: #222; }
  button.playing { background: #2a4a2a; border-color: #4a8a4a; }
  #status { font-size: 12px; color: #666; }
</style>
</head>
<body>
<header>Strudel MCP Player — <code>same-origin sample server (no mixed content)</code></header>
<script type="application/strudel-pattern" id="strudel-code">${escapedCode}<\/script>
<textarea id="editor"></textarea>
<div id="controls">
  <button id="play">&#9654; Play</button>
  <button id="stop">&#9632; Stop</button>
  <span id="status">Ready</span>
</div>
<script type="module">
import { controls, repl, Pattern, stack, silence, pure, register, setcpm, setcps, evalScope } from 'https://esm.sh/@strudel/core@latest';
import { initAudioOnFirstClick, getAudioContext, webaudioOutput, registerSynthSounds, samples } from 'https://esm.sh/@strudel/webaudio@latest';
import { transpiler } from 'https://esm.sh/@strudel/transpiler@latest';
import { registerSoundfonts } from 'https://esm.sh/@strudel/soundfonts@latest';
import 'https://esm.sh/@strudel/mini@latest';
import 'https://esm.sh/@strudel/tonal@latest';

initAudioOnFirstClick();

const editor = document.getElementById('editor');
const statusEl = document.getElementById('status');
const codeHolder = document.getElementById('strudel-code');
editor.value = codeHolder ? codeHolder.textContent.trim() : '';

let currentRepl = null;
let samplesLoaded = false;

async function ensureSamplesLoaded() {
  if (samplesLoaded) return;
  statusEl.textContent = 'Loading samples...';
  await samples('github:tidalcycles/dirt-samples');
  await registerSoundfonts();
  samplesLoaded = true;
}

async function doPlay() {
  try {
    if (currentRepl) {
      try { currentRepl.scheduler.stop(); } catch(_) {}
    }
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    await registerSynthSounds();
    await ensureSamplesLoaded();
    currentRepl = repl({
      defaultOutput: webaudioOutput,
      transpiler,
    });
    await currentRepl.evaluate(editor.value);
    currentRepl.scheduler.start();
    document.getElementById('play').classList.add('playing');
    statusEl.textContent = 'Playing...';
  } catch(e) {
    statusEl.textContent = 'Error: ' + e.message;
    console.error(e);
  }
}

function doStop() {
  if (currentRepl) {
    try { currentRepl.scheduler.stop(); } catch(_) {}
    currentRepl = null;
  }
  document.getElementById('play').classList.remove('playing');
  statusEl.textContent = 'Stopped';
}

document.getElementById('play').addEventListener('click', doPlay);
document.getElementById('stop').addEventListener('click', doStop);
<\/script>
</body>
</html>`;
}

export { generatePlayerHtml };
