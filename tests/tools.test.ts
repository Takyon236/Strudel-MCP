import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { strudelDocs } from '../src/tools/docs.js';
import { strudelExamples } from '../src/tools/examples.js';
import { strudelSounds } from '../src/tools/sounds.js';
import { strudelTheory } from '../src/tools/theory.js';
import { strudelCompose } from '../src/tools/compose.js';
import { strudelValidate } from '../src/tools/validate.js';
import { strudelRun } from '../src/tools/run.js';
import { strudelLibrary } from '../src/tools/library.js';
import { validatePattern } from '../src/lib/validate.js';
import { generatePlayerHtml } from '../src/lib/sampleServer.js';

const TMP_BASE = path.join(os.tmpdir(), `strudel-mcp-tools-tests-${process.pid}`);

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

function textOf(r: { content: Array<{ type: 'text'; text: string }> }): string {
  return r.content[0].text;
}

describe('tools — strudel_docs', () => {
  test('overview topic', () => {
    const t = textOf(strudelDocs({ topic: 'overview' }));
    expect(t).toContain('Strudel');
  });

  test('function lookup by name', () => {
    const t = textOf(strudelDocs({ topic: 'lpf' }));
    expect(t).toContain('lpf');
    expect(t).toContain('filter');
  });

  test('category lookup: effects', () => {
    const t = textOf(strudelDocs({ topic: 'effects' }));
    expect(t).toContain('lpf');
    expect(t).toContain('room');
  });

  test('mini-notation overview', () => {
    const t = textOf(strudelDocs({ topic: 'mini-notation' }));
    expect(t).toContain('Mini-notation');
    expect(t.toLowerCase()).toContain('rest');
  });

  test('unknown topic gives helpful hint', () => {
    const t = textOf(strudelDocs({ topic: 'zzznosuchtopic' }));
    expect(t.toLowerCase()).toContain('no direct match');
  });

  test('empty topic falls to overview', () => {
    const t = textOf(strudelDocs({ topic: '' }));
    expect(t).toContain('Strudel');
  });
});

