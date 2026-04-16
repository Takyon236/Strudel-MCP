import { spawn } from 'node:child_process';
import path from 'node:path';
import { promises as fs } from 'node:fs';

const SCRIPT_PATH = path.resolve(import.meta.dirname ?? __dirname, '../../scripts/analyze.py');
const PYTHON_CANDIDATES = ['python3.10', 'python3', 'python'];

export interface AnalysisResult {
  file: string;
  duration_seconds: number;
  bpm: number;
  key: string;
  mode: string;
  key_confidence: number;
  beats: { count: number; times: number[] };
  chords: Array<{ time: number; chord: string; confidence?: number }>;
  onsets: { count: number; density_per_second: number };
  spectrogram: string | null;
}

async function findPython(): Promise<string> {
  for (const cmd of PYTHON_CANDIDATES) {
    const ok = await new Promise<boolean>((resolve) => {
      const proc = spawn(cmd, ['-c', 'import librosa'], { stdio: 'ignore' });
      proc.on('error', () => resolve(false));
      proc.on('close', (code) => resolve(code === 0));
    });
    if (ok) return cmd;
  }
  throw new Error(
    'No Python with librosa found. Install with: pip install librosa matplotlib numpy',
  );
}

export async function analyzeAudio(
  audioPath: string,
  spectrogramPath?: string,
): Promise<AnalysisResult> {
  await fs.access(audioPath);

  const python = await findPython();
  const args = [SCRIPT_PATH, audioPath];
  if (spectrogramPath) args.push(spectrogramPath);

  return new Promise((resolve, reject) => {
    const proc = spawn(python, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });
    proc.on('error', (err) => reject(new Error(`Python spawn error: ${err.message}`)));
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Analysis failed (exit ${code}): ${stderr.slice(0, 1000)}`));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result as AnalysisResult);
        }
      } catch {
        reject(new Error(`Failed to parse analysis output: ${stdout.slice(0, 500)}`));
      }
    });
  });
}
