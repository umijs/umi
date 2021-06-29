import { matchAll } from './utils';

test('match all', () => {
  let regexp = /\w+/g;
  let string = 'a vvvv ccc ddd';
  expect(matchAll(regexp, string)).toEqual([...string.matchAll(regexp)]);
});
