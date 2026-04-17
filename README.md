# Strudel-MCP

> **Community project — not affiliated with or endorsed by the Strudel or TidalCycles teams.**
> This is an independent **Model Context Protocol** server *for* Strudel. "Strudel" refers to the upstream project at <https://strudel.cc>; used descriptively under nominative fair use. All Strudel code fetched at runtime is distributed by the upstream project under AGPL-3.0-or-later and is not redistributed here.

A Model Context Protocol server that gives LLMs deep knowledge of [Strudel](https://strudel.cc) — the JavaScript port of [TidalCycles](https://tidalcycles.org) for live-coded music. Lets Claude (or any MCP-aware model) compose, validate, and run runnable Strudel patterns without needing to know the whole API by heart.

The MCP is **knowledge-first**: the LLM writes the Strudel code, and the 10 tools give it reference data, composition templates, music-theory helpers, a static linter, a playback handoff that works for patterns of any length, audio sample downloading, and audio analysis.

---

## Features

- **10 focused tools** covering documentation, examples, sounds, music theory, composition, validation, playback, a persistent snippet library, audio sample downloading, and audio analysis
- **Pre-compiled knowledge base** — no runtime network calls, no rate limits, no doc drift
- **Handles arbitrarily long patterns** — automatic fallback to a local HTML file using `@strudel/repl` (the inline web-component bundle from unpkg) when a base64 share URL would exceed the ~2000-char markdown/browser ceiling
- **11 genre templates** (house, techno, hip-hop, trap, dnb, jazz, ambient, psytrance, lofi, rock, hardbass) with professional-depth patterns: sidechain ducking via orbit routing, filter envelopes (lpenv), swing/humanization via `.late()`, variation via `every`/`sometimesBy`/`ply`/`degradeBy`, layered bass, and genre-authentic drum patterns
- **84 documented functions** and **80 documented effects** — covering the modern Strudel API including voicing/arp, filter/pitch envelopes, orbit routing, ducking, phaser/tremolo/vibrato, FM synthesis, and distortion types
- **209 sound entries** — 71 drum machine banks, 48 GM instruments, 27 dirt-sample categories, 20 VCSL instruments, 16 synths, 14 sample libraries, 13 drum voices
- **34 curated example patterns** demonstrating real Strudel idioms: sidechain pumping, voiced arpeggios, acid bass filter envelopes, amen break chopping, euclidean polyrhythms, dub delay, perlin noise modulation, layered reese bass, nightcore with supersaw + layered kicks
- **Audio download + analysis** — `strudel_sample` pulls audio from YouTube/SoundCloud/URL via `yt-dlp`, serves it locally with CORS so Strudel can play it; `strudel_analyze` runs librosa-based BPM/key/chord extraction and renders a 3-panel spectrogram PNG
- **Span-aware static linter** that understands strings, comments, template literals, escape sequences, scale specs, chord symbols, euclidean rhythms, and Strudel's mini-notation
- **Music theory helper** — 24 scales/modes (including phrygian dominant, hungarian minor, hirajoshi, insen, double harmonic), chord symbol parser with accidentals and extensions, Roman-numeral progression resolver with correct root-position voicing
- **Zero runtime npm dependencies** beyond `@modelcontextprotocol/sdk` and `zod` — audio download and analysis use optional system tools (`yt-dlp`, Python + librosa) invoked via `spawn`
- **No Playwright, no headless browser, no external services** — `open: true` uses the platform's native opener (`xdg-open` / `open` / `start`)

---

## Installation

Requires **Node ≥20**. Works with `bun` or `npm`.

```bash
git clone https://github.com/Takyon236/Strudel-MCP.git
cd Strudel-MCP
bun install     # or: npm install
bun run build   # or: npm run build
```

Output goes to `dist/index.js`.

### Optional system dependencies

Two of the ten tools call out to system binaries. Install them only if you plan to use those tools — the rest of the MCP works without them.

| Tool | Requires | Why |
|---|---|---|
| `strudel_sample` | [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) | YouTube and SoundCloud downloads. Direct HTTPS URLs work without it. |
| `strudel_analyze` | Python 3 + `librosa` + `matplotlib` + `numpy` | BPM / key / chord extraction and spectrogram rendering. |

Install `yt-dlp` via your package manager (`pip install yt-dlp`, `brew install yt-dlp`, `apt install yt-dlp`, etc.) and the Python stack with:

```bash
pip install librosa matplotlib numpy
```

The MCP probes for these at call time (`yt-dlp --version`; `python3 -c 'import librosa'`) and returns a clear error if they're missing — it does not fail at startup.

---

## Configuration

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) / `%APPDATA%\Claude\claude_desktop_config.json` (Windows) / `~/.config/Claude/claude_desktop_config.json` (Linux):

