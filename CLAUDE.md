# Project Context for Claude Code

## Overview
**strudel-mcp** — A Model Context Protocol server that lets an LLM drive Strudel
(https://strudel.cc), the JavaScript port of TidalCycles for live-coded music.

The MCP does NOT run a Strudel audio engine in Node. Strudel is a browser-side
runtime. This server's job is to give the LLM (1) deep Strudel knowledge, (2)
helpers for writing correct patterns, and (3) handoff to the real REPL — via
short base64 share URLs for small patterns, or via a self-contained local HTML
file using `@strudel/repl` (the inline web-component bundle from unpkg) for
anything over ~1200 chars of code — no URL length limit.

**Stack:** TypeScript + `@modelcontextprotocol/sdk` + `zod`, stdio transport,
`tsx` for dev, `tsc` for build. Node ≥20. No external runtime dependencies
beyond the MCP SDK and zod. `strudel_run`'s `open: true` uses platform
`spawn('xdg-open'|'open'|'cmd /c start')` — no Playwright required.

## Architecture

### Tool surface (10 tools)
```
strudel_docs       → unified reference lookup (functions, effects, categories, concepts)
strudel_examples   → curated runnable patterns by tag/style
strudel_sounds     → sound/bank/synth/GM catalog with search
strudel_theory     → scales, chords, Roman-numeral progressions → Strudel syntax
strudel_compose    → template-based pattern generator (house/techno/hip-hop/…)
strudel_validate   → static parse/lint of a pattern (brackets, unknown idents, mini-notation)
strudel_run        → URL (short patterns) or local HTML embed file (long patterns) + optional system-opener launch
strudel_library    → persistent local snippet store (save/load/list/delete)
strudel_sample     → download audio (YouTube/SoundCloud/URL via yt-dlp), serve locally with CORS
strudel_analyze    → extract BPM, key, chords, beat grid from audio + generate spectrogram PNG
```

### Design principles
1. **Few tools, rich knowledge.** The LLM writes Strudel code — the MCP's job is to
   inform that code, not replace the writer. One fat `strudel_docs` beats a dozen
   thin per-category tools.
2. **Pre-compiled knowledge.** Function/effect/sound/scale data lives in
   `src/knowledge/*.ts` as typed constants. No runtime fetches, no network
   dependency, no cache staleness.
3. **Strudel does the audio.** The `strudel_run` tool picks a handoff strategy:
   short patterns (<1200 chars) get the `strudel.cc/#<hash>` URL (matching
   upstream `code2hash`), longer patterns get a self-contained local HTML
   file using `@strudel/repl` from unpkg — the official inline web-component
   bundle that includes CodeMirror, the transpiler, webaudio output, and a
   prebake that auto-loads dirt-samples, soundfonts, and drum machines. No
   URL hop, no length limit. `open: true` spawns the system default browser
   via `xdg-open`/`open`/`cmd /c start` with no additional deps.
4. **Templates for composition.** `strudel_compose` uses hand-tuned genre templates
   with professional depth: discrete drum parts (each with its own effect chain),
   sidechain ducking via `duckorbit`/`orbit`, filter envelopes (`lpenv`/`lpa`/`lpd`),
   swing via `.late()`, variation via `every`/`sometimesBy`/`degradeBy`, and
   genre-authentic patterns (jazz swing ride, ambient beatless, trap pitch envelope,
   DnB half-time reese bass). Predictable output, LLM can modify afterwards.
5. **Local library persistence.** Snippets live under
   `~/.strudel-mcp/library/<name>.json`. Override with `STRUDEL_MCP_LIBRARY` env
   var. No database, no service — just flat JSON files.

### Key files
```
src/
  index.ts              # McpServer + registerTool() for all 10 tools
  tools/                # One file per tool, thin dispatcher
    docs.ts examples.ts sounds.ts theory.ts compose.ts validate.ts run.ts library.ts
    sample.ts           # Sample download + local HTTP server for Strudel
    analyze.ts          # Audio analysis wrapper (spawns Python librosa)
  knowledge/            # Pre-compiled Strudel reference data
    functions.ts        # FunctionDoc[] — 84 functions (arrange, pick, signals, voicing, arp, etc.)
    effects.ts          # EffectDoc[] — 80 effects + aliases (att/dec/sus/rel/vel/dist)
    sounds.ts           # 209 entries: 71 drum banks, 16 synths, 48 GM, 20 VCSL, 27 dirt, etc.
    scales.ts           # 24 scales (incl. phrygian dominant, hirajoshi, insen), 9 common progressions
    minispec.ts         # 18 mini-notation rules (incl. euclidean, $: labeled patterns)
    examples.ts         # 30 curated patterns (incl. arrange(), mask(), per-voice processing)
  lib/
    encode.ts           # code2hash / hash2code + generatePlayerHtml (self-contained HTML, Strudel via esm.sh ES modules)
    validate.ts         # Static linter (brackets, ident check, mini-notation check)
    theory.ts           # Chord symbol parser, Roman-numeral → note resolver
    library.ts          # Snippet persistence + saveExport for embed HTML files
    sampleServer.ts     # HTTP file server (CORS), yt-dlp integration, /play REPL endpoint
    analyzer.ts         # Python/librosa spawner for audio analysis
scripts/
  analyze.py            # librosa-based audio analysis (BPM, key, chords, spectrogram)
```

### strudel_run handoff strategies

`strudel_run` is the only tool that hands patterns back to Strudel. It picks
a strategy based on code size:

| Strategy | When | Output |
|---|---|---|
| `url` | code ≤1200 chars (auto) or explicit `strategy: "url"` | `strudel.cc/#<base64>` share URL |
| `embed` | code >1200 chars (auto) or explicit `strategy: "embed"` | Self-contained HTML file at `~/.strudel-mcp/exports/<name>.html` with the pattern embedded in the body and Strudel loaded via esm.sh ES modules (no URL length limit — works for arbitrarily long patterns) |
| `auto` (default) | picks the right one | — |

**1200-char threshold rationale**: base64 expands 4/3, plus `encodeURIComponent`
for `+/=` adds ~15%, plus the `https://strudel.cc/#` prefix. 1200 chars of code
becomes ~2000 chars of URL — the empirical ceiling above which markdown link
rendering breaks (renderers choke on the terminating `)` inside a massive URL).

**Embed HTML format** (generated by `generatePlayerHtml(code, title)` in
`src/lib/encode.ts`; `generateEmbedHtml` is kept as a deprecated alias): the
pattern code is written inside a `<script type="application/strudel-pattern">`
block (unknown MIME type, browser ignores it, but `.textContent` is readable).
The page then loads `@strudel/repl@1.2.7` from unpkg — a prebuilt bundle that
defines the `<strudel-editor>` custom element. A small bootstrap script waits
for `customElements.whenDefined('strudel-editor')`, creates the element, sets
the `code` attribute directly (more reliable than the HTML-comment extraction
path), and appends it to a `#repl-root` container sized to fill the viewport.
Ctrl+Enter plays, Ctrl+. stops — the standard Strudel shortcuts.

**Why not `@strudel/embed`?** That package is a trivial iframe wrapper around
`strudel.cc/#<hash>` — it inherited the URL-length limit, so for long patterns
it silently rendered an empty REPL. `@strudel/repl` (different package, same
author) is the **inline** REPL — no iframe, no URL hop, no length limit.
Bundled with CodeMirror + transpiler + webaudio + prebake, ~3MB gzipped,
loaded once from unpkg CDN.

**Why not esm.sh ES modules?** An earlier attempt imported
`@strudel/core`/`@strudel/webaudio`/`@strudel/transpiler` from esm.sh and
rolled a custom editor + play/stop buttons. That ran into scope problems
(user code references `setcpm`, `samples`, `sound`, etc. which need to be
in the REPL's `evalScope`, not directly imported) and missed the prebake
pipeline (soundfonts, dirt-samples, drum machines). `@strudel/repl` already
does all of that correctly — reinventing it was wrong.

The `</script` sequence in user code is escaped as `<\/script` via
`code.replace(/<\/(script)/gi, '<\\/$1')` — this covers ALL HTML5 end-tag
forms (`</script>`, `</script `, `</script/`, `</script\n`, etc.) per spec
13.2.5.17. An earlier version only escaped `</script>` which was insufficient.

**`open: true`** spawns the platform-native opener:
- Linux: `spawn('xdg-open', [target], {detached:true, stdio:'ignore'})`
- macOS: `spawn('open', [target], ...)`
- Windows: `spawn('cmd', ['/c', 'start', '""', target], ...)` — the empty `""`
  is a CMD window-title placeholder; `start` treats the first quoted arg as
  a title, so without it a quoted path would be misinterpreted.

The child process is detached and `.unref()`'d so it outlives the MCP server.

**Error handling**: if `saveExport` fails (permission, disk, etc.), the tool
catches and returns a text payload with the URL as fallback. For patterns over
2000 chars of URL output, the backup URL is omitted from the response (noted
as "would be N chars — above the 2000-char safe threshold") — returning a
broken URL would defeat the purpose.

**Exports directory**: defaults to `~/.strudel-mcp/exports/`. Override with
`STRUDEL_MCP_EXPORTS` env var. Filenames sanitized to `[a-zA-Z0-9_-]`; invalid
input falls back to `pattern`.

### strudel_sample — audio download + local server

Downloads audio from YouTube, SoundCloud (via `yt-dlp`), or any direct URL.
Saves to `~/.strudel-mcp/samples/` (override with `STRUDEL_MCP_SAMPLES`).

Starts a localhost-only HTTP server (port 0, OS-assigned) with CORS headers
so the browser-side Strudel runtime can fetch samples. The server starts on
first call and lives for the MCP process lifetime. It also serves HTML files
and has a `/play` endpoint for an embedded Strudel REPL.

**Dependencies**: `yt-dlp` (optional, for YouTube/SoundCloud). Falls back to
direct HTTP download for regular URLs. Zero npm dependencies — uses Node
builtins (`http`, `https`, `fs`, `child_process`).

**Local sample playback**: When `strudel_run` detects local sample-server
URLs (`http://127.0.0.1:PORT/...`) in pattern code, it routes through the
sample server's `/play` endpoint instead of the normal embed HTML (which
points at `file://`). The `/play` page is served from the same
`127.0.0.1:PORT` origin as the samples themselves, so `samples()` fetches
to localhost work without mixed content or CORS issues. Both the `/play`
endpoint and the embed HTML share the same `generatePlayerHtml` under the
hood — the `@strudel/repl` web-component, code embedded in the body.

The sample server also provides:
- `GET /strudel.json` — dynamic manifest for native Strudel sample discovery
- `Accept-Ranges: bytes` + Range request support for large audio files
- `STRUDEL_MCP_SAMPLE_PORT` env var for a fixed port (default: OS-assigned)

### strudel_analyze — audio analysis

Analyzes audio files using Python + librosa to extract:
- BPM (beat tracking)
- Key + mode (Krumhansl-Schmuckler algorithm on chroma features)
- Chord progression (chroma → template matching, time-stamped)
- Beat grid + onset density
- 3-panel spectrogram PNG (mel spectrogram, chromagram, onset+beat grid)

**Architecture**: `scripts/analyze.py` (Python 3) does the actual librosa
analysis. `src/lib/analyzer.ts` spawns it from Node, parses JSON output.
`src/tools/analyze.ts` is the MCP tool handler that resolves file paths
and formats the response with Strudel-ready patterns.

**Dependencies**: Python 3 with `librosa`, `matplotlib`, `numpy`.
Install: `pip install librosa matplotlib numpy`.

**Spectrogram output**: saved to `~/.strudel-mcp/analysis/`. The LLM can
read the PNG to visually understand the song structure, frequency content,
and beat density — this is how it "listens" to music.

## Strudel Reference (for writing correct patterns)

### Mini-notation
Strings passed to `sound()`, `note()`, `n()` are mini-notation. Everything inside
a string fills one cycle unless modified.

| Syntax | Meaning |
|---|---|
| `space` | next event in sequence |
| `~` or `-` | rest |
| `[ ]` | group/subdivision |
| `< >` | alternation, one per cycle |
| `,` | polyphony (stack) |
| `*n` | repeat/speed up |
| `/n` | slow/stretch |
| `!n` | replicate event n times |
| `@n` | weighted duration |
| `:n` | sample index |
| `?` | 50% drop |
| `?0.2` | explicit probability drop (20%) |
| `\|` | random choice |
| `..` | numeric range |
| `(n,k)` | euclidean rhythm (n hits over k steps) |
| `_` | elongate previous event by one step |
| `:n:g` | sample index + per-voice gain |

### Core API
```js
sound("bd sd hh oh")                  // play named sounds
s("jazz*2")                           // shorthand for sound
note("c e g b")                       // letter names + octaves
n("0 2 4 6").scale("C:minor")         // scale degree + scale
chord("<Cmaj7 Am7>").voicing()        // chord symbols with auto voice-leading
.voicing().arp("0 2 1 3").note()     // arpeggiate voiced chords
chord("<C Am>").rootNotes(2).note()  // extract bass from chord progression

.bank("RolandTR909")                  // drum bank
.lpf(1200).lpq(6)                     // low-pass filter + Q
.lpenv(4).lpa(.01).lpd(.2)           // filter envelope (the "squelch")
.penv(-12).pdecay(.15)               // pitch envelope (808 kick drop)
.room(.5).delay(".8:.125:.6")         // reverb + delay
.orbit(0).duckorbit(1)               // sidechain bus routing
.duckdepth(.8).duckattack(.15)       // sidechain pump depth + recovery
.gain(.8).pan(sine.range(0,1))        // level + pan
.vib(4).vibmod(.5)                   // vibrato rate + depth
.adsr(".02:.1:.5:.3")                 // envelope shorthand
.fast(2).slow(2).rev()                // time transforms
.jux(rev)                             // stereo split transform
.off(1/8, x => x.add(7))              // layered copy with offset
.layer(x=>x.s("saw"), x=>x.s("sq")) // multi-voice parallel layers
.superimpose(x => x.add(12))        // layer original + transformed copy
.echo(4, 1/8, .6)                    // musical echo (superimposed delays)
.every(4, rev)                        // conditional every N cycles
.sometimes(x => x.fast(2))            // probabilistic (50%)
.sometimesBy(.3, x => x.ply(2))     // probabilistic with explicit probability
.degrade()                            // drop 50% of events randomly
.degradeBy(.25)                       // drop 25% of events
.struct("x ~ x ~ ~ x ~ x")          // rhythmic structure gate
perlin.range(200, 2000).slow(8)      // smooth noise signal for warm modulation
irand(8)                              // random integer signal 0..7

stack(a, b, c)                        // parallel layers
cat(a, b, c)                          // sequential per cycle
setcpm(124/4)                         // tempo (cycles per minute / 4 for 4/4)
```

### Tempo conversion
- `setcpm(bpm/4)` for typical 4/4 grooves
- `setcps(bpm/60/4)` if using cycles-per-second
- Strudel default: 30 cpm = 0.5 cps

### Sample loading
```js
samples('github:tidalcycles/dirt-samples')        // the classic Dirt samples
samples({ kick: 'bd/kick.wav' }, 'https://...')   // custom object + base URL
samples('shabda:bass:4,hihat:4')                  // Freesound via Shabda
```

## Development Workflow

### Commands
```bash
bun install           # install deps (or npm install)
bun run dev           # run the server under tsx for local testing
bun run typecheck     # tsc --noEmit — zero errors required
bun run build         # tsc → dist/
bun run start         # run the built server
```

### Adding a new tool
1. Create `src/tools/<name>.ts` exporting `<name>InputSchema` (zod raw shape) and
   the handler function.
2. Register in `src/index.ts` with `server.registerTool(...)`.
3. Add/update knowledge files under `src/knowledge/` if the tool consumes new data.
4. Run `bun run typecheck` and manually test via the stdio smoke-test pattern:
   ```bash
   printf '%s\n' \
     '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' \
     '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
     '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"strudel_docs","arguments":{"topic":"lpf"}}}' \
     | bunx tsx src/index.ts
   ```

### Input schema conventions
- Always pass a **raw shape object** (not `z.object({...})`) to `registerTool`'s
  `inputSchema`. The SDK wraps it. Passing a full object schema breaks validation.
- Use `z.enum([...])` for discriminators rather than free strings.
- Every field has a `.describe(...)` — the LLM reads these to pick args.

### Adding to the knowledge base
- `functions.ts` and `effects.ts`: add a new entry to the `FUNCTIONS` or `EFFECTS`
  array. `findFunction()` / `findEffect()` are case-insensitive and strip leading `.`.
  New names auto-flow into `FUNCTION_NAMES` / `EFFECT_NAMES` → validator's
  `KNOWN_IDENTIFIERS`. Aliases resolve via `findEffect('cutoff')?.name === 'lpf'`.
- `sounds.ts`: add to the right category array; `searchSounds()` covers it automatically.
  New entries auto-flow into `ALL_SOUNDS` → `SOUND_NAMES`.
- `examples.ts`: add to `EXAMPLES`. The `searchExamples()` scorer uses tags (weight 5)
  > description (weight 2) > title (weight 3). Keep tags lowercase. Every example's
  `code` field is validated by `tests/cross-validation.test.ts` — all referenced
  functions/effects must exist in the knowledge base.
- `scales.ts`: add to `SCALES` with intervals as semitone offsets from root.
- `compose.ts`: templates use `StyleTemplate` interface with `drumParts` (array of
  discrete drum chains), `bassPart`, `leadPart`, `padPart` (functions taking key or
  chords). Use `maj7` not `^7` in chord symbols (validator regex limitation).

### Validate-linter rules
`src/lib/validate.ts` walks the source once:
1. Bracket balance (`()`, `[]`, `{}`) with line:col reporting on mismatch.
2. String literal tracking (`"` and backticks become mini-notation spans).
3. Block / line comment handling.
4. Function-call identifier extraction: `ident(`, `.ident(`. Unknown idents that
   look like lowercase method calls become warnings — JS builtins and PascalCase
   constructors are allowed through.
5. Mini-notation bracket balance inside each captured string.
6. Mini-notation token check: unknown lowercase tokens get an **info** note saying
   they may be custom samples (not an error — users load external samples often).

Do NOT promote "unknown sample" to warning — external sample libraries are the
normal path and false positives are worse than false negatives here.

## Conventions

- **Functions under 30 lines where possible.** Split helpers into `lib/`.
- **`const` default, never `var`.** camelCase variables, lowercase file names.
- **Zero TypeScript errors.** `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- **Tool responses use `{ content: [{ type: 'text', text: ... }] }`.** Use the local
  `text()` helper in each tool file.
- **Errors inside tool handlers return a text payload** — throwing propagates to
  the MCP layer and surfaces as an error to the client. Prefer graceful text
  responses unless the input is definitively malformed (caught by zod first).
- **No runtime network calls from tools.** All knowledge is static. `strudel_run`
  is the only tool that touches anything outside the process — it writes an HTML
  file for embed mode, spawns the system browser for `open: true`, and the
  generated HTML loads `@strudel/repl` from unpkg (fetched by the user's
  browser at view time, never by the MCP server itself).
- **No telemetry, no logging to stdout.** stdout is the MCP transport. If you
  need to log, use `console.error`.

## Integration with Claude Code / Desktop

Add to `~/.config/claude-code/mcp.json` (or Claude Desktop's config):
```json
{
  "mcpServers": {
    "strudel": {
      "command": "node",
      "args": ["/absolute/path/to/strudel-MCP/dist/index.js"]
    }
  }
}
```
Or during development:
```json
{
  "mcpServers": {
    "strudel": {
      "command": "bunx",
      "args": ["tsx", "/absolute/path/to/strudel-MCP/src/index.ts"]
    }
  }
}
```

## Strudel encoding algorithm (verified)

The share URL format is `https://strudel.cc/#<hash>` where:
```
hash = encodeURIComponent(base64(utf8(code)))
```
This matches `code2hash` in `@strudel/core`. Implemented in `src/lib/encode.ts`
using Node's `Buffer`. Roundtrip (`hashToCode`) is verified in smoke tests.

## Non-goals

- **Running Strudel audio in Node.** Browser-only. The MCP hands off URLs or
  local HTML files that load strudel.cc in an iframe.
- **Fetching live documentation.** All knowledge is pre-compiled and versioned
  with the repo — static data avoids rate limits, outages, and drift.
- **Auto-generating patterns via LLM calls inside the MCP.** The LLM calling
  this MCP already is the generator; the tools give it better building blocks.
- **MIDI/OSC output.** Strudel itself handles MIDI from the browser. If a user
  wants hardware output, they configure it in the REPL directly.
- **Short-URL service.** strudel.cc used to have a Supabase-backed share button
  that generated 12-char hashes, but the maintainers removed it. We do NOT
  programmatically POST to their database — the embed HTML file is the
  correct handoff for long patterns.
