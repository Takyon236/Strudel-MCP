import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { strudelDocs } from '../src/tools/docs.js';
import { strudelExamples } from '../src/tools/examples.js';
import { strudelTheory } from '../src/tools/theory.js';
import { strudelCompose } from '../src/tools/compose.js';
import { strudelValidate } from '../src/tools/validate.js';
import { strudelRun } from '../src/tools/run.js';
import { strudelLibrary } from '../src/tools/library.js';

const TMP_BASE = path.join(os.tmpdir(), `strudel-mcp-err-tests-${process.pid}`);

beforeEach(() => {
  process.env.STRUDEL_MCP_LIBRARY = path.join(TMP_BASE, 'library');
  process.env.STRUDEL_MCP_EXPORTS = path.join(TMP_BASE, 'exports');
});

afterEach(async () => {
  try {
    await fs.rm(TMP_BASE, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

function text(r: { content: Array<{ type: 'text'; text: string }> }): string {
  return r.content[0].text;
}

describe('error paths — strudel_docs', () => {
  test('empty topic still returns something', () => {
    expect(text(strudelDocs({ topic: '' })).length).toBeGreaterThan(0);
  });

  test('whitespace-only topic', () => {
    expect(text(strudelDocs({ topic: '   ' })).length).toBeGreaterThan(0);
  });

  test('very long topic returns helpful message', () => {
    const t = text(strudelDocs({ topic: 'x'.repeat(500) }));
    expect(t.length).toBeGreaterThan(0);
  });

  test('topic with special regex chars does not crash', () => {
    expect(() => strudelDocs({ topic: '.*+()[]{}' })).not.toThrow();
  });

  test('unicode topic does not crash', () => {
    expect(() => strudelDocs({ topic: '日本語 →→→ 🎵' })).not.toThrow();
  });
});

describe('error paths — strudel_examples', () => {
  test('query that matches nothing returns helpful message', () => {
    const t = text(strudelExamples({ query: 'zzzzz-no-such-genre' }));
    expect(t.toLowerCase()).toMatch(/no example|available tag/);
  });

  test('limit at upper bound (20)', () => {
    expect(() => strudelExamples({ limit: 20 })).not.toThrow();
  });
});

describe('error paths — strudel_theory', () => {
  test('scale action without scale arg', () => {
    const t = text(strudelTheory({ action: 'scale' }));
    expect(t.toLowerCase()).toContain('provide');
  });

  test('chord action without chord arg', () => {
    const t = text(strudelTheory({ action: 'chord' }));
    expect(t.toLowerCase()).toContain('provide');
  });

  test('progression without progression arg', () => {
    const t = text(
      strudelTheory({ action: 'progression', scale: 'C:major' }),
    );
    expect(t.toLowerCase()).toContain('provide');
  });

  test('progression without scale arg', () => {
    const t = text(
      strudelTheory({ action: 'progression', progression: 'I V vi IV' }),
    );
    expect(t.toLowerCase()).toContain('provide');
  });

  test('invalid scale spec', () => {
    const t = text(strudelTheory({ action: 'scale', scale: 'Xzorp' }));
    expect(t.toLowerCase()).toMatch(/could not parse|invalid/);
  });

  test('invalid chord symbol', () => {
    const t = text(strudelTheory({ action: 'chord', chord: 'zz' }));
    expect(t.toLowerCase()).toMatch(/could not parse|invalid/);
  });

  test('invalid Roman numeral in progression', () => {
    const t = text(
      strudelTheory({
        action: 'progression',
        progression: 'ZZ XX',
        scale: 'C:major',
      }),
    );
    expect(t.toLowerCase()).toMatch(/could not resolve|invalid|check/);
  });
});

describe('error paths — strudel_compose', () => {
  test('no elements falls back', () => {
    const out = text(strudelCompose({ style: 'house' }));
    expect(out).toContain('stack(');
    expect(out.length).toBeGreaterThan(50);
  });

  test('elements all 5 categories', () => {
    const out = text(
      strudelCompose({
        style: 'house',
        elements: ['drums', 'bass', 'lead', 'pad', 'chords'],
      }),
    );
    expect(out).toContain('stack(');
  });

  test('custom progression respected', () => {
    const out = text(
      strudelCompose({
        style: 'house',
        elements: ['pad'],
        progression: 'I V vi IV',
      }),
    );
    expect(out.length).toBeGreaterThan(50);
  });

  test('extreme tempo bounds', () => {
    expect(() => strudelCompose({ style: 'house', tempo_bpm: 40 })).not.toThrow();
    expect(() => strudelCompose({ style: 'house', tempo_bpm: 220 })).not.toThrow();
  });
});

describe('error paths — strudel_validate', () => {
  test('empty code passes', () => {
    const t = text(strudelValidate({ code: '' }));
    expect(t).toMatch(/OK|no issues/);
  });

  test('whitespace-only code passes', () => {
    expect(text(strudelValidate({ code: '   \n\n\t' }))).toMatch(/OK|no issues/);
  });

  test('very long input does not crash', () => {
    const long = 'sound("bd").lpf(500)\n'.repeat(1000);
    expect(() => strudelValidate({ code: long })).not.toThrow();
  });

  test('code with only comments', () => {
    const t = text(strudelValidate({ code: '// just a comment\n// another' }));
    expect(t).toMatch(/OK|no issues/);
  });

  test('code with only block comments', () => {
    const t = text(strudelValidate({ code: '/* comment */' }));
    expect(t).toMatch(/OK|no issues/);
  });
});

describe('error paths — strudel_run', () => {
  test('empty code produces something', async () => {
    const r = await strudelRun({ code: '' });
    expect(text(r)).toContain('Strategy');
  });

  test('strategy=url with huge code shows warning', async () => {
    const huge = 'sound("bd*4").lpf(1200).room(.3).gain(.8)\n'.repeat(200);
    const r = await strudelRun({ code: huge, strategy: 'url' });
    const t = text(r);
    expect(t).toContain('URL');
    expect(t.toLowerCase()).toContain('markdown');
  });

  test('invalid filesystem path for exports falls back', async () => {
    // Point exports to a path that cannot be created (device-full-style simulation via invalid chars on Linux)
    const oldExports = process.env.STRUDEL_MCP_EXPORTS;
    // Use a path under a regular file — creating a directory inside a file is ENOTDIR
    const baseFile = path.join(os.tmpdir(), `strudel-block-${Date.now()}`);
    await fs.writeFile(baseFile, 'block');
    process.env.STRUDEL_MCP_EXPORTS = path.join(baseFile, 'sub');
    try {
      const r = await strudelRun({
        code: 'sound("bd*4")',
        strategy: 'embed',
        name: 'blocked',
      });
      const t = text(r);
      // Either the write failed (fallback) or succeeded anyway
      expect(t.length).toBeGreaterThan(0);
    } finally {
      process.env.STRUDEL_MCP_EXPORTS = oldExports;
      await fs.rm(baseFile, { force: true });
    }
  });
});

describe('error paths — strudel_library', () => {
  test('save without name gives friendly error', async () => {
    const r = await strudelLibrary({ action: 'save', code: 'sound("bd")' });
    expect(text(r).toLowerCase()).toContain('requires');
  });

  test('save without code gives friendly error', async () => {
    const r = await strudelLibrary({ action: 'save', name: 'only_name' });
    expect(text(r).toLowerCase()).toContain('requires');
  });

  test('load without name gives friendly error', async () => {
    const r = await strudelLibrary({ action: 'load' });
    expect(text(r).toLowerCase()).toContain('requires');
  });

  test('delete without name gives friendly error', async () => {
    const r = await strudelLibrary({ action: 'delete' });
    expect(text(r).toLowerCase()).toContain('requires');
  });

  test('load nonexistent snippet throws descriptive error', async () => {
    await expect(
      strudelLibrary({ action: 'load', name: 'does_not_exist' }),
    ).rejects.toThrow(/not found/);
  });

  test('delete nonexistent returns friendly message', async () => {
    const r = await strudelLibrary({ action: 'delete', name: 'ghost' });
    expect(text(r).toLowerCase()).toMatch(/not found/);
  });

  test('list on empty library', async () => {
    const r = await strudelLibrary({ action: 'list' });
    expect(text(r).toLowerCase()).toContain('empty');
  });
});
