import express from '@umijs/bundler-utils/compiled/express';
import { once } from 'events';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { tmpdir } from 'os';
import { join } from 'path';
import webpack from 'webpack';
import { MFSU } from './mfsu';

describe('MFSU asset middleware', () => {
  let output: string;
  let server: Server;
  let origin: string;

  beforeAll(async () => {
    output = mkdtempSync(join(tmpdir(), 'umi-mfsu-assets-'));
    const mfsu = new MFSU({
      implementor: webpack,
      tmpBase: output,
      depBuildConfig: null,
      startBuildWorker: jest.fn(),
    });
    mfsu.publicPath = '/assets/';
    const app = express();
    app.use(...mfsu.getMiddlewares());
    app.use((req, res) => res.status(404).send(req.url));
    server = createServer(app).listen(0, '127.0.0.1');
    await once(server, 'listening');
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    rmSync(output, { recursive: true, force: true });
  });

  test.each<[string, string | null]>([
    ['mf-dep_example.js', 'max-age=31536000,immutable'],
    ['mf-va_remoteEntry.js', null],
  ])('serves %s under the public path', async (name, cacheControl) => {
    writeFileSync(join(output, name), 'example');
    const response = await fetch(`${origin}/assets/${name}?v=1`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/javascript/);
    expect(response.headers.get('cache-control')).toBe(cacheControl);
    expect(await response.text()).toBe('example');
  });

  test('serves a range from a named chunk at the root', async () => {
    writeFileSync(join(output, 'example.js'), 'example');
    const response = await fetch(`${origin}/example.js`, {
      headers: { Range: 'bytes=0-2' },
    });
    expect(response.status).toBe(206);
    expect(await response.text()).toBe('exa');
  });

  test('redirects a directory and serves its index', async () => {
    mkdirSync(join(output, 'docs'));
    writeFileSync(join(output, 'docs/index.html'), 'Directory index');
    const redirect = await fetch(`${origin}/docs?v=1`, { redirect: 'manual' });
    expect(redirect.status).toBe(301);
    expect(redirect.headers.get('location')).toBe('/docs/?v=1');

    const index = await fetch(`${origin}/docs/?v=1`);
    expect(index.status).toBe(200);
    expect(await index.text()).toBe('Directory index');
  });

  test('passes an unknown path and its query to the next middleware', async () => {
    const response = await fetch(`${origin}/missing.js?v=1`);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('/missing.js?v=1');
  });
});
