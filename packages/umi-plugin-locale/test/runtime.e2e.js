/* eslint-disable global-require */
import { join } from 'path';
import { fork } from 'child_process';
import puppeteer from 'puppeteer';
import http from 'http';
import { existsSync } from 'fs';

const port = 12400;
let server = {};
let browser;
let page;
const fixtures = join(__dirname, '../examples/base');
beforeAll(async () => {
  await buildAndServe();
  browser = await puppeteer.launch();
});

beforeEach(async () => {
  page = await browser.newPage();
});

it('locale-runtime', async () => {
  // eslint-disable-next-line import/no-dynamic-require
  await require(join(fixtures, 'test')).default({
    page,
    host: `http://localhost:${port}`,
  });
});

afterAll(() => {
  server.close();
  browser.close();
});

async function build(cwd) {
  return new Promise((resolve, reject) => {
    const umiPath = join(__dirname, '../../umi/bin/umi.js');
    console.log(umiPath);

    const env = {
      COMPRESS: 'none',
      PROGRESS: 'none',
    };
    const child = fork(umiPath, ['build'], {
      cwd,
      env,
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

async function buildAndServe() {
  const targetDist = join(fixtures, 'dist');
  if (!existsSync(targetDist)) {
    await build(fixtures);
  }
  return new Promise(resolve => {
    server = http.createServer((request, response) => {
      return require('serve-static')(targetDist)(request, response);
    });
    server.listen(port, () => {
      console.log(`Running at http://localhost:${port}`);
      resolve();
    });
  });
}
