import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import Service from '../../../Service';

process.env.UMI_TEST = '1';

let s;
const cwd = join(__dirname, 'fixtures', 'index');

beforeAll(() => {
  s = new Service({
    cwd,
  });
  s.init();
});

test('list', async () => {
  const list = await s.runCommand('config', {
    _: ['list'],
  });
  expect(list).toEqual({
    publicPath: '/foo/',
    hash: false,
    mountElementId: 'root',
  });
});

test('get', async () => {
  const get = await s.runCommand('config', {
    _: ['get', 'publicPath'],
  });
  expect(get).toEqual('/foo/');
});

test('get undefined', async () => {
  const get = await s.runCommand('config', {
    _: ['get', 'publicPathX'],
  });
  expect(get).toEqual(undefined);
});

test('set', async () => {
  const file = join(cwd, '.umirc.js');
  const originContent = readFileSync(file, 'utf-8');
  await s.runCommand('config', {
    _: ['set', 'publicPath', '/bar/'],
  });
  expect(readFileSync(file, 'utf-8').trim()).toEqual(
    `
export default {
  publicPath: '/bar/',
  hash: false,
};
  `.trim(),
  );
  writeFileSync(file, originContent, 'utf-8');
});

test('unsupport sub command', () => {
  expect(() => {
    s.runCommand('config', {
      _: ['xxx'],
    });
  }).toThrow(/unsupported action xxx for umi config/);
});
