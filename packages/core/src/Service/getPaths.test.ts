import { join } from 'path';
import getPaths from './getPaths';

const fixtures = join(__dirname, 'fixtures');

function stripCwd(obj: object, cwd: string) {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = obj[key].replace(cwd, '.');
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
  ).toMatchSnapshot();
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
  ).toMatchSnapshot();
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
  ).toMatchSnapshot();
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
  ).toMatchSnapshot();
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
  ).toMatchSnapshot();
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
  ).toMatchSnapshot();
});
