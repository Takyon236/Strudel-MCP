import { z } from 'zod';
import path from 'node:path';
import os from 'node:os';
import { promises as fs } from 'node:fs';
import { analyzeAudio, AnalysisResult } from '../lib/analyzer.js';

const SAMPLES_DIR = () => process.env.STRUDEL_MCP_SAMPLES ?? path.join(os.homedir(), '.strudel-mcp', 'samples');
const ANALYSIS_DIR = () => path.join(os.homedir(), '.strudel-mcp', 'analysis');

export const analyzeInputSchema = {
  file: z
    .string()
    .describe(
      'Audio file to analyze. Either a filename in ~/.strudel-mcp/samples/ (e.g. "gimme_love.wav") ' +
      'or an absolute path to any audio file.',
    ),
  spectrogram: z
    .boolean()
    .optional()
    .describe('Generate a spectrogram PNG image. Default: true.'),
};

export async function strudelAnalyze(input: { file: string; spectrogram?: boolean }) {
  try {
    const audioPath = await resolveAudioPath(input.file);
    const wantSpec = input.spectrogram !== false;

    let spectrogramPath: string | undefined;
    if (wantSpec) {
      const dir = ANALYSIS_DIR();
      await fs.mkdir(dir, { recursive: true });
      const baseName = path.basename(audioPath, path.extname(audioPath));
      spectrogramPath = path.join(dir, `${baseName}_analysis.png`);
    }

    const result = await analyzeAudio(audioPath, spectrogramPath);
    return text(formatAnalysis(result));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return text(`Analysis error: ${msg}`);
  }
}

async function resolveAudioPath(file: string): Promise<string> {
  if (path.isAbsolute(file)) {
    await fs.access(file);
    return file;
  }
  const inSamples = path.join(SAMPLES_DIR(), file);
  try {
    await fs.access(inSamples);
    return inSamples;
  } catch {
    throw new Error(
      `File "${file}" not found. Provide an absolute path or a filename in ~/.strudel-mcp/samples/. ` +
      'Use strudel_sample to download audio first.',
    );
  }
}

function formatAnalysis(r: AnalysisResult): string {
  const chordSummary = summarizeChords(r.chords);
  const lines = [
    `## Audio Analysis: ${r.file}`,
    '',
    `| Property | Value |`,
    `|----------|-------|`,
    `| Duration | ${formatDuration(r.duration_seconds)} |`,
    `| BPM | **${r.bpm}** |`,
    `| Key | **${r.key} ${r.mode}** (confidence: ${(r.key_confidence * 100).toFixed(0)}%) |`,
    `| Beats | ${r.beats.count} detected |`,
    `| Onset density | ${r.onsets.density_per_second}/sec |`,
    '',
    `### Chord Progression`,
    chordSummary,
    '',
    `### Strudel Key/Scale`,
    '```js',
    `.scale("${toStrudelKey(r.key)}:${r.mode}")`,
    '```',
    '',
    `### Suggested Strudel Pattern`,
    '```js',
    `setcpm(${r.bpm}/4)`,
    '',
    `// Chord progression from analysis`,
    `note("${toStrudelChordPattern(r.chords)}")`,
    `  .s("gm_acoustic_grand_piano")`,
    `  .room(.3).gain(.6)`,
    '```',
  ];

  if (r.spectrogram) {
    lines.push('', `### Spectrogram`, `Saved to: \`${r.spectrogram}\``);
  }

  return lines.join('\n');
}

function summarizeChords(chords: Array<{ time: number; chord: string; confidence?: number }>): string {
  if (chords.length === 0) return 'No chords detected.';

  const unique = [...new Set(chords.map((c) => c.chord).filter((c) => c !== 'N'))];
  const timeline = chords
    .filter((c) => c.chord !== 'N')
    .slice(0, 16)
    .map((c) => `${formatTime(c.time)}: **${c.chord}**`)
    .join(' → ');

  return `**Chords found:** ${unique.join(', ')}\n\n**Timeline:** ${timeline}`;
}

function toStrudelKey(key: string): string {
  return key.replace('#', 's').toLowerCase() + '3';
}

function toStrudelChordPattern(chords: Array<{ time: number; chord: string }>): string {
  const unique = chords
    .map((c) => c.chord)
    .filter((c) => c !== 'N');

  const seen = new Set<string>();
  const progression: string[] = [];
  for (const ch of unique) {
    if (!seen.has(ch)) {
      seen.add(ch);
      progression.push(ch);
    }
    if (progression.length >= 4) break;
  }

  if (progression.length === 0) return 'c3 e3 g3';

  return '<' + progression.map(chordToNotes).join(' ') + '>';
}

const PITCH_CLASSES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];

const FLAT_TO_SHARP: Record<string, string> = {
  cb: 'b', db: 'cs', eb: 'ds', fb: 'e', gb: 'fs', ab: 'gs', bb: 'as',
};

function chordToNotes(chord: string): string {
  const rootMatch = chord.match(/^([A-G][#b]?)/);
  if (!rootMatch) return '[c3,e3,g3]';

  const rawRoot = rootMatch[1];
  const afterRoot = chord.slice(rawRoot.length);
  const isMinor = /^m(?!aj)/i.test(afterRoot);

  const normalized = rawRoot.toLowerCase().replace('#', 's');
  const rootPc = FLAT_TO_SHARP[normalized] ?? normalized;

  const rootIdx = PITCH_CLASSES.indexOf(rootPc);
  if (rootIdx === -1) return '[c3,e3,g3]';

  const thirdIdx = (rootIdx + (isMinor ? 3 : 4)) % 12;
  const fifthIdx = (rootIdx + 7) % 12;

  const r = PITCH_CLASSES[rootIdx];
  const t = PITCH_CLASSES[thirdIdx];
  const f = PITCH_CLASSES[fifthIdx];

  return `[${r}3,${t}3,${f}3]`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1);
  return `${m}:${s.padStart(4, '0')}`;
}

function text(s: string) {
  return { content: [{ type: 'text' as const, text: s }] };
}
