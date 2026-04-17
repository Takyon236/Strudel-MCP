const STRUDEL_BASE = 'https://strudel.cc';

export function codeToHash(code: string): string {
  return encodeURIComponent(Buffer.from(code, 'utf-8').toString('base64'));
}

export function hashToCode(hash: string): string {
  const cleaned = decodeURIComponent(hash.startsWith('#') ? hash.slice(1) : hash);
  return Buffer.from(cleaned, 'base64').toString('utf-8');
}

export function patternUrl(code: string): string {
  return `${STRUDEL_BASE}/#${codeToHash(code)}`;
}

function escapeForScriptTag(code: string): string {
  return code.replace(/<\/(script)/gi, '<\\/$1');
}

function escapeHtml(s: string): string {
  return s.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Generate a self-contained HTML page that runs Strudel via @strudel/repl (the
 * inline web component, NOT @strudel/embed which is an iframe wrapper).
 * Code is embedded in a script holder (not URL hash), so there is NO URL length limit.
 * Works from file:// or served via http://localhost:PORT (via sampleServer).
 *
 * @strudel/repl@1.2.7 is the bundled web-component (~3MB) that includes CodeMirror,
 * the transpiler, webaudio output, and prebake that auto-loads dirt-samples,
 * soundfonts, drum machines, and piano. Ctrl+Enter plays, Ctrl+. stops.
 */
export function generatePlayerHtml(code: string, title = 'Strudel Pattern'): string {
  const escapedCode = escapeForScriptTag(code);
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle}</title>
<style>
  html, body { margin: 0; padding: 0; height: 100vh; background: #0a0a0a; color: #eee; font-family: system-ui, sans-serif; overflow: hidden; }
  header { padding: 8px 16px; border-bottom: 1px solid #222; font-size: 12px; display: flex; align-items: center; gap: 10px; height: 32px; box-sizing: border-box; flex: 0 0 auto; }
  header code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; color: #ffb86c; }
  body { display: flex; flex-direction: column; }
  #repl-root { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
  #repl-root > div { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
  #repl-root .cm-editor { flex: 1 1 auto; min-height: 0; height: 100%; }
  #repl-root .cm-scroller { overflow: auto !important; }
  strudel-editor { display: none; }
</style>
</head>
<body>
<header>${safeTitle} — <code>Ctrl+Enter to play · Ctrl+. to stop</code></header>
<script type="application/strudel-pattern" id="strudel-code">${escapedCode}<\/script>
<div id="repl-root"></div>
<script src="https://unpkg.com/@strudel/repl@1.2.7"><\/script>
<script>
  (function() {
    var holder = document.getElementById('strudel-code');
    var code = holder ? holder.textContent.trim() : '';
    customElements.whenDefined('strudel-editor').then(function() {
      var el = document.createElement('strudel-editor');
      el.setAttribute('code', code);
      document.getElementById('repl-root').appendChild(el);
    });
  })();
<\/script>
</body>
</html>
`;
}

/**
 * @deprecated — kept for backwards compatibility. Now produces the same self-contained
 * ES-module player as generatePlayerHtml. The previous @strudel/embed approach was an
 * iframe to strudel.cc/#<hash> and inherited the URL-length limit, so it failed for
 * long patterns. This version embeds code directly in the HTML body.
 */
export function generateEmbedHtml(code: string, title = 'Strudel Pattern'): string {
  return generatePlayerHtml(code, title);
}
