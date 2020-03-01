import { defineConfig } from './defineConfig';

test('normal', () => {
  expect(defineConfig({ foo: 1 })).toEqual({ foo: 1 });
});
