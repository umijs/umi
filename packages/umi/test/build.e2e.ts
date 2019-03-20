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
  await page.goto(`http://localhost:${servers['simple'].port}/`, {
    waitUntil: 'networkidle2',
  });
  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Index Page');
});

it('runtime-public-path', async () => {
  await page.goto(`http://localhost:${servers['runtime-public-path'].port}/`, {
    waitUntil: 'networkidle2',
  });
  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Index Page');
  const publicPath = await page.evaluate(() => window.publicPath);
  expect(publicPath).toEqual('/');
});

xit('tree-shaking-with-cjs', async () => {
  await page.goto(
    `http://localhost:${servers['tree-shaking-with-cjs'].port}/`,
    {
      waitUntil: 'networkidle2',
    },
  );
  const title = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(title).toEqual('Index Page foo');
});

it('export-static', async () => {
  await page.goto(`http://localhost:${servers['export-static'].port}/`, {
    waitUntil: 'networkidle2',
  });
  const t1 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t1).toEqual('Index Page');

  await page.evaluate(() => document.querySelector('button').click());
  const t2 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t2).toEqual('List Page');

  await page.evaluate(() => document.querySelector('button').click());
  const t3 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t3).toEqual('Index Page');

  await page.goto(`http://localhost:${servers['export-static'].port}/list/`, {
    waitUntil: 'networkidle2',
  });
  const t4 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t4).toEqual('List Page');
});

it('export-static-htmlSuffix', async () => {
  await page.goto(
    `http://localhost:${servers['export-static-htmlSuffix'].port}/`,
    {
      waitUntil: 'networkidle2',
    },
  );
  const t1 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t1).toEqual('Index Page');

  await page.evaluate(() => document.querySelector('button').click());
  const t2 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t2).toEqual('List Page');

  await page.evaluate(() => document.querySelector('button').click());
  const t3 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t3).toEqual('Index Page');

  await page.goto(
    `http://localhost:${servers['export-static-htmlSuffix'].port}/list.html`,
    {
      waitUntil: 'networkidle2',
    },
  );
  const t4 = await page.evaluate(() => document.querySelector('h1').innerHTML);
  expect(t4).toEqual('List Page');
});

afterAll(() => {
  Object.keys(servers).forEach(name => {
    servers[name].server.close();
  });
  browser.close();
});
