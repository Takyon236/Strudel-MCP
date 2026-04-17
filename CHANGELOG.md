# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-17

### Added

- **`strudel_sample` tool** — download audio from YouTube, SoundCloud, or any direct URL via `yt-dlp`, then serve it locally with CORS so the browser-side Strudel runtime can fetch it. Includes a localhost HTTP server (OS-assigned port by default, override with `STRUDEL_MCP_SAMPLE_PORT`), a dynamic `/strudel.json` manifest for native sample discovery, and `Accept-Ranges: bytes` support for large files.
- **`strudel_analyze` tool** — extract BPM, key + mode (Krumhansl-Schmuckler), chord progression, beat grid, and a 3-panel spectrogram PNG from an audio file. Python 3 + `librosa` + `matplotlib` + `numpy` required; spawned as a subprocess from `src/lib/analyzer.ts`.
- **`/play` endpoint** on the sample server — serves the `@strudel/repl` web-component page from the same origin as the samples themselves, so local-sample patterns play without mixed-content or CORS errors.
- HTML and JavaScript content-type handling on the sample server, so the player page loads correctly.
- **27 drum banks** new entries covering the full modern Strudel drum-machine catalog (71 total banks now, up from 18).
- **20 VCSL instruments**, **27 dirt-sample categories**, and synth-drum / FM-perc entries (modern sound design).
- **28 new functions** — `arrange`, `pick`, signal helpers (`perlin`, `rand`, `irand`, etc.), voicing/arp, chord helpers, and more.
- **53 new effects** — including `lpenv`/`lpa`/`lpd` filter envelopes, `duckorbit`/`duckdepth`/`duckattack` sidechain routing, `vib`/`vibmod`, `phaser`, `tremolo`, `coarse`, `crush`, distortion variants, and aliases (`cutoff` → `lpf`, etc.).
- **6 new scales** — phrygian dominant, hungarian minor, hirajoshi, insen, and others (26 scales total).
- **11 new examples** — including layered reese bass, voiced arpeggios, amen break chopping, and nightcore with layered kicks + supersaw (34 examples total).
- `CHANGELOG.md`, `CONTRIBUTING.md`, GitHub Actions CI workflow, and `package.json` metadata (`author`, `repository`, `homepage`, `bugs`) for open-source readiness.

### Changed

- **Embed strategy refactored** — `strudel_run`'s `embed` mode and the sample server's `/play` endpoint now both use `@strudel/repl@1.2.7` (the inline web-component bundle from unpkg) instead of `@strudel/embed` (a thin iframe wrapper). The iframe approach inherited the URL-length limit and silently rendered an empty REPL for long patterns. `@strudel/repl` bundles CodeMirror + transpiler + webaudio + prebake and works for patterns of any size. See `src/lib/encode.ts::generatePlayerHtml`.
- **Examples and compose templates** rewritten for professional depth — discrete drum parts with per-part effect chains, sidechain ducking via `duckorbit`/`orbit`, filter envelopes (`lpenv`/`lpa`/`lpd`), swing via `.late()`, variation via `every`/`sometimesBy`/`degradeBy`, and genre-authentic patterns (jazz swing ride, ambient beatless, trap pitch envelope, DnB half-time reese).
- **Nightcore and trance templates** default to `supersaw.detune(...)` for leads/bass instead of raw `sawtooth`, layered kick (sine sub + sampled punchy kick) instead of bare TR-909.
- **Mini-notation rules** expanded to 19 entries including euclidean rhythms, `$:` labeled patterns, and `_` elongation.
- `progressionInScale` now resolves correct root-position voicings and handles inversions consistently.
- README documents the 10 tools accurately, lists the optional `yt-dlp` / Python dependencies, and references the correct `@strudel/repl` handoff.

### Deprecated

- `echoWith` — superseded by `.echo(n, offset, decay)`. Old name still works via alias; will be removed in a future release.
- `generateEmbedHtml` export — superseded by `generatePlayerHtml` (same behavior; the old name is kept as an alias for backwards compatibility).

### Fixed

- Jazz template syntax error (`maj7` chord symbol parsing in the validator regex).
- Ambient template no longer produces a silent drum part.
- `strudel_analyze` chord detector now reports triads correctly (previously occasionally returned malformed symbols).
- `/play` endpoint no longer strips voices from polyphonic patterns.

## [0.1.0] - 2026-02-15

### Added

- Initial release of `strudel-mcp`.
- 8 tools: `strudel_docs`, `strudel_examples`, `strudel_sounds`, `strudel_theory`, `strudel_compose`, `strudel_validate`, `strudel_run`, `strudel_library`.
- Pre-compiled knowledge base: functions, effects, sounds, scales, mini-notation rules, curated examples.
- Base64 share-URL encoding matching `@strudel/core`'s `code2hash`.
- Span-aware static linter.
- Chord symbol parser and Roman-numeral progression resolver.
- Genre templates for house, techno, hip-hop, trap, dnb, jazz, ambient, psytrance, lofi, and rock.
