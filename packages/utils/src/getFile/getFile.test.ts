import { join } from 'path';
import getFile from './getFile';

const base = join(__dirname, 'fixtures', 'normal');

test('javascript', () => {
  const { path, filename } = getFile({
    base,
    type: 'javascript',
    fileNameWithoutExt: 'a',
  })!;
  expect(path.endsWith('fixtures/normal/a.js')).toBeTruthy();
  expect(filename).toEqual('a.js');
});

test('javascript fallback', () => {
  const { path, filename } = getFile({
    base,
    type: 'javascript',
    fileNameWithoutExt: 'b',
  })!;
  expect(path.endsWith('fixtures/normal/b.ts')).toBeTruthy();
  expect(filename).toEqual('b.ts');
});

test('css', () => {
  const { path, filename } = getFile({
    base,
    type: 'css',
    fileNameWithoutExt: 'd',
  })!;
  expect(path.endsWith('fixtures/normal/d.css')).toBeTruthy();
  expect(filename).toEqual('d.css');
});

test('css fallback', () => {
  const { path, filename } = getFile({
    base,
    type: 'css',
    fileNameWithoutExt: 'c',
  })!;
  expect(path.endsWith('fixtures/normal/c.less')).toBeTruthy();
  expect(filename).toEqual('c.less');
});

test('null', () => {
  const result = getFile({
    base,
    type: 'javascript',
    fileNameWithoutExt: 'e',
  });
  expect(result).toEqual(null);
});
