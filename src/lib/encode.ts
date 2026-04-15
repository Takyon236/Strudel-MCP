const STRUDEL_BASE = 'https://strudel.cc';
const STRUDEL_EMBED_CDN = 'https://unpkg.com/@strudel/embed@latest';

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

export function generateEmbedHtml(code: string, title = 'Strudel Pattern'): string {
  const safe = escapeForScriptTag(code);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`)}</title>
<style>
  html, body { margin: 0; padding: 0; height: 100%; font-family: system-ui, sans-serif; background: #0a0a0a; color: #eee; }
  header { padding: 12px 20px; border-bottom: 1px solid #222; font-size: 13px; }
  header code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; color: #ffb86c; }
  strudel-repl { display: block; height: calc(100vh - 48px); width: 100%; }
</style>
</head>
<body>
<header>
  ${title.replace(/[<>&]/g, (c) => `&#${c.charCodeAt(0)};`)} — loaded via <code>@strudel/embed</code>. Click play to hear it.
</header>
<script type="application/strudel-pattern" id="strudel-code">${safe}</script>
<script src="${STRUDEL_EMBED_CDN}"></script>
<script>
  const raw = document.getElementById('strudel-code').textContent;
  const repl = document.createElement('strudel-repl');
  repl.setAttribute('code', raw.trim());
  document.body.appendChild(repl);
</script>
</body>
</html>
`;
}
