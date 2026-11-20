import { portfinder } from '@umijs/utils';
import { once } from 'events';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import http from 'http';
import { tmpdir } from 'os';
import { join } from 'path';
import type { IApi } from '../types';
import preview from './preview';

let cwd: string;
let server: http.Server | undefined;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), 'umi-preview-'));
  mkdirSync(join(cwd, 'dist'));
  mkdirSync(join(cwd, 'mock'));
  writeFileSync(join(cwd, 'dist', 'status.json'), '{"source":"static"}');
  writeFileSync(
    join(cwd, 'mock', 'status.js'),
    `require('fs').writeFileSync(require('path').join(__dirname, 'loaded'), '');
module.exports = { 'GET /status.json': { source: 'mock' } };`,
  );
});

afterEach(async () => {
  try {
    if (server?.listening) {
      const closed = once(server, 'close');
      server.close();
      await closed;
    }
  } finally {
    server = undefined;
    jest.restoreAllMocks();
    rmSync(cwd, { recursive: true, force: true });
  }
});

test.each([
  { mock: false, source: 'static' },
  { mock: undefined, source: 'mock' },
  { mock: {}, source: 'mock' },
])('serves $source with mock set to $mock', async ({ mock, source }) => {
  jest.spyOn(portfinder, 'getPortPromise').mockResolvedValue(0);
  const createServer = jest.spyOn(http, 'createServer');
  const registerCommand = jest.fn();
  preview({
    args: {},
    config: { base: '/', mock },
    cwd,
    paths: { absOutputPath: join(cwd, 'dist') },
    registerCommand,
    userConfig: {},
  } as unknown as IApi);

  await registerCommand.mock.calls[0][0].fn();
  const previewServer = createServer.mock.results[0].value as http.Server;
  server = previewServer;
  if (!previewServer.listening) await once(previewServer, 'listening');
  const address = previewServer.address();
  if (!address || typeof address === 'string') throw new Error('Missing port');

  const response = await fetch(`http://127.0.0.1:${address.port}/status.json`);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ source });
  expect(existsSync(join(cwd, 'mock', 'loaded'))).toBe(source === 'mock');
});
