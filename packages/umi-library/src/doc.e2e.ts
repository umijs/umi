import { join } from 'path';
import { fork } from 'child_process';
import puppeteer from 'puppeteer';
import http from 'http';
import { existsSync } from 'fs';

let port = 12500;
const servers = {};
let browser;
let page;
const fixtures = join(__dirname, 'fixtures/doc');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

process.env.COMPRESS = 'none';

async function buildDoc(cwd) {
  const umiLibPath = join(__dirname, '../bin/umi-library.js');
  return new Promise((resolve, reject) => {
    const child = fork(umiLibPath, ['doc', 'build'], {
      cwd,
      env: {
        COMPRESS: 'none',
      },
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Doc build failed'));
      } else {
        resolve();
      }
    });
  });
}

async function doc(name) {
  const cwd = join(fixtures, name);
  const targetDist = join(cwd, '.docz/dist');
  if (!existsSync(targetDist)) {
    await buildDoc(cwd);
  }

  return new Promise(resolve => {
    port += 1;
    servers[name] = { port };
    servers[name].server = http.createServer((request, response) => {
      return require('serve-handler')(request, response, {
        public: targetDist,
      });
    });
    servers[name].server.listen(servers[name].port, () => {
      console.log(
        `[${name}] Running at http://localhost:${servers[name].port}`,
      );
      resolve();
    });
  });
}

beforeAll(async () => {
  await doc('normal');
  await doc('css-modules');
  await doc('config-theme');
  await doc('babel-extra-babel-presets-and-plugins');
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
});

beforeEach(async () => {
  page = await browser.newPage();
});

test('normal', async () => {
  await page.goto(`http://localhost:${servers['normal'].port}/`, {
    waitUntil: 'networkidle2',
  });

  // assert /
  const title = await page.evaluate(
    () => document.querySelectorAll('h1')[1].innerHTML,
  );
  expect(title).toEqual('hello');

  // navigate to /button
  await page.evaluate(() => {
    document.querySelectorAll('nav a')[0].click();
  });
  await delay(300);

  // assert /button
  const buttonCls = await page.evaluate(() =>
    document.querySelectorAll('button')[1].getAttribute('class'),
  );
  expect(buttonCls.split(' ').includes('g'));
  expect(buttonCls.split(' ').includes('b'));
  expect(buttonCls.includes('button_button__')).toEqual(true);
  expect(buttonCls.includes('c_p__')).toEqual(true);
});

test('css-modules', async () => {
  await page.goto(`http://localhost:${servers['css-modules'].port}/`, {
    waitUntil: 'networkidle2',
  });
  const buttonCls = await page.evaluate(() =>
    document.querySelectorAll('button')[1].getAttribute('class'),
  );
  expect(buttonCls.startsWith('index_g__')).toEqual(true);
});

test('config-theme', async () => {
  await page.goto(`http://localhost:${servers['config-theme'].port}/`, {
    waitUntil: 'networkidle2',
  });
  const favicon = await page.evaluate(
    () => document.querySelectorAll('link')[0].href,
  );
  expect(favicon).toEqual(
    'https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/rmsportal/EPkOqxgKmFIsEuPcFBOy.png',
  );
});

test('babel-extra-babel-presets-and-plugins', async () => {
  await page.goto(
    `http://localhost:${
      servers['babel-extra-babel-presets-and-plugins'].port
    }/`,
    {
      waitUntil: 'networkidle2',
    },
  );
  const title = await page.evaluate(
    () => document.querySelector('.foo').innerHTML,
  );
  expect(title).toEqual('p1|p2|p1|p2|haha');
});

afterAll(() => {
  Object.keys(servers).forEach(name => {
    servers[name].server.close();
  });
  browser.close();
});