```json
{
  "mcpServers": {
    "strudel": {
      "command": "node",
      "args": ["/absolute/path/to/Strudel-MCP/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop — the 10 tools appear in the hammer menu.

### Claude Code

```bash
claude mcp add strudel node /absolute/path/to/Strudel-MCP/dist/index.js
```

Or edit `~/.claude/mcp.json` directly with the same JSON shape as above.

### Development (no build step)

```json
{
  "mcpServers": {
    "strudel": {
      "command": "bunx",
      "args": ["tsx", "/absolute/path/to/Strudel-MCP/src/index.ts"]
    }
  }
}
```

---

## Tools

| Tool | Purpose |
|---|---|
| `strudel_docs` | Look up Strudel functions, effects, categories, or concepts (mini-notation) |
| `strudel_examples` | Curated runnable example patterns, searchable by tag or style |
| `strudel_sounds` | Drum voices, drum machine banks, synth oscillators, sample libraries, GM instruments |
| `strudel_theory` | Scales, chord symbols, and Roman-numeral progressions resolved into Strudel syntax |
| `strudel_compose` | Generate a runnable pattern from a genre template |
| `strudel_validate` | Static parse and lint of a Strudel pattern |
| `strudel_run` | Encode pattern to a `strudel.cc/#` URL **or** write a local HTML embed file |
| `strudel_library` | Persistent local snippet store: save / load / list / delete |
| `strudel_sample` | Download audio from YouTube/SoundCloud/URL, serve locally with CORS for Strudel |
| `strudel_analyze` | Extract BPM, key, chords, beat grid from audio + generate spectrogram PNG |

### `strudel_run` handoff strategies

`strudel_run` picks how to hand a pattern to Strudel based on size:

| Strategy | When | Output |
|---|---|---|
| `url` | code ≤1200 chars (auto) or explicit | `strudel.cc/#<base64>` share URL |
| `embed` | code >1200 chars (auto) or explicit | HTML file at `~/.strudel-mcp/exports/<name>.html` |
| `auto` | default — picks based on size | — |

The 1200-char threshold is calibrated so the URL stays below ~2000 chars after base64 + URL encoding + the `https://strudel.cc/#` prefix — the empirical ceiling above which markdown link rendering breaks.