describe('tools — strudel_examples', () => {
  test('returns default examples on empty query', () => {
    const t = textOf(strudelExamples({}));
    expect(t.length).toBeGreaterThan(0);
  });

  test('filters by tag query', () => {
    const t = textOf(strudelExamples({ query: 'house', limit: 3 }));
    expect(t.toLowerCase()).toContain('house');
  });

  test('respects limit', () => {
    const t = textOf(strudelExamples({ query: 'drums', limit: 1 }));
    const headingCount = (t.match(/^### /gm) ?? []).length;
    expect(headingCount).toBeLessThanOrEqual(1);
  });

  test('no-match query returns helpful message', () => {
    const t = textOf(strudelExamples({ query: 'zzznosuchstyle' }));
    expect(t.toLowerCase()).toMatch(/no example|available tags/);
  });
});

describe('tools — strudel_sounds', () => {
  test('category drums', () => {
    const t = textOf(strudelSounds({ category: 'drums' }));
    expect(t).toContain('bd');
    expect(t).toContain('sd');
  });

  test('category banks', () => {
    const t = textOf(strudelSounds({ category: 'banks' }));
    expect(t).toContain('RolandTR909');
    expect(t).toContain('AkaiLinn');
  });

  test('category all', () => {
    const t = textOf(strudelSounds({ category: 'all' }));
    expect(t).toContain('Drum voices');
    expect(t).toContain('Drum machine banks');
    expect(t).toContain('Synth oscillators');
    expect(t.toLowerCase()).toContain('gm');
  });

  test('query search', () => {
    const t = textOf(strudelSounds({ query: '909' }));
    expect(t).toContain('909');
  });
});

describe('tools — strudel_theory', () => {
  test('list-scales', () => {
    const t = textOf(strudelTheory({ action: 'list-scales' }));
    expect(t).toContain('major');
    expect(t).toContain('dorian');
  });

  test('list-progressions', () => {
    const t = textOf(strudelTheory({ action: 'list-progressions' }));
    expect(t).toContain('I-V-vi-IV');
  });

  test('scale C:major', () => {
    const t = textOf(strudelTheory({ action: 'scale', scale: 'C:major' }));
    expect(t).toMatch(/c4.*d4.*e4/);
  });

  test('chord symbol Cmaj7', () => {
    const t = textOf(strudelTheory({ action: 'chord', chord: 'Cmaj7' }));
    expect(t).toContain('Cmaj7');
  });

  test('progression I-V-vi-IV in C:major', () => {
    const t = textOf(
      strudelTheory({
        action: 'progression',
        progression: 'I V vi IV',
        scale: 'C:major',
      }),
    );
    expect(t).toContain('Strudel pattern');
  });

  test('missing args → friendly message', () => {
    const t = textOf(strudelTheory({ action: 'scale' }));
    expect(t.toLowerCase()).toContain('provide');
  });
});

describe('tools — strudel_compose', () => {
  const styles = [
    'house',
    'techno',
    'hip-hop',
    'trap',
    'dnb',
    'jazz',
    'ambient',
    'psytrance',
    'lofi',
    'rock',
  ] as const;

  for (const style of styles) {
    test(`style "${style}" produces valid Strudel code`, () => {
      const out = textOf(
        strudelCompose({
          style,
          elements: ['drums', 'bass', 'lead', 'pad'],
        }),
      );
      expect(out).toContain('setcpm');
      expect(out).toContain('stack(');
      const validation = validatePattern(out);
      const errs = validation.issues.filter((i) => i.severity === 'error');
      expect(errs).toEqual([]);
    });
  }

  test('tempo_bpm override respected', () => {
    const out = textOf(
      strudelCompose({ style: 'house', tempo_bpm: 140 }),
    );
    expect(out).toContain('setcpm(140/4)');
  });

  test('key override respected', () => {
    const out = textOf(
      strudelCompose({
        style: 'techno',
        key: 'C3:minor',
        elements: ['bass'],
      }),
    );
    expect(out).toContain('C3:minor');
  });

  test('REGRESSION: jazz default key is C3:major', () => {
    const out = textOf(strudelCompose({ style: 'jazz', elements: ['bass'] }));
    expect(out).toContain('Cmaj7');
  });

  test('REGRESSION: house bass uses key scale', () => {
    const out = textOf(
      strudelCompose({
        style: 'house',
        key: 'A2:minor',
        elements: ['bass'],
      }),
    );
    // Must scope the bass to the key (was the bug: no .scale())
    expect(out).toContain('.scale("A2:minor")');
  });

  test('empty elements array falls back to default', () => {
    const out = textOf(strudelCompose({ style: 'house', elements: [] }));
    // Should not be an empty stack
    expect(out).not.toContain('stack(\n\n)');
    expect(out).toContain('bd');
  });
});

describe('tools — compose produces deep output', () => {
  test('house template uses sidechain', () => {
    const out = textOf(strudelCompose({ style: 'house', elements: ['drums', 'bass'] }));
    expect(out).toContain('duckorbit');
    expect(out).toContain('orbit');
    expect(out).toContain('lpenv');
  });

  test('techno template uses filter envelope', () => {
    const out = textOf(strudelCompose({ style: 'techno', elements: ['bass'] }));
    expect(out).toMatch(/lpenv|perlin\.range/);
  });

  test('jazz template uses voicing and arp', () => {
    const out = textOf(strudelCompose({ style: 'jazz', elements: ['lead'] }));
    expect(out).toContain('.voicing()');
    expect(out).toContain('.arp(');
  });

  test('trap template uses pitch envelope on kick', () => {
    const out = textOf(strudelCompose({ style: 'trap', elements: ['drums'] }));
    expect(out).toContain('penv');
  });

  test('ambient template has long envelopes', () => {
    const out = textOf(strudelCompose({ style: 'ambient', elements: ['drums', 'pad'] }));
    expect(out).toMatch(/attack\(\s*[234]/);
  });

  test('dnb template uses half-time kick', () => {
    const out = textOf(strudelCompose({ style: 'dnb', elements: ['drums'] }));
    expect(out).toMatch(/c1\s+~\s+~\s+~\s+~\s+~\s+~\s+c1/);
  });

  test('REGRESSION: jazz has no bare-string .rootNotes call', () => {
    const out = textOf(strudelCompose({ style: 'jazz', elements: ['bass', 'lead', 'pad'] }));
    expect(out).not.toMatch(/"[^"]*"\s*\.rootNotes/);
    expect(out).toMatch(/chord\([^)]*\)\.rootNotes/);
  });

  test('REGRESSION: jazz has no broken .voicing().s() chain', () => {
    const out = textOf(strudelCompose({ style: 'jazz', elements: ['lead', 'pad'] }));
    expect(out).not.toMatch(/\.voicing\(\)\s*\.s\(/);
  });

  test('REGRESSION: ambient drum parts do not include silent no-op', () => {
    const out = textOf(strudelCompose({ style: 'ambient', elements: ['drums', 'bass'] }));
    expect(out).not.toContain('s("~").gain(0)');
  });
});

describe('sampleServer — generatePlayerHtml', () => {
  test('loads @strudel/repl bundle (includes prebake: soundfonts + dirt-samples + drum machines)', () => {
    const html = generatePlayerHtml('s("bd*4")');
    expect(html).toContain('unpkg.com/@strudel/repl');
  });

  test('uses strudel-editor web component for inline REPL (no iframe)', () => {
    const html = generatePlayerHtml('s("bd*4")');
    expect(html).toContain('strudel-editor');
    expect(html).not.toContain('@strudel/embed');
  });

  test('embeds code in script holder and sets it on the element', () => {
    const html = generatePlayerHtml('unique_test_marker_abc');
    expect(html).toContain('unique_test_marker_abc');
    expect(html).toContain("setAttribute('code'");
  });

  test('escapes </script> in user code', () => {
    const html = generatePlayerHtml('</script><script>alert(1)</script>');
    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(html).toContain('<\\/script');
  });
});

describe('tools — strudel_validate', () => {
  test('clean code reports OK', () => {
    const t = textOf(strudelValidate({ code: 'sound("bd*4")' }));
    expect(t).toMatch(/OK|no issues/);
  });

  test('broken code reports error', () => {
    const t = textOf(strudelValidate({ code: 'sound("bd' }));
    expect(t.toLowerCase()).toContain('error');
  });
});

describe('tools — strudel_run', () => {
  test('short code picks url strategy', async () => {
    const r = await strudelRun({ code: 'sound("bd*4")', strategy: 'auto' });
    expect(textOf(r)).toContain('Strategy:** url');
    expect(textOf(r)).toContain('strudel.cc/#');
  });

  test('long code picks embed strategy', async () => {
    const long =
      'setcpm(120/4)\n' +
      'sound("bd*4, hh*8").bank("RolandTR909").lpf(1200).room(.3).gain(.8)\n'.repeat(
        20,
      );
    const r = await strudelRun({
      code: long,
      strategy: 'auto',
      name: 'tool-test',
    });
    expect(textOf(r)).toContain('Strategy:** embed');
    expect(textOf(r)).toContain('tool-test.html');
  });

  test('explicit embed strategy even for short code', async () => {
    const r = await strudelRun({
      code: 'sound("bd*4")',
      strategy: 'embed',
      name: 'forced-embed',
    });
    expect(textOf(r)).toContain('Strategy:** embed');
    expect(textOf(r)).toContain('forced-embed.html');
  });

  test('embed writes a valid HTML file', async () => {
    const r = await strudelRun({
      code: 'sound("bd*4")',
      strategy: 'embed',
      name: 'file-check',
    });
    const text = textOf(r);
    const match = text.match(/\*\*HTML file:\*\* (\S+\.html)/);
    expect(match).not.toBe(null);
    const file = match![1];
    const html = await fs.readFile(file, 'utf-8');
    expect(html).toContain('unpkg.com/@strudel/repl');
    expect(html).toContain('strudel-editor');
  });

  test('backup URL omitted when too long', async () => {
    const huge =
      'setcpm(120/4)\n' +
      'sound("bd*4, hh*8").bank("RolandTR909").lpf(1200).room(.3).gain(.8)\n'.repeat(
        40,
      );
    const r = await strudelRun({
      code: huge,
      strategy: 'embed',
      name: 'huge',
    });
    expect(textOf(r)).toMatch(/Backup URL omitted|Backup strudel\.cc/);
  });

  test('validator errors warn but do not block', async () => {
    const r = await strudelRun({ code: 'sound("bd', strategy: 'url' });
    const t = textOf(r);
    expect(t).toContain('URL');
    expect(t.toLowerCase()).toContain('error');
  });
});

describe('tools — strudel_library', () => {
  test('save then load roundtrip', async () => {
    const saveRes = await strudelLibrary({
      action: 'save',
      name: 'tooltest',
      code: 'sound("bd*4")',
      tags: ['test'],
    });
    expect(textOf(saveRes)).toContain('Saved');
    const loadRes = await strudelLibrary({ action: 'load', name: 'tooltest' });
    expect(textOf(loadRes)).toContain('sound("bd*4")');
  });

  test('list after save', async () => {
    await strudelLibrary({
      action: 'save',
      name: 'listtest',
      code: 'sound("bd")',
    });
    const r = await strudelLibrary({ action: 'list' });
    expect(textOf(r)).toContain('listtest');
  });

  test('delete works', async () => {
    await strudelLibrary({
      action: 'save',
      name: 'deltest',
      code: 'sound("bd")',
    });
    const r = await strudelLibrary({ action: 'delete', name: 'deltest' });
    expect(textOf(r)).toContain('Deleted');
  });

  test('empty list message', async () => {
    const r = await strudelLibrary({ action: 'list' });
    expect(textOf(r)).toContain('empty');
  });

  test('save without code fails gracefully', async () => {
    const r = await strudelLibrary({ action: 'save', name: 'missing' });
    expect(textOf(r)).toContain('requires');
  });
});
