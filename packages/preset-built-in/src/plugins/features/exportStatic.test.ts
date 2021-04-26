import { addHtmlSuffix, fixRoutePathInWindows } from './exportStatic';

test('exportStatic for :id', async () => {
  expect(fixRoutePathInWindows('/:id')).toBe('/.id');
});

test('exportStatic for /id', async () => {
  expect(fixRoutePathInWindows('/id')).toBe('/id');
});

test('addHtmlSuffix for /', async () => {
  expect(addHtmlSuffix('/', true)).toBe('/');
  expect(addHtmlSuffix('/', false)).toBe('/');
});

test('addHtmlSuffix for /home', async () => {
  expect(addHtmlSuffix('/home', true)).toBe('/home(.html)?');
  expect(addHtmlSuffix('/home', false)).toBe('/home.html');
});

test('addHtmlSuffix for /home/', async () => {
  expect(addHtmlSuffix('/home/', true)).toBe('/home/');
  expect(addHtmlSuffix('/home/', false)).toBe('/home.html');
});
