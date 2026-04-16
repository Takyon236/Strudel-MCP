import { describe, test, expect, beforeAll } from 'bun:test';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { existsSync } from 'node:fs';

const PROJECT_ROOT = path.resolve(import.meta.dir, '..');
const SERVER_ENTRY = path.join(PROJECT_ROOT, 'dist', 'index.js');

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: number;
  method: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: any;
  error?: { code: number; message: string };
}

async function callServer(requests: JsonRpcRequest[]): Promise<JsonRpcResponse[]> {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [SERVER_ENTRY], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`timeout\nstdout:${stdout}\nstderr:${stderr}`));
    }, 10_000);
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    child.on('close', () => {
      clearTimeout(timeout);
      const responses: JsonRpcResponse[] = [];
      for (const line of stdout.split('\n').filter(Boolean)) {
        try {
          responses.push(JSON.parse(line));
        } catch {
          // skip non-JSON log lines
        }
      }
      resolve(responses);
    });
    for (const req of requests) {
      child.stdin.write(JSON.stringify(req) + '\n');
    }
    child.stdin.end();
  });
}

const INIT: JsonRpcRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '0.0.1' },
  },
};
const INITIALIZED: JsonRpcRequest = {
  jsonrpc: '2.0',
  method: 'notifications/initialized',
};

describe('integration — MCP stdio transport', () => {
  beforeAll(() => {
    if (!existsSync(SERVER_ENTRY)) {
      throw new Error(
        `Build output missing at ${SERVER_ENTRY} — run 'bun run build' before integration tests.`,
      );
    }
  });

  test('initialize handshake returns server info', async () => {
    const responses = await callServer([INIT, INITIALIZED]);
    const init = responses.find((r) => r.id === 1);
    expect(init).toBeDefined();
    expect(init?.result?.serverInfo?.name).toBe('strudel-mcp');
    expect(init?.result?.capabilities?.tools).toBeDefined();
  });

  test('tools/list enumerates all 8 tools', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    ]);
    const list = responses.find((r) => r.id === 2);
    expect(list?.result?.tools).toBeDefined();
    const names = list!.result!.tools.map((t: any) => t.name).sort();
    expect(names).toEqual([
      'strudel_analyze',
      'strudel_compose',
      'strudel_docs',
      'strudel_examples',
      'strudel_library',
      'strudel_run',
      'strudel_sample',
      'strudel_sounds',
      'strudel_theory',
      'strudel_validate',
    ]);
  });

  test('tools/list includes inputSchema for each tool', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    ]);
    const tools = responses.find((r) => r.id === 2)!.result!.tools;
    for (const t of tools) {
      expect(t.inputSchema).toBeDefined();
      expect(t.inputSchema.type).toBe('object');
      expect(t.description).toBeTruthy();
    }
  });

  test('tools/call strudel_docs returns content array', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'strudel_docs', arguments: { topic: 'lpf' } },
      },
    ]);
    const call = responses.find((r) => r.id === 2);
    expect(call?.result?.content?.[0]?.type).toBe('text');
    expect(call?.result?.content?.[0]?.text).toContain('lpf');
  });

  test('tools/call strudel_compose returns runnable code', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'strudel_compose',
          arguments: { style: 'house', tempo_bpm: 124 },
        },
      },
    ]);
    const text = responses.find((r) => r.id === 2)?.result?.content?.[0]?.text;
    expect(text).toContain('setcpm(124/4)');
    expect(text).toContain('stack(');
  });

  test('tools/call strudel_run returns URL or HTML file', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'strudel_run',
          arguments: { code: 'sound("bd*4")' },
        },
      },
    ]);
    const text = responses.find((r) => r.id === 2)?.result?.content?.[0]?.text;
    expect(text).toContain('Strategy:');
    expect(text).toMatch(/URL|HTML file/);
  });

  test('tools/call strudel_validate reports errors', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'strudel_validate',
          arguments: { code: 'sound("bd' },
        },
      },
    ]);
    const text = responses.find((r) => r.id === 2)?.result?.content?.[0]?.text;
    expect(text?.toLowerCase()).toContain('error');
  });

  test('tools/call with unknown tool name returns error', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'does_not_exist', arguments: {} },
      },
    ]);
    const r = responses.find((r) => r.id === 2);
    // The server should respond with an error OR a result indicating failure
    expect(r).toBeDefined();
    expect(r?.error || r?.result?.isError).toBeTruthy();
  });

  test('multiple sequential tools/call in one session', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'strudel_docs', arguments: { topic: 'lpf' } },
      },
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'strudel_theory',
          arguments: { action: 'list-scales' },
        },
      },
      {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'strudel_sounds', arguments: { category: 'banks' } },
      },
    ]);
    expect(responses.find((r) => r.id === 2)?.result?.content).toBeDefined();
    expect(responses.find((r) => r.id === 3)?.result?.content).toBeDefined();
    expect(responses.find((r) => r.id === 4)?.result?.content).toBeDefined();
  });

  test('tools/call with invalid arguments returns schema error', async () => {
    const responses = await callServer([
      INIT,
      INITIALIZED,
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'strudel_compose',
          arguments: { style: 'not-a-real-style' },
        },
      },
    ]);
    const r = responses.find((r) => r.id === 2);
    // Should surface as an error from zod validation
    expect(r?.error || r?.result?.isError).toBeTruthy();
  });
});
