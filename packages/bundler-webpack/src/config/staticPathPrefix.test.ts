import {
  DEFAULT_STATIC_PATH_PREFIX,
  resolveStaticPathPrefix,
} from './staticPathPrefix';

test('defaults to static/', () => {
  expect(resolveStaticPathPrefix({})).toBe(DEFAULT_STATIC_PATH_PREFIX);
  expect(resolveStaticPathPrefix({ userConfig: {} })).toBe(
    DEFAULT_STATIC_PATH_PREFIX,
  );
});

test('uses userConfig.staticPathPrefix', () => {
  expect(
    resolveStaticPathPrefix({
      userConfig: { staticPathPrefix: '' },
    }),
  ).toBe('');
  expect(
    resolveStaticPathPrefix({
      userConfig: { staticPathPrefix: 'assets/' },
    }),
  ).toBe('assets/');
});

test('opts.staticPathPrefix overrides userConfig', () => {
  expect(
    resolveStaticPathPrefix({
      staticPathPrefix: 'mf-dep/',
      userConfig: { staticPathPrefix: '' },
    }),
  ).toBe('mf-dep/');
});
