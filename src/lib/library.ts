import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DEFAULT_DIR = path.join(os.homedir(), '.strudel-mcp', 'library');
const EXPORTS_DIR = path.join(os.homedir(), '.strudel-mcp', 'exports');

export interface Snippet {
  name: string;
  code: string;
  tags: string[];
  notes?: string;
  created: string;
  updated: string;
}

export interface SnippetIndex {
  name: string;
  tags: string[];
  notes?: string;
  updated: string;
}

function libraryDir(): string {
  return process.env.STRUDEL_MCP_LIBRARY ?? DEFAULT_DIR;
}

async function ensureDir(): Promise<string> {
  const dir = libraryDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function sanitizeName(name: string): string {
  const s = name.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  if (!s || s === '__proto__' || s === '_' || /^_+$/.test(s)) {
    throw new Error(`Invalid snippet name: "${name}"`);
  }
  return s;
}

function snippetPath(name: string): string {
  return path.join(libraryDir(), `${sanitizeName(name)}.json`);
}

export async function saveSnippet(
  name: string,
  code: string,
  opts: { tags?: string[]; notes?: string } = {},
): Promise<Snippet> {
  const dir = await ensureDir();
  const file = path.join(dir, `${sanitizeName(name)}.json`);
  const now = new Date().toISOString();
  let created = now;
  try {
    const existing = JSON.parse(await fs.readFile(file, 'utf-8')) as Snippet;
    created = existing.created ?? now;
  } catch {
    // new snippet
  }
  const snippet: Snippet = {
    name: sanitizeName(name),
    code,
    tags: opts.tags ?? [],
    notes: opts.notes,
    created,
    updated: now,
  };
  await fs.writeFile(file, JSON.stringify(snippet, null, 2), 'utf-8');
  return snippet;
}

export async function loadSnippet(name: string): Promise<Snippet> {
  const file = snippetPath(name);
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as Snippet;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Snippet "${name}" not found.`);
    }
    throw err;
  }
}

export async function listSnippets(): Promise<SnippetIndex[]> {
  const dir = await ensureDir();
  const files = await fs.readdir(dir);
  const out: SnippetIndex[] = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(dir, f), 'utf-8');
      const s = JSON.parse(raw) as Snippet;
      out.push({ name: s.name, tags: s.tags, notes: s.notes, updated: s.updated });
    } catch {
      // skip broken files
    }
  }
  return out.sort((a, b) => b.updated.localeCompare(a.updated));
}

export async function deleteSnippet(name: string): Promise<boolean> {
  const file = snippetPath(name);
  try {
    await fs.unlink(file);
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw err;
  }
}

export async function saveExport(name: string, html: string): Promise<string> {
  const dir = process.env.STRUDEL_MCP_EXPORTS ?? EXPORTS_DIR;
  await fs.mkdir(dir, { recursive: true });
  const safe = name.trim().replace(/[^a-zA-Z0-9_\-]/g, '_') || 'pattern';
  const file = path.join(dir, `${safe}.html`);
  await fs.writeFile(file, html, 'utf-8');
  return file;
}
