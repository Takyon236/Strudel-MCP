import { FUNCTION_NAMES } from '../knowledge/functions.js';
import { EFFECT_NAMES } from '../knowledge/effects.js';
import { ALL_SOUNDS } from '../knowledge/sounds.js';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
  message: string;
  hint?: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
  miniStrings: string[];
}

const KNOWN_IDENTIFIERS = new Set<string>([
  ...FUNCTION_NAMES,
  ...EFFECT_NAMES,
  'stack', 'cat', 'seq', 'sine', 'cosine', 'saw', 'square', 'tri', 'rand', 'perlin',
  'range', 'run', 'irand', 'choose', 'pick', 'silence', 'polyrhythm', 'polymeter',
  'setcps', 'setcpm', 'setCps', 'setCpm', 'samples', 'loadOrc', 'loadSoundFont',
  'degradeBy', 'degrade', 'chooseCycles', 'reset', 'restart', 'voicings',
  'cpm', 'cps', 'time', 'now', 'detune', 'octave',
]);

const SOUND_NAMES = new Set(ALL_SOUNDS.map((s) => s.name.toLowerCase()));

const JS_KEYWORDS = new Set([
  'if', 'for', 'while', 'function', 'const', 'let', 'var', 'return', 'await',
  'async', 'new', 'typeof', 'void', 'do', 'switch', 'case', 'break', 'continue',
  'default', 'try', 'catch', 'throw', 'class', 'extends', 'import', 'export',
  'from', 'as', 'in', 'of', 'this', 'super', 'yield', 'delete', 'instanceof',
  'Math', 'Number', 'String', 'Array', 'Object', 'Boolean', 'Date', 'Map', 'Set',
]);

function lineCol(source: string, index: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < index && i < source.length; i++) {
    if (source[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, column: col };
}

function isBackslashEscape(code: string, quoteIndex: number): boolean {
  let bs = 0;
  let j = quoteIndex - 1;
  while (j >= 0 && code[j] === '\\') {
    bs++;
    j--;
  }
  return bs % 2 === 1;
}

interface ParseSpans {
  codeMask: string;
  miniSpans: Array<{ start: number; end: number; content: string }>;
  issues: ValidationIssue[];
}

function parseSpans(code: string): ParseSpans {
  const mask = code.split('');
  const miniSpans: Array<{ start: number; end: number; content: string }> = [];
  const issues: ValidationIssue[] = [];

  const brackets: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: Array<{ char: string; index: number }> = [];

  type Mode =
    | { kind: 'code' }
    | { kind: 'line-comment' }
    | { kind: 'block-comment'; start: number }
    | { kind: 'string'; quote: '"' | "'" | '`'; start: number; mini: boolean };

  let mode: Mode = { kind: 'code' };
  let templateDepth = 0;
  const templateStack: Array<{ start: number; mini: boolean }> = [];

  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    const next = code[i + 1] ?? '';

    if (mode.kind === 'line-comment') {
      mask[i] = ' ';
      if (c === '\n') mode = { kind: 'code' };
      continue;
    }

    if (mode.kind === 'block-comment') {
      mask[i] = c === '\n' ? '\n' : ' ';
      if (c === '*' && next === '/') {
        mask[i + 1] = ' ';
        i++;
        mode = { kind: 'code' };
      }
      continue;
    }

    if (mode.kind === 'string') {
      if (c === '\\' && mode.quote !== '`') {
        mask[i] = ' ';
        if (next && next !== '\n') {
          mask[i + 1] = ' ';
          i++;
        }
        continue;
      }
      if (mode.quote === '`' && c === '$' && next === '{') {
        mask[i] = ' ';
        mask[i + 1] = ' ';
        templateStack.push({ start: mode.start, mini: false });
        templateDepth++;
        mode = { kind: 'code' };
        i++;
        continue;
      }
      if (c === mode.quote && !isBackslashEscape(code, i)) {
        if (mode.mini) {
          miniSpans.push({
            start: mode.start,
            end: i,
            content: code.slice(mode.start + 1, i),
          });
        }
        mask[i] = ' ';
        mode = { kind: 'code' };
        continue;
      }
      mask[i] = c === '\n' ? '\n' : ' ';
      continue;
    }

    if (c === '/' && next === '/') {
      mask[i] = ' ';
      mode = { kind: 'line-comment' };
      continue;
    }
    if (c === '/' && next === '*') {
      mask[i] = ' ';
      mask[i + 1] = ' ';
      mode = { kind: 'block-comment', start: i };
      i++;
      continue;
    }

    if (c === '"' || c === "'" || c === '`') {
      mask[i] = ' ';
      mode = {
        kind: 'string',
        quote: c,
        start: i,
        mini: c === '"' || c === '`',
      };
      continue;
    }

    if (c === '}' && templateDepth > 0 && stack.length === 0) {
      const saved = templateStack.pop()!;
      templateDepth--;
      mask[i] = ' ';
      mode = {
        kind: 'string',
        quote: '`',
        start: saved.start,
        mini: saved.mini,
      };
      continue;
    }

    if (c === '(' || c === '[' || c === '{') {
      stack.push({ char: c, index: i });
    } else if (c === ')' || c === ']' || c === '}') {
      const top = stack.pop();
      if (!top || top.char !== brackets[c]) {
        const loc = lineCol(code, i);
        issues.push({
          severity: 'error',
          line: loc.line,
          column: loc.column,
          message: `Unmatched closing ${c}`,
        });
      }
    }
  }

  if (stack.length > 0) {
    for (const unclosed of stack) {
      const loc = lineCol(code, unclosed.index);
      issues.push({
        severity: 'error',
        line: loc.line,
        column: loc.column,
        message: `Unclosed ${unclosed.char}`,
      });
    }
  }
  if (mode.kind === 'string') {
    issues.push({ severity: 'error', message: `Unterminated string literal (${mode.quote})` });
  }
  if (mode.kind === 'block-comment') {
    issues.push({ severity: 'error', message: 'Unterminated block comment' });
  }

  return { codeMask: mask.join(''), miniSpans, issues };
}

