import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import runGenerator, { type IDefaultData } from './index';

const fixtures = join(__dirname, '..', 'fixtures');

let oldCwd = process.cwd();

beforeEach(() => {
  oldCwd = process.cwd();
});

afterEach(() => {
  process.chdir(oldCwd);
});

test('generate app', async () => {
  const cwd = join(fixtures, 'app');
  await runGenerator({
    cwd,
    args: {
      _: [],
      $0: '',
      default: true,
      git: false,
    },
  });
  expect(existsSync(join(cwd, 'src', 'pages', 'index.tsx'))).toEqual(true);
  rimraf.sync(cwd);
});

test('generate plugin', async () => {
  const cwd = join(fixtures, 'plugin');
  await runGenerator({
    cwd,
    args: {
      _: [],
      $0: '',
      default: true,
      git: false,
    },
    defaultData: {
      pluginName: 'plugin-test',
      appTemplate: 'plugin',
    } as IDefaultData,
  });
  expect(require(join(cwd, 'package.json')).name).toEqual('plugin-test');
  expect(existsSync(join(cwd, 'src', 'index.ts'))).toEqual(true);
  rimraf.sync(cwd);
});

test('generate max', async () => {
  const cwd = join(fixtures, 'max');
  await runGenerator({
    cwd,
    args: {
      _: [],
      $0: '',
      default: true,
      git: false,
    },
    defaultData: {
      appTemplate: 'max',
    } as IDefaultData,
  });
  expect(existsSync(join(cwd, 'src/pages/Home/index.tsx'))).toEqual(true);
  rimraf.sync(cwd);
});
