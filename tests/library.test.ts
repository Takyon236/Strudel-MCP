import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  saveSnippet,
  loadSnippet,
  listSnippets,
  deleteSnippet,
  saveExport,
} from '../src/lib/library.js';

const TMP_BASE = path.join(os.tmpdir(), `strudel-mcp-tests-${process.pid}`);
const TMP_LIBRARY = path.join(TMP_BASE, 'library');
const TMP_EXPORTS = path.join(TMP_BASE, 'exports');

beforeEach(() => {
  process.env.STRUDEL_MCP_LIBRARY = TMP_LIBRARY;
  process.env.STRUDEL_MCP_EXPORTS = TMP_EXPORTS;
});

afterEach(async () => {
  try {
    await fs.rm(TMP_BASE, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

describe('library — saveSnippet / loadSnippet', () => {
  test('save then load roundtrip', async () => {
    await saveSnippet('test_one', 'sound("bd*4")', { tags: ['drum'] });
    const loaded = await loadSnippet('test_one');
    expect(loaded.name).toBe('test_one');
    expect(loaded.code).toBe('sound("bd*4")');
    expect(loaded.tags).toEqual(['drum']);
  });

  test('updated timestamp changes on re-save', async () => {
    const first = await saveSnippet('retest', 'a', {});
    await new Promise((r) => setTimeout(r, 5));
    const second = await saveSnippet('retest', 'b', {});
    expect(second.updated).not.toBe(first.updated);
  });

  test('created timestamp preserved on re-save', async () => {
    const first = await saveSnippet('retest2', 'a', {});
    await new Promise((r) => setTimeout(r, 5));
    const second = await saveSnippet('retest2', 'b', {});
    expect(second.created).toBe(first.created);
  });

  test('load missing snippet throws', async () => {
    await expect(loadSnippet('nope')).rejects.toThrow(/not found/);
  });
});

describe('library — listSnippets', () => {
  test('empty list on fresh dir', async () => {
    expect(await listSnippets()).toEqual([]);
  });

  test('lists saved snippets', async () => {
    await saveSnippet('a', 'x', { tags: ['t1'] });
    await saveSnippet('b', 'y', { tags: ['t2'] });
    const list = await listSnippets();
    expect(list.length).toBe(2);
    expect(list.map((s) => s.name).sort()).toEqual(['a', 'b']);
  });

  test('most recent first', async () => {
    await saveSnippet('first', 'x', {});
    await new Promise((r) => setTimeout(r, 5));
    await saveSnippet('second', 'y', {});
    const list = await listSnippets();
    expect(list[0].name).toBe('second');
  });
});

describe('library — deleteSnippet', () => {
  test('deletes existing snippet', async () => {
    await saveSnippet('to_delete', 'x', {});
    expect(await deleteSnippet('to_delete')).toBe(true);
    expect((await listSnippets()).length).toBe(0);
  });

  test('returns false for missing snippet', async () => {
    expect(await deleteSnippet('ghost')).toBe(false);
  });
});

describe('library — sanitizeName path safety', () => {
  test('slashes replaced', async () => {
    await saveSnippet('dir/name', 'x', {});
    const list = await listSnippets();
    expect(list[0].name).toBe('dir_name');
  });

  test('dot-path traversal neutralized', async () => {
    await saveSnippet('../../etc/passwd', 'x', {});
    const files = await fs.readdir(TMP_LIBRARY);
    // No file should escape the tmp dir
    for (const f of files) {
      expect(f).not.toContain('..');
      expect(f).not.toContain('/');
    }
  });

  test('empty name throws', async () => {
    await expect(saveSnippet('', 'x', {})).rejects.toThrow(/Invalid/);
  });

  test('__proto__ rejected', async () => {
    await expect(saveSnippet('__proto__', 'x', {})).rejects.toThrow(/Invalid/);
  });
});

describe('library — saveExport', () => {
  test('writes HTML file to exports dir', async () => {
    const file = await saveExport('my_export', '<html>hi</html>');
    expect(file).toContain('my_export.html');
    const contents = await fs.readFile(file, 'utf-8');
    expect(contents).toBe('<html>hi</html>');
  });

  test('creates exports dir if missing', async () => {
    await fs.rm(TMP_EXPORTS, { recursive: true, force: true });
    const file = await saveExport('fresh', '<html/>');
    expect(file).toContain('fresh.html');
  });

  test('sanitizes dangerous names to pattern', async () => {
    const file = await saveExport('', '<html/>');
    expect(file).toContain('pattern.html');
  });

  test('slash in name replaced with underscore', async () => {
    const file = await saveExport('a/b', '<html/>');
    expect(file).toContain('a_b.html');
    expect(file).not.toContain('a/b.html');
  });
});
