import { join } from 'path';
import { writeFileSync } from 'fs';
import express from 'express';
import portfinder from 'portfinder';
import got from 'got';
import rimraf from 'rimraf';
import createMiddleware from './createMiddleware';

let port;
let server;
const cwd = join(__dirname, 'fixtures/createMiddleware');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let watchError = null;

const HOME_PAGE = 'homepage';
let watcher = null;

beforeAll(async () => {
  portfinder.basePort = 3000;
  portfinder.highestPort = 8000;
  port = await portfinder.getPortPromise();
  const ret = createMiddleware({
    cwd,
    config: {},
    absPagesPath: join(cwd, 'pages'),
    absSrcPath: cwd,
    watch: true,
    onError(e) {
      watchError = e;
    },
  });
  watcher = ret.watcher;
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(ret.middleware);
    app.use((req, res, next) => {
      if (req.path === '/') {
        res.end(HOME_PAGE);
      } else {
        next();
      }
    });
    server = app.listen(port, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
});

afterAll(() => {
  if (watcher) watcher.close();
});

test('get', async () => {
  const { body } = await got(`http://localhost:${port}/api/a`);
  expect(body).toEqual(`{"a":1}`);
});

test('post', async () => {
  const { body } = await got(`http://localhost:${port}/api/a`, {
    method: 'post',
  });
  expect(body).toEqual(`{"a":1}`);
});

test('function handler', async () => {
  const { body } = await got(`http://localhost:${port}/api/b`);
  expect(body).toEqual(`{"b":1}`);
});

test('fallback to next', async () => {
  const { body } = await got(`http://localhost:${port}/`);
  expect(body).toEqual(HOME_PAGE);
});

test('params', async () => {
  const { body } = await got(`http://localhost:${port}/api/users/1`);
  expect(body).toEqual(`{"a":1}`);
});

test('watch', async () => {
  const absTmpFile = join(cwd, 'mock/tmp.js');
  writeFileSync(absTmpFile, `export default {'/api/tmp': {tmp:1}}`, 'utf-8');
  await delay(500);
  const { body } = await got(`http://localhost:${port}/api/tmp`);
  expect(body).toEqual(`{"tmp":1}`);
  rimraf.sync(absTmpFile);
});

xtest('watch with error', async () => {
  const absTmpFile = join(cwd, 'mock/tmp2.js');
  writeFileSync(absTmpFile, `export defaul;`, 'utf-8');
  await delay(500);
  expect(watchError === null).toEqual(false);
  rimraf.sync(absTmpFile);
});

afterAll(() => {
  if (server) server.close();
});
