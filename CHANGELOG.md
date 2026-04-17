# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-04-17

### Added

- **`strudel_sample` tool** — download audio from YouTube, SoundCloud, or any direct URL via `yt-dlp`, then serve it locally with CORS so the browser-side Strudel runtime can fetch it. Includes a localhost HTTP server (OS-assigned port by default, override with `STRUDEL_MCP_SAMPLE_PORT`), a dynamic `/strudel.json` manifest for native sample discovery, and `Accept-Ranges: bytes` support for large files.
- **`strudel_analyze` tool** — extract BPM, key + mode (Krumhansl-Schmuckler), chord progression, beat grid, and a 3-panel spectrogram PNG from an audio file. Python 3 + `librosa` + `matplotlib` + `numpy` required; spawned as a subprocess from `src/lib/analyzer.ts`.
- **`/play` endpoint** on the sample server — serves the `@strudel/repl` web-component page from the same origin as the samples themselves, so local-sample patterns play without mixed-content or CORS errors.
- HTML and JavaScript content-type handling on the sample server so the player page loads correctly.
- **Drum bank expansion** — went from 9 banks to **71** (full modern Strudel drum-machine catalog: all Roland TR-x, Linn, Oberheim, Emu, Korg, Yamaha, Alesis, Boss variants).
- **VCSL instruments** — 20 new entries (Kawai/Steinway pianos, world/latin percussion, saxophone, harmonica, harp).
- **Dirt-sample categories** — 27 new entries (clubkick, hardkick, rave, industrial, wobble, hoover, and more).
- **Functions expansion** — `functions.ts` went from 43 entries to **84**. Newly added include `arrange`, `pick`, `pickOut`, `arp`, `fit`, signal helpers (`perlin`, `irand`), and additional chord/voicing/time helpers.
- **Effects expansion** — `effects.ts` went from 33 entries to **80**. Newly added include filter envelopes (`lpenv`/`lpa`/`lpd`, plus hp/bp variants), sidechain routing (`duckorbit`/`duckdepth`/`duckattack`), vibrato (`vib`/`vibmod`), FM envelope controls (`fmattack`/`fmdecay`/`fmsustain`/`fmenv`), distortion variants (`distorttype`/`distortvol`), and aliases like `cutoff` → `lpf`.
- **6 new scales** — `phrygian_dominant`, `hungarian_minor`, `double_harmonic`, `major_blues`, `hirajoshi`, `insen` (24 total, up from 18).
- **Examples expansion** — went from 12 to **34** (includes layered reese bass, voiced arpeggios, amen break chopping, acid bass filter envelopes, nightcore + hardbass finale with layered kicks + supersaw).
- **2 new genre templates** — `hip-hop` and `hardbass` (11 total, up from 9).
- Open-source readiness: `CHANGELOG.md`, `CONTRIBUTING.md`, GitHub Actions CI workflow, and `package.json` metadata (`author`, `repository`, `homepage`, `bugs`).

### Changed

- **Embed strategy refactored** — `strudel_run`'s `embed` mode and the sample server's `/play` endpoint now both use `@strudel/repl@1.2.7` (the inline web-component bundle from unpkg) instead of `@strudel/embed` (a thin iframe wrapper). The iframe approach inherited the URL-length limit and silently rendered an empty REPL for long patterns. `@strudel/repl` bundles CodeMirror + transpiler + webaudio + prebake and works for patterns of any size. See `src/lib/encode.ts::generatePlayerHtml`.
- **Examples and compose templates** rewritten for professional depth — discrete drum parts with per-part effect chains, sidechain ducking via `duckorbit`/`orbit`, filter envelopes (`lpenv`/`lpa`/`lpd`), swing via `.late()`, variation via `every`/`sometimesBy`/`degradeBy`, and genre-authentic patterns (jazz swing ride, ambient beatless, trap pitch envelope, DnB half-time reese).
- **Nightcore and trance** examples default to `supersaw.detune(...)` for leads/bass instead of raw `sawtooth`, layered kick (sine sub + sampled punchy kick) instead of bare TR-909.
- **Mini-notation rules** expanded to 18 entries including euclidean rhythms, `$:` labeled patterns, and `_` elongation.
- `progressionInScale` now resolves correct root-position voicings and handles inversions consistently.
- README documents the 10 tools accurately, lists the optional `yt-dlp` / Python dependencies, and references the correct `@strudel/repl` handoff.

### Deprecated

- `echoWith` — superseded by `.echo(n, offset, decay)`. Old name still works via alias; will be removed in a future release.
- `generateEmbedHtml` export — superseded by `generatePlayerHtml` (same behavior; the old name is kept as an alias for backwards compatibility).

### Fixed

- Jazz template produced broken Strudel (`"<...>".rootNotes()` on a bare string, trailing `.s()` silently ignored on `.voicing()` chains). Rewrote bass/lead/pad to use `chord("<...>").voicing().arp()` idioms and swapped the drum bank to `RolandTR808` for a proper ride cymbal.
- Ambient template produced a silent drum part (`s("~").gain(0)` stub). Replaced with an empty `drumParts` and guarded the composer loop against empty entries.
- `strudel_analyze`'s `chordToNotes` returned the same root-tripled pattern for major and minor triads. Rewrote with real triad math, flat accidentals, and maj/m detection via negative lookahead.
- `/play` endpoint was missing `@strudel/mini`, `@strudel/soundfonts`, and a dirt-samples preload, so stock drum and GM patterns played silently. Added the three imports plus an `ensureSamplesLoaded` bootstrap.
- `examples.ts` "Voiced chord arpeggio" used `note()` instead of `chord()` with an inert trailing `.s()`; `functions.ts` `pickOut` example called `.layer()` instead of `.pickOut()`.

## [0.1.0] - 2026-04-16

Initial scope. Never released externally — this entry documents the starting
state in the repo before 0.2.0.

### Added

- 8 tools: `strudel_docs`, `strudel_examples`, `strudel_sounds`, `strudel_theory`, `strudel_compose`, `strudel_validate`, `strudel_run`, `strudel_library`.
- Pre-compiled knowledge base: 43 functions, 33 effects, 65 sounds (9 drum banks, 10 synths, 12 sample libraries, 14 drum voices, 20 GM instruments), 18 scales, 12 curated examples, mini-notation rules.
- Base64 share-URL encoding matching `@strudel/core`'s `code2hash`.
- Span-aware static linter.
- Chord symbol parser and Roman-numeral progression resolver.
- 9 genre templates: house, techno, trap, dnb, jazz, ambient, psytrance, lofi, rock.
