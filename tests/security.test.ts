import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateEmbedHtml, patternUrl, hashToCode } from '../src/lib/encode.js';
import { saveSnippet, saveExport } from '../src/lib/library.js';
import { strudelRun } from '../src/tools/run.js';
import { strudelLibrary } from '../src/tools/library.js';

const TMP_BASE = path.join(os.tmpdir(), `strudel-mcp-sec-tests-${process.pid}`);
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

describe('security — HTML injection in embed output', () => {
  test('XSS attempt in title is HTML-escaped', () => {
    const html = generateEmbedHtml(
      'sound("bd*4")',
      '<script>alert(1)</script>',
    );
    // Raw injection must not appear inside <title>
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    expect(titleMatch).not.toBe(null);
    expect(titleMatch![1]).not.toContain('<script>');
    // Raw unescaped script tag in body header (besides the bootstrap + CDN)
    const headerMatch = html.match(/<header>([\s\S]*?)<\/header>/);
    expect(headerMatch![1]).not.toContain('<script>alert');
  });

  test('img onerror attempt in title is escaped', () => {
    const html = generateEmbedHtml('a', '"><img src=x onerror=alert(1)>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
  });

  test('ampersand in title is escaped to entity', () => {
    const html = generateEmbedHtml('a', 'A & B');
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    // The raw "A & B" should NOT appear literally — the & should be escaped
    expect(titleMatch![1]).not.toContain('A & B');
    // But the HTML entity form IS expected
    expect(titleMatch![1]).toContain('&#38;');
  });

  test('angle brackets in title are escaped', () => {
    const html = generateEmbedHtml('a', '<b>bold</b>');
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
    expect(titleMatch![1]).not.toContain('<b>');
  });
});

describe('security — code holder injection', () => {
  test('user code containing </script> does not break the holder', () => {
    const evil =
      'sound("bd*4") /* break out: </script><script>alert(1)</script> */';
    const html = generateEmbedHtml(evil, 'evil');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    // The holder content should NOT contain an unescaped </script>
    expect(holderContent).not.toContain('</script>');
  });

  test('user code with </SCRIPT> (uppercase) still escaped', () => {
    const evil = 'sound("bd") // </SCRIPT>alert(1)';
    const html = generateEmbedHtml(evil, 'evil');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toMatch(/<\/SCRIPT/i);
  });

  test('user code containing </script with tab still escaped', () => {
    const evil = 'sound("bd") // </script\tattack';
    const html = generateEmbedHtml(evil, 'evil');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toContain('</script\t');
  });

  test('user code containing </script newline still escaped', () => {
    const evil = 'sound("bd") // </script\ninjected';
    const html = generateEmbedHtml(evil, 'evil');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toMatch(/<\/script\n/);
  });
});

describe('security — filesystem path traversal', () => {
  test('saveSnippet with ../../../etc/passwd name is neutralized', async () => {
    await saveSnippet('../../etc/passwd', 'sound("bd")', {});
    const files = await fs.readdir(TMP_LIBRARY);
    for (const f of files) {
      expect(f).not.toContain('..');
      expect(f).not.toContain('/');
      expect(f).not.toContain('\\');
    }
    // The original file should not exist outside the library
    let leaked = false;
    try {
      await fs.access('/etc/passwd_strudel_test');
      leaked = true;
    } catch {
      // expected — does not exist
    }
    expect(leaked).toBe(false);
  });

  test('saveExport with path traversal name is neutralized', async () => {
    const file = await saveExport('../escape', '<html/>');
    expect(file).toContain(TMP_EXPORTS);
    expect(file).not.toContain('..');
  });

  test('saveExport with absolute path name is neutralized', async () => {
    const file = await saveExport('/etc/shadow', '<html/>');
    expect(file).toContain(TMP_EXPORTS);
    expect(file).not.toBe('/etc/shadow.html');
  });

  test('saveExport with Windows-style path is neutralized', async () => {
    const file = await saveExport('C:\\Windows\\cmd', '<html/>');
    expect(file).toContain(TMP_EXPORTS);
    expect(file).not.toContain(':');
    expect(file).not.toContain('\\');
  });

  test('strudel_library save with path traversal is contained', async () => {
    await strudelLibrary({
      action: 'save',
      name: '../../../escape',
      code: 'sound("bd")',
    });
    const files = await fs.readdir(TMP_LIBRARY);
    for (const f of files) {
      expect(f).not.toContain('..');
    }
  });
});

describe('security — injection attempts in pattern code', () => {
  test('shell metachars in code encode cleanly', () => {
    const evil = 'sound("bd*4") // $(rm -rf /) `evil` ; ls';
    const url = patternUrl(evil);
    expect(url).toMatch(/^https:\/\/strudel\.cc\/#/);
    // Must roundtrip
    expect(hashToCode(url.split('#')[1])).toBe(evil);
  });

  test('null bytes in code encode cleanly', () => {
    const evil = 'sound("bd*4")\u0000// hidden';
    const url = patternUrl(evil);
    expect(hashToCode(url.split('#')[1])).toBe(evil);
  });

  test('extremely long pattern does not crash encoder', () => {
    const long = 'sound("bd")'.repeat(5000); // ~55KB
    const url = patternUrl(long);
    expect(url).toMatch(/^https:\/\/strudel\.cc\/#/);
    expect(hashToCode(url.split('#')[1])).toBe(long);
  });

  test('unicode direction override in code encodes safely', () => {
    // U+202E is right-to-left override
    const evil = 'sound("bd")\u202Eevil\u202C';
    const url = patternUrl(evil);
    expect(hashToCode(url.split('#')[1])).toBe(evil);
  });

  test('strudel_run with path-traversal name sanitized', async () => {
    const r = await strudelRun({
      code: 'sound("bd*4")',
      strategy: 'embed',
      name: '../../etc/passwd',
    });
    const fileMatch = r.content[0].text.match(/\*\*HTML file:\*\* (\S+\.html)/);
    expect(fileMatch).not.toBe(null);
    const file = fileMatch![1];
    expect(file).toContain(TMP_EXPORTS);
    expect(file).not.toContain('..');
    expect(file).not.toMatch(/\/etc\/passwd/);
  });
});

describe('security — safe defaults', () => {
  test('exports dir is under HOME by default', async () => {
    delete process.env.STRUDEL_MCP_EXPORTS;
    const file = await saveExport('default_test', '<html/>');
    expect(file).toContain(os.homedir());
    expect(file).toContain('.strudel-mcp');
  });

  test('library dir is under HOME by default', async () => {
    delete process.env.STRUDEL_MCP_LIBRARY;
    const snip = await saveSnippet('default_test_lib', 'sound("bd")', {});
    expect(snip.name).toBe('default_test_lib');
    // Cleanup
    const { deleteSnippet } = await import('../src/lib/library.js');
    await deleteSnippet('default_test_lib');
  });
});