export function validatePattern(code: string): ValidationResult {
  const { codeMask, miniSpans, issues } = parseSpans(code);

  const identRegex = /(?:^|[^\w.$])([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const dotCallRegex = /\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;

  const checkIdent = (ident: string, index: number, isMethod: boolean) => {
    if (KNOWN_IDENTIFIERS.has(ident)) return;
    if (JS_KEYWORDS.has(ident)) return;
    if (/^[A-Z]/.test(ident)) return;
    const loc = lineCol(code, index);
    issues.push({
      severity: 'warning',
      line: loc.line,
      column: loc.column,
      message: `${isMethod ? 'Method' : 'Function'} "${ident}" is not a known Strudel identifier`,
      hint: 'Check strudel_docs for a list of valid functions/effects, or verify the spelling.',
    });
  };

  let m;
  while ((m = identRegex.exec(codeMask)) !== null) {
    checkIdent(m[1], m.index + m[0].indexOf(m[1]), false);
  }
  while ((m = dotCallRegex.exec(codeMask)) !== null) {
    checkIdent(m[1], m.index + 1, true);
  }

  for (const span of miniSpans) {
    const content = span.content;
    const startLoc = lineCol(code, span.start);
    let depth = 0;
    let angleDepth = 0;
    let unbalanced = false;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      else if (ch === '<') angleDepth++;
      else if (ch === '>') angleDepth--;
      if (depth < 0 || angleDepth < 0) {
        issues.push({
          severity: 'error',
          line: startLoc.line,
          column: startLoc.column,
          message: `Mini-notation: unbalanced ${depth < 0 ? '[]' : '<>'} inside "${content}"`,
        });
        unbalanced = true;
        break;
      }
    }
    if (!unbalanced && depth !== 0) {
      issues.push({
        severity: 'error',
        line: startLoc.line,
        column: startLoc.column,
        message: `Mini-notation: unclosed [ ] inside "${content}"`,
      });
    }
    if (!unbalanced && angleDepth !== 0) {
      issues.push({
        severity: 'error',
        line: startLoc.line,
        column: startLoc.column,
        message: `Mini-notation: unclosed < > inside "${content}"`,
      });
    }

    const tokens = content
      .replace(/[\[\]<>(),|~*/!@?]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => t.replace(/:\d+$/, '').replace(/\..*$/, ''));
    for (const tok of tokens) {
      if (/^-?\d+(\.\d+)?$/.test(tok)) continue;
      if (/^[a-g](#|b)?\d*$/i.test(tok)) continue;
      const low = tok.toLowerCase();
      if (SOUND_NAMES.has(low)) continue;
      if (low.startsWith('gm_')) continue;
      if (low.length <= 1) continue;
      if (/^[ivxIVX]+$/.test(tok)) continue;
      if (/^[A-G](#|b)?(m|maj|min|dim|aug|sus|add|M)?\d*(b\d+|#\d+)?$/.test(tok)) continue;
      if (/^[a-gA-G](#|b)?\d*:[a-zA-Z_]+(:[a-zA-Z_]+)?$/.test(tok)) continue;
      issues.push({
        severity: 'info',
        line: startLoc.line,
        column: startLoc.column,
        message: `Mini-notation token "${tok}" is not a recognized built-in sound or note — may be a custom sample.`,
      });
    }
  }

  const miniStrings = miniSpans.map((s) => s.content);
  const hasError = issues.some((i) => i.severity === 'error');
  return { ok: !hasError, issues, miniStrings };
}
