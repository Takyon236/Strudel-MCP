#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { strudelDocs, docsInputSchema } from './tools/docs.js';
import { strudelExamples, examplesInputSchema } from './tools/examples.js';
import { strudelSounds, soundsInputSchema } from './tools/sounds.js';
import { strudelTheory, theoryInputSchema } from './tools/theory.js';
import { strudelCompose, composeInputSchema } from './tools/compose.js';
import { strudelValidate, validateInputSchema } from './tools/validate.js';
import { strudelRun, runInputSchema } from './tools/run.js';
import { strudelLibrary, libraryInputSchema } from './tools/library.js';
import { strudelSample, sampleInputSchema } from './tools/sample.js';
import { strudelAnalyze, analyzeInputSchema } from './tools/analyze.js';

const server = new McpServer({
  name: 'strudel-mcp',
  version: '0.1.0',
});

server.registerTool(
  'strudel_docs',
  {
    title: 'Strudel documentation lookup',
    description:
      'Look up Strudel functions, effects, categories, or concepts (mini-notation). ' +
      'Pass a topic string like "note", "lpf", "effects", "mini-notation", or "overview".',
    inputSchema: docsInputSchema,
  },
  async (args) => strudelDocs(args),
);

server.registerTool(
  'strudel_examples',
  {
    title: 'Strudel example patterns',
    description:
      'Return curated runnable Strudel examples filtered by a free-text query over tags, ' +
      'titles, and descriptions. Useful for seeding ideas ("house beat", "acid bass", "ambient pad").',
    inputSchema: examplesInputSchema,
  },
  async (args) => strudelExamples(args),
);

server.registerTool(
  'strudel_sounds',
  {
    title: 'Strudel sound catalog',
    description:
      'List available drum voices, drum machine banks, synth oscillators, sample libraries, ' +
      'and General MIDI instruments. Filter by category or free-text query.',
    inputSchema: soundsInputSchema,
  },
  async (args) => strudelSounds(args),
);

server.registerTool(
  'strudel_theory',
  {
    title: 'Music theory helper',
    description:
      'Resolve scales, chord symbols, and Roman-numeral progressions into concrete notes ' +
      'and Strudel note patterns. Supports list-scales and list-progressions for discovery.',
    inputSchema: theoryInputSchema,
  },
  async (args) => strudelTheory(args),
);

server.registerTool(
  'strudel_compose',
  {
    title: 'Pattern composer',
    description:
      'Generate a runnable Strudel pattern from a style template (house, techno, hip-hop, ' +
      'trap, dnb, jazz, ambient, psytrance, lofi, rock). Specify tempo, key, and which elements to include.',
    inputSchema: composeInputSchema,
  },
  async (args) => strudelCompose(args),
);

server.registerTool(
  'strudel_validate',
  {
    title: 'Strudel linter',
    description:
      'Statically check a Strudel pattern for unbalanced brackets, unknown function/effect names, ' +
      'and malformed mini-notation. Returns errors, warnings, and info notes.',
    inputSchema: validateInputSchema,
  },
  async (args) => strudelValidate(args),
);

server.registerTool(
  'strudel_run',
  {
    title: 'Strudel pattern runner',
    description:
      'Run a Strudel pattern. For short patterns (<1500 chars) returns a strudel.cc/#<hash> share URL. ' +
      'For longer patterns writes a local HTML file using @strudel/embed so there is no URL length limit. ' +
      'Can also open the result in the system default browser via xdg-open/open/start.',
    inputSchema: runInputSchema,
  },
  async (args) => strudelRun(args),
);

server.registerTool(
  'strudel_library',
  {
    title: 'Snippet library',
    description:
      'Persistent local snippet store: save, load, list, or delete pattern snippets. ' +
      'Files live under ~/.strudel-mcp/library/ (override with STRUDEL_MCP_LIBRARY env var).',
    inputSchema: libraryInputSchema,
  },
  async (args) => strudelLibrary(args),
);

server.registerTool(
  'strudel_sample',
  {
    title: 'Sample downloader',
    description:
      'Download audio from YouTube, SoundCloud, or any URL and serve it locally so Strudel can load it. ' +
      'Returns a samples() call ready to paste. Requires yt-dlp for YouTube/SoundCloud. ' +
      'Use action "download" with a url, or "list" to see downloaded samples.',
    inputSchema: sampleInputSchema,
  },
  async (args) => strudelSample(args),
);

server.registerTool(
  'strudel_analyze',
  {
    title: 'Audio analyzer',
    description:
      'Analyze an audio file to extract BPM, key, chord progression, beat grid, and onset density. ' +
      'Also generates a spectrogram PNG (mel spectrogram + chromagram + beat grid). ' +
      'Accepts a filename from ~/.strudel-mcp/samples/ or an absolute path. ' +
      'Requires Python 3 with librosa and matplotlib installed.',
    inputSchema: analyzeInputSchema,
  },
  async (args) => strudelAnalyze(args),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[strudel-mcp] fatal:', err);
  process.exit(1);
});
