import { join } from 'path';
import { fork } from 'child_process';
import puppeteer from 'puppeteer';
import http from 'http';
import { existsSync } from 'fs';

interface IServer {
  [key: string]: {
    port: number;
    server?: any;
  };
}

let port = 12400;
const servers = {} as IServer;
let browser: any;
let page: any;
const fixtures = join(__dirname, 'fixtures/build');

async function build(cwd: string) {
  return new Promise((resolve, reject) => {
    const umiPath = join(__dirname, '../bin/umi.js');
    const child = fork(umiPath, ['build'], {
      cwd,
      env: {
        COMPRESS: 'none',
        PROGRESS: 'none',
      },
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Build failed'));
      } else {
        resolve();
      }
    });
  });
}

async function buildAndServe(name: string) {
  const cwd = join(fixtures, name);
  const targetDist = join(cwd, 'dist');
  if (!existsSync(targetDist)) {
    await build(cwd);
  }
  return new Promise(resolve => {
    port += 1;
    servers[name] = { port };
    servers[name].server = http.createServer((request, response) => {
      return require('serve-static')(targetDist)(request, response);
    });
    servers[name].server.listen(port, () => {
      console.log(`[${name}] Running at http://localhost:${port}`);
      resolve();
    });
  });
}

beforeAll(async () => {
  await buildAndServe('simple');
  await buildAndServe('runtime-public-path');
  await buildAndServe('tree-shaking-with-cjs');
  await buildAndServe('export-static');
  await buildAndServe('export-static-htmlSuffix');
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
});

beforeEach(async () => {
  page = await browser.newPage();
});

it('simple', async () => {
  await require(join(fixtures, 'simple/test')).default({
    page,
    host: `http://localhost:${servers['simple'].port}`,
  });
});

it('runtime-public-path', async () => {
  await require(join(fixtures, 'runtime-public-path/test')).default({
    page,
    host: `http://localhost:${servers['runtime-public-path'].port}`,
  });
});

it('tree-shaking-with-cjs', async () => {
  await require(join(fixtures, 'tree-shaking-with-cjs/test')).default({
    page,
    host: `http://localhost:${servers['tree-shaking-with-cjs'].port}`,
  });
});

it('export-static', async () => {
  await require(join(fixtures, 'export-static/test')).default({
    page,
    host: `http://localhost:${servers['export-static'].port}`,
  });
});

it('export-static-htmlSuffix', async () => {
  await require(join(fixtures, 'export-static-htmlSuffix/test')).default({
    page,
    host: `http://localhost:${servers['export-static-htmlSuffix'].port}`,
  });
});

afterAll(() => {
  Object.keys(servers).forEach(name => {
    servers[name].server.close();
  });
  browser.close();
});
