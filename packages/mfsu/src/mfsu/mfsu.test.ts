import { resolvePublicPath } from './mfsu';

test('resolvePublicPath if no output', () => {
  expect(resolvePublicPath({})).toStrictEqual('/');
});

test('resolvePublicPath if no publicPath', () => {
  expect(
    resolvePublicPath({
      output: {},
    }),
  ).toStrictEqual('/');
});

test('resolvePublicPath has publicPath', () => {
  expect(
    resolvePublicPath({
      output: {
        publicPath: 'custom',
      },
    }),
  ).toStrictEqual('custom');
});
