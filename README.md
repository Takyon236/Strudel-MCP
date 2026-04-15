# Strudel-MCP

A **Model Context Protocol** server that gives LLMs deep knowledge of [Strudel](https://strudel.cc) — the JavaScript port of [TidalCycles](https://tidalcycles.org) for live-coded music. Lets Claude (or any MCP-aware model) compose, validate, and run runnable Strudel patterns without needing to know the whole API by heart.

The MCP is **knowledge-first**: the LLM writes the Strudel code, and the 8 tools give it reference data, composition templates, music-theory helpers, a static linter, and a playback handoff that works for patterns of any length.

---

## Features

- **8 focused tools** covering documentation, examples, sounds, music theory, composition, validation, playback, and a persistent snippet library
- **Pre-compiled knowledge base** — no runtime network calls, no rate limits, no doc drift
- **Handles arbitrarily long patterns** — automatic fallback to a local HTML file using `@strudel/embed` when a base64 share URL would exceed the ~2000-char markdown/browser ceiling
- **10 genre templates** (house, techno, hip-hop, trap, dnb, jazz, ambient, psytrance, lofi, rock) with hand-tuned drum patterns, basslines, and chord progressions
- **Span-aware static linter** that understands strings, comments, template literals, escape sequences, scale specs, chord symbols, and Strudel's mini-notation
- **Music theory helper** — 18 scales/modes, chord symbol parser with accidentals and extensions, Roman-numeral progression resolver
- **Zero runtime dependencies** beyond `@modelcontextprotocol/sdk` and `zod`
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

Restart Claude Desktop — the 8 tools appear in the hammer menu.

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

### `strudel_run` handoff strategies

`strudel_run` picks how to hand a pattern to Strudel based on size:

| Strategy | When | Output |
|---|---|---|
| `url` | code ≤1200 chars (auto) or explicit | `strudel.cc/#<base64>` share URL |
| `embed` | code >1200 chars (auto) or explicit | HTML file at `~/.strudel-mcp/exports/<name>.html` |
| `auto` | default — picks based on size | — |

The 1200-char threshold is calibrated so the URL stays below ~2000 chars after base64 + URL encoding + the `https://strudel.cc/#` prefix — the empirical ceiling above which markdown link rendering breaks.

The `embed` HTML file uses the official [`@strudel/embed`](https://www.npmjs.com/package/@strudel/embed) package loaded from the unpkg CDN. The pattern code is written inside a `<script type="application/strudel-pattern">` holder and picked up by a bootstrap that creates a `<strudel-repl>` element with the pattern in its `code` attribute. **No URL length limit. No external services.**

### Exports directory

Embed HTML files land in `~/.strudel-mcp/exports/`. Override with `STRUDEL_MCP_EXPORTS=/path/to/dir`.

### Library directory

Snippets land in `~/.strudel-mcp/library/`. Override with `STRUDEL_MCP_LIBRARY=/path/to/dir`.

---

## Usage examples

### Make me a house beat

> **You:** Make me a house beat at 124 BPM in A minor with drums, bass, and a synth lead.

Claude calls `strudel_compose` with `{style: "house", tempo_bpm: 124, key: "A2:minor", elements: ["drums", "bass", "lead"]}`, runs the result through `strudel_validate`, and hands you a URL from `strudel_run`. Click it → plays in strudel.cc.

### What does `.lpf` actually do?

> **You:** What's the parameter range for `.lpf` in Strudel?

Claude calls `strudel_docs` with `{topic: "lpf"}` → returns signature, category, range (20–20000, typical 200–8000), summary, and an example with signal modulation.

### Give me a ii-V-I progression in F major

> **You:** Give me a ii-V-I progression in F major as Strudel code.

Claude calls `strudel_theory` with `{action: "progression", progression: "ii-V-I", scale: "F3:major"}` → returns the chord symbols (Gm, C, F), their notes, and a ready-to-paste `note("...")` pattern.

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
  tools/                # One file per tool (8 files)
  knowledge/            # Pre-compiled reference data
    functions.ts        # FunctionDoc[]
    effects.ts          # EffectDoc[]
    sounds.ts           # Drums / banks / GM / samples
    scales.ts           # Scale definitions + parseRoot + notesInScale
    minispec.ts         # Mini-notation rules + overview
    examples.ts         # Curated runnable pattern examples
  lib/
    encode.ts           # code2hash / hash2code / generateEmbedHtml
    validate.ts         # Span-aware static linter
    theory.ts           # Chord parser + Roman-numeral resolver
    library.ts          # Snippet persistence + export HTML
tests/                  # bun test suite
```

For the full design document including tool-by-tool rationale, validator internals, and conventions, see [CLAUDE.md](./CLAUDE.md).

---

## Contributing

Issues and PRs welcome. Before opening a PR:

```bash
bun run typecheck   # must pass
bun test            # must pass
bun run build       # must produce dist/ cleanly
```

Follow the existing code style — no classes, functional helpers split into `lib/`, zod raw shapes for input schemas, tool responses shaped as `{ content: [{ type: 'text', text: ... }] }`.

---

## Credits

- [Strudel](https://strudel.cc) by [Felix Roos](https://github.com/felixroos) and the Strudel contributors — the live-coding language this MCP drives
- [TidalCycles](https://tidalcycles.org) by Alex McLean — the pattern language Strudel is a port of
- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic — the protocol this server speaks

## License

MIT — see [LICENSE](./LICENSE).
