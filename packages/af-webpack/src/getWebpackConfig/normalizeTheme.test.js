import { join } from 'path';
import normalizeTheme from './normalizeTheme';

test('empty', () => {
  expect(normalizeTheme()).toEqual({});
});

test('object', () => {
  expect(
    normalizeTheme({
      a: 'b',
    }),
  ).toEqual({
    a: 'b',
  });
});

const fixtures = join(__dirname, 'fixtures/normalizeTheme');

test('string with json', () => {
  expect(
    normalizeTheme('theme.json', {
      cwd: join(fixtures, 'json'),
    }),
  ).toEqual({
    a: 'b',
  });
});

test('string with json (absolute)', () => {
  expect(normalizeTheme(join(fixtures, 'json', 'theme.json'))).toEqual({
    a: 'b',
  });
});

test('string with function', () => {
  expect(
    normalizeTheme('theme.js', {
      cwd: join(fixtures, 'function'),
    }),
  ).toEqual({
    a: 'b',
  });
});

test('string but file not exists', () => {
  expect(() => {
    normalizeTheme('theme.jsxxxx', {
      cwd: join(fixtures, 'function'),
    });
  }).toThrow(/theme file don't exists/);
});
