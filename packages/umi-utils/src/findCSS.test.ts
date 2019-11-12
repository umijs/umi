import { relative, join } from 'path';
import findCSS from './findCSS';

const fixture = join(__dirname, './fixtures/findCSS');

test('css', () => {
  expect(relative(fixture, findCSS(fixture, 'a'))).toEqual('a.css');
});

test('less', () => {
  expect(relative(fixture, findCSS(fixture, 'b'))).toEqual('b.less');
});

test('sass', () => {
  expect(relative(fixture, findCSS(fixture, 'c'))).toEqual('c.sass');
});

test('scss', () => {
  expect(relative(fixture, findCSS(fixture, 'd'))).toEqual('d.scss');
});

test('not found', () => {
  expect(findCSS(fixture, 'e')).toEqual(null);
});
