import { relative, join } from 'path';
import findJS from './findJS';

const fixture = join(__dirname, './fixtures/findJS');

test('js', () => {
  expect(relative(fixture, findJS(fixture, 'a'))).toEqual('a.js');
});

test('jsx', () => {
  expect(relative(fixture, findJS(fixture, 'b'))).toEqual('b.jsx');
});

test('ts', () => {
  expect(relative(fixture, findJS(fixture, 'c'))).toEqual('c.ts');
});

test('tsx', () => {
  expect(relative(fixture, findJS(fixture, 'd'))).toEqual('d.tsx');
});

test('withoutname', () => {
  expect(relative(fixture, findJS(`${fixture}/d`))).toEqual('d.tsx');
});

test('not found', () => {
  expect(findJS(fixture, 'e')).toEqual(null);
});