The `embed` HTML file uses [`@strudel/repl@1.2.7`](https://www.npmjs.com/package/@strudel/repl) loaded from the unpkg CDN — the **inline** web-component (not to be confused with `@strudel/embed`, a thin iframe wrapper around `strudel.cc` that inherits the URL-length limit). The bundle includes CodeMirror, the Strudel transpiler, webaudio output, and a prebake that auto-loads dirt-samples, soundfonts, and drum machines. The pattern code is written inside a `<script type="application/strudel-pattern">` holder; a small bootstrap waits for `customElements.whenDefined('strudel-editor')`, creates a `<strudel-editor>`, sets its `code` attribute from the holder, and appends it to a `#repl-root` container sized to fill the viewport. `Ctrl+Enter` plays, `Ctrl+.` stops. **No URL length limit. No external services.** See `src/lib/encode.ts::generatePlayerHtml` for the source of truth.

### Exports directory

Embed HTML files land in `~/.strudel-mcp/exports/`. Override with `STRUDEL_MCP_EXPORTS=/path/to/dir`.

### Library directory

Snippets land in `~/.strudel-mcp/library/`. Override with `STRUDEL_MCP_LIBRARY=/path/to/dir`.

---

## Usage examples

### Make me a house beat

> **You:** Make me a house beat at 124 BPM in A minor with drums, bass, and a synth lead.

Claude calls `strudel_compose` → produces a full pattern with four-on-the-floor kick (sidechained via `duckorbit`), offbeat hats with swing, bass with filter envelope (`lpenv`), epiano lead with `sometimesBy` variation, and a pad with slow filter sweep. Runs it through `strudel_validate`, hands you a playable URL from `strudel_run`.

### What does `.lpf` actually do?

> **You:** What's the parameter range for `.lpf` in Strudel?

Claude calls `strudel_docs` with `{topic: "lpf"}` → returns signature, category, range (20–20000, typical 200–8000), aliases (`cutoff`, `ctf`, `lp`), summary, and an example with signal modulation.

### How do I sidechain in Strudel?

> **You:** How do I make the bass pump with the kick?

Claude calls `strudel_docs` with `{topic: "duckorbit"}` → learns about orbit routing and duck parameters, then writes a pattern with `s("bd*4").duckorbit(1)` and bass on `.orbit(1)`.

### Give me a ii-V-I progression in F major

> **You:** Give me a ii-V-I progression in F major as Strudel code.

Claude calls `strudel_theory` with `{action: "progression", progression: "ii-V-I", scale: "F3:major"}` → returns the chord symbols (Gm, C, F), their notes in root position, and a ready-to-paste `note("...")` pattern.

### Save that beat

> **You:** Save that as "my_house_groove".

Claude calls `strudel_library` with `{action: "save", name: "my_house_groove", code: "..."}` → written to `~/.strudel-mcp/library/my_house_groove.json`.

---

## Development

```bash
bun install        # dependencies
bun run dev        # run the MCP under tsx for local hacking
bun run build      # compile to dist/
bun run typecheck  # strict TypeScript, 0 errors required
bun test           # full test suite
```

### Project structure

```
src/
  index.ts              # McpServer + tool registration
  tools/                # One file per tool (10 files: docs, examples, sounds, theory, compose, validate, run, library, sample, analyze)
  knowledge/            # Pre-compiled reference data
    functions.ts        # FunctionDoc[] (84 entries)
    effects.ts          # EffectDoc[] (80 entries)
    sounds.ts           # Drums / banks / synths / GM / VCSL / dirt / sample libs (209 entries)
    scales.ts           # Scale definitions + parseRoot + notesInScale (24 scales)
    minispec.ts         # Mini-notation rules + overview (18 rules)
    examples.ts         # Curated runnable pattern examples (34 entries)
  lib/
    encode.ts           # code2hash / hash2code / generatePlayerHtml (self-contained HTML via @strudel/repl)
    validate.ts         # Span-aware static linter
    theory.ts           # Chord parser + Roman-numeral resolver
    library.ts          # Snippet persistence + export HTML
    sampleServer.ts     # Localhost HTTP server with CORS, yt-dlp integration, /play REPL endpoint
    analyzer.ts         # Spawns scripts/analyze.py (librosa) for BPM/key/chord analysis
scripts/
  analyze.py            # librosa-based audio analysis (BPM, key, chords, spectrogram)
tests/                  # bun test suite
```

For the full design document including tool-by-tool rationale, validator internals, and conventions, see [CLAUDE.md](./CLAUDE.md).

---

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow, code style, and how to extend the tool surface or knowledge base. The full design document with tool-by-tool rationale is in [CLAUDE.md](./CLAUDE.md).

---

## Credits

- [Strudel](https://strudel.cc) by [Felix Roos](https://github.com/felixroos) and the Strudel contributors — the live-coding language this MCP drives
- [TidalCycles](https://tidalcycles.org) by Alex McLean — the pattern language Strudel is a port of
- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic — the protocol this server speaks

## License

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later) — see [LICENSE](./LICENSE).

strudel-mcp is built on and generates handoffs into [Strudel](https://github.com/tidalcycles/strudel), which is itself licensed under AGPL-3.0-or-later. This project inherits that license to respect the upstream terms. See [NOTICE](./NOTICE) for credits.
