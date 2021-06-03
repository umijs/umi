import { addHtmlSuffix } from './exportStatic';

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
