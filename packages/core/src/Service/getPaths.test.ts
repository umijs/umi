import { join } from 'path';
import getPaths from './getPaths';
import { winPath } from '@umijs/utils';

const fixtures = join(__dirname, 'fixtures');

function stripCwd(obj: object, cwd: string) {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = obj[key].replace(winPath(cwd), '.');
    return memo;
  }, {});
}

test('empty', () => {
  const cwd = join(fixtures, 'getPaths-empty');
  expect(
    stripCwd(
      getPaths({
        cwd,
        config: {},
        env: 'development',
      }),
      cwd,
    ),
  ).toEqual({
    absNodeModulesPath: './node_modules',
    absOutputPath: './dist',
    absPagesPath: './pages',
    absSrcPath: '.',
    absTmpPath: './.umi',
    aliasedTmpPath: '@/.umi',
    cwd: '.',
  });
});

test('empty production', () => {
  const cwd = join(fixtures, 'getPaths-empty');
  expect(
    stripCwd(
      getPaths({
        cwd,
        config: {},
        env: 'production',
      }),
      cwd,
    ),
  ).toEqual({
    absNodeModulesPath: './node_modules',
    absOutputPath: './dist',
    absPagesPath: './pages',
    absSrcPath: '.',
    absTmpPath: './.umi-production',
    aliasedTmpPath: '@/.umi-production',
    cwd: '.',
  });
});

test('empty config singular', () => {
  const cwd = join(fixtures, 'getPaths-empty');
  expect(
    stripCwd(
      getPaths({
        cwd,
        config: {
          singular: true,
        },
        env: 'development',
      }),
      cwd,
    ),
  ).toEqual({
    absNodeModulesPath: './node_modules',
    absOutputPath: './dist',
    absPagesPath: './page',
    absSrcPath: '.',
    absTmpPath: './.umi',
    aliasedTmpPath: '@/.umi',
    cwd: '.',
  });
});

test('empty config outputPath', () => {
  const cwd = join(fixtures, 'getPaths-empty');
  expect(
    stripCwd(
      getPaths({
        cwd,
        config: {
          outputPath: './www',
        },
        env: 'development',
      }),
      cwd,
    ),
  ).toEqual({
    absNodeModulesPath: './node_modules',
    absOutputPath: './www',
    absPagesPath: './pages',
    absSrcPath: '.',
    absTmpPath: './.umi',
    aliasedTmpPath: '@/.umi',
    cwd: '.',
  });
});

test('src', () => {
  const cwd = join(fixtures, 'getPaths-with-src');
  expect(
    stripCwd(
      getPaths({
        cwd,
        config: {},
        env: 'development',
      }),
      cwd,
    ),
  ).toEqual({
    absNodeModulesPath: './node_modules',
    absOutputPath: './dist',
    absPagesPath: './src/pages',
    absSrcPath: './src',
    absTmpPath: './src/.umi',
    aliasedTmpPath: '@/.umi',
    cwd: '.',
  });
});

test('src config singular', () => {
  const cwd = join(fixtures, 'getPaths-with-src');
  expect(
    stripCwd(
      getPaths({
        cwd,
        config: {
          singular: true,
        },
        env: 'development',
      }),
      cwd,
    ),
  ).toEqual({
    absNodeModulesPath: './node_modules',
    absOutputPath: './dist',
    absPagesPath: './src/page',
    absSrcPath: './src',
    absTmpPath: './src/.umi',
    aliasedTmpPath: '@/.umi',
    cwd: '.',
  });
});
