import { describe, test, expect } from 'bun:test';
import {
  codeToHash,
  hashToCode,
  patternUrl,
  generateEmbedHtml,
} from '../src/lib/encode.js';

describe('encode — codeToHash / hashToCode', () => {
  test('ASCII roundtrip', () => {
    const code = 'sound("bd*4").bank("RolandTR909")';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('unicode roundtrip (arrows, box drawing, accents)', () => {
    const code = '// Thriller — C# minor · 118 BPM · ═══ →→→\nnote("c#4")';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('empty string roundtrip', () => {
    expect(hashToCode(codeToHash(''))).toBe('');
  });

  test('multiline roundtrip preserves newlines', () => {
    const code = 'line1\nline2\n\nline4';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('Windows CRLF line endings preserved', () => {
    const code = 'line1\r\nline2\r\nline3';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('emoji roundtrip', () => {
    const code = '// 🎵 beat 🥁\nsound("bd*4")';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('high-plane unicode (musical symbols U+1D15F)', () => {
    const code = '// 𝅘𝅥𝅯 quarter note\nsound("bd")';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('null byte roundtrip', () => {
    const code = 'sound("bd")\u0000sound("sd")';
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('10KB of ASCII roundtrip', () => {
    const code = 'sound("bd*4").lpf(1200).room(.3)\n'.repeat(350);
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('100KB of ASCII roundtrip', () => {
    const code = 'x'.repeat(100_000);
    expect(hashToCode(codeToHash(code))).toBe(code);
  });

  test('codeToHash URL-encodes base64 specials', () => {
    const hash = codeToHash('a'.repeat(50));
    expect(hash).not.toMatch(/\+/);
    expect(hash).not.toMatch(/=/);
  });

  test('hashToCode accepts leading # sign', () => {
    const hash = '#' + codeToHash('foo');
    expect(hashToCode(hash)).toBe('foo');
  });
});

describe('encode — patternUrl', () => {
  test('produces strudel.cc URL', () => {
    expect(patternUrl('sound("bd*4")')).toMatch(/^https:\/\/strudel\.cc\/#/);
  });

  test('URL is roundtrippable', () => {
    const code = 'setcpm(120/4)\nsound("bd*4").bank("RolandTR909")';
    const url = patternUrl(code);
    const hash = url.split('#')[1];
    expect(hashToCode(hash)).toBe(code);
  });

  test('URL length grows with code length', () => {
    const short = patternUrl('a');
    const long = patternUrl('a'.repeat(1000));
    expect(long.length).toBeGreaterThan(short.length);
  });
});

describe('encode — generateEmbedHtml', () => {
  test('produces valid HTML5 document', () => {
    const html = generateEmbedHtml('sound("bd*4")', 'test');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('<body>');
  });

  test('loads @strudel/repl inline web component (not @strudel/embed iframe)', () => {
    const html = generateEmbedHtml('a', 't');
    // @strudel/repl is the inline web component (bundled, includes CodeMirror + REPL)
    expect(html).toContain('unpkg.com/@strudel/repl');
    expect(html).toContain('strudel-editor');
    // @strudel/embed was the iframe wrapper that inherited the URL-length limit
    expect(html).not.toContain('@strudel/embed');
  });

  test('creates strudel-editor element and sets code attribute', () => {
    const html = generateEmbedHtml('a', 't');
    expect(html).toContain("createElement('strudel-editor')");
    expect(html).toContain("setAttribute('code'");
    expect(html).toContain('whenDefined');
  });

  test('embeds the code into the script holder', () => {
    const html = generateEmbedHtml('unique_marker_xyz123', 'test');
    expect(html).toContain('unique_marker_xyz123');
  });

  test('escapes </script> in user code (literal form)', () => {
    const evil = 'sound("bd") // </script>injected<script>alert(1)</script>';
    const html = generateEmbedHtml(evil, 'evil');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    expect(end).toBeGreaterThan(start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toContain('</script>');
    expect(holderContent).toContain('<\\/script>');
  });

  test('escapes </script followed by whitespace', () => {
    const evil = 'sound("bd") // </script foo bar';
    const html = generateEmbedHtml(evil, 'evil2');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toContain('</script ');
    expect(holderContent).toContain('<\\/script ');
  });

  test('escapes </script/ (self-closing style)', () => {
    const evil = 'sound("bd") // </script/attack';
    const html = generateEmbedHtml(evil, 'evil3');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toContain('</script/');
  });

  test('escapes uppercase </SCRIPT>', () => {
    const evil = 'sound("bd") // </SCRIPT>injected';
    const html = generateEmbedHtml(evil, 'evil4');
    const holderMarker = 'application/strudel-pattern" id="strudel-code">';
    const start = html.indexOf(holderMarker) + holderMarker.length;
    const end = html.indexOf('</script>', start);
    const holderContent = html.slice(start, end);
    expect(holderContent).not.toMatch(/<\/SCRIPT>/i);
  });

  test('escapes HTML special chars in the title', () => {
    const html = generateEmbedHtml('a', '<script>alert(1)</script>');
    expect(html).not.toContain('<title><script>alert(1)</script></title>');
  });

  test('has exactly 3 real </script> tags (pattern holder + unpkg loader + bootstrap)', () => {
    const html = generateEmbedHtml('sound("bd*4")', 'test');
    const matches = html.match(/<\/script>/g) ?? [];
    expect(matches.length).toBe(3);
  });

  test('embedded code survives HTML size growth without URL-length concerns', () => {
    // The whole point of the embed strategy: arbitrarily long patterns should work.
    // Previous @strudel/embed approach failed silently for long patterns because
    // the iframe URL was still strudel.cc/#<hash>.
    const longPattern = 'stack(' + Array.from({ length: 500 }, (_, i) => `s("bd")`).join(', ') + ')';
    const html = generateEmbedHtml(longPattern, 'long');
    expect(html).toContain(longPattern);
    // No reliance on URL fragment:
    expect(html).not.toContain('strudel.cc/#');
  });
});
