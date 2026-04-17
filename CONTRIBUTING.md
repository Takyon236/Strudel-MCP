# Contributing to strudel-mcp

Thanks for taking the time to contribute! This document covers the workflow, code style, and how to extend the MCP.

## Quick checklist before opening a PR

```bash
bun install
bun run typecheck   # must pass with zero errors
bun test            # must pass
bun run build       # must produce dist/ cleanly
```

No linter — strict TypeScript via `tsc --noEmit` is the gate. `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.

## Adding a new tool

1. Create `src/tools/<name>.ts` exporting `<name>InputSchema` (zod **raw shape object**, not `z.object({...})`) and an async handler function.
2. Register it in `src/index.ts` with `server.registerTool(...)`.
3. Every input field gets a `.describe(...)` — the LLM reads these to pick arguments, so be precise about value ranges and semantics.
4. Tool responses use `{ content: [{ type: 'text', text: ... }] }`. Use the local `text()` helper in each tool file.
5. Handle errors gracefully — return a text payload with the error message. Throwing propagates to the MCP layer and surfaces as an opaque error to the client. Reserve throws for genuinely malformed input that zod should have caught.
6. Add a unit test in `tests/tools.test.ts`.

See `src/tools/run.ts` for a full-featured reference and `src/tools/docs.ts` for a minimal one.

## Adding to the knowledge base

Knowledge files live in `src/knowledge/` as typed constants — no runtime fetches, no cache, no drift.

- **`functions.ts`** — add to the `FUNCTIONS` array. `findFunction()` is case-insensitive and strips leading `.`. New names auto-flow into `FUNCTION_NAMES` → validator's `KNOWN_IDENTIFIERS`.
- **`effects.ts`** — same pattern. Aliases resolve via `findEffect('cutoff')?.name === 'lpf'`.
- **`sounds.ts`** — add to the right category array; `searchSounds()` covers it automatically. New entries auto-flow into `ALL_SOUNDS` → `SOUND_NAMES`.
- **`examples.ts`** — add to `EXAMPLES`. Tags (weight 5) > title (weight 3) > description (weight 2). Keep tags lowercase. Every example's `code` field is validated by `tests/cross-validation.test.ts` — all referenced functions and effects must exist in the knowledge base.
- **`scales.ts`** — add to `SCALES` with intervals as semitone offsets from root.
- **`compose.ts`** — templates use the `StyleTemplate` interface with `drumParts` (array of discrete drum chains), `bassPart`, `leadPart`, `padPart`. Use `maj7` not `^7` (validator regex limitation).

## Validator rules

`src/lib/validate.ts` walks the source once. It tracks string literals, comments, and template literals as spans, then checks:

1. Bracket balance (`()`, `[]`, `{}`) with `line:col` reporting.
2. Function-call identifier extraction. Unknown lowercase method calls → warning; JS builtins and PascalCase constructors are allowed through.
3. Mini-notation bracket balance inside captured strings.
4. Mini-notation token check. **Unknown lowercase tokens produce an info note saying they may be custom samples — not an error.** Users load external samples often; false positives are worse than false negatives here.

**Do not promote "unknown sample" to warning.**

## Code style

- Functions under 30 lines where possible. Split helpers into `lib/`.
- `const` default, never `var`. camelCase variables, lowercase filenames.
- No classes — functional helpers only.
- No runtime network calls from tools. Pre-compiled knowledge only. `strudel_run` is the lone exception (writes an HTML file, spawns the system browser) and the generated HTML loads `@strudel/repl` from unpkg at view time — never from the MCP server process.
- No telemetry, no logging to stdout — stdout is the MCP transport. Use `console.error` if needed.
- Match existing architecture patterns. Before proposing a solution, check how similar problems are already solved.
- **Minimal comments.** Only add a comment when the *why* is non-obvious — a hidden constraint, a subtle invariant, a workaround for a specific bug. Don't explain what well-named identifiers already do.

## Design principles

See [CLAUDE.md](./CLAUDE.md) for the full design document — tool-by-tool rationale, validator internals, handoff strategies, and conventions. The short version:

1. **Few tools, rich knowledge.** The LLM writes Strudel code; the MCP informs that code, not replaces the writer.
2. **Pre-compiled knowledge.** No runtime fetches, no cache staleness.
3. **Strudel does the audio.** This is a knowledge + handoff server, not an audio engine.
4. **Templates for composition.** Hand-tuned genre templates with professional depth, not LLM-generated stubs.
5. **Local-first persistence.** Flat JSON under `~/.strudel-mcp/`. No database, no service.

## Reporting bugs

Open an issue at <https://github.com/Takyon236/Strudel-MCP/issues> with:

- What you ran (tool name + arguments, or shell command)
- What you expected
- What happened instead
- Your Node version (`node --version`) and OS

For tool-output bugs, paste the full tool response.

## License

By contributing, you agree your contributions are licensed under the MIT License.
