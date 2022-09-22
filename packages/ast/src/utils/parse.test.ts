import { parse } from './parse';

test('ts without jsx', () => {
  expect(() => {
    parse(`var a = <string>"a";`, {
      excludePlugins: ['jsx'],
    });
  }).not.toThrow();
});
