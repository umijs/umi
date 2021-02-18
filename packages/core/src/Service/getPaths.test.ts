import { lodash, winPath } from '@umijs/utils';
import { join, relative } from 'path';
import getPaths from './getPaths';
import { IServicePaths } from './types';

const fixtures = join(__dirname, 'fixtures');

function stripCwd(paths: IServicePaths, cwd: string) {
  return lodash.mapValues(paths, (value) => {
    return value.startsWith('@') ? value : winPath(relative(cwd, value));
  });
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
    absNodeModulesPath: 'node_modules',
    absOutputPath: 'dist',
    absPagesPath: 'pages',
    absSrcPath: '',
    absTmpPath: '.umi',
    cwd: '',
    absPackageJSONPath: 'package.json',
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
    absNodeModulesPath: 'node_modules',
    absOutputPath: 'dist',
    absPagesPath: 'pages',
    absSrcPath: '',
    absTmpPath: '.umi-production',
    cwd: '',
    absPackageJSONPath: 'package.json',
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
    absNodeModulesPath: 'node_modules',
    absOutputPath: 'dist',
    absPagesPath: 'page',
    absSrcPath: '',
    absTmpPath: '.umi',
    cwd: '',
    absPackageJSONPath: 'package.json',
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
    absNodeModulesPath: 'node_modules',
    absOutputPath: 'www',
    absPagesPath: 'pages',
    absSrcPath: '',
    absTmpPath: '.umi',
    cwd: '',
    absPackageJSONPath: 'package.json',
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
    absNodeModulesPath: 'node_modules',
    absOutputPath: 'dist',
    absPagesPath: 'src/pages',
    absSrcPath: 'src',
    absTmpPath: 'src/.umi',
    cwd: '',
    absPackageJSONPath: 'package.json',
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
    absNodeModulesPath: 'node_modules',
    absOutputPath: 'dist',
    absPagesPath: 'src/page',
    absSrcPath: 'src',
    absTmpPath: 'src/.umi',
    cwd: '',
    absPackageJSONPath: 'package.json',
  });
});
